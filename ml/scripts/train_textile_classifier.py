#!/usr/bin/env python3
"""
Phase 2C — Train Legitimate PyTorch Textile Material Classifier
- Uses transfer learning with pretrained EfficientNet-B0
- 10-Class Textile Taxonomy (0: Acrylic, 1: Cotton, 2: Denim, ..., 9: Wool)
- Prevents data leakage: checks sample-level partitions
- Stage 1: Frozen backbone warmup
- Stage 2: Fine-tuning with differential learning rates & early stopping
- Held-out test set evaluation with Macro & Per-Class Precision/Recall/F1 + Confusion Matrix
"""

import os
import sys
import time
import json
import random
import numpy as np
import pandas as pd
from PIL import Image

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models

from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
    classification_report
)
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

# Set deterministic random seeds
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)

# 10-Class Taxonomy Definition
CLASS_TO_IDX = {
    "Acrylic": 0,
    "Cotton": 1,
    "Denim": 2,
    "Linen": 3,
    "Mixed Fabrics": 4,
    "Nylon": 5,
    "Polyester": 6,
    "Rayon (Viscose)": 7,
    "Silk": 8,
    "Wool": 9
}
IDX_TO_CLASS = {v: k for k, v in CLASS_TO_IDX.items()}
NUM_CLASSES = len(CLASS_TO_IDX)

class TextileDataset(Dataset):
    def __init__(self, df, transform=None):
        self.df = df.reset_index(drop=True)
        self.transform = transform

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img_path = row['image_path']
        label_str = row['project_class']
        label = CLASS_TO_IDX[label_str]
        sample_id = row['sample_id']
        
        image = Image.open(img_path).convert('RGB')
        if self.transform:
            image = self.transform(image)

        return image, label, sample_id

def verify_data_leakage(manifest_df):
    """Verifies that no sample_id exists across multiple splits."""
    sample_splits = manifest_df.groupby('sample_id')['split'].nunique()
    leaked = sample_splits[sample_splits > 1]
    if len(leaked) > 0:
        raise ValueError(f"CRITICAL ERROR: Data leakage detected! Samples present in multiple splits: {leaked.index.tolist()}")
    print("Zero data-leakage verified: All physical sample IDs are strictly confined to a single split partition.")

def train_epoch(model, loader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels, _ in loader:
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        _, preds = torch.max(outputs, 1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)

    epoch_loss = running_loss / total
    epoch_acc = correct / total
    return epoch_loss, epoch_acc

def evaluate(model, loader, criterion, device):
    model.eval()
    running_loss = 0.0
    all_preds = []
    all_labels = []
    all_probs = []

    with torch.no_grad():
        for images, labels, _ in loader:
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * images.size(0)
            probs = torch.softmax(outputs, dim=1)
            _, preds = torch.max(outputs, 1)

            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
            all_probs.extend(probs.cpu().numpy())

    total = len(all_labels)
    eval_loss = running_loss / total if total > 0 else 0.0
    acc = accuracy_score(all_labels, all_preds)
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(all_labels, all_preds, average='macro', zero_division=0)
    p_weighted, r_weighted, f1_weighted, _ = precision_recall_fscore_support(all_labels, all_preds, average='weighted', zero_division=0)

    return {
        "loss": eval_loss,
        "accuracy": acc,
        "precision_macro": p_macro,
        "recall_macro": r_macro,
        "f1_macro": f1_macro,
        "precision_weighted": p_weighted,
        "recall_weighted": r_weighted,
        "f1_weighted": f1_weighted,
        "preds": all_preds,
        "labels": all_labels,
        "probs": all_probs
    }

def main():
    print("=" * 70)
    print("PHASE 2C: TEXTILE MATERIAL CLASSIFICATION TRAINING")
    print("=" * 70)

    # 1. Device Selection
    if torch.backends.mps.is_available():
        device = torch.device("mps")
        print("Device Selected: Apple Silicon GPU (MPS)")
    elif torch.cuda.is_available():
        device = torch.device("cuda")
        print(f"Device Selected: NVIDIA GPU CUDA ({torch.cuda.get_device_name(0)})")
    else:
        device = torch.device("cpu")
        print("Device Selected: CPU")

    # 2. Load Manifest
    manifest_path = "ml/dataset_manifest.csv"
    if not os.path.exists(manifest_path):
        raise FileNotFoundError(f"Manifest not found at {manifest_path}. Run create_dataset_manifest.py first.")
    
    df = pd.read_csv(manifest_path)
    df = df[df['project_class'].isin(CLASS_TO_IDX.keys())].copy()
    print(f"Loaded {len(df)} images across {df['sample_id'].nunique()} samples.")

    # 3. Verify Data Leakage
    verify_data_leakage(df)

    train_df = df[df['split'] == 'train'].copy()
    val_df = df[df['split'] == 'val'].copy()
    test_df = df[df['split'] == 'test'].copy()

    print(f"Dataset partitions -> Train: {len(train_df)} imgs ({train_df['sample_id'].nunique()} samples) | "
          f"Val: {len(val_df)} imgs ({val_df['sample_id'].nunique()} samples) | "
          f"Test: {len(test_df)} imgs ({test_df['sample_id'].nunique()} samples)")

    # 4. Data Augmentations
    # ImageNet stats for pretrained EfficientNet
    norm_mean = [0.485, 0.456, 0.406]
    norm_std = [0.229, 0.224, 0.225]
    img_size = 224

    train_transforms = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomCrop(img_size),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=10),
        transforms.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=norm_mean, std=norm_std)
    ])

    val_transforms = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.CenterCrop(img_size),
        transforms.ToTensor(),
        transforms.Normalize(mean=norm_mean, std=norm_std)
    ])

    # 5. DataLoaders
    batch_size = 32
    train_dataset = TextileDataset(train_df, transform=train_transforms)
    val_dataset = TextileDataset(val_df, transform=val_transforms)
    test_dataset = TextileDataset(test_df, transform=val_transforms)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=2, pin_memory=(device.type != 'cpu'))
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=2)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=2)

    # 6. Class Weighting for Loss Calculation (from train split only)
    train_counts = train_df['project_class'].value_counts()
    class_weights_list = []
    total_train = len(train_df)
    for c_idx in range(NUM_CLASSES):
        c_name = IDX_TO_CLASS[c_idx]
        count = train_counts.get(c_name, 1)
        # Smoothed inverse frequency: sqrt(total / (num_classes * count))
        w = np.sqrt(total_train / (NUM_CLASSES * count))
        class_weights_list.append(w)
    
    class_weights_tensor = torch.tensor(class_weights_list, dtype=torch.float).to(device)
    print("\nClass Weights (Smoothed Inverse Frequency from Train Set):")
    for c_idx in range(NUM_CLASSES):
        print(f"  {c_idx} {IDX_TO_CLASS[c_idx]:<18}: weight = {class_weights_list[c_idx]:.3f} (train count: {train_counts.get(IDX_TO_CLASS[c_idx], 0)})")

    criterion = nn.CrossEntropyLoss(weight=class_weights_tensor)

    # 7. Model Initialization (Pretrained EfficientNet-B0)
    print("\nLoading Pretrained EfficientNet-B0 backbone...")
    weights = models.EfficientNet_B0_Weights.DEFAULT
    model = models.efficientnet_b0(weights=weights)

    # Replace classification head
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3, inplace=True),
        nn.Linear(in_features, NUM_CLASSES)
    )
    model = model.to(device)

    # Output directories
    os.makedirs("ml/models", exist_ok=True)
    os.makedirs("ml/results", exist_ok=True)

    best_checkpoint_path = "ml/models/textile_classifier.pth"
    history = {"stage1": [], "stage2": []}
    best_val_f1 = -1.0
    best_epoch_info = {}

    start_time = time.time()

    # =========================================================================
    # STAGE 1: Train Head Only (Frozen Backbone)
    # =========================================================================
    print("\n" + "="*50)
    print("STAGE 1: Training Classification Head (Backbone Frozen)")
    print("="*50)
    
    for param in model.features.parameters():
        param.requires_grad = False
    for param in model.classifier.parameters():
        param.requires_grad = True

    optimizer_s1 = optim.AdamW(model.classifier.parameters(), lr=1e-3, weight_decay=1e-4)
    stage1_epochs = 4

    for epoch in range(1, stage1_epochs + 1):
        t0 = time.time()
        t_loss, t_acc = train_epoch(model, train_loader, criterion, optimizer_s1, device)
        val_res = evaluate(model, val_loader, criterion, device)
        elapsed = time.time() - t0

        print(f"[Stage 1] Epoch {epoch}/{stage1_epochs} ({elapsed:.1f}s) | "
              f"Train Loss: {t_loss:.4f} Acc: {t_acc*100:.1f}% | "
              f"Val Loss: {val_res['loss']:.4f} Acc: {val_res['accuracy']*100:.1f}% Macro-F1: {val_res['f1_macro']*100:.1f}%")

        history["stage1"].append({
            "epoch": epoch,
            "train_loss": t_loss,
            "train_acc": t_acc,
            "val_loss": val_res['loss'],
            "val_acc": val_res['accuracy'],
            "val_f1_macro": val_res['f1_macro']
        })

        if val_res['f1_macro'] > best_val_f1:
            best_val_f1 = val_res['f1_macro']
            best_epoch_info = {"stage": 1, "epoch": epoch, "val_f1": best_val_f1, "val_acc": val_res['accuracy']}
            torch.save(model.state_dict(), best_checkpoint_path)

    # =========================================================================
    # STAGE 2: Fine-Tuning (Unfreeze Features with Differential LR)
    # =========================================================================
    print("\n" + "="*50)
    print("STAGE 2: Fine-Tuning Model (Unfrozen Upper Backbone)")
    print("="*50)

    # Unfreeze upper feature blocks (stages 4-8)
    for param in model.features.parameters():
        param.requires_grad = True

    # Differential learning rate
    optimizer_s2 = optim.AdamW([
        {"params": model.features.parameters(), "lr": 6e-5},
        {"params": model.classifier.parameters(), "lr": 3e-4}
    ], weight_decay=1e-4)

    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer_s2, T_max=8, eta_min=1e-6)
    stage2_epochs = 8
    patience = 4
    no_improve_count = 0

    for epoch in range(1, stage2_epochs + 1):
        t0 = time.time()
        t_loss, t_acc = train_epoch(model, train_loader, criterion, optimizer_s2, device)
        val_res = evaluate(model, val_loader, criterion, device)
        scheduler.step()
        elapsed = time.time() - t0

        print(f"[Stage 2] Epoch {epoch}/{stage2_epochs} ({elapsed:.1f}s) | "
              f"Train Loss: {t_loss:.4f} Acc: {t_acc*100:.1f}% | "
              f"Val Loss: {val_res['loss']:.4f} Acc: {val_res['accuracy']*100:.1f}% Macro-F1: {val_res['f1_macro']*100:.1f}%")

        history["stage2"].append({
            "epoch": epoch,
            "train_loss": t_loss,
            "train_acc": t_acc,
            "val_loss": val_res['loss'],
            "val_acc": val_res['accuracy'],
            "val_f1_macro": val_res['f1_macro']
        })

        if val_res['f1_macro'] > best_val_f1:
            best_val_f1 = val_res['f1_macro']
            best_epoch_info = {"stage": 2, "epoch": epoch, "val_f1": best_val_f1, "val_acc": val_res['accuracy']}
            torch.save(model.state_dict(), best_checkpoint_path)
            no_improve_count = 0
        else:
            no_improve_count += 1
            if no_improve_count >= patience:
                print(f"Early stopping triggered at Stage 2 Epoch {epoch} (no improvement for {patience} epochs).")
                break

    total_training_time = time.time() - start_time
    print(f"\nTraining completed in {total_training_time:.1f} seconds (~{total_training_time/60:.1f} mins).")
    print(f"Best Validation Model from Stage {best_epoch_info.get('stage')} Epoch {best_epoch_info.get('epoch')}: Val Acc = {best_epoch_info.get('val_acc')*100:.2f}%, Val Macro-F1 = {best_val_f1*100:.2f}%")

    # =========================================================================
    # HELD-OUT TEST EVALUATION (Evaluated ONLY ONCE with best checkpoint)
    # =========================================================================
    print("\n" + "="*70)
    print("HELD-OUT TEST SET EVALUATION (ONCE WITH BEST MODEL CHECKPOINT)")
    print("="*70)

    # Load best weights
    model.load_state_dict(torch.load(best_checkpoint_path, map_location=device))
    test_res = evaluate(model, test_loader, criterion, device)

    print(f"Overall Test Accuracy:        {test_res['accuracy']*100:.2f}%")
    print(f"Macro Precision:              {test_res['precision_macro']*100:.2f}%")
    print(f"Macro Recall:                 {test_res['recall_macro']*100:.2f}%")
    print(f"Macro F1-Score:               {test_res['f1_macro']*100:.2f}%")
    print(f"Weighted F1-Score:            {test_res['f1_weighted']*100:.2f}%")

    # Per-Class Metrics
    p_per, r_per, f1_per, sup_per = precision_recall_fscore_support(
        test_res['labels'], test_res['preds'], labels=list(range(NUM_CLASSES)), zero_division=0
    )

    test_sample_counts = test_df.groupby('project_class')['sample_id'].nunique().to_dict()

    per_class_report = {}
    print("\nDetailed Per-Class Test Set Breakdown:")
    print("-" * 80)
    print(f"{'Class ID':<8} | {'Class Name':<18} | {'Samples':<8} | {'Images':<8} | {'Precision':<10} | {'Recall':<10} | {'F1-Score'}")
    print("-" * 80)

    for c_idx in range(NUM_CLASSES):
        c_name = IDX_TO_CLASS[c_idx]
        n_samples = test_sample_counts.get(c_name, 0)
        n_images = int(sup_per[c_idx])
        prec = float(p_per[c_idx])
        rec = float(r_per[c_idx])
        f1 = float(f1_per[c_idx])

        per_class_report[c_name] = {
            "class_id": c_idx,
            "test_physical_samples": n_samples,
            "test_images": n_images,
            "precision": prec,
            "recall": rec,
            "f1_score": f1
        }
        print(f"{c_idx:<8} | {c_name:<18} | {n_samples:<8} | {n_images:<8} | {prec*100:>8.1f}% | {rec*100:>8.1f}% | {f1*100:>7.1f}%")
    print("=" * 80)

    # Confusion Matrix
    cm = confusion_matrix(test_res['labels'], test_res['preds'], labels=list(range(NUM_CLASSES)))
    plt.figure(figsize=(10, 8))
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Blues",
        xticklabels=[IDX_TO_CLASS[i] for i in range(NUM_CLASSES)],
        yticklabels=[IDX_TO_CLASS[i] for i in range(NUM_CLASSES)]
    )
    plt.title("Held-Out Test Set Confusion Matrix — Textile Material Classifier", fontsize=13, pad=15)
    plt.xlabel("Predicted Label", fontsize=11)
    plt.ylabel("Ground Truth Label", fontsize=11)
    plt.xticks(rotation=45, ha="right")
    plt.yticks(rotation=0)
    plt.tight_layout()
    cm_path = "ml/results/confusion_matrix.png"
    plt.savefig(cm_path, dpi=200)
    plt.close()
    print(f"Confusion Matrix saved to: {cm_path}")

    # Save Outputs
    with open("ml/results/training_history.json", "w") as f:
        json.dump(history, f, indent=2)

    test_metrics_summary = {
        "overall_accuracy": test_res['accuracy'],
        "macro_precision": test_res['precision_macro'],
        "macro_recall": test_res['recall_macro'],
        "macro_f1": test_res['f1_macro'],
        "weighted_precision": test_res['precision_weighted'],
        "weighted_recall": test_res['recall_weighted'],
        "weighted_f1": test_res['f1_weighted'],
        "total_test_images": len(test_res['labels']),
        "total_test_samples": test_df['sample_id'].nunique(),
        "device_used": str(device),
        "total_training_time_seconds": round(total_training_time, 2)
    }

    with open("ml/results/test_metrics.json", "w") as f:
        json.dump(test_metrics_summary, f, indent=2)

    with open("ml/results/per_class_metrics.json", "w") as f:
        json.dump(per_class_report, f, indent=2)

    # Save Model Configuration
    model_config = {
        "model_architecture": "EfficientNet-B0",
        "input_size": [3, img_size, img_size],
        "normalization": {"mean": norm_mean, "std": norm_std},
        "num_classes": NUM_CLASSES,
        "class_to_idx": CLASS_TO_IDX,
        "idx_to_class": IDX_TO_CLASS,
        "model_version": "1.0.0-textile-b0",
        "training_device": str(device),
        "training_time_seconds": round(total_training_time, 2),
        "best_validation_epoch": best_epoch_info,
        "held_out_test_metrics": test_metrics_summary,
        "checkpoint_file": best_checkpoint_path
    }

    with open("ml/models/textile_classifier_config.json", "w") as f:
        json.dump(model_config, f, indent=2)

    print(f"Model checkpoint saved to: {best_checkpoint_path}")
    print(f"Model config saved to: ml/models/textile_classifier_config.json")
    print("=" * 70)
    print("PHASE 2C TRAINING & EVALUATION COMPLETED SUCCESSFULLY")
    print("=" * 70)

if __name__ == "__main__":
    main()
