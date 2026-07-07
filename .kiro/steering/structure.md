# Project Structure

## Top-Level Layout

```
├── app/                        # Application logic (lambdas, ECS tasks, step functions, schemas)
├── bin/deploy.ts               # CDK entry point — initialises stateless + stateful root stacks
├── infrastructure/             # CDK infrastructure code
│   ├── stage/                  # Per-environment application stacks
│   └── toolchain/              # CodePipeline stacks (deploy to beta/gamma/prod)
├── test/                       # CDK/cdk-nag compliance tests
├── docs/                       # Draw.io exports, SOPs, workflow studio exports
├── .kiro/steering/             # AI steering documents
├── cdk.json                    # CDK app config (entry: `pnpx ts-node bin/deploy.ts`)
├── package.json / pnpm-workspace.yaml
└── Makefile                    # Common developer commands
```

## `app/` — Application Logic

```
app/
├── ecs/                         # ECS task definitions
│   └── tabix/                   # Tabix operations for VCF indexing
├── lambda/                      # Python Lambda functions
│   └── <function_name>_py/      # One directory per Lambda, snake_case + _py suffix
│       ├── <function_name>.py   # Handler file; must export handler(event, context)
│       └── requirements.txt     # (optional) extra pip deps, handled by uv
├── event-schemas/               # Versioned JSON schemas for event validation
│   └── complete-data-draft/     # <schema-name>/<payloadVersion>/...
│       └── 2025.07.29/
│           └── complete-data-draft-schema.json
└── step-functions-templates/   # ASL JSON Step Functions definitions
    ├── icav2_wes_event_to_wrsc_event_sfn_template.asl.json
    ├── populate_draft_data_sfn_template.asl.json
    ├── ready_event_to_icav2_wes_request_event_sfn_template.asl.json
    └── validate_draft_data_and_put_ready_event_sfn_template.asl.json
```

### Lambda Naming Convention

Lambda directories use `snake_case` with a `_py` suffix (e.g. `get_libraries_py`). The CDK infrastructure converts camelCase names to snake_case automatically via `camelCaseToSnakeCase()`.

### Lambda Pattern

- Single file per Lambda, named `<function_name>.py`
- Must export `handler(event, context) -> Dict[str, Any]`
- Extensive docstrings describing input/output event shapes
- Business logic only — no AWS SDK calls for infrastructure wiring (IAM, SSM lookups are CDK-managed)
- Commented-out `if __name__ == "__main__"` blocks for local testing

## `infrastructure/` — CDK Code

```
infrastructure/
├── stage/
│   ├── config.ts               # Environment configs (beta, gamma, prod)
│   ├── constants.ts            # All app constants (SSM paths, event names, workflow versions, S3 refs)
│   ├── interfaces.ts           # Shared TypeScript interfaces for the stack
│   ├── stateless-application-stack.ts
│   ├── stateful-application-stack.ts
│   ├── ecs/                    # ECS task construct builders
│   ├── lambdas/                # Lambda construct builders
│   ├── step-functions/         # Step Function construct builders
│   ├── event-rules/            # EventBridge rule builders
│   ├── event-targets/          # EventBridge target builders
│   ├── event-schemas/          # Schema registry construct builders
│   ├── ssm/                    # SSM parameter construct builders
│   └── utils/                  # Shared utilities (camelCase ↔ kebab/snake conversions)
└── toolchain/
    ├── constants.ts            # Toolchain-specific constants
    ├── stateless-pipeline-stack.ts  # CodePipeline for stateless deployments
    └── stateful-pipeline-stack.ts   # CodePipeline for stateful deployments
```

### Infrastructure Patterns

- Each resource type (lambdas, step-functions, event-rules, etc.) has its own subdirectory under `infrastructure/stage/`
- All constants (SSM paths, event names, bucket names, workflow versions) live in `infrastructure/stage/constants.ts` — do not hardcode these elsewhere
- Lambdas are built with `PythonUvFunction` from `@orcabus/platform-cdk-constructs`
- IAM permissions are granted inline based on per-Lambda requirement flags
- `NagSuppressions` are added inline with justification comments wherever `cdk-nag` rules are suppressed

## Key Conventions

- **Event source**: `orcabus.dragentso500ctdna`
- **Event bus**: `OrcaBusMain`
- **SSM prefix**: `/orcabus/workflows/dragen-tso500-ctdna/`
- **Stack prefix**: `orca-dragen-tso500-ctdna`
- **Workflow name**: `dragen-tso500-ctdna`
- **Lambda runtime**: Python 3.14 on ARM64
- When adding a new Lambda: add the directory under `app/lambdas/<name>_py/`, register it in the lambda interfaces, and declare its IAM requirement flags there
- When adding a new workflow version: update `WORKFLOW_VERSION_TO_DEFAULT_ICAV2_PIPELINE_ID_MAP` and related maps in `constants.ts`
