// ─── ML Notebook Templates ───────────────────────────────────────────────────
const templates = {
  'data-analysis': {
    id: 'data-analysis',
    name: 'Data Analysis',
    description: 'Explore and visualize your dataset with pandas, matplotlib and seaborn.',
    icon: '📊',
    tags: ['EDA', 'Pandas', 'Matplotlib'],
    cells: [
      {
        id: 'cell-1', type: 'markdown',
        source: '# 📊 Data Analysis Notebook\nExplore your dataset with visualizations and statistics.',
      },
      {
        id: 'cell-2', type: 'code',
        source: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Load your dataset (update path as needed)
# df = pd.read_csv('/data/your_dataset.csv')

# Demo dataset
from sklearn.datasets import load_iris
iris = load_iris(as_frame=True)
df = iris.frame
df.head()`,
      },
      {
        id: 'cell-3', type: 'code',
        source: `# Dataset overview
print(f"Shape: {df.shape}")
print(f"\\nData Types:\\n{df.dtypes}")
print(f"\\nMissing Values:\\n{df.isnull().sum()}")
df.describe()`,
      },
      {
        id: 'cell-4', type: 'code',
        source: `# Correlation Heatmap
plt.figure(figsize=(10, 8))
sns.heatmap(df.corr(), annot=True, cmap='coolwarm', fmt='.2f')
plt.title('Feature Correlation Matrix')
plt.tight_layout()
plt.show()`,
      },
      {
        id: 'cell-5', type: 'code',
        source: `# Distribution plots
fig, axes = plt.subplots(2, 2, figsize=(12, 8))
for i, col in enumerate(df.select_dtypes(include=[np.number]).columns[:4]):
    ax = axes[i // 2, i % 2]
    df[col].hist(ax=ax, bins=20, color='steelblue', edgecolor='white')
    ax.set_title(f'Distribution of {col}')
plt.tight_layout()
plt.show()`,
      },
    ],
  },

  'regression': {
    id: 'regression',
    name: 'Regression',
    description: 'Train and evaluate a regression model end-to-end.',
    icon: '📈',
    tags: ['ML', 'Scikit-learn', 'Regression'],
    cells: [
      {
        id: 'cell-1', type: 'markdown',
        source: '# 📈 Regression Model\nEnd-to-end pipeline: data loading → preprocessing → training → evaluation.',
      },
      {
        id: 'cell-2', type: 'code',
        source: `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib.pyplot as plt

# Load dataset
from sklearn.datasets import fetch_california_housing
data = fetch_california_housing(as_frame=True)
df = data.frame
print(df.head())`,
      },
      {
        id: 'cell-3', type: 'code',
        source: `# Prepare features and target
X = df.drop(columns=['MedHouseVal'])
y = df['MedHouseVal']

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale features
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)
print(f"Training samples: {len(X_train)}, Test samples: {len(X_test)}")`,
      },
      {
        id: 'cell-4', type: 'code',
        source: `# Train model
model = Ridge(alpha=1.0)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"MSE:  {mse:.4f}")
print(f"RMSE: {np.sqrt(mse):.4f}")
print(f"R²:   {r2:.4f}")`,
      },
      {
        id: 'cell-5', type: 'code',
        source: `# Prediction vs Actual
plt.figure(figsize=(8, 6))
plt.scatter(y_test, y_pred, alpha=0.4, color='steelblue')
plt.plot([y.min(), y.max()], [y.min(), y.max()], 'r--', lw=2)
plt.xlabel('Actual Values')
plt.ylabel('Predicted Values')
plt.title('Ridge Regression: Actual vs Predicted')
plt.tight_layout()
plt.show()`,
      },
    ],
  },

  'classification': {
    id: 'classification',
    name: 'Classification',
    description: 'Build a classification pipeline with feature engineering and model evaluation.',
    icon: '🏷️',
    tags: ['ML', 'Scikit-learn', 'Classification'],
    cells: [
      {
        id: 'cell-1', type: 'markdown',
        source: '# 🏷️ Classification Model\nBuild, train and evaluate a multi-class classifier.',
      },
      {
        id: 'cell-2', type: 'code',
        source: `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# Load dataset
from sklearn.datasets import load_iris
data = load_iris(as_frame=True)
df = data.frame
df['target_name'] = data.target_names[df['target']]
print(df.head())`,
      },
      {
        id: 'cell-3', type: 'code',
        source: `# Prepare data
X = df.drop(columns=['target', 'target_name'])
y = df['target']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)
print(f"Classes: {data.target_names}")`,
      },
      {
        id: 'cell-4', type: 'code',
        source: `# Train Random Forest
clf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"Accuracy: {acc:.4f}")
print("\\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=data.target_names))`,
      },
      {
        id: 'cell-5', type: 'code',
        source: `# Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(7, 5))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=data.target_names, yticklabels=data.target_names)
plt.title('Confusion Matrix')
plt.ylabel('True Label')
plt.xlabel('Predicted Label')
plt.tight_layout()
plt.show()`,
      },
      {
        id: 'cell-6', type: 'code',
        source: `# Feature Importance
feat_imp = pd.Series(clf.feature_importances_, index=data.feature_names).sort_values(ascending=False)
feat_imp.plot(kind='bar', color='steelblue', figsize=(8, 4))
plt.title('Feature Importances')
plt.tight_layout()
plt.show()`,
      },
    ],
  },

  'neural-network': {
    id: 'neural-network',
    name: 'Neural Network',
    description: 'Build and train a neural network with PyTorch.',
    icon: '🧠',
    tags: ['Deep Learning', 'PyTorch', 'Neural Net'],
    cells: [
      {
        id: 'cell-1', type: 'markdown',
        source: '# 🧠 Neural Network with PyTorch\nDefine, train and evaluate a neural network end-to-end.',
      },
      {
        id: 'cell-2', type: 'code',
        source: `import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import numpy as np
import matplotlib.pyplot as plt

# Check device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")`,
      },
      {
        id: 'cell-3', type: 'code',
        source: `# Generate synthetic dataset
X, y = make_classification(n_samples=1000, n_features=20, n_informative=15, n_classes=2, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Convert to tensors
X_train_t = torch.FloatTensor(X_train).to(device)
y_train_t = torch.LongTensor(y_train).to(device)
X_test_t = torch.FloatTensor(X_test).to(device)
y_test_t = torch.LongTensor(y_test).to(device)`,
      },
      {
        id: 'cell-4', type: 'code',
        source: `# Define model
class MLP(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim), nn.ReLU(), nn.Dropout(0.3),
            nn.Linear(hidden_dim, hidden_dim // 2), nn.ReLU(), nn.Dropout(0.2),
            nn.Linear(hidden_dim // 2, output_dim)
        )
    def forward(self, x):
        return self.net(x)

model = MLP(20, 128, 2).to(device)
optimizer = optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)
criterion = nn.CrossEntropyLoss()
print(model)`,
      },
      {
        id: 'cell-5', type: 'code',
        source: `# Training loop
losses = []
for epoch in range(50):
    model.train()
    optimizer.zero_grad()
    out = model(X_train_t)
    loss = criterion(out, y_train_t)
    loss.backward()
    optimizer.step()
    losses.append(loss.item())
    if (epoch + 1) % 10 == 0:
        print(f"Epoch {epoch+1:3d} | Loss: {loss.item():.4f}")

plt.plot(losses)
plt.title('Training Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.show()`,
      },
      {
        id: 'cell-6', type: 'code',
        source: `# Evaluate
model.eval()
with torch.no_grad():
    preds = model(X_test_t).argmax(dim=1)
    acc = (preds == y_test_t).float().mean().item()
print(f"Test Accuracy: {acc * 100:.2f}%")`,
      },
    ],
  },
};

// GET /api/templates - list all templates
const getTemplates = (req, res) => {
  const list = Object.values(templates).map(({ id, name, description, icon, tags }) => ({
    id, name, description, icon, tags,
  }));
  res.json({ success: true, templates: list });
};

// GET /api/templates/:id - get full template cells
const getTemplate = (req, res) => {
  const template = templates[req.params.id];
  if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
  res.json({ success: true, template });
};

module.exports = { getTemplates, getTemplate };
