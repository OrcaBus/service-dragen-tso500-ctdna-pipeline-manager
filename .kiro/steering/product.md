# Product: Dragen TSO500 ctDNA Pipeline Manager

## Summary

This is an OrcaBus microservice that manages the lifecycle of the **Dragen TSO500 ctDNA pipeline** — Illumina's DRAGEN-based targeted sequencing pipeline for circulating tumour DNA (ctDNA) analysis using the TSO500 panel on ICAv2.

The service handles orchestration on ICAv2 (Illumina Connected Analytics v2) via nextflow workflows. 
It follows the standard ICAv2-centric Pipeline Architecture used across OrcaBus. 
This is a non-downstream (top-level) service — it has no upstream pipeline dependencies and is triggered directly by analysis events.

## Core Responsibilities

- Accept `WorkflowRunStateChange` DRAFT events and validate/populate them into READY events
- Submit READY events to ICAv2 as `Icav2WesRequest` events via a Step Functions state machine
- Monitor ICAv2 analysis state changes and convert them to `WorkflowRunUpdate` events
- Validate draft schemas against a registered JSON schema before promotion
- Manage samplesheet generation and FASTQ data staging for TSO500 ctDNA runs

## Event Flow

```
DRAFT event (WorkflowRunStateChange)
  → populate draft data (Step Functions)
  → validate draft schema
  → emit READY event
  → submit to ICAv2 WES
  → monitor ICAv2 state changes
  → emit WorkflowRunUpdate events
```

## Upstream / Downstream

- **Upstream**: None (non-downstream service — triggered directly by analysis events)
- **Downstream**: PierianDx TSO500 ctDNA Pipeline Manager
- **Key dependencies**: ICAv2 WES Manager, Workflow Manager, Fastq Glue

## Environments

Deploys to `beta`, `gamma`, and `prod` via AWS CodePipeline. The toolchain account hosts the CodePipeline; application stacks deploy cross-account.
