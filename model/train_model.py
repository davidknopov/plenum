"""
Train Random Forest on NYC conversion data, export as JSON for client-side inference.
"""
import json
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

FEATURES = [
    "numfloors", "lotarea", "bldgarea", "yearbuilt", "far",
    "is_office", "is_prewar", "is_postwar_ideal", "is_modern",
    # Extended features — populated by collect_outcomes.py
    "is_landmark", "is_floodzone", "is_irregular", "office_ratio",
]

def tree_to_dict(tree):
    t = tree.tree_
    def recurse(node):
        if t.children_left[node] == -1:
            counts = t.value[node][0]
            total = counts.sum()
            return {"p": round(float(counts[1] / total), 4) if total > 0 else 0.5}
        return {
            "f": int(t.feature[node]),
            "t": round(float(t.threshold[node]), 4),
            "l": recurse(t.children_left[node]),
            "r": recurse(t.children_right[node]),
        }
    return recurse(0)

def main():
    df = pd.read_csv("model/training_data.csv")
    # Fill any missing extended feature columns with 0 (backwards compatible)
    for col in FEATURES:
        if col not in df.columns:
            df[col] = 0
    X = df[FEATURES].values
    y = df["outcome"].values

    rf = RandomForestClassifier(
        n_estimators=60, max_depth=5, min_samples_leaf=2,
        random_state=42, class_weight="balanced"
    )
    rf.fit(X, y)

    scores = cross_val_score(rf, X, y, cv=5, scoring="accuracy")
    print(f"Cross-val accuracy: {scores.mean():.2f} ± {scores.std():.2f}")

    print("\nFeature importances:")
    for name, imp in sorted(zip(FEATURES, rf.feature_importances_), key=lambda x: -x[1]):
        print(f"  {name:20s} {imp:.3f}")

    model_json = {
        "features": FEATURES,
        "trees": [tree_to_dict(est) for est in rf.estimators_],
        "feature_importances": {n: round(float(v), 4)
                                for n, v in zip(FEATURES, rf.feature_importances_)},
    }

    outpath = "src/scoring/model.json"
    with open(outpath, "w") as f:
        json.dump(model_json, f)
    print(f"\nExported {len(rf.estimators_)} trees to {outpath}")
    print(f"Size: {len(json.dumps(model_json)) / 1024:.1f} KB")

    # Verify predictions
    probs = rf.predict_proba(X)[:, 1]
    correct = sum((p >= 0.5) == (y[i] == 1) for i, p in enumerate(probs))
    print(f"\nTraining accuracy: {correct}/{len(y)} ({correct/len(y)*100:.0f}%)")
    print("\nSample predictions:")
    for i, row in df.iterrows():
        s = int(round(probs[i] * 100))
        actual = "✅" if row["outcome"] == 1 else "❌"
        pred = "✅" if probs[i] >= 0.5 else "❌"
        match = "✓" if (probs[i] >= 0.5) == (row["outcome"] == 1) else "✗"
        print(f"  {actual} {row['notes'][:40]:40s} → {s:3d}  {pred} {match}")

if __name__ == "__main__":
    main()
