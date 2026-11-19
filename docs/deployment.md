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

Pages is configured for `main-branch.com` and Actions. DNS was still on GoDaddy
parking addresses at the 2026-11-14 setup check; do not call the domain live until
DNS, Pages deployment and HTTPS are separately verified.

In GoDaddy's DNS management, set these website records:

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

## Recovering from a bad release

Do not force-push main or disable the check. Revert the offending change on a topic
branch, run CI and merge the repair through the same policy. A failing build never
replaces the last successful Pages artifact. A content/behavior error that passes
existing tests requires a regression scenario and repair, not merely another retry.
