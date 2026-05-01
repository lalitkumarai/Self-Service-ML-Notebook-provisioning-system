# =============================================================================
# ML Notebook - Production Docker Image
# Environments: base-python, ml-standard, ml-gpu
# =============================================================================

# ── Stage 1: Dependency resolver (speeds up iterative rebuilds) ──────────────
FROM python:3.11-slim AS base-deps

# Install pip tools for faster resolution
RUN pip install --no-cache-dir pip-tools==7.3.0

# Pin all ML library versions for reproducibility
COPY requirements.txt /tmp/requirements.txt
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r /tmp/requirements.txt

# =============================================================================
# ── Stage 2: Final lightweight runtime image ──────────────────────────────────
# =============================================================================
FROM jupyter/base-notebook:python-3.11

LABEL maintainer="ML Platform <devops@mlplatform.io>"
LABEL version="2.0"
LABEL description="Production ML Notebook Environment"

# Switch to root for system installs
USER root

# Install only essential system packages (no dev headers in final image)
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
        git \
        && apt-get clean \
        && rm -rf /var/lib/apt/lists/*

# Copy pre-built wheels from stage 1 for fast, offline install
COPY --from=base-deps /wheels /wheels

# Switch back to jovyan (non-root notebook user) for security
USER ${NB_UID}

# Install all ML packages from pre-built wheels (no network call = faster)
RUN pip install --no-cache-dir --no-index --find-links=/wheels \
        numpy \
        pandas \
        scikit-learn \
        matplotlib \
        seaborn \
        scipy \
        plotly \
        requests \
        joblib \
        tqdm \
    && pip install --no-cache-dir ipywidgets jupyterlab-widgets \
    # Enable Jupyter widgets extension
    && jupyter nbextension enable --py widgetsnbextension --sys-prefix \
    && echo "All packages installed successfully" \
    # Smoke test: verify critical imports work at build time
    && python -c "import numpy, pandas, sklearn, matplotlib, seaborn; print('✅ All ML libraries verified')"

# ── Auto-import startup script ────────────────────────────────────────────────
# This file runs at every kernel start → np, pd, plt, sns always available
COPY 00_imports.py /home/jovyan/.ipython/profile_default/startup/00_imports.py

# ── Pre-built starter notebook in work directory ──────────────────────────────
# Users see a ready-to-run notebook the moment they open JupyterLab
COPY startup.ipynb /home/jovyan/work/00_Getting_Started.ipynb

# Fix permissions so jovyan owns the startup files
USER root
RUN chown -R ${NB_UID}:${NB_GID} /home/jovyan/.ipython \
    && chown ${NB_UID}:${NB_GID} /home/jovyan/work/00_Getting_Started.ipynb
USER ${NB_UID}

# Set working directory to PVC mount path
WORKDIR /home/jovyan/work

# Healthcheck: ping Jupyter API to confirm it's alive
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8888/api || exit 1

EXPOSE 8888

# Allow JUPYTER_TOKEN to be injected at runtime via env var.
# start-notebook.sh from the base image reads JUPYTER_TOKEN automatically.
CMD ["start-notebook.sh", \
     "--NotebookApp.allow_origin=*", \
     "--NotebookApp.base_url=/", \
     "--NotebookApp.disable_check_xsrf=True"]
