# Refer to:
# https://docs.astral.sh/uv/guides/integration/docker/#installing-uv
# https://docs.astral.sh/uv/guides/integration/fastapi/#deployment

# Fetch preset UV image
# See: https://docs.astral.sh/uv/guides/integration/docker/#available-images
FROM ghcr.io/astral-sh/uv:python3.13-trixie-slim
LABEL org.opencontainers.image.source=https://github.com/sookiemonster/allerfree


ARG PROJECT_LOCATION=/model
ADD . ${PROJECT_LOCATION}
WORKDIR ${PROJECT_LOCATION}

RUN uv sync --locked
CMD ["uv", "run", "fastapi", "run", "./api/main.py", "--port", "8000", "--host", "0.0.0.0"]