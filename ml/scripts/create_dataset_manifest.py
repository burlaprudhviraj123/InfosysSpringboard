#!/usr/bin/env python3
"""
Fabrics Textile Dataset Manifest & Sample-Level Splitter (Phase 2B)
- Maps 10 material classes to project taxonomy
- Performs sample-level stratified split (preventing data leakage across sample images)
- Extracts and preserves garment_type and fiber_composition from tag.txt
- Outputs ml/dataset_manifest.csv and ml/class_distribution.json
"""

import os
import glob
import json
import random
import pandas as pd
from collections import defaultdict

CLASS_MAPPING = {
    "Acrylic": "Acrylic",
    "Cotton": "Cotton",
    "Denim": "Denim",
    "Linen": "Linen",
    "Nylon": "Nylon",
    "Polyester": "Polyester",
    "Silk": "Silk",
    "Wool": "Wool",
    "Viscose": "Rayon (Viscose)",
    "Blended": "Mixed Fabrics"
}

def parse_tag_file(tag_path):
    garment_type = "Unknown"
    fiber_comp = "Unknown"
    
    if os.path.exists(tag_path):
        try:
            with open(tag_path, "r", encoding="utf-8", errors="ignore") as f:
                lines = [l.strip() for l in f.readlines() if l.strip()]
                if len(lines) >= 1:
                    garment_type = lines[0]
                if len(lines) >= 2:
                    fiber_comp = " ".join(lines[1:])
                elif len(lines) == 1 and any(c.isdigit() for c in lines[0]):
                    fiber_comp = lines[0]
                    garment_type = "Fabric"
        except Exception as e:
            print(f"Error reading {tag_path}: {e}")
            
    return garment_type, fiber_comp

def build_dataset_manifest(
    dataset_dir="ml/dataset/Fabrics",
    output_csv="ml/dataset_manifest.csv",
    output_dist="ml/class_distribution.json",
    train_ratio=0.70,
    val_ratio=0.15,
    test_ratio=0.15,
    random_seed=42
):
    random.seed(random_seed)
    print(f"Building dataset manifest from: {dataset_dir}")
    print(f"Using 10-class material taxonomy: {list(CLASS_MAPPING.values())}")
    
    records = []
    class_stats = {}
    parsing_issues = []

    total_valid_samples = 0
    total_valid_images = 0

    for orig_folder, proj_class in CLASS_MAPPING.items():
        folder_path = os.path.join(dataset_dir, orig_folder)
        if not os.path.exists(folder_path):
            print(f"Warning: Folder not found: {folder_path}")
            continue

        sample_ids = sorted([
            s for s in os.listdir(folder_path) 
            if os.path.isdir(os.path.join(folder_path, s)) and not s.startswith('.')
        ])
        
        num_samples = len(sample_ids)
        if num_samples == 0:
            print(f"Warning: No samples found in {folder_path}")
            continue

        # Shuffle sample IDs deterministically
        shuffled_samples = sample_ids.copy()
        random.shuffle(shuffled_samples)

        # Compute sample-level split boundaries
        n_train = int(round(num_samples * train_ratio))
        n_val = int(round(num_samples * val_ratio))
        
        # Ensure at least 1 sample in val and test if samples >= 3
        if num_samples >= 3:
            n_val = max(1, n_val)
            n_test = max(1, num_samples - n_train - n_val)
            # Rebalance train if needed
            n_train = num_samples - n_val - n_test
        else:
            n_val = 0
            n_test = 0
            n_train = num_samples

        train_samples = set(shuffled_samples[:n_train])
        val_samples = set(shuffled_samples[n_train:n_train + n_val])
        test_samples = set(shuffled_samples[n_train + n_val:])

        class_sample_count = 0
        class_img_count = 0
        split_sample_counts = {"train": len(train_samples), "val": len(val_samples), "test": len(test_samples)}
        split_img_counts = {"train": 0, "val": 0, "test": 0}

        for s_id in sample_ids:
            s_path = os.path.join(folder_path, s_id)
            if s_id in train_samples:
                split_name = "train"
            elif s_id in val_samples:
                split_name = "val"
            else:
                split_name = "test"

            # Parse tag metadata
            tag_file = os.path.join(s_path, "tag.txt")
            garment_type, fiber_comp = parse_tag_file(tag_file)
            if garment_type == "Unknown" and fiber_comp == "Unknown":
                parsing_issues.append({"original_folder": orig_folder, "sample_id": s_id, "issue": "Missing or empty tag.txt"})

            # Find images for this sample
            img_paths = sorted(glob.glob(os.path.join(s_path, "*.png")) + glob.glob(os.path.join(s_path, "*.jpg")))
            
            if len(img_paths) == 0:
                parsing_issues.append({"original_folder": orig_folder, "sample_id": s_id, "issue": "No images found in sample folder"})
                continue

            class_sample_count += 1
            total_valid_samples += 1

            for img_p in img_paths:
                # Relative path from project root
                rel_img_path = os.path.relpath(img_p, start=os.getcwd())
                records.append({
                    "image_path": rel_img_path,
                    "sample_id": s_id,
                    "original_folder": orig_folder,
                    "project_class": proj_class,
                    "split": split_name,
                    "garment_type": garment_type,
                    "fiber_composition": fiber_comp
                })
                class_img_count += 1
                total_valid_images += 1
                split_img_counts[split_name] += 1

        class_stats[proj_class] = {
            "original_folder": orig_folder,
            "total_samples": class_sample_count,
            "total_images": class_img_count,
            "sample_splits": split_sample_counts,
            "image_splits": split_img_counts,
            "is_small_class": class_sample_count < 30
        }

    # Save DataFrame to CSV
    df = pd.DataFrame(records)
    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    df.to_csv(output_csv, index=False)

    summary_report = {
        "total_taxonomy_classes": len(CLASS_MAPPING),
        "total_samples_selected": total_valid_samples,
        "total_images_selected": total_valid_images,
        "split_summary_samples": {
            "train": sum(c["sample_splits"]["train"] for c in class_stats.values()),
            "val": sum(c["sample_splits"]["val"] for c in class_stats.values()),
            "test": sum(c["sample_splits"]["test"] for c in class_stats.values())
        },
        "split_summary_images": {
            "train": sum(c["image_splits"]["train"] for c in class_stats.values()),
            "val": sum(c["image_splits"]["val"] for c in class_stats.values()),
            "test": sum(c["image_splits"]["test"] for c in class_stats.values())
        },
        "class_distribution": class_stats,
        "parsing_issues": parsing_issues
    }

    with open(output_dist, "w", encoding="utf-8") as f:
        json.dump(summary_report, f, indent=2)

    print("\n" + "="*70)
    print("PHASE 2B MANIFEST & DISTRIBUTION GENERATION COMPLETE")
    print("="*70)
    print(f"Manifest written to: {output_csv} ({len(df)} rows)")
    print(f"Distribution written to: {output_dist}")
    print(f"Total Selected Samples: {total_valid_samples} | Total Selected Images: {total_valid_images}")
    print("\nDetailed 10-Class Sample & Image Distribution:")
    print("-" * 70)
    print(f"{'Project Class':<20} | {'Original Folder':<15} | {'Samples (Tr/Val/Te)':<20} | {'Images (Total)'}")
    print("-" * 70)
    for p_cls, stats in sorted(class_stats.items(), key=lambda x: x[1]['total_samples'], reverse=True):
        samp_str = f"{stats['total_samples']} ({stats['sample_splits']['train']}/{stats['sample_splits']['val']}/{stats['sample_splits']['test']})"
        flag = " [SMALL CLASS]" if stats['is_small_class'] else ""
        print(f"{p_cls:<20} | {stats['original_folder']:<15} | {samp_str:<20} | {stats['total_images']}{flag}")
    print("="*70)

    return summary_report

if __name__ == "__main__":
    build_dataset_manifest()
