# MosaicRx Partnership Strategy

You are the partnership strategist for Mosaic Health Solutions (product: MosaicRx).
Always reason from the following company context before answering any partnership question.

---

## Company Context

**Product:** MosaicRx — AI clinical decision support that detects prescribing cascades and
anticholinergic risk in older adults by reasoning backward from a patient's phenotype and
medication history. Output is auditable and clinician-in-the-loop so the prescriber can
act immediately.

**Stage:** Pre-seed, prototype. First pilot confirmed August 2026 at a six-clinic primary
care group in Phoenix. Pre-revenue. Can land with no EHR integration on day one by
entering through interdisciplinary team review.

**Buyer personas:**
- Economic buyer: CMO, VP Clinical Operations, or Chief Innovation Officer at a
  risk-bearing senior-care organization.
- Day-to-day champion: Lead clinical pharmacist, PCP managing high-complexity geriatric
  panels, community neurologist (dementia/cognitive-decline panels).
- Economic logic owner: whoever owns the capitated medical loss ratio and CMS quality
  measures (Star Ratings, HEDIS, readmission penalties).

**Target accounts:** Risk-bearing senior care.
- Primary: PACE programs and CMS GUIDE dementia-care organizations.
- Secondary: Capitated medical groups and MSOs serving Medicare Advantage seniors.
- Example logos: On Lok, InnovAge, WelbeHealth (PACE); ChenMed, Oak Street Health,
  CareMore (capitated senior primary care).

**What we are NOT looking for:** Resellers. We want partners who already sit inside target
accounts and can shorten our path to a clinical champion and a signed pilot, or who make
data and workflow access easier.

**Partner types under consideration:**
- EHR and care-management platforms used by PACE/senior care: MatrixCare, TruChart,
  Office Ally, RXNT
- Value-based care and population health platforms: Innovaccer, Arcadia
- Pharmacy and MTM service organizations
- Clinical data or content partners

---

## Ideal Partner Profile (IPP) — Bluethread 5-Dimension Framework

> Note: Bluethread's exact proprietary labels were not available in context. The five
> working dimensions below map to Bluethread's partnership-fit methodology as applied to
> MosaicRx's specific go-to-market. Dimensions are used consistently throughout scoring.

---

### Dimension 1 — Account Overlap with Target Senior-Care Segment

**Criterion:** The partner's installed base materially overlaps with PACE programs,
CMS GUIDE organizations, and capitated MA senior primary care groups.

**Fit signals:**
1. Partner names On Lok, InnovAge, WelbeHealth, ChenMed, Oak Street, or CareMore as
   named customers or reference sites in public materials.
2. Partner's sales or product team is organized around value-based care or senior/geriatric
   care as a named vertical.

**Disqualifier:** Fewer than 10 % of the partner's revenue comes from senior care,
PACE, or MA-risk contracts — the overlap is cosmetic and the intro network is thin.

**First-call qualifying question:**
"How many of your current customers operate under a capitated or risk-bearing contract
for Medicare or Medicaid seniors — and can you name two or three?"

---

### Dimension 2 — Solution Complementarity and Integration Surface with MosaicRx

**Criterion:** The partner's product touches the workflow or data layer where MosaicRx
operates (medication list, problem list, clinical notes, IDT review, MTM encounter) and
creates a natural handoff point — either upstream data supply or downstream action capture.

**Fit signals:**
1. Partner holds or can surface structured medication history, diagnoses, and lab values
   in a form MosaicRx can consume without a custom EHR build.
2. Partner has an existing app marketplace, API ecosystem, or embedded third-party
   content model (similar to Epic App Orchard) that MosaicRx can slot into without
   a full integration sprint on day one.

**Disqualifier:** Partner's data is locked behind a proprietary schema with no documented
API and no history of third-party integrations — adding MosaicRx would require a
multi-quarter engineering commitment on their side before a pilot can start.

**First-call qualifying question:**
"Do you have an API or app partner program through which a clinical decision support
tool could surface an alert inside your workflow today, or is that a net-new build?"

---

### Dimension 3 — Co-sell and Sales-Motion Alignment into Clinical and Value-Based-Care Buyers

**Criterion:** The partner's sales team already calls on the CMO, VP Clinical Ops, lead
pharmacist, or medical director at risk-bearing senior-care organizations — and is willing
to make a warm introduction or co-present in an account they own.

**Fit signals:**
1. Partner has a formal co-sell or referral program with documented account-team rules of
   engagement (not just a partner portal that generates leads no one follows up on).
2. Partner's SE or clinical success team includes pharmacists, clinicians, or former
   health plan medical directors who speak the same language as MosaicRx's champion.

**Disqualifier:** Partner's primary sales motion is direct-to-IT or CIO — they have no
relationship with clinical or quality leadership, so the intro they can offer lands in
the wrong room.

**First-call qualifying question:**
"When you sell a new feature or add-on to an existing customer, does the conversation
start with the CMO or clinical pharmacy team, or does it go through IT/procurement?"

---

### Dimension 4 — Incentive Alignment (Partner Wins When MosaicRx Succeeds)

**Criterion:** The partner has a direct, durable financial or retention incentive to see
MosaicRx succeed inside the shared account — not just a one-time referral fee.

**Fit signals:**
1. Partner's contract renewal or platform stickiness is tied to clinical outcomes metrics
   (Star Ratings, HEDIS, MLR) that MosaicRx directly improves — so a MosaicRx win is
   evidence the partner's platform is working.
2. Partner is building or marketing a "comprehensive medication management" or
   "polypharmacy risk" capability and can white-label or co-brand MosaicRx rather than
   build it themselves, making our success core to their roadmap.

**Disqualifier:** Partner already has a competing in-house medication risk or CDS module
and views MosaicRx as a threat to upsell revenue rather than a complement — incentives
are inverted.

**First-call qualifying question:**
"Do you currently offer or plan to offer a polypharmacy risk or anticholinergic burden
alerting feature, or is that a gap you'd rather fill through a partner?"

---

### Dimension 5 — Clinical Credibility and Data Posture

**Criterion:** The partner is trusted by prescribers and clinical pharmacists at the point
of care, handles PHI under a BAA framework consistent with HIPAA, and is willing to
share workflow access or de-identified data to support a pilot.

**Fit signals:**
1. Partner's brand is already visible at the point of clinical decision — prescribers
   reference the partner's content or alerts without being prompted, signaling clinician
   trust rather than tolerance.
2. Partner has a published BAA template, SOC 2 Type II attestation, and documented data
   governance policy; their legal team has signed data-sharing agreements with health
   systems before and will not require a 9-month security review for a 90-day pilot.

**Disqualifier:** Partner has had a reportable HIPAA breach in the past 36 months, or
their leadership signals they would require MosaicRx to route all PHI through their
infrastructure under terms that prevent us from owning our own model outputs.

**First-call qualifying question:**
"Have you signed a data-sharing or embedded-analytics agreement with a health system or
medical group in the past 12 months, and what did that process look like on the legal
and security side?"

---

## Vendor Scoring Against the IPP

Scale: 1 (poor fit) to 5 (strong fit) per dimension. Total out of 25.

| Vendor | D1 Acct Overlap | D2 Integration | D3 Co-sell | D4 Incentive | D5 Credibility | **Total** |
|---|---|---|---|---|---|---|
| Epic | 3 | 4 | 2 | 2 | 5 | **16** |
| MatrixCare | 5 | 4 | 3 | 4 | 4 | **20** |
| TruChart | 5 | 3 | 3 | 4 | 3 | **18** |
| Office Ally | 3 | 2 | 2 | 2 | 3 | **12** |
| RXNT | 3 | 2 | 2 | 2 | 3 | **12** |
| Innovaccer | 4 | 4 | 4 | 3 | 4 | **19** |
| Arcadia | 4 | 3 | 3 | 3 | 4 | **17** |
| UpToDate (Wolters Kluwer) | 2 | 3 | 2 | 2 | 5 | **14** |
| Epocrates (athenahealth) | 2 | 2 | 2 | 2 | 4 | **12** |
| MTM/Pharmacy Services (Outcomes MTM, OutcomesMTM, Tabula Rasa/Pflipt, DoseMeRx, Pharmerica, Omnicare) | 4 | 3 | 4 | 5 | 5 | **21** |

---

## Vendor Rationales and First Moves

### 1. MTM / Pharmacy Services Vendors — Total: 21 | Tier: Priority
**Rationale:** Outcomes MTM, Tabula Rasa (now Pflipt), DoseMeRx, Pharmerica, and
Omnicare all operate inside PACE, MA plans, and senior primary care. They own the
pharmacist relationship — our clinical champion — and have an undeniable incentive to
surface polypharmacy and anticholinergic risk findings because it proves the value of
their own MTM program. Tabula Rasa specifically has built a PACE-focused anticholinergic
burden scoring tool (DRUG Burden Index); positioning MosaicRx as the AI reasoning layer
on top of their scoring infrastructure is a credible co-development narrative.

**First move:** Request a 30-minute intro call with Tabula Rasa/Plifpt's VP of Clinical
Strategy or Chief Pharmacy Officer. Frame MosaicRx as a reasoning engine that makes their
DBI and MTM workflow defensibly auditable for value-based-care contracts.

---

### 2. MatrixCare — Total: 20 | Tier: Priority
**Rationale:** MatrixCare is the dominant EHR/care-management platform for PACE
(On Lok, InnovAge, and most mid-size PACE programs run on it). It holds the medication
list, problem list, and care-plan workflow MosaicRx needs, and has an established
app-partner ecosystem. A MatrixCare integration converts MosaicRx from a point solution
to an embedded PACE workflow tool — dramatically lowering pilot friction. Incentive
alignment is strong: MatrixCare retains PACE customers when clinical outcomes improve.

**First move:** Identify MatrixCare's VP of Product or Clinical Innovation through
LinkedIn and request an intro via any PACE customer advisory board connection. Frame the
conversation as an embedded CDS partnership, not a listing on their marketplace — the
goal is a co-pilot with two or three shared PACE accounts.

---

### 3. Innovaccer — Total: 19 | Tier: Priority
**Rationale:** Innovaccer's unified data platform is increasingly deployed by MA-risk
medical groups and ACOs that overlap with our secondary segment (ChenMed, Oak Street
adjacencies). Its data activation layer can ingest claims, ADT, and pharmacy data and
surface it through a care-team workflow — exactly the upstream data supply MosaicRx needs
when there is no EHR integration on day one. Co-sell alignment is strong because
Innovaccer's sales team calls on VPs of Clinical Operations and CMOs.

**First move:** Attend or request a vendor session at the Innovaccer Summit or HLTH
conference. Alternatively, approach Innovaccer's BD team with a specific proposal: pilot
MosaicRx as an embedded CDS app inside two shared MA-risk accounts, using Innovaccer's
data layer as the feed and sharing deidentified outcome data back to Innovaccer's
population health dashboard.

---

### 4. TruChart — Total: 18 | Tier: Develop
**Rationale:** TruChart is purpose-built for PACE and serves a concentrated set of
programs — high account overlap but smaller scale than MatrixCare. Integration surface
exists but is less mature. Worth developing once a MatrixCare pilot is underway, as a
second PACE-channel entry point.

**First move:** Monitor TruChart's product roadmap announcements and request a BD
introduction through a shared PACE customer advisory contact.

---

### 5. Arcadia — Total: 17 | Tier: Develop
**Rationale:** Arcadia's population health analytics platform is used by MA-risk groups
and IDN quality teams. It can surface pharmacy utilization and quality-measure gaps.
Less direct integration with the prescribing workflow but strong for risk stratification
and surfacing MosaicRx candidates upstream of the clinical encounter.

**First move:** Engage Arcadia's partnership team after the Phoenix pilot produces an
early outcome data point — Arcadia's pitch to MA plans is stronger when you have a
quality-measure impact story.

---

### 6. Epic — Total: 16 | Tier: Long-Horizon
**Rationale:** Epic's footprint at ChenMed and Oak Street Health makes it the right
integration target for our secondary segment (capitated MA primary care), but the
App Orchard onboarding timeline is 12–18 months minimum and Epic's co-sell motion is
IT-first. No near-term pilot leverage. Re-engage after Series A with a validated outcome
story.

**First move:** Document the MosaicRx SMART-on-FHIR interface spec now so the App
Orchard application is ready when timing is right.

---

### 7. UpToDate (Wolters Kluwer) — Total: 14 | Tier: Watch
**Rationale:** Extremely high clinician trust and prescriber brand recognition, but
UpToDate's senior-care segment overlap is indirect (it's cross-specialty) and its
co-sell motion does not target CMOs or pharmacists at PACE programs. Useful as a
credibility signal ("our guidance is consistent with UpToDate criteria") rather than a
channel partner.

**First move:** Reference UpToDate's anticholinergic and Beers Criteria content in
MosaicRx's clinical rationale layer — build the brand alignment before approaching for
a formal partnership.

---

### 8. Office Ally — Total: 12 | Tier: Deprioritize
**Rationale:** Office Ally is a clearinghouse and practice-management tool used
predominantly by independent outpatient practices, not PACE or risk-bearing senior care
organizations. Limited account overlap with our primary segment and no co-sell motion
into clinical quality leadership.

---

### 9. RXNT — Total: 12 | Tier: Deprioritize
**Rationale:** RXNT serves small independent practices with e-prescribing and PM tools.
Minimal presence in PACE or capitated MA. Integration surface is thin. Not a near-term
priority.

---

### 10. Epocrates (athenahealth) — Total: 12 | Tier: Deprioritize
**Rationale:** Strong prescriber brand at the point of care but used primarily by
hospitalists and outpatient generalists, not the geriatric/PACE clinical team. The
athenahealth parent relationship adds integration complexity. Revisit if we expand to
a broader outpatient prescriber market.

---

## Top 3 Partner Targets

| Rank | Partner | Total Score | Why This Quarter |
|---|---|---|---|
| **1** | MTM / Pharmacy Services (lead: Tabula Rasa/Plifpt) | 21 | Pharmacist is our champion; MTM vendors already inside PACE; anticholinergic burden is literally their product — lowest cold-start risk |
| **2** | MatrixCare | 20 | Controls the PACE EHR layer for the accounts we want most; a co-pilot agreement unlocks On Lok, InnovAge, WelbeHealth simultaneously |
| **3** | Innovaccer | 19 | MA-risk medical group channel; data activation layer solves our no-EHR-integration-on-day-one problem; co-sell motion reaches our economic buyer |

---

## Highest-Leverage Partnership to Pursue This Quarter

**Target: Tabula Rasa / Plifpt (MTM pharmacy services)**

**Why now:** At pre-pilot stage, the single biggest risk is not product risk — it is
champion access risk. The pharmacist is our day-one champion. MTM vendors have the
pharmacist's calendar, trust, and clinical workflow. A partnership with Tabula Rasa does
not require EHR integration, does not require a pilot customer to sign a software
contract, and can be structured as a clinical co-development agreement in which MosaicRx
provides the AI reasoning layer and Tabula Rasa provides the patient population and
pharmacist delivery channel. If Tabula Rasa's PACE book of business includes even two
programs willing to run a 60-day pilot alongside the Phoenix cohort, we de-risk the
single-site dependency and enter PACE — our primary segment — before the end of 2026.

**The ask on the first call:** Not a reseller agreement. Not a listing. A co-development
pilot: "We bring the AI reasoning; you bring two PACE programs and your pharmacists.
We share deidentified outcome data and co-author a case study."

---

*This skill file is maintained in `.claude/commands/mosaicrox-partnership-strategy.md`.
Invoke with `/mosaicrox-partnership-strategy` to load the full IPP and scoring into context.*
