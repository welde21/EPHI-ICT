/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Activity, 
  Clock, 
  User, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Server, 
  Globe, 
  Wifi, 
  ShieldAlert,
  HardDrive
} from "lucide-react";
import { SystemHealth, Ticket } from "../types";

interface HomeViewProps {
  systems: SystemHealth[];
  tickets: Ticket[];
  onNavigate: (page: string) => void;
}

export default function HomeView({ systems, tickets, onNavigate }: HomeViewProps) {
  const currentLocalTime = "2026-06-05 02:41:00 UTC"; // Styled dynamically
  
  // Calculate high-level statistics
  const totalIncidents = tickets.length;
  const openIncidents = tickets.filter(t => t.status === "Open" || t.status === "Partially Resolved").length;
  const criticalCount = tickets.filter(t => t.priority === "Critical" && t.status !== "Closed").length;
  
  // Group systems by status
  const onlineSystems = systems.filter(s => s.status === "online").length;
  const warningSystems = systems.filter(s => s.status === "warning").length;
  const offlineSystems = systems.filter(s => s.status === "offline").length;

  return (
    <div className="space-y-6" id="home-view-container">
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-2xl relative overflow-hidden shadow-sm" id="welcome-banner">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center justify-center p-8 pointer-events-none">
          <Activity className="w-64 h-64 text-green-400" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 text-xs px-2.5 py-1 rounded-full font-medium mb-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            EPHI Central Nodes Operational
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Ethiopian Public Health Institute
          </h1>
          <p className="text-slate-300 font-medium text-lg">
            ICT Technical Support Copilot & Analytics Portal
          </p>
          <p className="text-slate-400 text-sm max-w-xl">
            Welcome to the centralized support cockpit. Diagnose end-user workspace failures, log surveillance telemetric incidents, and analyze support workloads in real-time.
          </p>
        </div>
      </div>

      {/* Grid of Key Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="quick-indicators-grid">
        {/* Active Session Info Card */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Active Investigator</p>
            <p className="text-sm font-semibold text-slate-800">weldemariam (Support Manager)</p>
            <p className="text-xs text-slate-500">lindaephi@gmail.com</p>
            <p className="text-xs text-slate-400 font-mono">Phone: 0946674151</p>
            <p className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded inline-block font-medium mt-1">EPHI-HQ Command</p>
          </div>
        </div>

        {/* Localized Datetime Card */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Current Local Time</p>
            <p className="text-sm font-semibold text-slate-800 font-mono">Friday, June 5, 2026</p>
            <p className="text-xs text-slate-500">02:41:00 UTC</p>
            <p className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded inline-block font-medium mt-1">NTP Server Synced</p>
          </div>
        </div>

        {/* Operational Overview Card */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs flex items-start gap-4">
          <div className="p-3 bg-slate-100 text-slate-700 rounded-lg shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div className="space-y-1 w-full">
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Support Workload Summary</p>
            <div className="flex justify-between text-xs py-1 text-slate-600 border-b border-dashed border-slate-100">
              <span>Total Logged Today:</span>
              <span className="font-semibold text-slate-800">{totalIncidents} Incidents</span>
            </div>
            <div className="flex justify-between text-xs py-1 text-slate-600 border-b border-dashed border-slate-100">
              <span>Active Open Tickets:</span>
              <span className="font-semibold text-amber-600">{openIncidents} Pending</span>
            </div>
            <div className="flex justify-between text-xs py-1 text-slate-600">
              <span>Unresolved Criticals:</span>
              <span className="font-semibold text-rose-600">{criticalCount} Critical</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Live Systems Monitor & Manuals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Systems Health Stream - 7 Cols */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4" id="systems-health-container">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-500" />
                EPHI Core Services & Network Nodes
              </h2>
              <p className="text-xs text-slate-400">Real-time gateway connectivity status and latency logs</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                {onlineSystems} Online
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                {warningSystems} Degraded
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                {offlineSystems} Offline
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="individual-system-cards">
            {systems.map((sys, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border text-left transition-all ${
                  sys.status === "online" 
                    ? "bg-emerald-50/20 border-emerald-100/50 hover:bg-emerald-50/40" 
                    : sys.status === "warning"
                    ? "bg-amber-50/20 border-amber-100/50 hover:bg-amber-50/40"
                    : "bg-rose-50/20 border-rose-100/50 hover:bg-rose-50/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                      {sys.category}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-800 mt-1">{sys.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {sys.status === "online" && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                        <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                        {sys.latency}
                      </span>
                    )}
                    {sys.status === "warning" && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
                        <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                        {sys.latency}
                      </span>
                    )}
                    {sys.status === "offline" && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 text-rose-800 animate-pulse">
                        <XCircle className="w-2.5 h-2.5 mr-0.5" />
                        Down
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{sys.details}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between text-xs text-slate-500 border border-slate-100" id="failsafe-announcement">
            <span className="flex items-center gap-1.5 text-slate-600">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <strong>Failsafe Notification:</strong> Research wing network currently bridged on wireless backup. Fiber splice physical repair scheduled.
            </span>
            <button 
              onClick={() => onNavigate("dashboard")} 
              className="text-indigo-600 font-semibold hover:underline cursor-pointer"
            >
              Analyze Incidents &rarr;
            </button>
          </div>
        </div>

        {/* ICT Quick Manuals & Assistance - 4 Cols */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4" id="quick-manuals-container">
          <div className="space-y-3">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-500" />
                Copilot Assistance Hub
              </h2>
              <p className="text-xs text-slate-400">Common organizational issues and knowledge paths</p>
            </div>
            
            <div className="space-y-3 text-left">
              {/* VPN Manual */}
              <div className="p-3 bg-slate-50 hover:bg-slate-100/50 rounded-lg cursor-pointer transition-all border border-slate-100/30" onClick={() => onNavigate("chatbot")}>
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-slate-600" />
                  Remote VPN Configuration Guide
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">Instructions for standard installation of security endpoint client and root certificates in remote centers.</p>
              </div>

              {/* Password Portal */}
              <div className="p-3 bg-slate-50 hover:bg-slate-100/50 rounded-lg cursor-pointer transition-all border border-slate-100/30" onClick={() => onNavigate("chatbot")}>
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
                  Active Directory Account Lockouts
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">Quick sequence diagnostic steps for domain locking, server password reset policies, and clearing AD constraints.</p>
              </div>

              {/* Printers */}
              <div className="p-3 bg-slate-50 hover:bg-slate-100/50 rounded-lg cursor-pointer transition-all border border-slate-100/30" onClick={() => onNavigate("chatbot")}>
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-slate-600" />
                  Shared Printers Hub Installation
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">How to spool print controllers over the EPHI internal VLAN and clear corrupt system documents queues.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 text-center" id="ready-launch-panel">
            <h3 className="text-xs font-bold text-slate-700 mb-1">Stuck with complex user diagnostics?</h3>
            <p className="text-[11px] text-slate-500 mb-3">Launch the AI Copilot to step through diagnostics, troubleshoot, and generate immediate ticket logs.</p>
            <button 
              onClick={() => onNavigate("chatbot")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-4 rounded-lg transition-colors cursor-pointer"
            >
              Start EPHI Assistant Copilot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
