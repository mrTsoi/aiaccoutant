# GitHub Actions Workflow Guide

## Overview

This repository uses GitHub Actions for continuous integration (CI). The workflow automatically runs when you push code or create pull requests, but it can also be manually triggered.

## Available Workflows

### CI Workflow (`ci.yml`)
Runs linting, type checking, and builds the application to ensure code quality.

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`
- Manual trigger (workflow_dispatch)

**Steps:**
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Run ESLint
5. Run TypeScript type check
6. Build Next.js application

## How to Rerun a Workflow

There are several ways to rerun workflows in GitHub:

### Method 1: Rerun from GitHub UI (Recommended)

1. **Navigate to Actions Tab**
   - Go to your repository on GitHub
   - Click on the "Actions" tab at the top

2. **Find the Workflow Run**
   - Click on the workflow name (e.g., "CI")
   - Select the specific run you want to rerun

3. **Rerun the Workflow**
   - Click the "Re-run jobs" button in the top right
   - Choose one of the options:
     - **Re-run all jobs**: Reruns all jobs in the workflow
     - **Re-run failed jobs**: Only reruns jobs that failed

### Method 2: Manual Trigger (workflow_dispatch)

1. **Navigate to Actions Tab**
   - Go to your repository on GitHub
   - Click on the "Actions" tab

2. **Select Workflow**
   - Click on "CI" in the left sidebar

3. **Run Workflow**
   - Click the "Run workflow" button (appears on the right)
   - Select the branch you want to run on
   - Click "Run workflow"

### Method 3: Push a New Commit

If you want to trigger the workflow with a code change:

```bash
git commit --allow-empty -m "Trigger workflow"
git push
```

### Method 4: Using GitHub CLI

If you have GitHub CLI installed:

```bash
# List recent workflow runs
gh run list

# Rerun a specific workflow run by ID
gh run rerun <run-id>

# Rerun failed jobs only
gh run rerun <run-id> --failed

# Trigger a workflow manually
gh workflow run ci.yml
```

## Workflow Status

You can check the status of workflows in several places:

1. **Actions Tab**: Full details and logs
2. **Pull Request**: Status checks at the bottom
3. **Commit List**: Green checkmark (✓) or red X (✗) next to commits
4. **Repository Homepage**: Badge showing workflow status

## Troubleshooting

### Workflow Fails to Start

- Check that the workflow file syntax is valid
- Ensure you have the necessary permissions
- Verify branch protection rules aren't blocking it

### Build Failures

- Check the workflow logs in the Actions tab
- Verify environment variables are set correctly
- Ensure all dependencies are properly defined

### Missing Secrets

If the build fails due to missing secrets:

1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Add the required secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Best Practices

1. **Review Logs**: Always check the logs to understand why a workflow failed
2. **Use Continue on Error**: For non-critical steps, use `continue-on-error: true`
3. **Cache Dependencies**: Use caching to speed up workflow runs
4. **Manual Triggers**: Add `workflow_dispatch` for easy manual reruns
5. **Branch Protection**: Configure branch protection to require workflow success

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [GitHub CLI Manual](https://cli.github.com/manual/)

---

**Note**: This guide assumes you have appropriate permissions in the repository to view and run workflows.
