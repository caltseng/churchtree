# Deployment and repository policy

## Architecture

GitHub hosts the static site through Pages; GoDaddy holds `main-branch.com` DNS.
No paid GoDaddy web server or application backend is required. The publishing
source is **GitHub Actions**, not Deploy from a branch.

`.github/workflows/site.yml` runs on PRs to main, pushes to main, and manual dispatch.
The `Build and test` job installs locked dependencies/browser, creates `dist/`, checks
syntax/data/assets, and runs the scenario suites. A main-only deploy job depends on
that success and publishes the exact uploaded artifact through `github-pages`.
PR builds never deploy. Only website assets and generated data go into the artifact;
research notes, scripts, docs and repository metadata do not.

The runner is pinned to Ubuntu 24.04. The first hosted run demonstrated why: the
moving ubuntu-latest image had become 26.04, unsupported by the pinned Playwright.
Do not change runner/browser versions independently without a passing hosted run.
Actions use immutable commit SHAs; Dependabot proposes dependency/action updates.

## Live GitHub policy

The active ruleset is [Protect main with passing site checks](https://github.com/caltseng/churchtree/rules/27265401).
Its checked-in template is `.github/rulesets/main.json`:

- Require a PR to main and the `Build and test` status check.
- Require the branch to be up to date and review conversations resolved.
- Block force pushes and branch deletion; no bypass actors.
- Zero mandatory approving reviewers for the current solo workflow. Passing CI
  and the branch rules remain mandatory; do not conflate this with a human review.

A JSON file alone does not enforce rules. Verify the GitHub ruleset's active state.
Repository auto-merge is enabled. The current bootstrap PR uses native auto-merge;
`.github/workflows/auto-merge.yml` handles future successful trusted same-repository
PRs (owner/collaborator/member and Dependabot), excluding drafts and public forks.
It checks the exact tested head SHA, uses GitHub's normal merge API, and respects
strict status requirements. A behind/conflicted PR remains open rather than bypassing
a rule. Refresh/rebase the topic branch and rerun CI when needed.

The privileged merge workflow executes no PR-supplied code and does not check out
the PR. After merging with GITHUB_TOKEN it explicitly dispatches the main workflow,
because token-authored merges do not normally trigger another push workflow.
Set repository variable `MAIN_BRANCH_AUTOMERGE=false` to pause automatic merges.

## Contributor/release sequence

1. Create a `codex/` topic branch; preserve unrelated shared-checkout work.
2. Run `npm ci`, install Chromium, set the two test environment variables from README.
3. Run `npm run ci` and review scenario screenshots.
4. Commit source and tracked generated pages. Push and create/update the PR.
5. Inspect GitHub's required check; fix failures instead of skipping tests or weakening
   protections. Native or workflow auto-merge can merge an eligible passing PR.
6. Inspect the main workflow and Pages deployment. Report the actual commit, PR,
   merge and deployment state separately.

Production content is generated from canonical JSON and page sources. Editing
`dist/` has no lasting effect and it must not be committed. `site.config.json`
defines the domain, landing inventory and allowed public directories.

## Domain cutover

Pages is configured for `main-branch.com` and Actions. The earlier 2026-11-14 setup
check found GoDaddy parking addresses; the 2026-11-22 read-only check confirmed
the cutover:

- Public DNS returned all four GitHub Pages A records listed below and the
  `www` CNAME `caltseng.github.io`.
- The [Pages API](https://api.github.com/repos/caltseng/churchtree/pages) reported
  `build_type: workflow`, `cname: main-branch.com`, HTTPS enforcement enabled,
  and an approved certificate covering the apex and `www`.
- HTTPS returned `200` with the Main Branch home page, not a parking page.
  HTTP at the apex and HTTPS at `www` each returned a `301` to
  `https://main-branch.com/`.
- Both `Build and test` and `Publish passing build` succeeded in
  [main run 45031782582](https://github.com/caltseng/churchtree/actions/runs/45031782582)
  for commit `9ee8c9db84be6970f39dd70f8120fea168bffc6a`.

This is a dated observation from the investigation environment, not proof of
access through every network or a guarantee of future DNS/certificate state.

For initial setup or an authorized DNS repair, the website records are:

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | caltseng.github.io |

Replace conflicting parking/website records only; preserve unrelated mail and
verification records. Keep GoDaddy nameservers if GoDaddy manages the zone.
The CNAME value is a hostname, without a scheme or repository path.
The build writes `dist/CNAME` from the configured domain. It does not change DNS.

After propagation and Pages certificate provisioning, enable Enforce HTTPS and
verify root, church-history, Westminster, assets, section links and www redirection.
A green build cannot fix DNS or prove that a parking page has been replaced.

Official references: [GitHub custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site),
[Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages),
[GoDaddy DNS](https://www.godaddy.com/help/manage-dns-records-680).

## FortiGuard access blocks

In [issue #46](https://github.com/caltseng/churchtree/issues/46), the
[FortiGuard block page](https://github.com/user-attachments/assets/32c6017e-415a-4cfe-b109-afb786330372)
identifies `https://main-branch.com/` as **Newly Registered Domain**. The
[Fortinet explanation page](https://github.com/user-attachments/assets/8bcc0a96-7f8b-4bec-b21e-29ec9711e5a6)
explicitly says the FortiGate administrator blocked that category. Despite the
"Intrusion Prevention" heading, the supplied details identify a category-policy
block, not a specific exploit detection. An administrator should confirm the
actual event in their logs.

The verified DNS, Pages deployment and HTTPS above do not remove that policy.
No repository configuration error causing the reported block was found.
Changing HTML, regenerating `CNAME`, or publishing a PR cannot override Fortinet.
The investigation did not have access to the affected FortiGate, its logs, or
the user's network; the screenshot category has not been independently confirmed
against that device's current rating.

### Request a FortiGuard rating review

The site owner can check the URL in the
[FortiGuard Web Filter Lookup](https://www.fortiguard.com/webfilter) and, if the
rating needs review, use the official
[Web Filter Classification Rating Request](https://www.fortiguard.com/faq/wfratingsubmit).
The block page's rating-reevaluation link points users toward this process.
The form requires a URL, suggested category and contact details; a screenshot is
optional (maximum 2 MB). The owner must review and submit it themselves.

Describe the site factually: "Main Branch is a static collection of Christian
history visualizations and historical primary-source readers at
https://main-branch.com/. Please review the Newly Registered Domain rating."
Use the [FortiGuard category definitions](https://www.fortiguard.com/webfilter/categories)
to suggest a category that accurately represents the dominant content, rather
than selecting one solely because it is allowed on a particular network.
FortiGuard decides the classification. Its lookup page says reviews are
generally processed within 24 hours, but this is not a guaranteed turnaround
or a promise that the domain-age rating will be removed. Even an accepted
recategorization may remain blocked under the organization's policy.

### Request an administrator-approved exception

If access is needed before or instead of a rating change, contact the administrator
responsible for the blocking FortiGate or managed security service. Provide
`https://main-branch.com/`, the category, the time of the failed request including
timezone, a screenshot, and the reason access is needed. Send network/device
details and security logs privately to the administrator, not to a public issue.

Ask for a policy review and, only if authorized, a narrowly scoped exception for
`main-branch.com`; include `www.main-branch.com` only if that hostname is needed.
Fortinet documents administrator-managed
[web rating overrides](https://docs.fortinet.com/document/fortigate/7.2.3/administration-guide/122974),
including local categories whose action is configured in the applicable web
filter profile. The administrator must use instructions for the installed
FortiOS version, account for license requirements, and verify the exception in
the profile actually handling the request. An override is local policy, not a
global FortiGuard recategorization.

Do not disable filtering or TLS inspection, broadly allow the category or shared
GitHub hosting addresses, switch domains/hosting, or use alternate routing to
evade the block. Those are not repository fixes.

### Verify the outcome

After the owner receives a rating-review result or the administrator approves
and applies an exception, retry the same URL from the affected network. Ask the
administrator to confirm the effective rating, matching policy and any cached
rating if the block persists. Verify that the home page and required explorations
load; if only the history graph fails, check the separate `d3js.org` dependency
with the administrator rather than assuming the original block is resolved.

For a separate, read-only hosting check, these PowerShell commands verify DNS
and HTTP without changing settings or suppressing certificate validation:

```powershell
Resolve-DnsName main-branch.com -Type A
Resolve-DnsName www.main-branch.com -Type CNAME
gh api repos/caltseng/churchtree/pages
curl.exe --head --location --max-time 30 https://main-branch.com/
```

A successful check from another environment does not establish access from the
blocked network. Keep issue #46 open until the reporter confirms access there.
A documentation PR addresses the repository-side guidance only; no external
review request, administrator change or unblock is performed by that PR.

## Recovering from a bad release

Do not force-push main or disable the check. Revert the offending change on a topic
branch, run CI and merge the repair through the same policy. A failing build never
replaces the last successful Pages artifact. A content/behavior error that passes
existing tests requires a regression scenario and repair, not merely another retry.
