#!/usr/bin/env python3
"""
50-Image Real AI Demonstration & Validation Script for TexWaste.ai
Runs genuine textile images through the production V1 classifier and OpenCV pipeline.
Does NOT create any WasteBatch database records.
"""

import os
import json
import csv
from pathlib import Path
from datetime import datetime

import numpy as np

# Adjust sys.path to allow importing backend app modules
import sys
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from app.api.classifier import fabric_classifier
from app.api.image_processing import analyze_image_properties

DATASET_ROOT = Path("/ml/dataset/Fabrics") if Path("/ml/dataset/Fabrics").exists() else BASE_DIR / "ml" / "dataset" / "Fabrics"
EVAL_DIR = Path("/ml/evaluation") if Path("/ml/evaluation").exists() else BASE_DIR / "ml" / "evaluation"
EVAL_DIR.mkdir(parents=True, exist_ok=True)

# 10 Approved Core Taxonomies and their exact dataset source folders
MATERIAL_MAPPING = {
    "Cotton": "Cotton",
    "Polyester": "Polyester",
    "Denim": "Denim",
    "Wool": "Wool",
    "Silk": "Silk",
    "Nylon": "Nylon",
    "Rayon": "Viscose",
    "Linen": "Linen",
    "Acrylic": "Acrylic",
    "Mixed Fabrics": "Blended"
}

def main():
    print("======================================================================")
    print("TEXWASTE.AI — 50-IMAGE REAL AI PIPELINE VALIDATION")
    print("Model: EfficientNet-B0 (Production V1 Checkpoint)")
    print("Source: ml/dataset/Fabrics (Curated Real Physical Swatches)")
    print("======================================================================\n")

    if not DATASET_ROOT.exists():
        raise FileNotFoundError(f"Dataset root not found: {DATASET_ROOT}")

    validation_records = []
    misclassifications = []
    batch_idx = 0

    classes_list = list(MATERIAL_MAPPING.keys())
    confusion_matrix = {true_c: {pred_c: 0 for pred_c in classes_list} for true_c in classes_list}

    for expected_material, folder_name in MATERIAL_MAPPING.items():
        mat_dir = DATASET_ROOT / folder_name
        if not mat_dir.exists():
            raise FileNotFoundError(f"Missing folder: {mat_dir}")

        sample_dirs = sorted([d for d in mat_dir.iterdir() if d.is_dir() and not d.name.startswith(".")])
        step = max(1, len(sample_dirs) // 5)
        selected_samples = [sample_dirs[i * step] for i in range(5)]

        print(f"Evaluating 5 real images for [{expected_material}] (from {folder_name}/):")

        for s_dir in selected_samples:
            batch_idx += 1
            img_files = sorted([f for f in s_dir.iterdir() if f.is_file() and f.suffix.lower() in [".png", ".jpg", ".jpeg"]])
            if not img_files:
                continue
            img_path = img_files[0]

            # Run genuine production V1 deep learning classifier
            ml_res = fabric_classifier.predict(str(img_path))
            pred_material = ml_res["predicted_material"]
            conf_pct = ml_res["confidence_pct"]
            conf_float = ml_res["confidence"]

            # Run genuine production OpenCV feature extraction
            cv_res = analyze_image_properties(str(img_path))

            # Ground truth matching logic
            is_correct = (pred_material.lower() == expected_material.lower()) or (expected_material == "Rayon" and "viscose" in pred_material.lower())

            # Map predicted material to standard 10-class names for confusion matrix
            pred_mapped = pred_material
            for target_c in classes_list:
                if target_c.lower() == pred_material.lower() or (target_c == "Rayon" and "viscose" in pred_material.lower()):
                    pred_mapped = target_c
                    break
            if pred_mapped in confusion_matrix[expected_material]:
                confusion_matrix[expected_material][pred_mapped] += 1

            rel_path = str(img_path.relative_to(BASE_DIR)) if BASE_DIR in img_path.parents else str(img_path)

            record = {
                "index": batch_idx,
                "image_path": rel_path,
                "sample_id": s_dir.name,
                "ground_truth_class": expected_material,
                "source_dataset_folder": folder_name,
                "ai_predicted_material": pred_material,
                "is_correct": is_correct,
                "confidence_pct": round(conf_pct, 2),
                "confidence_float": round(conf_float, 4),
                "detected_color": cv_res["color"],
                "color_hex": cv_res.get("color_hex", "#000000"),
                "damage_score": round(cv_res["damage_score"], 2),
                "contamination_detected": cv_res["contamination_detected"],
                "structural_integrity": round(cv_res["structural_integrity"], 2),
                "stain_risk": round(cv_res["stain_risk"], 2),
                "weave_pattern": cv_res["weave_pattern"]
            }
            validation_records.append(record)

            if not is_correct:
                misclassifications.append({
                    "index": batch_idx,
                    "image": rel_path,
                    "expected": expected_material,
                    "predicted": pred_material,
                    "confidence": conf_pct
                })

            icon = "✓" if is_correct else "✗"
            print(f"  [{batch_idx:02d}/50] Sample {s_dir.name:6s} | Pred: {pred_material:15s} ({conf_pct:5.1f}%) {icon} | Dmg: {cv_res['damage_score']:4.1f} | Weave: {cv_res['weave_pattern']}")

    total_eval = len(validation_records)
    correct_eval = sum(1 for r in validation_records if r["is_correct"])
    overall_acc = (correct_eval / total_eval) * 100.0 if total_eval > 0 else 0.0
    avg_conf = float(np.mean([r["confidence_pct"] for r in validation_records]))

    per_class_summary = {}
    for c in classes_list:
        c_records = [r for r in validation_records if r["ground_truth_class"] == c]
        c_corr = sum(1 for r in c_records if r["is_correct"])
        c_tot = len(c_records)
        c_acc = (c_corr / c_tot) * 100.0 if c_tot > 0 else 0.0
        c_avg_conf = float(np.mean([r["confidence_pct"] for r in c_records])) if c_tot > 0 else 0.0
        per_class_summary[c] = {
            "total_images": c_tot,
            "correct": c_corr,
            "accuracy_pct": round(c_acc, 2),
            "avg_confidence_pct": round(c_avg_conf, 2)
        }

    report_json_path = EVAL_DIR / "ai_validation_50.json"
    report_csv_path = EVAL_DIR / "ai_validation_50.csv"

    output_json = {
        "title": "TexWaste.ai Production V1 AI Model 50-Image Validation Report",
        "model_checkpoint": "ml/models/textile_classifier.pth",
        "architecture": "EfficientNet-B0 (10 Classes)",
        "evaluated_at": datetime.utcnow().isoformat() + "Z",
        "dataset_source": "ml/dataset/Fabrics",
        "summary": {
            "total_images": total_eval,
            "correct_predictions": correct_eval,
            "overall_accuracy_pct": round(overall_acc, 2),
            "average_confidence_pct": round(avg_conf, 2),
            "misclassifications_count": len(misclassifications)
        },
        "per_class_accuracy": per_class_summary,
        "confusion_matrix": confusion_matrix,
        "misclassified_images": misclassifications,
        "all_50_evaluations": validation_records
    }

    with open(report_json_path, "w") as f:
        json.dump(output_json, f, indent=2)

    with open(report_csv_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Index", "Image Path", "Sample ID", "Ground Truth Class", "Source Folder",
            "AI Predicted Material", "Result", "Confidence (%)", "Detected Color",
            "Damage Score", "Contamination Detected", "Structural Integrity", "Stain Risk", "Weave Pattern"
        ])
        for r in validation_records:
            writer.writerow([
                r["index"], r["image_path"], r["sample_id"], r["ground_truth_class"], r["source_dataset_folder"],
                r["ai_predicted_material"], "CORRECT" if r["is_correct"] else "MISCLASSIFIED",
                f"{r['confidence_pct']:.2f}%", r["detected_color"],
                f"{r['damage_score']:.2f}", "TRUE" if r["contamination_detected"] else "FALSE",
                f"{r['structural_integrity']:.2f}", f"{r['stain_risk']:.2f}", r["weave_pattern"]
            ])

    print("\n======================================================================")
    print("EVALUATION RESULTS SUMMARY")
    print("======================================================================")
    print(f"Total Evaluated : {total_eval}")
    print(f"Correct         : {correct_eval} / {total_eval}")
    print(f"Accuracy        : {overall_acc:.2f}%")
    print(f"Avg Confidence  : {avg_conf:.2f}%")
    print("----------------------------------------------------------------------")
    print(f"{'Class':16s} | {'Samples':8s} | {'Correct':8s} | {'Accuracy':10s} | {'Avg Conf':10s}")
    print("-" * 62)
    for c, s in per_class_summary.items():
        print(f"{c:16s} | {s['total_images']:8d} | {s['correct']:8d} | {s['accuracy_pct']:9.2f}% | {s['avg_confidence_pct']:9.2f}%")
    print("-" * 62)

    if misclassifications:
        print("\nMisclassified Images:")
        for m in misclassifications:
            print(f"  • #{m['index']:02d} Expected [{m['expected']}] -> Predicted [{m['predicted']}] ({m['confidence']:.1f}%) | {m['image']}")

    print(f"\nSaved Reports to:")
    print(f"  • JSON : {report_json_path}")
    print(f"  • CSV  : {report_csv_path}\n")

if __name__ == "__main__":
    main()
