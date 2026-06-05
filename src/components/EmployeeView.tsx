/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { 
  Users, 
  Award, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Percent
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { Ticket, Employee } from "../types";
import { EPHI_OFFICERS } from "../data";

interface EmployeeViewProps {
  tickets: Ticket[];
}

export default function EmployeeView({ tickets }: EmployeeViewProps) {
  // Compute Employee metrics dynamically based on the current ticket database
  const employeeMetrics = useMemo(() => {
    return EPHI_OFFICERS.map((name): Employee => {
      // Find all tickets assigned to this officer
      const assignedTickets = tickets.filter(t => t.supportOfficer === name);
      const assigned = assignedTickets.length;
      const resolved = assignedTickets.filter(t => t.status === "Closed").length;
      const pending = assignedTickets.filter(t => t.status === "Open" || t.status === "Partially Resolved").length;
      const escalated = assignedTickets.filter(t => t.status === "Escalated").length;

      // Extract closure times
      const closedTickets = assignedTickets.filter(t => t.status === "Closed");
      const averageResolutionTimeMin = closedTickets.length > 0
        ? Math.round(closedTickets.reduce((acc, curr) => acc + curr.timeSpentMinutes, 0) / closedTickets.length)
        : 25; // Default reference weight

      return {
        name,
        assigned,
        resolved,
        pending,
        escalated,
        averageResolutionTimeMin
      };
    });
  }, [tickets]);

  // Calculated dynamic rows for the table representation
  const renderedEmployees = useMemo(() => {
    return employeeMetrics.map(emp => {
      // 1. Resolution Rate %
      const rate = emp.assigned > 0 ? Math.round((emp.resolved / emp.assigned) * 100) : 0;
      
      // 2. Productivity Score (out of 100)
      // Normalizes: High resolution rate is good, more total tickets resolved is good, faster average times are good.
      const ticketFactor = Math.min(40, emp.resolved * 6); // Up to 40 pts for volume resolved
      const rateFactor = rate * 0.4; // Up to 40 pts for resolution rate
      const timeFactor = Math.max(0, Math.min(20, (60 - emp.averageResolutionTimeMin) * 0.4)); // Up to 20 pts for speed
      const prodScore = Math.min(100, Math.max(15, Math.round(ticketFactor + rateFactor + timeFactor)));

      return {
        ...emp,
        resolutionRate: rate,
        productivityScore: prodScore
      };
    });
  }, [employeeMetrics]);

  // Sort employees to select high performers
  const topPerformer = useMemo(() => {
    if (renderedEmployees.length === 0) return null;
    return [...renderedEmployees].sort((a, b) => b.productivityScore - a.productivityScore)[0];
  }, [renderedEmployees]);

  // Aggregate metrics
  const aggregateMetrics = useMemo(() => {
    const totalAssigned = renderedEmployees.reduce((acc, curr) => acc + curr.assigned, 0);
    const totalResolved = renderedEmployees.reduce((acc, curr) => acc + curr.resolved, 0);
    const overallRate = totalAssigned > 0 ? Math.round((totalResolved / totalAssigned) * 100) : 0;
    const avgVelocity = Math.round(renderedEmployees.reduce((acc, curr) => acc + curr.averageResolutionTimeMin, 0) / renderedEmployees.length);

    return { overallRate, avgVelocity };
  }, [renderedEmployees]);

  // Prepare radar chart data for Recharts comparison
  const chatCompareData = useMemo(() => {
    return renderedEmployees.map(emp => ({
      name: emp.name.split(" ")[0], // Just first name for visual spacing
      "Productivity Score": emp.productivityScore,
      "Resolution Rate %": emp.resolutionRate,
      "Avg Repair Speed (min)": emp.averageResolutionTimeMin
    }));
  }, [renderedEmployees]);

  return (
    <div className="space-y-6" id="employees-dashboard">
      {/* Dynamic Summary Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="employees-kpis">
        {/* Spotlight top support agent */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border border-slate-800 rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden flex items-start gap-4 text-left">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-lg shrink-0 border border-amber-500/10">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest">EPHI Weekly Spotlight</span>
            <h3 className="text-md font-bold text-white mt-1">
              {topPerformer ? topPerformer.name : "Abebe Kebede"}
            </h3>
            <p className="text-xs text-slate-300 leading-normal mt-1">
              Top technical resolver with a Productivity Score of <strong>{topPerformer ? topPerformer.productivityScore : "85"}/100</strong>.
            </p>
            <div className="flex gap-4 mt-3 pt-2 text-[11px] border-t border-indigo-950/60 font-mono">
              <div>
                <span className="text-slate-400 block">Rate</span>
                <span className="font-bold text-green-400">{topPerformer ? topPerformer.resolutionRate : "100"}%</span>
              </div>
              <div>
                <span className="text-slate-400 block">Avg Time</span>
                <span className="font-bold text-slate-200">{topPerformer ? topPerformer.averageResolutionTimeMin : "20"}m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Aggregate Rate */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-3xs flex items-start gap-4 text-left">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Mean Organization Rate</span>
            <p className="text-2xl font-black text-slate-800">{aggregateMetrics.overallRate}%</p>
            <p className="text-xs text-slate-500">
              Surfaces overall team efficiency metrics relative to new logs.
            </p>
          </div>
        </div>

        {/* Global SLA Velocity */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-3xs flex items-start gap-4 text-left">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Average SLA Target Velocity</span>
            <p className="text-2xl font-black text-slate-800">{aggregateMetrics.avgVelocity} Minutes</p>
            <p className="text-xs text-slate-500">
              SLA commitments require resolution inside 45m.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Visual Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="employees-visual-charts">
        {/* Radar / Comparison Bar chart - 7 cols */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4 text-left">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Support Load Activity & Throughput</h3>
            <p className="text-[11px] text-slate-400">Total assigned burden vs resolved logs by operator</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={renderedEmployees} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "none", color: "#fff", fontSize: "11px" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "10px" }} />
                <Bar name="Assigned Burden" dataKey="assigned" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar name="Resolved Tickets" dataKey="resolved" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar name="Escalated Outside" dataKey="escalated" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employee Intelligence Radar Comparison - 5 cols */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between text-left space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Productivity Index Comparison</h3>
            <p className="text-[11px] text-slate-400">Holistic rating matching speed, throughput, and closure rate</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chatCompareData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={9} stroke="#94a3b8" />
                <Radar name="Productivity Index" dataKey="Productivity Score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                <Radar name="Resolution %" dataKey="Resolution Rate %" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "6px" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Staff Ledger Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden text-left" id="employee-table-panel">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-500" />
              EPHI ICT Support Force Ledger
            </h3>
            <p className="text-[11px] text-slate-400">Dynamic workload metrics derived straight from active database</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-mono text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4 text-center">Assigned Tickets</th>
                <th className="py-3 px-4 text-center">Resolved Closed</th>
                <th className="py-3 px-4 text-center">Pending Active</th>
                <th className="py-3 px-4 text-center">Escalated Outside</th>
                <th className="py-3 px-4 text-center">SLA Avg Fix Speed</th>
                <th className="py-3 px-4 text-center">Resolution Rate</th>
                <th className="py-3 px-4 text-center">Productivity Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {renderedEmployees.map((emp) => (
                <tr key={emp.name} className="hover:bg-slate-50/50">
                  {/* Name */}
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {emp.name}
                  </td>
                  
                  {/* Assigned */}
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                    {emp.assigned}
                  </td>

                  {/* Resolved */}
                  <td className="py-3.5 px-4 text-center font-mono text-emerald-600 font-bold">
                    {emp.resolved}
                  </td>

                  {/* Pending */}
                  <td className="py-3.5 px-4 text-center font-mono text-amber-600 font-semibold">
                    {emp.pending}
                  </td>

                  {/* Escalated */}
                  <td className="py-3.5 px-4 text-center font-mono text-rose-600 font-medium">
                    {emp.escalated}
                  </td>

                  {/* SLA Speed */}
                  <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {emp.averageResolutionTimeMin} mins
                    </span>
                  </td>

                  {/* Resolution Rate */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-bold text-slate-750 font-mono">{emp.resolutionRate}%</span>
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0 hidden sm:block">
                        <div 
                          className={`h-full rounded-full ${
                            emp.resolutionRate > 80 
                              ? "bg-emerald-500" 
                              : emp.resolutionRate > 50 
                              ? "bg-blue-500" 
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${emp.resolutionRate}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Productivity Quotient */}
                  <td className="py-3.5 px-4 text-center font-mono">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-100">
                      <Award className="w-3.5 h-3.5 text-indigo-500" />
                      {emp.productivityScore} / 100
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
