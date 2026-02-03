#!/bin/bash
# Script to create sub-issues from issue #27
# Usage: ./scripts/create-sub-issues.sh
# Requires: gh CLI tool installed and authenticated

set -e

PARENT_ISSUE=27
REPO="OrcaBus/service-dragen-tso500-ctdna-pipeline-manager"

# Define tasks from issue #27
declare -a TASKS=(
  "Remove Legacy WRSC Support"
  "Use post-schema validation to ensure that the payload is runnable, forward schema validation failures to OrcaUI"
  "Forward WES Failure Comments to OrcaUI"
  "Docs update, use sketch drawings, update doc structure"
  "Populate Draft Data restructure, forward engine parameter / tag changes first"
  "Lambda upgrade to python 3.14"
)

echo "Creating sub-issues for #${PARENT_ISSUE}..."
echo ""

for task in "${TASKS[@]}"; do
  echo "Creating issue: ${task}"
  
  # Create the issue body with parent reference
  BODY="Part of #${PARENT_ISSUE}

${task}"
  
  # Create the issue
  gh issue create \
    --repo "${REPO}" \
    --title "${task}" \
    --body "${BODY}" \
    --label "enhancement" \
    --assignee "alexiswl"
  
  echo "✓ Created"
  echo ""
done

echo "All sub-issues created successfully!"
echo "Don't forget to update #${PARENT_ISSUE} to link to the new issues."
