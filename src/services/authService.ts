import { supabase } from './supabaseClient';
import { AppUser, StakeholderRole } from '../types';

export const ROLE_DEMO_EMAILS: Record<string, string> = {
  FARMER: 'farmer@farmtracer.demo',
  MANDI: 'mandi@farmtracer.demo',
  WAREHOUSE: 'warehouse@farmtracer.demo',
  PROCESSOR: 'processor@farmtracer.demo',
  FACTORY: 'factory@farmtracer.demo',
  MANUFACTURER: 'factory@farmtracer.demo',
  DISTRIBUTOR: 'distributor@farmtracer.demo',
  TRANSPORTER: 'transporter@farmtracer.demo',
  RETAILER: 'retailer@farmtracer.demo',
  AUTHORITY: 'authority@farmtracer.demo',
  ADMIN: 'admin@farmtracer.demo',
};

const DEFAULT_DEMO_PASSWORD = 'password123';

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  role: StakeholderRole;
  organizationId?: string;
  newOrganizationName?: string;
  location?: string;
  language?: string;
}

export interface OrganizationOption {
  id: string;
  name: string;
  type: string;
  city?: string;
  state?: string;
}

export class AuthService {
  /**
   * Fetch profile and organization info for a given auth user_id
   */
  public async fetchProfile(userId: string): Promise<AppUser | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          role,
          language,
          organization_id,
          organizations (
            id,
            name,
            type,
            city,
            state
          )
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) {
        console.warn('Profile fetch warning:', error?.message);
        return null;
      }

      const org = data.organizations as any;
      const orgName = org?.name || 'Independent Operator';
      const location = org?.city ? `${org.city}, ${org.state || 'India'}` : 'Maharashtra Region';

      return {
        userId: data.user_id,
        name: data.full_name || 'Verified User',
        role: data.role as StakeholderRole,
        organizationName: orgName,
        organizationId: data.organization_id || '',
        location,
        verified: true,
        avatarInitials: (data.full_name || data.role || 'US')
          .split(' ')
          .map((n: string) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase(),
      };
    } catch (err) {
      console.error('Error fetching profile from Supabase:', err);
      return null;
    }
  }

  /**
   * Sign in using standard email and password
   */
  public async signInWithEmail(
    email: string,
    password: string
  ): Promise<{ user: AppUser | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        return { user: null, error: error || new Error('Login failed') };
      }

      const profile = await this.fetchProfile(data.user.id);
      return { user: profile, error: null };
    } catch (err: any) {
      return { user: null, error: err };
    }
  }

  /**
   * Fast 1-Click login into real seeded Supabase role account
   */
  public async signInWithDemoRole(
    role: StakeholderRole
  ): Promise<{ user: AppUser | null; error: Error | null }> {
    const email = ROLE_DEMO_EMAILS[role] || 'farmer@farmtracer.demo';
    return this.signInWithEmail(email, DEFAULT_DEMO_PASSWORD);
  }

  /**
   * Register a new user and optional organization
   */
  public async signUp(
    input: SignUpInput
  ): Promise<{ user: AppUser | null; error: Error | null }> {
    try {
      let finalOrgId = input.organizationId;

      // If user provided a new organization name, insert the organization first
      if (!finalOrgId && input.newOrganizationName) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: input.newOrganizationName,
            type: input.role === 'FARMER' ? 'FARM' : input.role,
            city: input.location?.split(',')[0]?.trim() || 'Maharashtra',
            state: input.location?.split(',')[1]?.trim() || 'Maharashtra',
          })
          .select('id')
          .single();

        if (!orgError && orgData) {
          finalOrgId = orgData.id;
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.fullName,
            role: input.role,
            organization_id: finalOrgId || null,
            language: input.language || 'en',
          },
        },
      });

      if (error || !data.user) {
        return { user: null, error: error || new Error('Registration failed') };
      }

      // If session exists immediately (email confirmation disabled in local/hackathon mode)
      if (data.session) {
        const profile = await this.fetchProfile(data.user.id);
        return { user: profile, error: null };
      }

      // Return synthetic app user if confirmation pending
      return {
        user: {
          userId: data.user.id,
          name: input.fullName,
          role: input.role,
          organizationName: input.newOrganizationName || 'Pending Registration',
          organizationId: finalOrgId || '',
          location: input.location || 'India',
          verified: false,
          avatarInitials: input.fullName.slice(0, 2).toUpperCase(),
        },
        error: null,
      };
    } catch (err: any) {
      return { user: null, error: err };
    }
  }

  /**
   * Sign out current session
   */
  public async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error || null };
    } catch (err: any) {
      return { error: err };
    }
  }

  /**
   * Send password recovery email via Supabase Auth
   */
  public async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      return { error: error || null };
    } catch (err: any) {
      return { error: err };
    }
  }

  /**
   * Fetch all registered organizations for dropdown select
   */
  public async fetchOrganizations(): Promise<OrganizationOption[]> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, type, city, state')
        .order('name');

      if (error || !data) return [];
      return data;
    } catch (err) {
      console.error('Error fetching organizations:', err);
      return [];
    }
  }
}

export const authService = new AuthService();
