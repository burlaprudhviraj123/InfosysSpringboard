#!/usr/bin/env python3
"""
Fabrics Textile Dataset Inspection & Audit Script
Analyzes material classes, sample counts, image formats/resolutions, corruptions, and fiber tags.
Generates ml/dataset_report.json
"""

import os
import json
import glob
from collections import Counter
from PIL import Image

def inspect_fabrics_dataset(dataset_dir="ml/dataset/Fabrics", output_report="ml/dataset_report.json"):
    print(f"Starting inspection of dataset at: {dataset_dir}")
    
    if not os.path.exists(dataset_dir):
        raise FileNotFoundError(f"Dataset directory not found: {dataset_dir}")

    report = {
        "dataset_path": os.path.abspath(dataset_dir),
        "total_material_folders": 0,
        "total_sample_folders": 0,
        "total_images": 0,
        "total_tag_files": 0,
        "missing_tag_files": 0,
        "corrupt_images": [],
        "image_formats": {},
        "image_dimensions": {},
        "material_distribution": {},
        "fiber_composition_types": {},
        "tag_sample_examples": {}
    }

    material_dirs = sorted([d for d in os.listdir(dataset_dir) if os.path.isdir(os.path.join(dataset_dir, d)) and not d.startswith('.')])
    report["total_material_folders"] = len(material_dirs)
    report["available_materials"] = material_dirs

    image_format_counter = Counter()
    image_dim_counter = Counter()
    fiber_type_counter = Counter()
    
    total_size_bytes = 0

    for mat in material_dirs:
        mat_path = os.path.join(dataset_dir, mat)
        sample_dirs = [s for s in os.listdir(mat_path) if os.path.isdir(os.path.join(mat_path, s)) and not s.startswith('.')]
        
        sample_count = len(sample_dirs)
        images_in_mat = 0
        tags_in_mat = 0
        examples_for_mat = []

        for sample in sample_dirs:
            sample_path = os.path.join(mat_path, sample)
            report["total_sample_folders"] += 1

            # Check images
            img_files = glob.glob(os.path.join(sample_path, "*.png")) + \
                        glob.glob(os.path.join(sample_path, "*.jpg")) + \
                        glob.glob(os.path.join(sample_path, "*.jpeg"))
            
            images_in_mat += len(img_files)
            report["total_images"] += len(img_files)

            for img_p in img_files:
                try:
                    total_size_bytes += os.path.getsize(img_p)
                    with Image.open(img_p) as img:
                        fmt = img.format
                        size_str = f"{img.width}x{img.height}"
                        image_format_counter[fmt] += 1
                        image_dim_counter[size_str] += 1
                except Exception as e:
                    report["corrupt_images"].append({"path": img_p, "error": str(e)})

            # Check tag.txt
            tag_path = os.path.join(sample_path, "tag.txt")
            if os.path.exists(tag_path):
                tags_in_mat += 1
                report["total_tag_files"] += 1
                total_size_bytes += os.path.getsize(tag_path)
                try:
                    with open(tag_path, "r", encoding="utf-8", errors="ignore") as f:
                        lines = [line.strip() for line in f.readlines() if line.strip()]
                        if len(examples_for_mat) < 3 and lines:
                            examples_for_mat.append({"sample_id": sample, "content": lines})
                        # Analyze fiber compositions
                        for l in lines:
                            tokens = l.split()
                            # check composition lines
                            for token in tokens:
                                if token.isalpha() and token not in ["Pants", "T-shirt", "Fabric", "Dress", "Shirt", "Skirt", "Jacket", "Coat", "Sweater"]:
                                    fiber_type_counter[token] += 1
                except Exception as e:
                    print(f"Error reading {tag_path}: {e}")
            else:
                report["missing_tag_files"] += 1

        report["material_distribution"][mat] = {
            "samples": sample_count,
            "images": images_in_mat,
            "tag_files": tags_in_mat
        }
        if examples_for_mat:
            report["tag_sample_examples"][mat] = examples_for_mat

    report["dataset_size_mb"] = round(total_size_bytes / (1024 * 1024), 2)
    report["image_formats"] = dict(image_format_counter)
    report["image_dimensions"] = dict(image_dim_counter.most_common(10))
    report["fiber_composition_types"] = dict(fiber_type_counter.most_common(20))

    # Save to json report
    os.makedirs(os.path.dirname(output_report), exist_ok=True)
    with open(output_report, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("\n" + "="*60)
    print("DATASET INSPECTION COMPLETE")
    print("="*60)
    print(f"Dataset Path: {report['dataset_path']}")
    print(f"Dataset Size: {report['dataset_size_mb']} MB (~{round(report['dataset_size_mb']/1024, 2)} GB)")
    print(f"Total Materials: {report['total_material_folders']}")
    print(f"Total Sample Folders: {report['total_sample_folders']}")
    print(f"Total Images: {report['total_images']}")
    print(f"Total tag.txt Files: {report['total_tag_files']}")
    print(f"Missing tag.txt: {report['missing_tag_files']}")
    print(f"Corrupt Images: {len(report['corrupt_images'])}")
    print(f"Image Formats: {report['image_formats']}")
    print(f"Top Image Dimensions: {report['image_dimensions']}")
    print(f"Report saved to: {output_report}")
    print("="*60)

    return report

if __name__ == "__main__":
    inspect_fabrics_dataset()
