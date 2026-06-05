/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  FileText, 
  Lightbulb, 
  ShieldAlert, 
  Wrench, 
  GraduationCap, 
  Printer, 
  ArrowRight,
  Printer as PrintIcon,
  BookOpen,
  TrendingUp,
  Sliders,
  DollarSign
} from "lucide-react";
import { Ticket } from "../types";

interface RecommendationsViewProps {
  tickets: Ticket[];
}

export default function RecommendationsView({ tickets }: RecommendationsViewProps) {
  const [selectedReportType, setSelectedReportType] = useState<"daily" | "weekly" | "monthly">("daily");

  // Filter aggregate states for report dynamic population
  const totals = useMemo(() => {
    const total = tickets.length;
    const resolved = tickets.filter(t => t.status === "Closed").length;
    const pending = tickets.filter(t => t.status === "Open" || t.status === "Partially Resolved").length;
    const critical = tickets.filter(t => t.priority === "Critical" && t.status !== "Closed").length;
    const escalated = tickets.filter(t => t.status === "Escalated").length;

    // Identify top category
    const categoryCounts: Record<string, number> = {};
    tickets.forEach(t => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });
    let topCategory = "N/A";
    let max = 0;
    Object.keys(categoryCounts).forEach(cat => {
      if (categoryCounts[cat] > max) {
        max = categoryCounts[cat];
        topCategory = cat;
      }
    });

    return { total, resolved, pending, critical, escalated, topCategory, max };
  }, [tickets]);

  // Static recommendations mapped to actionable criteria
  const CORE_RECOMMENDATIONS = [
    {
      id: "REC-01",
      category: "Training Needs",
      title: "Conduct Outlook & Office 365 User Training Sessions",
      trigger: "Recurring Exchange sync delays and file permission issues in administrative blocks.",
      action: "Draft a bi-weekly 30-minute webinar on mail hygiene, Exchange folder archiving, and confidential file sharing prefix procedures.",
      icon: <GraduationCap className="w-5 h-5 text-indigo-500" />,
      priority: "Medium"
    },
    {
      id: "REC-02",
      category: "Infrastructure Weakness",
      title: "Upgrade Central Cisco AnyConnect VPN Security Gateways",
      trigger: "High tunneling pings (140ms) and outdated root certificate authority validation failures in remote Gondar and Awasa hubs.",
      action: "Deploy modernized AnyConnect SSL client images globally and push current root certificate bundles through Group Policy Objects (GPOs).",
      icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
      priority: "High"
    },
    {
      id: "REC-03",
      category: "Hardware Lifespan",
      title: "Phase-out and Replace Aging Analog Warehouse Printers",
      trigger: "Recurrent printer streak notifications, drum failures, and manual corona wiring clear actions.",
      action: "Initiate centralized supply acquisition of 3 modern network laser printers with integrated SNMP monitoring modules.",
      icon: <Printer className="w-5 h-5 text-amber-500" />,
      priority: "Low"
    },
    {
      id: "REC-04",
      category: "Process Automation",
      title: "Implement Self-Service Automated AD Password Reset Portal",
      trigger: "Lockout incidents and forgotten credential reset tickets burden support officers (approx. 15% of all workloads).",
      action: "Provision Microsoft SSPR (Self-Service Password Reset) services inside Azure AD Sync, allowing SMS and email-token verification resets.",
      icon: <Wrench className="w-5 h-5 text-indigo-500" />,
      priority: "High"
    },
    {
      id: "REC-05",
      category: "Security & Auditing",
      title: "Strengthen Endpoint Security Monitoring & DNS Safeguards",
      trigger: "Phishing threats, expired licenses check bypasses, and unverified files access attempts in clinical subnets.",
      action: "Deploy active endpoint agents with heuristics, block off-domain DNS relays, and monitor Active Directory lockouts for brute-force attacks.",
      icon: <ShieldAlert className="w-5 h-5 text-rose-500" />,
      priority: "Critical"
    }
  ];

  return (
    <div className="space-y-8 text-left" id="recommendations-container">
      {/* Visual Recommendations Dashboard */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4" id="recommendations-aggregate">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            EPHI Systemic SLA Recommendations Dashboard
          </h2>
          <p className="text-xs text-slate-400">Actionable intelligence extracted from recurring support failure vectors and trends</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="recommendations-grid">
          {CORE_RECOMMENDATIONS.map((rec) => (
            <div key={rec.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex gap-4">
              <div className="p-3 bg-white border border-slate-100 rounded-lg shadow-2xs self-start shrink-0">
                {rec.icon}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                    {rec.category}
                  </span>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                    rec.priority === "Critical" 
                      ? "bg-rose-50 text-rose-700" 
                      : rec.priority === "High"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                
                <h4 className="text-xs font-bold text-slate-800">{rec.title}</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  <strong className="text-slate-600">Trigger Trend:</strong> {rec.trigger}
                </p>
                <p className="text-[11px] text-indigo-700 leading-normal">
                  <strong className="text-slate-700">Preventive Action:</strong> {rec.action}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Corporate Reporting Prepackaged Section */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6" id="report-generator-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              SLA Copilot Report Generator
            </h2>
            <p className="text-xs text-slate-400">Synthesize dynamic, ready-to-print corporate management summaries</p>
          </div>

          {/* Toggle Button Group */}
          <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 border border-slate-200/50">
            <button 
              onClick={() => setSelectedReportType("daily")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${selectedReportType === "daily" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-700"}`}
            >
              Daily
            </button>
            <button 
              onClick={() => setSelectedReportType("weekly")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${selectedReportType === "weekly" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-700"}`}
            >
              Weekly
            </button>
            <button 
              onClick={() => setSelectedReportType("monthly")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${selectedReportType === "monthly" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-700"}`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Generated Report Frame Workspace */}
        <div className="border border-slate-200/80 rounded-xl p-6 sm:p-8 bg-slate-50/50 shadow-inner font-sans relative overflow-hidden" id="report-printable-area">
          <div className="absolute right-4 top-4 hidden sm:block">
            <button 
              onClick={() => window.print()}
              className="text-[10px] uppercase font-mono font-bold flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-slate-600 shadow-3xs transition-all cursor-pointer"
            >
              <PrintIcon className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>

          {/* Corporate Header Section */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 text-center sm:text-left space-y-1.5">
            <div className="text-[10px] font-mono tracking-widest font-black uppercase text-indigo-600">Ethiopian Public Health Institute (EPHI)</div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase">
              {selectedReportType === "daily" && "Daily ICT Support Report"}
              {selectedReportType === "weekly" && "Weekly ICT Performance Report"}
              {selectedReportType === "monthly" && "Monthly ICT Executive Summary"}
            </h1>
            <div className="flex flex-col sm:flex-row justify-between text-slate-450 font-mono text-[10px] pt-1">
              <span>Date generated: Friday, June 5, 2026</span>
              <span>Status: <strong className="text-emerald-600 font-sans">APPROVED FOR COGNIZANCE</strong></span>
            </div>
          </div>

          {/* Dynamic Content Mapping based on report type selected */}
          {selectedReportType === "daily" && (
            <div className="space-y-6 text-sm leading-relaxed text-slate-800" id="report-text-daily">
              {/* Objective */}
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> 1. Operations Overview
                </h3>
                <p className="text-slate-600 pl-4">
                  This summary evaluates active incident logs received during the preceding 24-hour cycle at the central EPHI network nodes. Systems status has remained stable, moderated by manual failsafes in the research wing.
                </p>
              </div>

              {/* Dynamic Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-slate-200 rounded-lg bg-white my-4 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Total Incidents</span>
                  <span className="text-lg font-black text-slate-800">{totals.total}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Fixed Logs</span>
                  <span className="text-lg font-black text-emerald-600">{totals.resolved}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Pending Active</span>
                  <span className="text-lg font-black text-amber-500">{totals.pending}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Critical Alerts</span>
                  <span className="text-lg font-black text-rose-600">{totals.critical}</span>
                </div>
              </div>

              {/* Major Incidents & Categories */}
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" /> 2. Categorization & Critical Alerts
                </h3>
                <p className="text-slate-600 pl-4">
                  The primary taxonomy sector reporting incidents today corresponds to <strong className="text-slate-800">{totals.topCategory}</strong> containing <strong className="text-slate-800">{totals.max} logs</strong>. There are currently <strong className="text-rose-600">{totals.critical} critical severity incidents</strong> awaiting operational sign-off.
                </p>
              </div>

              {/* Recommendations summaries */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" /> 3. Actions & Recommendations
                </h3>
                <ul className="list-disc pl-8 space-y-1 text-slate-600">
                  <li><strong>Active Directory:</strong> Immediate remediation has been applied to password reset procedures. SSPR deployment should be prioritised.</li>
                  <li><strong>VPN Routing:</strong> Remote operators lacking security certificates are scheduled for GPO updates.</li>
                  <li><strong>Printer Spool:</strong> Core warehouse rollers cleared; toner reserves are running at 40%.</li>
                </ul>
              </div>
            </div>
          )}

          {selectedReportType === "weekly" && (
            <div className="space-y-6 text-sm leading-relaxed text-slate-800" id="report-text-weekly">
              {/* Trends analysis */}
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> 1. Weekly SLA Surveillance Trends
                </h3>
                <p className="text-slate-600 pl-4">
                  Over the preceding weekly tracking index, incoming incident patterns have trended toward software validation and security certificate compliance pings. Out of <strong className="text-slate-800">{totals.total} total cases</strong> logged this week, the support desk logged an overall resolution rate of <strong className="text-emerald-600">{totals.total > 0 ? Math.round((totals.resolved / totals.total) * 100) : 0}%</strong>.
                </p>
              </div>

              {/* Staff performance overview */}
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" /> 2. Help Desk Performance & Escalation Audit
                </h3>
                <p className="text-slate-600 pl-4">
                  Support personnel have successfully resolved <strong className="text-slate-800">{totals.resolved} tickets</strong> while <strong className="text-rose-600">{totals.escalated} cases</strong> required escalation to system developers. Security and infrastructure teams have responded within active service level thresholds.
                </p>
              </div>

              {/* Key Roadmap milestones */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" /> 3. Preventive Action Roadmap
                </h3>
                <ol className="list-decimal pl-8 space-y-1 text-slate-600">
                  <li>Formulate Microsoft Office 365 encryption briefings for Finance Teams.</li>
                  <li>Upgrade Cisco AnyConnect gateway routers under high-load hours.</li>
                  <li>Replace older printer configurations with local SNMP nodes.</li>
                  <li>Approve SSPR pilot program integration in administrative subnets.</li>
                </ol>
              </div>
            </div>
          )}

          {selectedReportType === "monthly" && (
            <div className="space-y-6 text-sm leading-relaxed text-slate-800" id="report-text-monthly">
              {/* Operational performance */}
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" /> 1. Monthly SLA Operational Performance
                </h3>
                <p className="text-slate-600 pl-4">
                  The Ethiopian Public Health Institute support framework processed high volumes of disease surveillance packet transmissions and user credentials checks. Total core service uptime was logged at <strong className="text-emerald-600">99.4%</strong>, moderated slightly by the fiber splice offline issue this week. Overall user satisfaction indicator averages <strong className="text-indigo-600">4.6 / 5.0</strong>.
                </p>
              </div>

              {/* Infrastructure challenges */}
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> 2. Systemic Risks & Roadblocks
                </h3>
                <p className="text-slate-600 pl-4">
                  The lack of an automated user self-verification framework remains the leading bottleneck, consuming significant technical personnel labor hours. Outdated routing pings in remote surveillance sites indicate a need for localized VPN gateway nodes.
                </p>
              </div>

              {/* Executive Strategic recommendations */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> 3. Strategic Spending Recommendations & Allocations
                </h3>
                <p className="text-slate-600 pl-4">
                  Based on transactional volume and telemetry logs, we advise the Directorate to allocate investments towards:
                </p>
                <ul className="list-disc pl-8 space-y-1 text-slate-600">
                  <li><strong>Budget Allocation 4.1:</strong> Microsoft SSPR activation and GPO certification management.</li>
                  <li><strong>Budget Allocation 4.2:</strong> Physical fiber repair and dual-splice path redundancy splicing.</li>
                  <li><strong>Budget Allocation 4.3:</strong> 3 modern laser network printing devices.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Report Footer signatures */}
          <div className="border-t border-slate-300 pt-5 mt-8 flex flex-col sm:flex-row justify-between text-[11px] text-slate-500 font-mono gap-4">
            <div className="text-center sm:text-left">
              <p className="font-bold font-sans text-slate-700">Linda</p>
              <p>ICT Operations Secretariat Lead</p>
            </div>
            <div className="text-center sm:text-right">
              <p className="font-bold font-sans text-slate-700">Automated SLA Audit</p>
              <p>Signature: //EPHI-SUPPORT-COPI_SECURED_05-JUNE-2026//</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
