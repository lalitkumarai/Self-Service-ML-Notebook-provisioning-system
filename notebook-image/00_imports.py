# =============================================================================
# IPython Kernel Auto-Import Script
# Location: /home/jovyan/.ipython/profile_default/startup/00_imports.py
# 
# This file runs AUTOMATICALLY every time a Jupyter kernel starts.
# All aliases defined here are available in EVERY notebook cell immediately.
# Users never need to write import statements again.
# =============================================================================

import sys
import warnings
warnings.filterwarnings('ignore')

# ── Core Scientific Stack ─────────────────────────────────────────────────────
try:
    import numpy as np
    print(f'  numpy      {np.__version__}')
except ImportError:
    print('  [WARN] numpy not available')

try:
    import pandas as pd
    pd.set_option('display.max_columns', 50)
    pd.set_option('display.float_format', '{:.4f}'.format)
    pd.set_option('display.max_rows', 100)
    print(f'  pandas     {pd.__version__}')
except ImportError:
    print('  [WARN] pandas not available')

try:
    import matplotlib
    import matplotlib.pyplot as plt
    matplotlib.rcParams['figure.figsize'] = (10, 6)
    matplotlib.rcParams['axes.grid']      = True
    matplotlib.rcParams['grid.alpha']     = 0.3
    print(f'  matplotlib {matplotlib.__version__}')
except ImportError:
    print('  [WARN] matplotlib not available')

try:
    import seaborn as sns
    sns.set_palette('husl')
    print(f'  seaborn    {sns.__version__}')
except ImportError:
    print('  [WARN] seaborn not available')

try:
    import scipy
    print(f'  scipy      {scipy.__version__}')
except ImportError:
    print('  [WARN] scipy not available')

# ── Scikit-learn ──────────────────────────────────────────────────────────────
try:
    import sklearn
    from sklearn.model_selection  import train_test_split, cross_val_score, GridSearchCV
    from sklearn.preprocessing    import StandardScaler, MinMaxScaler, LabelEncoder, OneHotEncoder
    from sklearn.linear_model     import LinearRegression, LogisticRegression, Ridge, Lasso
    from sklearn.ensemble         import (RandomForestClassifier, RandomForestRegressor,
                                          GradientBoostingClassifier, GradientBoostingRegressor)
    from sklearn.svm              import SVC, SVR
    from sklearn.tree             import DecisionTreeClassifier
    from sklearn.neighbors        import KNeighborsClassifier
    from sklearn.metrics          import (accuracy_score, classification_report,
                                          confusion_matrix, mean_squared_error,
                                          r2_score, f1_score, roc_auc_score)
    from sklearn.pipeline         import Pipeline
    from sklearn.impute           import SimpleImputer
    print(f'  scikit-learn {sklearn.__version__}')
except ImportError:
    print('  [WARN] scikit-learn not available')

# ── Plotly (optional) ─────────────────────────────────────────────────────────
try:
    import plotly.express as px
    import plotly.graph_objects as go
    print(f'  plotly     {px.__version__}')
except ImportError:
    pass  # Optional — no warning

# ── Standard library helpers ──────────────────────────────────────────────────
import os, sys, json, math, time, random, datetime
from pathlib import Path
from collections import Counter, defaultdict

print('\n✅ ML environment ready — np, pd, plt, sns, sklearn all imported!\n')
