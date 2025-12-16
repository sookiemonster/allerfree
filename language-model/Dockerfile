# Refer to:
# https://docs.astral.sh/uv/guides/integration/docker/#installing-uv
# https://docs.astral.sh/uv/guides/integration/fastapi/#deployment

# Fetch preset UV image
# See: https://docs.astral.sh/uv/guides/integration/docker/#available-images
FROM ghcr.io/astral-sh/uv:python3.13-trixie-slim
LABEL org.opencontainers.image.source=https://github.com/sookiemonster/allerfree


ARG PROJECT_LOCATION=/dev/language-model
COPY . ${PROJECT_LOCATION}
WORKDIR ${PROJECT_LOCATION}

# NOTE: Port 80 & hostname are hard-coded and should NOT be changed
# Bind the port to the desired host port in the docker run command.
RUN uv sync --locked
CMD ["uv", "run", "fastapi", "run", "./src/main.py", "--port", "8000", "--host", "0.0.0.0"]