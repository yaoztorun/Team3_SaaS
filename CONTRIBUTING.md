# Contributing Guidelines 🤝

Thank you for contributing to **Sippin**!  
This guide describes how we collaborate, name branches, and ensure clean commits.

<br>

## Branching Strategy

We follow a simplified **Git flow** with two long-lived branches that correspond to our environments.

### Main/long-lived Branches

| Branch | Environment | Purpose |
|---------|--------------|----------|
| **main** | **Production** | Stable, deployment-ready code. What users actually use. |
| **dev** | **Development** | Active development and integration. Used for internal testing. |

<br>

### Feature Branch Workflow

All new work happens on **short-lived feature branches** created from `dev`.  
Each feature branch focuses on a single change — a feature, fix, or improvement.

**Flow:**
1. **Start from `develop`:**  
   Create a branch using the naming convention (see below)
   → `feature/backend-add-login-endpoint`
2. **Work locally:**  
   Code, commit, and test the feature.
3. **Push & open a Pull Request (PR):**  
   Merge the feature branch into `dev` once it’s complete and reviewed.
4. **Automatic/Manual Deploy (Dev Environment):**  
   Every merge into `dev` triggers a deployment to the **development environment** for internal testing.
5. **Stabilize and Merge to Production:**  
   When `dev` is tested and stable, merge it into `main`.  
   This deploys the final version to **production**.

<br>

### Example Workflow

```bash
# 1. Create new feature branch from develop
git checkout dev
git pull
git checkout -b feature/frontend-login-screen

# 2. Work, commit, push
git add .
git commit -m "feat: add login screen UI"
git push origin feature/frontend-login-screen

# 3. Open PR → Peer review → merge into dev
# 4. When dev is stable:
git checkout main
git merge dev
git push origin main
```
<br>

## Branch Naming Convention

Every new branch needs to follow given structure:
```
<type>/<area>-<short-description>
```
Some examples are:
```
feature/frontend-login-page
feature/backend-auth-endpoint
bugfix/database-schema-error
refactor/frontend-navbar
```
The different types and areas we work with in this project are shown in the tables below

#### Type

| Type | Explanation | Example |
|------|--------------|----------|
| **feature** | Used when adding a new feature or functionality. | `feature/frontend-rating-system` |
| **bugfix** | Fixes a bug found during development or testing. | `bugfix/backend-auth-token` |
| **refactor** | Improves existing code structure without changing functionality. | `refactor/frontend-input-validation` |
| **chore** | Routine maintenance tasks like updating dependencies or configs. | `chore/update-eslint-config` |
| **perf** | Performance improvement. | `perf/backend-query-optimization` |
| **docs** | Documentation changes only. | `docs/update-readme` |

#### Area

| Area | Explanation | Example |
|------|--------------|----------|
| **frontend** | UI, React components, styling, or client-side logic. | `feature/frontend-login-page` |
| **backend** | Supabase logic, server-side functions, Supabase Edge Functions. | `feature/backend-add-rating-endpoint` |
| **database** | Schema changes, migrations, or seed data updates in Supabase SQL. | `feature/database-add-cocktail-table` |
| **api** | Interfaces or integrations with external/internal APIs. | `feature/api-cocktaildb-integration` |
| **ci/cd** | Github Actions, deployment configs
<br>

**Tip:**  
Keep branch names **short but descriptive**, all lowercase, and use **hyphens** instead of spaces.  

