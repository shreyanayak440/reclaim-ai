import pandas as pd

# Load dataset
df = pd.read_csv("data/failed_payments.csv")

print("Dataset loaded successfully!")
print("Shape:", df.shape)
print("\nColumns:")
print(df.columns.tolist())
# Features and target
X = df.drop(columns=["customer_id", "recovery_outcome"])
y = df["recovery_outcome"]

print("\nFEATURES:")
print(X.columns.tolist())

print("\nTARGET:")
print(y.name)
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression

# Categorical columns
categorical_features = [
    "payment_method",
    "failure_reason",
    "previous_recovery",
    "intervention"
]

# Numerical columns
numerical_features = [
    "amount",
    "previous_payments",
    "previous_successes",
    "previous_failures",
    "customer_tenure_months",
    "average_payment_amount",
    "retry_count"
]

# Preprocessing
preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        ),
        (
            "numerical",
            StandardScaler(),
            numerical_features
        )
    ]
)

# Split raw data first
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nDATA SPLIT SUCCESSFUL!")
print("Training samples:", X_train.shape[0])
print("Testing samples:", X_test.shape[0])

# Create ML pipeline
model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        (
            "classifier",
            LogisticRegression(
                max_iter=3000,
                random_state=42
            )
        )
    ]
)

# Train model
model.fit(X_train, y_train)

print("\nMODEL TRAINING SUCCESSFUL!")


from sklearn.metrics import accuracy_score, classification_report

# Make predictions on unseen test data
y_pred = model.predict(X_test)

# Calculate accuracy
accuracy = accuracy_score(y_test, y_pred)

print("\nMODEL ACCURACY:")
print(f"{accuracy * 100:.2f}%")

print("\nCLASSIFICATION REPORT:")
print(classification_report(y_test, y_pred))
import joblib

# Save trained model
joblib.dump(model, "models/reclaim_model.pkl")

print("\nMODEL SAVED!")
print("Location: models/reclaim_model.pkl") 