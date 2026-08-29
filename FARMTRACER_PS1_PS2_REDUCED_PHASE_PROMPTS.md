# FARMTRACER — PS-1 + PS-2 ADDITION PROMPTS
## Reduced Phase Plan — Frontend Additions Only

> **Purpose:** Add the two new problem-statement capabilities to the existing FarmTracer application without altering, replacing, or breaking its existing traceability, cold-chain, solar, QR, DAG, map, role, PWA, or Supabase functionality.

The existing FarmTracer brain remains the source of truth for the original product. It already defines the farm-to-consumer traceability backbone, storage/cold-chain monitoring, solar-powered storage context, batch identity, events, custody, maps, DAG/lineage, evidence, and verification. The new capabilities are **additions**, not replacements.

---

# GLOBAL RULES — APPLY TO EVERY PHASE

## ABSOLUTE BACKEND FREEZE

These prompts are for **frontend changes only**.

DO NOT modify:
- Supabase schema
- Supabase tables/columns
- RLS policies
- authentication
- Storage configuration
- RPC functions
- Edge Functions
- migrations
- backend APIs
- backend services
- existing Supabase queries
- environment secrets

The backend team owns the backend.

Use existing backend data/contracts where available.

If a required backend field does not yet exist, create a clearly isolated frontend/demo abstraction rather than changing the backend.

Never present demo/mock data as real live data.

## EXISTING FEATURES ARE PROTECTED

Do NOT remove, replace, redesign, or unnecessarily refactor:
- existing login/auth
- role-specific dashboards
- batch creation
- batch management
- QR generation/scanning
- public trace
- digital batch passport
- supply-chain events
- custody
- timeline
- DAG/lineage
- route/map
- evidence capture
- temperature/cold-chain
- solar/environment conditions
- quality
- feedback
- offline/PWA
- existing Supabase integration

Follow the existing AI coding rules: inspect first, preserve working features, avoid rebuilding the repository, make one logical change at a time, test and commit after each phase.

---

# NEW CAPABILITIES

## PS-1 — DATA RESILIENCE

Scenario:

The primary data store becomes corrupted, wiped, or unreadable during active FarmTracer operations.

FarmTracer must be able to visually communicate:
- incident state
- affected records
- recoverable records
- partially recoverable records
- unavailable records
- interrupted operations
- pending operations
- reconciliation/review state

The system must never pretend that missing data is still available.

## PS-2 — INFORMATION / CLAIM VERIFICATION

Scenario:

False information spreads about a food batch, quality condition, cold-chain failure, contamination, origin, storage, transport, or another traceability fact.

FarmTracer should use its existing evidence sources to help users assess the claim:
- batch record
- traceability timeline
- quality records
- evidence
- temperature/cold-chain graph
- storage conditions
- solar/environment conditions
- route/location
- transport events
- storage events
- inspection/certificate records where available
- lineage/DAG

The system must show **why** a claim is supported, contradicted, disputed, or unverified.

AI must not be presented as an unquestionable final authority.

---

# PHASE 1 — FOUNDATION + PS-1 INCIDENT MODE

## Goal

Add the minimum frontend foundation required for both new capabilities and implement PS-1's visible incident state.

## Prompt

```text
You are modifying the existing FarmTracer frontend.

DO NOT rebuild the project.
DO NOT redesign the existing application.
DO NOT modify the backend.

First inspect the current repository and identify the existing components for:
- batches
- trace
- timeline
- DAG/lineage
- map
- evidence
- temperature/cold-chain
- solar/environment conditions
- offline/PWA
- roles
- Supabase integration

Then implement ONLY the following additions.

PS-1 DATA RESILIENCE:

Add a frontend-only Data Integrity Incident state.

Supported states:
NORMAL
DEGRADED
INCIDENT
RECOVERY
PARTIALLY_RECOVERED

Add a compact incident indicator/banner that can appear without replacing the existing application shell.

Example:

DATA INTEGRITY INCIDENT
Some records may be unavailable or require recovery verification.

Add frontend status badges:

VERIFIED
RECOVERED
PARTIALLY RECOVERED
REQUIRES REVIEW
UNRECOVERABLE
PENDING SYNCHRONIZATION

Integrate the status into existing batch/timeline/DAG views where appropriate.

Do not hide existing data.
Do not invent missing records.

For missing information show:
"Data unavailable"
or
"Recovery verification required."

PS-2 FOUNDATION:

Create frontend-only models/types for:
Claim
ClaimEvidence
VerificationStatus
VerificationFactor

Do not create database tables.
Do not create new backend APIs.

Create reusable UI components only where required.

At the end:
- run typecheck
- run lint
- run build
- verify existing routes
- verify existing Supabase integration
- report exactly which files changed.

STOP after this phase.
Do not implement full PS-2 yet.
```

### Expected result

Only a **small integrity layer** is added. Existing FarmTracer remains visually and functionally intact.

---

# PHASE 2 — PS-1 RECOVERY + IN-FLIGHT OPERATIONS

## Goal

Turn the PS-1 incident state into a demonstrable recovery workflow.

## Prompt

```text
Continue from the existing FarmTracer frontend.

DO NOT modify the backend.
DO NOT rebuild or redesign existing features.

Implement PS-1 DATA RESILIENCE recovery functionality.

Add a Recovery/Integrity section to the most appropriate existing admin/operations experience.

Show:
- Incident Status
- Affected Records
- Recoverable Records
- Partially Recoverable Records
- Unavailable Records
- Pending Operations
- Requires Review

Add a recovery record UI containing:
- Record/Batch
- Known Events
- Missing Events
- Recovery Status
- Completeness/Confidence
- Review Required

Use transparent terminology.

Do not claim a record is recovered unless the available frontend data supports it.

IN-FLIGHT OPERATIONS:

Represent active operations with:
STARTED
VALIDATED
PENDING
COMPLETED
INTERRUPTED
REQUIRES_REVIEW

If an operation is interrupted, never display it as successful.

Example:

Transfer FT-1024
Started ✓
Validated ✓
Confirmation ⚠
Status: INTERRUPTED

Actions:
Review
Continue Later
Retry only if an existing workflow supports retry

Reuse the existing IndexedDB/offline/PWA architecture if present.
Do not replace it.

PENDING OPERATIONS should be visually represented as pending until existing backend synchronization confirms persistence.

RECONCILIATION:

Show:
MATCHED
SERVER_MISSING
LOCAL_MISSING
CONFLICT
REQUIRES_REVIEW

Never automatically overwrite a conflict.

DAG/TIMELINE:

Reuse existing components.
Only add small status indicators such as:
Recovered
Missing
Requires Review

Do not replace the existing DAG or timeline.

Test:
- incident
- recovery
- partial recovery
- interrupted operation
- pending operation
- conflict

Then run:
npm run typecheck
npm run lint
npm run build

STOP after this phase.
```

### Expected result

PS-1 becomes a **disaster-recovery/continuity demonstration** rather than just an alert.

---

# PHASE 3 — PS-2 CLAIM VERIFICATION + TRACE INTEGRATION

## Goal

Add false-information verification directly into the existing public trace experience.

## Prompt

```text
Continue from the existing FarmTracer frontend.

DO NOT modify the backend.
DO NOT redesign the existing trace page.

Implement PS-2 INFORMATION / CLAIM VERIFICATION.

The existing FarmTracer trace page is the primary experience.

Add a compact "Information Verification" or "Evidence & Verification" section.

A claim may relate to:
- contamination
- cold-chain failure
- temperature excursion
- storage failure
- transport interruption
- origin
- quality
- processing
- certification
- inspection
- another traceability fact

When a claim is associated with a batch, connect it to the existing batch/trace identifier.

Use existing FarmTracer records as verification sources.

Possible sources:
Batch
Timeline
Quality
Evidence
Temperature
Cold-chain
Storage
Solar/environment
Transport
Route/location
Inspection
Certificates
DAG/lineage

Only show a source when data actually exists.

Create verification statuses:

VERIFIED
SUPPORTED
UNVERIFIED
DISPUTED
CONTRADICTED BY AVAILABLE RECORDS
INSUFFICIENT EVIDENCE

IMPORTANT:

Do NOT display:
"AI says this is false."

Prefer:
"Available records contradict this claim."
"Available evidence does not support this claim."
"Insufficient evidence to verify this claim."

Create a clean verification card:

Claim
Status
Records Checked
Evidence Available
Last Verified
Reason

Actions:
View Evidence
View Trace

Do not expose private reviewer/moderation information publicly.

Do not remove any existing trace information.

Test:
- supported claim
- contradicted claim
- disputed claim
- insufficient evidence
- missing data

Then typecheck, lint, build.

STOP after this phase.
```

### Expected result

A consumer scanning a QR code can see not only **where the batch came from**, but whether a claim about that batch is supported by the available records.

---

# PHASE 4 — PS-2 COLD-CHAIN + SOLAR/ENVIRONMENT FACT CHECK

## Goal

Use FarmTracer's existing cold-chain, temperature, storage, solar/environment, route and timeline information as **corroborating evidence** for claims.

This is the most important PS-2 addition.

## Prompt

```text
Continue from the existing FarmTracer frontend.

DO NOT modify the backend.
DO NOT replace existing temperature, solar, map, timeline, or trace components.

Extend PS-2 claim verification using existing FarmTracer condition and journey data.

COLD-CHAIN VERIFICATION:

If temperature/cold-chain data exists, show:
- Temperature history
- Recorded range
- Defined safe range IF already available
- Out-of-range periods
- Duration of excursions
- Relevant transport/storage events

Example claim:
"The cold chain was broken."

Verification factors:
Temperature
Transport Timeline
Storage Events
Quality
Evidence
Route
Inspection

For each factor show:
Available?
Observation
Relationship to claim

Example:

Temperature:
✓ Available
No recorded excursion
Contradicts the claim

Transport:
✓ Available
Continuous recorded movement
Supports trace continuity

SOLAR / ENVIRONMENT CONDITIONS:

If existing solar/environment condition data exists, include it as contextual evidence.

Examples:
- Solar conditions
- Environmental temperature
- Power state
- Storage conditions
- Environmental observations

IMPORTANT:

Solar/environment data is contextual evidence.

Do NOT claim:
"High solar exposure proves food became unsafe."

Instead:
"Environmental conditions provide context for the claim."

SHARED TIMELINE:

Where practical, visually align:
- Temperature
- Solar/environment
- Transport
- Storage
- Quality
- Evidence

along the existing batch timeline.

The user should be able to understand:
"What was happening during the period mentioned in the claim?"

EVIDENCE MATRIX:

Create a compact matrix:

Factor
Availability
Observation
Relationship

Example:

Cold Chain | ✓ | Within recorded range | Contradicts claim
Solar      | ✓ | High exposure        | Context only
Transport  | ✓ | Event recorded       | Supporting trace
Quality    | ✓ | Inspection passed    | Contradicts claim
Evidence   | ✓ | 2 records            | Supporting

DATA HONESTY:

If temperature data is missing:
"Temperature data unavailable for this period."

If solar/environment data is missing:
"Environmental data unavailable."

Never invent values.
Never infer a failure merely because data is missing.

EXISTING UI:

Reuse the existing:
- temperature graph
- solar/environment cards
- route/map
- timeline
- quality cards
- evidence cards

Do not replace them.
Add verification context around them.

Then run typecheck, lint and build.

STOP after this phase.
```

### Expected result

This gives you a strong judge-facing story:

> **A rumor is checked against the actual digital journey of the batch.**

Temperature + cold-chain + solar/environment + route + quality + evidence become a **verification evidence matrix**, rather than isolated dashboard widgets.

---

# PHASE 5 — PS-2 EXPLAINABLE EVIDENCE + REVIEW

## Goal

Make the verification explainable and add human review without turning the system into an automatic accusation engine.

## Prompt

```text
Continue from the existing FarmTracer frontend.

DO NOT modify the backend.
DO NOT redesign existing pages.

Implement the final PS-2 verification layer.

EVIDENCE VIEW:

Create an explainable evidence view:

CLAIM
 |
 +-- Batch Record
 +-- Quality
 +-- Temperature
 +-- Cold Chain
 +-- Solar/Environment
 +-- Transport
 +-- Route
 +-- Timeline
 +-- Inspection
 +-- Evidence

Reuse the existing FarmTracer DAG/visual language where appropriate.

DO NOT replace the existing lineage DAG.

EVIDENCE CARDS:

Each source should show:
- Source
- Timestamp
- Related Batch/Event
- Observation
- Relationship to Claim

Example:

Temperature Record
Observation:
No recorded excursion

Relationship:
Does not support the claim of cold-chain failure

CONFLICTS:

If sources disagree:

Show:
CONFLICT DETECTED

Source A:
Temperature record → normal

Source B:
Submitted claim → overheating

Do not automatically choose a winner without sufficient evidence.

HUMAN REVIEW:

For existing authorized roles only, provide a review interface.

Possible actions:
- Confirm
- Mark Disputed
- Request More Evidence
- Reject Claim
- Publish Correction

Do not modify backend permissions.

Do not expose moderation information to unauthorized/public users.

PUBLIC RESULT:

Public users should see:
- Claim
- Status
- Evidence summary
- Reason
- Last verification
- Authorized verification information where appropriate

SUSPICIOUS SUBMISSION SIGNALS:

If existing data supports it, surface review signals such as:
- Similar claims
- Duplicate evidence
- Clustered submissions
- Repeated target batch
- Conflicting reports

Use wording:
"Suspicious pattern detected"
"Requires review"

NEVER automatically label a person:
Fake user
Fraud
Bot

The system should flag patterns, not make unsupported accusations.

FINAL TEST:

Test:
- Supported claim
- Contradicted claim
- Disputed claim
- Insufficient evidence
- Conflicting evidence
- Missing temperature
- Missing solar/environment data
- Multiple similar submissions
- Normal submission

Then run:
npm run typecheck
npm run lint
npm run build

STOP after this phase.
```

---

# FINAL VALIDATION — RUN AFTER ALL 5 PHASES

Use this as a final audit prompt rather than another development phase.

```text
Perform a FINAL REGRESSION AUDIT of the existing FarmTracer frontend.

IMPORTANT:
DO NOT modify code until the audit is complete.

Verify all original functionality:

- Landing
- Login
- Registration
- Role-specific dashboards
- Batch creation
- Batch details
- QR generation
- QR scanning
- Public trace
- Digital batch passport
- Timeline
- DAG/lineage
- Route/map
- Quality
- Evidence
- Temperature/cold-chain
- Solar/environment conditions
- Feedback
- Offline/PWA
- Supabase integration

Verify PS-1:
- Data integrity incident
- Affected record states
- Recovery
- Partial recovery
- Unrecoverable state
- In-flight operations
- Pending operations
- Reconciliation
- Conflict state

Verify PS-2:
- Claim verification
- Evidence
- Batch linking
- Temperature verification
- Cold-chain verification
- Solar/environment context
- Quality cross-check
- Timeline cross-check
- Route cross-check
- Evidence matrix
- Evidence graph
- Conflicting information
- Human review
- Suspicious pattern signals
- Public verification result

DATA HONESTY:

No fabricated:
- temperature
- solar conditions
- weather
- GPS
- inspection
- certificates
- recovery results
- verification results

If unavailable, clearly say:
"Data unavailable."

BACKEND PROTECTION:

Confirm that no changes were made to:
- Supabase schema
- RLS
- Auth
- Storage
- RPC
- Edge Functions
- migrations
- backend APIs

Run:
npm run typecheck
npm run lint
npm run build

Return a concise report containing:
1. Existing features preserved
2. PS-1 features added
3. PS-2 features added
4. Files changed
5. Backend files untouched
6. Build/test result
7. Remaining limitations
