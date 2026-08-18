from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import io
import pandas as pd

from app.db.session import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.waste import WasteBatch
from app.core.sustainability_config import (
    CO2_SAVINGS_FACTOR_KG_PER_KG,
    WATER_SAVINGS_FACTOR_L_PER_KG,
    LANDFILL_VOLUME_FACTOR_M3_PER_KG,
    RECOVERY_MATERIAL_VALUE_USD_PER_KG,
    MATERIAL_GROUND_SCRAP_RATES_INR,
    GLOBAL_INDUSTRY_BASELINE_DIVERSION,
)

router = APIRouter()

def get_report_data_dict(report_type: str, batches: list[WasteBatch]) -> dict:
    total_batches = len(batches)
    total_weight = sum(b.quantity for b in batches) if batches else 0.0
    co2_avoided = total_weight * CO2_SAVINGS_FACTOR_KG_PER_KG
    water_saved = total_weight * WATER_SAVINGS_FACTOR_L_PER_KG
    landfill_spared = total_weight * LANDFILL_VOLUME_FACTOR_M3_PER_KG
    feedstock_value = sum(b.quantity * MATERIAL_GROUND_SCRAP_RATES_INR.get(b.fabric_type, 12.50) for b in batches) if batches else 0.0
    
    valid_scores = [b.circularity_score for b in batches if b.circularity_score is not None]
    avg_circularity = sum(valid_scores) / len(valid_scores) if valid_scores else 0.0

    # Material breakdown
    material_counts = {}
    material_weights = {}
    category_counts = {}
    recommendation_counts = {}

    for b in batches:
        material_counts[b.fabric_type] = material_counts.get(b.fabric_type, 0) + 1
        material_weights[b.fabric_type] = round(material_weights.get(b.fabric_type, 0.0) + b.quantity, 2)
        
        cat = b.waste_category or "Unclassified"
        category_counts[cat] = category_counts.get(cat, 0) + 1
        
        rec = b.recycling_recommendation or "General Recovery"
        recommendation_counts[rec] = recommendation_counts.get(rec, 0) + 1

    return {
        "report_type": report_type,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "summary": {
            "total_batches": total_batches,
            "total_weight_kg": round(total_weight, 2),
            "co2_avoided_kg": round(co2_avoided, 2),
            "water_conserved_liters": round(water_saved, 1),
            "landfill_space_m3": round(landfill_spared, 4),
            "feedstock_value_usd": round(feedstock_value, 2),
            "average_circularity_pct": round(avg_circularity, 1),
            "industry_baseline_diversion_pct": GLOBAL_INDUSTRY_BASELINE_DIVERSION,
        },
        "material_weights": material_weights,
        "material_counts": material_counts,
        "category_counts": category_counts,
        "recommendation_counts": recommendation_counts,
        "records": [
            {
                "id": b.id,
                "fabric_type": b.fabric_type,
                "quantity_kg": b.quantity,
                "color": b.color,
                "condition": b.condition,
                "waste_category": b.waste_category or "N/A",
                "recycling_recommendation": b.recycling_recommendation or "N/A",
                "circularity_score": b.circularity_score or 0.0,
                "collection_date": b.collection_date.strftime("%Y-%m-%d") if hasattr(b.collection_date, "strftime") else str(b.collection_date).split("T")[0],
            }
            for b in batches
        ]
    }

def get_specialized_report_df(report_type: str, batches: list[WasteBatch]) -> pd.DataFrame:
    total_batches = len(batches)
    total_weight = sum(b.quantity for b in batches) if batches else 0.0
    safe_weight = total_weight if total_weight > 0 else 1.0

    if report_type == "sustainability":
        natural_mats = ["Cotton", "Wool", "Silk", "Linen", "Denim"]
        synth_mats = ["Polyester", "Nylon", "Acrylic"]
        regen_mats = ["Rayon", "Mixed Fabrics"]

        nat_weight = sum(b.quantity for b in batches if b.fabric_type in natural_mats)
        synth_weight = sum(b.quantity for b in batches if b.fabric_type in synth_mats)
        regen_weight = sum(b.quantity for b in batches if b.fabric_type in regen_mats)

        return pd.DataFrame([
            {
                "Material_Class_Group": "Natural Fibers (Cotton, Wool, Silk, Linen, Denim)",
                "Diverted_Weight_kg": round(nat_weight, 2),
                "CO2_Offset_Factor_kg_per_kg": 3.60,
                "Net_Carbon_Savings_kg_CO2": round(nat_weight * 3.60, 2),
                "Water_Conserved_Liters": round(nat_weight * 250.0, 1),
                "Diversion_Share_Pct": round((nat_weight / safe_weight) * 100, 1),
                "Impact_Rating": "Maximum Benefit"
            },
            {
                "Material_Class_Group": "Synthetic Polymers (Polyester, Nylon, Acrylic)",
                "Diverted_Weight_kg": round(synth_weight, 2),
                "CO2_Offset_Factor_kg_per_kg": 2.10,
                "Net_Carbon_Savings_kg_CO2": round(synth_weight * 2.10, 2),
                "Water_Conserved_Liters": round(synth_weight * 120.0, 1),
                "Diversion_Share_Pct": round((synth_weight / safe_weight) * 100, 1),
                "Impact_Rating": "Polymer Re-Loop"
            },
            {
                "Material_Class_Group": "Regenerated & Blended (Rayon, Mixed Fabrics)",
                "Diverted_Weight_kg": round(regen_weight, 2),
                "CO2_Offset_Factor_kg_per_kg": 2.40,
                "Net_Carbon_Savings_kg_CO2": round(regen_weight * 2.40, 2),
                "Water_Conserved_Liters": round(regen_weight * 180.0, 1),
                "Diversion_Share_Pct": round((regen_weight / safe_weight) * 100, 1),
                "Impact_Rating": "Industrial Blend"
            }
        ])

    elif report_type == "waste_classification":
        SUPPORTED_MATS = [
            ("Cotton", "Natural Fiber", "Plant Cellulose"),
            ("Denim", "Natural Fiber", "Woven Twill Cotton"),
            ("Polyester", "Synthetic Polymer", "Polyethylene Terephthalate"),
            ("Wool", "Animal Protein", "Keratin Fiber"),
            ("Silk", "Animal Protein", "Fibroin Filament"),
            ("Nylon", "Synthetic Polyamide", "Polyamide 6,6"),
            ("Rayon", "Regenerated Cellulose", "Viscose / Modal"),
            ("Linen", "Natural Bast Fiber", "Flax Plant (Linum)"),
            ("Acrylic", "Synthetic Polymer", "Polyacrylonitrile"),
            ("Mixed Fabrics", "Blended / Poly-Cotton", "Multi-Component Blend"),
        ]
        rows = []
        for name, cat, origin in SUPPORTED_MATS:
            m_batches = [b for b in batches if b.fabric_type and name.lower() in b.fabric_type.lower()]
            count = len(m_batches)
            weight = sum(b.quantity for b in m_batches)
            pct = round((weight / safe_weight) * 100, 1) if safe_weight > 0 else 0.0
            conf = round(sum(b.confidence_score or 83.2 for b in m_batches) / count, 1) if count > 0 else 83.2
            damage = round(sum(b.damage_score or 0.0 for b in m_batches) / count, 1) if count > 0 else 0.0
            rows.append({
                "Material_Class": name,
                "Category": cat,
                "Origin_Base": origin,
                "Batch_Count": count,
                "Total_Weight_kg": round(weight, 2),
                "Weight_Share_Pct": pct,
                "Avg_AI_Confidence_Pct": conf,
                "Mean_Damage_Score": damage
            })
        return pd.DataFrame(rows)

    elif report_type == "recycling":
        upcycle_batches = [b for b in batches if "Upcycling" in (b.recycling_recommendation or "") or b.waste_category == "Upcyclable"]
        chem_batches = [b for b in batches if "Chemical" in (b.recycling_recommendation or "") or b.fabric_type in ["Polyester", "Nylon", "Rayon", "Acrylic"]]
        mech_batches = [b for b in batches if "Mechanical" in (b.recycling_recommendation or "") or b.condition == "Fair"]
        fiber_batches = [b for b in batches if "Fiber" in (b.recycling_recommendation or "") or "Reuse" in (b.recycling_recommendation or "") or b.waste_category == "Repairable"]

        return pd.DataFrame([
            {
                "Sorting_Bin_Allocation": "Bin A-1: Atelier Upcycling",
                "Primary_Waste_Category": "Upcyclable",
                "Batch_Count": len(upcycle_batches),
                "Allocated_Weight_kg": round(sum(b.quantity for b in upcycle_batches), 2),
                "Allocated_Materials": "High-grade Cotton, Silk, Denim, Wool, Linen",
                "Preprocessing_Directive": "Clean surface sanitization & manual pattern cutting"
            },
            {
                "Sorting_Bin_Allocation": "Bin B-2: Polymer Chemical Line",
                "Primary_Waste_Category": "Recyclable (Chemical)",
                "Batch_Count": len(chem_batches),
                "Allocated_Weight_kg": round(sum(b.quantity for b in chem_batches), 2),
                "Allocated_Materials": "Polyester, Nylon, Acrylic filaments",
                "Preprocessing_Directive": "Chemical solvent separation & catalyst depolymerization"
            },
            {
                "Sorting_Bin_Allocation": "Bin C-3: Mechanical Carding",
                "Primary_Waste_Category": "Recyclable (Mechanical)",
                "Batch_Count": len(mech_batches),
                "Allocated_Weight_kg": round(sum(b.quantity for b in mech_batches), 2),
                "Allocated_Materials": "Spun yarns, fair condition offcuts",
                "Preprocessing_Directive": "Mechanical garnetting, tearing & fiber re-spinning"
            },
            {
                "Sorting_Bin_Allocation": "Bin D-4: Secondary Utility",
                "Primary_Waste_Category": "Repairable / Reusable",
                "Batch_Count": len(fiber_batches),
                "Allocated_Weight_kg": round(sum(b.quantity for b in fiber_batches), 2),
                "Allocated_Materials": "Mixed blends, distressed scraps",
                "Preprocessing_Directive": "Acoustic insulation, geotextiles & industrial padding"
            }
        ])

    elif report_type == "environmental_impact":
        return pd.DataFrame([
            {
                "Environmental_Impact_Dimension": "Embodied Energy Spared",
                "Quantified_Displacement": f"{round(total_weight * 0.024, 2)} MWh",
                "Standard_Equivalent": f"Power for {round((total_weight * 0.024) / 0.8)} residential homes / month",
                "Conservation_Mechanism": "Avoided thermo-chemical refining of crude oil into PTA/EG"
            },
            {
                "Environmental_Impact_Dimension": "Agricultural Water Footprint",
                "Quantified_Displacement": f"{round(total_weight * 250.0, 1)} Liters",
                "Standard_Equivalent": f"{round((total_weight * 250.0) / 150)} days of per-capita potable water",
                "Conservation_Mechanism": "Displaced high-irrigation cultivation of raw virgin cotton crops"
            },
            {
                "Environmental_Impact_Dimension": "Synthetic Resin Displacement",
                "Quantified_Displacement": f"{round(total_weight * 0.85, 1)} kg Polymer",
                "Standard_Equivalent": f"{round((total_weight * 0.85) / 0.025)} standard PET bottles equivalent",
                "Conservation_Mechanism": "Direct circular feeding into rPET and recycled yarn spinning mills"
            },
            {
                "Environmental_Impact_Dimension": "Landfill Gas (Methane) Abated",
                "Quantified_Displacement": f"{round(total_weight * 0.42, 1)} kg CH4",
                "Standard_Equivalent": f"Equivalent to {round(total_weight * 0.42 * 28, 1)} kg CO2e greenhouse gas",
                "Conservation_Mechanism": "Prevented anaerobic organic decomposition of cotton and wool waste"
            }
        ])

    elif report_type == "circular_economy":
        valid_scores = [b.circularity_score for b in batches if b.circularity_score is not None]
        avg_score = sum(valid_scores) / len(valid_scores) if valid_scores else 66.4
        t_count = total_batches if total_batches > 0 else 1

        f1_score = round(sum((90.0 if b.fabric_type in ["Cotton", "Wool", "Silk", "Linen", "Denim"] else (75.0 if b.fabric_type in ["Polyester", "Nylon", "Acrylic"] else 55.0)) for b in batches) / t_count, 1)
        f2_score = round(sum(max(0.0, 100.0 - (b.damage_score or 0.0)) for b in batches) / t_count, 1)
        f3_score = round((len([b for b in batches if b.waste_category in ["Upcyclable", "Reusable"]]) / t_count) * 100.0, 1)
        f4_score = round((sum(b.quantity for b in batches if b.fabric_type in ["Cotton", "Wool", "Silk", "Linen", "Denim"]) / safe_weight) * 100.0, 1)
        f5_score = round((len([b for b in batches if not b.contamination_detected]) / t_count) * 100.0, 1)

        return pd.DataFrame([
            {
                "Evaluation_Factor": "1. Fiber Recyclability Factor",
                "Weight_Pct": "25%",
                "Assessment_Focus": "Mono-material purity vs blend complexity",
                "Mean_Factor_Score": f1_score,
                "Optimal_Material_Pathway": "100% Pure Cotton, Linen, Wool & Denim",
                "Overall_Circularity_Index": round(avg_score, 1)
            },
            {
                "Evaluation_Factor": "2. Physical Condition & Integrity",
                "Weight_Pct": "25%",
                "Assessment_Focus": "Optical wear, tears, stains & fiber tensile state",
                "Mean_Factor_Score": f2_score,
                "Optimal_Material_Pathway": "Unworn deadstock, clean cut-and-sew remnants",
                "Overall_Circularity_Index": round(avg_score, 1)
            },
            {
                "Evaluation_Factor": "3. Direct Reuse Potential",
                "Weight_Pct": "20%",
                "Assessment_Focus": "Direct garment redesign & upcycling viability",
                "Mean_Factor_Score": f3_score,
                "Optimal_Material_Pathway": "Designer ateliers, patchwork & accessories",
                "Overall_Circularity_Index": round(avg_score, 1)
            },
            {
                "Evaluation_Factor": "4. Environmental Impact Benefit",
                "Weight_Pct": "15%",
                "Assessment_Focus": "Virgin resource substitution factor",
                "Mean_Factor_Score": f4_score,
                "Optimal_Material_Pathway": "Organic natural fibers & non-synthetic textiles",
                "Overall_Circularity_Index": round(avg_score, 1)
            },
            {
                "Evaluation_Factor": "5. Processing Feasibility",
                "Weight_Pct": "15%",
                "Assessment_Focus": "Industrial sorting throughput & chemical separation",
                "Mean_Factor_Score": f5_score,
                "Optimal_Material_Pathway": "Established mechanical carding & rPET lines",
                "Overall_Circularity_Index": round(avg_score, 1)
            }
        ])

    return pd.DataFrame()

@router.get("/data")
def get_report_data(
    report_type: str = Query("sustainability", pattern="^(waste_classification|recycling|sustainability|environmental_impact|circular_economy)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    batches = db.query(WasteBatch).order_by(WasteBatch.id.desc()).all()
    return get_report_data_dict(report_type, batches)

@router.get("/export/excel")
def export_excel_report(
    report_type: str = Query("sustainability", pattern="^(waste_classification|recycling|sustainability|environmental_impact|circular_economy)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Export Excel (.xlsx) workbook customized with specialized analytics for the requested report type.
    """
    batches = db.query(WasteBatch).order_by(WasteBatch.id.desc()).all()
    data = get_report_data_dict(report_type, batches)
    df_specialized = get_specialized_report_df(report_type, batches)
    
    output = io.BytesIO()
    
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        # Sheet 1: Specialized Analytical Dossier
        if not df_specialized.empty:
            sheet_title = report_type.replace("_", " ").title()[:30]
            df_specialized.to_excel(writer, sheet_name=sheet_title, index=False)

        # Sheet 2: Executive Summary & Telemetry
        summary_rows = [
            {"Metric": "Report Type", "Value": report_type.replace("_", " ").title()},
            {"Metric": "Generated Timestamp (UTC)", "Value": data["generated_at"]},
            {"Metric": "Generated By", "Value": current_user.username},
            {"Metric": "User Role", "Value": current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)},
            {"Metric": "Total Sorted Batches", "Value": data["summary"]["total_batches"]},
            {"Metric": "Total Diverted Weight (kg)", "Value": data["summary"]["total_weight_kg"]},
            {"Metric": "CO2 Emissions Avoided (kg)", "Value": data["summary"]["co2_avoided_kg"]},
            {"Metric": "Water Conserved (Liters)", "Value": data["summary"]["water_conserved_liters"]},
            {"Metric": "Landfill Space Spared (m³)", "Value": data["summary"]["landfill_space_m3"]},
            {"Metric": "Recovered Feedstock Valuation (₹ INR)", "Value": f"₹{data['summary']['feedstock_value_usd']:,.2f} INR"},
            {"Metric": "Average Circularity Index (%)", "Value": data["summary"]["average_circularity_pct"]},
        ]
        df_summary = pd.DataFrame(summary_rows)
        df_summary.to_excel(writer, sheet_name="Executive KPIs", index=False)

        # Sheet 3: Full Batch Audit Trail
        if data["records"]:
            df_records = pd.DataFrame(data["records"])
            df_records.columns = [
                "Batch ID", "Fabric Type", "Weight (kg)", "Color", 
                "Condition", "Waste Category", "Recycling Strategy", 
                "Circularity Score (%)", "Collection Date"
            ]
            df_records.to_excel(writer, sheet_name="Batch Audit Trail", index=False)

    output.seek(0)
    filename = f"TexWaste_{report_type}_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"'
    }
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers
    )

@router.get("/export/csv")
def export_csv_report(
    report_type: str = Query("sustainability", pattern="^(waste_classification|recycling|sustainability|environmental_impact|circular_economy)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Export CSV file containing specialized analytical datasets for the requested report type.
    """
    batches = db.query(WasteBatch).order_by(WasteBatch.id.desc()).all()
    df = get_specialized_report_df(report_type, batches)
    
    if df.empty:
        data = get_report_data_dict(report_type, batches)
        df = pd.DataFrame(data["records"]) if data["records"] else pd.DataFrame(columns=["Notice"])
        
    output = io.StringIO()
    df.to_csv(output, index=False)
    
    filename = f"TexWaste_{report_type}_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"'
    }
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers=headers
    )
