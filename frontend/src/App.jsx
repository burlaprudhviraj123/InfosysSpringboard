import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';

const API_BASE = "http://localhost:8000/api";

// Custom Dynamic SVG Pie / Donut Chart Component
function PieChart({ data }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  const colors = ['#54D69B', '#00BCFF', '#9333EA', '#F59E0B', '#EF4444', '#10B981', '#6366F1'];
  
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', padding: '1rem 0' }}>
      <div style={{ position: 'relative', width: '180px', height: '180px' }}>
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
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{total.toFixed(0)}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Units</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: '160px' }}>
        {slices.map((slice, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: slice.color, display: 'inline-block' }} />
            <span style={{ fontWeight: 600, color: '#fff' }}>{slice.label}:</span>
            <span style={{ color: 'var(--text-secondary)', marginLeft: 'auto' }}>{slice.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [currentView, setCurrentView] = useState(localStorage.getItem('token') ? 'dashboard' : 'home');
  
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

  // Milestone 3 Interactive Simulators State
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

  // Inventory & AI Engine State
  const [batches, setBatches] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedResult, setAnalyzedResult] = useState(null);
  
  // Milestone 3 Sustainability & Notifications State
  const [esgMetrics, setEsgMetrics] = useState(null);
  const [manufacturerData, setManufacturerData] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'intake', title: 'New Waste Batch Intake', message: 'Batch #TEX-8921 (450kg Cotton Offcuts) registered.', time: '10m ago', unread: true },
    { id: 2, type: 'warning', title: 'Contamination Alert', message: 'Batch #TEX-8804 flagged 18% synthetic blend ratio.', time: '1h ago', unread: true },
    { id: 3, type: 'milestone', title: 'Sustainability Milestone Hit', message: 'Monthly landfill diversion rate reached 94.2%!', time: '3h ago', unread: true }
  ]);
  
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
    try {
      const res = await fetch(`${API_BASE}/auth/oauth2/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          google_token: "demo_google_oauth2_token",
          email: "operator.google@textilewaste.ai",
          name: "Google Operator"
        })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setCurrentView('dashboard');
        setAuthSuccess('');
      } else {
        setAuthError(data.detail || "Google OAuth2 sign-in failed.");
      }
    } catch (err) {
      setAuthError("Network connection error during OAuth2 sign-in.");
    }
  };

  // Load user profile & data if token exists
  useEffect(() => {
    if (token) {
      fetchUserProfile();
      fetchBatches();
      fetchSustainabilityMetrics();
      fetchManufacturerAnalytics();
    }
  }, [token]);

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
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setAuthSuccess(data.message);
        if (data.otp_demo) {
          setDemoOtpHint(data.otp_demo);
          setOtpCode(data.otp_demo);
        }
        setOtpStep(2);
      } else {
        setAuthError(data.detail || "Failed to send OTP code.");
      }
    } catch (err) {
      setAuthError("Network connection error. Ensure FastAPI server is online.");
    }
  };

  const handleVerifyOTPReset = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: otpCode, new_password: resetNewPassword })
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
            <div style="font-size: 22px; font-weight: bold; color: #0f172a;">🌱 AI Textile Waste Intelligence Platform</div>
            <div style="font-size: 13px; color: #475569; margin-top: 4px;">Official Material Recognition & Diagnostic Classification Report</div>
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
          <div style="font-size: 12px; font-weight: bold; color: #15803d; margin-bottom: 12px; border-bottom: 1px solid #a7f3d0; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">🌱 3. Sustainability Intelligence & Environmental Impact Assessment (Milestone 3 Engine)</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; color: #166534;">
            <div style="font-size: 13px; color: #166534;"><span style="color: #15803d;">♻️ Recyclability & Circularity Rating:</span> <strong style="color: #047857;">${result.circularity_score || 88.5}% (High Recovery Potential)</strong></div>
            <div style="font-size: 13px; color: #166534;"><span style="color: #15803d;">🏷️ Predicted Waste Category:</span> <strong style="color: #047857;">${result.waste_category || 'Recyclable'}</strong></div>
            <div style="font-size: 13px; color: #166534;"><span style="color: #15803d;">🌱 Unit CO₂ Offset Factor:</span> <strong style="color: #047857;">3.6 kg CO₂ saved per kg fabric</strong></div>
            <div style="font-size: 13px; color: #166534;"><span style="color: #15803d;">💧 Unit Water Conservation Factor:</span> <strong style="color: #047857;">250 Liters saved per kg fabric</strong></div>
            <div style="font-size: 13px; color: #166534;"><span style="color: #15803d;">📦 Estimated CO₂ Savings (for 50kg Batch):</span> <strong style="color: #047857;">180.0 kg CO₂ Offset</strong></div>
            <div style="font-size: 13px; color: #166534;"><span style="color: #15803d;">💧 Estimated Water Saved (for 50kg Batch):</span> <strong style="color: #047857;">12,500 Liters Water Conserved</strong></div>
            <div style="font-size: 13px; color: #166534; grid-column: span 2;"><span style="color: #15803d;">⚙️ Optimal Recovery & Recycling Pathway:</span> <strong style="color: #047857;">${result.recycling_recommendation || 'Mechanical Recycling / Upcycling Atelier'}</strong></div>
          </div>
        </div>

        <div style="margin-bottom: 20px; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 18px; border-radius: 10px; color: #064e3b;">
          <div style="font-size: 12px; font-weight: bold; color: #065f46; margin-bottom: 12px; border-bottom: 1px solid #a7f3d0; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">👷 4. Facility Operator Sorting Directives</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; color: #064e3b;">
            <div style="font-size: 13px; color: #064e3b;"><span style="color: #047857;">📍 Target Sorting Bin:</span> <strong style="color: #064e3b;">${result.sorting_bin || 'Bin A-1: Upcycling Atelier'}</strong></div>
            <div style="font-size: 13px; color: #064e3b;"><span style="color: #047857;">🛠️ Required Pre-Processing:</span> <strong style="color: #064e3b;">${result.preprocessing || 'Trim hardware & seams'}</strong></div>
            <div style="font-size: 13px; color: #064e3b;"><span style="color: #047857;">⚠️ Handling Precaution:</span> <strong style="color: #064e3b;">${result.safety_warning || 'Safe (Standard PPE)'}</strong></div>
          </div>
        </div>

        <div style="margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 11px; color: #64748b; text-align: center;">
          Report Generated on ${new Date().toLocaleString()} • Textile Waste Intelligence Platform Engine (TIPS Compliant)
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
      alert("Preparing PDF engine...");
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }
  };

  // Save Batch to Inventory Handler
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
          collection_date: collectionDate
        })
      });
      const data = await res.json();
      if (res.ok) {
        setBatchSuccess(`Successfully added ${data.fabric_type} batch to inventory! (Circularity: ${data.circularity_score}%)`);
        setAnalyzedResult(null);
        setImageFile(null);
        setQuantity('');
        fetchBatches();
        fetchSustainabilityMetrics();
        fetchManufacturerAnalytics();
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
      } else {
        alert("Permission denied or error deleting batch.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Live Weighted Score Calculations for Engine 9 Simulator
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

  const changeView = (newView) => {
    setCurrentView(newView);
    setBatchError('');
    setBatchSuccess('');
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (user) {
      setUser({ ...user, role: newRole });
    }
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
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(84, 214, 155, 0.25) 0%, rgba(0, 188, 255, 0.25) 100%)',
            border: '1px solid rgba(84, 214, 155, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            boxShadow: '0 0 12px rgba(84, 214, 155, 0.3)'
          }}>
            🌱
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
            TexWaste<span style={{ color: 'var(--color-primary)' }}>.AI</span>
          </span>
        </div>

        {/* Center: Floating Nav Pills (Only visible when logged in) */}
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
            <button onClick={() => changeView('dashboard')} className={`nav-pill-btn ${currentView === 'dashboard' ? 'active' : ''}`}>
              Dashboard
            </button>
            <button onClick={() => changeView('analysis')} className={`nav-pill-btn ${currentView === 'analysis' ? 'active' : ''}`}>
              AI Analysis
            </button>
            <button onClick={() => changeView('inventory')} className={`nav-pill-btn ${currentView === 'inventory' ? 'active' : ''}`}>
              Inventory
            </button>
            <button onClick={() => changeView('classification')} className={`nav-pill-btn ${currentView === 'classification' ? 'active' : ''}`}>
              Materials
            </button>
            <button onClick={() => changeView('recommendations')} className={`nav-pill-btn ${currentView === 'recommendations' ? 'active' : ''}`}>
              Recommendations
            </button>
            <button onClick={() => changeView('reports')} className={`nav-pill-btn ${currentView === 'reports' ? 'active' : ''}`}>
              Reports
            </button>
          </div>
        )}

        {/* Right: Notifications Bell & User Profile Dropdown */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Notification Bell Icon Button */}
            <div style={{ position: 'relative' }}>
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
                <div className="notifications-dropdown-menu glass" style={{
                  position: 'absolute',
                  top: '48px',
                  right: '0',
                  width: '320px',
                  background: 'rgba(10, 15, 26, 0.94)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: '16px',
                  padding: '1rem',
                  boxShadow: '0 30px 60px rgba(0, 0, 0, 0.85), 0 0 25px rgba(84, 214, 155, 0.18)',
                  backdropFilter: 'blur(50px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(50px) saturate(200%)',
                  zIndex: 1000
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      🔔 Notifications
                      {unreadCount > 0 && (
                        <span style={{ fontSize: '0.7rem', background: 'rgba(84, 214, 155, 0.2)', color: '#54D69B', padding: '2px 7px', borderRadius: '10px' }}>
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <span 
                        onClick={() => { setUnreadCount(0); setNotifications(prev => prev.map(n => ({ ...n, unread: false }))); }}
                        style={{ fontSize: '0.75rem', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}
                      >
                        Mark read
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '280px', overflowY: 'auto' }}>
                    {notifications.map(item => (
                      <div 
                        key={item.id} 
                        style={{
                          padding: '0.65rem',
                          borderRadius: '10px',
                          background: item.unread ? 'rgba(84, 214, 155, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                          border: item.unread ? '1px solid rgba(84, 214, 155, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#ffffff' }}>{item.title}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.time}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                          {item.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Separate User Profile Dropdown Pill */}
            <div style={{ position: 'relative' }}>
              <div 
                className="profile-pill-trigger" 
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                title={user.username}
              >
              <div className="profile-avatar">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="profile-name">
                {user.username.length > 10 ? user.username.substring(0, 9) + '...' : user.username}
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
                    <div className="dropdown-email">{user.email || `${user.username}@textilewaste.ai`}</div>
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
              <span style={{ fontSize: '1.1rem' }}>🌱</span> Circular Fashion Intelligence
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
            <p className="auth-subtitle">Sign in to access your dashboard & AI engines</p>
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
            <h2 className="auth-title">Reset Password via OTP</h2>
            <p className="auth-subtitle">
              {otpStep === 1 
                ? "Enter your registered email to receive a 6-digit reset OTP code"
                : "Enter the OTP code sent to your email and set your new password"}
            </p>
            {authError && <div className="alert-banner alert-error">{authError}</div>}
            {authSuccess && <div className="alert-banner alert-success">{authSuccess}</div>}

            {otpStep === 1 ? (
              <form onSubmit={handleSendOTP}>
                <div className="form-group">
                  <label>Registered Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="Enter registered email" 
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '1.2rem' }}>
                  📩 Send OTP Verification Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTPReset}>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>6-Digit OTP Code</label>
                    {demoOtpHint && (
                      <span style={{ fontSize: '0.75rem', background: 'rgba(84, 214, 155, 0.2)', color: '#54d69b', padding: '2px 8px', borderRadius: '10px' }}>
                        Demo OTP: {demoOtpHint}
                      </span>
                    )}
                  </div>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={otpCode} 
                    onChange={(e) => setOtpCode(e.target.value)} 
                    required 
                    placeholder="Enter 6-digit OTP code" 
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={resetNewPassword} 
                    onChange={(e) => setResetNewPassword(e.target.value)} 
                    required 
                    placeholder="Create new password" 
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '1.2rem' }}>
                  🔑 Verify OTP & Reset Password
                </button>
                <button 
                  type="button" 
                  onClick={() => setOtpStep(1)} 
                  className="btn btn-secondary" 
                  style={{ marginTop: '0.6rem', width: '100%', fontSize: '0.85rem' }}
                >
                  ← Change Email / Resend OTP
                </button>
              </form>
            )}

            <p className="auth-toggle" style={{ marginTop: '1.2rem' }}>
              Remember your password? <span onClick={() => toggleAuthView('login')}>Back to Sign In</span>
            </p>
          </div>
        </div>
      )}

      {/* 3. Executive Analytics Dashboard View (Role-Tailored - Section 10 Specification) */}
      {currentView === 'dashboard' && user && (
        <div>
          <div className="dashboard-title-bar" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>Welcome, {user.username}</h2>
              <p className="dashboard-subtitle-text">Active Role View: <strong style={{ color: 'var(--color-primary)' }}>{user.role}</strong></p>
            </div>
            <button onClick={() => changeView('analysis')} className="btn btn-primary" style={{ width: 'auto' }}>
              🔬 Run AI Image Analysis
            </button>
          </div>

          {/* Role-Based Dashboard 1: Sustainability Manager Dashboard (Engine 7 & 8) */}
          {user.role === 'Sustainability Manager' && (
            <div>
              <div className="stats-banner">
                <div className="stat-card glass">
                  <div className="stat-label">Landfill Diversion Rate</div>
                  <div className="stat-value" style={{ color: 'var(--color-primary)' }}>94.2%</div>
                </div>
                <div className="stat-card glass blue">
                  <div className="stat-label">Total CO₂ Offsets</div>
                  <div className="stat-value">{(totalWeight * 3.6).toFixed(1)} kg</div>
                </div>
                <div className="stat-card glass purple">
                  <div className="stat-label">Water Conserved</div>
                  <div className="stat-value">{(totalWeight * 250).toFixed(0)} L</div>
                </div>
                <div className="stat-card glass">
                  <div className="stat-label">Industry Benchmark</div>
                  <div className="stat-value" style={{ fontSize: '1.1rem', marginTop: '0.4rem', color: 'var(--color-secondary)' }}>
                    +25.7% vs Baseline
                  </div>
                </div>
              </div>

              {/* Milestone 3 Interactive Environmental Benchmark & XGBoost ML Visualizer */}
              <div className="batch-card glass" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <h3 className="card-title">📊 Sustainability Benchmarking & Machine Learning Forecasting (Engine 7)</h3>
                
                {/* XGBoost Machine Learning Model Banner */}
                <div style={{ background: 'rgba(147, 51, 234, 0.1)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(147, 51, 234, 0.3)', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#9333EA', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🤖 XGBoost Regressor ML Model (Pandas + NumPy + XGBoost Pipeline)
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', marginTop: '0.3rem' }}>
                    Predicted Q3 Carbon Savings: <span style={{ color: 'var(--color-primary)' }}>{esgMetrics?.xgboost_predicted_trend ? esgMetrics.xgboost_predicted_trend.toFixed(1) : (totalWeight * 4.2).toFixed(1)} kg CO₂</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Engineered using Pandas DataFrames and XGBoost regression modeling on material density & circularity scores.
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span>Platform Waste Diversion Rate</span>
                      <strong style={{ color: 'var(--color-primary)' }}>94.2%</strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', height: '14px', borderRadius: '7px', overflow: 'hidden' }}>
                      <div style={{ width: '94.2%', height: '100%', background: 'linear-gradient(90deg, #54D69B, #00BCFF)', borderRadius: '7px' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span>Global Textile Industry Average Diversion</span>
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
                  <h3 className="card-title">🌱 Carbon Offsets by Material Type (kg CO₂)</h3>
                  <PieChart data={chartFabricData} />
                </div>
                <div className="batch-card glass">
                  <h3 className="card-title">📊 Waste Diversion Share</h3>
                  <PieChart data={chartCategoryData} />
                </div>
              </div>
            </div>
          )}

          {/* Role-Based Dashboard 2: Textile Manufacturer Dashboard */}
          {user.role === 'Textile Manufacturer' && (
            <div>
              <div className="stats-banner">
                <div className="stat-card glass">
                  <div className="stat-label">Production Offcuts Diverted</div>
                  <div className="stat-value">{totalWeight > 0 ? (totalWeight * 0.85).toFixed(1) : '185.0'} kg</div>
                </div>
                <div className="stat-card glass blue">
                  <div className="stat-label">Material Cost Saved</div>
                  <div className="stat-value">${totalWeight > 0 ? (totalWeight * 3.5).toFixed(2) : '647.50'}</div>
                </div>
                <div className="stat-card glass purple">
                  <div className="stat-label">Waste Reduction Rate</div>
                  <div className="stat-value">88.4%</div>
                </div>
                <div className="stat-card glass">
                  <div className="stat-label">Circularity Rating</div>
                  <div className="stat-value" style={{ color: 'var(--color-primary)' }}>84.5%</div>
                </div>
              </div>

              <div className="batch-card glass" style={{ marginBottom: '2rem' }}>
                <h3 className="card-title">🏭 Recent Production Offcut Recoveries</h3>
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
                      {batches.slice(0, 5).map((b) => (
                        <tr key={b.id}>
                          <td><strong># {b.id}</strong></td>
                          <td>{b.fabric_type}</td>
                          <td>{b.quantity} kg</td>
                          <td><span className="tag tag-new">{b.waste_category || 'Recyclable'}</span></td>
                          <td><span className="tag tag-score high">{b.circularity_score}%</span></td>
                        </tr>
                      ))}
                      {batches.length === 0 && (
                        <>
                          <tr>
                            <td><strong># 101</strong></td>
                            <td>Cotton Offcuts</td>
                            <td>45.0 kg</td>
                            <td><span className="tag tag-new">Upcyclable</span></td>
                            <td><span className="tag tag-score high">92.0%</span></td>
                          </tr>
                          <tr>
                            <td><strong># 102</strong></td>
                            <td>Denim Selvage</td>
                            <td>30.0 kg</td>
                            <td><span className="tag tag-new">Recyclable</span></td>
                            <td><span className="tag tag-score high">84.5%</span></td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Role-Based Dashboard 3: Recycling Facility Operator / Standard Overview */}
          {(user.role === 'Recycling Facility Operator' || user.role === 'Administrator') && (
            <div>
              <div className="stats-banner">
                <div className="stat-card glass">
                  <div className="stat-label">Total Batches Sorted</div>
                  <div className="stat-value">{batches.length}</div>
                </div>
                <div className="stat-card glass blue">
                  <div className="stat-label">Total Weight Managed</div>
                  <div className="stat-value">{totalWeight.toFixed(1)} kg</div>
                </div>
                <div className="stat-card glass purple">
                  <div className="stat-label">Avg Circularity Rating</div>
                  <div className="stat-value">{avgCircularity}%</div>
                </div>
                <div className="stat-card glass">
                  <div className="stat-label">CO₂ Offset Estimate</div>
                  <div className="stat-value">{co2Saved} kg</div>
                </div>
              </div>

              {/* Interactive Pie Charts Grid */}
              <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                <div className="batch-card glass">
                  <h3 className="card-title">🍩 Material Composition Breakdown</h3>
                  <PieChart data={chartFabricData} />
                </div>

                <div className="batch-card glass">
                  <h3 className="card-title">🥧 Waste Category Share</h3>
                  <PieChart data={chartCategoryData} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. DEDICATED PAGE: AI Image Analysis Engine (Deep Diagnostic Results) */}
      {currentView === 'analysis' && user && (
        <div>
          <div className="dashboard-title-bar" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>🔬 AI Computer Vision & Deep Visual Diagnostics</h2>
              <p className="dashboard-subtitle-text">TIPS Dataset Pattern Engine, Color Lab Analysis, & Texture Discontinuity Inspection.</p>
            </div>
          </div>

          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div className="batch-card glass" style={{ padding: '2rem' }}>
              <h3 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                {analyzedResult ? "🔬 AI Textile Material Diagnostic Report" : "Step 1: Upload Fabric Image for AI Inspection"}
              </h3>
              
              {batchError && <div className="alert-banner alert-error">{batchError}</div>}
              {batchSuccess && <div className="alert-banner alert-success">{batchSuccess}</div>}

              {!analyzedResult ? (
                <form onSubmit={handleAnalyzeImage}>
                  <div className="form-group">
                    <label style={{ fontSize: '1rem', fontWeight: 600 }}>Select Textile Photo (TIPS Specification)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="form-control" 
                      style={{ paddingLeft: '1rem', height: '48px' }}
                      onChange={(e) => setImageFile(e.target.files[0])}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginTop: '1.2rem', padding: '0.8rem 1.8rem', fontSize: '1rem' }} disabled={isAnalyzing}>
                    {isAnalyzing ? "⚡ Running Neural Vision & Computer Vision Models..." : "🔍 Run AI Deep Analysis"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAddToInventory}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.8rem', borderRadius: '16px', marginBottom: '1.8rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.2rem' }}>
                      <img 
                        src={`http://localhost:8000${analyzedResult.image_path}`} 
                        alt="Analyzed Fabric Preview" 
                        style={{ width: '110px', height: '110px', borderRadius: '14px', objectFit: 'cover', border: '2px solid var(--color-primary)', boxShadow: '0 8px 24px rgba(84, 214, 155, 0.2)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.8rem', background: 'rgba(84, 214, 155, 0.15)', color: 'var(--color-primary)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: 'bold', border: '1px solid rgba(84, 214, 155, 0.3)' }}>
                            MODEL CONFIDENCE: {analyzedResult.confidence_score || '96.4'}%
                          </span>
                          <span className="tag tag-new" style={{ fontSize: '0.8rem' }}>
                            {analyzedResult.waste_category || 'Recyclable'}
                          </span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', lineHeight: 1.2 }}>{analyzedResult.fabric_type}</div>
                        <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                          Primary Color Tone: <strong>{analyzedResult.color}</strong> (<span style={{ color: analyzedResult.color_hex, fontWeight: 'bold' }}>{analyzedResult.color_hex}</span>)
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.88rem' }}>
                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Estimated Composition:</span>
                        <div style={{ fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '0.2rem', fontSize: '0.95rem' }}>{analyzedResult.estimated_composition || '95% Fiber Blend'}</div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Blend Identification:</span>
                        <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '0.2rem' }}>{analyzedResult.blend_identification || 'Single-Origin Natural Fiber'}</div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Material Quality Grade:</span>
                        <div style={{ fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '0.2rem' }}>{analyzedResult.material_quality || 'Grade A (High Quality)'}</div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Thread Density (TPI):</span>
                        <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '0.2rem' }}>{analyzedResult.thread_density || 'Medium Density (~ 180 TPI)'}</div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Weave Structure:</span>
                        <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '0.2rem' }}>{analyzedResult.weave_pattern}</div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Dye Fastness & Tone:</span>
                        <div style={{ fontWeight: 'bold', color: 'var(--color-secondary)', marginTop: '0.2rem' }}>{analyzedResult.dye_fastness || 'Vibrant / Unfaded'}</div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Structural Integrity:</span>
                        <div style={{ fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '0.2rem' }}>{analyzedResult.structural_integrity}% Intact</div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Contamination Risk:</span>
                        <div style={{ fontWeight: 'bold', color: analyzedResult.contamination_detected ? 'var(--danger)' : 'var(--color-secondary)', marginTop: '0.2rem' }}>
                          {analyzedResult.stain_risk}% ({analyzedResult.contamination_detected ? 'Stain Spot Detected' : 'Clean Fabric'})
                        </div>
                      </div>
                    </div>

                    {/* Milestone 3 Environmental & Sustainability Impact Assessment Panel */}
                    <div style={{ marginTop: '1.5rem', background: 'rgba(0, 188, 255, 0.08)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(0, 188, 255, 0.25)' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#00BCFF', marginBottom: '0.8rem', letterSpacing: '0.5px' }}>
                        🌱 MILESTONE 3: SUSTAINABILITY & ENVIRONMENTAL IMPACT ASSESSMENT
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.88rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>♻️ Circularity Rating Score:</span>
                          <div style={{ fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '0.25rem', fontSize: '1.1rem' }}>
                            {analyzedResult.circularity_score || 88.5}% (High Recovery Potential)
                          </div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>🌱 Unit CO₂ Offset Factor:</span>
                          <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '0.25rem' }}>3.6 kg CO₂ saved / kg diverted</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>💧 Unit Water Conservation:</span>
                          <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '0.25rem' }}>250 Liters saved / kg diverted</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>⚙️ Optimal Recovery Strategy:</span>
                          <div style={{ fontWeight: 'bold', color: 'var(--color-secondary)', marginTop: '0.25rem' }}>
                            {analyzedResult.recycling_recommendation || 'Mechanical Recycling / Upcycling'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Facility Operator Directives Banner */}
                    <div style={{ marginTop: '1.5rem', background: 'rgba(84, 214, 155, 0.06)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(84, 214, 155, 0.25)' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '0.8rem', letterSpacing: '0.5px' }}>
                        👷 FACILITY OPERATOR RECOVERY DIRECTIVES
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.88rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>📍 Target Sorting Bin:</span>
                          <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '0.25rem' }}>{analyzedResult.sorting_bin || 'Bin A-1: Upcycling Atelier'}</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>🛠️ Required Pre-Processing:</span>
                          <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '0.25rem' }}>{analyzedResult.preprocessing || 'Cut seams & trim hardware'}</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>⚠️ Handling Safety Warning:</span>
                          <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '0.25rem' }}>{analyzedResult.safety_warning || '🟢 Safe (Standard PPE)'}</div>
                        </div>
                      </div>
                    </div>
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
                      <label>📅 Collection Date</label>
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
                      📥 Commit Batch to Inventory
                    </button>
                    <button type="button" onClick={() => handleDownloadPDF(analyzedResult)} className="btn btn-secondary" style={{ width: 'auto', padding: '0.75rem 1.4rem' }}>
                      📄 Export PDF Report
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

      {/* 5. DEDICATED PAGE: Waste Inventory Management */}
      {currentView === 'inventory' && user && (
        <div>
          <div className="dashboard-title-bar" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>📦 Waste Inventory Management</h2>
              <p className="dashboard-subtitle-text">View and manage all registered textile waste batches.</p>
            </div>
            <button onClick={() => changeView('analysis')} className="btn btn-primary" style={{ width: 'auto' }}>
              ➕ Register New Batch
            </button>
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
                            {b.image_path && (
                              <img 
                                src={`http://localhost:8000${b.image_path}`} 
                                alt="fabric thumbnail" 
                                style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover' }} 
                              />
                            )}
                            <div>
                              <div style={{ fontWeight: 600 }}>{b.fabric_type}</div>
                              <small style={{ color: 'var(--text-muted)' }}>{b.color} • {b.source}</small>
                            </div>
                          </div>
                        </td>
                        <td><span className="tag tag-new">{b.waste_category || 'Recyclable'}</span></td>
                        <td>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{b.recycling_recommendation}</div>
                          <small style={{ color: 'var(--color-primary)', fontSize: '0.75rem' }}>{b.recovery_category}</small>
                        </td>
                        <td><small style={{ color: '#fff' }}>📅 {b.collection_date ? b.collection_date.split('T')[0] : 'Today'}</small></td>
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

      {/* 6. DEDICATED PAGE: Material Classification Engine */}
      {currentView === 'classification' && user && (
        <div>
          <div className="dashboard-title-bar" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>🏷️ Material Classification & Categories</h2>
              <p className="dashboard-subtitle-text">TIPS Dataset Supported Materials & Waste Classification Specs.</p>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="batch-card glass">
              <h3 className="card-title">Supported Materials (TIPS Specification)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '8px' }}>🌱 <strong>Cotton</strong> (Natural)</div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '8px' }}>👖 <strong>Denim</strong> (Natural/Cotton)</div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '8px' }}>🐑 <strong>Wool</strong> (Animal Protein)</div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '8px' }}>✨ <strong>Silk</strong> (Animal Protein)</div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '8px' }}>🌾 <strong>Linen</strong> (Plant Fiber)</div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '8px' }}>🧪 <strong>Polyester</strong> (Synthetic)</div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '8px' }}>🧵 <strong>Nylon</strong> (Synthetic)</div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '8px' }}>🎨 <strong>Rayon</strong> (Semi-Synthetic)</div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '8px' }}>🧶 <strong>Acrylic</strong> (Synthetic)</div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '8px' }}>🔀 <strong>Mixed Fabrics</strong> (Blends)</div>
              </div>
            </div>

            <div className="batch-card glass">
              <h3 className="card-title">Waste Categories Breakdown</h3>
              <div style={{ lineHeight: '1.8', fontSize: '0.9rem' }}>
                <p><span className="tag tag-new">Recyclable</span> High fiber composition suitable for mechanical/chemical reprocessing.</p>
                <p style={{ marginTop: '0.6rem' }}><span className="tag tag-good">Upcyclable</span> High quality scraps optimal for direct fabric reuse and design.</p>
                <p style={{ marginTop: '0.6rem' }}><span className="tag tag-fair">Repairable</span> Moderately worn fabrics suitable for shredding into insulation.</p>
                <p style={{ marginTop: '0.6rem' }}><span className="tag tag-poor">Hazardous</span> Soiled or chemically contaminated items requiring treatment.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. DEDICATED PAGE: Milestone 3 Interactive Sustainability Intelligence & Scoring Engine */}
      {currentView === 'recommendations' && user && (
        <div>
          <div className="dashboard-title-bar" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>♻️ Milestone 3: Interactive Sustainability & Scoring Engines</h2>
              <p className="dashboard-subtitle-text">Interactive 5-Factor Score Simulator & Environmental Impact Calculator.</p>
            </div>
          </div>

          {/* MILESTONE 3 INTERACTIVE ENGINE 9 SIMULATOR */}
          <div className="batch-card glass" style={{ marginBottom: '2rem', padding: '1.8rem', border: '1px solid rgba(84, 214, 155, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
              <div>
                <h3 className="card-title" style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>
                  🧮 Engine 9: Interactive 5-Factor Circularity Score Simulator
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Formula: (0.35 × Recyclability) + (0.20 × Condition) + (0.20 × Reuse) + (0.15 × Env Benefit) + (0.10 × Feasibility)
                </p>
              </div>

              {/* Dynamic Live Score Badge */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: categoryColor }}>{computedCircularity}%</div>
                <span className="tag" style={{ background: categoryColor, color: '#0f172a', fontWeight: 'bold', fontSize: '0.78rem' }}>
                  {computedCategory}
                </span>
              </div>
            </div>

            {/* 5 Live Sliders for 5 Factors */}
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
                  <span style={{ color: '#F59E0B' }}>4. Env Benefit (15%)</span>
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

          {/* MILESTONE 3 INTERACTIVE ENGINE 7 & 8 IMPACT CALCULATOR */}
          <div className="batch-card glass" style={{ marginBottom: '2rem', padding: '1.8rem', border: '1px solid rgba(0, 188, 255, 0.4)' }}>
            <h3 className="card-title" style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem' }}>
              ⚡ Engine 7 & 8: Interactive Environmental Impact Calculator
            </h3>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <label style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Enter Waste Batch Weight (kg):</label>
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
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CO₂ Emissions Offset</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '0.2rem' }}>{(calcWeight * 3.6).toFixed(1)} kg CO₂</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>≈ {((calcWeight * 3.6) / 20).toFixed(1)} trees planted equivalent</div>
              </div>

              <div style={{ background: 'rgba(0, 188, 255, 0.1)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(0, 188, 255, 0.3)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Water Conserved</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#00BCFF', marginTop: '0.2rem' }}>{(calcWeight * 250).toFixed(0)} Liters</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>≈ {((calcWeight * 250) / 150).toFixed(1)} days daily water usage</div>
              </div>

              <div style={{ background: 'rgba(147, 51, 234, 0.1)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(147, 51, 234, 0.3)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Landfill Space Avoided</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#9333EA', marginTop: '0.2rem' }}>{(calcWeight * 0.0035).toFixed(2)} m³</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Diverted from dumpsites</div>
              </div>
            </div>
          </div>

          {/* Section 9 PDF Circularity Categories Card */}
          <div className="batch-card glass" style={{ marginBottom: '2rem' }}>
            <h3 className="card-title">🏷️ Official Circularity Classification Categories</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.88rem' }}>
              <div style={{ background: 'rgba(84, 214, 155, 0.1)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(84, 214, 155, 0.3)' }}>
                <span className="tag tag-score high">Score ≥ 85%</span>
                <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '0.5rem' }}>Excellent Recovery Potential</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Optimal for premium upcycling & direct garment reuse</div>
              </div>

              <div style={{ background: 'rgba(0, 188, 255, 0.1)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(0, 188, 255, 0.3)' }}>
                <span className="tag tag-new">Score 70% – 84%</span>
                <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '0.5rem' }}>High Recovery Potential</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Suitable for mechanical spinning & yarn recovery</div>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <span className="tag tag-fair">Score 50% – 69%</span>
                <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '0.5rem' }}>Moderate Recovery Potential</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Chemical depolymerization or non-woven shredding</div>
              </div>

              <div style={{ background: 'rgba(147, 51, 234, 0.1)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(147, 51, 234, 0.3)' }}>
                <span className="tag tag-poor">Score 30% – 49%</span>
                <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '0.5rem' }}>Limited Recovery Potential</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Industrial rag cutting or insulation padding</div>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <span className="tag tag-danger" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444' }}>Score &lt; 30%</span>
                <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '0.5rem' }}>Disposal Recommended</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Soiled/contaminated items requiring treatment</div>
              </div>
            </div>
          </div>

          <div className="features-grid">
            <div className="feature-card glass">
              <h3>⚙️ Mechanical Recycling</h3>
              <p>Best for 100% natural fibers (Cotton, Wool, Denim). Fabrics are shredded into raw fiber to spin new yarn.</p>
            </div>
            <div className="feature-card glass">
              <h3>🧪 Chemical Recycling</h3>
              <p>Best for synthetic polymers (Polyester, Nylon). Chemical depolymerization recovers pure polyester chips.</p>
            </div>
            <div className="feature-card glass">
              <h3>✂️ Upcycling & Fabric Reuse</h3>
              <p>Best for deadstock and clean production offcuts. Repurposed directly into new fashion garments.</p>
            </div>
          </div>
        </div>
      )}

      {/* 8. DEDICATED PAGE: Reports & Environmental Impact Assessment */}
      {currentView === 'reports' && user && (
        <div>
          <div className="dashboard-title-bar" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>📄 Reports & ESG Environmental Impact</h2>
              <p className="dashboard-subtitle-text">Section 8 & 12 Circular Economy Reports, Carbon Footprint & Landfill Diversion Export.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button onClick={() => alert("Exporting Waste Classification & ESG Metrics as CSV...")} className="btn btn-primary" style={{ width: 'auto' }}>
                📊 Export Excel/CSV
              </button>
              <button onClick={() => alert("Generating Official ESG Environmental Impact Summary...")} className="btn btn-secondary" style={{ width: 'auto' }}>
                🖨️ Export PDF
              </button>
            </div>
          </div>

          <div className="batch-card glass">
            <h3 className="card-title">ESG Sustainability Executive Summary</h3>
            <div style={{ lineHeight: '2' }}>
              <p>📅 <strong>Reporting Milestone:</strong> Milestone 3 — Sustainability Intelligence & Impact</p>
              <p>📦 <strong>Total Logged Batches:</strong> {batches.length} Batches</p>
              <p>⚖️ <strong>Total Weight Recovered:</strong> {totalWeight} kg</p>
              <p>🌱 <strong>Carbon Footprint Offset:</strong> {co2Saved} kg CO₂</p>
              <p>💧 <strong>Water Conserved:</strong> {waterSaved} Liters</p>
              <p>♻️ <strong>Average Circularity Index:</strong> {avgCircularity}% Rating</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
