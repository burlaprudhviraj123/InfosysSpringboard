import os
import json
from typing import Dict, Any, List
from PIL import Image

import torch
import torch.nn as nn
from torchvision import transforms, models

# 10-Class Textile Taxonomy (0: Acrylic, 1: Cotton, 2: Denim, ..., 9: Wool)
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

class TextileClassifierService:
    def __init__(self):
        self.model = None
        self.device = self._select_device()
        self.config = self._load_config()
        self.transform = self._create_transform()
        self._load_model()

    def _select_device(self) -> torch.device:
        """Safe multi-platform device selection (Apple Silicon MPS -> NVIDIA CUDA -> CPU)."""
        if torch.backends.mps.is_available():
            return torch.device("mps")
        elif torch.cuda.is_available():
            return torch.device("cuda")
        return torch.device("cpu")

    def _load_config(self) -> Dict[str, Any]:
        """Loads model training metadata and class configuration."""
        possible_paths = [
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "ml", "models", "textile_classifier_config.json"),
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "ml", "models", "textile_classifier_config.json"),
            "/app/ml/models/textile_classifier_config.json"
        ]
        for p in possible_paths:
            if os.path.exists(p):
                try:
                    with open(p, "r") as f:
                        return json.load(f)
                except Exception as e:
                    print(f"Warning: Failed to load config from {p}: {e}")
        return {
            "model_architecture": "EfficientNet-B0",
            "model_type": "Fine-Tuned Transfer Learning",
            "num_classes": NUM_CLASSES,
            "held_out_test_metrics": {
                "overall_accuracy": 0.7195,
                "macro_f1": 0.7188
            }
        }

    def _create_transform(self) -> transforms.Compose:
        """Deterministic preprocessing pipeline matching training validation transforms."""
        return transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def _load_model(self):
        """Loads the fine-tuned EfficientNet-B0 model checkpoint with the 10-class head."""
        possible_weights = [
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "ml", "models", "textile_classifier.pth"),
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "ml", "models", "textile_classifier.pth"),
            "/app/ml/models/textile_classifier.pth"
        ]
        
        checkpoint_path = None
        for p in possible_weights:
            if os.path.exists(p):
                checkpoint_path = p
                break

        if not checkpoint_path:
            raise FileNotFoundError("Trained textile classifier checkpoint (textile_classifier.pth) not found.")

        try:
            # Build EfficientNet-B0 architecture with custom 10-class linear classification head
            model = models.efficientnet_b0(weights=None)
            in_features = model.classifier[1].in_features
            model.classifier = nn.Sequential(
                nn.Dropout(p=0.3, inplace=True),
                nn.Linear(in_features, NUM_CLASSES)
            )

            state_dict = torch.load(checkpoint_path, map_location=self.device)
            model.load_state_dict(state_dict)
            model = model.to(self.device)
            model.eval()
            self.model = model
            print(f"TextileClassifierService initialized successfully on {self.device} with weights from {checkpoint_path}")
        except Exception as e:
            print(f"CRITICAL ERROR loading textile classifier model: {e}")
            raise RuntimeError(f"Failed to load textile classifier model: {e}")

    def predict_fabric(self, image_path: str) -> str:
        """Convenience method returning predicted class name string."""
        res = self.predict(image_path)
        return res["predicted_material"]

    def predict(self, image_path: str) -> Dict[str, Any]:
        """
        Executes genuine neural network inference on the input image.
        Returns:
            - predicted_material: Top-1 predicted textile class
            - confidence: Softmax probability of Top-1 class [0.0 - 1.0]
            - confidence_pct: Softmax percentage [0.0 - 100.0%]
            - top_predictions: Full ranked distribution of probabilities across all 10 classes
            - model_metadata: Lineage and evaluation metrics
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found at: {image_path}")

        try:
            img = Image.open(image_path).convert('RGB')
        except Exception as e:
            raise ValueError(f"Invalid or unreadable image format: {e}")

        if self.model is None:
            raise RuntimeError("Model is not loaded.")

        input_tensor = self.transform(img).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(input_tensor)
            probs = torch.softmax(outputs, dim=1).squeeze()

        probs_list = probs.cpu().tolist()
        
        # Sort predictions in descending order of probability
        top_predictions = []
        for c_idx, prob in enumerate(probs_list):
            top_predictions.append({
                "class_id": c_idx,
                "class_name": IDX_TO_CLASS[c_idx],
                "probability": round(float(prob), 4),
                "probability_pct": round(float(prob) * 100, 2)
            })
        top_predictions.sort(key=lambda x: x["probability"], reverse=True)

        top1 = top_predictions[0]
        
        return {
            "predicted_material": top1["class_name"],
            "class_id": top1["class_id"],
            "confidence": top1["probability"],
            "confidence_pct": top1["probability_pct"],
            "top_predictions": top_predictions,
            "model_metadata": {
                "model_architecture": "EfficientNet-B0",
                "model_type": "Fine-Tuned Transfer Learning",
                "checkpoint": "textile_classifier.pth",
                "device": str(self.device),
                "test_accuracy": 71.95,
                "test_macro_f1": 71.88,
                "num_classes": NUM_CLASSES
            }
        }

# Global Singleton Instance for Production Inference
fabric_classifier = TextileClassifierService()
