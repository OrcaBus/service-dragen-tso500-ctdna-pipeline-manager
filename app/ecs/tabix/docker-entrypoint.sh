#!/usr/bin/env bash

: '
Tabix up a vcf file (which is easier to do here in fargate) than restructure our lambdas.
'

set -euo pipefail

# Set python3 version
hash -p /usr/bin/python3.12 python3

# Functions
echo_stderr(){
  echo "$(date -Iseconds):" "$@" 1>&2
}

parameter_prefix_to_yaml(){
  local parameter_prefix="${1}"
  local yaml_path="${2}"
  aws ssm get-parameters-by-path \
	--path "${parameter_prefix}" \
	--output json | \
  jq --raw-output \
	'
	  .Parameters |
	  map(.Value | fromjson)
	' | \
  yq --unwrapScalar --prettyPrint > "${yaml_path}"
}

# SECRET KEY FOR ICAV2
if [[ ! -v ICAV2_ACCESS_TOKEN_SECRET_ID ]]; then
  echo_stderr "Error! Expected env var 'ICAV2_ACCESS_TOKEN_SECRET_ID' but was not found"
  exit 1
fi

# Icav2 Storage configuration files
echo_stderr "Collecting configuration files"

# Storage configuration list file key prefix
if [[ ! -v ICAV2_STORAGE_CONFIGURATION_SSM_PARAMETER_PATH_PREFIX ]]; then
  echo_stderr "Error! Expected env var 'ICAV2_STORAGE_CONFIGURATION_SSM_PARAMETER_PATH_PREFIX' but was not found"
  exit 1
fi
ICAV2_STORAGE_CONFIGURATION_LIST_FILE="project_configuration_list.yaml"
parameter_prefix_to_yaml \
  "${ICAV2_STORAGE_CONFIGURATION_SSM_PARAMETER_PATH_PREFIX}" \
  "${ICAV2_STORAGE_CONFIGURATION_LIST_FILE}"
export ICAV2_STORAGE_CONFIGURATION_LIST_FILE

# Project to Storage Configuration mapping
if [[ ! -v ICAV2_PROJECT_TO_STORAGE_CONFIGURATION_MAPPING_SSM_PARAMETER_PATH_PREFIX ]]; then
  echo_stderr "Error! Expected env var 'ICAV2_PROJECT_TO_STORAGE_CONFIGURATION_MAPPING_SSM_PARAMETER_PATH_PREFIX' but was not found"
  exit 1
fi
ICAV2_PROJECT_TO_STORAGE_CONFIGURATION_MAPPING_LIST_FILE="project_to_storage_configuration_mapping_list.yaml"
parameter_prefix_to_yaml \
  "${ICAV2_PROJECT_TO_STORAGE_CONFIGURATION_MAPPING_SSM_PARAMETER_PATH_PREFIX}" \
  "${ICAV2_PROJECT_TO_STORAGE_CONFIGURATION_MAPPING_LIST_FILE}"
export ICAV2_PROJECT_TO_STORAGE_CONFIGURATION_MAPPING_LIST_FILE

# Storage Credentials
if [[ ! -v ICAV2_STORAGE_CREDENTIAL_LIST_FILE_SSM_PARAMETER_PATH_PREFIX ]]; then
  echo_stderr "Error! Expected env var 'ICAV2_STORAGE_CREDENTIAL_LIST_FILE_SSM_PARAMETER_PATH_PREFIX' but was not found"
  exit 1
fi
ICAV2_STORAGE_CREDENTIAL_LIST_FILE="storage_credential_list.yaml"
parameter_prefix_to_yaml \
  "${ICAV2_STORAGE_CREDENTIAL_LIST_FILE_SSM_PARAMETER_PATH_PREFIX}" \
  "${ICAV2_STORAGE_CREDENTIAL_LIST_FILE}"
export ICAV2_STORAGE_CREDENTIAL_LIST_FILE

# Get the ICAV2 access token
echo_stderr "Collecting the ICAV2 access token"
ICAV2_ACCESS_TOKEN="$( \
  aws secretsmanager get-secret-value \
    --secret-id "${ICAV2_ACCESS_TOKEN_SECRET_ID}" \
    --output text \
    --query SecretString
)"
export ICAV2_ACCESS_TOKEN

# Check the inputs are set
if [[ -z "${INPUT_VCF_URI-}" ]]; then
  echo "INPUT_VCF_URI is not set. Please provide the S3 URI of the VCF file."
  exit 1
fi

OUTPUT_VCF_URI="${INPUT_VCF_URI}.gz"

# Get the icav2 accession credentials if required
# Set AWS credentials access for aws s3 cp
echo_stderr "Collecting the AWS S3 Access credentials"
aws_s3_access_creds_json_str="$( \
	uv run python3 scripts/get_icav2_aws_credentials_access.py \
	  "$(dirname "${OUTPUT_VCF_URI}")/"
)";

vcf_file_name="$(basename "$INPUT_VCF_URI")"
compressed_vcf_file_name="${vcf_file_name}.gz"

# Download the VCF file from S3 via the wrapica script
wget \
  --quiet \
  --output-document "${vcf_file_name}" \
  "$(uv run python3 scripts/get_icav2_download_url.py "${INPUT_VCF_URI}")"

# Compress the VCF file with bgzip
echo_stderr "Compressing the VCF file with bgzip"
bgzip "${vcf_file_name}"
echo_stderr "bgzip compression complete"

# Tabix the VCF file
echo_stderr "Indexing the VCF file with tabix"
tabix -p vcf "${compressed_vcf_file_name}"
echo_stderr "Tabix indexing complete"

# Upload the compressed and indexed VCF file to S3
# VCF
AWS_ACCESS_KEY_ID="$( \
  jq -r '.AWS_ACCESS_KEY_ID' <<< "${aws_s3_access_creds_json_str}"
)"
AWS_SECRET_ACCESS_KEY="$( \
  jq -r '.AWS_SECRET_ACCESS_KEY' <<< "${aws_s3_access_creds_json_str}"
)"
AWS_SESSION_TOKEN="$( \
  jq -r '.AWS_SESSION_TOKEN' <<< "${aws_s3_access_creds_json_str}"
)"
AWS_REGION="$( \
  jq -r '.AWS_REGION' <<< "${aws_s3_access_creds_json_str}"
)"

# Export the AWS credentials from icav2
export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_SESSION_TOKEN
export AWS_REGION

# Upload the compressed VCF file and its index to S3
echo_stderr "Uploading the compressed VCF file and its index to S3"
aws s3 cp \
  --quiet \
  --sse=AES256 \
  "${compressed_vcf_file_name}" \
  "${OUTPUT_VCF_URI}"
aws s3 cp \
  --quiet \
  --sse=AES256 \
  "${compressed_vcf_file_name}.tbi" \
  "${OUTPUT_VCF_URI}.tbi"
echo_stderr "Upload complete"

# Delete the original VCF file from S3
echo_stderr "Deleting the original VCF file from S3"
aws s3 rm \
  --quiet \
  "${INPUT_VCF_URI}"
echo_stderr "Original VCF file deleted"
