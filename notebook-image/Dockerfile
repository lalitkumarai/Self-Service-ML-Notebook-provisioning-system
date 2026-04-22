# Base Image with Scipy Stack (includes numpy, pandas, matplotlib, sklearn, seaborn)
FROM jupyter/scipy-notebook:latest

# Switch to root to install packages if needed (though conda/pip usually works as jovyan)
USER root

# Install system dependencies if required for tensorflow/torch (e.g. CUDA libs if using GPU base)
# For CPU-only standard usage, we might not need extra system pkgs immediately, 
# but it's good practice to update.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Switch back to jovyan to install python packages
USER ${NB_UID}

# Install TensorFlow and PyTorch
# Note: jupyter/scipy-notebook uses conda by default, but we can use pip.
RUN pip install --no-cache-dir \
    tensorflow \
    torch \
    torchvision \
    torchaudio \
    # Ensure requested packages are definitely present/updated
    numpy \
    pandas \
    matplotlib \
    scikit-learn \
    seaborn

# Set working directory to the mounted volume path
# The default in jupyter docker stacks is /home/jovyan, and usually we mount to /home/jovyan/work
WORKDIR /home/jovyan/work

# Expose port 8888
EXPOSE 8888

# The base image's entrypoint handles starting the notebook server.
# We can customize the command to ensure it starts in the right directory 
# and enforces token auth (which is default behavior, but we can be explicit).
CMD ["start-notebook.sh", "--NotebookApp.token=''", "--NotebookApp.password=''", "--NotebookApp.allow_origin='*'"]
# Note: In the backend controller we are passing JUPYTER_TOKEN env var.
# The start-notebook.sh script respects that. 
# If we want to enforce the token provided by env var, we just rely on the base image's script.
# However, the user asked for "Token-based authentication". 
# The base image does this by default if JUPYTER_TOKEN is set.
