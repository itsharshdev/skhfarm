# FARM TRACER — BACKEND BRAIN V3
## Real-World End-to-End Food Traceability Platform
### Backend + Supabase Implementation Specification

---

# 0. CORE RULE

This is NOT just a visual demo.

The goal is a genuinely working hackathon-grade food traceability platform with:

- Real authentication
- Real Supabase database
- Real Row Level Security
- Real supply-chain events
- Real batch/product relationships
- End-to-end lineage
- DAG traceability visualization
- Geographic tracking
- QR/barcode traceability
- Ingredient-to-final-product lineage
- Quality scoring
- Feedback
- AI risk/expiry flagging
- FSSAI/compliance records
- Notifications
- Offline-first PWA synchronization
- Role-based dashboards
- Consumer public traceability

AI-generated code must NEVER invent database structures, API responses, credentials, datasets, or successful integrations.

Before implementing anything:
1. Inspect the existing repository.
2. Inspect the existing frontend routes/components/types.
3. Inspect FARM_TRACER_BRAIN_V2.md and this file.
4. Inspect the existing Supabase project through MCP.
5. Reuse working frontend functionality where possible.
6. Do not destroy existing working UI.
7. Ask before making architectural changes that contradict this file.

---

# 1. REQUIRED ROUTES

The application must use real URL routes.

## Public

/
  Landing page

/login
  Login

/register
  Registration

/trace/:batchId
  Consumer traceability

/trace/:batchId/timeline
  Full trace timeline

/trace/:batchId/map
  Geographic trace

/trace/:batchId/lineage
  DAG lineage

/about
  About platform

## Authenticated

/dashboard
  Role-aware dashboard

/dashboard/farmer
/dashboard/mandi
/dashboard/processor
/dashboard/manufacturer
/dashboard/distributor
/dashboard/retailer
/dashboard/consumer
/dashboard/authority
/dashboard/admin

/batches
/batches/:batchId

/products
/products/:productId

/events
/events/:eventId

/feedback
/notifications

## Admin / Authority

/admin
/admin/users
/admin/organizations
/admin/batches
/admin/alerts
/admin/recalls
/admin/compliance
/admin/audit

Every protected route must enforce authentication and role permissions.

---

# 2. USER ROLES

Support:

- FARMER
- MANDI
- PROCESSOR
- MANUFACTURER
- DISTRIBUTOR
- RETAILER
- CONSUMER
- AUTHORITY
- ADMIN

The backend must never trust a role supplied directly by the frontend.

Role authorization must be enforced through Supabase RLS/database logic.

---

# 3. AUTHENTICATION

Implement:

- Email/password registration
- Email/password login
- Logout
- Session persistence
- Password reset
- Email verification handling
- Role/profile creation
- Organization membership

Google OAuth may be added if correctly configured, but must not block the core system.

OTP should only be implemented if a reliable Supabase-supported flow is configured.

Never pretend OAuth/OTP works if it has not been configured and tested.

---

# 4. CORE DATABASE ENTITIES

Minimum entities:

organizations
profiles
organization_members

products
batches
batch_items

supply_chain_events
locations

batch_lineage
product_ingredients

quality_scores
quality_observations

feedback

qr_codes

certifications
compliance_records

alerts
notifications

recalls

audit_logs

sync_queue

AI risk/analysis records where required.

---

# 5. BATCH MODEL

Every physical food batch receives a unique immutable identifier.

Example:

FT-2026-FRM-000001

A batch contains:

- batch ID
- product
- producer
- organization
- quantity
- unit
- production date
- expiry date
- current status
- current owner
- current location
- origin location
- quality score
- certification information
- parent batches
- child batches
- timestamps

Do not store the entire trace as duplicated text.

Traceability must be reconstructed from relational events and lineage.

---

# 6. SUPPLY CHAIN EVENT MODEL

Every movement/transformation creates an event.

Examples:

PRODUCED
HARVESTED
MOVED_TO_MANDI
RECEIVED
PROCESSED
TRANSFORMED
PACKAGED
SHIPPED
RECEIVED_BY_DISTRIBUTOR
RECEIVED_BY_RETAILER
SOLD

Each event should contain:

- event ID
- batch ID
- actor
- organization
- event type
- timestamp
- source location
- destination location
- quantity
- parent batch IDs
- resulting batch IDs
- notes
- evidence metadata
- verification status

Events should be append-oriented and auditable.

---

# 7. INGREDIENT → FINAL PRODUCT TRACEABILITY

This is a major differentiator.

Example:

Wheat batch
    ↓
Flour batch
    ↓
Biscuit manufacturing batch
    ↓
Packaged biscuit
    ↓
Distributor
    ↓
Retailer
    ↓
Consumer

If a consumer scans the final product QR:

The system must be able to trace backwards:

Final product
→ manufacturing batch
→ flour batch
→ wheat batches
→ original farmer/origin

And forwards:

Original batch
→ processor
→ manufacturer
→ distributor
→ retailer
→ final product.

This must support many-to-one and one-to-many relationships.

---

# 8. DAG LINEAGE

The backend must provide structured lineage data for frontend visualization.

Do NOT generate the graph in the database.

Return nodes and edges.

Node examples:

- FARMER
- BATCH
- MANDI
- PROCESSOR
- FACTORY
- DISTRIBUTOR
- RETAILER
- FINAL_PRODUCT

Edge examples:

PRODUCED
TRANSFERRED
PROCESSED
COMBINED
SPLIT
PACKAGED

The frontend can render this using a graph library.

---

# 9. TIMELINE

Every batch must have a chronological trace.

Example:

Harvested
↓
Quality checked
↓
Mandi received
↓
Processor received
↓
Processed
↓
Manufacturer received
↓
Packaged
↓
Distributor
↓
Retailer
↓
Consumer

Timeline must be generated from actual events.

---

# 10. MAP / LOCATION TRACE

Store geographic coordinates for relevant events.

Each location may contain:

- latitude
- longitude
- address
- city
- state
- country
- organization

The backend provides ordered location points.

Frontend can display:

Origin
→ Mandi
→ Processor
→ Factory
→ Distributor
→ Retailer

Use a real mapping provider.

Do not fake live GPS.

If live tracking is unavailable, represent verified event locations instead.

---

# 11. QR SYSTEM

QR code must resolve to:

/trace/:batchId

or final-product trace URL.

QR should never expose private database information.

Consumer receives only public-safe trace information.

Possible public information:

- product
- origin
- production date
- trace timeline
- major supply-chain stages
- quality score
- certifications
- current status
- expiry status
- recall status
- verified locations

Private information must remain protected.

---

# 12. QUALITY SCORE — 0 TO 100

Use a 100-point score, NOT stars.

Score can consider:

- verified supply-chain records
- quality inspections
- certifications
- storage conditions
- transport conditions
- number of unexplained handoffs
- missing trace events
- contamination/risk flags
- expiry proximity
- feedback
- compliance

Example conceptual model:

Quality Score =
Base Quality
+ Verification
+ Compliance
+ Traceability
+ Positive Feedback
- Risk Penalties
- Missing Data Penalties
- Contamination Penalties

The exact weighting must be transparent and configurable.

Do not create arbitrary scoring claims.

Every score should have explainable factors.

---

# 13. "HANDS" / SUPPLY CHAIN DEPTH

Display how many supply-chain actors handled a product.

Example:

1 hand:
Farmer → Consumer

4 hands:
Farmer → Mandi → Processor → Retailer → Consumer

The UI should explain:

"4 verified supply-chain handoffs"

Do not automatically punish every handoff.

More handoffs may increase complexity/risk, but legitimate supply chains must not be unfairly penalized.

Use missing verification/risk as stronger penalties.

---

# 14. FEEDBACK

Feedback must exist for every relevant supply-chain step.

Examples:

Farmer → Mandi
Mandi → Processor
Processor → Manufacturer
Manufacturer → Distributor
Distributor → Retailer

Feedback should include:

- rating score
- optional comment
- transaction/event reference
- actor
- timestamp

Prevent arbitrary users from reviewing unrelated transactions.

---

# 15. FARMER INCENTIVES

Farmers must have a reason to maintain accurate records.

Possible backend-supported features:

- farmer quality score
- verified producer badge
- traceability contribution score
- certification visibility
- positive feedback
- reliability history
- compliance history
- participation rewards

Do not invent monetary rewards unless a real mechanism exists.

---

# 16. AI RISK / SHELF-LIFE SYSTEM

AI can analyze:

- expiry proximity
- product category
- storage data
- transport duration
- temperature/humidity observations where available
- contamination observations
- missing traceability information
- suspicious supply-chain patterns

Output:

LOW RISK
MEDIUM RISK
HIGH RISK
EXPIRED

AI must NOT silently change authoritative database records.

AI results should be stored as analysis/flags and reviewed where necessary.

---

# 17. EXPIRY ALERTS

Automatically calculate:

- days remaining
- near-expiry
- expired

Example:

> 30 days remaining → NORMAL

> 7 days remaining → NEAR EXPIRY

> 0 days → EXPIRED

Create alerts for relevant authorized users.

Do not claim that AI can magically determine food safety from expiry date alone.

---

# 18. CONTAMINATION / QUALITY FLAGS

If inspection or AI analysis detects a potential issue:

Create an alert.

Example:

HIGH_RISK_CONTAMINATION

The system should:

1. Flag batch.
2. Reduce quality score according to configured rules.
3. Notify authorized stakeholders.
4. Preserve evidence.
5. Allow authority/admin review.
6. Optionally initiate recall workflow.

AI detection is an indicator, not automatically a legally valid laboratory certification.

---

# 19. FSSAI / CERTIFICATION

Support certification records:

- certification type
- certificate number
- issuing authority
- issue date
- expiry date
- document/reference
- verification status

Do NOT fabricate FSSAI certificates.

Demo certificates must be explicitly marked as DEMO.

Real certificates should require real verification/documentation.

---

# 20. RECALL SYSTEM

Authority/Admin can:

- create recall
- select affected batches
- provide reason
- set severity
- activate recall
- notify stakeholders

Consumer trace page must show:

⚠ RECALL ALERT

when the scanned product/batch is affected.

---

# 21. AUDIT LOG

Record important actions:

- login
- registration
- batch creation
- batch transfer
- processing
- quality update
- certification update
- recall
- admin changes

Audit records should not be casually editable by normal users.

---

# 22. OFFLINE-FIRST PWA

The application must support offline operation where technically appropriate.

Offline functionality:

- app shell
- cached static assets
- forms
- batch/event drafts
- queued operations
- locally stored unsynced records

When connection returns:

Offline queue
→ validation
→ synchronization
→ server confirmation
→ local status update

Never claim an operation is permanently stored server-side while offline.

Show:

SYNCED
PENDING SYNC
SYNC FAILED

Use IndexedDB/local storage appropriately.

Never store sensitive authentication secrets insecurely.

---

# 23. CAMERA-ONLY EVIDENCE

For proof/evidence workflows:

Use live camera capture.

Do NOT provide generic gallery/file upload for evidence where the product requirement specifically requires live capture.

Support:

- live photo capture
- short live video capture where required

Store evidence securely.

Do not expose storage URLs publicly.

---

# 24. ROLE DASHBOARDS

Each role gets a focused dashboard.

## Farmer

- create batch
- view batches
- quality score
- feedback
- certifications
- trace history
- pending actions

## Mandi

- receive batches
- inspect
- transfer
- feedback
- location

## Processor

- receive inputs
- process/transform
- create output batches
- connect parent batches
- quality checks

## Manufacturer

- combine ingredients
- create final products
- packaging
- QR generation

## Distributor

- shipments
- receive
- dispatch
- locations

## Retailer

- receive stock
- inventory
- expiry alerts
- QR

## Consumer

- scan/search product
- trace
- timeline
- map
- lineage
- quality score
- certifications
- feedback

## Authority

- alerts
- recalls
- compliance
- suspicious batches
- trace investigations

## Admin

- users
- organizations
- system monitoring
- configuration
- audit logs

---

# 25. API / SERVICE ARCHITECTURE

Frontend must NOT directly perform complex multi-step business logic.

Use service functions for:

auth
batches
products
events
lineage
locations
quality
feedback
qr
certifications
alerts
recalls
notifications
audit
sync

Prefer Supabase RPC/database functions for atomic operations where multiple tables must change together.

Example:

create_processing_event()

should atomically:

- validate source batches
- create output batch
- create lineage relationships
- create event
- update statuses
- create audit entry

---

# 26. RLS

Every important table requires RLS.

Rules:

Consumers:
read public trace data only.

Farmers:
manage their own batches/events where authorized.

Organizations:
access organization data according to membership.

Authorities:
access authorized compliance/inspection data.

Admins:
full administrative access.

Never use:

"if frontend hides the button, the user cannot access it."

Security must exist at database level.

---

# 27. DEMO MODE

Keep demo capability.

Demo data should include a complete trace:

Farmer
→ Mandi
→ Processor
→ Manufacturer
→ Distributor
→ Retailer
→ Consumer

Include:

- sample batches
- sample locations
- sample events
- sample lineage
- sample quality score
- sample certification
- sample alerts

Clearly mark demo records.

Demo mode must never contaminate real user data.

---

# 28. MULTILINGUAL SUPPORT

Frontend should support Indian languages.

Initial architecture should allow:

English
Hindi
Marathi

More languages can be added later.

Backend should store language preference in profile.

Do not hardcode translated strings inside business logic.

---

# 29. NOTIFICATIONS

Support:

- in-app notifications
- expiry alerts
- recall alerts
- quality alerts
- pending sync alerts
- compliance alerts

Push notifications may be added if time permits.

Core functionality must not depend on push notifications.

---

# 30. SECURITY RULES

NEVER:

- commit `.env`
- expose service-role keys
- put secrets in frontend
- bypass RLS
- trust frontend role values
- expose private storage publicly
- fake AI results
- fake certifications
- fake GPS
- claim external APIs work without testing

Only public/publishable Supabase keys belong in Vite frontend environment variables.

---

# 31. IMPLEMENTATION ORDER

Implement in phases.

## PHASE 1 — SUPABASE FOUNDATION

- inspect current database
- verify project
- tables
- enums
- relationships
- indexes
- RLS
- profiles
- organizations
- memberships
- authentication
- seed demo data

Verification:

npm run typecheck
npm run build

Then manually test:

register
login
logout
refresh
role routing

---

## PHASE 2 — TRACEABILITY CORE

Implement:

products
batches
batch relationships
supply-chain events
locations
transfers
processing
batch splitting
batch merging
audit logs

Then implement:

/batches
/batches/:batchId
/events
/dashboard/*

Verify real DB persistence.

---

## PHASE 3 — END-TO-END TRACE + QR + MAP

Implement:

QR generation
public trace endpoint
timeline
DAG lineage API
map/location API
ingredient → final-product lineage
consumer trace page

Required:

/trace/:batchId
/trace/:batchId/timeline
/trace/:batchId/map
/trace/:batchId/lineage

This is the CORE HACKATHON FEATURE.

---

## PHASE 4 — QUALITY + AI + COMPLIANCE

Implement:

100-point quality score
feedback
quality observations
expiry calculations
AI risk flags
contamination flags
certifications
compliance
alerts
notifications
recalls

Authority dashboard must be functional.

---

## PHASE 5 — OFFLINE + HARDENING

Implement:

PWA
IndexedDB
offline queue
sync
camera evidence
multilingual support
responsive/mobile UI
error handling
security audit
RLS testing
demo dataset
final end-to-end testing

---

# 32. VERIFICATION REQUIREMENT

After every phase:

npm run typecheck
npm run build

Then manually test the actual workflow.

Never report:

"implemented successfully"

unless the implementation has actually been checked.

---

# 33. FINAL DEMO WORKFLOW

The final demo should demonstrate:

1. Farmer logs in.
2. Farmer creates wheat batch.
3. Batch receives QR.
4. Mandi receives it.
5. Processor converts wheat → flour.
6. Manufacturer uses flour to create biscuit batch.
7. Distributor receives shipment.
8. Retailer receives product.
9. Consumer scans QR.
10. Consumer sees:
    - full timeline
    - DAG lineage
    - map
    - locations
    - organizations
    - quality score /100
    - number of verified handoffs
    - certifications
    - expiry status
    - alerts/recalls
11. Authority can inspect the same chain.
12. A simulated risk/expiry event produces an alert.

This end-to-end story is more important than adding dozens of disconnected features.

---

# 34. AI AGENT RULE

Before changing code:

PLAN → IMPLEMENT → TEST → REPORT

For each phase:

1. Inspect existing implementation.
2. Identify reusable code.
3. Identify missing pieces.
4. Produce a concise implementation plan.
5. Wait for approval if architectural changes are required.
6. Implement.
7. Run typecheck.
8. Run build.
9. Test relevant flows.
10. Summarize changed files and remaining issues.

Do not rewrite working parts unnecessarily.

---

# 35. PRIORITY

Priority order:

P0:
Authentication
Database
Batches
Events
Lineage
QR
Consumer trace

P1:
Maps
Timeline
Quality score
Roles
Feedback
Expiry

P2:
AI risk
Compliance
Recall
Notifications
Offline sync

P3:
Advanced analytics
additional languages
advanced AI
additional integrations

A complete working P0 is better than 30 unfinished features.

END OF BRAIN V3