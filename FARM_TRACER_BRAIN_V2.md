# FARM TRACER — AI STUDIO FRONTEND BUILD BRAIN V2

## Purpose

Build the complete **frontend/PWA experience first** for a realistic, demonstrable Digital Food Traceability System.

This is a **working hackathon prototype**, not a static UI mockup. Every important button and workflow should work in the frontend using coherent demo data and local state. The architecture must be deliberately prepared for later integration with **Supabase, real authentication, real datasets, real AI inference, storage, realtime updates and external services**.

This document is the frontend source of truth. Build **one phase at a time** using the phase prompts supplied after this brain file.

---

# HACKATHON SUPER PROBLEM STATEMENT — END-TO-END COLD-CHAIN & TRACEABILITY

## Problem Statement Context

The original FARM TRACER scope is based on **SKH031 — Digital Food Traceability System**.

For this hackathon event, SKH031 is now part of a larger complementary problem cluster:

- **SKH029 — Inadequate Storage & Cold-Chain Logistics**
- **SKH030 — Solar-Powered Smart Storage Unit**
- **SKH031 — Digital Food Traceability System**

### Common Thread

All three problem statements address different points of the same post-harvest journey:

**Produce needs to be stored safely, including under power-constrained or solar-powered conditions, and then tracked reliably as it moves from farm to consumer.**

The shared failure mode is:

**Loss of quality and trust between harvest and plate.**

## SUPER PROBLEM STATEMENT

### End-to-End Cold-Chain & Traceability Platform

Build a solution that protects agricultural produce quality and trust across at least two stages of the farm-to-consumer journey:

1. **Smart / resilient storage**
   - Including power-constrained storage monitoring
   - Including solar-powered storage monitoring
   - Monitoring storage conditions relevant to produce quality

2. **Digital traceability**
   - Tracking a batch's origin
   - Tracking handling events
   - Tracking storage and movement
   - Tracking custody / ownership changes
   - Using QR codes / batch codes for identification and lookup

The system should allow a stakeholder — **farmer, FPO, regulator, or consumer** — to answer two questions at any point:

> **“Is this produce currently being stored within its defined safe conditions?”**

and

> **“Where has this batch been?”**

## FARM TRACER SUPER-PS POSITIONING

FARM TRACER should evolve from a traceability-only solution into an **end-to-end post-harvest quality + cold-chain + traceability platform**.

The existing traceability backbone remains the core:

**Farm → Mandi → Transport → Storage → Processing → Distribution → Retail → Consumer**

The super problem statement adds a critical storage/cold-chain layer:

**Farm → Mandi → Cold/Smart Storage → Transport → Warehouse → Processing → Distribution → Retail → Consumer**

Where appropriate, the system should connect:

**Storage Conditions → Batch → Event → Location → Custody → Traceability → Quality/Risk**

## SUPER-PS DEMO STORY

The hackathon demo should clearly demonstrate both dimensions:

### Question 1 — Current Storage Safety

For a batch currently in storage, the user should be able to see:

- Current storage location
- Current storage state
- Defined safe-condition range
- Current/demo temperature
- Current/demo humidity where relevant
- Power status
- Solar/storage-power status where relevant
- Condition status such as:
  - Within Safe Conditions
  - Warning
  - Out of Safe Conditions
- Last recorded storage event
- Duration in current storage
- Risk/alert state
- Batch quality impact where applicable

All such readings are **frontend/demo values until real sensors/backend integration exists**.

### Question 2 — Batch Journey

For the same batch, the user should be able to see:

- Origin
- Farmer/FPO
- Collection point
- Storage locations
- Transport/movement events
- Processing/transformation
- Distribution
- Retail
- Current location
- Current owner/custodian
- Complete timeline
- Interactive lineage
- QR/batch identity

## COLD-CHAIN + TRACEABILITY DATA RELATIONSHIP

Extend the existing traceability model without breaking it.

A storage event should conceptually connect:

**Batch**
↓
**Storage Location / Unit**
↓
**Storage Condition Record**
↓
**Timestamp**
↓
**Power / Solar State**
↓
**Condition Status**
↓
**Risk / Alert**
↓
**Quality / Trace Score Impact**

Future backend/sensor integration may replace the demo condition records with real IoT/sensor data, but the frontend must not falsely claim live sensor connectivity.

## SUPER-PS PRODUCT EXPERIENCE

The strongest judge-facing experience should answer both questions from one batch/product screen:

### “Is it safe right now?”

Show:

- Current condition status
- Safe-condition definition
- Current/demo readings
- Storage duration
- Power status
- Risk alerts
- Quality implications

### “Where has it been?”

Show:

- Origin
- Current location
- Previous locations
- Custody transfers
- Storage events
- Transport events
- Processing/transformation
- Timeline
- Map
- DAG/lineage
- Evidence
- Verification state

## SUPER-PS ROLE RELEVANCE

### Farmer / FPO

- Create batch
- Record origin
- View batch quality
- Send batch to collection/storage
- View storage status
- View traceability history
- Receive quality/reputation benefits from complete records

### Storage / Warehouse Operator

- Receive batch
- Assign batch to storage
- View storage conditions
- Record storage events
- Monitor condition status
- Handle warning/risk states
- Transfer/release batch
- Capture evidence

### Transporter

- Pickup
- Transit
- Delivery
- Location/route context
- Handoff evidence
- Storage-to-storage movement

### Processor / Factory

- Receive stored inputs
- Inspect condition
- Transform/merge batches
- Preserve ingredient lineage
- Create output batch
- Continue traceability

### Authority / Regulator

- Search batches
- Inspect storage conditions
- Review alerts
- Review batch journey
- Review evidence
- Inspect quality/risk history
- Review cold-chain compliance-oriented records
- Trigger recall/block UI where applicable

### Consumer

Without stakeholder login:

- Scan QR / enter batch code
- See product origin
- See journey
- See storage history
- See current/demo condition state where appropriate
- See quality/risk information
- See Trace & Quality Score
- Understand whether the recorded journey and storage conditions are within the prototype's defined safe conditions

## IMPORTANT PROTOTYPE BOUNDARIES

Do not claim:

- Real-time IoT sensor connectivity
- Certified cold-chain compliance
- Regulatory food-safety certification
- Real solar-controller integration
- Real GPS tracking
- Laboratory contamination detection
- Guaranteed food safety

Until real integrations exist, clearly label these as:

**Demo / Mock / Simulated / Frontend-ready / Integration pending**

The super problem statement expands the product scope, but the architecture remains:

**Frontend UI → Hooks/View Models → Service Interfaces → Mock/Demo Provider**

Later:

**Frontend UI → Hooks/View Models → Service Interfaces → Supabase + IoT/Sensor Provider + AI/ML + External Services**

---

# 1. PRODUCT MISSION

Build a realistic food traceability platform where:

- Farmers create and manage food batches.
- Mandis/collection centers, distributors/transporters, warehouses, processors/factories and retailers record meaningful supply-chain events.
- Authorities/admins monitor quality, risk, lineage and compliance-oriented records.
- Consumers can directly access the public experience, scan a QR/barcode and understand where a product came from, how it moved, what happened to it and how trustworthy its recorded trace is.
- Ingredient lineage continues through transformation.
- Every meaningful supply-chain step can have feedback.
- Product/trace quality is represented using a transparent **100-point score**, not a 5-star rating.
- Camera evidence is captured through the device camera rather than allowing arbitrary gallery/file uploads for proof.
- Farmers receive meaningful product-quality/reputation benefits for creating accurate batches and consistently maintaining traceability data.

Core example:

`Farmer → Mandi → Distributor/Transporter → Warehouse → Processor/Factory → Distributor → Retailer → Consumer`

Ingredient transformation:

`Wheat batch → Maida batch → Biscuit production batch → Finished product QR`

The **end-to-end trace** is the primary product experience.

---

# 2. HACKATHON PROTOTYPE RULE

This project must feel like a **real working model** during the hackathon demo.

### Build now

- Functional frontend flows, not screenshot-only pages.
- Coherent demo/mock dataset used consistently across the application.
- Local state for actions so demo actions visibly change the UI.
- Functional create-batch flow.
- Functional event/transfer flow.
- Functional transformation/lineage flow.
- Functional feedback submission flow.
- Functional 100-point score calculation from demo data.
- Functional camera capture UI for evidence.
- QR generation and scanner UI where browser support permits.
- Manual code fallback.
- Interactive lineage DAG.
- Interactive timeline.
- Interactive map abstraction.
- Batch detail views.
- Role-aware dashboards.
- PWA/offline UX.
- Loading/error/empty/success states.
- Service/repository boundaries for future Supabase integration.
- Dataset-ready data models and seed/demo data.

### Integration-ready, but not falsely connected

Prepare interfaces for:

- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Supabase Realtime
- Real AI/ML inference
- Real datasets
- Real camera evidence storage
- Real QR identities
- Real geolocation
- Real notifications
- Real certificates/verification

Do **not** fake a backend connection.

When functionality is still mocked, label it clearly as:

`Demo` / `Mock` / `Frontend-ready` / `Integration pending`

---

# 3. DO NOT BUILD A DUMMY DEMO

Avoid flows where clicking a button only opens a decorative modal.

Every important demo action should have a state transition.

Examples:

### Farmer

`Create Batch → enter data → capture camera evidence → calculate quality score → generate batch ID → generate QR → batch appears in My Batches → transfer becomes available`

### Mandi

`Receive Batch → verify handoff → capture evidence → submit feedback → batch custody changes`

### Processor

`Select parent batches → accept inputs → create transformed batch → lineage graph gains a transformation node → output batch gets its own score/QR`

### Authority

`Open alert → inspect batch → view evidence/feedback/lineage → change inspection state → risk display updates`

### Consumer

`Scan/enter QR → product trace opens → graph/timeline/map/details/score/quality/feedback are visible`

---

# 4. LANDING + ACCESS MODEL

The landing page must serve two very different audiences.

## Public/consumer access

Consumers should not need a stakeholder account merely to trace a product.

Landing page must prominently offer:

- `Scan Product`
- `Enter Batch / QR Code`
- `Trace a Product`
- concise explanation of the system
- trust/traceability explanation
- demo product CTA

## Stakeholder access

Provide clear login entry for:

- Farmer
- Mandi / Collection Center
- Distributor / Transporter
- Warehouse
- Processor / Factory
- Retailer
- Authority / Food Inspector
- Administrator
- Custom Supply Chain

`Custom Supply Chain` must support configurable workflow/roles rather than assuming one rigid chain.

## Login behavior

Frontend/demo login may use role selection or demo credentials.

Later architecture must allow:

`Supabase Auth → user → organization → role → permissions → role-aware application`

Never treat frontend role selection as production security.

---

# 5. ROLE-AWARE EXPERIENCE

Use one shared application shell with role-aware navigation and permissions.

## Farmer / Origin

Primary needs:

- Dashboard
- Create Batch
- My Batches
- Batch Details
- Quality/Product Score
- Evidence Capture
- QR
- Transfers
- Feedback
- Notifications
- Reputation/quality history

### Farmer motivation / benefits

The system should make accurate traceability useful to the farmer.

Show:

- Farmer/Product Quality Score
- verified origin history
- batch quality history
- consistency/reliability indicator
- successful verified handoffs
- positive feedback
- traceability completeness
- eligibility/readiness indicators for future marketplace/procurement integrations
- recognition/badges such as `Verified Origin`, `Consistent Quality`, `Traceability Champion`

Do not promise real monetary rewards unless an actual business program exists.

Architecture should later allow incentives such as:

- procurement preference
- buyer visibility
- verified-quality badge
- reputation-based trust
- faster verification
- reduced dispute friction
- future incentive/reward programs

The prototype should demonstrate the **motivation loop**, not invent a fake government/payment scheme.

---

## Mandi / Collection Center

Primary needs:

- Incoming batches
- Receive/verify
- Quality inspection
- Evidence capture
- Handoff
- Feedback
- Alerts
- Inventory

---

## Distributor / Transporter

Primary needs:

- Assigned transfers
- Pickup
- Transit status
- Delivery confirmation
- Evidence capture
- Route/location context
- Feedback
- Alerts

---

## Warehouse

Primary needs:

- Incoming/outgoing inventory
- Storage events
- Batch conditions
- Evidence
- Transfers
- Feedback
- Expiry alerts

---

## Processor / Factory

Primary needs:

- Incoming ingredients
- Parent-batch selection
- Merge/split/transform workflow
- Processing events
- Quality
- Output batch creation
- Ingredient lineage
- QR generation
- Feedback

---

## Retailer

Primary needs:

- Incoming batches
- Inventory
- Receive/verify
- Product/batch details
- QR
- Expiry/recall alerts
- Feedback

---

## Authority / Food Inspector

Primary needs:

- Risk dashboard
- Search
- Batch inspection
- Evidence review
- Lineage inspection
- Quality history
- Feedback history
- Geographic view
- Recall workflow
- Verification states

---

## Administrator

Primary needs:

- Organizations
- users/roles
- supply-chain configuration
- system analytics
- alerts
- moderation/verification states
- audit-oriented event visibility

---

## Consumer

Consumer should have a **direct public experience**.

No stakeholder dashboard is required.

Consumer trace view:

`Scan → Product Verification → 100-point Trace Score → Quality/Risk → DAG Lineage → Timeline → Map → Details → Certificates → Feedback`

---

# 6. CORE TRACEABILITY DATA MODEL

Create TypeScript interfaces/types for:

## Product

- productId
- name
- category
- brand
- sku
- finalBatchId
- productionDate
- expiryDate
- qrCode
- status

## Batch

- batchId
- product/material
- quantity
- unit
- origin
- originFarmerId
- currentOwner
- currentLocation
- status
- createdAt
- expiryDate
- parentBatchIds
- childBatchIds
- qualityScore
- traceScore
- evidenceCount
- handoffCount

## Supply-chain event

- eventId
- batchId
- eventType
- actor
- organization
- location
- timestamp
- quantity
- notes
- previousLocation
- newLocation
- verificationState
- evidenceIds
- feedbackId

Event types:

`CREATED`, `HARVESTED`, `COLLECTED`, `RECEIVED`, `INSPECTED`, `STORED`, `TRANSPORTED`, `PROCESSED`, `TRANSFORMED`, `PACKAGED`, `TRANSFERRED`, `SOLD`, `RECALLED`, `BLOCKED`

## Organization

- organizationId
- name
- type
- location
- verificationStatus
- contact
- certificateStatus

## Quality

- qualityScore
- inspectionDate
- parameters
- inspector
- result
- evidence
- source
- confidence
- flags

## Evidence

- evidenceId
- eventId
- batchId
- captureType: `PHOTO | VIDEO`
- capturedAt
- capturedBy
- captureLocation
- localPreviewReference
- uploadState
- verificationState
- metadata

IMPORTANT:

For proof/evidence, use **camera capture only**.

Do not provide a generic file/gallery picker for supply-chain proof.

## Feedback

Every meaningful role/step can receive feedback.

- feedbackId
- batchId
- eventId
- fromRole
- toRole
- submittedBy
- category
- score
- comment
- createdAt
- status

Feedback categories can include:

- quality
- accuracy
- packaging
- handling
- timeliness
- condition
- communication
- traceability
- overall experience

## Certificate

- certificateId
- issuer
- type
- issuedDate
- expiryDate
- verificationStatus

Never represent demo certificates as official FSSAI certificates.

## Alert

- severity
- type
- batch/product
- expiryState
- location
- createdAt
- resolutionState

## Trace Score Breakdown

Create a transparent breakdown model:

- baseScore
- handoffScore
- completenessScore
- verificationScore
- qualityScore
- evidenceScore
- feedbackScore
- contaminationPenalty
- anomalyPenalty
- expiryPenalty
- missingEvidencePenalty
- totalScore

---

# 7. 100-POINT TRACE / QUALITY SCORING SYSTEM

Replace 5-star ratings with a **0–100 point system**.

The score must be explainable. Never present it as an unexplained AI number.

## Proposed scoring model

Use a normalized weighted model:

### A. Supply-chain handoff integrity — 20 points

Reward meaningful, verified handoffs.

Concept:

- verified handoffs increase the score
- missing/unverified handoffs reduce the available points
- excessive unexplained custody changes reduce the score

Do NOT blindly reward a chain simply because it has more hands.

The goal is **verified traceability**, not maximum number of intermediaries.

### B. Trace completeness — 20 points

Evaluate whether expected events contain the required information:

- actor
- timestamp
- location
- quantity
- event type
- receiving/transfer confirmation
- evidence where required

### C. Verification integrity — 15 points

Reward verified:

- organizations
- handoffs
- inspections
- event records
- certificates where applicable

### D. Product quality — 20 points

Based on recorded quality parameters and inspection results.

Demo data may use parameters such as:

- contamination flag
- moisture
- temperature
- packaging condition
- visual quality
- inspection result

### E. Evidence quality — 10 points

Reward valid camera-captured evidence for required events.

Do not award full points merely because evidence exists; evidence must correspond to the event and have a valid capture state.

### F. Feedback/reliability — 10 points

Use aggregated feedback from relevant supply-chain interactions.

Avoid allowing one review to dominate the score.

### G. Freshness / expiry state — 5 points

Penalize expired or high-risk stale inventory.

---

## Penalties

Penalties may reduce the 100-point score:

### Contamination

If AI/inspection data flags contamination:

- immediately display a prominent `CONTAMINATION FLAG`
- reduce score according to severity
- create risk alert
- mark affected batch appropriately
- show the reason

Example demo policy:

- Low concern: -5
- Medium concern: -15
- High/severe contamination: -30 or more and potentially block the batch

These are **prototype scoring rules**, not regulatory thresholds.

### Suspicious/anomalous event

Examples:

- impossible sequence
- unexplained location jump
- duplicate event
- quantity inconsistency
- missing required handoff

Apply a transparent penalty and show the explanation.

### Missing required evidence

Reduce score where proof is required but absent.

### Expiry

Approaching expiry may reduce score slightly; expired batches should be strongly flagged and not presented as safe merely because the trace is complete.

---

## Example formula

Conceptually:

`Total = clamp(0, 100, base weighted score - penalties)`

The UI must show:

`82 / 100`

and an expandable breakdown such as:

- Handoff integrity: 17/20
- Trace completeness: 18/20
- Verification: 13/15
- Product quality: 17/20
- Evidence: 8/10
- Feedback: 6/10
- Freshness: 5/5
- Penalties: -2

Do not call this a legally defined food-safety certification.

Use labels such as:

`Trace & Quality Score`

`Prototype scoring model`

---

# 8. CONTAMINATION / AI FLAGGING

The frontend must be ready for future AI inference.

Demo behavior may simulate AI results from seeded demo data.

But the UI must distinguish:

`Demo AI result` from `Real AI result`

Future AI interface should support:

- image/video inference
- contamination detection
- anomaly detection
- confidence
- model/version
- detected issue
- severity
- explanation
- recommended action
- timestamp
- evidence reference

If a contaminated batch is detected:

1. show prominent warning
2. reduce score according to configured prototype rules
3. create alert
4. mark batch risk state
5. show exact reason
6. surface it to relevant stakeholder dashboards
7. make it visible in consumer trace as a risk/verification state where appropriate

Never say that a demo AI flag is a laboratory result.

---

# 9. CAMERA-ONLY EVIDENCE SECURITY MODEL

This is a key requirement.

For supply-chain proof, users must **capture evidence live through the device camera**.

Allowed:

- live photo capture
- live short video capture

Not allowed:

- generic gallery picker
- arbitrary phone storage upload
- selecting an old image as proof

This rule applies across stakeholder roles, including farmers.

## UX

When an event requires proof:

`Capture Evidence`

→ request camera permission

→ choose `Photo` or `Video`

→ capture

→ show preview

→ show capture timestamp

→ show event/batch context

→ optionally show location permission state

→ confirm evidence

→ save locally / mark pending sync

→ later upload to Supabase Storage when integrated

## Important browser limitation

A normal PWA/browser cannot guarantee that a device has physically prevented all file access at OS level. The prototype should therefore:

- avoid file inputs for evidence
- use `getUserMedia` / camera APIs
- clearly explain camera permission
- provide graceful fallback if the browser/device cannot access camera
- never silently substitute gallery upload

For unsupported devices, show:

`Camera capture unavailable on this device/browser. Evidence capture requires a supported camera-enabled device.`

Do not claim stronger security than the browser actually provides.

---

# 10. FARMER VALUE / MOTIVATION LOOP

The farmer is the origin of the trace and must have a reason to keep using the application.

Design a clear loop:

`Create accurate batch`
→ `capture proof`
→ `quality evaluated`
→ `verified origin`
→ `batch becomes more trustworthy`
→ `successful handoffs`
→ `positive feedback`
→ `farmer reputation improves`
→ `future buyers/partners can see verified history`

Farmer dashboard should prominently show:

- My Product Quality Score
- My Traceability Score
- Verified Batches
- Successful Handoffs
- Feedback Received
- Current Alerts
- Quality Trend
- Reputation/achievement badges

Possible demo badges:

- `Verified Origin`
- `Consistent Quality`
- `Complete Records`
- `Reliable Handoffs`
- `Traceability Champion`

Do not fabricate cash rewards.

Keep incentive architecture extensible for future real-world reward programs.

---

# 11. FEEDBACK AT EVERY SUPPLY-CHAIN STEP

Feedback is not only a consumer feature.

Every meaningful handoff/step should support contextual feedback.

Example:

`Farmer → Mandi`

Mandi can submit:

- quality
- quantity accuracy
- condition
- packaging
- documentation/traceability

`Mandi → Transporter`

Can submit:

- pickup timeliness
- handling
- condition

`Transporter → Warehouse`

Can submit:

- delivery condition
- handoff accuracy

`Warehouse → Processor`

Can submit:

- storage condition
- temperature/handling
- quantity

`Processor → Distributor`

Can submit:

- packaging
- product condition
- documentation

`Consumer → Product`

Can submit:

- product experience
- packaging
- overall experience
- trace transparency

The feedback UI must be simple enough for mobile field workers.

Use 0–100 scores rather than 5-star controls.

Show aggregate feedback carefully and prevent a single isolated review from unfairly determining the entire trace score.

---

# 12. TRACEABILITY GRAPH / DAG LINEAGE

The most important frontend concept is an **interactive lineage DAG**.

Support:

- parents
- children
- transformations
- merges
- splits
- transfers
- storage
- processing
- final product

Example:

`WHEAT-001 → MAIDA-014 → BISCUIT-092 → PACK-092-A → CONSUMER QR`

Complex example:

`FARM A ─┐`
`       ├→ MANDI → MILL → MAIDA`
`FARM B ─┘                 ↓`
`                    BISCUIT FACTORY`
`                           ↓`
`                     FINAL PRODUCT`

Clearly distinguish:

- origin
- collection
- transport
- custody transfer
- storage
- transformation
- processing
- packaging
- final product

Provide:

- Upstream: `Where did this come from?`
- Downstream: `Where did this go?`

Every graph node must be clickable and open a detailed view.

---

# 13. BATCH DETAIL VIEW

`View Details` is a major judge-facing feature.

A batch detail page/panel should show:

- batch ID
- product/material
- current owner
- origin
- quantity
- current location
- status
- 100-point score
- score breakdown
- quality
- contamination/risk flags
- evidence
- feedback
- parent batches
- child batches
- event history
- certificates
- expiry
- QR
- map location
- timeline
- upstream/downstream controls

Use tabs/drawers where appropriate on mobile.

---

# 14. TIMELINE

Provide a chronological event timeline.

Each event should show:

- event type
- actor
- organization
- date/time
- location
- quantity
- verification state
- evidence
- feedback
- notes

Clicking a timeline event must synchronize with:

- graph node
- map marker
- detail panel

---

# 15. MAP EXPERIENCE

Show conceptually:

`Farm → Mandi → Warehouse → Factory → Distributor → Retailer`

Include:

- markers
- route lines
- event selection
- location details
- batch filtering
- legend
- current-location emphasis
- synchronized timeline/map selection

Use demo coordinates until real location data is integrated.

Never claim live GPS in the frontend-only prototype.

If browser location is requested, clearly label it as:

`Device location permission`

and distinguish it from persisted/verified supply-chain location.

---

# 16. QR / BARCODE

## Stakeholder

- generate QR
- display QR
- associate QR with batch/product
- print/share concept

## Consumer

- camera scanner
- permission handling
- manual code entry fallback
- scan result
- verification
- full trace

If camera permission is denied:

`Enter code manually`

must still work.

---

# 17. OFFLINE-FIRST PWA

The application must work gracefully with unreliable connectivity.

Include:

- installable PWA metadata
- online/offline indicator
- local saved state
- pending sync
- sync queue
- retry
- cached public trace concept

Workflow:

`OFFLINE`
→ `Record event`
→ `Saved locally`
→ `Pending synchronization`
→ `Internet returns`
→ `Sync`
→ `Confirmed`

Frontend may use:

- localStorage
- IndexedDB
- service worker/cache

Do not claim server synchronization until Supabase is connected.

---

# 18. SUPABASE / DATASET FUTURE ARCHITECTURE

Use:

`UI`
↓
`Hooks / View Models`
↓
`Service Interfaces`
↓
`Mock/Demo Data Provider`

Later:

`UI`
↓
`Hooks / View Models`
↓
`Service Interfaces`
↓
`Supabase Provider`
↓
`Auth / Database / Storage / Realtime`

Services:

- authService
- batchService
- traceService
- eventService
- organizationService
- qualityService
- evidenceService
- feedbackService
- certificateService
- alertService
- recallService
- consumerService
- locationService
- scoreService
- aiService
- syncService

The UI must never import Supabase directly inside random components.

Mock data must be centralized.

Data models must be database-friendly and dataset-friendly.

---

# 19. DEMO DATA

Use one coherent fictional supply chain everywhere.

Example:

Raw material:

`WHT-MH-2026-001`

Farmer:

`Kopargaon Organic Growers`

↓

Mandi:

`Kopargaon Grain Collection Center`

↓

Processor:

`Maharashtra Grain Mills`

↓

Ingredient:

`MAIDA-MH-2026-014`

↓

Factory:

`Deccan Foods Manufacturing`

↓

Finished batch:

`BIS-2026-092`

↓

Distributor:

`Western India Distribution`

↓

Retailer:

`FreshMart Kopargaon`

↓

Consumer QR

Use additional demo batches to demonstrate:

1. healthy/high-score batch
2. incomplete-trace batch
3. contamination-flagged batch
4. approaching-expiry batch
5. transformed/merged lineage
6. offline pending-sync event

All dashboards, graphs, maps, timelines, alerts and consumer views must use the same underlying demo story.

---

# 20. DEMO SCENARIOS

## Consumer

`Scan → verification → 100-point score → trace overview → DAG → timeline → map → details → quality → certificates → expiry/recall → feedback`

## Farmer

`Login → dashboard → create batch → enter harvest information → capture live camera evidence → quality/trace score → QR → batch status → transfer to mandi → receive feedback`

## Mandi

`Login → incoming batch → inspect → capture evidence → receive → feedback → transfer`

## Processor

`Incoming batches → accept material → select parent batches → transform/merge → create child batch → lineage → quality → QR`

## Authority

`Dashboard → risk alert → open contaminated/incomplete batch → inspect evidence → graph → timeline → map → quality → feedback → recall/block workflow`

## Offline

`Go offline → record event → local save → pending sync → reconnect → simulated sync confirmation`

---

# 21. DESIGN DIRECTION

The product must look like a serious real-world food-safety/supply-chain platform.

Use:

- modern agricultural + supply-chain visual language
- excellent typography
- restrained gradients
- subtle depth
- meaningful micro-interactions
- maps
- timelines
- DAG lineage graphs
- polished cards
- strong status indicators
- clear tables
- excellent mobile usability

Avoid:

- excessive neon
- excessive glassmorphism
- childish farming illustrations
- huge gradients
- random 3D objects
- unnecessary animation
- fake statistics
- visually impressive but confusing layouts

Field workers must be able to understand the UI quickly.

---

# 22. RESPONSIVE REQUIREMENT

Every role must work on:

- mobile
- tablet
- desktop

Mobile is not a shrunken desktop.

Use:

- bottom navigation where appropriate
- mobile drawers
- large touch targets
- camera-first evidence screens
- simplified tables
- stacked cards
- responsive graph controls
- responsive map
- accessible forms

Desktop can use richer multi-column layouts.

---

# 23. MULTILINGUAL ARCHITECTURE

Initial languages:

- English
- Hindi
- Marathi

Use translation keys rather than hard-coded UI strings.

Architecture must make it possible to connect real translation content later.

---

# 24. FRONTEND TECHNOLOGY

Prefer:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide icons
- Recharts
- React Flow or equivalent
- Leaflet/MapLibre or equivalent
- QR generation library
- browser camera APIs
- PWA manifest/service-worker approach

Use compatible alternatives if AI Studio requires them.

Do not add dependencies merely for decoration.

---

# 25. ROUTES

## Public

`/`
`/login`
`/register`
`/trace/:productId`
`/scan`
`/about`
`/verify`

## Application

`/dashboard`
`/batches`
`/batches/:batchId`
`/events`
`/lineage/:batchId`
`/transfers`
`/inventory`
`/processing`
`/warehouses`
`/retail`
`/recalls`
`/alerts`
`/quality`
`/certificates`
`/analytics`
`/map`
`/feedback`
`/settings`

Use role-aware navigation rather than separate applications.

---

# 26. COMPONENT SYSTEM

Build reusable:

- Button
- Input
- Select
- Modal
- Drawer
- Card
- Badge
- StatusBadge
- Toast
- Alert
- EmptyState
- LoadingState
- ErrorState
- DataTable
- Timeline
- Stepper
- StatCard
- ChartCard
- MapCard
- TraceGraph
- QRCard
- CameraCapture
- EvidenceCard
- CertificateCard
- ScoreRing / ScoreBreakdown
- FeedbackForm
- FeedbackSummary
- Search
- FilterBar
- MobileBottomNavigation

Avoid unnecessary duplication.

---

# 27. FOUR-PHASE BUILD PLAN

## PHASE 1 — FOUNDATION + PUBLIC EXPERIENCE

Build:

- project structure
- design system
- responsive shell
- landing page
- direct consumer access
- stakeholder login
- role selection
- login/register UI
- public trace page
- QR/manual lookup
- consumer verification
- 100-point score overview
- initial timeline
- initial DAG preview
- initial map preview
- PWA metadata
- centralized demo-data architecture
- future-Supabase service interfaces
- reusable responsive components

Acceptance:

- public routes work
- consumer can directly trace demo product
- role login works in demo mode
- 100-point score is visible
- no 5-star primary rating
- mobile/desktop work
- no blank screens
- buttons provide feedback
- all integration-dependent features are honestly labeled

---

## PHASE 2 — STAKEHOLDER OPERATIONS + WORKING WORKFLOWS

Build:

- authenticated role-aware shell
- farmer dashboard
- all stakeholder dashboards
- batch creation
- camera-only evidence capture
- batch detail
- event recording
- transfer workflow
- receiving workflow
- processing/transformation workflow
- inventory
- QR generation
- feedback at each handoff
- farmer quality/reputation view
- alerts
- search/filtering
- local state persistence

Acceptance:

A judge can simulate:

`Farmer creates batch → captures proof → score calculated → QR → Mandi receives → feedback → transfer → Processor transforms`

No major action should be decorative only.

---

## PHASE 3 — END-TO-END TRACEABILITY

This is the **highest-priority differentiator**.

Build:

### Interactive DAG

- source
- batch
- transformation
- merge
- split
- transfer
- storage
- final product
- upstream/downstream traversal

### Timeline

Full chronological event history.

### Map

Geographic journey.

### Full details

Every graph/timeline/map item opens details.

### Evidence

Open event evidence records.

### Feedback

Show feedback attached to each meaningful step.

### Consumer

Make the final trace page the strongest screen.

Judge should immediately understand:

**"This biscuit can be traced back through its ingredients and every important processing/custody step."**

Acceptance:

One demo product shows:

`Farm → Mandi → Processing → Ingredient → Factory → Distribution → Retail → Consumer`

through:

`DAG + Timeline + Map + Details + Score + Evidence + Feedback`

---

## PHASE 4 — TRUST + SAFETY + AI-READY + OFFLINE + POLISH

Build:

### Trust

- 100-point Trace & Quality Score
- transparent score breakdown
- verified handoff count
- trace completeness
- organization verification
- certificate UI
- farmer reputation

### Safety

- contamination flags
- AI-risk UI
- expiry states
- approaching-expiry warnings
- expired alerts
- recall/block UI
- anomaly detection
- suspicious event UI
- risk explanations

### AI-ready

- AI result model
- confidence
- severity
- evidence reference
- demo-vs-real AI state
- future aiService boundary

### PWA

- install UX
- offline status
- local save
- pending sync
- sync queue
- retry
- cached public trace concept

### Feedback

- stakeholder-to-stakeholder feedback
- consumer feedback
- aggregation
- feedback-linked score contribution

### Multilingual

- English
- Hindi
- Marathi
- translation architecture

### Accessibility

- semantic labels
- keyboard navigation
- readable contrast
- large touch targets
- screen-reader-friendly controls

### Final polish

- skeleton loading
- error/empty/success states
- confirmation dialogs
- subtle animations
- responsive cleanup
- performance cleanup
- console error cleanup

---

# 28. AI STUDIO EXECUTION PROTOCOL

For every phase:

1. Read this brain file.
2. Inspect the existing repository.
3. Inspect existing implementation before changing it.
4. Make a short implementation plan.
5. List files/components to create or modify.
6. Implement **ONLY the requested phase**.
7. Preserve working functionality from earlier phases.
8. Use centralized demo data and service interfaces.
9. Do not silently implement future phases.
10. Run typecheck/build/lint where available.
11. Fix errors.
12. Test important user flows.
13. Report:
   - changed files
   - completed functionality
   - validation results
   - known limitations
   - next phase

If an existing implementation already satisfies part of a phase, reuse it.

If ambiguous, choose the simplest solution consistent with this document.

---

# 29. ANTI-HALLUCINATION / HONESTY RULES

Never:

- claim Supabase is connected when it is not
- claim real authentication when using demo role selection
- claim AI inference is real without an AI service
- claim a demo contamination flag is a laboratory result
- claim FSSAI certification without real verification
- fabricate live GPS
- fabricate real-time notifications
- fabricate regulatory approval
- invent external APIs
- expose secrets
- add blockchain only for marketing
- present prototype score thresholds as regulatory standards
- claim browser camera capture makes a system impossible to spoof

Use:

`Demo`
`Mock`
`Prototype`
`Frontend-ready`
`Integration pending`

where appropriate.

---

# 30. DEFINITION OF DONE

- [ ] Public landing
- [ ] Direct consumer access
- [ ] Stakeholder login/register UI
- [ ] Role selection
- [ ] Role-aware dashboards
- [ ] Farmer motivation/reputation view
- [ ] Batch creation
- [ ] Event/transfer workflows
- [ ] Camera-only evidence capture UI
- [ ] QR generation
- [ ] QR scanner + manual fallback
- [ ] Interactive DAG
- [ ] Timeline
- [ ] Map
- [ ] Upstream/downstream lineage
- [ ] Ingredient → finished-product lineage
- [ ] 100-point score
- [ ] Transparent score breakdown
- [ ] Contamination penalty/flag
- [ ] Anomaly/risk UI
- [ ] Quality UI
- [ ] Certificate UI
- [ ] Expiry/recall UI
- [ ] Feedback for every meaningful step
- [ ] Consumer feedback
- [ ] Farmer quality/reputation
- [ ] English/Hindi/Marathi architecture
- [ ] Offline/PWA UX
- [ ] Pending sync queue concept
- [ ] Strong mobile layout
- [ ] Loading/error/empty/success states
- [ ] Coherent demo data
- [ ] Dataset-ready interfaces
- [ ] Supabase-ready service architecture
- [ ] Production build succeeds
- [ ] No major console errors

---

# 31. FINAL PRODUCT STORY

The product should communicate:

> **"Scan any food product and see its journey — from origin to your hands."**

For stakeholders:

> **"Record every meaningful step once, preserve its lineage, prove what happened, and build trust across the supply chain."**

The strongest visual moment is:

`ORIGIN`
↓
`COLLECTION`
↓
`TRANSPORT`
↓
`PROCESSING`
↓
`TRANSFORMATION`
↓
`WAREHOUSE`
↓
`DISTRIBUTION`
↓
`RETAIL`
↓
`CONSUMER`

And ingredient lineage:

`WHEAT`
↓
`MAIDA`
↓
`BISCUIT MIX`
↓
`BISCUIT`
↓
`PACKAGED PRODUCT`
↓
`CONSUMER QR`

Everything else supports this core experience.
