# Scripts

## create-sub-issues.sh

Automates creation of sub-issues from a parent issue.

### Prerequisites

- GitHub CLI (`gh`) installed and authenticated
- Permissions to create issues in the repository

### Usage

```bash
./scripts/create-sub-issues.sh
```

This script will:
1. Read the tasks from issue #27
2. Create a separate issue for each task
3. Link each sub-issue to the parent issue #27
4. Apply the `enhancement` label
5. Assign to `alexiswl`

### Manual Alternative

If you prefer to create issues manually or don't have `gh` CLI, the tasks to split are:

1. **Remove Legacy WRSC Support**
2. **Use post-schema validation to ensure that the payload is runnable, forward schema validation failures to OrcaUI**
3. **Forward WES Failure Comments to OrcaUI**
4. **Docs update, use sketch drawings, update doc structure**
5. **Populate Draft Data restructure, forward engine parameter / tag changes first**
6. **Lambda upgrade to python 3.14**

Each issue should reference "Part of #27" in the body.
