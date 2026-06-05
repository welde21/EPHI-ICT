/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  FileCheck, 
  PieChart as PieIcon,
  Table as TableIcon
} from "lucide-react";
import { Ticket, TicketCategory, PriorityLevel, TicketStatus } from "../types";
import { EPHI_DEPARTMENTS, EPHI_OFFICERS } from "../data";

interface DashboardViewProps {
  tickets: Ticket[];
  onUpdateTicketStatus: (id: string, status: TicketStatus) => void;
  onDeleteTicket: (id: string) => void;
  onAddTicket: (ticket: Ticket) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Account Management": "#3b82f6",
  "Email": "#6366f1",
  "VPN": "#10b981",
  "Network": "#eab308",
  "Hardware": "#f97316",
  "Software": "#06b6d4",
  "Printer": "#ec4899",
  "Security": "#ef4444",
  "Operating System": "#8b5cf6",
  "Other": "#64748b"
};

const STATUS_COLORS: Record<string, string> = {
  "Open": "#f59e0b",
  "Partially Resolved": "#2563eb",
  "Closed": "#10b981",
  "Escalated": "#ef4444"
};

const PRIORITY_BADGES: Record<string, string> = {
  "Low": "bg-slate-100 text-slate-800 border-slate-200",
  "Medium": "bg-blue-50 text-blue-800 border-blue-200",
  "High": "bg-amber-50 text-amber-800 border-amber-200",
  "Critical": "bg-rose-50 text-rose-800 border-rose-200 font-bold"
};

const STATUS_BADGES: Record<string, string> = {
  "Open": "bg-amber-50 text-amber-700 border-amber-200",
  "Partially Resolved": "bg-blue-50 text-blue-700 border-blue-200",
  "Closed": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Escalated": "bg-rose-50 text-rose-700 border-rose-200"
};

export default function DashboardView({ 
  tickets, 
  onUpdateTicketStatus, 
  onDeleteTicket,
  onAddTicket
}: DashboardViewProps) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // New Ticket Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState({
    userName: "",
    department: EPHI_DEPARTMENTS[0],
    location: "",
    deviceType: "",
    systemAffected: "",
    category: "Account Management" as TicketCategory,
    priority: "Medium" as PriorityLevel,
    description: "",
    rootCause: "",
    actionsTaken: "",
    status: "Open" as TicketStatus,
    supportOfficer: EPHI_OFFICERS[0],
    timeSpentMinutes: 30
  });

  // Calculate high-level KPIs
  const kpis = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === "Open").length;
    const closed = tickets.filter(t => t.status === "Closed").length;
    const escalated = tickets.filter(t => t.status === "Escalated").length;
    const partially = tickets.filter(t => t.status === "Partially Resolved").length;
    const critical = tickets.filter(t => t.priority === "Critical" && t.status !== "Closed").length;
    
    const closedTickets = tickets.filter(t => t.status === "Closed");
    const avgTime = closedTickets.length > 0
      ? Math.round(closedTickets.reduce((acc, curr) => acc + curr.timeSpentMinutes, 0) / closedTickets.length)
      : 0;

    return { total, open, closed, escalated, partially, critical, avgTime };
  }, [tickets]);

  // Transform ticket database for Recharts - Category Count
  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return Object.keys(counts).map(cat => ({
      name: cat,
      volume: counts[cat],
      fill: CATEGORY_COLORS[cat] || "#4f46e5"
    }));
  }, [tickets]);

  // Transform ticket database for Recharts - Status Count
  const statusChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(t => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return Object.keys(counts).map(status => ({
      name: status,
      value: counts[status]
    }));
  }, [tickets]);

  // Transforming dates to chronological array
  const trendChartData = useMemo(() => {
    const daily: Record<string, number> = {};
    // Seed recent days so chart looks balanced
    const days = ["2026-06-01", "2026-06-02", "2026-06-03", "2026-06-04", "2026-06-05"];
    days.forEach(d => { daily[d] = 0; });

    tickets.forEach(t => {
      if (t.date) {
        daily[t.date] = (daily[t.date] || 0) + 1;
      }
    });

    return Object.keys(daily).sort().map(date => ({
      date: date.substring(5), // Just MM-DD
      "New Incidents": daily[date]
    }));
  }, [tickets]);

  // Filter tickets matching inputs
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchSearch = 
        t.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.systemAffected.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.rootCause.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = categoryFilter === "All" || t.category === categoryFilter;
      const matchPriority = priorityFilter === "All" || t.priority === priorityFilter;
      const matchStatus = statusFilter === "All" || t.status === statusFilter;

      return matchSearch && matchCategory && matchPriority && matchStatus;
    });
  }, [tickets, searchTerm, categoryFilter, priorityFilter, statusFilter]);

  // Handles manual ticket creation submission
  const handleSubmitManualTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const randomID = "EPHI-INC-" + Math.floor(1000 + Math.random() * 9000);
    const currentDate = new Date().toISOString().split('T')[0];

    const completed: Ticket = {
      id: randomID,
      date: currentDate,
      ...formState,
      timeSpentMinutes: Number(formState.timeSpentMinutes)
    };

    onAddTicket(completed);
    setIsModalOpen(false);
    // Reset form
    setFormState({
      userName: "",
      department: EPHI_DEPARTMENTS[0],
      location: "",
      deviceType: "",
      systemAffected: "",
      category: "Account Management",
      priority: "Medium",
      description: "",
      rootCause: "",
      actionsTaken: "",
      status: "Open",
      supportOfficer: EPHI_OFFICERS[0],
      timeSpentMinutes: 30
    });
  };

  return (
    <div className="space-y-8" id="dashboard-container">
      {/* KPI Stats Widgets Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4" id="kpi-ribbon">
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-2xs flex flex-col justify-between text-left">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Total Incidents</span>
          <span className="text-2xl font-extrabold text-slate-800">{kpis.total}</span>
          <span className="text-[10px] text-slate-400 mt-1">Cumulated logs</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-2xs flex flex-col justify-between text-left">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider block">Active Open</span>
          <span className="text-2xl font-extrabold text-amber-600">{kpis.open}</span>
          <span className="text-[10px] text-slate-400 mt-1">Requiring immediate action</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-2xs flex flex-col justify-between text-left">
          <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-wider block">Closed & Fixed</span>
          <span className="text-2xl font-extrabold text-emerald-600">{kpis.closed}</span>
          <span className="text-[10px] text-slate-400 mt-1">Fixed and signed-off</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-2xs flex flex-col justify-between text-left">
          <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-wider block">Escalated Logs</span>
          <span className="text-2xl font-extrabold text-rose-600">{kpis.escalated}</span>
          <span className="text-[10px] text-slate-400 mt-1">Forwarded to expert teams</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-2xs flex flex-col justify-between text-left">
          <span className="text-[10px] font-mono font-bold text-rose-600 uppercase tracking-wider block">Active Critical</span>
          <span className="text-2xl font-extrabold text-rose-700 font-black animate-pulse">{kpis.critical}</span>
          <span className="text-[10px] text-slate-400 mt-1">Non-fixed priority issues</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-2xs flex flex-col justify-between text-left">
          <span className="text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-wider block">Avg Fix Time No.</span>
          <span className="text-2xl font-extrabold text-indigo-600">{kpis.avgTime}m</span>
          <span className="text-[10px] text-slate-400 mt-1">On closed incidents</span>
        </div>
      </div>

      {/* Recharts Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-visual-charts">
        {/* Incident Volume by Category Chart (Col span 7) */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4 text-left">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-slate-500" />
              Incident Categories Operational Distribution
            </h3>
            <p className="text-[11px] text-slate-400">Total volume grouped by specific support taxonomy</p>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: "#0f172a", border: "none", borderRadius: "8px", color: "#fff", fontSize: "11px" }}
                />
                <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incidents Status Ratio Chart & Trends (Col span 4) */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between text-left space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Status & Volume Trend</h3>
            <p className="text-[11px] text-slate-400">Weekly resolution distribution and entry volume</p>
          </div>
          
          {/* Status Breakdown Indicators */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Resolution Status Ratios</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(STATUS_COLORS).map((status) => {
                const count = tickets.filter(t => t.status === status).length;
                const pct = tickets.length > 0 ? Math.round((count / tickets.length) * 100) : 0;
                return (
                  <div key={status} className="p-2 border border-slate-100 rounded-lg bg-slate-50/50">
                    <span className="text-[10px] text-slate-550 block font-medium">{status}</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-md font-bold text-slate-800">{count}</span>
                      <span className="text-[10px] text-slate-400">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sparkline creation trend */}
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "none", color: "#fff", fontSize: "10px" }} />
                <Line type="monotone" dataKey="New Incidents" stroke="#4f46e5" strokeWidth={2.5} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Search and Filters Strip */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs text-left space-y-3" id="filters-ribbon">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <TableIcon className="w-4 h-4 text-slate-500" />
              EPHI ICT Incident Ledger
            </h3>
            <p className="text-[11px] text-slate-400">Step 5 Ledger: Fully qualified Support logs detailing activity, priority, root causes and metrics</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="self-start md:self-auto bg-slate-900 hover:bg-slate-800 border border-slate-850 text-white font-bold text-xs py-2 px-3.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Incident Manual File
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50/50 p-3 rounded-lg border border-slate-150/40">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, system, or ID..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-8.5 pr-3 py-1.5 text-xs outline-none focus:border-slate-400 text-slate-800 placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-slate-400 text-slate-700"
            >
              <option value="All">All Categories</option>
              <option value="Account Management">Account Management</option>
              <option value="Email">Email</option>
              <option value="VPN">VPN</option>
              <option value="Network">Network</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Printer">Printer</option>
              <option value="Security">Security</option>
              <option value="Operating System">Operating System</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-slate-400 text-slate-700"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-slate-400 text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Partially Resolved">Partially Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Escalated">Escalated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incident table list */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden" id="incidents-table-panel">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[1000px]">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Problem taxonomy</th>
                <th className="py-3 px-4">Diagnostics Root Cause</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Officer/Time</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    {/* ID */}
                    <td className="py-4 px-4 font-mono font-bold text-slate-800">
                      {t.id}
                    </td>
                    
                    {/* Date */}
                    <td className="py-4 px-4 text-slate-500 font-mono whitespace-nowrap">
                      {t.date}
                    </td>

                    {/* User, Department, Location */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-850">{t.userName}</p>
                        <p className="text-[10px] text-slate-450">{t.department}</p>
                        <p className="text-[10px] text-slate-400 italic">Loc: {t.location}</p>
                      </div>
                    </td>

                    {/* Taxonomy Category, Device, system */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] font-medium"
                          style={{ background: `${CATEGORY_COLORS[t.category] || "#e2e8f0"}1a`, color: CATEGORY_COLORS[t.category] || "#4f46e5" }}
                        >
                          {t.category}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          <p>Sys: <span className="font-semibold text-slate-700">{t.systemAffected}</span></p>
                          <p>Dev: {t.deviceType}</p>
                        </div>
                      </div>
                    </td>

                    {/* Root cause and actions taken */}
                    <td className="py-4 px-4 max-w-[280px]">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-800 leading-snug truncate" title={t.description}>
                          {t.description}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          <strong className="text-slate-600 font-sans">Root:</strong> {t.rootCause || "Diagnosing"}
                        </p>
                        <p className="text-[10px] text-indigo-650">
                          <strong className="text-slate-600 font-sans">Action:</strong> {t.actionsTaken || "TBD"}
                        </p>
                        {t.status === "Escalated" && (
                          <p className="text-[10px] text-rose-600 font-medium font-mono">
                            &rarr; Escalated Team: {t.escalationTeam || "General Staff"}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Priority and Status badges */}
                    <td className="py-4 px-4">
                      <div className="space-y-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border inline-block ${PRIORITY_BADGES[t.priority] || PRIORITY_BADGES.Medium}`}>
                          Priority: {t.priority}
                        </span>
                        
                        <div>
                          {/* Live inline status modifier */}
                          <select
                            value={t.status}
                            onChange={(e) => onUpdateTicketStatus(t.id, e.target.value as TicketStatus)}
                            className={`px-1.5 py-0.5 rounded border text-[10px] font-medium shrink-0 outline-none cursor-pointer ${STATUS_BADGES[t.status] || STATUS_BADGES.Open}`}
                          >
                            <option value="Open">Open</option>
                            <option value="Partially Resolved">Partially Resolved</option>
                            <option value="Closed">Closed</option>
                            <option value="Escalated">Escalated</option>
                          </select>
                        </div>
                      </div>
                    </td>

                    {/* Support Officer & Time parameters */}
                    <td className="py-4 px-4 font-mono text-[11px] text-slate-600">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold font-sans text-slate-750 block">{t.supportOfficer}</span>
                        <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Time: {t.timeSpentMinutes} mins
                        </span>
                      </div>
                    </td>

                    {/* Delete action */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete incident log ${t.id}?`)) {
                            onDeleteTicket(t.id);
                          }
                        }}
                        className="p-1 px-2 hover:bg-rose-50 text-rose-500 rounded border border-transparent hover:border-rose-100 cursor-pointer transition-all"
                        title="Delete ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <AlertTriangle className="w-8 h-8 text-slate-350 mx-auto mb-2 animate-bounce" />
                    No support parameters map to the current filter specifications.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW MANUAL TICKET FORM MODAL COMPONENT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-left" id="ticket-modal-overlay">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-4 justify-between flex items-center rounded-t-2xl">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Initialize EPHI ICT Incident Support Certificate
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitManualTicket} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">User Full Name</label>
                  <input 
                    type="text" required
                    value={formState.userName}
                    onChange={(e) => setFormState({ ...formState, userName: e.target.value })}
                    placeholder="e.g. Dr. Abebe"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-slate-400 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Department</label>
                  <select
                    value={formState.department}
                    onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-slate-400"
                  >
                    {EPHI_DEPARTMENTS.map((d, i) => (
                      <option key={i} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Room / Location</label>
                  <input 
                    type="text" required
                    value={formState.location}
                    onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                    placeholder="e.g. Block C, Room 10"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Device Type</label>
                  <input 
                    type="text" required
                    value={formState.deviceType}
                    onChange={(e) => setFormState({ ...formState, deviceType: e.target.value })}
                    placeholder="e.g. HP Workstation / Switch"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">System Affected</label>
                  <input 
                    type="text" required
                    value={formState.systemAffected}
                    onChange={(e) => setFormState({ ...formState, systemAffected: e.target.value })}
                    placeholder="e.g. Active Directory / Internet Web proxy"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Category Classification</label>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value as TicketCategory })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-slate-400"
                  >
                    <option value="Account Management">Account Management</option>
                    <option value="Email">Email</option>
                    <option value="VPN">VPN</option>
                    <option value="Network">Network</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Printer">Printer</option>
                    <option value="Security">Security</option>
                    <option value="Operating System">Operating System</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Priority Level</label>
                  <select
                    value={formState.priority}
                    onChange={(e) => setFormState({ ...formState, priority: e.target.value as PriorityLevel })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-slate-400 font-semibold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Support Officer Assigned</label>
                  <select
                    value={formState.supportOfficer}
                    onChange={(e) => setFormState({ ...formState, supportOfficer: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-slate-400"
                  >
                    {EPHI_OFFICERS.map((o, idx) => (
                      <option key={idx} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Diagnostics Time spent (Min)</label>
                  <input 
                    type="number" required
                    value={formState.timeSpentMinutes}
                    onChange={(e) => setFormState({ ...formState, timeSpentMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-slate-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Incident Description</label>
                <textarea 
                  rows={2} required
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Summarize the core technical issue..."
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-slate-400 resize-none font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Root Cause Investigation</label>
                <textarea 
                  rows={2}
                  value={formState.rootCause}
                  onChange={(e) => setFormState({ ...formState, rootCause: e.target.value })}
                  placeholder="Root cause identified during examination..."
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-slate-400 resize-none font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Actions Conducted</label>
                <textarea 
                  rows={2}
                  value={formState.actionsTaken}
                  onChange={(e) => setFormState({ ...formState, actionsTaken: e.target.value })}
                  placeholder="Resolution procedures taken to restore node..."
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-slate-400 resize-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pb-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Resolution Status</label>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value as TicketStatus })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-slate-400"
                  >
                    <option value="Open">Open</option>
                    <option value="Partially Resolved">Partially Resolved</option>
                    <option value="Closed">Closed</option>
                    <option value="Escalated">Escalated</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition-colors text-center"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition-colors text-center"
                  >
                    Save File
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
