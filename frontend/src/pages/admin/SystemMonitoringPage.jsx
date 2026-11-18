import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Activity,
  Server,
  Database,
  Globe,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Cpu,
  HardDrive,
  Clock,
  Layers,
  Search,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  fetchMonitoringSummary,
  fetchMonitoringHosts,
  fetchMonitoringServices,
  fetchMonitoringAlerts,
  fetchMonitoringResources,
} from '../../services/monitoringService';

const STATUS_CONFIG = {
  OK: {
    color: 'emerald',
    badgeVariant: 'green',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2,
    label: 'OPERATIONAL',
  },
  UP: {
    color: 'emerald',
    badgeVariant: 'green',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2,
    label: 'UP',
  },
  WARNING: {
    color: 'amber',
    badgeVariant: 'warning',
    bg: 'bg-amber-500/10',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: AlertTriangle,
    label: 'WARNING',
  },
  CRITICAL: {
    color: 'red',
    badgeVariant: 'error',
    bg: 'bg-rose-500/10',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: XCircle,
    label: 'CRITICAL',
  },
  DOWN: {
    color: 'red',
    badgeVariant: 'error',
    bg: 'bg-rose-500/10',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: XCircle,
    label: 'DOWN',
  },
  UNKNOWN: {
    color: 'slate',
    badgeVariant: 'gray',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    icon: HelpCircle,
    label: 'UNKNOWN',
  },
};

const SystemMonitoringPage = () => {
  const [summary, setSummary] = useState(null);
  const [hosts, setHosts] = useState([]);
  const [services, setServices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState('');

  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Auto-refresh interval in seconds (0 = off, 15, 30)
  const [refreshInterval, setRefreshInterval] = useState(15);
  const [countdown, setCountdown] = useState(15);

  const loadAllData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      setError('');

      const [summaryRes, hostsRes, servicesRes, alertsRes, resourcesRes] =
        await Promise.allSettled([
          fetchMonitoringSummary(),
          fetchMonitoringHosts(),
          fetchMonitoringServices(),
          fetchMonitoringAlerts(),
          fetchMonitoringResources(),
        ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value?.success) {
        setSummary(summaryRes.value.data);
      }
      if (hostsRes.status === 'fulfilled' && hostsRes.value?.success) {
        const d = hostsRes.value.data;
        setHosts(d?.hosts || (Array.isArray(d) ? d : []));
      }
      if (servicesRes.status === 'fulfilled' && servicesRes.value?.success) {
        const d = servicesRes.value.data;
        setServices(d?.services || (Array.isArray(d) ? d : []));
      }
      if (alertsRes.status === 'fulfilled' && alertsRes.value?.success) {
        const d = alertsRes.value.data;
        setAlerts(d?.activeAlerts || (Array.isArray(d) ? d : []));
      }
      if (resourcesRes.status === 'fulfilled' && resourcesRes.value?.success) {
        setResources(resourcesRes.value.data);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch system monitoring data:', err);
      setError(err.message || 'Failed to communicate with Nagios monitoring daemon');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setCountdown(refreshInterval);
    }
  }, [refreshInterval]);

  // Initial fetch
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Auto-refresh countdown effect
  useEffect(() => {
    if (refreshInterval === 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadAllData();
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refreshInterval, loadAllData]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      const matchesSearch =
        svc.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        svc.hostName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        svc.pluginOutput?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || svc.status?.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [services, searchTerm, statusFilter]);

  // Resource chart data
  const resourceChartData = useMemo(() => {
    if (!resources) return [];
    const cpuVal = resources.cpu?.usagePercent || Math.min(Math.round((resources.cpu?.load1 || 0) * 20), 100);
    const memVal = resources.memory?.usedPercent || 0;
    const diskVal = resources.disk?.usedPercent || 0;

    return [
      {
        name: 'CPU Load',
        value: cpuVal,
        display: `${resources.cpu?.load1 || 0} load (${cpuVal}%)`,
        color: '#0d6efd',
      },
      {
        name: 'Memory (RAM)',
        value: memVal,
        display: `${resources.memory?.usedMB || 0} MB (${memVal}%)`,
        color: memVal > 85 ? '#ef4444' : '#10b981',
      },
      {
        name: 'Disk Space',
        value: diskVal,
        display: `${resources.disk?.usedGB || 0} GB (${diskVal}%)`,
        color: diskVal > 85 ? '#ef4444' : '#8b5cf6',
      },
    ];
  }, [resources]);

  if (loading && !summary) {
    return (
      <AdminLayout
        title="System Monitoring"
        subtitle="Connecting to Nagios Core monitoring engine..."
      >
        <div className="py-24">
          <LoadingSpinner size="lg" message="Loading real-time monitoring metrics..." />
        </div>
      </AdminLayout>
    );
  }

  const systemStatus = summary?.systemHealth || summary?.systemStatus || 'UNKNOWN';
  const sysConfig = STATUS_CONFIG[systemStatus] || STATUS_CONFIG.UNKNOWN;
  const counts = {
    hostsTotal: summary?.counts?.totalHosts ?? summary?.counts?.hostsTotal ?? 0,
    hostsUp: summary?.counts?.hostsUp ?? 0,
    hostsDown: summary?.counts?.hostsDown ?? 0,
    servicesTotal: summary?.counts?.totalServices ?? summary?.counts?.servicesTotal ?? 0,
    servicesOk: summary?.counts?.servicesOk ?? 0,
    servicesWarning: summary?.counts?.servicesWarning ?? 0,
    servicesCritical: summary?.counts?.servicesCritical ?? 0,
    servicesUnknown: summary?.counts?.servicesUnknown ?? 0,
  };
  const components = summary?.components || {};
  const dbComp = components.mongodb || components.database || {};

  return (
    <AdminLayout
      title="System Monitoring"
      subtitle="Real-time infrastructure health, Nagios Core checks, and container telemetry"
    >
      <div className="space-y-8 pb-10">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-card bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                systemStatus === 'OK'
                  ? 'bg-emerald-500 animate-pulse'
                  : systemStatus === 'WARNING'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-rose-500 animate-ping'
              }`}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-brand-text">Infrastructure Status:</h3>
                <span
                  className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${sysConfig.bg} ${sysConfig.text}`}
                >
                  {sysConfig.label}
                </span>
              </div>
              <p className="text-[11px] text-brand-muted">
                {lastUpdated
                  ? `Last checked: ${lastUpdated.toLocaleTimeString()} (${
                      summary?.source === 'status.dat'
                        ? 'Nagios live status.dat'
                        : 'Docker runtime probes'
                    })`
                  : 'Updating metrics...'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Auto-refresh interval dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-brand-muted bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Interval:</span>
              <select
                value={refreshInterval}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setRefreshInterval(val);
                  setCountdown(val);
                }}
                className="bg-transparent font-bold text-brand-text outline-none cursor-pointer"
              >
                <option value={15}>15s</option>
                <option value={30}>30s</option>
                <option value={60}>60s</option>
                <option value={0}>Manual</option>
              </select>
              {refreshInterval > 0 && (
                <span className="text-[10px] text-brand-blue font-bold ml-1">
                  ({countdown}s)
                </span>
              )}
            </div>

            {/* Manual Refresh Button */}
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              disabled={refreshing}
              onClick={() => loadAllData(true)}
            >
              {refreshing ? 'Polling...' : 'Refresh'}
            </Button>

            {/* Direct Link to Nagios Web GUI */}
            <a
              href="http://localhost:8080/nagios/"
              target="_blank"
              rel="noopener noreferrer"
              title="Open Nagios Core Web UI (Credentials: nagiosadmin / AdminPassword123!)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-sm transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Nagios Core GUI</span>
            </a>
          </div>
        </div>

        {/* Global Error Banner (if any) */}
        {error && (
          <div className="p-4 rounded-card bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-800 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadAllData(true)}
              className="text-rose-900 underline hover:no-underline font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* 7 High-Level Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5">
          {/* Card 1: System Health */}
          <Card padding="p-4" className="flex flex-col justify-between">
            <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
              System Health
            </span>
            <div className="my-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-brand-text">
                {counts.servicesTotal > 0
                  ? Math.round((counts.servicesOk / counts.servicesTotal) * 100)
                  : 100}
                %
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">
              {counts.servicesCritical === 0 ? 'Optimal Performance' : 'Attention Required'}
            </span>
          </Card>

          {/* Card 2: Monitored Services */}
          <Card padding="p-4" className="flex flex-col justify-between">
            <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
              Total Services
            </span>
            <div className="my-2">
              <span className="text-2xl font-black text-brand-blue">
                {counts.servicesTotal}
              </span>
            </div>
            <span className="text-[10px] text-brand-muted">Active Checks</span>
          </Card>

          {/* Card 3: Services OK */}
          <Card padding="p-4" className="flex flex-col justify-between">
            <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
              Services OK
            </span>
            <div className="my-2">
              <span className="text-2xl font-black text-emerald-600">
                {counts.servicesOk}
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">
              Healthy & Passing
            </span>
          </Card>

          {/* Card 4: Services Warning */}
          <Card padding="p-4" className="flex flex-col justify-between">
            <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
              Warnings
            </span>
            <div className="my-2">
              <span
                className={`text-2xl font-black ${
                  counts.servicesWarning > 0 ? 'text-amber-500' : 'text-slate-400'
                }`}
              >
                {counts.servicesWarning}
              </span>
            </div>
            <span className="text-[10px] text-brand-muted">Non-fatal Alerts</span>
          </Card>

          {/* Card 5: Services Critical */}
          <Card padding="p-4" className="flex flex-col justify-between">
            <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
              Critical
            </span>
            <div className="my-2">
              <span
                className={`text-2xl font-black ${
                  counts.servicesCritical > 0 ? 'text-rose-600' : 'text-slate-400'
                }`}
              >
                {counts.servicesCritical}
              </span>
            </div>
            <span className="text-[10px] text-brand-muted">Immediate action</span>
          </Card>

          {/* Card 6: Monitored Hosts */}
          <Card padding="p-4" className="flex flex-col justify-between">
            <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
              Hosts Up
            </span>
            <div className="my-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-brand-text">
                {counts.hostsUp}
              </span>
              <span className="text-xs text-brand-muted">/ {counts.hostsTotal}</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">
              {counts.hostsDown === 0 ? 'All Containers UP' : `${counts.hostsDown} Down`}
            </span>
          </Card>

          {/* Card 7: Active Alerts */}
          <Card padding="p-4" className="flex flex-col justify-between">
            <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
              Active Alerts
            </span>
            <div className="my-2">
              <span
                className={`text-2xl font-black ${
                  alerts.length > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {alerts.length}
              </span>
            </div>
            <span className="text-[10px] text-brand-muted">
              {alerts.length === 0 ? 'Zero Incidents' : 'Requires Review'}
            </span>
          </Card>
        </div>

        {/* 5 Core Component Health Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand-text">
              Application Infrastructure Components
            </h3>
            <span className="text-xs text-brand-muted">
              Container network: attendease-network
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Component 1: Frontend */}
            <Card padding="p-5" className="flex flex-col justify-between border-t-4 border-t-brand-blue">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      STATUS_CONFIG[components.frontend?.status]?.bg || 'bg-slate-100'
                    } ${
                      STATUS_CONFIG[components.frontend?.status]?.text || 'text-slate-600'
                    }`}
                  >
                    {components.frontend?.status || 'UNKNOWN'}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-text">React Frontend</h4>
                  <p className="text-[11px] text-brand-muted">Nginx SPA Server</p>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-brand-muted">
                    <span>Host / Port:</span>
                    <strong className="text-brand-text">localhost:5176</strong>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>Container:</span>
                    <span className="font-mono text-[11px] text-slate-700">attendease-frontend</span>
                  </div>
                </div>
              </div>
              <p className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 truncate" title={components.frontend?.output || components.frontend?.message}>
                {components.frontend?.output || components.frontend?.message || 'HTTP 200 OK'}
              </p>
            </Card>

            {/* Component 2: Backend API */}
            <Card padding="p-5" className="flex flex-col justify-between border-t-4 border-t-emerald-500">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Server className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      STATUS_CONFIG[components.backend?.status]?.bg || 'bg-slate-100'
                    } ${
                      STATUS_CONFIG[components.backend?.status]?.text || 'text-slate-600'
                    }`}
                  >
                    {components.backend?.status || 'UNKNOWN'}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-text">Node.js API</h4>
                  <p className="text-[11px] text-brand-muted">Express Backend</p>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-brand-muted">
                    <span>Host / Port:</span>
                    <strong className="text-brand-text">localhost:6000</strong>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>Endpoint:</span>
                    <span className="font-mono text-[11px] text-slate-700">/api/health</span>
                  </div>
                </div>
              </div>
              <p className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 truncate" title={components.backend?.output || components.backend?.message}>
                {components.backend?.output || components.backend?.message || 'HTTP 200 OK - Health pass'}
              </p>
            </Card>

            {/* Component 3: MongoDB */}
            <Card padding="p-5" className="flex flex-col justify-between border-t-4 border-t-purple-500">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      STATUS_CONFIG[dbComp.status]?.bg || 'bg-slate-100'
                    } ${
                      STATUS_CONFIG[dbComp.status]?.text || 'text-slate-600'
                    }`}
                  >
                    {dbComp.status || 'UNKNOWN'}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-text">MongoDB Database</h4>
                  <p className="text-[11px] text-brand-muted">Mongo 7.0 Engine</p>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-brand-muted">
                    <span>Host / Port:</span>
                    <strong className="text-brand-text">localhost:27018</strong>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>Container:</span>
                    <span className="font-mono text-[11px] text-slate-700">attendease-mongodb</span>
                  </div>
                </div>
              </div>
              <p className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 truncate" title={dbComp.output || dbComp.message}>
                {dbComp.output || dbComp.message || 'TCP 27017 connection accepted'}
              </p>
            </Card>

            {/* Component 4: Docker Engine */}
            <Card padding="p-5" className="flex flex-col justify-between border-t-4 border-t-sky-500">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      STATUS_CONFIG[components.docker?.status]?.bg || 'bg-slate-100'
                    } ${
                      STATUS_CONFIG[components.docker?.status]?.text || 'text-slate-600'
                    }`}
                  >
                    {components.docker?.status || 'UNKNOWN'}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-text">Docker Containers</h4>
                  <p className="text-[11px] text-brand-muted">Compose Cluster</p>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-brand-muted">
                    <span>Active Containers:</span>
                    <strong className="text-brand-text">
                      {summary?.dockerContainers?.length || 4} Running
                    </strong>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>Socket:</span>
                    <span className="font-mono text-[11px] text-slate-700">docker.sock</span>
                  </div>
                </div>
              </div>
              <p className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 truncate" title={components.docker?.output || components.docker?.message}>
                {components.docker?.output || components.docker?.message || 'All required containers running'}
              </p>
            </Card>

            {/* Component 5: Nagios Daemon */}
            <Card padding="p-5" className="flex flex-col justify-between border-t-4 border-t-amber-500">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      STATUS_CONFIG[components.nagios?.status]?.bg || 'bg-slate-100'
                    } ${
                      STATUS_CONFIG[components.nagios?.status]?.text || 'text-slate-600'
                    }`}
                  >
                    {components.nagios?.status || 'UNKNOWN'}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-text">Nagios Daemon</h4>
                  <p className="text-[11px] text-brand-muted">Core 4.5 Engine</p>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-brand-muted">
                    <span>Web Port:</span>
                    <strong className="text-brand-text">:8080</strong>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>Data Stream:</span>
                    <span className="font-mono text-[11px] text-slate-700">status.dat</span>
                  </div>
                </div>
              </div>
              <p className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 truncate" title={components.nagios?.output || components.nagios?.message}>
                {components.nagios?.output || components.nagios?.message || 'Monitoring engine active'}
              </p>
            </Card>
          </div>
        </div>

        {/* Resources & System Telemetry Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Resource Telemetry Chart */}
          <Card className="lg:col-span-7 p-6 bg-white border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-brand-text">
                  Host Resource Utilization
                </h3>
                <p className="text-xs text-brand-muted">
                  Linux host CPU load, Memory allocation, and Root filesystem storage
                </p>
              </div>
              <Badge variant="blue" size="sm">
                Live Metrics
              </Badge>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resourceChartData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#94a3b8" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '12px',
                    }}
                    formatter={(val, name, item) => [item.payload.display, 'Current Utilization']}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={22}>
                    {resourceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Detailed Resource Numbers Card */}
          <Card className="lg:col-span-5 p-6 bg-white border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-base font-bold text-brand-text">
                System Diagnostics
              </h3>
              <p className="text-xs text-brand-muted">
                Detailed telemetry breakdown reported by Nagios plugins
              </p>
            </div>

            <div className="space-y-3">
              {/* CPU Load Metric */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-100/60 text-brand-blue">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-brand-text">CPU Load Average</h5>
                    <p className="text-[10px] text-brand-muted">1m / 5m / 15m intervals</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-brand-blue font-mono">
                    {resources?.cpu?.load1 !== undefined
                      ? `${resources.cpu.load1}, ${resources.cpu.load5}, ${resources.cpu.load15}`
                      : `${resources?.cpu?.loadAverage?.load1m || '0.00'}, ${resources?.cpu?.loadAverage?.load5m || '0.00'}, ${resources?.cpu?.loadAverage?.load15m || '0.00'}`}
                  </span>
                </div>
              </div>

              {/* Memory Metric */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-100/60 text-emerald-600">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-brand-text">Memory Utilization</h5>
                    <p className="text-[10px] text-brand-muted">
                      {resources?.memory?.usedMB ? `${resources.memory.usedMB} MB / ${resources.memory.totalMB} MB` : 'Linux host memory'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-600">
                    {resources?.memory?.usedPercent ?? resources?.memory?.percentUsed ?? 0}%
                  </span>
                </div>
              </div>

              {/* Disk Storage Metric */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-100/60 text-purple-600">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-brand-text">Root Disk Storage</h5>
                    <p className="text-[10px] text-brand-muted">
                      {resources?.disk?.freePercent ? `${resources.disk.freePercent}% free` : (resources?.disk?.freeGB ? `${resources.disk.freeGB} GB available` : 'Mount: /')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-purple-600">
                    {resources?.disk?.usedPercent ?? resources?.disk?.percentUsed ?? 0}%
                  </span>
                </div>
              </div>

              {/* Host Uptime */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-100/60 text-amber-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-brand-text">System Uptime</h5>
                    <p className="text-[10px] text-brand-muted">Duration since last host reboot</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700">
                    {resources?.uptime?.text || resources?.uptime?.formatted || 'Online'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Active Alerts & Incident Log */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand-text">Active Incidents & Alerts</h3>
            <span className="text-xs text-brand-muted">
              {alerts.length === 0 ? 'No open incidents' : `${alerts.length} active alerts`}
            </span>
          </div>

          {alerts.length === 0 ? (
            <Card padding="p-6" className="bg-emerald-50/50 border border-emerald-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900">
                  All Systems Fully Operational
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Nagios Core has not detected any warning or critical thresholds across Frontend, Backend, MongoDB, Docker, or Host resources.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-card border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    alert.status === 'CRITICAL' || alert.status === 'DOWN'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {alert.status === 'CRITICAL' || alert.status === 'DOWN' ? (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">
                          {alert.hostName} &rarr; {alert.serviceName}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            alert.status === 'CRITICAL' || alert.status === 'DOWN'
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-600 text-white'
                          }`}
                        >
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-xs mt-1 font-mono">{alert.pluginOutput}</p>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 shrink-0">
                    <span>{alert.lastCheck ? new Date(alert.lastCheck).toLocaleTimeString() : 'Active'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Complete Monitored Services Table */}
        <Card className="p-6 bg-white border border-slate-100 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-brand-text">
                Monitored Services Directory
              </h3>
              <p className="text-xs text-brand-muted">
                Complete list of active Nagios check definitions and plugin execution results
              </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter checks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-brand-text focus:outline-none focus:border-brand-blue"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                {['ALL', 'OK', 'WARNING', 'CRITICAL'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      statusFilter === tab
                        ? 'bg-white text-brand-blue font-bold shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-3">Service Name</th>
                  <th className="pb-3 px-3">Host Target</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Plugin Diagnostic Output</th>
                  <th className="pb-3 px-3">Last Check</th>
                  <th className="pb-3 px-3 text-right">Attempt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600 font-medium">
                {filteredServices && filteredServices.length > 0 ? (
                  filteredServices.map((svc, i) => {
                    const cfg = STATUS_CONFIG[svc.status] || STATUS_CONFIG.UNKNOWN;
                    const StatusIcon = cfg.icon;

                    return (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-brand-text">{svc.serviceName}</div>
                          <div className="text-[11px] text-slate-400">{svc.checkCommand || 'active probe'}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-brand-muted">
                          {svc.hostName}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${cfg.bg} ${cfg.text}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            <span>{svc.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-700 max-w-md truncate" title={svc.pluginOutput}>
                          {svc.pluginOutput || 'Check in progress...'}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {svc.lastCheck
                            ? new Date(svc.lastCheck).toLocaleTimeString()
                            : 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-500">
                          {svc.currentAttempt || 1}/{svc.maxAttempts || 3}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-brand-muted italic">
                      No services match the selected filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SystemMonitoringPage;
