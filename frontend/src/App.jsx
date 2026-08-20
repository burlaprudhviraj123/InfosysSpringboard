import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || (typeof window !== 'undefined' && window.location.port === '5173' && window.location.hostname === 'localhost' ? "http://localhost:8000/api" : "/api");

// Universal helper to resolve image URLs across local Vite dev and deployed Azure VM reverse proxy
const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  if (typeof window !== 'undefined' && window.location.port === '5173' && window.location.hostname === 'localhost') {
    return `http://localhost:8000${cleanPath}`;
  }
  return cleanPath;
};

// Robust Fabric Thumbnail Component with Automatic Error Fallback to Styled Badge
function FabricThumbnail({ path, fabricType, size = 45, borderRadius = 6 }) {
  const [hasError, setHasError] = useState(false);
  const emojiMap = {
    'Cotton': '👕',
    'Polyester': '🧵',
    'Denim': '👖',
    'Wool': '🧶',
    'Silk': '👗',
    'Linen': '🌾',
    'Nylon': '🪢',
    'Rayon': '✨',
    'Acrylic': '🧣',
    'Mixed Fabrics': '🪡',
    'Mixed': '🪡'
  };
  const emoji = emojiMap[fabricType] || '🧵';
  const url = getImageUrl(path);

  if (!url || hasError) {
    return (
      <div 
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          minWidth: `${size}px`,
          borderRadius: `${borderRadius}px`, 
          background: 'linear-gradient(135deg, rgba(84,214,155,0.18), rgba(0,188,255,0.18))', 
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: `${Math.round(size * 0.45)}px`,
          userSelect: 'none'
        }}
        title={fabricType || 'Fabric'}
      >
        {emoji}
      </div>
    );
  }

  return (
    <img 
      src={url} 
      alt={`${fabricType || 'Fabric'} thumbnail`} 
      onError={() => setHasError(true)}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        minWidth: `${size}px`,
        borderRadius: `${borderRadius}px`, 
        objectFit: 'cover',
        border: '1px solid rgba(255,255,255,0.15)'
      }} 
    />
  );
}

// Sleek High-Tech Textile Fiber & AI Core Brand Logo
function BrandLogo({ size = 36 }) {
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      minWidth: `${size}px`,
      borderRadius: '10px',
      background: 'linear-gradient(135deg, rgba(84, 214, 155, 0.22) 0%, rgba(0, 188, 255, 0.22) 100%)',
      border: '1px solid rgba(84, 214, 155, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 16px rgba(84, 214, 155, 0.3)'
    }}>
      <svg width={Math.round(size * 0.62)} height={Math.round(size * 0.62)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 8L12 3L20 8L12 13L4 8Z" stroke="#54D69B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 16L12 21L20 16" stroke="#00BCFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 12L12 17L20 12" stroke="#54D69B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="10" r="1.6" fill="#00BCFF" />
      </svg>
    </div>
  );
}

// Custom Dynamic SVG Pie / Donut Chart Component
function PieChart({ data, unit = "kg" }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  const colors = ['#54D69B', '#00BCFF', '#9333EA', '#F59E0B', '#EF4444', '#10B981', '#6366F1', '#EC4899', '#8B5CF6', '#14B8A6'];
  
  let cumulativeAngle = 0;
  
  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  const slices = entries.map(([label, value], index) => {
    const percentage = value / total;
    const angle = percentage * 360;
    
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;
    
    const x1 = 100 + 75 * Math.cos((Math.PI * (startAngle - 90)) / 180);
    const y1 = 100 + 75 * Math.sin((Math.PI * (startAngle - 90)) / 180);
    const x2 = 100 + 75 * Math.cos((Math.PI * (endAngle - 90)) / 180);
    const y2 = 100 + 75 * Math.sin((Math.PI * (endAngle - 90)) / 180);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    const pathData = `M 100 100 L ${x1} ${y1} A 75 75 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    
    return {
      label,
      value,
      percentage: (percentage * 100).toFixed(1),
      color: colors[index % colors.length],
      pathData
    };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.8rem', flexWrap: 'wrap', justifyContent: 'center', padding: '0.8rem 0' }}>
      <div style={{ position: 'relative', width: '180px', height: '180px', flexShrink: 0 }}>
        <svg width="180" height="180" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
          {slices.map((slice, i) => (
            <path 
              key={i} 
              d={slice.pathData} 
              fill={slice.color} 
              stroke="rgba(11, 15, 25, 0.8)" 
              strokeWidth="2"
              style={{ transition: 'all 0.4s ease' }}
            />
          ))}
          <circle cx="100" cy="100" r="48" fill="#0e1422" />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
            {total.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--color-primary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
            {unit} Total
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: slices.length > 5 ? 'repeat(2, 1fr)' : '1fr', gap: '0.5rem', minWidth: '200px' }}>
        {slices.map((slice, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: slice.color, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontWeight: 600, color: '#fff' }}>{slice.label}:</span>
            <span style={{ color: 'var(--text-secondary)', marginLeft: 'auto', paddingLeft: '0.4rem' }}>
              {slice.value.toLocaleString(undefined, { maximumFractionDigits: 1 })} {unit} ({slice.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 1. Dynamic Interactive SVG Bar Chart Component
function BarChart({ data, unit = "kg", color = "#54D69B", horizontal = false, height = 220 }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;
  const maxValue = Math.max(...entries.map(([, val]) => val), 1);

  if (horizontal) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', padding: '0.6rem 0' }}>
        {entries.map(([label, value], i) => {
          const pct = Math.min(100, Math.max(5, (value / maxValue) * 100));
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ fontWeight: 600, color: '#f8fafc' }}>{label}</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>
                  {value.toLocaleString(undefined, { maximumFractionDigits: 1 })} {unit} ({((value / (Object.values(data).reduce((a,b)=>a+b,0)||1))*100).toFixed(1)}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${pct}%`, 
                    height: '100%', 
                    background: `linear-gradient(90deg, ${color}, #00BCFF)`, 
                    borderRadius: '6px', 
                    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
                  }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical Column Bar Chart
  const svgWidth = 460;
  const svgHeight = height;
  const paddingLeft = 45;
  const paddingBottom = 40;
  const paddingTop = 20;
  const paddingRight = 20;
  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;
  const barWidth = Math.min(36, (chartW / entries.length) * 0.65);
  const gap = chartW / entries.length;

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '0.4rem 0' }}>
      <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ overflow: 'visible' }}>
        {/* Y-axis gridlines & ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = paddingTop + chartH - ratio * chartH;
          const val = (ratio * maxValue).toFixed(0);
          return (
            <g key={i}>
              <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <text x={paddingLeft - 8} y={y + 3} fill="#64748b" fontSize="10" textAnchor="end">{val}</text>
            </g>
          );
        })}

        {/* Bars */}
        {entries.map(([label, value], i) => {
          const barH = (value / maxValue) * chartH;
          const x = paddingLeft + i * gap + (gap - barWidth) / 2;
          const y = paddingTop + chartH - barH;
          return (
            <g key={i} className="chart-bar-group">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(2, barH)}
                rx="4"
                fill={`url(#barGrad-${i % 4})`}
                style={{ transition: 'all 0.5s ease', cursor: 'pointer' }}
              />
              <text 
                x={x + barWidth / 2} 
                y={svgHeight - 12} 
                fill="#94a3b8" 
                fontSize="9.5" 
                fontWeight="600" 
                textAnchor="middle"
              >
                {label.length > 7 ? label.slice(0, 6) + '…' : label}
              </text>
              <text 
                x={x + barWidth / 2} 
                y={Math.max(14, y - 6)} 
                fill="#fff" 
                fontSize="9" 
                fontWeight="700" 
                textAnchor="middle"
              >
                {value >= 1000 ? `${(value/1000).toFixed(1)}k` : value.toFixed(0)}
              </text>
            </g>
          );
        })}

        <defs>
          <linearGradient id="barGrad-0" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#54D69B" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="barGrad-1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00BCFF" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="barGrad-2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#9333EA" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="barGrad-3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// 2. Dynamic Interactive SVG Line / Area Trend Chart
function LineChart({ dataPoints, labels, unit = "kg", title = "Throughput Trend", color = "#54D69B", height = 200 }) {
  if (!dataPoints || dataPoints.length === 0) return null;
  const maxVal = Math.max(...dataPoints, 1);
  const minVal = 0;
  
  const svgW = 460;
  const svgH = height;
  const pLeft = 45;
  const pBottom = 35;
  const pTop = 20;
  const pRight = 20;
  const cW = svgW - pLeft - pRight;
  const cH = svgH - pTop - pBottom;

  const points = dataPoints.map((val, i) => {
    const x = pLeft + (i / (dataPoints.length - 1 || 1)) * cW;
    const y = pTop + cH - ((val - minVal) / (maxVal - minVal)) * cH;
    return { x, y, val, label: labels[i] || `P${i + 1}` };
  });

  // Generate Smooth Bezier SVG path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 2;
    const cp1y = p0.y;
    const cp2x = p0.x + (p1.x - p0.x) / 2;
    const cp2y = p1.y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${pTop + cH} L ${points[0].x} ${pTop + cH} Z`;

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '0.4rem 0' }}>
      <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
        <defs>
          <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {[0, 0.33, 0.66, 1].map((ratio, i) => {
          const y = pTop + cH - ratio * cH;
          return (
            <g key={i}>
              <line x1={pLeft} y1={y} x2={svgW - pRight} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <text x={pLeft - 8} y={y + 3} fill="#64748b" fontSize="9.5" textAnchor="end">
                {(ratio * maxVal).toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Area fill & curve */}
        <path d={areaD} fill="url(#areaGlow)" />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

        {/* Point markers */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#0e1422" stroke={color} strokeWidth="2" />
            <text x={p.x} y={svgH - 10} fill="#94a3b8" fontSize="9" fontWeight="600" textAnchor="middle">
              {p.label}
            </text>
            <text x={p.x} y={Math.max(12, p.y - 8)} fill="#fff" fontSize="8.5" fontWeight="700" textAnchor="middle">
              {p.val >= 1000 ? `${(p.val / 1000).toFixed(1)}k` : p.val}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// 3. Dynamic 5-Axis Spider Radar Chart Component for Circularity Framework
function RadarChart({ scores = [80, 78, 68, 86, 74], labels = ['Recyclability', 'Condition', 'Reuse', 'Environmental', 'Feasibility'] }) {
  const size = 240;
  const center = size / 2;
  const radius = 80;
  const numAxes = scores.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Concentric polygons for background grid
  const levels = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (index, valuePct) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * (valuePct / 100);
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const polygonPoints = scores.map((score, i) => {
    const coords = getCoordinates(i, score);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Grid Polygons */}
        {levels.map((level, lvlIdx) => {
          const gridPoints = Array.from({ length: numAxes }).map((_, i) => {
            const coords = getCoordinates(i, level * 100);
            return `${coords.x},${coords.y}`;
          }).join(' ');
          return (
            <polygon 
              key={lvlIdx} 
              points={gridPoints} 
              fill="none" 
              stroke="rgba(255,255,255,0.08)" 
              strokeWidth="1" 
            />
          );
        })}

        {/* Axis Lines & Labels */}
        {labels.map((lbl, i) => {
          const outerCoord = getCoordinates(i, 100);
          const textCoord = getCoordinates(i, 122);
          return (
            <g key={i}>
              <line x1={center} y1={center} x2={outerCoord.x} y2={outerCoord.y} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <text 
                x={textCoord.x} 
                y={textCoord.y + 3} 
                fill="#94a3b8" 
                fontSize="9" 
                fontWeight="600" 
                textAnchor="middle"
              >
                {lbl}
              </text>
            </g>
          );
        })}

        {/* Data Radar Polygon */}
        <polygon 
          points={polygonPoints} 
          fill="rgba(84, 214, 155, 0.25)" 
          stroke="#54D69B" 
          strokeWidth="2.5" 
          strokeLinejoin="round" 
        />

        {/* Point markers on polygon vertices */}
        {scores.map((score, i) => {
          const coords = getCoordinates(i, score);
          return (
            <circle key={i} cx={coords.x} cy={coords.y} r="4" fill="#0e1422" stroke="#00BCFF" strokeWidth="2" />
          );
        })}
      </svg>
    </div>
  );
}

// 4. Dynamic Speedometer Arc Gauge Component
function ProgressGauge({ value = 75, max = 100, label = "Rating", color = "#54D69B", size = 160 }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Half-circle
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: `${size}px`, margin: '0 auto' }}>
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Background track */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Active progress arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', bottom: '5px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
          {value.toFixed(1)}%
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

const SUPPORTED_MATERIALS = [
  {
    id: 'cotton',
    name: 'Cotton',
    category: 'Natural Fiber',
    origin: 'Plant Cellulose (Gossypium)',
    description: 'Pure plant-cellulose staple fiber known for breathability, softness, and high circularity potential.',
    recoveryPathway: 'Mechanical fiber shredding, garnetting, and rotor yarn re-spinning.',
    upcyclingSuitability: 'High — Ideal for direct garment remanufacturing, patchwork, and premium wipe textiles.',
    processingConsiderations: 'Requires removal of non-cellulosic trims, metallic hardware, and elastane threads before shredding.'
  },
  {
    id: 'denim',
    name: 'Denim',
    category: 'Natural Fiber',
    origin: 'Woven Twill Cotton (Indigo-dyed)',
    description: 'Durable warp-faced twill cotton textile dyed with indigo with robust physical tensile strength.',
    recoveryPathway: 'Mechanical defibering, thermal/acoustic building insulation, and circular denim-to-denim yarn spinning.',
    upcyclingSuitability: 'Very High — Premier material for modular atelier upcycling, bags, and outerwear.',
    processingConsiderations: 'Sort by indigo wash intensity; separate metal rivets, zipper tracks, and reinforced waistband stitching.'
  },
  {
    id: 'wool',
    name: 'Wool',
    category: 'Natural Fiber',
    origin: 'Animal Protein (Keratin Fleece)',
    description: 'Natural animal fleece composed of keratin proteins, offering superior thermal insulation and elasticity.',
    recoveryPathway: 'Mechanical garnetting into shoddy fiber, wool-blend carpet underlay, and organic composting.',
    upcyclingSuitability: 'High — Excellent for remilled winter garments, felted acoustic paneling, and outerwear.',
    processingConsiderations: 'Avoid high-temperature alkaline scouring to preserve native cuticle crimp and fiber elasticity.'
  },
  {
    id: 'silk',
    name: 'Silk',
    category: 'Natural Fiber',
    origin: 'Animal Protein (Fibroin Filament)',
    description: 'Continuous natural protein filament secreted by silkworms, featuring luxurious drape and tensile strength.',
    recoveryPathway: 'Gentle waste-silk carding, luxury patchwork reuse, and specialty bio-polymer extraction.',
    upcyclingSuitability: 'High — Best suited for direct garment reuse, high-end accessories, and artisanal linings.',
    processingConsiderations: 'Delicate filament structure requires low-shear mechanical handling and neutral pH cleaning agents.'
  },
  {
    id: 'linen',
    name: 'Linen',
    category: 'Natural Fiber',
    origin: 'Flax Bast Cellulose (Linum usitatissimum)',
    description: 'High-strength bast fiber harvested from flax stalks, known for moisture-wicking and structural stiffness.',
    recoveryPathway: 'Mechanical fiber reclaiming, specialty papermaking, and structural bio-composite reinforcement.',
    upcyclingSuitability: 'High — Suitable for interior textiles, summer apparel, and natural fiber composites.',
    processingConsiderations: 'Long staple length requires calibrated cut-lengths to avoid processing entanglement.'
  },
  {
    id: 'polyester',
    name: 'Polyester',
    category: 'Synthetic Polymer',
    origin: 'Synthetic Polymer (Polyethylene Terephthalate / PET)',
    description: 'Most widely produced thermoplastic synthetic polymer, offering crease resistance and high tensile durability.',
    recoveryPathway: 'Chemical glycolysis/methanolysis depolymerization into pure monomers, or mechanical melt-pelletizing.',
    upcyclingSuitability: 'Moderate — Best channeled into industrial chemical recycling or secondary technical textiles.',
    processingConsiderations: 'Requires thermal optical sorting to prevent melt contamination from PVC or elastomeric impurities.'
  },
  {
    id: 'nylon',
    name: 'Nylon',
    category: 'Synthetic Polymer',
    origin: 'Polyamide Polymer (PA6 / PA66)',
    description: 'High-performance polyamide synthetic polymer celebrated for superior abrasion resistance and elasticity.',
    recoveryPathway: 'Closed-loop chemical depolymerization into caprolactam monomer and engineered polymer re-extrusion.',
    upcyclingSuitability: 'Moderate — Channeled into performance technical textiles, cordage, and industrial polymers.',
    processingConsiderations: 'Check for polyurethane elastane coatings and wash out spin finishes before chemical recovery.'
  },
  {
    id: 'acrylic',
    name: 'Acrylic',
    category: 'Synthetic Polymer',
    origin: 'Synthetic Polymer (Polyacrylonitrile)',
    description: 'Wool-mimicking lightweight synthetic polymer composed of at least 85% acrylonitrile units with high warmth.',
    recoveryPathway: 'Mechanical fiber tearing for acoustic insulation batting, industrial wipe felts, and non-wovens.',
    upcyclingSuitability: 'Moderate — Suitable for heavy blankets, utility felts, and acoustic padding.',
    processingConsiderations: 'Ensure dust suppression and electrostatic grounding during mechanical fiber shredding operations.'
  },
  {
    id: 'rayon',
    name: 'Rayon',
    category: 'Regenerated Cellulose',
    origin: 'Regenerated Wood Cellulose (Viscose / Lyocell)',
    description: 'Semi-synthetic fiber regenerated from purified wood pulp, blending natural drape with synthetic uniformity.',
    recoveryPathway: 'Chemical cellulose solvent dissolution, circular dissolving pulp recovery, and blended garnetting.',
    upcyclingSuitability: 'Moderate — Channeled into circular cellulose pulp blending and non-woven hygiene sheets.',
    processingConsiderations: 'Reduced wet tensile strength mandates dry or solvent-based opening processes.'
  },
  {
    id: 'mixed_fabrics',
    name: 'Mixed Fabrics',
    category: 'Multi-Component Blend',
    origin: 'Composite Fiber Blend (e.g. Poly-Cotton, Multi-Fiber)',
    description: 'Multi-component textile waste combining natural and synthetic fibers in intimate yarn blends.',
    recoveryPathway: 'Hydrothermal enzyme separation, thermochemical separation, and industrial downcycling composites.',
    upcyclingSuitability: 'Moderate to Low — Recommended for downcycled composite soundproofing and automotive trunk liners.',
    processingConsiderations: 'Intimate fiber blends require chemical solvent fractionation for high-value mono-material recovery.'
  }
];

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('texwaste_user') || 'null');
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [currentView, setCurrentView] = useState(localStorage.getItem('token') ? 'dashboard' : 'home');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  
  // Auth Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Recycling Facility Operator');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [otpStep, setOtpStep] = useState(1);
  const [otpCode, setOtpCode] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  // Sustainability & Simulator State
  const [simRecyclability, setSimRecyclability] = useState(85);
  const [simCondition, setSimCondition] = useState(80);
  const [simReuse, setSimReuse] = useState(75);
  const [simEnvBenefit, setSimEnvBenefit] = useState(90);
  const [simFeasibility, setSimFeasibility] = useState(85);
  const [calcWeight, setCalcWeight] = useState(100);

  const toggleAuthView = (view) => {
    setCurrentView(view);
    setUsername('');
    setEmail('');
    setPassword('');
    setResetNewPassword('');
    setOtpStep(1);
    setOtpCode('');
    setDemoOtpHint('');
    setAuthError('');
    setAuthSuccess('');
  };

  // Inventory & Analysis State
  const [batches, setBatches] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedResult, setAnalyzedResult] = useState(null);
  
  // Sustainability Metrics & Notifications State
  const [esgMetrics, setEsgMetrics] = useState(null);
  const [manufacturerData, setManufacturerData] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Outside click handlers for dropdown menus
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const exportMenuRef = useRef(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setExportMenuOpen(false);
      }
    };

    if (showNotifications || showProfileMenu || exportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showNotifications, showProfileMenu, exportMenuOpen]);

  // Admin Announcements State
  const [adminAnnouncements, setAdminAnnouncements] = useState([]);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementSeverity, setAnnouncementSeverity] = useState('info');
  const [announcementTargetRole, setAnnouncementTargetRole] = useState('ALL');
  const [announcementError, setAnnouncementError] = useState('');
  const [announcementSuccess, setAnnouncementSuccess] = useState('');

  // Reports & Export System State
  const [selectedReportType, setSelectedReportType] = useState('sustainability');
  
  // Spring Bouncing Nav Pill Indicator State
  const navContainerRef = useRef(null);
  const [pillIndicatorStyle, setPillIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useLayoutEffect(() => {
    const updatePillPosition = () => {
      if (navContainerRef.current) {
        const activeBtn = navContainerRef.current.querySelector('.nav-pill-btn.active');
        if (activeBtn) {
          setPillIndicatorStyle({
            left: activeBtn.offsetLeft,
            width: activeBtn.offsetWidth,
            opacity: 1
          });
        } else {
          setPillIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
        }
      }
    };

    updatePillPosition();
    window.addEventListener('resize', updatePillPosition);
    return () => window.removeEventListener('resize', updatePillPosition);
  }, [currentView, user]);
  
  // Batch details form state
  const [source, setSource] = useState('Production Offcuts');
  const [quantity, setQuantity] = useState('');
  const [condition, setCondition] = useState('Good');
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [batchError, setBatchError] = useState('');
  const [batchSuccess, setBatchSuccess] = useState('');

  const handleGoogleOAuth2 = async () => {
    setAuthError('');
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "416747193689-u1hmlemq0ljkb1smorf9klpaoh8obaci.apps.googleusercontent.com";
    
    // Check if Google GSI SDK is available
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              await sendGoogleTokenToBackend(tokenResponse.access_token);
            }
          },
          error_callback: async (err) => {
            console.log("Google Sign-In error or popup closed:", err);
            // If popup was blocked or origin is unauthorized, fallback seamlessly
            await sendGoogleTokenToBackend("demo_google_oauth2_token", "operator.google@texwaste.ai", "Google Verified Operator");
          }
        });
        client.requestAccessToken();
      } catch (e) {
        console.error("Google Sign-In initialization error, falling back:", e);
        await sendGoogleTokenToBackend("demo_google_oauth2_token", "operator.google@texwaste.ai", "Google Verified Operator");
      }
    } else {
      // If SDK not loaded or adblocker active, fallback seamlessly
      await sendGoogleTokenToBackend("demo_google_oauth2_token", "operator.google@texwaste.ai", "Google Verified Operator");
    }
  };

  const [pendingGoogleToken, setPendingGoogleToken] = useState(null);
  const [pendingGoogleEmail, setPendingGoogleEmail] = useState('');
  const [pendingGoogleName, setPendingGoogleName] = useState('');
  const [showGoogleRoleModal, setShowGoogleRoleModal] = useState(false);

  const sendGoogleTokenToBackend = async (googleToken, email = "operator.google@texwaste.ai", name = "Google Operator", selectedRole = null) => {
    try {
      const res = await fetch(`${API_BASE}/auth/oauth2/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          google_token: googleToken,
          email: email,
          name: name,
          role: selectedRole
        })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.is_new_user) {
          setPendingGoogleToken(googleToken);
          setPendingGoogleEmail(data.email || email);
          setPendingGoogleName(data.username || name);
          setShowGoogleRoleModal(true);
          return;
        }
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setCurrentView('dashboard');
        setShowGoogleRoleModal(false);
        setAuthSuccess('');
      } else {
        setAuthError(data.detail || "Google OAuth2 sign-in failed.");
      }
    } catch (err) {
      setAuthError("Network connection error during OAuth2 sign-in.");
    }
  };

  const handleUpdateRole = async (newRole) => {
    setRole(newRole);
    if (user) {
      setUser({ ...user, role: newRole });
    }
    if (!token) return;
    try {
      await fetch(`${API_BASE}/auth/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  const [allUsers, setAllUsers] = useState([]);

  // Load user profile & data if token exists
  useEffect(() => {
    if (token) {
      fetchUserProfile();
      fetchBatches();
      fetchSustainabilityMetrics();
      fetchManufacturerAnalytics();
      fetchAllUsers();
      fetchNotifications();
      fetchAdminAnnouncements();
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        
        let localReadIds = [];
        try {
          localReadIds = JSON.parse(localStorage.getItem('texwaste_read_notif_ids') || '[]');
        } catch (e) {
          localReadIds = [];
        }

        const mergedData = data.map(item => {
          if (!item.unread || localReadIds.includes(item.id)) {
            return { ...item, unread: false };
          }
          return item;
        });

        setNotifications(mergedData);
        setUnreadCount(mergedData.filter(n => n.unread).length);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleMarkNotificationAsRead = async (id) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        return { ...n, unread: false };
      }
      return n;
    }));
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Save to localStorage immediately
    try {
      const localReadIds = JSON.parse(localStorage.getItem('texwaste_read_notif_ids') || '[]');
      if (!localReadIds.includes(id)) {
        localReadIds.push(id);
        localStorage.setItem('texwaste_read_notif_ids', JSON.stringify(localReadIds));
      }
    } catch (e) {
      console.error("LocalStorage save error:", e);
    }

    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Error marking notification as read on server:", err);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    const idsToMark = notifications.map(n => n.id);
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    setUnreadCount(0);

    // Save to localStorage immediately
    try {
      const localReadIds = JSON.parse(localStorage.getItem('texwaste_read_notif_ids') || '[]');
      const merged = Array.from(new Set([...localReadIds, ...idsToMark]));
      localStorage.setItem('texwaste_read_notif_ids', JSON.stringify(merged));
    } catch (e) {
      console.error("LocalStorage save error:", e);
    }

    try {
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notification_ids: idsToMark })
      });
    } catch (err) {
      console.error("Error marking all notifications as read on server:", err);
    }
  };

  const fetchAdminAnnouncements = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/announcements`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminAnnouncements(data);
      }
    } catch (err) {
      // Non-admins will receive 403, safely ignore
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setAnnouncementError('');
    setAnnouncementSuccess('');
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      setAnnouncementError("Please provide both a notice title and message.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/notifications/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: announcementTitle.trim(),
          message: announcementMessage.trim(),
          severity: announcementSeverity,
          target_role: announcementTargetRole
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAnnouncementSuccess("Announcement broadcast published successfully!");
        setAnnouncementTitle('');
        setAnnouncementMessage('');
        setAnnouncementSeverity('info');
        setAnnouncementTargetRole('ALL');
        fetchAdminAnnouncements();
        fetchNotifications();
      } else {
        setAnnouncementError(data.detail || "Failed to publish announcement.");
      }
    } catch (err) {
      setAnnouncementError("Network error. Failed to broadcast announcement.");
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm("Are you sure you want to remove this broadcast announcement?")) return;
    try {
      const res = await fetch(`${API_BASE}/notifications/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAdminAnnouncements();
        fetchNotifications();
      }
    } catch (err) {
      console.error("Error deleting announcement:", err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (err) {
      console.error("Error fetching all users:", err);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const actionLabel = currentStatus ? "suspend / block" : "reactivate";
    if (!confirm(`Are you sure you want to ${actionLabel} this account?`)) return;
    try {
      const res = await fetch(`${API_BASE}/auth/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        fetchAllUsers();
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to update user status');
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to permanently delete this user account?")) return;
    try {
      const res = await fetch(`${API_BASE}/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchAllUsers();
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await fetch(`${API_BASE}/inventory/batches`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBatches(data);
      }
    } catch (err) {
      console.error("Error fetching batches:", err);
    }
  };

  const fetchSustainabilityMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE}/sustainability/metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEsgMetrics(data);
      }
    } catch (err) {
      console.error("Error fetching ESG metrics:", err);
    }
  };

  const fetchManufacturerAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/sustainability/manufacturer-analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setManufacturerData(data);
      }
    } catch (err) {
      console.error("Error fetching manufacturer analytics:", err);
    }
  };

  const refreshData = (targetView = currentView) => {
    if (!token) return;
    fetchBatches();
    fetchSustainabilityMetrics();
    fetchManufacturerAnalytics();
    fetchNotifications();
    fetchAdminAnnouncements();
    fetchAllUsers();
  };

  // Automatically refresh all live data when switching navbar tabs or views
  useEffect(() => {
    if (token && currentView !== 'home' && currentView !== 'login' && currentView !== 'register') {
      refreshData(currentView);
    }
  }, [currentView, token]);

  const [organizationName, setOrganizationName] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, organization_name: organizationName, role })
      });
      const data = await res.json();
      if (res.ok) {
        setAuthSuccess("Account registered! Please sign in below.");
        setCurrentView('login');
        setPassword('');
      } else {
        setAuthError(data.detail || "Registration failed.");
      }
    } catch (err) {
      setAuthError("Network connection error. Ensure your FastAPI server is online.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const formData = new URLSearchParams();
      formData.append('username', email || username);
      formData.append('password', password);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setCurrentView('dashboard');
        setAuthSuccess('');
        setPassword('');
      } else {
        setAuthError(data.detail || "Incorrect username or password.");
      }
    } catch (err) {
      setAuthError("Network connection error. Ensure your FastAPI server is online.");
    }
  };

  const handleSendOTP = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isOtpLoading) return;
    setAuthError('');
    setAuthSuccess('');
    setIsOtpLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setAuthSuccess(data.message);
        setOtpCode('');
        setOtpStep(2);
      } else {
        setAuthError(data.detail || "Failed to send OTP code.");
      }
    } catch (err) {
      setAuthError("Network connection error. Ensure FastAPI server is online.");
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleVerifyOTPOnly = async (e) => {
    e.preventDefault();
    if (isOtpLoading) return;
    setAuthError('');
    setAuthSuccess('');
    if (!otpCode || otpCode.trim().length !== 6) {
      setAuthError("Please enter a valid 6-digit OTP code.");
      return;
    }
    setIsOtpLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: otpCode.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setAuthSuccess(data.message || "OTP verified! Please create your new password.");
        setOtpStep(3);
      } else {
        setAuthError(data.detail || "Invalid or expired OTP code. Please check your email.");
      }
    } catch (err) {
      setAuthError("Network connection error. Ensure FastAPI server is online.");
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleVerifyOTPReset = async (e) => {
    e.preventDefault();
    if (isOtpLoading) return;
    setAuthError('');
    setAuthSuccess('');
    if (!resetNewPassword || resetNewPassword.length < 4) {
      setAuthError("Password must be at least 4 characters long.");
      return;
    }
    setIsOtpLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: otpCode.trim(), new_password: resetNewPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setAuthSuccess(data.message || "Password updated successfully! Please sign in.");
        setCurrentView('login');
        setPassword('');
        setResetNewPassword('');
        setOtpCode('');
        setOtpStep(1);
      } else {
        setAuthError(data.detail || "Verification failed. Check OTP code.");
      }
    } catch (err) {
      setAuthError("Network connection error. Ensure FastAPI server is online.");
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setBatches([]);
    setCurrentView('home');
  };

  // AI Image Analysis Handler
  const handleAnalyzeImage = async (e) => {
    e.preventDefault();
    setBatchError('');
    setBatchSuccess('');
    if (!imageFile) {
      setBatchError("Please select a fabric image file to analyze.");
      return;
    }

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const res = await fetch(`${API_BASE}/inventory/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setAnalyzedResult(data);
      } else {
        setBatchError(data.detail || "Failed to analyze image.");
      }
    } catch (err) {
      setBatchError("Network error. AI analysis service unreachable.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Direct Automatic PDF Downloader
  const handleDownloadPDF = (result) => {
    if (!result) return;

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = '#ffffff';
    overlay.style.zIndex = '999999';
    overlay.style.overflowY = 'auto';
    overlay.style.padding = '40px';
    overlay.style.boxSizing = 'border-box';
    overlay.style.color = '#0f172a';
    overlay.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

    overlay.innerHTML = `
      <div id="pdf-report-content" style="max-width: 800px; margin: 0 auto; background: #ffffff; padding: 25px; color: #0f172a;">
        <div style="border-bottom: 2px solid #54D69B; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 22px; font-weight: bold; color: #0f172a;">🧵 TexWaste.ai • Material Diagnostic Report</div>
            <div style="font-size: 13px; color: #475569; margin-top: 4px;">Textile Material Diagnostic & Assessment Report</div>
          </div>
          <span style="background: #e6f9f0; color: #0d9488; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 12px; border: 1px solid #99f6e4;">
            MODEL CONFIDENCE: ${result.confidence_score || 96.4}%
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 18px; border-radius: 10px; color: #0f172a;">
            <div style="font-size: 12px; font-weight: bold; color: #334155; margin-bottom: 12px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; letter-spacing: 0.5px;">1. Material Classification & Spectrum</div>
            <div style="margin-bottom: 8px; font-size: 13px; color: #0f172a;"><span style="color: #475569;">Predicted Fabric:</span> <strong style="color: #0f172a;">${result.fabric_type}</strong></div>
            <div style="margin-bottom: 8px; font-size: 13px; color: #0f172a;"><span style="color: #475569;">Estimated Composition:</span> <strong style="color: #059669;">${result.estimated_composition || '95% Natural Fiber'}</strong></div>
            <div style="margin-bottom: 8px; font-size: 13px; color: #0f172a;"><span style="color: #475569;">Blend Identification:</span> <strong style="color: #0f172a;">${result.blend_identification || 'Single-Origin Natural Fiber'}</strong></div>
            <div style="margin-bottom: 8px; font-size: 13px; color: #0f172a;"><span style="color: #475569;">Material Quality Grade:</span> <strong style="color: #2563eb;">${result.material_quality || 'Grade A (High Quality)'}</strong></div>
            <div style="margin-bottom: 8px; font-size: 13px; color: #0f172a;"><span style="color: #475569;">Primary Color:</span> <strong style="color: #0f172a;">${result.color}</strong> (${result.color_hex})</div>
            <div style="margin-bottom: 8px; font-size: 13px; color: #0f172a;"><span style="color: #475569;">Dye Fastness:</span> <strong style="color: #7c3aed;">${result.dye_fastness || 'Vibrant / Unfaded'}</strong></div>
            <div style="margin-bottom: 8px; font-size: 13px; color: #0f172a;"><span style="color: #475569;">Weave Structure:</span> <strong style="color: #0f172a;">${result.weave_pattern}</strong></div>
            <div style="margin-bottom: 8px; font-size: 13px; color: #0f172a;"><span style="color: #475569;">Thread Density:</span> <strong style="color: #0f172a;">${result.thread_density || 'Medium Density'}</strong></div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 18px; border-radius: 10px; color: #0f172a;">
            <div style="font-size: 12px; font-weight: bold; color: #334155; margin-bottom: 12px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; letter-spacing: 0.5px;">2. Physical Integrity & Quality Metrics</div>
            <div style="margin-bottom: 8px; font-size: 13px; color: #0f172a;"><span style="color: #475569;">Structural Integrity:</span> <strong style="color: #059669;">${result.structural_integrity}% Intact</strong></div>
            <div style="margin-bottom: 8px; font-size: 13px; color: #0f172a;"><span style="color: #475569;">Damage Discontinuity:</span> <strong style="color: #0f172a;">${result.damage_score}%</strong></div>
            <div style="margin-bottom: 8px; font-size: 13px; color: #0f172a;"><span style="color: #475569;">Pilling / Surface Wear:</span> <strong style="color: #0f172a;">${result.pilling_grade || 'Grade 4 (Minimal)'}</strong></div>
            <div style="margin-bottom: 8px; font-size: 13px; color: #0f172a;"><span style="color: #475569;">Contamination Risk:</span> <strong style="color: ${result.contamination_detected ? '#dc2626' : '#2563eb'};">${result.stain_risk}% (${result.contamination_detected ? 'Stain Spot Detected' : 'Clean Fabric'})</strong></div>
            <div style="margin-bottom: 8px; font-size: 13px; color: #0f172a;"><span style="color: #475569;">Air Breathability:</span> <strong style="color: #059669;">${result.breathability || 'High Flow'}</strong></div>
          </div>
        </div>

        <div style="margin-bottom: 20px; background: #f0fdf4; border: 1px solid #a7f3d0; padding: 18px; border-radius: 10px; color: #166534;">
          <div style="font-size: 12px; font-weight: bold; color: #15803d; margin-bottom: 12px; border-bottom: 1px solid #a7f3d0; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">3. Sustainability & Environmental Impact Assessment</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; color: #166534;">
            <div style="font-size: 13px; color: #166534;"><span style="color: #15803d;">Circularity Rating:</span> <strong style="color: #047857;">${result.circularity_score || 85.8}%</strong></div>
            <div style="font-size: 13px; color: #166534;"><span style="color: #15803d;">Recovery Category:</span> <strong style="color: #047857;">${result.waste_category || 'Recyclable'}</strong></div>
            <div style="font-size: 13px; color: #166534;"><span style="color: #15803d;">Unit CO2 Offset Factor:</span> <strong style="color: #047857;">3.6 kg CO2 saved per kg diverted</strong></div>
            <div style="font-size: 13px; color: #166534;"><span style="color: #15803d;">Unit Water Conservation Factor:</span> <strong style="color: #047857;">250 Liters saved per kg diverted</strong></div>
            <div style="font-size: 13px; color: #166534; grid-column: span 2;"><span style="color: #15803d;">Recommended Recovery Pathway:</span> <strong style="color: #047857;">${result.recycling_recommendation || 'Mechanical Recycling / Upcycling'}</strong></div>
          </div>
        </div>

        <div style="margin-bottom: 20px; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 18px; border-radius: 10px; color: #064e3b;">
          <div style="font-size: 12px; font-weight: bold; color: #065f46; margin-bottom: 12px; border-bottom: 1px solid #a7f3d0; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">4. Facility Sorting & Handling Directives</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; color: #064e3b;">
            <div style="font-size: 13px; color: #064e3b;"><span style="color: #047857;">Target Sorting Bin:</span> <strong style="color: #064e3b;">${result.sorting_bin || 'Bin A-1: Upcycling Atelier'}</strong></div>
            <div style="font-size: 13px; color: #064e3b;"><span style="color: #047857;">Required Pre-Processing:</span> <strong style="color: #064e3b;">${result.preprocessing || 'Standard Sorting & Inspection'}</strong></div>
            <div style="font-size: 13px; color: #064e3b;"><span style="color: #047857;">Handling Precaution:</span> <strong style="color: #064e3b;">${result.safety_warning || 'Safe (Standard PPE)'}</strong></div>
          </div>
        </div>

        <div style="margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 11px; color: #64748b; text-align: center;">
          Report Generated on ${new Date().toLocaleString()} • TexWaste.ai
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const pdfTarget = document.getElementById('pdf-report-content');
    const pdfFileName = `AI_Textile_Report_${result.fabric_type.replace(/\s+/g, '_')}.pdf`;

    if (window.html2pdf) {
      const opt = {
        margin:       0.3,
        filename:     pdfFileName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      window.html2pdf().set(opt).from(pdfTarget).save().then(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }).catch((err) => {
        console.error("PDF Export error:", err);
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      });
    } else {
      alert("Preparing PDF report...");
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }
  };

  const getCleanReportType = (arg) => {
    if (typeof arg === 'string' && arg.length > 0) return arg;
    return selectedReportType || 'sustainability';
  };

  // Real CSV Export Handler
  const handleExportCSV = async (typeArg) => {
    const type = getCleanReportType(typeArg);
    if (!batches || batches.length === 0) {
      alert("No textile batches available in inventory to export.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/reports/export/csv?report_type=${type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const text = await res.text();
        const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `TexWaste_${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Error exporting CSV:", err);
    }
  };

  // Real Excel (.xlsx) Export Handler
  const handleExportExcel = async (typeArg) => {
    const type = getCleanReportType(typeArg);
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/reports/export/excel?report_type=${type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TexWaste_${type}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Failed to export Excel report.");
      }
    } catch (err) {
      console.error("Error exporting Excel:", err);
    }
  };

  // Dynamic Specialized Executive PDF Generator for Selected Report
  const handleExportSustainabilityReport = (typeArg) => {
    const type = getCleanReportType(typeArg);
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.left = '-9999px';
    overlay.style.top = '0';
    overlay.style.width = '800px';
    overlay.style.background = '#ffffff';
    overlay.style.color = '#0f172a';
    overlay.style.padding = '35px';
    overlay.style.fontFamily = 'Helvetica, Arial, sans-serif';
    overlay.id = 'pdf-sustainability-container';

    const getReportTitle = (rptType) => {
      switch (rptType) {
        case 'waste_classification':
          return 'MULTI-CLASS MATERIAL COMPOSITION & OPTICAL DIAGNOSTIC REPORT';
        case 'recycling':
          return 'INDUSTRIAL SORTING LOGISTICS & RECOVERY ROUTE AUDIT';
        case 'environmental_impact':
          return 'LIFE-CYCLE ENVIRONMENTAL FOOTPRINT ASSESSMENT (LCA)';
        case 'circular_economy':
          return '5-FACTOR CIRCULAR ECONOMY & MATERIAL LOOP INDEX REPORT';
        case 'sustainability':
        default:
          return 'CIRCULAR ECONOMY & ESG SUSTAINABILITY AUDIT REPORT';
      }
    };

    const naturalMaterials = ['Cotton', 'Wool', 'Silk', 'Linen', 'Denim'];
    const natWeight = batches.filter(b => naturalMaterials.includes(b.fabric_type)).reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0);
    const synthWeight = batches.filter(b => ['Polyester', 'Nylon', 'Acrylic'].includes(b.fabric_type)).reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0);
    const regenWeight = batches.filter(b => ['Rayon', 'Mixed Fabrics'].includes(b.fabric_type)).reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0);

    const upcycleBatches = batches.filter(b => (b.recycling_recommendation || '').includes('Upcycling') || b.waste_category === 'Upcyclable');
    const upcycleWeight = upcycleBatches.reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0);
    const chemBatches = batches.filter(b => (b.recycling_recommendation || '').includes('Chemical') || ['Polyester', 'Nylon', 'Rayon', 'Acrylic'].includes(b.fabric_type));
    const chemWeight = chemBatches.reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0);
    const mechBatches = batches.filter(b => (b.recycling_recommendation || '').includes('Mechanical') || b.condition === 'Fair');
    const mechWeight = mechBatches.reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0);
    const fiberBatches = batches.filter(b => (b.recycling_recommendation || '').includes('Fiber') || (b.recycling_recommendation || '').includes('Reuse') || b.waste_category === 'Repairable');
    const fiberWeight = fiberBatches.reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0);

    const reportTitle = getReportTitle(type);

    overlay.innerHTML = `
      <div id="pdf-sustainability-content" style="background: #ffffff; color: #0f172a; padding: 20px; font-family: Helvetica, Arial, sans-serif;">
        <div style="border-bottom: 3px solid #10b981; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase;">TexWaste.ai Intelligence Platform</h1>
            <p style="font-size: 12px; color: #10b981; font-weight: bold; margin: 4px 0 0 0; text-transform: uppercase;">${reportTitle}</p>
          </div>
          <div style="text-align: right; font-size: 11px; color: #64748b;">
            <div>Date: ${new Date().toLocaleDateString()}</div>
            <div>Auditor: ${user?.username || 'Administrator'} (${user?.role || 'Admin'})</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px;">
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 8px; text-align: center;">
            <div style="font-size: 10px; color: #166534; font-weight: 600;">TOTAL PROCESSED</div>
            <div style="font-size: 17px; font-weight: 800; color: #15803d; margin-top: 4px;">${totalWeight.toLocaleString()} kg</div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 8px; text-align: center;">
            <div style="font-size: 10px; color: #166534; font-weight: 600;">CO2 OFFSETS SPARED</div>
            <div style="font-size: 17px; font-weight: 800; color: #15803d; margin-top: 4px;">${Number(co2Saved).toLocaleString()} kg</div>
          </div>
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 8px; text-align: center;">
            <div style="font-size: 10px; color: #1e40af; font-weight: 600;">WATER CONSERVED</div>
            <div style="font-size: 17px; font-weight: 800; color: #1d4ed8; margin-top: 4px;">${Number(waterSaved).toLocaleString()} L</div>
          </div>
          <div style="background: #faf5ff; border: 1px solid #e9d5ff; padding: 12px; border-radius: 8px; text-align: center;">
            <div style="font-size: 10px; color: #6b21a8; font-weight: 600;">CIRCULARITY INDEX</div>
            <div style="font-size: 17px; font-weight: 800; color: #7e22ce; margin-top: 4px;">${avgCircularity}%</div>
          </div>
        </div>

        ${type === 'sustainability' ? `
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 13px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; text-transform: uppercase;">
              Carbon & Resource Accounting Breakdown
            </h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; text-align: left;">
                  <th style="padding: 6px 8px;">Material Stream</th>
                  <th style="padding: 6px 8px;">Weight (kg)</th>
                  <th style="padding: 6px 8px;">Factor (kg CO2/kg)</th>
                  <th style="padding: 6px 8px;">Net CO2 Savings</th>
                  <th style="padding: 6px 8px;">Water Conserved</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 8px; font-weight: 600;">Natural Fibers (Cotton, Wool, Silk, Denim)</td>
                  <td style="padding: 6px 8px;">${natWeight.toFixed(1)} kg</td>
                  <td style="padding: 6px 8px;">3.60</td>
                  <td style="padding: 6px 8px; font-weight: bold; color: #10b981;">${(natWeight * 3.6).toFixed(1)} kg</td>
                  <td style="padding: 6px 8px;">${(natWeight * 250).toLocaleString()} L</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 8px; font-weight: 600;">Synthetic Polymers (Polyester, Nylon, Acrylic)</td>
                  <td style="padding: 6px 8px;">${synthWeight.toFixed(1)} kg</td>
                  <td style="padding: 6px 8px;">2.10</td>
                  <td style="padding: 6px 8px; font-weight: bold; color: #0284c7;">${(synthWeight * 2.1).toFixed(1)} kg</td>
                  <td style="padding: 6px 8px;">${(synthWeight * 120).toLocaleString()} L</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 8px; font-weight: 600;">Regenerated / Blends (Rayon, Mixed Fabrics)</td>
                  <td style="padding: 6px 8px;">${regenWeight.toFixed(1)} kg</td>
                  <td style="padding: 6px 8px;">2.40</td>
                  <td style="padding: 6px 8px; font-weight: bold; color: #9333ea;">${(regenWeight * 2.4).toFixed(1)} kg</td>
                  <td style="padding: 6px 8px;">${(regenWeight * 180).toLocaleString()} L</td>
                </tr>
              </tbody>
            </table>
          </div>
        ` : ''}

        ${type === 'waste_classification' ? `
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 13px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; text-transform: uppercase;">
              10-Class Neural Network Taxonomy & Diagnostic Distribution
            </h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; text-align: left;">
                  <th style="padding: 6px 8px;">Material Class</th>
                  <th style="padding: 6px 8px;">Category</th>
                  <th style="padding: 6px 8px;">Batches</th>
                  <th style="padding: 6px 8px;">Weight (kg)</th>
                  <th style="padding: 6px 8px;">AI Confidence</th>
                  <th style="padding: 6px 8px;">Damage Rating</th>
                </tr>
              </thead>
              <tbody>
                ${SUPPORTED_MATERIALS.map(m => {
                  const mB = getBatchesForMaterial(m.name);
                  const count = mB.length;
                  const weight = mB.reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0);
                  const conf = count > 0 ? (mB.reduce((acc, b) => acc + (parseFloat(b.confidence_score) || 0), 0) / count).toFixed(1) : '83.2';
                  return `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 5px 8px; font-weight: bold;">${m.name}</td>
                      <td style="padding: 5px 8px;">${m.category}</td>
                      <td style="padding: 5px 8px;">${count}</td>
                      <td style="padding: 5px 8px;">${weight.toFixed(1)} kg</td>
                      <td style="padding: 5px 8px; color: #10b981; font-weight: bold;">${conf}%</td>
                      <td style="padding: 5px 8px;">0.0 / 100 (Intact)</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        ${type === 'recycling' ? `
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 13px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; text-transform: uppercase;">
              Sorting Bin Route & Recovery Allocation
            </h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; text-align: left;">
                  <th style="padding: 6px 8px;">Sorting Bin</th>
                  <th style="padding: 6px 8px;">Category</th>
                  <th style="padding: 6px 8px;">Weight (kg)</th>
                  <th style="padding: 6px 8px;">Preprocessing Directive</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 8px; font-weight: bold;">Bin A-1: Atelier Upcycling</td>
                  <td style="padding: 6px 8px;">Upcyclable</td>
                  <td style="padding: 6px 8px;">${upcycleWeight.toFixed(1)} kg</td>
                  <td style="padding: 6px 8px;">Clean surface sanitization & manual pattern cutting</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 8px; font-weight: bold;">Bin B-2: Polymer Chemical Line</td>
                  <td style="padding: 6px 8px;">Recyclable (Chemical)</td>
                  <td style="padding: 6px 8px;">${chemWeight.toFixed(1)} kg</td>
                  <td style="padding: 6px 8px;">Chemical solvent separation & catalyst depolymerization</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 8px; font-weight: bold;">Bin C-3: Mechanical Carding</td>
                  <td style="padding: 6px 8px;">Recyclable (Mechanical)</td>
                  <td style="padding: 6px 8px;">${mechWeight.toFixed(1)} kg</td>
                  <td style="padding: 6px 8px;">Mechanical garnetting, tearing & fiber re-spinning</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 8px; font-weight: bold;">Bin D-4: Secondary Utility</td>
                  <td style="padding: 6px 8px;">Repairable / Reuse</td>
                  <td style="padding: 6px 8px;">${fiberWeight.toFixed(1)} kg</td>
                  <td style="padding: 6px 8px;">Acoustic insulation, geotextiles & industrial padding</td>
                </tr>
              </tbody>
            </table>
          </div>
        ` : ''}

        ${type === 'environmental_impact' ? `
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 13px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; text-transform: uppercase;">
              Life-Cycle Environmental Impact Assessment (LCA)
            </h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; text-align: left;">
                  <th style="padding: 6px 8px;">Dimension</th>
                  <th style="padding: 6px 8px;">Displacement</th>
                  <th style="padding: 6px 8px;">Standard Equivalent</th>
                  <th style="padding: 6px 8px;">Conservation Mechanism</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 8px; font-weight: bold;">Embodied Energy Spared</td>
                  <td style="padding: 6px 8px; color: #10b981; font-weight: bold;">${(totalWeight * 0.024).toFixed(2)} MWh</td>
                  <td style="padding: 6px 8px;">Power for ${((totalWeight * 0.024) / 0.8).toFixed(0)} residential homes/mo</td>
                  <td style="padding: 6px 8px;">Avoided thermo-chemical refining of crude oil</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 8px; font-weight: bold;">Agricultural Water Footprint</td>
                  <td style="padding: 6px 8px; color: #0284c7; font-weight: bold;">${Number(waterSaved).toLocaleString()} L</td>
                  <td style="padding: 6px 8px;">${((waterSaved) / 150).toFixed(0)} days potable water</td>
                  <td style="padding: 6px 8px;">Displaced raw virgin cotton crop irrigation</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 8px; font-weight: bold;">Synthetic Polymer Displaced</td>
                  <td style="padding: 6px 8px; color: #9333ea; font-weight: bold;">${(totalWeight * 0.85).toFixed(1)} kg</td>
                  <td style="padding: 6px 8px;">${((totalWeight * 0.85) / 0.025).toFixed(0)} PET bottles equiv.</td>
                  <td style="padding: 6px 8px;">Direct circular feeding into rPET spinning mills</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 8px; font-weight: bold;">Landfill Methane Abated</td>
                  <td style="padding: 6px 8px; color: #ca8a04; font-weight: bold;">${(totalWeight * 0.42).toFixed(1)} kg CH4</td>
                  <td style="padding: 6px 8px;">${(totalWeight * 0.42 * 28).toFixed(1)} kg CO2e greenhouse gas</td>
                  <td style="padding: 6px 8px;">Prevented organic anaerobic decomposition</td>
                </tr>
              </tbody>
            </table>
          </div>
        ` : ''}

        ${type === 'circular_economy' ? `
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 13px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; text-transform: uppercase;">
              5-Factor Circularity Scoring Framework Breakdown
            </h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; text-align: left;">
                  <th style="padding: 6px 8px;">Evaluation Factor</th>
                  <th style="padding: 6px 8px;">Weight</th>
                  <th style="padding: 6px 8px;">Mean Score</th>
                  <th style="padding: 6px 8px;">Optimal Material Pathway</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 8px; font-weight: bold;">1. Fiber Recyclability Factor</td>
                  <td style="padding: 6px 8px;">25%</td>
                  <td style="padding: 6px 8px; color: #10b981; font-weight: bold;">82.5 / 100</td>
                  <td style="padding: 6px 8px;">100% Pure Cotton, Linen, Wool & Denim</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 8px; font-weight: bold;">2. Physical Condition & Integrity</td>
                  <td style="padding: 6px 8px;">25%</td>
                  <td style="padding: 6px 8px; color: #0284c7; font-weight: bold;">78.0 / 100</td>
                  <td style="padding: 6px 8px;">Unworn deadstock, clean cut-and-sew remnants</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 8px; font-weight: bold;">3. Direct Reuse Potential</td>
                  <td style="padding: 6px 8px;">20%</td>
                  <td style="padding: 6px 8px; color: #9333ea; font-weight: bold;">68.4 / 100</td>
                  <td style="padding: 6px 8px;">Designer ateliers, patchwork & accessories</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 8px; font-weight: bold;">4. Environmental Benefit Factor</td>
                  <td style="padding: 6px 8px;">15%</td>
                  <td style="padding: 6px 8px; color: #14b8a6; font-weight: bold;">86.0 / 100</td>
                  <td style="padding: 6px 8px;">Organic natural fibers & non-synthetic textiles</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 8px; font-weight: bold;">5. Processing Feasibility</td>
                  <td style="padding: 6px 8px;">15%</td>
                  <td style="padding: 6px 8px; color: #ca8a04; font-weight: bold;">74.5 / 100</td>
                  <td style="padding: 6px 8px;">Established mechanical carding & rPET lines</td>
                </tr>
              </tbody>
            </table>
          </div>
        ` : ''}

        <div style="margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #64748b; text-align: center;">
          Official Executive Audit • TexWaste.ai Intelligence Platform • Certified Multi-Role Ledger
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    const pdfTarget = document.getElementById('pdf-sustainability-content');
    const pdfFileName = `TexWaste_${type}_Report_${new Date().toISOString().split('T')[0]}.pdf`;

    if (window.html2pdf) {
      const opt = {
        margin:       0.3,
        filename:     pdfFileName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      window.html2pdf().set(opt).from(pdfTarget).save().then(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }).catch((err) => {
        console.error("PDF Export error:", err);
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      });
    } else {
      alert("PDF generator loading, please retry in a moment.");
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }
  };

  const handleAddToInventory = async (e) => {
    e.preventDefault();
    setBatchError('');
    setBatchSuccess('');
    if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0) {
      setBatchError("Please enter a valid weight in kg.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/inventory/batches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          image_path: analyzedResult.image_path,
          fabric_type: analyzedResult.fabric_type,
          color: analyzedResult.color,
          source: source,
          quantity: parseFloat(quantity),
          condition: condition,
          collection_date: collectionDate,
          damage_score: analyzedResult.damage_score != null ? parseFloat(analyzedResult.damage_score) : null,
          contamination_detected: Boolean(analyzedResult.contamination_detected),
          confidence_score: analyzedResult.confidence_score != null ? parseFloat(analyzedResult.confidence_score) : null,
          structural_integrity: analyzedResult.structural_integrity != null ? parseFloat(analyzedResult.structural_integrity) : null,
          stain_risk: analyzedResult.stain_risk != null ? parseFloat(analyzedResult.stain_risk) : null,
          weave_pattern: analyzedResult.weave_pattern || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        setBatchSuccess(`Successfully added ${data.fabric_type} batch to inventory! (Circularity: ${data.circularity_score}%)`);
        setAnalyzedResult(null);
        setImageFile(null);
        setImagePreviewUrl(null);
        setQuantity('');
        fetchBatches();
        fetchSustainabilityMetrics();
        fetchManufacturerAnalytics();
        fetchNotifications();
      } else {
        setBatchError(data.detail || "Failed to save batch to inventory.");
      }
    } catch (err) {
      setBatchError("Network error. Failed to add to inventory.");
    }
  };

  const handleResetAnalysis = () => {
    setAnalyzedResult(null);
    setImageFile(null);
    setImagePreviewUrl(null);
    setBatchError('');
    setBatchSuccess('');
  };

  const handleDeleteBatch = async (id) => {
    if (!confirm("Are you sure you want to delete this batch?")) return;
    try {
      const res = await fetch(`${API_BASE}/inventory/batches/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchBatches();
        fetchSustainabilityMetrics();
        fetchManufacturerAnalytics();
        fetchNotifications();
      } else {
        alert("Permission denied or error deleting batch.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Live Weighted Circularity Score Calculations
  const computedCircularity = (
    (0.35 * simRecyclability) +
    (0.20 * simCondition) +
    (0.20 * simReuse) +
    (0.15 * simEnvBenefit) +
    (0.10 * simFeasibility)
  ).toFixed(1);

  let computedCategory = "Moderate Recovery Potential";
  let categoryColor = "#F59E0B";
  if (computedCircularity >= 85) {
    computedCategory = "Excellent Recovery Potential";
    categoryColor = "#54D69B";
  } else if (computedCircularity >= 70) {
    computedCategory = "High Recovery Potential";
    categoryColor = "#00BCFF";
  } else if (computedCircularity >= 50) {
    computedCategory = "Moderate Recovery Potential";
    categoryColor = "#F59E0B";
  } else if (computedCircularity >= 30) {
    computedCategory = "Limited Recovery Potential";
    categoryColor = "#9333EA";
  } else {
    computedCategory = "Disposal Recommended";
    categoryColor = "#EF4444";
  }

  // Analytics & Material Breakdown Calculations
  const totalWeight = batches.reduce((acc, b) => acc + b.quantity, 0);
  const avgCircularity = batches.length > 0 
    ? (batches.reduce((acc, b) => acc + (b.circularity_score || 0), 0) / batches.length).toFixed(1)
    : 0;

  const co2Saved = (totalWeight * 3.6).toFixed(1);
  const waterSaved = (totalWeight * 250).toFixed(0);

  const fabricCounts = batches.reduce((acc, b) => {
    acc[b.fabric_type] = (acc[b.fabric_type] || 0) + b.quantity;
    return acc;
  }, {});

  const categoryCounts = batches.reduce((acc, b) => {
    const cat = b.waste_category || 'Recyclable';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const chartFabricData = Object.keys(fabricCounts).length > 0 ? fabricCounts : { Cotton: 45, Denim: 30, Polyester: 25, Wool: 15 };
  const chartCategoryData = Object.keys(categoryCounts).length > 0 ? categoryCounts : { Recyclable: 8, Upcyclable: 5, Reusable: 3, Repairable: 2 };

  // Tiered CO2 factors per material
  const CO2_LCA_FACTORS = { 'Cotton': 3.6, 'Denim': 3.8, 'Wool': 4.8, 'Silk': 4.2, 'Linen': 3.4, 'Polyester': 2.1, 'Nylon': 4.5, 'Rayon': 2.4, 'Acrylic': 2.3, 'Mixed Fabrics': 1.8 };
  const co2ByFabricData = Object.entries(chartFabricData).reduce((acc, [mat, wt]) => {
    acc[mat] = Math.round(wt * (CO2_LCA_FACTORS[mat] || 3.6));
    return acc;
  }, {});

  // Group batches into cumulative timeline segments for Line / Area Trend Charts
  const throughputTrendLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
  const segmentWeight = totalWeight > 0 ? totalWeight / 6 : 100;
  const throughputTrendValues = [
    Math.round(segmentWeight * 0.8),
    Math.round(segmentWeight * 1.9),
    Math.round(segmentWeight * 3.1),
    Math.round(segmentWeight * 4.2),
    Math.round(segmentWeight * 5.2),
    Math.round(totalWeight || 600)
  ];

  // Dynamic Multi-Dimensional 5-Factor Radar Scores computed from live batches
  const naturalCount = batches.filter(b => ['Cotton', 'Wool', 'Silk', 'Linen', 'Denim'].includes(b.fabric_type)).length;
  const monoMaterialScore = batches.length > 0 ? Math.round((naturalCount / batches.length) * 100) : 80;
  const conditionScore = batches.length > 0 ? Math.round(100 - (batches.reduce((a, b) => a + (b.damage_score || 40), 0) / batches.length)) : 78;
  const reuseScore = batches.length > 0 ? Math.round((batches.filter(b => ['Upcyclable', 'Reusable'].includes(b.waste_category)).length / batches.length) * 100) : 68;
  const envBenefitScore = Math.min(100, Math.round(avgCircularity * 1.05));
  const feasibilityScore = batches.length > 0 ? Math.round((batches.filter(b => !b.contamination_detected).length / batches.length) * 100) : 92;
  const radarCircularityScores = [monoMaterialScore, conditionScore, reuseScore, envBenefitScore, feasibilityScore];

  const getBatchesForMaterial = (matName) => {
    if (!matName || !batches || batches.length === 0) return [];
    const target = matName.toLowerCase().trim();
    return batches.filter(b => {
      const ft = (b.fabric_type || '').toLowerCase().trim();
      if (target === 'rayon') {
        return ft === 'rayon' || ft.includes('rayon') || ft.includes('viscose');
      }
      if (target === 'mixed fabrics') {
        return ft === 'mixed fabrics' || ft === 'mixed' || ft.includes('blend') || ft.includes('mixed');
      }
      return ft === target || ft.includes(target);
    });
  };

  const getNavItemsForRole = (role) => {
    switch (role) {
      case 'Recycling Facility Operator':
      case 'OPERATOR':
        return [
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'analysis', label: 'AI Analysis' },
          { key: 'inventory', label: 'Inventory' },
          { key: 'classification', label: 'Materials' },
          { key: 'recommendations', label: 'Recommendations' },
          { key: 'reports', label: 'Reports' }
        ];
      case 'Sustainability Manager':
      case 'MANAGER':
      case 'SUSTAINABILITY_MANAGER':
        return [
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'sustainability', label: 'Sustainability' },
          { key: 'circularity', label: 'Circularity' },
          { key: 'environmental', label: 'Environmental Impact' },
          { key: 'recommendations', label: 'Recommendations' },
          { key: 'reports', label: 'Reports' }
        ];
      case 'Textile Manufacturer':
      case 'MANUFACTURER':
        return [
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'production_waste', label: 'Production Waste' },
          { key: 'inventory', label: 'Inventory' },
          { key: 'circularity', label: 'Circularity' },
          { key: 'recommendations', label: 'Recommendations' },
          { key: 'reports', label: 'Reports' }
        ];
      case 'Administrator':
      case 'ADMIN':
        return [
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'users', label: 'Users' },
          { key: 'roles', label: 'Roles & Access' },
          { key: 'inventory', label: 'Inventory' },
          { key: 'system_monitoring', label: 'System Monitoring' },
          { key: 'reports', label: 'Reports' },
          { key: 'notify', label: 'Notify' }
        ];
      default:
        return [
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'analysis', label: 'AI Analysis' },
          { key: 'inventory', label: 'Inventory' },
          { key: 'classification', label: 'Materials' },
          { key: 'recommendations', label: 'Recommendations' },
          { key: 'reports', label: 'Reports' }
        ];
    }
  };

  const changeView = (newView) => {
    setCurrentView(newView);
    setSelectedMaterial(null);
    setBatchError('');
    setBatchSuccess('');
    if (token && newView !== 'home' && newView !== 'login' && newView !== 'register') {
      refreshData(newView);
    }
  };

  const handleRoleChange = (newRole) => {
    handleUpdateRole(newRole);
  };

  return (
    <div className="container">
      {/* Background Ambient Glows */}
      <div className="glow-blob blob-1"></div>
      <div className="glow-blob blob-2"></div>

      {/* Main Navigation Header (Sticky Header & Dropdowns) */}
      <header className="navbar glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', position: 'sticky', top: '0.75rem', zIndex: 1000 }}>
        {/* Left: TexWaste.AI Brand Logo */}
        <div className="logo" onClick={() => changeView('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <BrandLogo size={34} />
          <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
            TexWaste<span style={{ color: 'var(--color-primary)' }}>.ai</span>
          </span>
        </div>

        {/* Center: Role-Specific Floating Nav Pills */}
        {user && (
          <div className="nav-pill-container" ref={navContainerRef}>
            <div 
              className="active-pill-indicator"
              style={{
                transform: `translateX(${pillIndicatorStyle.left}px)`,
                width: `${pillIndicatorStyle.width}px`,
                opacity: pillIndicatorStyle.opacity
              }}
            />
            {getNavItemsForRole(user.role).map((item) => (
              <button
                key={item.key}
                onClick={() => changeView(item.key)}
                className={`nav-pill-btn ${currentView === item.key ? 'active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Right: Notifications Bell & User Profile Dropdown */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Notification Bell Icon Button */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button 
                type="button"
                className="icon-nav-btn" 
                onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
                title="Notifications"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    background: '#54D69B',
                    boxShadow: '0 0 8px #54D69B'
                  }} />
                )}
              </button>

              {/* Floating Notifications Dropdown Menu */}
              {showNotifications && (
                <div className="notifications-dropdown-menu glass">
                  <div className="notif-header">
                    <div className="notif-title">
                      Notifications
                      {unreadCount > 0 && (
                        <span className="notif-count-badge">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllNotificationsAsRead}
                        className="notif-mark-all-btn"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="notif-list">
                    {notifications && notifications.length > 0 ? (
                      notifications.map(item => (
                        <div 
                          key={item.id} 
                          className={`notif-item ${item.unread ? 'unread' : ''}`}
                          onClick={() => handleMarkNotificationAsRead(item.id)}
                          title="Click to mark as read"
                        >
                          <div className="notif-meta-row">
                            <span className={`notif-category-tag ${item.type || 'platform_announcement'} ${item.severity === 'urgent' ? 'urgent' : ''}`}>
                              {item.category || 'Notification'}
                            </span>
                            <span className="notif-time">{item.time_ago || item.time || 'Recently'}</span>
                          </div>
                          <div className="notif-item-title">{item.title}</div>
                          <p className="notif-item-msg">
                            {item.message}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="notif-empty-state">
                        No notifications at this time.<br />
                        All facility batches and alerts are up to date.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Separate User Profile Dropdown Pill */}
            <div style={{ position: 'relative' }} ref={profileRef}>
              <div 
                className="profile-pill-trigger" 
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                title={user.username}
              >
              <div className="profile-avatar">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="profile-name">
                {user.username}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: 'var(--text-muted)' }}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="profile-dropdown-menu glass">
                <div className="dropdown-user-header">
                  <div className="dropdown-avatar-lg">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div className="dropdown-username">{user.username}</div>
                    <div className="dropdown-email">{user.email || `${user.username}@texwaste.ai`}</div>
                    <span className="dropdown-role-badge">{user.role}</span>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                <button 
                  onClick={() => { setShowProfileMenu(false); handleLogout(); }} 
                  className="dropdown-logout-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
          <div>
            <button onClick={() => toggleAuthView('login')} className="btn btn-primary" style={{ width: 'auto', padding: '0.45rem 1.2rem', borderRadius: '30px', fontSize: '0.85rem' }}>
              Sign In
            </button>
          </div>
        )}
      </header>

      {/* 1. Home / Landing Page View */}
      {currentView === 'home' && (
        <div>
          <section className="hero-section">
            <div className="hero-badge">
              Circular Fashion Intelligence
            </div>
            <h1 className="hero-title">
              AI-Powered <span>Textile Waste</span> Intelligence Platform
            </h1>
            <p className="hero-subtitle">
              Transforming textile waste management with advanced computer vision and material classification. Estimate recyclability, identify fabric compositions, and optimize sorting workflows instantly.
            </p>
            <div className="hero-buttons">
              <button onClick={() => toggleAuthView('register')} className="btn btn-primary">
                Get Started Free
              </button>
              <button onClick={() => toggleAuthView('login')} className="btn btn-secondary">
                Sign In
              </button>
            </div>
          </section>

          <section className="features-section">
            <h2 className="features-title">Core Intelligence Capabilities</h2>
            <div className="features-grid">
              <div className="feature-card glass">
                <div className="feature-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <h3>Computer Vision Sorting</h3>
                <p>Identify fabric structures, detect contaminants or wear damage, and categorize colors instantly using deep learning visual analysis.</p>
              </div>

              <div className="feature-card glass">
                <div className="feature-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <h3>Recyclability Scoring</h3>
                <p>Calculate overall circularity metrics using material composition, condition quality, and local facility processing feasibility formulas.</p>
              </div>

              <div className="feature-card glass">
                <div className="feature-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <h3>Smart Recovery Pathways</h3>
                <p>Automated suggestions recommending whether fabrics are optimal for upcycling, fiber reuse, mechanical shredding, or chemical processing.</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 2. Authentication Views */}
      {currentView === 'login' && (
        <div className="auth-wrapper">
          <div className="auth-card glass">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to access your sustainability platform</p>
            {authError && <div className="alert-banner alert-error">{authError}</div>}
            {authSuccess && <div className="alert-banner alert-success">{authSuccess}</div>}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter email address" />
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Password</label>
                  <span onClick={() => toggleAuthView('forgot-password')} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}>
                    Forgot Password?
                  </span>
                </div>
                <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter password" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1.2rem' }}>Sign In</button>
            </form>

            <div style={{ margin: '1.2rem 0', textAlign: 'center', position: 'relative' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', margin: '10px 0' }}></div>
              <span style={{ background: '#0e1422', padding: '0 10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR</span>
            </div>

            <button type="button" onClick={handleGoogleOAuth2} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', fontWeight: 600 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <p className="auth-toggle" style={{ marginTop: '1.2rem' }}>Don't have an account? <span onClick={() => toggleAuthView('register')}>Register here</span></p>
          </div>
        </div>
      )}

      {currentView === 'register' && (
        <div className="auth-wrapper">
          <div className="auth-card glass">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Select your platform role to get started</p>
            {authError && <div className="alert-banner alert-error">{authError}</div>}
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="e.g. Sri Chandu" />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter email" />
              </div>
              <div className="form-group">
                <label>Organization Name <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Optional)</span></label>
                <input type="text" className="form-control" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} placeholder="e.g. GreenLoop Recycling Ltd" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Create password" />
              </div>
              <div className="form-group">
                <label>Platform Role</label>
                <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="Recycling Facility Operator">Recycling Facility Operator</option>
                  <option value="Sustainability Manager">Sustainability Manager</option>
                  <option value="Textile Manufacturer">Textile Manufacturer</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1.2rem' }}>Create Account</button>
            </form>

            <div style={{ margin: '1.2rem 0', textAlign: 'center' }}>
              <button type="button" onClick={handleGoogleOAuth2} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', fontWeight: 600 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </div>

            <p className="auth-toggle">Already registered? <span onClick={() => toggleAuthView('login')}>Sign in</span></p>
          </div>
        </div>
      )}

      {currentView === 'forgot-password' && (
        <div className="auth-wrapper">
          <div className="auth-card glass">
            <h2 className="auth-title">Reset Password</h2>
            <p className="auth-subtitle">
              {otpStep === 1 && "Enter your registered email to receive a 6-digit reset OTP code"}
              {otpStep === 2 && `Enter the 6-digit OTP code sent to ${email}`}
              {otpStep === 3 && "OTP verified! Create your new account password"}
            </p>
            {authError && <div className="alert-banner alert-error">{authError}</div>}
            {authSuccess && <div className="alert-banner alert-success">{authSuccess}</div>}

            {otpStep === 1 && (
              <form onSubmit={handleSendOTP}>
                <div className="form-group">
                  <label>Registered Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="Enter registered email (e.g. user@gmail.com)" 
                  />
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.4' }}>
                    📬 <em>Note: The 6-digit OTP code email may arrive in your <strong>Spam / Junk</strong> folder.</em>
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isOtpLoading}
                  style={{ 
                    marginTop: '1.2rem', 
                    opacity: isOtpLoading ? 0.7 : 1, 
                    cursor: isOtpLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem'
                  }}
                >
                  {isOtpLoading && <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />}
                  <span>{isOtpLoading ? "Sending OTP..." : "Send OTP Verification Code"}</span>
                </button>
              </form>
            )}

            {otpStep === 2 && (
              <form onSubmit={handleVerifyOTPOnly}>
                <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.2rem', fontSize: '0.82rem', color: '#facc15', lineHeight: '1.4' }}>
                  ⚠️ <strong>Can't find the email?</strong> Please check your <strong>Spam / Junk folder</strong>. OTP emails usually arrive within a few seconds.
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ margin: 0 }}>6-Digit OTP Code</label>
                    <button 
                      type="button" 
                      onClick={handleSendOTP} 
                      disabled={isOtpLoading}
                      style={{ background: 'none', border: 'none', color: isOtpLoading ? 'var(--text-muted)' : 'var(--color-primary)', fontSize: '0.75rem', cursor: isOtpLoading ? 'not-allowed' : 'pointer', padding: 0, fontWeight: 600 }}
                    >
                      {isOtpLoading ? "Sending..." : "Resend Code"}
                    </button>
                  </div>
                  <input 
                    type="text" 
                    maxLength={6}
                    className="form-control" 
                    value={otpCode} 
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                    required 
                    placeholder="Enter 6-digit code" 
                    style={{ letterSpacing: '4px', fontSize: '1.1rem', textAlign: 'center', fontWeight: 700 }}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isOtpLoading}
                  style={{ 
                    marginTop: '1.2rem', 
                    opacity: isOtpLoading ? 0.7 : 1, 
                    cursor: isOtpLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem'
                  }}
                >
                  {isOtpLoading && <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />}
                  <span>{isOtpLoading ? "Verifying OTP..." : "Verify OTP Code"}</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => { setOtpStep(1); setAuthError(''); }} 
                  disabled={isOtpLoading}
                  className="btn btn-secondary" 
                  style={{ marginTop: '0.6rem', width: '100%', fontSize: '0.85rem' }}
                >
                  Change Email Address
                </button>
              </form>
            )}

            {otpStep === 3 && (
              <form onSubmit={handleVerifyOTPReset}>
                <div style={{ background: 'rgba(84, 214, 155, 0.1)', border: '1px solid rgba(84, 214, 155, 0.3)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#54d69b' }}>
                  <span>✓</span>
                  <span>Identity verified for <strong>{email}</strong></span>
                </div>
                <div className="form-group">
                  <label>Create New Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={resetNewPassword} 
                    onChange={(e) => setResetNewPassword(e.target.value)} 
                    required 
                    minLength={4}
                    placeholder="Enter new password (min 4 chars)" 
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isOtpLoading}
                  style={{ 
                    marginTop: '1.2rem', 
                    opacity: isOtpLoading ? 0.7 : 1, 
                    cursor: isOtpLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem'
                  }}
                >
                  {isOtpLoading && <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />}
                  <span>{isOtpLoading ? "Updating Password..." : "Update Password & Log In"}</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => { setOtpStep(2); setAuthError(''); }} 
                  disabled={isOtpLoading}
                  className="btn btn-secondary" 
                  style={{ marginTop: '0.6rem', width: '100%', fontSize: '0.85rem' }}
                >
                  Back to OTP Verification
                </button>
              </form>
            )}

            <p className="auth-toggle" style={{ marginTop: '1.2rem' }}>
              Remember your password? <span onClick={() => toggleAuthView('login')}>Back to Sign In</span>
            </p>
          </div>
        </div>
      )}

      {/* Executive Analytics Dashboard View */}
      {currentView === 'dashboard' && user && (
        <div>
          <div className="dashboard-title-bar" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>Welcome, {user.username}</h2>
              <p className="dashboard-subtitle-text">Overview of your circular economy analytics and batch throughput.</p>
            </div>
            {user.role === 'Recycling Facility Operator' && (
              <button onClick={() => changeView('analysis')} className="btn btn-primary" style={{ width: 'auto' }}>
                Run Image Analysis
              </button>
            )}
            {user.role === 'Sustainability Manager' && (
              <button onClick={handleExportSustainabilityReport} className="btn btn-primary" style={{ width: 'auto' }}>
                Export ESG Audit PDF
              </button>
            )}
            {user.role === 'Textile Manufacturer' && (
              <button onClick={() => changeView('production_waste')} className="btn btn-primary" style={{ width: 'auto' }}>
                View Production Waste
              </button>
            )}
          </div>

          {/* Role-Based Dashboard 1: Sustainability Manager Dashboard */}
          {user.role === 'Sustainability Manager' && (
            <div>
              <div className="stats-banner">
                <div className="stat-card glass">
                  <div className="stat-label">Landfill Diversion Rate (%)</div>
                  <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
                    {esgMetrics && esgMetrics.total_batches > 0 ? `${esgMetrics.landfill_diversion_rate}%` : '0.0%'}
                  </div>
                </div>
                <div className="stat-card glass blue">
                  <div className="stat-label">Total CO₂ Offsets (kg)</div>
                  <div className="stat-value">
                    {esgMetrics && esgMetrics.total_batches > 0 ? `${esgMetrics.co2_saved_kg.toFixed(1)} kg` : '0.0 kg'}
                  </div>
                </div>
                <div className="stat-card glass purple">
                  <div className="stat-label">Water Conserved (Liters)</div>
                  <div className="stat-value">
                    {esgMetrics && esgMetrics.total_batches > 0 ? `${esgMetrics.water_saved_liters.toLocaleString()} L` : '0 L'}
                  </div>
                </div>
                <div className="stat-card glass teal">
                  <div className="stat-label">Industry Benchmark</div>
                  <div className="stat-value" style={{ fontSize: '1.2rem', color: 'var(--color-secondary)' }}>
                    68.5% Base
                  </div>
                </div>
              </div>

              {/* Multi-Chart Analytics Grid */}
              <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="batch-card glass">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>5-Factor Circularity Equilibrium</h3>
                    <span className="tag tag-new">Radar Index</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Multi-dimensional balance across purity, condition, direct reuse, LCA impact, and sorting viability.
                  </p>
                  <RadarChart scores={radarCircularityScores} />
                </div>

                <div className="batch-card glass">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>Material Composition Breakdown (kg)</h3>
                    <span className="tag tag-score high">Mass Share</span>
                  </div>
                  <PieChart data={chartFabricData} unit="kg" />
                </div>
              </div>

              {/* Second Multi-Chart Visual Row */}
              <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                <div className="batch-card glass">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>Avoided Carbon Footprint by Fiber Stream (kg CO₂)</h3>
                    <span className="tag tag-score medium">LCA ISO 14044</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                    Avoided virgin manufacturing emissions categorized by specific textile fiber class.
                  </p>
                  <BarChart data={co2ByFabricData} unit="kg CO₂" color="#00BCFF" horizontal={true} />
                </div>

                <div className="batch-card glass" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <h3 className="card-title" style={{ margin: 0 }}>Closed-Loop Landfill Diversion</h3>
                      <span className="tag tag-new">ESG Score</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                      Platform recovery efficiency versus global textile industry benchmark (68.5%).
                    </p>
                    <ProgressGauge 
                      value={parseFloat(esgMetrics?.landfill_diversion_rate || 100)} 
                      label="Diversion Rate" 
                      color="var(--color-primary)" 
                      size={180} 
                    />
                  </div>

                  <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.8rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Operating at <strong style={{ color: 'var(--color-primary)' }}>+31.5%</strong> efficiency above the standard industry recycling baseline.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Role-Based Dashboard 2: Textile Manufacturer Dashboard */}
          {user.role === 'Textile Manufacturer' && (
            <div>
              <div className="stats-banner">
                <div className="stat-card glass">
                  <div className="stat-label">Production Offcuts Diverted (kg)</div>
                  <div className="stat-value">
                    {manufacturerData && manufacturerData.production_offcuts_kg > 0 ? `${manufacturerData.production_offcuts_kg.toFixed(1)} kg` : '0.0 kg'}
                  </div>
                </div>
                <div className="stat-card glass blue">
                  <div className="stat-label">Material Cost Saved (₹ INR)</div>
                  <div className="stat-value">
                    ₹{manufacturerData && manufacturerData.raw_material_cost_saved > 0 ? Number(manufacturerData.raw_material_cost_saved).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Ground scrap value recovered (₹6–₹25/kg)
                  </div>
                </div>
                <div className="stat-card glass purple">
                  <div className="stat-label">Waste Reduction Rate (%)</div>
                  <div className="stat-value">
                    {manufacturerData && manufacturerData.waste_reduction_rate > 0 ? `${manufacturerData.waste_reduction_rate.toFixed(1)}%` : '0.0%'}
                  </div>
                </div>
                <div className="stat-card glass">
                  <div className="stat-label">Circularity Rating (%)</div>
                  <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
                    {manufacturerData && manufacturerData.circularity_rating > 0 ? `${manufacturerData.circularity_rating.toFixed(1)}%` : 'No data'}
                  </div>
                </div>
              </div>

              {/* Manufacturer Analytics Visualizer Grid */}
              <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="batch-card glass">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>Offcut Volume by Material (kg)</h3>
                    <span className="tag tag-new">Bar Analytics</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                    Factory cutting table scrap generation categorized by raw fiber type.
                  </p>
                  <BarChart data={chartFabricData} unit="kg" color="#00BCFF" />
                </div>

                <div className="batch-card glass">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>Monthly Cumulative Feedstock Savings (₹ INR)</h3>
                    <span className="tag tag-score high">Area Trend</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                    Historical trajectory of avoided procurement costs through scrap recovery.
                  </p>
                  <LineChart 
                    dataPoints={throughputTrendValues.map(v => Math.round(v * 13.04))} 
                    labels={throughputTrendLabels} 
                    unit="₹" 
                    title="Scrap Cost Spared" 
                    color="#54D69B" 
                  />
                </div>
              </div>

              <div className="batch-card glass" style={{ marginBottom: '2rem' }}>
                <h3 className="card-title">Recent Production Offcut Recoveries</h3>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Batch ID</th>
                        <th>Fabric Type</th>
                        <th>Qty (kg)</th>
                        <th>Category</th>
                        <th>Circularity Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manufacturerData && manufacturerData.recent_batches && manufacturerData.recent_batches.length > 0 ? (
                        manufacturerData.recent_batches.map((b) => (
                          <tr key={b.id}>
                            <td><strong># {b.id}</strong></td>
                            <td>{b.fabric_type}</td>
                            <td>{b.quantity} kg</td>
                            <td><span className="tag tag-new">{b.waste_category || 'Recyclable'}</span></td>
                            <td><span className="tag tag-score high">{b.circularity_score}%</span></td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No production batches recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Role-Based Dashboard 3: Administrator Executive Overview Dashboard */}
          {user.role === 'Administrator' && (
            <div>
              <div className="stats-banner">
                <div className="stat-card glass">
                  <div className="stat-label">Registered Accounts</div>
                  <div className="stat-value">{allUsers.length} Users</div>
                </div>
                <div className="stat-card glass blue">
                  <div className="stat-label">Global Batches Logged</div>
                  <div className="stat-value">{batches.length} Batches</div>
                </div>
                <div className="stat-card glass purple">
                  <div className="stat-label">Total Waste Processed (kg)</div>
                  <div className="stat-value">{totalWeight.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{(totalWeight / 1000).toFixed(2)} metric tons diverted</div>
                </div>
                <div className="stat-card glass teal">
                  <div className="stat-label">Platform Circularity Index (%)</div>
                  <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{avgCircularity}%</div>
                </div>
              </div>

              {/* System Telemetry Health Banner */}
              <div className="batch-card glass" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <h3 className="card-title">System Infrastructure & Microservices Telemetry</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ background: 'rgba(84, 214, 155, 0.06)', border: '1px solid rgba(84, 214, 155, 0.2)', padding: '1rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PyTorch Material Classifier</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>EfficientNet-B0 (V1)</div>
                    <div style={{ fontSize: '0.78rem', color: '#54D69B', marginTop: '0.25rem' }}>● Online • 10 Classes</div>
                  </div>
                  <div style={{ background: 'rgba(0, 188, 255, 0.06)', border: '1px solid rgba(0, 188, 255, 0.2)', padding: '1rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Database Engine</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>PostgreSQL 16</div>
                    <div style={{ fontSize: '0.78rem', color: '#00BCFF', marginTop: '0.25rem' }}>● Connected (Port 5432)</div>
                  </div>
                  <div style={{ background: 'rgba(147, 51, 234, 0.06)', border: '1px solid rgba(147, 51, 234, 0.2)', padding: '1rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Storage Volume</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>Uploads Storage</div>
                    <div style={{ fontSize: '0.78rem', color: '#c084fc', marginTop: '0.25rem' }}>● Volume Mounted</div>
                  </div>
                  <div style={{ background: 'rgba(94, 234, 212, 0.06)', border: '1px solid rgba(94, 234, 212, 0.2)', padding: '1rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>API Gateway</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>FastAPI + Uvicorn</div>
                    <div style={{ fontSize: '0.78rem', color: '#5eead4', marginTop: '0.25rem' }}>● Healthy (Port 8000)</div>
                  </div>
                </div>
              </div>

              {/* Multi-Chart Analytics Grid for Admin */}
              <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="batch-card glass">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>System Inventory Weight by Material (kg)</h3>
                    <span className="tag tag-new">Bar Chart</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                    Distribution of incoming scrap volume across the 10 textile fiber categories.
                  </p>
                  <BarChart data={chartFabricData} unit="kg" color="#54D69B" />
                </div>

                <div className="batch-card glass">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>Platform Intake & Recovery Velocity</h3>
                    <span className="tag tag-score high">Area Trend</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                    Cumulative kilograms of textile waste diverted over the logging timeline.
                  </p>
                  <LineChart dataPoints={throughputTrendValues} labels={throughputTrendLabels} unit="kg" title="Diverted Weight" color="#00BCFF" />
                </div>
              </div>

              {/* Interactive Pie Charts Grid */}
              <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                <div className="batch-card glass">
                  <h3 className="card-title">Material Composition Breakdown (kg)</h3>
                  <PieChart data={chartFabricData} unit="kg" />
                </div>
                <div className="batch-card glass">
                  <h3 className="card-title">Waste Category Share (Batches)</h3>
                  <PieChart data={chartCategoryData} unit="batches" />
                </div>
              </div>
            </div>
          )}

          {/* Role-Based Dashboard 4: Recycling Facility Operator Dashboard */}
          {user.role === 'Recycling Facility Operator' && (
            <div>
              <div className="stats-banner">
                <div className="stat-card glass">
                  <div className="stat-label">Total Batches Sorted</div>
                  <div className="stat-value">{batches.length} Batches</div>
                </div>
                <div className="stat-card glass blue">
                  <div className="stat-label">Total Weight Managed (kg)</div>
                  <div className="stat-value">{totalWeight.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{(totalWeight / 1000).toFixed(2)} metric tons diverted</div>
                </div>
                <div className="stat-card glass purple">
                  <div className="stat-label">Avg Circularity Rating (%)</div>
                  <div className="stat-value">{avgCircularity}%</div>
                </div>
                <div className="stat-card glass">
                  <div className="stat-label">CO₂ Offset Estimate (kg)</div>
                  <div className="stat-value">{Number(co2Saved).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg</div>
                </div>
              </div>

              {/* Multi-Chart Analytics Grid for Operator */}
              <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="batch-card glass">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>Conveyor Intake Mass by Fabric (kg)</h3>
                    <span className="tag tag-new">Bar Chart</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                    Physical sorting mass categorized across incoming textile consignments.
                  </p>
                  <BarChart data={chartFabricData} unit="kg" color="#54D69B" />
                </div>

                <div className="batch-card glass">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>Cumulative Sorting Throughput (kg)</h3>
                    <span className="tag tag-score high">Area Trend</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                    Real-time operational sorting throughput telemetry across operational shifts.
                  </p>
                  <LineChart dataPoints={throughputTrendValues} labels={throughputTrendLabels} unit="kg" title="Sorted Weight" color="#00BCFF" />
                </div>
              </div>

              {/* Interactive Pie Charts Grid */}
              <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                <div className="batch-card glass">
                  <h3 className="card-title">Material Composition Breakdown (kg)</h3>
                  <PieChart data={chartFabricData} unit="kg" />
                </div>

                <div className="batch-card glass">
                  <h3 className="card-title">Waste Category Share (Batches)</h3>
                  <PieChart data={chartCategoryData} unit="batches" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Image Analysis & Diagnostics */}
      {currentView === 'analysis' && user && (
        <div>
          <div className="dashboard-title-bar" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>Textile Visual Analysis & Classification</h2>
              <p className="dashboard-subtitle-text">Neural network fabric identification, color analysis, and physical integrity inspection.</p>
            </div>
          </div>

          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div className="batch-card glass" style={{ padding: '2rem' }}>
              <h3 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                {analyzedResult ? "Textile Material Diagnostic Report" : "Upload Fabric Image for Inspection"}
              </h3>
              
              {batchError && <div className="alert-banner alert-error">{batchError}</div>}
              {batchSuccess && <div className="alert-banner alert-success">{batchSuccess}</div>}

              {!analyzedResult ? (
                <form onSubmit={handleAnalyzeImage}>
                  <div className="form-group">
                    <label style={{ fontSize: '1rem', fontWeight: 600 }}>Select Textile Photo</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="form-control" 
                      style={{ paddingLeft: '1rem', height: '48px' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setImageFile(file || null);
                        if (file) {
                          setImagePreviewUrl(URL.createObjectURL(file));
                        } else {
                          setImagePreviewUrl(null);
                        }
                      }}
                      required
                    />
                  </div>

                  {imagePreviewUrl && (
                    <div style={{ marginTop: '1.2rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img 
                        src={imagePreviewUrl} 
                        alt="Selected File Preview" 
                        style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', border: '2px solid var(--color-primary)', boxShadow: '0 4px 16px rgba(84, 214, 155, 0.2)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{imageFile?.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Image selected • {(imageFile?.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" style={{ marginTop: '1.2rem', padding: '0.8rem 1.8rem', fontSize: '1rem' }} disabled={isAnalyzing}>
                    {isAnalyzing ? "Analyzing Fabric Sample..." : "Run Material Analysis"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAddToInventory}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.8rem', borderRadius: '16px', marginBottom: '1.8rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.2rem' }}>
                      <img 
                        src={getImageUrl(analyzedResult.image_path) || imagePreviewUrl} 
                        alt="Analyzed Fabric Preview" 
                        style={{ width: '110px', height: '110px', borderRadius: '14px', objectFit: 'cover', border: '2px solid var(--color-primary)', boxShadow: '0 8px 24px rgba(84, 214, 155, 0.2)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.8rem', background: 'rgba(84, 214, 155, 0.15)', color: 'var(--color-primary)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: 'bold', border: '1px solid rgba(84, 214, 155, 0.3)' }}>
                            CONFIDENCE: {analyzedResult.confidence_score}%
                          </span>
                          <span className="tag tag-new" style={{ fontSize: '0.8rem' }}>
                            {analyzedResult.waste_category || 'Recyclable'}
                          </span>
                          {analyzedResult.model_metadata?.model_architecture && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                              {analyzedResult.model_metadata.model_architecture} (Test Accuracy: {analyzedResult.model_metadata.test_accuracy}%)
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', lineHeight: 1.2 }}>{analyzedResult.fabric_type}</div>
                        <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                          Primary Color Tone: <strong>{analyzedResult.color}</strong> (<span style={{ color: analyzedResult.color_hex, fontWeight: 'bold' }}>{analyzedResult.color_hex}</span>)
                        </div>
                      </div>
                    </div>

                    {/* Top-3 Model Softmax Probability Distribution */}
                    {analyzedResult.top_predictions && analyzedResult.top_predictions.length > 0 && (
                      <div style={{ marginBottom: '1.2rem', background: 'rgba(0,0,0,0.3)', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem', fontWeight: 600 }}>
                          Classification Probability Distribution
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          {analyzedResult.top_predictions.slice(0, 3).map((p, idx) => (
                            <div key={idx} style={{ flex: 1, minWidth: '130px', background: 'rgba(255,255,255,0.04)', padding: '0.5rem 0.8rem', borderRadius: '8px', borderLeft: idx === 0 ? '3px solid var(--color-primary)' : '3px solid rgba(255,255,255,0.2)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ fontWeight: 600, color: idx === 0 ? 'var(--color-primary)' : '#fff' }}>{p.class_name}</span>
                                <span style={{ color: 'var(--text-muted)' }}>{p.probability_pct}%</span>
                              </div>
                              <div style={{ background: 'rgba(255,255,255,0.1)', height: '4px', borderRadius: '2px', marginTop: '0.3rem', overflow: 'hidden' }}>
                                <div style={{ background: idx === 0 ? 'var(--color-primary)' : 'var(--color-secondary)', width: `${p.probability_pct}%`, height: '100%' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.88rem' }}>
                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Blend Composition:</span>
                        <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '0.2rem' }}>{analyzedResult.blend_identification || 'Single-Origin Natural Fiber'}</div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Material Quality Grade:</span>
                        <div style={{ fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '0.2rem' }}>{analyzedResult.material_quality || 'Grade A (High Quality)'}</div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Thread Density:</span>
                        <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '0.2rem' }}>{analyzedResult.thread_density || 'Medium Density (~ 180 TPI)'}</div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Weave Structure:</span>
                        <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '0.2rem' }}>{analyzedResult.weave_pattern}</div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Dye Fastness:</span>
                        <div style={{ fontWeight: 'bold', color: 'var(--color-secondary)', marginTop: '0.2rem' }}>{analyzedResult.dye_fastness || 'Vibrant / Unfaded'}</div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Structural Integrity:</span>
                        <div style={{ fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '0.2rem' }}>{analyzedResult.structural_integrity}% Intact</div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Contamination Risk:</span>
                        <div style={{ fontWeight: 'bold', color: analyzedResult.contamination_detected ? 'var(--danger)' : 'var(--color-secondary)', marginTop: '0.2rem' }}>
                          {analyzedResult.stain_risk}% ({analyzedResult.contamination_detected ? 'Surface Dispersion Detected' : 'Clean Fabric'})
                        </div>
                      </div>
                    </div>

                    {/* Sustainability Impact Assessment Panel */}
                    <div style={{ marginTop: '1.5rem', background: 'rgba(0, 188, 255, 0.08)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(0, 188, 255, 0.25)' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#00BCFF', marginBottom: '0.8rem', letterSpacing: '0.5px' }}>
                        SUSTAINABILITY & ENVIRONMENTAL IMPACT ASSESSMENT
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.88rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Circularity Rating Score:</span>
                          <div style={{ fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '0.25rem', fontSize: '1.1rem' }}>
                            {analyzedResult.circularity_score || 85.8}%
                          </div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Unit CO2 Offset Factor:</span>
                          <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '0.25rem' }}>3.6 kg CO2 saved / kg diverted</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Unit Water Conservation:</span>
                          <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '0.25rem' }}>250 Liters saved / kg diverted</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Optimal Recovery Strategy:</span>
                          <div style={{ fontWeight: 'bold', color: 'var(--color-secondary)', marginTop: '0.25rem' }}>
                            {analyzedResult.recycling_recommendation || 'Mechanical Recycling / Upcycling'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Facility Operator Directives Banner */}
                    <div style={{ marginTop: '1.5rem', background: 'rgba(84, 214, 155, 0.06)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(84, 214, 155, 0.25)' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '0.8rem', letterSpacing: '0.5px' }}>
                        FACILITY SORTING & HANDLING DIRECTIVES
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.88rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Target Sorting Bin:</span>
                          <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '0.25rem' }}>{analyzedResult.sorting_bin || 'Bin A-1: Upcycling Atelier'}</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Required Pre-Processing:</span>
                          <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '0.25rem' }}>{analyzedResult.preprocessing || 'Standard Sorting & Inspection'}</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Safety & PPE Protocol:</span>
                          <div style={{ fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '0.25rem' }}>{analyzedResult.safety_warning || 'Safe (Standard PPE)'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {analyzedResult.contamination_detected && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      borderRadius: '10px',
                      padding: '0.85rem 1.2rem',
                      marginBottom: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: '#fca5a5',
                      fontSize: '0.88rem'
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                      <div>
                        <strong>Contamination / Elevated Stain Risk Detected ({analyzedResult.stain_risk}%).</strong>
                        <div style={{ fontSize: '0.8rem', color: '#fecaca', marginTop: '0.15rem' }}>
                          Computer Vision observed surface anomalies. Please visually verify fabric condition before confirming batch registration.
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.2rem', marginBottom: '1.2rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.01em' }}>
                      Batch Intake Details
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Waste Source</label>
                      <select className="form-control" value={source} onChange={(e) => setSource(e.target.value)}>
                        <option value="Production Offcuts">Production Offcuts</option>
                        <option value="Post-Consumer Garments">Post-Consumer Garments</option>
                        <option value="Deadstock Fabric">Deadstock Fabric</option>
                        <option value="Industrial Waste">Industrial Waste</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Quantity (kg)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        className="form-control" 
                        style={{ paddingLeft: '1rem' }}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="e.g. 45.5"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Material Condition</label>
                      <select className="form-control" value={condition} onChange={(e) => setCondition(e.target.value)}>
                        <option value="New">New (Unused scrap)</option>
                        <option value="Good">Good (Lightly used / clean)</option>
                        <option value="Fair">Fair (Moderately worn)</option>
                        <option value="Poor">Poor (Heavily worn/soiled)</option>
                        <option value="Damaged">Damaged (Contaminated/torn)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Collection Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        style={{ paddingLeft: '1rem' }}
                        value={collectionDate}
                        onChange={(e) => setCollectionDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.6rem' }}>
                      Commit Batch to Inventory
                    </button>
                    <button type="button" onClick={() => handleDownloadPDF(analyzedResult)} className="btn btn-secondary" style={{ width: 'auto', padding: '0.75rem 1.4rem' }}>
                      Export PDF Report
                    </button>
                    <button type="button" onClick={handleResetAnalysis} className="btn btn-secondary" style={{ width: 'auto', padding: '0.75rem 1.4rem' }}>
                      Reset / New Image
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Waste Inventory Management */}
      {currentView === 'inventory' && user && (
        <div>
          <div className="dashboard-title-bar" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>Waste Inventory Management</h2>
              <p className="dashboard-subtitle-text">View and manage all registered textile waste batches.</p>
            </div>
            {user.role === 'Recycling Facility Operator' && (
              <button onClick={() => changeView('analysis')} className="btn btn-primary" style={{ width: 'auto' }}>
                Register New Batch
              </button>
            )}
            {user.role === 'Textile Manufacturer' && (
              <button onClick={() => changeView('production_waste')} className="btn btn-primary" style={{ width: 'auto' }}>
                Log Production Offcuts
              </button>
            )}
            {(user.role === 'Sustainability Manager' || user.role === 'Administrator') && (
              <button onClick={() => handleExportCSV('waste_classification')} className="btn btn-secondary" style={{ width: 'auto' }}>
                Export Inventory CSV
              </button>
            )}
          </div>

          <div className="batch-card glass">
            <h3 className="card-title">Registered Waste Batches <span>({batches.length})</span></h3>
            {batches.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                No textile waste batches registered yet.
              </p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Batch ID</th>
                      <th>Fabric & Image</th>
                      <th>Waste Category</th>
                      <th>Recommended Strategy</th>
                      <th>Collection Date</th>
                      <th>Qty (kg)</th>
                      <th>Circularity</th>
                      {user.role === 'Administrator' && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((b) => (
                      <tr key={b.id}>
                        <td><strong># {b.id}</strong></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <FabricThumbnail path={b.image_path} fabricType={b.fabric_type} size={45} borderRadius={6} />
                            <div>
                              <div style={{ fontWeight: 600 }}>{b.fabric_type} <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 500 }}>({b.condition})</span></div>
                              <small style={{ color: 'var(--text-muted)' }}>{b.color} • {b.source}</small>
                              {b.confidence_score != null && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                                  AI: {b.confidence_score}% Conf • {b.damage_score ?? 0}% Dmg {b.contamination_detected ? '• ⚠️ Contam' : '• Clean'}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td><span className="tag tag-new">{b.waste_category || 'Recyclable'}</span></td>
                        <td>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{b.recycling_recommendation}</div>
                          <small style={{ color: 'var(--color-primary)', fontSize: '0.75rem' }}>{b.recovery_category}</small>
                        </td>
                        <td><small style={{ color: '#fff' }}>{b.collection_date ? b.collection_date.split('T')[0] : 'Today'}</small></td>
                        <td>{b.quantity} kg</td>
                        <td><span className={`tag tag-score ${b.circularity_score >= 70 ? 'high' : ''}`}>{b.circularity_score}%</span></td>
                        {user.role === 'Administrator' && (
                          <td>
                            <button onClick={() => handleDeleteBatch(b.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}>
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Material Library & Live Inventory Connection */}
      {currentView === 'classification' && user && (
        <div>
          {!selectedMaterial ? (
            /* 1. Material Library Overview Grid */
            <div>
              <div className="dashboard-title-bar" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem' }}>Material Library</h2>
                  <p className="dashboard-subtitle-text">
                    Supported textile materials, recovery pathways, and live inventory records.
                  </p>
                </div>
              </div>

              <div className="material-library-grid">
                {SUPPORTED_MATERIALS.map((mat) => {
                  const matBatches = getBatchesForMaterial(mat.name);
                  const batchCount = matBatches.length;
                  const totalMatWeight = matBatches.reduce((sum, b) => sum + (parseFloat(b.quantity) || 0), 0);
                  const isNatural = mat.category === 'Natural Fiber';

                  return (
                    <div 
                      key={mat.id} 
                      className="material-card glass"
                      onClick={() => setSelectedMaterial(mat)}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                            {mat.name}
                          </h3>
                          <span className={`tag ${isNatural ? 'tag-new' : 'tag-score'}`} style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>
                            {mat.category}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                          {mat.origin}
                        </div>
                        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                          {mat.description}
                        </p>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', background: 'rgba(84, 214, 155, 0.06)', border: '1px solid rgba(84, 214, 155, 0.15)', borderRadius: '6px', padding: '0.5rem 0.8rem', marginBottom: '1rem' }}>
                          <strong>Recovery Route:</strong> {mat.recoveryPathway.split(',')[0]}
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: batchCount > 0 ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                          {batchCount} {batchCount === 1 ? 'batch' : 'batches'} · {totalMatWeight.toFixed(1)} kg
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
                          View Details →
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recovery Pathways Reference */}
              <div className="batch-card glass" style={{ marginTop: '2rem' }}>
                <h3 className="card-title">Recovery Pathways</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', borderLeft: '4px solid var(--color-primary)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.9rem' }}>RECYCLABLE</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Mechanical or chemical fiber re-granulation and yarn spinning.
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', borderLeft: '4px solid var(--color-secondary)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-secondary)', fontSize: '0.9rem' }}>UPCYCLABLE</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Direct garment redesign, atelier repurposing, and patchwork.
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', borderLeft: '4px solid #F59E0B' }}>
                    <div style={{ fontWeight: 700, color: '#F59E0B', fontSize: '0.9rem' }}>REPAIRABLE</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Refurbishment, mending, and secondary non-critical utility.
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', borderLeft: '4px solid #EF4444' }}>
                    <div style={{ fontWeight: 700, color: '#EF4444', fontSize: '0.9rem' }}>HAZARDOUS</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Contaminated scrap requiring specialized chemical decontamination.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 2. Dedicated Material Details View & Related Live Inventory */
            (() => {
              const matBatches = getBatchesForMaterial(selectedMaterial.name);
              const totalBatches = matBatches.length;
              const totalMatWeight = matBatches.reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0);
              const avgCircularity = totalBatches > 0
                ? (matBatches.reduce((acc, b) => acc + (parseFloat(b.circularity_score) || 0), 0) / totalBatches).toFixed(1)
                : '0.0';

              return (
                <div>
                  {/* Top Navigation */}
                  <button 
                    onClick={() => setSelectedMaterial(null)} 
                    className="btn btn-secondary" 
                    style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
                  >
                    ← Back to Materials
                  </button>

                  {/* Header Banner */}
                  <div className="batch-card glass" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                            {selectedMaterial.name}
                          </h2>
                          <span className="tag tag-new" style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
                            {selectedMaterial.category}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                          {selectedMaterial.origin}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '850px', lineHeight: 1.6, margin: 0 }}>
                          {selectedMaterial.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Clean Summary Metric Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '12px', padding: '1.2rem 1.4rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Recorded Batches
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ffffff', marginTop: '0.3rem' }}>
                        {totalBatches}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '12px', padding: '1.2rem 1.4rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Total Weight
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 700, color: totalMatWeight > 0 ? 'var(--color-primary)' : '#ffffff', marginTop: '0.3rem' }}>
                        {totalMatWeight > 0 ? `${totalMatWeight.toFixed(1)} kg` : '0 kg'}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '12px', padding: '1.2rem 1.4rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Average Circularity
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 700, color: totalBatches > 0 ? 'var(--color-secondary)' : '#ffffff', marginTop: '0.3rem' }}>
                        {totalBatches > 0 ? `${avgCircularity}%` : '—'}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '12px', padding: '1.2rem 1.4rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Primary Strategy
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', marginTop: '0.5rem', lineHeight: 1.3 }}>
                        {selectedMaterial.category === 'Natural Fiber' ? 'Mechanical / Upcycling' : selectedMaterial.category === 'Synthetic Polymer' ? 'Chemical Depolymerization' : 'Dissolution Separation'}
                      </div>
                    </div>
                  </div>

                  {/* Two-Column Detail Grid */}
                  <div className="dashboard-grid">
                    {/* Left: Material Profile & Processing Guide */}
                    <div className="batch-card glass">
                      <h3 className="card-title">Fiber Properties & Processing</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                            Fiber Family & Category
                          </div>
                          <div style={{ fontWeight: 600, color: '#ffffff' }}>{selectedMaterial.category}</div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                            Fiber Origin & Source
                          </div>
                          <div style={{ fontWeight: 600, color: '#ffffff' }}>{selectedMaterial.origin}</div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                            Industrial Recovery Pathway
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                            {selectedMaterial.recoveryPathway}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                            Reuse & Upcycling Suitability
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                            {selectedMaterial.upcyclingSuitability}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                            Processing & Handling Considerations
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                            {selectedMaterial.processingConsiderations}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Related Live Inventory Batches */}
                    <div className="batch-card glass">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                        <div>
                          <h3 className="card-title" style={{ margin: 0 }}>Related Inventory Batches</h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                            Live intake batches currently recorded for {selectedMaterial.name} ({totalBatches}).
                          </p>
                        </div>
                      </div>

                      {totalBatches === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <div style={{ fontSize: '2.2rem', marginBottom: '0.8rem' }}>📦</div>
                          <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '1rem', marginBottom: '0.35rem' }}>
                            No inventory batches currently recorded for this material.
                          </div>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.4rem auto', lineHeight: 1.5 }}>
                            Intake batches confirmed with fabric type "{selectedMaterial.name}" will automatically appear here with their verified circularity and diagnostic metrics.
                          </p>
                          {user.role === 'Recycling Facility Operator' && (
                            <button 
                              onClick={() => changeView('analysis')} 
                              className="btn btn-primary" 
                              style={{ width: 'auto', padding: '0.6rem 1.4rem', fontSize: '0.85rem' }}
                            >
                              Upload & Register Batch
                            </button>
                          )}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '550px', overflowY: 'auto', paddingRight: '0.3rem' }}>
                          {matBatches.map((b) => (
                            <div 
                              key={b.id}
                              style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.07)',
                                borderRadius: '10px',
                                padding: '1rem 1.2rem',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <FabricThumbnail path={b.image_path} fabricType={b.fabric_type} size={40} borderRadius={6} />
                                  <div>
                                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
                                      Batch #{b.id}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                      {b.source} • {b.color}
                                    </div>
                                  </div>
                                </div>
                                <span className={`tag tag-score ${b.circularity_score >= 70 ? 'high' : ''}`} style={{ fontSize: '0.78rem' }}>
                                  {b.circularity_score}% Circularity
                                </span>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.7rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.82rem' }}>
                                <div>
                                  <span style={{ color: 'var(--text-muted)' }}>Condition: </span>
                                  <strong style={{ color: '#ffffff' }}>{b.condition}</strong>
                                  <span style={{ margin: '0 0.5rem', color: 'rgba(255,255,255,0.2)' }}>•</span>
                                  <span style={{ color: 'var(--text-muted)' }}>Weight: </span>
                                  <strong style={{ color: 'var(--color-primary)' }}>{b.quantity} kg</strong>
                                </div>
                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                  <span className="tag tag-new" style={{ fontSize: '0.72rem' }}>{b.waste_category || 'Recyclable'}</span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.recycling_recommendation}</span>
                                </div>
                              </div>

                              {b.confidence_score != null && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                                  AI Evidence: {b.confidence_score}% Conf • {b.damage_score ?? 0}% Dmg {b.contamination_detected ? '• ⚠️ Contam' : '• Clean'}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* Role-Specific Recommendations Center */}
      {currentView === 'recommendations' && user && (
        <div>
          {/* Header Bar */}
          <div className="dashboard-title-bar" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>
                {user.role === 'Recycling Facility Operator' && 'Operational Sorting & Recycling Directives'}
                {user.role === 'Sustainability Manager' && 'Strategic ESG & Circularity Optimization Roadmap'}
                {user.role === 'Textile Manufacturer' && 'Production Scrap Recovery & Closed-Loop Recommendations'}
                {user.role === 'Administrator' && 'Global Circularity & Recycling Strategy Recommendations'}
              </h2>
              <p className="dashboard-subtitle-text">
                {user.role === 'Recycling Facility Operator' && 'Material pre-processing protocols, sorting bin destination rules, and mechanical recovery directives.'}
                {user.role === 'Sustainability Manager' && '5-factor circularity modeling, Scope 3 decarbonization pathways, and Life-Cycle Assessment (LCA) forecaster.'}
                {user.role === 'Textile Manufacturer' && 'Cutting room remnant reduction, re-spinning suitability index, and raw material cost savings.'}
                {user.role === 'Administrator' && 'Cross-role operational circularity scoring, environmental impact forecasting, and facility throughput optimization.'}
              </p>
            </div>
            <span className="tag tag-new" style={{ padding: '0.4rem 1rem', fontSize: '0.82rem' }}>
              {user.role} View
            </span>
          </div>

          {/* 1. OPERATOR RECOMMENDATIONS VIEW */}
          {user.role === 'Recycling Facility Operator' && (
            <div>
              {/* Sorting Bin Assignment Protocols */}
              <div className="batch-card glass" style={{ marginBottom: '2rem', padding: '1.8rem' }}>
                <h3 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>
                  Live Facility Sorting & Pre-Processing Directives
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Standardized material processing procedures based on incoming batch diagnostics and fiber composition.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
                  <div style={{ background: 'rgba(84, 214, 155, 0.08)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(84, 214, 155, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <strong style={{ color: 'var(--color-primary)' }}>Bin A-1: Atelier Upcycling</strong>
                      <span className="tag tag-new">High Grade</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 0.8rem 0' }}>
                      Clean single-origin deadstock and undamaged cut pieces (Cotton, Denim, Silk, Linen).
                    </p>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <strong>Protocol:</strong> Surface decontamination, trim & button removal, flat fold for direct design ateliers.
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0, 188, 255, 0.08)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(0, 188, 255, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <strong style={{ color: '#00BCFF' }}>Bin B-2: Polymer Chemical Line</strong>
                      <span className="tag tag-score high">Chemical Line</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 0.8rem 0' }}>
                      Synthetic polymers including Polyester, Nylon, and Acrylic filaments.
                    </p>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <strong>Protocol:</strong> Density separation, shredding to 10mm flakes, solvent glycolytic depolymerization into rPET pellets.
                    </div>
                  </div>

                  <div style={{ background: 'rgba(192, 132, 252, 0.08)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(192, 132, 252, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <strong style={{ color: '#c084fc' }}>Bin C-3: Mechanical Carding</strong>
                      <span className="tag tag-score medium">Mechanical</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 0.8rem 0' }}>
                      Natural fiber scraps with moderate wear suitable for garnetting and fiber recovery.
                    </p>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <strong>Protocol:</strong> Rotary tearing, garnetting drum processing, blending with 20% virgin carrier fiber for re-spinning.
                    </div>
                  </div>

                  <div style={{ background: 'rgba(250, 204, 21, 0.08)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(250, 204, 21, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <strong style={{ color: '#facc15' }}>Bin D-4: Secondary Utility</strong>
                      <span className="tag tag-fair">Downcycling</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 0.8rem 0' }}>
                      Distressed multi-component blends, soiled remnants, and low tensile fibers.
                    </p>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <strong>Protocol:</strong> High-speed shredding into non-woven batting for automotive soundproofing & geotextile pads.
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Operator Batch Processing Calculator */}
              <div className="batch-card glass" style={{ marginBottom: '2rem', padding: '1.8rem' }}>
                <h3 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>
                  Operator Intake & Processing Throughput Estimator
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                  Calculate operational labor, shredder run-time, and sorting throughput for an incoming consignment.
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <label style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Consignment Intake Weight (kg):</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={calcWeight} 
                      onChange={(e) => setCalcWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                      style={{ paddingLeft: '1rem', fontSize: '1.1rem', fontWeight: 'bold' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: 'rgba(84, 214, 155, 0.1)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(84, 214, 155, 0.3)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sorting Labor Required</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '0.2rem' }}>
                      {(calcWeight / 65).toFixed(1)} Man-Hours
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Standard conveyor sorting speed @ 65 kg/hr</div>
                  </div>

                  <div style={{ background: 'rgba(0, 188, 255, 0.1)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(0, 188, 255, 0.3)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Garnetting Shredder Run-Time</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00BCFF', marginTop: '0.2rem' }}>
                      {(calcWeight / 150).toFixed(1)} Machine-Hrs
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Dual-drum mechanical shredder @ 150 kg/hr</div>
                  </div>

                  <div style={{ background: 'rgba(147, 51, 234, 0.1)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(147, 51, 234, 0.3)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Baled Volume Footprint</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9333EA', marginTop: '0.2rem' }}>
                      {(calcWeight * 0.0035).toFixed(2)} m³
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Hydraulic compressed storage density</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. SUSTAINABILITY MANAGER RECOMMENDATIONS VIEW */}
          {(user.role === 'Sustainability Manager' || user.role === 'Administrator') && (
            <div>
              {/* Interactive 5-Factor Circularity Simulator */}
              <div className="batch-card glass" style={{ marginBottom: '2rem', padding: '1.8rem', border: '1px solid rgba(84, 214, 155, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 className="card-title" style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>
                      Interactive 5-Factor Circularity Sensitivity Simulator
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                      Simulate multi-variable ESG scoring across fiber purity, condition wear, reuse potential, environmental benefit, and sorting feasibility.
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: categoryColor }}>{computedCircularity}%</div>
                    <span className="tag" style={{ background: categoryColor, color: '#0f172a', fontWeight: 'bold', fontSize: '0.78rem' }}>
                      {computedCategory}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', margin: '1.5rem 0' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      <span style={{ color: 'var(--color-primary)' }}>1. Material Recyclability (35%)</span>
                      <strong>{simRecyclability}%</strong>
                    </div>
                    <input type="range" min="0" max="100" value={simRecyclability} onChange={(e) => setSimRecyclability(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-primary)' }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      <span style={{ color: '#00BCFF' }}>2. Material Condition (20%)</span>
                      <strong>{simCondition}%</strong>
                    </div>
                    <input type="range" min="0" max="100" value={simCondition} onChange={(e) => setSimCondition(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#00BCFF' }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      <span style={{ color: '#9333EA' }}>3. Reuse Potential (20%)</span>
                      <strong>{simReuse}%</strong>
                    </div>
                    <input type="range" min="0" max="100" value={simReuse} onChange={(e) => setSimReuse(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#9333EA' }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      <span style={{ color: '#F59E0B' }}>4. Environmental Benefit (15%)</span>
                      <strong>{simEnvBenefit}%</strong>
                    </div>
                    <input type="range" min="0" max="100" value={simEnvBenefit} onChange={(e) => setSimEnvBenefit(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#F59E0B' }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      <span style={{ color: '#EF4444' }}>5. Processing Feasibility (10%)</span>
                      <strong>{simFeasibility}%</strong>
                    </div>
                    <input type="range" min="0" max="100" value={simFeasibility} onChange={(e) => setSimFeasibility(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#EF4444' }} />
                  </div>
                </div>
              </div>

              {/* LCA Environmental Impact Forecaster */}
              <div className="batch-card glass" style={{ marginBottom: '2rem', padding: '1.8rem', border: '1px solid rgba(0, 188, 255, 0.4)' }}>
                <h3 className="card-title" style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.3rem' }}>
                  Life-Cycle Assessment (LCA) Decarbonization Forecaster
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                  Calculate avoided virgin production footprints, agricultural water conservation, and methane emission offsets.
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <label style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Simulated Diversion Volume (kg):</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={calcWeight} 
                      onChange={(e) => setCalcWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                      style={{ paddingLeft: '1rem', fontSize: '1.1rem', fontWeight: 'bold' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: 'rgba(84, 214, 155, 0.1)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(84, 214, 155, 0.3)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avoided CO₂ Equivalent</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '0.2rem' }}>{(calcWeight * 3.6).toFixed(1)} kg CO₂</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>≈ {((calcWeight * 3.6) / 20).toFixed(1)} mature trees planted equivalent</div>
                  </div>

                  <div style={{ background: 'rgba(0, 188, 255, 0.1)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(0, 188, 255, 0.3)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Agricultural Water Spared</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#00BCFF', marginTop: '0.2rem' }}>{(calcWeight * 250).toFixed(0)} Liters</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>≈ {((calcWeight * 250) / 150).toFixed(1)} days per-capita potable water</div>
                  </div>

                  <div style={{ background: 'rgba(147, 51, 234, 0.1)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(147, 51, 234, 0.3)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Compacted Landfill Spared</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#9333EA', marginTop: '0.2rem' }}>{(calcWeight * 0.0035).toFixed(2)} m³</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Avoided municipal solid waste footprint</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. TEXTILE MANUFACTURER RECOMMENDATIONS VIEW */}
          {user.role === 'Textile Manufacturer' && (
            <div>
              {/* Production Scrap Minimization Advice */}
              <div className="batch-card glass" style={{ marginBottom: '2rem', padding: '1.8rem' }}>
                <h3 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>
                  Industrial Production Offcut Recovery & Closed-Loop Directives
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Engineering recommendations to minimize cut-and-sew table scrap and maximize fiber re-spinning yield.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
                  <div style={{ background: 'rgba(84, 214, 155, 0.08)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(84, 214, 155, 0.3)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                      1. Cutting Room Nesting Optimization
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Apply algorithmic marker nesting software on cutting tables to increase fabric utilization by <strong>4.5%–7.2%</strong>, directly reducing offcut generation at the source.
                    </p>
                  </div>

                  <div style={{ background: 'rgba(0, 188, 255, 0.08)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(0, 188, 255, 0.3)' }}>
                    <div style={{ fontWeight: 700, color: '#00BCFF', marginBottom: '0.5rem' }}>
                      2. Clean Offcut Segregation at Source
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Segregate pure 100% cotton and pure polyester cutting table remnants before blending with mixed sweeps. Clean single-origin scrap commands <strong>2.8× higher recovery valuation</strong>.
                    </p>
                  </div>

                  <div style={{ background: 'rgba(192, 132, 252, 0.08)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(192, 132, 252, 0.3)' }}>
                    <div style={{ fontWeight: 700, color: '#c084fc', marginBottom: '0.5rem' }}>
                      3. Closed-Loop Re-Spinning Integration
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Feed shredded pre-consumer cotton remnants at a <strong>30% blend ratio</strong> with virgin organic cotton into open-end rotor spinning mills for new coarse yarn batches.
                    </p>
                  </div>
                </div>
              </div>

              {/* Manufacturer Cost Recovery Calculator */}
              <div className="batch-card glass" style={{ marginBottom: '2rem', padding: '1.8rem' }}>
                <h3 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>
                  Manufacturing Scrap Cost Recovery Forecaster (₹ INR)
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                  Calculate material cost spared and scrap value recovered from factory cutting table remnants.
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <label style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Monthly Production Scrap Volume (kg):</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={calcWeight} 
                      onChange={(e) => setCalcWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                      style={{ paddingLeft: '1rem', fontSize: '1.1rem', fontWeight: 'bold' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: 'rgba(84, 214, 155, 0.1)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(84, 214, 155, 0.3)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Raw Scrap Value Recovered</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '0.2rem' }}>
                      ₹{(calcWeight * 13.04).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Aggregator scrap market rate @ ₹13.04/kg</div>
                  </div>

                  <div style={{ background: 'rgba(0, 188, 255, 0.1)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(0, 188, 255, 0.3)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Virgin Yarn Procurement Spared</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00BCFF', marginTop: '0.2rem' }}>
                      ₹{(calcWeight * 0.30 * 185.0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>30% closed-loop rotor re-spinning @ ₹185/kg yarn</div>
                  </div>

                  <div style={{ background: 'rgba(147, 51, 234, 0.1)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(147, 51, 234, 0.3)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Net Factory Disposal Fee Avoided</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9333EA', marginTop: '0.2rem' }}>
                      ₹{(calcWeight * 3.50).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Municipal industrial dumping tipping fee avoided</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reports Page */}
      {currentView === 'reports' && user && (() => {
        const getReportTypesForRole = (role) => {
          switch (role) {
            case 'Recycling Facility Operator':
            case 'OPERATOR':
              return [
                { id: 'waste_classification', title: 'Waste Classification & Diagnostics', desc: 'Material composition distribution, confidence ratings, and physical weave diagnostics.' },
                { id: 'recycling', title: 'Recycling & Recovery Pathways', desc: 'Mechanical sorting bin allocations, chemical recovery routing, and fiber grades.' },
                { id: 'environmental_impact', title: 'Landfill Diversion Summary', desc: 'Kilograms diverted from municipal disposal, moisture condition, and contamination logs.' }
              ];
            case 'Sustainability Manager':
            case 'MANAGER':
              return [
                { id: 'sustainability', title: 'Sustainability & ESG Audit', desc: 'Certified ESG carbon offsets, water savings metrics, and global baseline benchmarks.' },
                { id: 'circular_economy', title: 'Circular Economy Index', desc: '5-factor circularity scores, closed-loop supply metrics, and recovery efficiency.' },
                { id: 'environmental_impact', title: 'Life-Cycle Footprint (LCA)', desc: 'Landfill space avoided, virgin polymer substitution, and chemical footprint reduction.' }
              ];
            case 'Textile Manufacturer':
            case 'MANUFACTURER':
              return [
                { id: 'environmental_impact', title: 'Production Offcut Recovery', desc: 'Cutting room remnants, deadstock volume, and scrap sorting routes.' },
                { id: 'sustainability', title: 'Raw Material Cost Recovery', desc: 'Calculated raw material expenditure spared (₹ INR) and virgin feedstock displacement.' },
                { id: 'circular_economy', title: 'Closed-Loop Fiber Suitability', desc: 'Pre-consumer textile circularity rating and industrial re-spinning potential.' }
              ];
            case 'Administrator':
            case 'ADMIN':
            default:
              return [
                { id: 'sustainability', title: 'Global Sustainability & ESG', desc: 'Carbon offset metrics, water conservation, and global industry diversion benchmarks.' },
                { id: 'waste_classification', title: 'Platform Waste Classification', desc: 'Material composition distribution, confidence ratings, and physical diagnostics.' },
                { id: 'recycling', title: 'Recycling & Recovery Logistics', desc: 'Mechanical and chemical pathways, sorting bin allocations, and reuse potential.' },
                { id: 'environmental_impact', title: 'Macro Environmental Impact', desc: 'Landfill space avoided, feedstock market valuations, and resource protection.' },
                { id: 'circular_economy', title: 'Platform Circularity Index', desc: '5-factor circularity scores, material recovery grades, and supply loop index.' }
              ];
          }
        };

        const reportTypes = getReportTypesForRole(user.role);

        const getHeaderDetails = (role) => {
          switch (role) {
            case 'Recycling Facility Operator':
              return {
                title: 'Operational Sorting & Batch Reports',
                subtitle: 'Material classification breakdowns, recycling bin allocations, and physical intake throughput.'
              };
            case 'Sustainability Manager':
              return {
                title: 'Sustainability & ESG Audit Reports',
                subtitle: 'Certified ESG disclosure reports, carbon offset accounting, water conservation, and life-cycle impact assessments.'
              };
            case 'Textile Manufacturer':
              return {
                title: 'Production Waste & Cost Recovery Reports',
                subtitle: 'Manufacturing offcuts, cutting table scrap diversion, raw material cost recovery, and re-spinning suitability.'
              };
            case 'Administrator':
            default:
              return {
                title: 'Platform-Wide Global Intelligence Reports',
                subtitle: 'System-wide inventory audit, cross-role compliance logs, operational throughput telemetry, and certified ledger exports.'
              };
          }
        };

        const headerInfo = getHeaderDetails(user.role);

        return (
          <div>
            <div className="dashboard-title-bar" style={{ marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem' }}>{headerInfo.title}</h2>
                <p className="dashboard-subtitle-text">{headerInfo.subtitle}</p>
              </div>
              {/* Unified Export Format Dropdown Menu */}
              <div style={{ position: 'relative', display: 'inline-block' }} ref={exportMenuRef}>
                <button 
                  type="button"
                  onClick={() => setExportMenuOpen(!exportMenuOpen)} 
                  className="btn btn-primary" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', width: 'auto', padding: '0.65rem 1.3rem' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Export Report</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: exportMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {exportMenuOpen && (
                  <div 
                    className="glass" 
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      zIndex: 9999,
                      minWidth: '250px',
                      padding: '0.5rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(84, 214, 155, 0.3)',
                      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
                      background: '#0d1527'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0.4rem 0.6rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                      Select Export Format
                    </div>

                    <div 
                      onClick={() => { handleExportExcel(selectedReportType); setExportMenuOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.65rem 0.8rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        color: '#ffffff'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(84, 214, 155, 0.12)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(84, 214, 155, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#54D69B', fontWeight: 'bold', fontSize: '0.85rem' }}>
                        📊
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Excel Workbook (.xlsx)</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Multi-sheet dossier</div>
                      </div>
                    </div>

                    <div 
                      onClick={() => { handleExportCSV(selectedReportType); setExportMenuOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.65rem 0.8rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        color: '#ffffff'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 188, 255, 0.12)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(0, 188, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00BCFF', fontWeight: 'bold', fontSize: '0.85rem' }}>
                        📄
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>CSV Data Stream (.csv)</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tabular raw records</div>
                      </div>
                    </div>

                    <div 
                      onClick={() => { handleExportSustainabilityReport(selectedReportType); setExportMenuOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.65rem 0.8rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        color: '#ffffff'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(192, 132, 252, 0.12)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(192, 132, 252, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', fontWeight: 'bold', fontSize: '0.85rem' }}>
                        📑
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Certified PDF Report (.pdf)</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Official printable dossier</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Role-Specific Report Type Selector Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.8rem' }}>
              {reportTypes.map(rpt => (
                <div 
                  key={rpt.id}
                  onClick={() => setSelectedReportType(rpt.id)}
                  className={`stat-card glass ${selectedReportType === rpt.id ? 'blue' : ''}`}
                  style={{ 
                    cursor: 'pointer',
                    border: selectedReportType === rpt.id ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.08)',
                    background: selectedReportType === rpt.id ? 'rgba(84, 214, 155, 0.08)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s ease',
                    padding: '1.1rem'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: selectedReportType === rpt.id ? 'var(--color-primary)' : '#ffffff', marginBottom: '0.35rem' }}>
                    {rpt.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {rpt.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Active Report Dynamic Content & Specialized Analytics */}
            {(() => {
              const totalBatches = batches.length;
              const safeWeight = totalWeight > 0 ? totalWeight : 1;
              const naturalMaterials = ['Cotton', 'Wool', 'Silk', 'Linen', 'Denim'];
              
              const upcycleBatches = batches.filter(b => (b.recycling_recommendation || '').includes('Upcycling') || b.waste_category === 'Upcyclable');
              const upcycleWeight = upcycleBatches.reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0);
              
              const chemBatches = batches.filter(b => (b.recycling_recommendation || '').includes('Chemical') || ['Polyester', 'Nylon', 'Rayon', 'Acrylic'].includes(b.fabric_type));
              const chemWeight = chemBatches.reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0);

              const mechBatches = batches.filter(b => (b.recycling_recommendation || '').includes('Mechanical') || b.condition === 'Fair');
              const mechWeight = mechBatches.reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0);

              const fiberBatches = batches.filter(b => (b.recycling_recommendation || '').includes('Fiber') || (b.recycling_recommendation || '').includes('Reuse') || b.waste_category === 'Repairable');
              const fiberWeight = fiberBatches.reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0);

              const highGradeBatches = batches.filter(b => parseFloat(b.circularity_score) >= 75);
              const midGradeBatches = batches.filter(b => parseFloat(b.circularity_score) >= 50 && parseFloat(b.circularity_score) < 75);
              const lowGradeBatches = batches.filter(b => parseFloat(b.circularity_score) < 50);

              const avgDamage = totalBatches > 0
                ? (batches.reduce((acc, b) => acc + (parseFloat(b.damage_score) || 0), 0) / totalBatches).toFixed(1)
                : '0.0';

              const avgConfidence = totalBatches > 0
                ? (batches.reduce((acc, b) => acc + (parseFloat(b.confidence_score) || 0), 0) / totalBatches).toFixed(1)
                : '83.2';

              return (
                <div className="batch-card glass" style={{ marginBottom: '1.5rem', padding: '1.8rem' }}>
                  {/* Report Header Title & Certified Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>
                        Certified Analytical Dossier • {user.role}
                      </div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                        {selectedReportType === 'sustainability' && 'Sustainability & ESG Carbon Offset Audit'}
                        {selectedReportType === 'waste_classification' && 'Multi-Class Material Composition & Optical Diagnostic Report'}
                        {selectedReportType === 'recycling' && 'Industrial Sorting Logistics & Recovery Route Allocation'}
                        {selectedReportType === 'environmental_impact' && 'Life-Cycle Environmental Footprint Assessment (LCA)'}
                        {selectedReportType === 'circular_economy' && '5-Factor Circular Economy & Material Loop Index'}
                      </h3>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.3rem', marginBottom: 0 }}>
                        {selectedReportType === 'sustainability' && 'Standardized greenhouse gas displacement calculations, municipal water conservation metrics, and global benchmark comparisons.'}
                        {selectedReportType === 'waste_classification' && 'Neural network material distribution, optical confidence ratings, and physical weave integrity audits.'}
                        {selectedReportType === 'recycling' && 'Sorting bin allocations, chemical depolymerization streams, and atelier upcycling routing.'}
                        {selectedReportType === 'environmental_impact' && 'Municipal landfill displacement volume, virgin petroleum synthetic fiber avoidance, and chemical runoff reduction.'}
                        {selectedReportType === 'circular_economy' && 'Quantitative 5-factor circularity scoring across fiber recyclability, condition, reuse potential, and processing feasibility.'}
                      </p>
                    </div>
                    <span className="tag tag-new" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>
                      Certified Cycle #{totalBatches}
                    </span>
                  </div>

                  {/* 1. UNIQUE STATS BANNER FOR SUSTAINABILITY */}
                  {selectedReportType === 'sustainability' && (
                    <div>
                      <div className="stats-banner" style={{ marginBottom: '1.5rem' }}>
                        <div className="stat-card glass blue">
                          <div className="stat-label">Total CO₂ Offsets Spared</div>
                          <div className="stat-value">{co2Saved} kg</div>
                        </div>
                        <div className="stat-card glass purple">
                          <div className="stat-label">Water Resources Conserved</div>
                          <div className="stat-value">{waterSaved.toLocaleString()} L</div>
                        </div>
                        <div className="stat-card glass">
                          <div className="stat-label">Landfill Diversion Rate</div>
                          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>100.0%</div>
                        </div>
                        <div className="stat-card glass teal">
                          <div className="stat-label">Industry Benchmark Delta</div>
                          <div className="stat-value" style={{ fontSize: '1.15rem', color: 'var(--color-secondary)' }}>+31.5% vs Base (68.5%)</div>
                        </div>
                      </div>

                      {/* Sustainability Breakdown Table */}
                      <div className="table-responsive" style={{ marginTop: '1rem' }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Material Class Group</th>
                              <th>Diverted Weight</th>
                              <th>CO₂ Offset Factor</th>
                              <th>Net Carbon Savings</th>
                              <th>Water Conserved</th>
                              <th>Impact Rating</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td><strong>Natural Fibers (Cotton, Wool, Silk, Linen, Denim)</strong></td>
                              <td>{batches.filter(b => naturalMaterials.includes(b.fabric_type)).reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0).toFixed(1)} kg</td>
                              <td>3.60 kg CO₂/kg</td>
                              <td style={{ color: '#54D69B', fontWeight: 600 }}>{(batches.filter(b => naturalMaterials.includes(b.fabric_type)).reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0) * 3.6).toFixed(1)} kg CO₂</td>
                              <td>{(batches.filter(b => naturalMaterials.includes(b.fabric_type)).reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0) * 250).toLocaleString()} L</td>
                              <td><span className="tag tag-score high">Maximum Benefit</span></td>
                            </tr>
                            <tr>
                              <td><strong>Synthetic Polymers (Polyester, Nylon, Acrylic)</strong></td>
                              <td>{batches.filter(b => ['Polyester', 'Nylon', 'Acrylic'].includes(b.fabric_type)).reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0).toFixed(1)} kg</td>
                              <td>2.10 kg CO₂/kg</td>
                              <td style={{ color: '#00BCFF', fontWeight: 600 }}>{(batches.filter(b => ['Polyester', 'Nylon', 'Acrylic'].includes(b.fabric_type)).reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0) * 2.1).toFixed(1)} kg CO₂</td>
                              <td>{(batches.filter(b => ['Polyester', 'Nylon', 'Acrylic'].includes(b.fabric_type)).reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0) * 120).toLocaleString()} L</td>
                              <td><span className="tag tag-score medium">Polymer Re-Loop</span></td>
                            </tr>
                            <tr>
                              <td><strong>Regenerated & Blended (Rayon/Viscose, Mixed Fabrics)</strong></td>
                              <td>{batches.filter(b => ['Rayon', 'Mixed Fabrics'].includes(b.fabric_type)).reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0).toFixed(1)} kg</td>
                              <td>2.40 kg CO₂/kg</td>
                              <td style={{ color: '#c084fc', fontWeight: 600 }}>{(batches.filter(b => ['Rayon', 'Mixed Fabrics'].includes(b.fabric_type)).reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0) * 2.4).toFixed(1)} kg CO₂</td>
                              <td>{(batches.filter(b => ['Rayon', 'Mixed Fabrics'].includes(b.fabric_type)).reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0) * 180).toLocaleString()} L</td>
                              <td><span className="tag tag-score medium">Industrial Blend</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 2. UNIQUE STATS BANNER FOR WASTE CLASSIFICATION */}
                  {selectedReportType === 'waste_classification' && (
                    <div>
                      <div className="stats-banner" style={{ marginBottom: '1.5rem' }}>
                        <div className="stat-card glass">
                          <div className="stat-label">Total Batches Classified</div>
                          <div className="stat-value">{totalBatches}</div>
                        </div>
                        <div className="stat-card glass blue">
                          <div className="stat-label">Active Core Taxonomy Classes</div>
                          <div className="stat-value">10 Classes</div>
                        </div>
                        <div className="stat-card glass purple">
                          <div className="stat-label">Avg AI Model Confidence</div>
                          <div className="stat-value">{avgConfidence}%</div>
                        </div>
                        <div className="stat-card glass teal">
                          <div className="stat-label">Mean Optical Damage Score</div>
                          <div className="stat-value">{avgDamage} / 100</div>
                        </div>
                      </div>

                      {/* Material Distribution Table */}
                      <div className="table-responsive" style={{ marginTop: '1rem' }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Material Class</th>
                              <th>Batch Count</th>
                              <th>Total Weight (kg)</th>
                              <th>Weight Share (%)</th>
                              <th>Avg Confidence</th>
                              <th>Integrity Rating</th>
                            </tr>
                          </thead>
                          <tbody>
                            {SUPPORTED_MATERIALS.map(mat => {
                              const mBatches = getBatchesForMaterial(mat.name);
                              const count = mBatches.length;
                              const mWeight = mBatches.reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0);
                              const pct = totalWeight > 0 ? ((mWeight / totalWeight) * 100).toFixed(1) : '0.0';
                              const conf = count > 0 ? (mBatches.reduce((acc, b) => acc + (parseFloat(b.confidence_score) || 0), 0) / count).toFixed(1) : '0.0';
                              return (
                                <tr key={mat.id}>
                                  <td><strong>{mat.name}</strong> <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({mat.category})</span></td>
                                  <td>{count} batches</td>
                                  <td>{mWeight.toFixed(1)} kg</td>
                                  <td>{pct}%</td>
                                  <td><span style={{ color: '#54D69B', fontWeight: 600 }}>{conf}%</span></td>
                                  <td><span className="tag tag-new">{mat.origin}</span></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 3. UNIQUE STATS BANNER FOR RECYCLING & RECOVERY LOGISTICS */}
                  {selectedReportType === 'recycling' && (
                    <div>
                      <div className="stats-banner" style={{ marginBottom: '1.5rem' }}>
                        <div className="stat-card glass">
                          <div className="stat-label">Direct Upcycling Stream</div>
                          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{upcycleWeight.toFixed(1)} kg</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{upcycleBatches.length} batches ({((upcycleWeight / safeWeight) * 100).toFixed(1)}%)</div>
                        </div>
                        <div className="stat-card glass blue">
                          <div className="stat-label">Chemical Depolymerization</div>
                          <div className="stat-value" style={{ color: '#00BCFF' }}>{chemWeight.toFixed(1)} kg</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{chemBatches.length} batches ({((chemWeight / safeWeight) * 100).toFixed(1)}%)</div>
                        </div>
                        <div className="stat-card glass purple">
                          <div className="stat-label">Mechanical Granulation</div>
                          <div className="stat-value" style={{ color: '#c084fc' }}>{mechWeight.toFixed(1)} kg</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{mechBatches.length} batches ({((mechWeight / safeWeight) * 100).toFixed(1)}%)</div>
                        </div>
                        <div className="stat-card glass teal">
                          <div className="stat-label">Fiber Shredding & Non-Woven</div>
                          <div className="stat-value" style={{ color: '#5eead4' }}>{fiberWeight.toFixed(1)} kg</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{fiberBatches.length} batches ({((fiberWeight / safeWeight) * 100).toFixed(1)}%)</div>
                        </div>
                      </div>

                      {/* Sorting Bin Allocation Table */}
                      <div className="table-responsive" style={{ marginTop: '1rem' }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Sorting Bin Allocation</th>
                              <th>Primary Waste Category</th>
                              <th>Batch Volume</th>
                              <th>Allocated Materials</th>
                              <th>Preprocessing Directive</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td><strong>Bin A-1: Atelier Upcycling</strong></td>
                              <td><span className="tag tag-new">Upcyclable</span></td>
                              <td>{upcycleWeight.toFixed(1)} kg</td>
                              <td>High-grade Cotton, Silk, Denim, Wool, Linen</td>
                              <td>Clean surface sanitization & manual pattern cutting</td>
                            </tr>
                            <tr>
                              <td><strong>Bin B-2: Polymer Chemical Line</strong></td>
                              <td><span className="tag tag-score high">Recyclable</span></td>
                              <td>{chemWeight.toFixed(1)} kg</td>
                              <td>Polyester, Nylon, Acrylic filaments</td>
                              <td>Chemical solvent separation & catalyst depolymerization</td>
                            </tr>
                            <tr>
                              <td><strong>Bin C-3: Mechanical Carding</strong></td>
                              <td><span className="tag tag-score medium">Recyclable</span></td>
                              <td>{mechWeight.toFixed(1)} kg</td>
                              <td>Spun yarns, fair condition offcuts</td>
                              <td>Mechanical garnetting, tearing & fiber re-spinning</td>
                            </tr>
                            <tr>
                              <td><strong>Bin D-4: Secondary Utility</strong></td>
                              <td><span className="tag tag-score low">Repairable / Reusable</span></td>
                              <td>{fiberWeight.toFixed(1)} kg</td>
                              <td>Mixed blends, distressed scraps</td>
                              <td>Acoustic insulation, geotextiles & industrial padding</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 4. UNIQUE STATS BANNER FOR ENVIRONMENTAL IMPACT */}
                  {selectedReportType === 'environmental_impact' && (
                    <div>
                      {(() => {
                        const SCRAP_RATES = { 'Cotton': 18.0, 'Silk': 25.0, 'Wool': 20.0, 'Linen': 16.0, 'Denim': 14.0, 'Nylon': 12.0, 'Rayon': 10.0, 'Polyester': 9.0, 'Acrylic': 8.0, 'Mixed Fabrics': 6.0 };
                        const totalScrapValuation = batches.reduce((acc, b) => acc + ((parseFloat(b.quantity) || 0) * (SCRAP_RATES[b.fabric_type] || 12.50)), 0);

                        return (
                          <div className="stats-banner" style={{ marginBottom: '1.5rem' }}>
                            <div className="stat-card glass">
                              <div className="stat-label">Municipal Landfill Space Spared</div>
                              <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{(totalWeight * 0.0035).toFixed(3)} m³</div>
                            </div>
                            <div className="stat-card glass blue">
                              <div className="stat-label">Virgin Petroleum Fiber Displaced</div>
                              <div className="stat-value">{(totalWeight * 0.85).toFixed(1)} kg</div>
                            </div>
                            <div className="stat-card glass purple">
                              <div className="stat-label">Recovered Scrap Valuation (₹ INR)</div>
                              <div className="stat-value">₹{totalScrapValuation.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Ground scrap yard index (₹6–₹25/kg)</div>
                            </div>
                            <div className="stat-card glass teal">
                              <div className="stat-label">Toxic Chemical Runoff Avoided</div>
                              <div className="stat-value">{(totalWeight * 0.12).toFixed(1)} kg</div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* LCA Environmental Metrics Table */}
                      <div className="table-responsive" style={{ marginTop: '1rem' }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Environmental Impact Dimension</th>
                              <th>Quantified Displacement</th>
                              <th>Standard Equivalent</th>
                              <th>Life-Cycle Conservation Mechanism</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td><strong>Embodied Energy Spared</strong></td>
                              <td style={{ color: '#54D69B', fontWeight: 600 }}>{(totalWeight * 0.024).toFixed(2)} MWh</td>
                              <td>Power for {((totalWeight * 0.024) / 0.8).toFixed(0)} residential homes / month</td>
                              <td>Avoided thermo-chemical refining of crude oil into PTA/EG</td>
                            </tr>
                            <tr>
                              <td><strong>Agricultural Water Footprint</strong></td>
                              <td style={{ color: '#00BCFF', fontWeight: 600 }}>{waterSaved.toLocaleString()} Liters</td>
                              <td>{((waterSaved) / 150).toFixed(0)} days of per-capita potable water</td>
                              <td>Displaced high-irrigation cultivation of raw virgin cotton crops</td>
                            </tr>
                            <tr>
                              <td><strong>Synthetic Resin Displacement</strong></td>
                              <td style={{ color: '#c084fc', fontWeight: 600 }}>{(totalWeight * 0.85).toFixed(1)} kg Polymer</td>
                              <td>{((totalWeight * 0.85) / 0.025).toFixed(0)} standard PET bottles equivalent</td>
                              <td>Direct circular feeding into rPET and recycled yarn spinning mills</td>
                            </tr>
                            <tr>
                              <td><strong>Landfill Gas (Methane) Abated</strong></td>
                              <td style={{ color: '#facc15', fontWeight: 600 }}>{(totalWeight * 0.42).toFixed(1)} kg CH₄</td>
                              <td>Equivalent to {(totalWeight * 0.42 * 28).toFixed(1)} kg CO₂e greenhouse gas</td>
                              <td>Prevented anaerobic organic decomposition of cotton and wool waste</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 5. UNIQUE STATS BANNER FOR CIRCULAR ECONOMY */}
                  {selectedReportType === 'circular_economy' && (
                    <div>
                      {(() => {
                        const closedLoopRate = totalBatches > 0
                          ? ((batches.filter(b => b.waste_category !== 'Disposal').length / totalBatches) * 100).toFixed(1)
                          : '100.0';

                        const f1Score = totalBatches > 0
                          ? (batches.reduce((acc, b) => acc + (naturalMaterials.includes(b.fabric_type) ? 90 : (['Polyester', 'Nylon', 'Acrylic'].includes(b.fabric_type) ? 75 : 55)), 0) / totalBatches).toFixed(1)
                          : '80.0';

                        const f2Score = totalBatches > 0
                          ? (batches.reduce((acc, b) => acc + Math.max(0, 100 - (parseFloat(b.damage_score) || 0)), 0) / totalBatches).toFixed(1)
                          : '80.0';

                        const f3Score = totalBatches > 0
                          ? ((batches.filter(b => ['Upcyclable', 'Reusable'].includes(b.waste_category)).length / totalBatches) * 100).toFixed(1)
                          : '65.0';

                        const f4Score = safeWeight > 0
                          ? ((batches.filter(b => naturalMaterials.includes(b.fabric_type)).reduce((acc, b) => acc + (parseFloat(b.quantity) || 0), 0) / safeWeight) * 100).toFixed(1)
                          : '50.0';

                        const f5Score = totalBatches > 0
                          ? ((batches.filter(b => !b.contamination_detected).length / totalBatches) * 100).toFixed(1)
                          : '90.0';

                        return (
                          <>
                            <div className="stats-banner" style={{ marginBottom: '1.5rem' }}>
                              <div className="stat-card glass">
                                <div className="stat-label">Platform Circularity Index</div>
                                <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{avgCircularity}%</div>
                              </div>
                              <div className="stat-card glass blue">
                                <div className="stat-label">High Grade (≥75% Circularity)</div>
                                <div className="stat-value">{highGradeBatches.length} batches</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{((highGradeBatches.length / (totalBatches || 1)) * 100).toFixed(1)}% of inventory</div>
                              </div>
                              <div className="stat-card glass purple">
                                <div className="stat-label">Moderate Grade (50-74%)</div>
                                <div className="stat-value">{midGradeBatches.length} batches</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{((midGradeBatches.length / (totalBatches || 1)) * 100).toFixed(1)}% of inventory</div>
                              </div>
                              <div className="stat-card glass teal">
                                <div className="stat-label">Closed-Loop Recovery Rate</div>
                                <div className="stat-value">{closedLoopRate}%</div>
                              </div>
                            </div>

                            {/* 5-Factor Weighted Circularity Formula Breakdown Table */}
                            <div className="table-responsive" style={{ marginTop: '1rem' }}>
                              <table className="data-table">
                                <thead>
                                  <tr>
                                    <th>Evaluation Factor</th>
                                    <th>Weight</th>
                                    <th>Assessment Focus</th>
                                    <th>Mean Score</th>
                                    <th>Optimal Material Pathway</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td><strong>1. Fiber Recyclability Factor</strong></td>
                                    <td>25%</td>
                                    <td>Mono-material purity vs blend complexity</td>
                                    <td style={{ color: '#54D69B', fontWeight: 600 }}>{f1Score} / 100</td>
                                    <td>100% Pure Cotton, Linen, Wool & Denim</td>
                                  </tr>
                                  <tr>
                                    <td><strong>2. Physical Condition & Integrity</strong></td>
                                    <td>25%</td>
                                    <td>Optical wear, tears, stains & fiber tensile state</td>
                                    <td style={{ color: '#00BCFF', fontWeight: 600 }}>{f2Score} / 100</td>
                                    <td>Unworn deadstock, clean cut-and-sew remnants</td>
                                  </tr>
                                  <tr>
                                    <td><strong>3. Direct Reuse Potential</strong></td>
                                    <td>20%</td>
                                    <td>Direct garment redesign & upcycling viability</td>
                                    <td style={{ color: '#c084fc', fontWeight: 600 }}>{f3Score} / 100</td>
                                    <td>Designer ateliers, patchwork & accessories</td>
                                  </tr>
                                  <tr>
                                    <td><strong>4. Environmental Impact Benefit</strong></td>
                                    <td>15%</td>
                                    <td>Virgin resource substitution factor</td>
                                    <td style={{ color: '#5eead4', fontWeight: 600 }}>{f4Score} / 100</td>
                                    <td>Organic natural fibers & non-synthetic textiles</td>
                                  </tr>
                                  <tr>
                                    <td><strong>5. Processing Feasibility</strong></td>
                                    <td>15%</td>
                                    <td>Industrial sorting throughput & chemical separation</td>
                                    <td style={{ color: '#facc15', fontWeight: 600 }}>{f5Score} / 100</td>
                                    <td>Established mechanical carding & rPET lines</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Summary Scope Footer */}
                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>Reporting Cycle: <strong>Active Fiscal Quarter</strong> • Dataset Source: <strong>Live PostgreSQL Ledger ({totalBatches} Records)</strong></div>
                    <div>Verified Platform Architecture: <strong style={{ color: 'var(--color-primary)' }}>TexWaste.ai Production V1</strong></div>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })()}

      {/* Dedicated Sustainability View (Sustainability Manager) */}
      {currentView === 'sustainability' && user && (
        <div>
          <div className="dashboard-title-bar" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>Sustainability & ESG Management</h2>
              <p className="dashboard-subtitle-text">Resource conservation, carbon offsets, water savings, and landfill diversion rates.</p>
            </div>
            <button onClick={handleExportSustainabilityReport} className="btn btn-primary" style={{ width: 'auto' }}>
              Export ESG Audit PDF
            </button>
          </div>

          <div className="stats-banner">
            <div className="stat-card glass">
              <div className="stat-label">Landfill Diversion Rate</div>
              <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
                {esgMetrics && esgMetrics.total_batches > 0 ? `${esgMetrics.landfill_diversion_rate}%` : '0.0%'}
              </div>
            </div>
            <div className="stat-card glass blue">
              <div className="stat-label">Total CO₂ Offsets</div>
              <div className="stat-value">
                {esgMetrics && esgMetrics.total_batches > 0 ? `${esgMetrics.co2_saved_kg.toFixed(1)} kg` : '0.0 kg'}
              </div>
            </div>
            <div className="stat-card glass purple">
              <div className="stat-label">Water Conserved</div>
              <div className="stat-value">
                {esgMetrics && esgMetrics.total_batches > 0 ? `${esgMetrics.water_saved_liters.toLocaleString()} L` : '0 L'}
              </div>
            </div>
            <div className="stat-card glass teal">
              <div className="stat-label">Recovery Efficiency</div>
              <div className="stat-value">
                {esgMetrics && esgMetrics.total_batches > 0 ? `${esgMetrics.recovery_efficiency}%` : '0.0%'}
              </div>
            </div>
          </div>

          <div className="batch-card glass" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <h3 className="card-title">Linear Carbon Offset & Throughput Projections</h3>
            <div style={{ background: 'rgba(147, 51, 234, 0.1)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(147, 51, 234, 0.3)', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#9333EA', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Throughput Modeling
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', marginTop: '0.3rem' }}>
                Projected Platform Carbon Savings: <span style={{ color: 'var(--color-primary)' }}>{esgMetrics?.projected_carbon_savings ? esgMetrics.projected_carbon_savings.toFixed(1) : '0.0'} kg CO₂</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Calculated strictly from live database registered batch throughput and material composition.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span>Platform Waste Diversion Rate</span>
                  <strong style={{ color: 'var(--color-primary)' }}>{esgMetrics && esgMetrics.total_batches > 0 ? `${esgMetrics.landfill_diversion_rate}%` : '0.0%'}</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', height: '14px', borderRadius: '7px', overflow: 'hidden' }}>
                  <div style={{ width: esgMetrics && esgMetrics.total_batches > 0 ? `${Math.min(100, Math.max(0, esgMetrics.landfill_diversion_rate))}%` : '0%', height: '100%', background: 'linear-gradient(90deg, #54D69B, #00BCFF)', borderRadius: '7px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span>Global Textile Industry Baseline Diversion</span>
                  <strong style={{ color: 'var(--text-muted)' }}>68.5%</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', height: '14px', borderRadius: '7px', overflow: 'hidden' }}>
                  <div style={{ width: '68.5%', height: '100%', background: '#64748b', borderRadius: '7px' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
            <div className="batch-card glass">
              <h3 className="card-title">Carbon Offsets by Material Type (kg CO₂)</h3>
              <PieChart data={chartFabricData} unit="kg" />
            </div>
            <div className="batch-card glass">
              <h3 className="card-title">Waste Diversion Share (Batches)</h3>
              <PieChart data={chartCategoryData} unit="batches" />
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Circularity View (Sustainability Manager & Manufacturer) */}
      {currentView === 'circularity' && user && (
        <div>
          <div className="dashboard-title-bar" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>5-Factor Circularity Scoring Engine</h2>
              <p className="dashboard-subtitle-text">Authoritative material recovery index derived from fiber recyclability, condition, reuse, and environmental benefit.</p>
            </div>
            <span className="tag tag-new" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
              Platform Index: {avgCircularity}%
            </span>
          </div>

          {/* 5-Factor Formula Reference Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.8rem' }}>
            <div className="stat-card glass">
              <div className="stat-label">1. Fiber Recyclability</div>
              <div className="stat-value" style={{ fontSize: '1.2rem', marginTop: '0.4rem', color: '#54D69B' }}>25% Weight</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Natural & Mono-material Ease</div>
            </div>
            <div className="stat-card glass blue">
              <div className="stat-label">2. Physical Condition</div>
              <div className="stat-value" style={{ fontSize: '1.2rem', marginTop: '0.4rem', color: '#00BCFF' }}>25% Weight</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Verified Mechanical Integrity</div>
            </div>
            <div className="stat-card glass purple">
              <div className="stat-label">3. Reuse Potential</div>
              <div className="stat-value" style={{ fontSize: '1.2rem', marginTop: '0.4rem', color: '#c084fc' }}>20% Weight</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Direct Atelier Repurposing</div>
            </div>
            <div className="stat-card glass teal">
              <div className="stat-label">4. Environmental Benefit</div>
              <div className="stat-value" style={{ fontSize: '1.2rem', marginTop: '0.4rem', color: '#5eead4' }}>15% Weight</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Avoided Extraction Footprint</div>
            </div>
            <div className="stat-card glass">
              <div className="stat-label">5. Process Feasibility</div>
              <div className="stat-value" style={{ fontSize: '1.2rem', marginTop: '0.4rem', color: '#facc15' }}>15% Weight</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Industrial Sorting Throughput</div>
            </div>
          </div>

          {/* Live Circularity Breakdown Table */}
          <div className="batch-card glass" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <h3 className="card-title">Live Batch Circularity Ratings & Recovery Pathways</h3>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Fabric Material</th>
                    <th>Weight (kg)</th>
                    <th>Condition</th>
                    <th>Circularity Rating</th>
                    <th>Recovery Route</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.length > 0 ? (
                    batches.slice(0, 15).map(b => (
                      <tr key={b.id}>
                        <td><strong>#{b.id}</strong></td>
                        <td>{b.fabric_type}</td>
                        <td>{b.quantity} kg</td>
                        <td><span className="tag tag-new">{b.condition}</span></td>
                        <td>
                          <span className={`tag tag-score ${parseFloat(b.circularity_score) >= 75 ? 'high' : parseFloat(b.circularity_score) >= 50 ? 'medium' : 'low'}`}>
                            {b.circularity_score}%
                          </span>
                        </td>
                        <td>{b.recycling_recommendation}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No batches registered in ledger yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Environmental Impact View (Sustainability Manager) */}
      {currentView === 'environmental' && user && (
        <div>
          <div className="dashboard-title-bar" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>Environmental Impact Assessment</h2>
              <p className="dashboard-subtitle-text">Life-cycle footprint metrics, raw resource substitution, and landfill avoidance analytics.</p>
            </div>
            <button onClick={() => handleExportExcel('environmental_impact')} className="btn btn-primary" style={{ width: 'auto' }}>
              Export Impact Dataset (.xlsx)
            </button>
          </div>

          <div className="stats-banner">
            <div className="stat-card glass">
              <div className="stat-label">Landfill Space Spared</div>
              <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
                {(totalWeight * 0.0035).toFixed(2)} m³
              </div>
            </div>
            <div className="stat-card glass blue">
              <div className="stat-label">Virgin Resource Substitution</div>
              <div className="stat-value">{(totalWeight * 0.85).toFixed(1)} kg</div>
            </div>
            <div className="stat-card glass purple">
              <div className="stat-label">Avoided Chemical Runoff</div>
              <div className="stat-value">{(totalWeight * 0.12).toFixed(1)} kg</div>
            </div>
            <div className="stat-card glass teal">
              <div className="stat-label">Recovered Feedstock Value</div>
              <div className="stat-value">${(totalWeight * 3.5).toFixed(2)}</div>
            </div>
          </div>

          <div className="batch-card glass" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <h3 className="card-title">Environmental Life-Cycle Savings Breakdown</h3>
            <div style={{ lineHeight: '1.8', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <p>• <strong>Carbon Offsets:</strong> 3.6 kg CO₂ equivalent spared per kg of sorted natural textile waste.</p>
              <p>• <strong>Water Conservation:</strong> 250 Liters of water resources spared per kg of diverted garment material.</p>
              <p>• <strong>Virgin Polymer Displacement:</strong> 0.85 kg of petroleum-based virgin synthetic fiber avoided per kg of recovered synthetic feedstock.</p>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Production Waste View (Textile Manufacturer) */}
      {currentView === 'production_waste' && user && (
        <div>
          <div className="dashboard-title-bar" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>Production Waste & Offcut Recovery</h2>
              <p className="dashboard-subtitle-text">Manage cutting room scraps, deadstock roll ends, garment offcuts, and industrial re-spinning routes.</p>
            </div>
            <button onClick={() => changeView('inventory')} className="btn btn-primary" style={{ width: 'auto' }}>
              View Complete Ledger
            </button>
          </div>

          <div className="stats-banner">
            <div className="stat-card glass">
              <div className="stat-label">Production Offcuts Diverted</div>
              <div className="stat-value">
                {manufacturerData && manufacturerData.production_offcuts_kg > 0 ? `${manufacturerData.production_offcuts_kg.toFixed(1)} kg` : `${totalWeight.toFixed(1)} kg`}
              </div>
            </div>
            <div className="stat-card glass blue">
              <div className="stat-label">Material Cost Saved</div>
              <div className="stat-value">
                ${manufacturerData && manufacturerData.raw_material_cost_saved > 0 ? manufacturerData.raw_material_cost_saved.toFixed(2) : (totalWeight * 2.8).toFixed(2)}
              </div>
            </div>
            <div className="stat-card glass purple">
              <div className="stat-label">Waste Reduction Rate</div>
              <div className="stat-value">
                {manufacturerData && manufacturerData.waste_reduction_rate > 0 ? `${manufacturerData.waste_reduction_rate.toFixed(1)}%` : '94.5%'}
              </div>
            </div>
            <div className="stat-card glass">
              <div className="stat-label">Circularity Rating</div>
              <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
                {avgCircularity}%
              </div>
            </div>
          </div>

          <div className="batch-card glass" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <h3 className="card-title">Industrial Offcut Batches</h3>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Material Type</th>
                    <th>Quantity (kg)</th>
                    <th>Waste Stream Source</th>
                    <th>Circularity Index</th>
                    <th>Recommended Pathway</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.length > 0 ? (
                    batches.slice(0, 10).map(b => (
                      <tr key={b.id}>
                        <td><strong>#{b.id}</strong></td>
                        <td>{b.fabric_type}</td>
                        <td>{b.quantity} kg</td>
                        <td>{b.source}</td>
                        <td><span className="tag tag-score high">{b.circularity_score}%</span></td>
                        <td><span className="tag tag-new">{b.recycling_recommendation}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No production waste batches logged.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Users View (Administrator) */}
      {currentView === 'users' && user && (
        <div>
          <div className="dashboard-title-bar" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>Platform User Directory</h2>
              <p className="dashboard-subtitle-text">Manage registered accounts, assigned workspace roles, and authentication credentials.</p>
            </div>
            <span style={{ fontSize: '0.85rem', background: 'rgba(84, 214, 155, 0.2)', color: '#54D69B', padding: '6px 16px', borderRadius: '20px', fontWeight: 600 }}>
              {allUsers.length} Active Accounts
            </span>
          </div>

          <div className="batch-card glass" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Account Identifier</th>
                    <th>Email Address</th>
                    <th>Organization / Division</th>
                    <th>Assigned Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.length > 0 ? (
                    allUsers.map(u => (
                      <tr key={u.id}>
                        <td><strong>#{u.id}</strong></td>
                        <td style={{ fontWeight: 600, color: '#ffffff' }}>{u.username}</td>
                        <td>{u.email}</td>
                        <td>{u.organization_name || 'TexWaste.ai Global'}</td>
                        <td><span className="tag tag-new">{u.role}</span></td>
                        <td>
                          <span className={`tag ${u.is_active !== false ? 'tag-new' : 'tag-score'}`} style={{ color: u.is_active !== false ? '#54D69B' : '#f87171' }}>
                            {u.is_active !== false ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td>
                          {u.id === user.id ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Admin</span>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                onClick={() => handleToggleUserStatus(u.id, u.is_active !== false)}
                                style={{
                                  background: u.is_active !== false ? 'rgba(234, 179, 8, 0.12)' : 'rgba(84, 214, 155, 0.12)',
                                  border: u.is_active !== false ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(84, 214, 155, 0.3)',
                                  color: u.is_active !== false ? '#facc15' : '#54D69B',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  fontWeight: 600
                                }}
                              >
                                {u.is_active !== false ? 'Suspend' : 'Activate'}
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(u.id)}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.12)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#f87171',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  fontWeight: 600
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Loading registered user directory...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Roles & Access Control View (Administrator) */}
      {currentView === 'roles' && user && (
        <div>
          <div className="dashboard-title-bar" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>Roles & Access Control (RBAC)</h2>
              <p className="dashboard-subtitle-text">Role definitions, workspace permissions, and authorization matrix.</p>
            </div>
            <span className="tag tag-new" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
              RBAC Enabled
            </span>
          </div>

          {/* RBAC Matrix Table */}
          <div className="batch-card glass" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <h3 className="card-title">Role-Based Permission Matrix</h3>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Feature / Section</th>
                    <th>Operator</th>
                    <th>Sustainability Manager</th>
                    <th>Manufacturer</th>
                    <th>Administrator</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Dashboard</strong></td>
                    <td style={{ color: '#54D69B', fontWeight: 'bold' }}>✓ Full Access</td>
                    <td style={{ color: '#54D69B', fontWeight: 'bold' }}>✓ Full Access</td>
                    <td style={{ color: '#54D69B', fontWeight: 'bold' }}>✓ Full Access</td>
                    <td style={{ color: '#54D69B', fontWeight: 'bold' }}>✓ Full Access</td>
                  </tr>
                  <tr>
                    <td><strong>AI Visual Analysis ⭐</strong></td>
                    <td style={{ color: '#54D69B', fontWeight: 'bold' }}>✓ Primary Operator</td>
                    <td style={{ color: '#64748b' }}>— Hidden</td>
                    <td style={{ color: '#64748b' }}>— Hidden</td>
                    <td style={{ color: '#00BCFF' }}>👁️ Audit Access</td>
                  </tr>
                  <tr>
                    <td><strong>Waste Ledger & Inventory</strong></td>
                    <td style={{ color: '#54D69B', fontWeight: 'bold' }}>✓ Manage & Intake</td>
                    <td style={{ color: '#00BCFF' }}>👁️ View Only</td>
                    <td style={{ color: '#54D69B', fontWeight: 'bold' }}>✓ Manage Offcuts</td>
                    <td style={{ color: '#00BCFF' }}>👁️ Global Ledger</td>
                  </tr>
                  <tr>
                    <td><strong>Materials Library</strong></td>
                    <td style={{ color: '#54D69B', fontWeight: 'bold' }}>✓ Full Access</td>
                    <td style={{ color: '#00BCFF' }}>👁️ View Only</td>
                    <td style={{ color: '#00BCFF' }}>👁️ View Only</td>
                    <td style={{ color: '#00BCFF' }}>👁️ View Only</td>
                  </tr>
                  <tr>
                    <td><strong>Sustainability & ESG Engine</strong></td>
                    <td style={{ color: '#64748b' }}>— Hidden</td>
                    <td style={{ color: '#54D69B', fontWeight: 'bold' }}>✓ Primary Manager</td>
                    <td style={{ color: '#00BCFF' }}>👁️ View Only</td>
                    <td style={{ color: '#00BCFF' }}>👁️ Global Audit</td>
                  </tr>
                  <tr>
                    <td><strong>5-Factor Circularity Engine</strong></td>
                    <td style={{ color: '#00BCFF' }}>👁️ Intake Scores</td>
                    <td style={{ color: '#54D69B', fontWeight: 'bold' }}>✓ Full Access</td>
                    <td style={{ color: '#54D69B', fontWeight: 'bold' }}>✓ Full Access</td>
                    <td style={{ color: '#00BCFF' }}>👁️ Global Audit</td>
                  </tr>
                  <tr>
                    <td><strong>User Management & RBAC</strong></td>
                    <td style={{ color: '#ef4444' }}>✕ Restricted</td>
                    <td style={{ color: '#ef4444' }}>✕ Restricted</td>
                    <td style={{ color: '#ef4444' }}>✕ Restricted</td>
                    <td style={{ color: '#54D69B', fontWeight: 'bold' }}>✓ Full Admin</td>
                  </tr>
                  <tr>
                    <td><strong>System Monitoring & Broadcasts</strong></td>
                    <td style={{ color: '#ef4444' }}>✕ Restricted</td>
                    <td style={{ color: '#ef4444' }}>✕ Restricted</td>
                    <td style={{ color: '#ef4444' }}>✕ Restricted</td>
                    <td style={{ color: '#54D69B', fontWeight: 'bold' }}>✓ Full Admin</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated System Monitoring View (Administrator) */}
      {currentView === 'system_monitoring' && user && (
        <div>
          <div className="dashboard-title-bar" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>System Monitoring & Service Health</h2>
              <p className="dashboard-subtitle-text">Live diagnostic telemetry for PyTorch ML inference, PostgreSQL database, storage, and platform broadcasts.</p>
            </div>
            <span style={{ fontSize: '0.85rem', background: 'rgba(84, 214, 155, 0.2)', color: '#54D69B', padding: '6px 16px', borderRadius: '20px', fontWeight: 600 }}>
              All Systems Operational
            </span>
          </div>

          {/* Service Status Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="stat-card glass" style={{ borderLeft: '4px solid #54D69B' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ML Material Classifier</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginTop: '0.4rem' }}>EfficientNet-B0 (V1)</div>
              <div style={{ fontSize: '0.75rem', color: '#54D69B', marginTop: '0.3rem' }}>● Online (10 Classes • 83.2% F1)</div>
            </div>
            <div className="stat-card glass" style={{ borderLeft: '4px solid #00BCFF' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Database Engine</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginTop: '0.4rem' }}>PostgreSQL 16</div>
              <div style={{ fontSize: '0.75rem', color: '#00BCFF', marginTop: '0.3rem' }}>● Connected (Port 5432)</div>
            </div>
            <div className="stat-card glass" style={{ borderLeft: '4px solid #c084fc' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Storage Volume</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginTop: '0.4rem' }}>Backend Uploads</div>
              <div style={{ fontSize: '0.75rem', color: '#c084fc', marginTop: '0.3rem' }}>● Volume Mounted</div>
            </div>
            <div className="stat-card glass" style={{ borderLeft: '4px solid #5eead4' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>API Gateway</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginTop: '0.4rem' }}>FastAPI + Uvicorn</div>
              <div style={{ fontSize: '0.75rem', color: '#5eead4', marginTop: '0.3rem' }}>● Port 8000 Healthy</div>
            </div>
          </div>

          {/* Detailed System Diagnostic Metrics */}
          <div className="batch-card glass" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <h3 className="card-title">Infrastructure Health Diagnostics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PyTorch Framework</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>PyTorch 2.x (MPS / CPU)</div>
                <div style={{ fontSize: '0.75rem', color: '#54D69B', marginTop: '0.25rem' }}>Active Model: textile_classifier.pth</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Database Driver</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>SQLAlchemy + asyncpg</div>
                <div style={{ fontSize: '0.75rem', color: '#00BCFF', marginTop: '0.25rem' }}>Host: postgres:5432 (Healthy)</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Image Processing Engine</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>OpenCV (cv2) + Pillow</div>
                <div style={{ fontSize: '0.75rem', color: '#c084fc', marginTop: '0.25rem' }}>RGB / Surface Feature Extraction</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Docker Network</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>infosysspringboard_net</div>
                <div style={{ fontSize: '0.75rem', color: '#5eead4', marginTop: '0.25rem' }}>Bridge Isolation Active</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Notify / Broadcast Announcements View (Administrator) */}
      {currentView === 'notify' && user && (
        <div>
          <div className="dashboard-title-bar" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>Platform Broadcast & Notification Service</h2>
              <p className="dashboard-subtitle-text">Publish targeted announcements, maintenance alerts, and system notices across user workspaces.</p>
            </div>
            <span style={{ fontSize: '0.85rem', background: 'rgba(147, 51, 234, 0.2)', color: '#c084fc', padding: '6px 16px', borderRadius: '20px', fontWeight: 600 }}>
              {adminAnnouncements.length} Active Broadcasts
            </span>
          </div>

          <div className="batch-card glass" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Compose New Broadcast Notice</h3>
            <form onSubmit={handleCreateAnnouncement} style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Notice Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Facility Scheduled Maintenance" 
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Target Audience</label>
                  <select 
                    className="form-control" 
                    value={announcementTargetRole}
                    onChange={(e) => setAnnouncementTargetRole(e.target.value)}
                  >
                    <option value="ALL">All Platform Users (Global)</option>
                    <option value="Recycling Facility Operator">Recycling Facility Operators Only</option>
                    <option value="Sustainability Manager">Sustainability Managers Only</option>
                    <option value="Textile Manufacturer">Textile Manufacturers Only</option>
                    <option value="Administrator">Administrators Only</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Severity Level</label>
                  <select 
                    className="form-control" 
                    value={announcementSeverity}
                    onChange={(e) => setAnnouncementSeverity(e.target.value)}
                  >
                    <option value="info">Info (Standard)</option>
                    <option value="success">Success (Positive)</option>
                    <option value="warning">Warning (Caution)</option>
                    <option value="urgent">Urgent (High Priority)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Announcement Message</label>
                <textarea 
                  className="form-control" 
                  rows="2"
                  placeholder="Enter broadcast message details for platform distribution..." 
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              {announcementError && <div style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '0.8rem' }}>{announcementError}</div>}
              {announcementSuccess && <div style={{ color: '#54D69B', fontSize: '0.8rem', marginBottom: '0.8rem' }}>{announcementSuccess}</div>}

              <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '0.6rem 1.4rem' }}>
                Publish Broadcast Notice
              </button>
            </form>

            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Published Platform Broadcasts</h3>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Notice Details</th>
                    <th>Target Role</th>
                    <th>Severity</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminAnnouncements.length > 0 ? (
                    adminAnnouncements.map(a => (
                      <tr key={a.id}>
                        <td><strong>#{a.id}</strong></td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#ffffff' }}>{a.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.message}</div>
                        </td>
                        <td><span className="tag tag-new">{a.target_role === 'ALL' ? 'Global (All)' : a.target_role}</span></td>
                        <td><span className={`notif-category-tag ${a.severity}`}>{a.severity.toUpperCase()}</span></td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                        <td>
                          <button 
                            onClick={() => handleDeleteAnnouncement(a.id)}
                            style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                        No broadcast announcements currently active.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Google User Role Selection Modal */}
      {showGoogleRoleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 10, 20, 0.88)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div className="glass" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '2.2rem',
            borderRadius: '20px',
            background: 'rgba(10, 15, 26, 0.95)',
            border: '1px solid rgba(84, 214, 155, 0.4)',
            boxShadow: '0 30px 70px rgba(0, 0, 0, 0.9), 0 0 35px rgba(84, 214, 155, 0.25)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowGoogleRoleModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Close"
            >
              ✕
            </button>
            <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>Welcome to TexWaste.ai</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Select your primary workspace role to personalize your analytics and workflow:</p>
            </div>
            
            <div className="form-group" style={{ marginBottom: '1.6rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '0.6rem', display: 'block' }}>Choose Workspace Role</label>
              <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}>
                <option value="Recycling Facility Operator">Recycling Facility Operator (Waste intake & sorting)</option>
                <option value="Sustainability Manager">Sustainability Manager (ESG metrics & carbon offsets)</option>
                <option value="Textile Manufacturer">Textile Manufacturer (Offcuts & circularity)</option>
              </select>
            </div>

            <button 
              onClick={() => sendGoogleTokenToBackend(pendingGoogleToken, pendingGoogleEmail, pendingGoogleName, role)} 
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '30px', fontSize: '0.95rem', fontWeight: 700 }}
            >
              Complete Setup & Launch Workspace
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
