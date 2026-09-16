# Terra Trace: Complete Compilation of Project Prompts & Architectural Specifications

> This document contains the full chronological compilation of all 21 prompts, design directives, functional requirements, and verification tasks for the Terra Trace Forensic Platform.

---

## Prompt #1
- **Step Index**: 0
- **Timestamp**: 2026-09-15T05:10:45Z

`markdown
<USER_REQUEST>
You are building "Terra Trace" — an offline, explainable forensic-audit
platform for exam integrity. Read this whole context before writing any code.

PROJECT PHILOSOPHY:
- This is a decision-support tool, not an auto-judge. It NEVER auto-cancels
  a result or auto-flags a candidate as guilty. Every output is a weighted
  risk score + evidence, routed to a human investigator who makes the final
  call. Build this principle into the data model from day one: every flagged
  item must have a status field (Pending / Confirmed / False Positive /
  Escalated) that only a human sets.
- Deployment target is on-premise / air-gapped. Do not introduce any
  hardcoded external API calls, cloud SDKs, or telemetry in the core
  pipeline. Assume no internet access at runtime in production.

TECH STACK (locked, do not substitute):
- Backend: FastAPI (Python)
- Data processing: Polars (not Pandas — chosen for memory-mapped
  performance on large datasets on modest hardware, e.g. 8GB RAM)
- Frontend: React + TypeScript
- Charts: Plotly.js or ECharts (either is fine, pick one and stay consistent)
- State management: Zustand for fast-updating/real-time state (live risk
  scores, processing progress, threshold alerts). React Context only for
  slow-changing state (authenticated session). Do not use Redux.
- Large tables: must be virtualized (react-window or equivalent) — assume
  candidate lists can reach lakhs of rows.

DATA HONESTY RULES (critical — do not violate):
- Never fabricate realistic-looking data and label it as real. Any
  synthetic/mock dataset must be clearly tagged `is_synthetic: true` in its
  schema and visibly labeled "SIMULATED DATA" in any UI that displays it.
- Any live processing metric shown in the UI (e.g. "rows processed: X/Y")
  must reflect an actual measured value from the running pipeline — never
  a hardcoded or randomly incrementing placeholder.

WHAT WE ARE BUILDING NOW (v1 scope):
1. Reconciliation layer (raw vs. server score mismatch)
2. Macro layer (Kolmogorov-Smirnov + Kurtosis, centre-vs-national)
3. Micro layer (Omega Index + K-Index, seating-proximity-gated)
4. Investigator triage dashboard + evidence dossier export

WHAT WE ARE EXPLICITLY NOT BUILDING YET (do not implement, do not stub
elaborately — a simple disabled UI placeholder is fine if needed):
- Leak detection (correct-answer clustering or response-timing analysis)
- Year-over-year historical drift detection per centre
- Cross-exam-body data adapters beyond the one reference format we define
- Any biometric/CCTV/physical security feature
Confirm you have understood this scope boundary before starting Phase 1.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T10:40:45+05:30.
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from None to Gemini 3.7 Flash (Medium). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>
`

---

## Prompt #2
- **Step Index**: 4
- **Timestamp**: 2026-09-15T05:11:22Z

`markdown
<USER_REQUEST>
Build the ingestion and validation layer for Terra Trace.

BACKEND (FastAPI):
1. Define Pydantic schemas for three input types:
   - OMRRecord: candidate_id, centre_id, room_id, seat_number, question_id,
     selected_option, raw_score
   - ServerRecord: candidate_id, final_score, server_timestamp
   - SeatingRecord: candidate_id, centre_id, room_id, seat_number
     (this is required for the Micro layer's proximity gating — do not
     skip this even though it wasn't in the original three data types)
2. Build a `/ingest` endpoint accepting CSV/Parquet upload, parsed via
   Polars (not Pandas).
3. Implement a cryptographic checkpoint: on ingestion, compute a SHA-256
   hash of the uploaded file and store it in an audit log table
   (append-only, never updated) with timestamp and uploader identity.
4. Reject ingestion and return a clear validation error if required
   columns are missing, rather than silently proceeding with partial data.

FRONTEND (React):
1. A drag-and-drop upload zone for the three data types above, each
   clearly labeled.
2. A visual "locked shield" indicator that only turns green after the
   backend confirms hash validation succeeded — do not show it as
   green optimistically before the backend responds.
3. Local, single-admin-profile authentication only (no OAuth, no external
   identity provider — this must work fully offline). Use React Context
   for this session state specifically (not Zustand — this is the one
   piece of slow-changing state Context is appropriate for).

Do not build any analysis logic in this phase. Stop after ingestion,
validation, and the audit log are working and testable.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T10:41:22+05:30.
</ADDITIONAL_METADATA>
`

---

## Prompt #3
- **Step Index**: 131
- **Timestamp**: 2026-09-15T09:49:22Z

`markdown
<USER_REQUEST>
Build the dashboard where a human investigator reviews flagged results.

BACKEND:
- A `/queue` endpoint returning flagged centres/candidates sorted by
  combined weighted risk score, paginated (do not return the full
  dataset in one response — assume lakhs of candidates).
- A `/decision` endpoint (POST) allowing an investigator to set a flagged
  item's status to Confirmed / False Positive / Escalated, with a
  required free-text justification field and the investigator's identity
  and timestamp logged immutably. This endpoint is the concrete
  implementation of "never auto-cancels" — it must be the ONLY way a
  flagged item's status changes.

FRONTEND:
- A national/state/city/centre heatmap visualizing risk concentration.
  Use whichever charting library was chosen in the master context
  (Plotly.js or ECharts) — stay consistent.
- A virtualized data table (react-window) as the main action queue,
  sorted by risk score, NOT rendering all rows into the DOM at once.
- On each row, expose the three decision buttons (Confirmed / False
  Positive / Escalated) directly — this must be a visible, one-click
  action, not buried in a secondary view. This is the single most
  important UI element in the whole product: it's the proof that a
  human, not the algorithm, makes the final call.
- Use Zustand for the queue's live state (it updates as new results
  come in and as investigators make decisions) — do not use Context
  here, per the master state-management rule.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T15:19:22+05:30.
</ADDITIONAL_METADATA>
`

---

## Prompt #4
- **Step Index**: 193
- **Timestamp**: 2026-09-15T09:55:33Z

`markdown
<USER_REQUEST>
Build the per-candidate/per-centre drill-down view and its PDF export.

FRONTEND (drill-down view):
- Macro visual: overlapping bell curves (flagged centre vs. national
  baseline), rendered with the chosen chart library, using the real
  computed distributions from Phase 2 — not illustrative/dummy curves.
- Micro visual: a spatial seating chart (grid layout based on
  SeatingRecord) with flagged candidate pairs visually connected or
  highlighted.
- Reconciliation visual: a side-by-side raw-score vs. server-score table
  for the specific candidate, with a clear "TAMPER DETECTED" badge only
  shown when `tamper_flag` is true for that record.

BACKEND (export):
- A `/dossier/{candidate_id_or_centre_id}` endpoint that renders the
  above three visuals plus the investigator's decision history into a
  single one-page PDF. Use a Python PDF library compatible with an
  offline/air-gapped environment (e.g. WeasyPrint or ReportLab — pick
  one, avoid anything requiring an external rendering service).
- The exported PDF must include the audit log hash from Phase 1,
  so the document is independently verifiable against the original
  ingested data.

Stop here. Do not begin any Phase-2-listed "out of scope" item
(leak detection, historical drift, cross-exam adapters) unless
explicitly instructed in a new prompt.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T15:25:33+05:30.
</ADDITIONAL_METADATA>
`

---

## Prompt #5
- **Step Index**: 243
- **Timestamp**: 2026-09-15T10:01:35Z

`markdown
<USER_REQUEST>
Do NOT write new features in this phase. This phase is testing only.

1. Ingest the WBSSC (Calcutta HC-released) dataset. Confirm the
   Reconciliation layer correctly flags the known manipulated-score
   cases (scores bumped from single digits to just above cutoff).
2. Ingest the NEET-UG 2024 centre-wise dataset (from Dataful.in).
   Confirm the Macro layer independently flags the Haryana six-topper
   centre and the Rajkot centre as statistically anomalous, without
   being told in advance which centres to look for.
3. Generate synthetic candidate-response data in the same structure the
   R package "CopyDetect" expects (N candidates x n items, dichotomously
   scored 0/1, with seating metadata). Confirm the Micro layer's Omega
   and K-Index implementations produce values consistent with published
   examples from the Wollack (1997) and Holland (1996) papers — this is
   how you validate a from-scratch implementation against literature
   without a reference library to compare against directly.
4. Document all three results (pass/fail, actual computed values) in a
   VALIDATION.md file. Any discrepancy from expected results must be
   investigated before claiming the layer works — do not adjust
   thresholds just to make a test pass without understanding why.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T15:31:35+05:30.
</ADDITIONAL_METADATA>
`

---

## Prompt #6
- **Step Index**: 281
- **Timestamp**: 2026-09-15T10:04:41Z

`markdown
<USER_REQUEST>
Only after Phases 1-5 are complete and validated. Add a disabled,
clearly-labeled UI section titled "Future Scope" listing:
- Leak Detection (correct-answer clustering)
- Response-Time Anomaly Detection (CBT-only)
- Year-over-Year Historical Drift per Centre
- Cross-Exam-Body Data Adapters

These should be non-functional placeholders (greyed out, "Coming Soon")
— do not build partial/fake versions of these features. The point of
this phase is honest scope communication for a demo, not functionality.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T15:34:41+05:30.
</ADDITIONAL_METADATA>
`

---

## Prompt #7
- **Step Index**: 300
- **Timestamp**: 2026-09-15T10:12:30Z

`markdown
<USER_REQUEST>
Run a full verification pass on Terra Trace. For each numbered item below,
execute the described check, show the actual output, and explicitly state
PASS or FAIL. Do not skip an item because it "looks correct" from reading
the code — run it.

=== PHASE 1: INGESTION & VALIDATION ===

1. Ingest a valid sample file for each of the three schemas (OMRRecord,
   ServerRecord, SeatingRecord). Confirm all three succeed and appear in
   the audit log.

2. Ingest a file with a missing required column. Confirm the API returns
   a clear validation error and does NOT partially ingest the file.
   Show the actual error response.

3. Re-ingest the same file twice. Compute its SHA-256 hash independently
   (e.g. via `sha256sum` in a shell command) and confirm it matches the
   hash stored in the audit log both times. Confirm the audit log has
   TWO entries, not one overwritten entry — it must be append-only.

4. Attempt to directly modify or delete a row in the audit log table via
   any exposed endpoint. Confirm no such endpoint exists. This is a
   design requirement, not optional — the audit log must be provably
   immutable through the API surface.

=== PHASE 2: AUDIT ENGINE ===

5. Run the Reconciliation layer against a small test set containing at
   least one deliberate raw-vs-server mismatch you construct yourself.
   Confirm it is flagged with `tamper_flag: true` and the discrepancy
   values shown match what you input.

6. Run the Macro layer against a test set where one centre's scores are
   constructed to be obviously abnormal (e.g. all scores identical and
   far above the rest). Independently compute the KS statistic and
   kurtosis for that same data using a plain scipy script (not the
   app's code) and confirm the app's output numbers match. This checks
   for a real computation, not a hardcoded/mocked response.

7. Run the Micro layer on synthetic paired data with a known, deliberately
   constructed high-similarity pair. Confirm:
   a) The Omega 
<truncated 3138 bytes>
L-DATA VALIDATION ===

18. Re-run the WBSSC dataset validation from Phase 5 of the build spec.
    Paste the actual list of candidates flagged by the Reconciliation
    layer and confirm it matches the publicly reported manipulated cases.

19. Re-run the NEET-UG 2024 centre-wise dataset. Confirm the Rajkot
    centre and the Haryana six-topper centre appear in the flagged
    output, and show their actual computed KS/kurtosis values.

20. Open VALIDATION.md (produced in build Phase 5). Confirm it documents
    actual pass/fail results with real numbers, not placeholder text.

=== DATA HONESTY CHECKS (run these regardless of phase) ===

21. Search the entire codebase and database schema for any field or UI
    label indicating synthetic data. Confirm every synthetic dataset used
    anywhere in the system is tagged `is_synthetic: true` and that any
    screen displaying it shows a visible "SIMULATED DATA" label.

22. Search the frontend code for the live "rows processed" counter from
    Phase 2. Confirm it is wired to an actual progress value from the
    backend pipeline (e.g. via WebSocket or polling an endpoint that
    reports real progress) and is not a client-side setInterval fake
    counter. Show the relevant code.

23. Confirm no hardcoded API keys, cloud SDK calls, or external network
    requests exist anywhere in the core pipeline code (grep for
    `requests.get`, `fetch(`, `axios`, or similar outbound calls outside
    of the local API). This is required for the offline/air-gapped claim
    to be true, not just stated.

=== FINAL OUTPUT ===

Produce a single VERIFICATION_REPORT.md listing all 23 items, each with
PASS/FAIL and the actual evidence (output, numbers, or code snippet) used
to decide. Any FAIL must include what specifically broke — do not mark
something "PASS with minor issues." A failed check stays failed until
re-verified after a fix.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T15:42:30+05:30.
</ADDITIONAL_METADATA>
`

---

## Prompt #8
- **Step Index**: 410
- **Timestamp**: 2026-09-15T10:25:26Z

`markdown
<USER_REQUEST>
run this thing
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T15:55:26+05:30.
</ADDITIONAL_METADATA>
`

---

## Prompt #9
- **Step Index**: 420
- **Timestamp**: 2026-09-15T10:39:16Z

`markdown
<USER_REQUEST>
Restyle the Terra Trace frontend and integrate the attached Aurora
component, as described below.

═══════════════════════════════════════
PART 1 — DESIGN SYSTEM (applies to every screen except the login screen)
═══════════════════════════════════════

This tool is used by a government exam-body investigator reviewing case
files. It should look like an official register, not a startup dashboard.

Colors (set these as CSS variables, use everywhere — don't hardcode hex
values inside components):
  --navy:   #0B1F3A   → headers, primary buttons, active nav item
  --paper:  #F7F5F0   → page background
  --surface:#FFFFFF   → table/panel backgrounds
  --ink:    #1A1A1A   → body text
  --grey:   #5C6670   → secondary text, table dividers
  --red:    #8A1538   → "Confirmed / Tamper detected" status only
  --brass:  #C9A227   → "Pending review" status only

Fonts:
  Headers/titles → "Source Serif 4" (or Georgia if unavailable)
  Everything else (labels, tables, buttons, body) → "IBM Plex Sans"
  IDs, hashes, timestamps only → "IBM Plex Mono"

Layout: fixed left sidebar (Ingestion / Pipeline / Queue / Dossier /
Audit Log) + left-aligned content area. No centered sections.

Components:
- No rounded cards, no drop shadows, no gradients anywhere.
- Every panel = white background, 1px solid grey border, max 2px corner
  radius.
- Tables use thin grey divider lines between rows, not zebra striping.
- Status always shows as a solid colored badge with the word on it
  (sentence case, e.g. "Pending review") — never a colored dot alone.
- Buttons: rectangular, max 2px radius. Primary = solid navy, white text.
  Secondary = navy outline, navy text, no fill.
- Remove every decorative icon that isn't functional. Keep only: the
  hash-validation shield, the 3 pipeline-layer icons, the tamper badge
  ico
<truncated 1405 bytes>
se the alpha multiplier
   slightly (currently 0.35) until it reads clearly. Keep everything
   else in the shader code unchanged.

2. Turn it down a notch so it feels ambient, not flashy:
   amplitude: 0.4, blend: 0.7 (down from the current 0.6 / 0.85)

3. Make it stop wasting resources when not needed:
   - Pause the animation completely when the browser tab is hidden
     (use the Page Visibility API), and resume when it's visible again.
   - If the user's OS has "reduce motion" turned on, skip WebGL entirely
     and just show the existing static fallback gradient.

4. Placement: Aurora is the full-screen background of the login screen
   only. Do not add it to any other screen. The login panel itself
   (username, sign-in button) sits on top of it and follows Part 1's
   design system exactly — white panel, grey border, navy button. Don't
   let Aurora's colors bleed into the panel's own styling.

═══════════════════════════════════════
VERIFICATION
═══════════════════════════════════════

- Screenshot all 5 main screens (Ingestion, Pipeline, Queue, Dossier,
  Audit Log) and the login screen. Confirm the 5 main screens have no
  rounded cards, no shadows, no gradients, no stray icons — and the
  login screen shows the aurora behind a clean login panel.
- Switch tabs away from the login screen for 10 seconds, come back, and
  confirm the aurora animation actually paused and resumed (check the
  browser's performance/GPU activity, not just visually).
- Turn on "reduce motion" in OS settings, reload the login screen, and
  confirm only the static fallback gradient shows — no WebGL running.
- Confirm no backend endpoint, API contract, or data model changed —
  this should be a pure styling/frontend commit.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T16:09:16+05:30.
</ADDITIONAL_METADATA>
`

---

## Prompt #10
- **Step Index**: 551
- **Timestamp**: 2026-09-15T11:03:53Z

`markdown
<USER_REQUEST>
I reviewed screenshots of the running app and found real problems to fix.
Do not do a cosmetic pass only — items 1 and 2 below are functional bugs
that undermine the product's core claim, fix those first.

═══════════════════════════════════════
PART 1 — FUNCTIONAL BUGS (fix these first, they are not styling issues)
═══════════════════════════════════════

1. THE RISK QUEUE IS NOT ACTUALLY TRIAGING.
   Currently all 2,000 flagged entities show status "Pending review" with
   composite risk scores clustered around 26-27 out of 100. If every
   record ends up flagged and scores don't spread out meaningfully, the
   whole point of the product — "here are the 20 cases to check today,
   not all 2,000" — is broken.
   - Check the threshold constants for the macro (KS statistic) and
     micro (Wollack/Holland) layers. If they're too permissive, tighten
     them so only genuinely anomalous cases cross the flag threshold.
   - Confirm the composite risk score formula is actually differentiating
     cases, not producing a narrow, similar score for everything. Test
     with the real WBSSC and NEET-UG 2024 datasets specifically (already
     validated in an earlier build phase) and confirm the known anomalous
     cases (e.g. the Haryana six-topper centre) score meaningfully higher
     than baseline cases — if they don't, the scoring logic itself has a
     bug, not just the threshold.
   - After fixing, most of the 2,000-candidate synthetic set should NOT
     end up in the flagged queue — only a genuinely small, distinguishable
     subset should. If the synthetic test data itself doesn't have that
     kind of variation built in, regenerate it so that it does (mix of
     clearly normal cases and clearly anomalous ones), so the fix is
     actually testable.

2. THE RISK HEATMAP SHOWS NO VARIATION.
   Eve
<truncated 2670 bytes>
es neighbouring candidates' wrong answers. Flags
     pairs with suspiciously matching mistakes."
   Put the actual formula and statistical methodology behind a
   "Technical details" expand/collapse control on each layer card, off
   by default. Don't delete the formulas — investigators or technical
   judges may want them — just don't show them by default.

6. REMOVE REPEATED FOOTER TRIVIA FROM EVERY CARD.
   "AIR-GAPPED COMPATIBLE • POLARS MULTI-THREADED" (or similar technical
   trivia) currently repeats identically on multiple cards. State this
   once, in a single place (e.g. a small line in the page footer or an
   "About this system" panel), not stamped on every individual card.

7. GENERAL RULE FOR THIS PASS: if a piece of text or a badge doesn't
   change what the investigator does next, remove it or move it out of
   the primary view. The primary screen should only show what's needed
   to decide "does this need my attention, yes or no" — supporting
   detail belongs one click away, not stacked on the main view.

═══════════════════════════════════════
VERIFICATION
═══════════════════════════════════════

- Re-run the WBSSC and NEET-UG 2024 datasets through the fixed pipeline.
  Confirm the queue now shows a small, distinguishable set of high-risk
  cases rather than a uniform mass, and paste the actual before/after
  score distributions.
- Screenshot all 5 main screens again after the simplification pass.
  Count the number of distinct badges/labels visible on the Ingestion
  screen's first card and confirm it's reduced from 7 to 3 or fewer.
- Confirm the heatmap shows at least one block in each of the three
  legend colors.
- Confirm the top bar is now present and identical across all 5 screens.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T16:33:53+05:30.
</ADDITIONAL_METADATA>
`

---

## Prompt #11
- **Step Index**: 635
- **Timestamp**: 2026-09-15T11:24:37Z

`markdown
<USER_REQUEST>
Do the following two things only. Do not restyle or change any UI
components in this pass.

═══════════════════════════════════════
STEP 1 — FULL RESET
═══════════════════════════════════════

Add a single "Reset system" action (admin-only, behind a confirmation
step so it can't be triggered accidentally) that:
- Clears all ingested OMRRecord, ServerRecord, and SeatingRecord data
- Clears all computed flags/risk scores from all three layers
- Clears the investigator queue entirely
- Clears the audit log entirely
- Does NOT delete or modify any code, schema, or configuration — only
  data

Run this reset now, so the app starts from a genuinely empty state:
zero ingested files, zero flagged entities, zero audit log entries.
Confirm this with a screenshot of the Ingestion, Queue, and Audit Log
screens all showing empty states after reset.

═══════════════════════════════════════
STEP 2 — ORGANIZE DATA INTO TWO CLEAR SETS
═══════════════════════════════════════

Create two clearly separated folders/directories in the project:

  /data/real/
    wbssc_omr_scores.csv        (candidate_id, raw_score)
    wbssc_server_scores.csv     (candidate_id, final_score, server_timestamp)
    neet2024_centre_results.csv (candidate_id, centre_id, score)

  /data/synthetic/
    synthetic_omr_responses.csv   (candidate_id, centre_id, room_id,
                                    seat_number, question_id, selected_option,
                                    raw_score)
    synthetic_seating_layout.csv  (candidate_id, centre_id, room_id,
                                    seat_number)

For the synthetic set specifically: regenerate it so it clearly contains
BOTH normal ca
<truncated 651 bytes>
e same check for the real datasets: confirm the WBSSC file actually
contains the known manipulated-score cases (scores originally 1-2, bumped
to just above cutoff) and the NEET-UG 2024 file actually contains the
Haryana six-topper centre and Rajkot centre as identifiable centre_ids.

Add a plain-text README.md inside each folder stating clearly:
  /data/real/README.md → "These are real, publicly released or
    court-verified datasets. Source: [WBSSC Calcutta HC release /
    NEET-UG 2024 centre-wise data via Dataful.in]. No modifications
    beyond column renaming for schema compatibility."
  /data/synthetic/README.md → "This is simulated data, generated to test
    the Micro layer, because no Indian exam body has publicly released
    real item-level candidate response data. Structured to match the
    format used by open-source psychometric research tools (CopyDetect,
    sirt). Contains a deliberate mix of normal and anomalous cases for
    testing purposes."

═══════════════════════════════════════
VERIFICATION
═══════════════════════════════════════

- Confirm the app is fully empty after reset (screenshot all 5 screens).
- Ingest all 5 files from /data/real/ and /data/synthetic/ one at a time.
  After each ingestion, confirm the audit log shows exactly one new entry
  per file, with the correct row count and a real SHA-256 hash.
- Run all three layers against this freshly ingested data. Report the
  actual number of entities flagged by each layer (not a hardcoded/mock
  number) — this should now be a small, clearly explainable set, not a
  mass flag of everything.
- Do NOT proceed to any UI restyling in this pass. Stop after data is
  reset, organized, ingested, and layer outputs are confirmed reasonable.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T16:54:37+05:30.
</ADDITIONAL_METADATA>
`

---

## Prompt #12
- **Step Index**: 753
- **Timestamp**: 2026-09-15T11:28:52Z

`markdown
<USER_REQUEST>
proceed
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T16:58:52+05:30.
</ADDITIONAL_METADATA>
`

---

## Prompt #13
- **Step Index**: 808
- **Timestamp**: 2026-09-15T11:30:40Z

`markdown
<USER_REQUEST>
proceed
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T17:00:40+05:30.
</ADDITIONAL_METADATA>
`

---

## Prompt #14
- **Step Index**: 836
- **Timestamp**: 2026-09-15T11:35:00Z

`markdown
<USER_REQUEST>
proceed
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T17:05:00+05:30.
</ADDITIONAL_METADATA>
`

---

## Prompt #15
- **Step Index**: 856
- **Timestamp**: 2026-09-15T11:39:13Z

`markdown
<USER_REQUEST>
Add a "Detection Result" panel for each of the three layers, shown after
a dataset has been ingested and processed. This is the single most
important screen for a demo — it must be immediately understandable to
someone who has never seen the app before, with zero formulas visible by
default.

Each panel follows this exact structure, no more, no less:

  [Layer name, plain language]
  [One sentence: what it checks]
  [One sentence: what it found, with real numbers]
  [A short, specific list of what was flagged, in plain language]
  [A "View technical details" link, collapsed by default]

═══════════════════════════════════════
LAYER 1 — RECONCILIATION
═══════════════════════════════════════

Panel content (using the real WBSSC data ingested in the previous pass):

  Heading: "Reconciliation Check"
  What it checks: "Compares each candidate's original recorded score to
    their final published score."
  What it found: "Checked [X] candidates. Found [Y] cases where the
    published score does not match the original score."
  Flagged list: show the actual flagged candidates as a simple table —
    Candidate ID | Original score | Published score | Difference
    (pull real numbers from the actual WBSSC data, not placeholders)
  Technical details (collapsed): show the raw discrepancy values and the
    zero-tolerance threshold used.

═══════════════════════════════════════
LAYER 2 — MACRO
═══════════════════════════════════════

Panel content (using the real NEET-UG 2024 data):

  Heading: "Centre Pattern Check"
  What it checks: "Compares each exam centre's score pattern to the
    national pattern."
  What it found: "Checked [X] centres. Found [Y] centres whose results
    don't statist
<truncated 1420 bytes>
o the
    synthetic dataset in the previous pass)
  Technical details (collapsed): show the actual Omega Index and K-Index
    values computed for each flagged pair.

═══════════════════════════════════════
GENERAL RULES FOR THIS SCREEN
═══════════════════════════════════════

- No formulas, no statistical jargon, no multi-badge clutter anywhere in
  the default (collapsed) view. If someone unfamiliar with statistics
  reads only the "what it found" sentence and the flagged list, they
  should fully understand what happened.
- Every number shown must come from an actual computation on the ingested
  data — never a hardcoded or illustrative placeholder number.
- Keep the real-data layers (1 and 2) and the simulated-data layer (3)
  visually distinguishable — e.g. layer 3's panel could have a slightly
  different header treatment or the visible note described above — so
  it's never ambiguous which results are real and which are simulated.

═══════════════════════════════════════
VERIFICATION
═══════════════════════════════════════

- Screenshot all three Detection Result panels after running the real
  and synthetic datasets from the previous pass.
- Confirm Layer 1's flagged list matches the actual manipulated WBSSC
  cases.
- Confirm Layer 2's flagged list includes the Haryana six-topper centre
  and Rajkot centre.
- Confirm Layer 3's flagged list matches the deliberately-anomalous pairs
  built into the synthetic dataset, and that the simulated-data notice is
  clearly visible on that panel.
- Confirm no formula or technical jargon is visible until "View technical
  details" is clicked.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T17:09:13+05:30.
</ADDITIONAL_METADATA>
`

---

## Prompt #16
- **Step Index**: 913
- **Timestamp**: 2026-09-15T11:42:46Z

`markdown
<USER_REQUEST>
PROCEED
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T17:12:46+05:30.
</ADDITIONAL_METADATA>
`

---

## Prompt #17
- **Step Index**: 926
- **Timestamp**: 2026-09-15T11:57:47Z

`markdown
<USER_REQUEST>
The previous fix did not work. Symptom: after running "Reset system" and
reloading the app, the Audit Log is completely empty (zero entries,
confirming nothing has been ingested), but the Queue screen still shows
flagged candidate/centre entries and layer output. This is a contradiction
— if nothing was ingested, the queue must be empty too. Find the actual
root cause. Do not just remove more frontend code and report success —
prove where this data is actually coming from.

Do this in exact order:

1. OPEN BROWSER DEV TOOLS → NETWORK TAB.
   Reload the Queue screen and find the actual network request it makes
   (e.g. GET /queue or similar). Show me the exact raw JSON response body
   from that request. This tells us immediately whether:
   (a) the backend API itself is returning data even though nothing was
       ingested — meaning the bug is server-side, or
   (b) the API correctly returns an empty array, but the frontend is
       still rendering old data anyway — meaning it's a frontend state/
       cache bug that survives a page reload (e.g. localStorage,
       sessionStorage, or a Zustand store with `persist` middleware
       saving state to browser storage).

2. IF THE API ITSELF RETURNS DATA (case a):
   - Check the backend database directly (not through the app) —
     query the actual table(s) backing the /queue endpoint. Confirm
     whether rows genuinely exist in the database right now.
   - If rows exist: check what "Reset system" actually does at the
     database level. It's likely only clearing some tables, not all of
     them, or it's clearing a table that the /queue endpoint doesn't
     even read from. Find the exact mismatch.
   - Also check whether the backend has a database seed/migration script
     that runs automatically on server startup and re-inserts sample
     data every time the backend restarts — this is a common cause of
     "reset doesn't stick." If found, this seed script must not run
     automatically in a way that repopulates data after a manual reset.

3. IF THE API RETURNS EMPTY BUT THE UI STILL SHOWS DATA (case b):
   - Check for `persist` middleware on any Zustand store related to the
     queue, or any direct use of localStorage/sessionStorage/IndexedDB
     in the frontend. Browser storage survives a page reload even when
     the backend is genuinely empty — this would explain exactly this
     symptom.
   - Clear all browser storage for this app's origin manually (Application
     tab → Clear site data) and reload. If the queue is now empty, this
     confirms browser-side persisted state was the cause. Remove the
     `persist` behavior (or scope it only to things that should survive
     a reload, like the login session — never flagged case data).

4. REGARDLESS OF WHICH CASE IT IS, FIX THE ROOT CAUSE, THEN RE-TEST:
   - Run "Reset system"
   - Fully close and reopen the browser (not just reload the tab)
   - Load the Queue screen
   - Confirm it is genuinely empty, and confirm this by showing the raw
     network response again, not just a screenshot of the UI

5. Report back explicitly:
   - Which case it was (a or b, or both)
   - The exact file/line/table where the phantom data was coming from
   - What you changed to fix it
   - The raw network response proving the queue is now actually empty
     after reset

Do not mark this resolved without showing that raw network response.
A screenshot of an empty-looking UI is not sufficient proof — the UI
could still be caching something visually while an API call fails
silently. Show the actual JSON.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T17:27:47+05:30.
</ADDITIONAL_METADATA>
`

---

## Prompt #18
- **Step Index**: 973
- **Timestamp**: 2026-09-15T12:05:04Z

`markdown
<USER_REQUEST>
CONFIRMED ROOT CAUSE: The Pipeline/Detection Results screen is reading
dataset files directly from the filesystem (/data/real/, /data/synthetic/)
and running the three analytical layers on them directly — bypassing the
/ingest endpoint, the SHA-256 hash checkpoint, and the audit log entirely.
This breaks the core product guarantee stated on the Ingestion screen
itself: "every ingested file is hashed... and committed immutably to the
append-only audit log" before any analysis is permitted. Right now that
is not true — analysis is happening on files that were never hashed or
logged.

FIX REQUIRED (architectural, not cosmetic):

1. Find every place in the backend where the Macro, Micro, or
   Reconciliation layers read data. Confirm whether any of them read
   directly from a file path (e.g. `pd.read_csv("/data/real/...")` or
   `pl.read_csv(...)` pointing at a hardcoded path) instead of reading
   from the database/store that the /ingest endpoint writes to.

2. Remove ALL direct file-path reads from the analytical layer code.
   The three layers must ONLY ever operate on records that exist in the
   backend's actual ingested-data store — the same store that /ingest
   writes to and that the audit log references. There must be exactly
   one path data can take to reach the analytical layers: upload → hash
   → validate → store → THEN available for analysis. No shortcuts.

3. If /data/real/ and /data/synthetic/ files should still exist as
   ready-to-use sample files for convenience, that's fine — but they
   must require an actual upload/ingest action (the same one a user
   would perform through the Ingestion screen's UI) before their data
   is available anywhere else in the app. Consider adding a "Load sample
   dataset" button on the Ingestion screen that runs these files through
   the REAL /ingest endpoint (hash + audit log + validation, all of it)
   rather than just displaying their contents — this gives you a fast
   demo path without breaking the chain-of-custody guarantee.

4. After this fix, re-run the full reset:
   - Reset system
   - Confirm Pipeline/Detection Results screen shows "No data processed
     yet" for all three layers (not the WBSSC results) — this is the
     correct state now, since nothing has been properly ingested
   - Then use the "Load sample dataset" button (or manually upload
     through the Ingestion screen) to bring in the WBSSC file
   - Confirm the Audit Log NOW shows a real entry for that file, with a
     real hash and timestamp
   - Confirm the Pipeline screen NOW shows results, and that they appear
     only after that ingestion event, not before

5. Do the same check for the NEET-UG 2024 and synthetic datasets — no
   layer should show any result for a dataset that doesn't have a
   corresponding entry in the Audit Log.

VERIFICATION:
- Show me the specific file and line(s) where the direct file-path read
  was happening — I want to see the actual root cause, not just "fixed."
- After the fix, screenshot the Pipeline screen immediately after reset
  (should show "No data processed yet" for all 3 layers) and again after
  ingesting one file through the proper flow (should show real results
  for that layer only, with a matching Audit Log entry).
- Confirm this rule holds for all three layers and all datasets, not
  just WBSSC.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T17:35:04+05:30.
</ADDITIONAL_METADATA>
`

---

## Prompt #19
- **Step Index**: 1141
- **Timestamp**: 2026-09-15T14:53:07Z

`markdown
<USER_REQUEST>
OK NOW CAN YOU GIVE ME THE CLEANED DATA SO I CAN INGEST THAT AND FIND ...
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T20:23:07+05:30.
</ADDITIONAL_METADATA>
`

---

## Prompt #20
- **Step Index**: 1149
- **Timestamp**: 2026-09-15T15:54:34Z

`markdown
<USER_REQUEST>
reun the project
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T21:24:34+05:30.
</ADDITIONAL_METADATA>
`

---

## Prompt #21
- **Step Index**: 1160
- **Timestamp**: 2026-09-15T15:57:14Z

`markdown
<USER_REQUEST>
can you give me a compiled file of all the prompt of the project
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-15T21:27:14+05:30.
</ADDITIONAL_METADATA>
`

---

