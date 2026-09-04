import pandas as pd

df = pd.read_csv("data/failed_payments.csv")

print("DATASET SHAPE")
print(df.shape)

print("\nCOLUMN NAMES")
print(df.columns.tolist())

print("\nFIRST 10 RECORDS")
print(df.head(10))

print("\nMISSING VALUES")
print(df.isnull().sum())

print("\nRECOVERY OUTCOME")
print(df["recovery_outcome"].value_counts())

print("\nAVERAGE PAYMENT AMOUNT")
print(df["amount"].mean())

print("\nAVERAGE AMOUNT BY OUTCOME")
print(df.groupby("recovery_outcome")["amount"].mean())

print("\nFAILURE REASON BY OUTCOME")
print(
    pd.crosstab(
        df["failure_reason"],
        df["recovery_outcome"],
        normalize="index"
    ).round(3)
)