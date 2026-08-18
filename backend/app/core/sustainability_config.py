"""
Centralized Sustainability & Environmental Impact Configuration
Defines empirical and benchmark factors for Life Cycle Assessment (LCA) and circularity calculations.
"""

# Avoided virgin fiber extraction and incineration carbon offset factor (kg CO2-eq saved per kg textile diverted)
# Source: Mistra Future Fashion & WRAP LCA Benchmarks for recycled textile post-consumer/pre-consumer diversion
CO2_SAVINGS_FACTOR_KG_PER_KG = 3.6

# Avoided wet processing, dyeing, and agricultural irrigation water savings (Liters saved per kg textile diverted)
# Source: Ellen MacArthur Foundation & Textile Exchange Life Cycle Data
WATER_SAVINGS_FACTOR_L_PER_KG = 250.0

# Approximate landfill volume footprint avoided per kg of compressed textile waste (m3 per kg)
# Based on compacted textile municipal solid waste density (~285 kg/m3)
LANDFILL_VOLUME_FACTOR_M3_PER_KG = 0.0035

# Estimated average market feedstock recovery value per kg of sorted recyclable/upcyclable textile ($/kg)
RECOVERY_MATERIAL_VALUE_USD_PER_KG = 3.50

# Global textile industry baseline landfill diversion benchmark (%)
# Source: Global Fashion Agenda Circular Economy Baseline
GLOBAL_INDUSTRY_BASELINE_DIVERSION = 68.5

# Global textile industry baseline circularity index rating (%)
GLOBAL_INDUSTRY_BASELINE_CIRCULARITY = 55.0

# Annual carbon sequestration benchmark per mature tree (kg CO2 per tree/year)
TREE_CO2_ABSORPTION_FACTOR = 20.0

# Average daily household per-capita direct water consumption (Liters per person/day)
DAILY_HOUSEHOLD_WATER_FACTOR = 150.0
