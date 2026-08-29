import { AlertRecord, RecallRecord, ExpiryState, Batch } from '../types';
import { supabase } from './supabaseClient';

export function calculateExpiryStatus(expiryDateStr?: string): {
  status: ExpiryState;
  daysRemaining: number;
  label: string;
} {
  if (!expiryDateStr) {
    return { status: 'NORMAL', daysRemaining: 365, label: 'Standard Shelf-Life' };
  }

  const expiryTime = new Date(expiryDateStr).getTime();
  const now = Date.now();
  const diffDays = Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { status: 'EXPIRED', daysRemaining: 0, label: 'Expired' };
  } else if (diffDays <= 3) {
    return {
      status: 'NEAR_EXPIRY',
      daysRemaining: diffDays,
      label: `Near Expiry (${diffDays} day${diffDays === 1 ? '' : 's'} remaining)`,
    };
  } else {
    return {
      status: 'NORMAL',
      daysRemaining: diffDays,
      label: `${diffDays} days remaining`,
    };
  }
}

class AlertService {
  private listeners: (() => void)[] = [];

  constructor() {
    try {
      supabase
        .channel('public:alerts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
          this.notify();
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime alerts subscription error:', e);
    }
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Alert listener error:', err);
      }
    });
  }

  public async getAlerts(targetRole?: string): Promise<AlertRecord[]> {
    try {
      let query = supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (targetRole && targetRole !== 'ADMIN' && targetRole !== 'AUTHORITY') {
        query = query.or(`target_role.eq.${targetRole},target_role.is.null`);
      }

      const { data, error } = await query;
      if (error || !data) {
        return [];
      }

      return data.map((a: any) => ({
        id: a.id,
        alertCode: a.alert_code,
        userId: a.user_id,
        targetRole: a.target_role,
        batchId: a.batch_id,
        batchCode: a.batch_code,
        type: a.type,
        severity: a.severity,
        title: a.title,
        message: a.message,
        isRead: !!a.is_read,
        createdAt: a.created_at,
      }));
    } catch (err) {
      console.error('Failed to fetch alerts from Supabase:', err);
      return [];
    }
  }

  public async markAlertRead(alertCode: string): Promise<void> {
    try {
      await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('alert_code', alertCode);
      this.notify();
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  }

  public async createAlert(input: {
    targetRole?: string;
    batchCode: string;
    type: 'NEAR_EXPIRY' | 'EXPIRED' | 'HIGH_RISK' | 'CONTAMINATION' | 'RECALL' | 'COMPLIANCE' | 'ANOMALY';
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    title: string;
    message: string;
  }): Promise<AlertRecord | null> {
    try {
      const alertCode = `ALT-${Date.now().toString().slice(-6)}`;
      const { data, error } = await supabase
        .from('alerts')
        .insert({
          alert_code: alertCode,
          target_role: input.targetRole || null,
          batch_code: input.batchCode,
          type: input.type,
          severity: input.severity,
          title: input.title,
          message: input.message,
          is_read: false,
        })
        .select()
        .single();

      if (error || !data) {
        console.error('Failed to insert alert:', error);
        return null;
      }

      this.notify();
      return {
        id: data.id,
        alertCode: data.alert_code,
        targetRole: data.target_role,
        batchId: data.batch_id,
        batchCode: data.batch_code,
        type: data.type,
        severity: data.severity,
        title: data.title,
        message: data.message,
        isRead: data.is_read,
        createdAt: data.created_at,
      };
    } catch (err) {
      console.error('Error in createAlert:', err);
      return null;
    }
  }

  public async getRecalls(): Promise<RecallRecord[]> {
    try {
      const { data, error } = await supabase
        .from('recalls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      return data.map((r: any) => ({
        id: r.id,
        recallCode: r.recall_code,
        batchId: r.batch_id,
        batchCode: r.batch_code,
        reason: r.reason,
        severity: r.severity,
        status: r.status,
        initiatedByName: r.initiated_by_name,
        initiatedByRole: r.initiated_by_role,
        affectedProductName: r.affected_product_name,
        affectedQuantity: r.affected_quantity,
        actionRequired: r.action_required,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } catch (err) {
      console.error('Failed to fetch recalls:', err);
      return [];
    }
  }

  public async createRecall(input: {
    batchCode: string;
    productName: string;
    quantity: string;
    reason: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    initiatedByName: string;
    initiatedByRole: string;
    actionRequired?: string;
  }): Promise<RecallRecord | null> {
    try {
      const recallCode = `REC-${Date.now().toString().slice(-6)}`;
      const timestamp = new Date().toISOString();

      // 1. Insert into recalls table
      const { data, error } = await supabase
        .from('recalls')
        .insert({
          recall_code: recallCode,
          batch_code: input.batchCode,
          reason: input.reason,
          severity: input.severity || 'CRITICAL',
          status: 'ACTIVE',
          initiated_by_name: input.initiatedByName,
          initiated_by_role: input.initiatedByRole,
          affected_product_name: input.productName,
          affected_quantity: input.quantity,
          action_required: input.actionRequired || 'Immediate retail quarantine and disposal enforcement.',
        })
        .select()
        .single();

      if (error || !data) {
        console.error('Failed to insert recall:', error);
        return null;
      }

      // 2. Update batches status and contamination flag
      await supabase
        .from('batches')
        .update({
          status: 'RECALLED',
          contamination_flag: {
            flagged: true,
            severity: input.severity || 'CRITICAL',
            reason: input.reason,
            detectedAt: timestamp,
            actionRequired: input.actionRequired || 'Immediate retail quarantine and recall notice enforced.',
          },
          updated_at: timestamp,
        })
        .eq('batch_code', input.batchCode);

      // 3. Create Critical Alerts for Retailer and Mandi
      await this.createAlert({
        targetRole: 'RETAILER',
        batchCode: input.batchCode,
        type: 'RECALL',
        severity: 'CRITICAL',
        title: `Emergency Recall: ${input.productName}`,
        message: `Batch ${input.batchCode} recalled by ${input.initiatedByName} (${input.initiatedByRole}). Reason: ${input.reason}`,
      });

      await this.createAlert({
        targetRole: 'AUTHORITY',
        batchCode: input.batchCode,
        type: 'RECALL',
        severity: 'CRITICAL',
        title: `Recall Logged: ${input.batchCode}`,
        message: `Official quarantine enforced for ${input.quantity} of ${input.productName}.`,
      });

      // 4. Log Audit Entry
      await supabase.from('audit_logs').insert({
        action: 'BATCH_RECALLED',
        actor_name: input.initiatedByName,
        actor_role: input.initiatedByRole,
        entity_type: 'RECALL',
        entity_id: input.batchCode,
        details: { reason: input.reason, severity: input.severity },
      });

      return {
        id: data.id,
        recallCode: data.recall_code,
        batchId: data.batch_id,
        batchCode: data.batch_code,
        reason: data.reason,
        severity: data.severity,
        status: data.status,
        initiatedByName: data.initiated_by_name,
        initiatedByRole: data.initiated_by_role,
        affectedProductName: data.affected_product_name,
        affectedQuantity: data.affected_quantity,
        actionRequired: data.action_required,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (err) {
      console.error('Error in createRecall:', err);
      return null;
    }
  }
}

export const alertService = new AlertService();
