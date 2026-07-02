# Tekton Plugin — `dev/index` Upgrade Discussion

**Purpose:** Decide whether to invest in upgrading the Tekton plugin dev setup with a **lightweight integration backend** (real Kubernetes), following the pattern proposed in [community-plugins PR #8523](https://github.com/backstage/community-plugins/pull/8523) (Topology workspace).

**Meeting goal:** Confirm as a team whether the **cost** (harder UI verification, complex integration data prep, ongoing maintenance) is justified by the **payback**, or whether **mock dev + RHDH validation** is sufficient.

**Audience:** Tekton plugin maintainers  
**Status:** Discussion draft — decision required before implementation

---

## Decision We Need to Make

Should we add integration-mode dev to `plugins/tekton` (lightweight backend + real cluster), in addition to the current mock-based `dev/index.tsx`?

| Option                                 | Summary                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------- |
| **A. Stay mock-only**                  | Keep current `dev/index.tsx` with fixtures; validate real-cluster behavior on **RHDH**      |
| **B. Add integration mode (additive)** | Mock remains default for UI; optional `tekton-dev-backend` + cluster for wiring smoke tests |
| **C. Full integration-first**          | Make real backend the primary dev path ( **not recommended** — see costs below)             |

---

## Current State (Tekton Plugin Only)

Today, all meaningful UI development happens in **`plugins/tekton/dev/index.tsx`**:

- `createDevApp()` + `TestApiProvider`
- `MockKubernetesClient` → fixture `__fixtures__/1-pipelinesData.ts`
- `MockKubernetesProxyApi` → logs, ACS/EC scan output for expanded rows
- Route `/tekton`, entity with `tekton.dev/cicd` annotation

```
TektonCI → PipelineRunList → useTektonObjectsResponse → useKubernetesObjects(entity)
```

The Pipeline Runs table UI is the same regardless of data source; only the Kubernetes API layer changes (mock vs real).

**What mock dev gives us today (zero cluster setup):**

| UI surface             | Fixture coverage                                                  |
| ---------------------- | ----------------------------------------------------------------- |
| Pipeline status        | Failed, Succeeded, Running rows in one view                       |
| Vulnerabilities column | Fixed critical/high/medium/low counts                             |
| Task status bars       | Multiple TaskRuns per PLR, varied states                          |
| Signed badge           | `chains.tekton.dev/signed` on a specific row                      |
| Expanded row           | Pod logs, Enterprise Contract, ACS scan fixtures                  |
| Playwright e2e         | Stable, deterministic (`playwright.config.ts` → `plugins/tekton`) |

---

## What Integration-Mode Upgrade Would Mean

Following Topology PR #8523, we would add something like `plugins/tekton-dev-backend` wiring:

- `@backstage/plugin-kubernetes-backend`
- `@backstage/plugin-auth-backend` (+ guest)
- `@backstage/plugin-permission-backend`

And split start scripts:

```
yarn start:mock         → current dev/index.tsx (fixtures) — UI default
yarn start:integration  → dev backend + app-config cluster — opt-in
```

Tekton is **heavier than Topology** because the table also needs `kubernetesProxyApiRef` (logs, scan output), `permissionApiRef`, and `kubernetesAuthProvidersApiRef`. A minimal K8s-listing backend alone does not exercise the full plugin surface.

---

## Costs (Why This Hurts Day-to-Day Work)

### 1. UI manual verification becomes harder

Mock dev is a **curated UI test matrix** — one screen shows every status variant, vulnerability count, and task bar state we care about.

Real cluster data is **not designed for UI coverage**:

| UI surface      | Mock dev                  | Typical real cluster                             |
| --------------- | ------------------------- | ------------------------------------------------ |
| Pipeline status | All variants side by side | Often one state at a time                        |
| Vulnerabilities | Always populated          | Empty without scan tasks + `SCAN_OUTPUT` results |
| Task bars       | Stable, linked TaskRuns   | Only while pipelines are running                 |
| Signed badge    | Always on one row         | Requires Tekton Chains                           |
| Expanded row    | Fixture logs/scans        | Requires live pods + proxy path                  |

**Every UI change** (layout, styling, columns, dialogs) is faster to verify against mock. Integration mode answers a different question: _“does data flow from a real API?”_ — not _“does every visual state render correctly?”_

### 2. Integration data preparation is complicated

Even a basic real-cluster table (Tier 1) requires:

1. Tekton Pipelines installed on a reachable cluster
2. ServiceAccount + [ClusterRole](https://github.com/backstage/community-plugins/blob/main/workspaces/tekton/plugins/tekton/manifests/clusterrole.yaml)
3. `app-config` cluster locator + credentials
4. Entity + PipelineRun labels matching `backstage.io/kubernetes-id`
5. Running/failing pipelines to get mixed statuses

**Effort:** ~half a day per developer who wants integration mode, assuming cluster already exists.

Richer UI features (Tier 2 — vulnerabilities, signing, SBOM, expanded scans):

| Feature                | Real cluster requirement                                 |
| ---------------------- | -------------------------------------------------------- |
| Vulnerabilities column | Scan task writing `SCAN_OUTPUT` JSON in `status.results` |
| Signed badge           | Tekton Chains configured                                 |
| Expanded row (EC/ACS)  | Real pods + proxy reading task output                    |

**Effort:** Days to weeks; depends on security-scanning CI already in place.

Exact mock reproduction (Tier 3): handcrafted YAML / status patching — fragile, poor ROI for daily dev.

**Label mismatch note:** Mock entity uses `backstage.io/kubernetes-id: backstage`, but fixture PLRs use `test-backstage`. Mock ignores this; a real cluster would show **no rows** unless labels are aligned.

### 3. Ongoing maintenance burden

- Two dev paths to keep working (mock + integration)
- Cluster config drift across contributors
- Integration mode breaks when cluster credentials expire or pipelines are cleaned up
- Fixtures must still be maintained for UI/e2e regardless

### 4. Limited payoff for our primary workflow

Most Tekton plugin changes in this repo are **UI and frontend logic**. Integration mode does not accelerate that work — it adds setup before the first visual check.

---

## Payback (What We Would Gain)

| Benefit                                                      | Who benefits                               | How much it matters to us                            |
| ------------------------------------------------------------ | ------------------------------------------ | ---------------------------------------------------- |
| Aligns with community-plugins convention (Topology PR #8523) | Upstream repo hygiene                      | Medium — good for external contributors              |
| Smoke-test K8s API wiring without full `packages/backend`    | Maintainers doing backend-adjacent changes | Low–medium — infrequent for UI-heavy sprints         |
| Validates label filtering / auth / permission path locally   | Integration debugging                      | Medium — but see RHDH alternative below              |
| Onboarding external contributors without RHDH access         | Community contributors                     | Medium — if we expect significant external PR volume |
| Catches regressions in kubernetes-react integration          | CI (optional kind job)                     | Low — rare class of bug if mocks stay comprehensive  |

**Honest assessment:** Payback is highest for **repo convention alignment** and **external contributor onboarding**. Payback is **low for day-to-day UI development**, which is most of our work.

---

## Alternative: Validate on RHDH Instead

We can test the Tekton plugin against a **real Backstage + real cluster** on **Red Hat Developer Hub (RHDH)** without building integration-mode dev in community-plugins.

| Concern                             | Mock dev (community-plugins) | Integration mode (community-plugins) | RHDH                            |
| ----------------------------------- | ---------------------------- | ------------------------------------ | ------------------------------- |
| UI verification (all statuses)      | ✅ Best                      | ❌ Poor                              | ⚠️ Depends on cluster state     |
| Real K8s / proxy / auth wiring      | ❌ Mocked                    | ✅ Yes                               | ✅ Yes — production-like        |
| Real catalog entity-page flow       | ❌ `/tekton` only            | ⚠️ Partial                           | ✅ Full app                     |
| Setup cost per developer            | None                         | High (cluster + backend)             | Uses shared/staging instance    |
| Customer-representative environment | ❌                           | ⚠️ Minimal dev backend               | ✅ Closer to what customers run |

**Recommendation to discuss:** Use **mock dev for all UI work in community-plugins**, and use **RHDH staging** as the integration validation path before release. This avoids duplicating cluster setup in every developer's laptop while still catching real-world wiring issues.

RHDH does not replace Playwright/mocks for CI — it complements them for pre-release smoke testing.

---

## Risks of Skipping Local Backend Integration (Mock + RHDH Only)

Choosing Option A is reasonable for UI work, but the team should acknowledge what we **give up** and what can go **wrong** with RHDH-only integration validation.

### Risks from relying on mocks alone (no local backend at all)

| Risk                                          | What can go wrong                                                                                                                                                     | How serious                                                          |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Mock / reality drift**                      | `MockKubernetesClient` skips label filtering, auth decoration, and error shapes that real `kubernetes-backend` enforces. Bugs in those paths ship until RHDH testing. | Medium — has happened class of issues in K8s plugins                 |
| **Proxy & permission paths untested locally** | Pod logs, scan output, and permission denials are mocked. Regressions in `kubernetesProxyApiRef` or `permissionApiRef` wiring won't show in mock dev.                 | Medium — Tekton-specific                                             |
| **No integration in CI**                      | community-plugins CI runs unit tests + Playwright on mocks only. A change breaking real API contracts can merge green.                                                | Medium — mitigated by RHDH pre-release pass                          |
| **External contributors blocked**             | Open-source contributors cannot use internal RHDH. They only have mocks unless we document a DIY kind setup.                                                          | Low–medium — depends on contributor volume                           |
| **False confidence from mocks**               | UI looks correct while data layer is broken for real clusters.                                                                                                        | Low if RHDH gate exists; **High** if RHDH pass is skipped or delayed |

### Risks and downsides of using RHDH for integration (instead of local dev-backend)

| Risk                        | What can go wrong                                                                                                                                                                            | Mitigation                                                                                                   |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Version skew**            | RHDH may run an older plugin build, different Backstage core, or a forked/wrapped Tekton plugin. Passing on RHDH ≠ passing on community-plugins `main`.                                      | Test the **same build artifact** (npm pack / image) on RHDH; pin Backstage version alignment                 |
| **Environment specificity** | RHDH uses OpenShift Pipelines, specific RBAC, operators, and app-config patterns vanilla Backstage users may not have. Failures may be RHDH-config issues, not plugin bugs — and vice versa. | Reproduce on a minimal vanilla K8s + Backstage setup for upstream bugs; document RHDH-only vs generic issues |
| **Access & availability**   | Not every team member or contributor has RHDH staging access. Shared env can be down, misconfigured, or mid-migration.                                                                       | Define who has access; don't make RHDH the only path for external PR review                                  |
| **Slow feedback loop**      | Local integration: minutes. RHDH: build → deploy → navigate catalog → find entity → check CI/CD tab. Harder to iterate on integration bugs.                                                  | Reserve RHDH for pre-merge / pre-release smoke, not tight debug loops                                        |
| **Shared cluster state**    | Staging pipelines are created/deleted by others; you can't rely on specific PLR states. Same UI verification problem as any real cluster.                                                    | Use RHDH for wiring smoke ("data appears"), not UI matrix                                                    |
| **Harder debugging**        | Backend logs, proxy traces, and K8s RBAC issues require RHDH platform access and coordination with platform team.                                                                            | Runbook for who to ask; consider local backend only when debugging deep integration issues                   |
| **Late discovery**          | Integration bugs found days before release when RHDH is updated, not during feature development.                                                                                             | Scheduled RHDH smoke on release candidates; optional nightly if pain is frequent                             |
| **False negative**          | Plugin works in mock dev and is fine upstream, but **fails on RHDH** due to RHDH-specific dynamic config, feature flags, or wrapper plugins — blocking release for non-plugin reasons.       | Triage process: plugin repo vs RHDH platform issue                                                           |
| **False positive**          | Plugin **passes on RHDH** but breaks for community Backstage users on plain EKS/kind with different auth or CRD versions.                                                                    | Occasional test against non-RHDH reference app; watch upstream issue reports                                 |

### What RHDH is good for vs bad for

| Good for                                                    | Poor for                                               |
| ----------------------------------------------------------- | ------------------------------------------------------ |
| Smoke test: PLRs appear for a catalog entity                | Verifying every UI status variant                      |
| End-to-end auth + K8s SA token path                         | Fast iteration on integration bugs                     |
| Customer-like app shell (catalog → CI/CD tab)               | External contributor self-service                      |
| Catching config mistakes in `app-config` kubernetes section | Deterministic automated UI regression                  |
| Pre-release sign-off on Red Hat product path                | Proving vanilla upstream Backstage compatibility alone |

### Balanced conclusion

**Skipping local integration backend is a trade-off, not a free win.**

- For **UI-heavy work**, the trade-off favors mocks + RHDH.
- For **integration-heavy changes** (kubernetes API upgrades, label selector logic, proxy/log paths, permission changes), the lack of local backend means slower debug cycles and dependence on RHDH availability — accept that cost or temporarily spin up a minimal backend / kind cluster for that PR only (no need to permanentize it).

**Hybrid approach worth discussing:** Option A by default, but document a **one-time kind + lightweight backend** recipe in CONTRIBUTING for integration PRs — without maintaining `tekton-dev-backend` as a permanent workspace package until pain justifies it.

---

## Additional Insights for Discussion

1. **Integration mode is not a replacement for mock dev — and must not become the default `yarn start`.** If we build it, mock stays the UI path; integration is opt-in only.

2. **Topology is a weak analogy for Tekton ROI.** Topology lists K8s objects; Tekton needs proxy APIs, scan results, and permissions. The integration backend investment is larger for proportionally similar convention benefit.

3. **Playwright already guards UI regressions** with mock data. Adding integration mode does not materially improve UI confidence; it adds a second test surface with different (worse) data for visual check.

4. **External contributor argument cuts both ways.** Contributors doing UI PRs need mocks, not clusters. Contributors fixing K8s integration bugs are rare; they can use RHDH or document a one-time kind setup in CONTRIBUTING — without maintaining a permanent dev-backend package.

5. **Defer until there's a concrete trigger.** Reasonable triggers to revisit Option B:

   - Frequent external PRs breaking real-cluster paths
   - Upstream mandate to match Topology PR #8523 before merge
   - Planned removal of mock fixtures (unlikely)

6. **If we do nothing, we lose almost nothing for UI work.** We keep the best UI dev experience we already have.

---

## Effort Summary (If We Proceed with Option B)

| Tier       | Goal                                           | Effort                           | UI verification value                 |
| ---------- | ---------------------------------------------- | -------------------------------- | ------------------------------------- |
| **Tier 0** | Scaffold `tekton-dev-backend` + split scripts  | 1–2 days engineering             | None for UI                           |
| **Tier 1** | Basic pipeline rows on real cluster            | ~0.5 day per developer + cluster | Low — mixed statuses hard to maintain |
| **Tier 2** | Vulnerabilities, signing, SBOM, expanded scans | Days–weeks                       | Low — only if infra exists            |
| **Tier 3** | Reproduce exact mock table                     | Very high / fragile              | Not worth it                          |

**Option A (mock + RHDH):** Tier 0 cost = **zero** in community-plugins.

---

## Questions for the Team

1. **Is convention alignment (Topology PR #8523) alone worth Tier 0 + ongoing dual-path maintenance?**
2. **How often do we actually hit bugs that mocks miss but a local integration backend would catch?** Can we name recent examples?
3. **Is RHDH staging sufficient for pre-release integration validation?** Who owns that test pass today? How do we handle version skew and RHDH-specific false positives/negatives?
4. **What integration bug classes have we actually shipped that mocks missed?** Does that justify permanent local backend vs ad-hoc kind setup per PR?
5. **Should `yarn start` stay mock-based permanently**, with integration only if explicitly requested?
6. **Do we expect external contributors to need local cluster dev**, or is mock + CI enough?

---

## Proposed Team Positions (for discussion)

**Position supporting Option A (mock + RHDH):**

- Best UI dev experience stays unchanged
- No integration data prep tax on UI contributors
- RHDH covers real-cluster validation closer to customer environments
- Avoids maintaining `tekton-dev-backend` until a concrete pain point appears

**Position supporting Option B (additive integration mode):**

- Matches community-plugins direction
- Helps contributors without RHDH access
- Local smoke test for K8s auth/label issues without deploying to RHDH

**Position against Option C (integration-first):**

- Unanimous — UI verification regression is unacceptable for a UI-heavy plugin

---

## References

- [community-plugins PR #8523](https://github.com/backstage/community-plugins/pull/8523) — Topology dev-backend pattern
- [Tekton `dev/index.tsx`](../plugins/tekton/dev/index.tsx) — current mock dev entry
- [Mock fixture data](../plugins/tekton/src/__fixtures__/1-pipelinesData.ts)
- [Tekton ClusterRole manifest](../plugins/tekton/manifests/clusterrole.yaml)
- [RBAC mock vs integration split](https://github.com/backstage/community-plugins/tree/main/workspaces/rbac/plugins/rbac/dev) — precedent for dual entry points
