import { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Server,
  Activity,
  Globe,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  User,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function SettingsAdmin() {
  const { admin, logout } = useAuth();
  const [healthStatus, setHealthStatus] = useState(null);
  const [pinging, setPinging] = useState(false);
  const [latency, setLatency] = useState(null);

  const checkHealth = async () => {
    setPinging(true);
    const start = performance.now();
    try {
      const res = await api.get('/health');
      const end = performance.now();
      setLatency(Math.round(end - start));
      setHealthStatus(res.data);
    } catch {
      setHealthStatus({ success: false, message: 'Backend unreachable' });
    } finally {
      setPinging(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="text-[#E90075]" size={26} />
          System Settings & Profile
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage administrator account information, review security policies, and monitor backend API connectivity
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Admin Profile & Security Configuration */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Admin Profile Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E90075] to-purple-600 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                  {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{admin?.name || 'Administrator'}</h2>
                  <p className="text-xs text-slate-500">{admin?.email}</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-600 border border-pink-100">
                Active Admin
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">Role</span>
                <span className="text-slate-800 font-bold text-sm mt-0.5 block capitalize">
                  {admin?.role || 'admin'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">Authentication Method</span>
                <span className="text-slate-800 font-bold text-sm mt-0.5 block">
                  JWT + HttpOnly Cookie / Bearer
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>Log Out of Session</span>
              </button>
            </div>
          </div>

          {/* Security & PII Protection Policies */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600" />
              Data Security & Encryption Status
            </h3>
            
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">Aadhaar Card Encryption (AES-256-GCM)</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Staff Aadhaar numbers are stored exclusively as authenticated encrypted cipher strings and never in plaintext.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px] shrink-0">
                  ACTIVE
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">Zero Public Exposure</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Staff data APIs are completely isolated from public endpoints and protected by JWT verification.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px] shrink-0">
                  ENFORCED
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Backend Health & Domains */}
        <div className="space-y-6">
          
          {/* Backend Connectivity Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Server size={16} className="text-[#E90075]" />
                API Connectivity
              </h3>
              <button
                onClick={checkHealth}
                disabled={pinging}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Ping backend"
              >
                <RefreshCw size={14} className={pinging ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">API Status:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                  <CheckCircle2 size={13} />
                  <span>{healthStatus?.message || 'Healthy'}</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Database:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {healthStatus?.database || 'Connected'}
                </span>
              </div>

              {latency !== null && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Latency:</span>
                  <span className="font-mono text-slate-700">{latency} ms</span>
                </div>
              )}
            </div>
          </div>

          {/* Official Domains */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Globe size={16} className="text-blue-500" />
              Connected Domains
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Primary Website</span>
                <span className="text-slate-800 font-semibold">https://reeyanshayacare.in</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Admin Dashboard</span>
                <span className="text-slate-800 font-semibold">https://admin.reeyanshayacare.in</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Backend API</span>
                <span className="text-slate-800 font-semibold">https://aaya.onrender.com</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

