FROM public.ecr.aws/debian/debian:bookworm

ARG TARGETPLATFORM
ARG WRAPICA_VERSION="2.40.1.post20260224123747"
ARG YQ_VERSION="4.52.4"

RUN \
    if [ "${TARGETPLATFORM#linux/}" = "arm64" ]; then \
      aws_platform_url="aarch64";  \
      yq_platform_url="arm64";  \
    else \
      aws_platform_url="x86_64"; \
      yq_platform_url="amd64"; \
    fi && \
    apt update -yq && \
    apt upgrade -yq && \
    apt install -yq \
      curl \
      wget \
      unzip \
      jq \
      tabix && \
    echo "Installing UV" 1>&2 && \
    curl -LsSf https://astral.sh/uv/install.sh | \
    XDG_CONFIG_HOME=/tmp UV_INSTALL_DIR=/usr/bin sh && \
    echo "Installing Python packages via uv" 1>&2 && \
    echo "Install wrapica" 1>&2 && \
    uv venv && \
    uv pip install \
      wrapica=="${WRAPICA_VERSION}" && \
    echo "Install AWS CLI" 1>&2 && \
    ( \
      wget \
        --quiet \
        --output-document "awscliv2.zip" \
        "https://awscli.amazonaws.com/awscli-exe-linux-${aws_platform_url}.zip" && \
      unzip -q "awscliv2.zip" && \
      ./aws/install && \
      rm -rf "awscliv2.zip" "aws" \
    ) && \
    echo "Install yq" 1>&2 && \
    wget \
      --quiet \
      --output-document "/usr/local/bin/yq" \
      "https://github.com/mikefarah/yq/releases/download/v${YQ_VERSION}/yq_linux_${yq_platform_url}" && \
    chmod +x "/usr/local/bin/yq"


# Copy the scripts to the docker container
# Make the scripts executable
COPY scripts/ scripts/
RUN chmod +x scripts/*

# Copy the docker entrypoint to the docker container
COPY docker-entrypoint.sh docker-entrypoint.sh
# Make the docker entrypoint executable
RUN chmod +x "./docker-entrypoint.sh"

# Set the entrypoint as the docker entrypoint script
CMD [ "./docker-entrypoint.sh" ]
