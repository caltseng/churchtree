# Repository instructions

## Deliver changes through pull requests

- Implement changes on a topic branch (use the `codex/` prefix for new branches), not directly on `main`.
- A task that changes repository files is not finished with a local commit. Commit the relevant work, push the branch to GitHub, and create a pull request targeting `main` before reporting completion. This is the default workflow and does not require a separate user request to push or open a PR.
- If an open PR already covers the current branch and task, push the new commits to that PR and update its title or description to reflect the resulting scope. Do not create a duplicate PR for the same branch.
- Keep unrelated tasks in separate branches and PRs. In this shared checkout, inspect the current branch, working tree and existing PR before making changes; preserve other chats' work and stage only the files belonging to the task.
- Run checks appropriate to the changes and include their results and material limitations in the PR description. Inspect generated output when changing page generators; commit both the generator and its tracked output.
- Verify that the remote PR head includes the final local commit. Report the PR link, commit and validation status in the final response. Clearly disclose any failure to push or create/update the PR; never imply local-only work is available for review or deployed.
- A commit, a pushed branch, an open PR, a merge and a production deployment are different states. Describe the actual verified state. Follow the repository's existing protected-branch and CI rules for merging and deployment.

## Main Branch identity

- The public website is named **Main Branch**, at `main-branch.com`.
- The selected logo is Woodland solid, the side-graft mark: `assets/brand/logos/main-branch.svg`. The horizontal asset is `assets/brand/logos/main-branch-wordmark.svg`.
- Preserve its three fixed colors: bark `#9B7555`, leaf `#6E9D50`, straw `#D6B579`. Use shared `brand.css` for page lockups, with accessible text and a link home.
- Update source templates/builders as well as tracked generated pages so branding survives a rebuild.
