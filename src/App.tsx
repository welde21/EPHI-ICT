/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Home, 
  Bot, 
  BarChart3, 
  Users2, 
  Lightbulb, 
  Activity, 
  Menu, 
  X, 
  ShieldAlert, 
  Clock, 
  Server,
  UserCheck
} from "lucide-react";

import { Ticket, SystemHealth, TicketStatus } from "./types";
import { INITIAL_TICKETS, INITIAL_SYSTEM_HEALTH } from "./data";
import HomeView from "./components/HomeView";
import ChatView from "./components/ChatView";
import DashboardView from "./components/DashboardView";
import EmployeeView from "./components/EmployeeView";
import RecommendationsView from "./components/RecommendationsView";

export default function App() {
  const [activePage, setActivePage] = useState<string>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Hydrate tickets from localStorage or fall back to pre-seeded INITIAL_TICKETS
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const saved = localStorage.getItem("ephi_tickets");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load local storage tickets.", e);
    }
    return INITIAL_TICKETS;
  });

  // Hydrate systems from localStorage or fall back to INITIAL_SYSTEM_HEALTH
  const [systems, setSystems] = useState<SystemHealth[]>(() => {
    try {
      const saved = localStorage.getItem("ephi_systems");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load local storage systems.", e);
    }
    return INITIAL_SYSTEM_HEALTH;
  });

  // Sync tickets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("ephi_tickets", JSON.stringify(tickets));
    } catch (e) {
      console.error("Could not save ticket state to localStorage:", e);
    }
  }, [tickets]);

  // Sync systems to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("ephi_systems", JSON.stringify(systems));
    } catch (e) {
      console.error("Could not save systems state to localStorage:", e);
    }
  }, [systems]);

  // Handler: Add new ticket
  const handleAddTicket = (newTicket: Ticket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  // Handler: Update ticket status
  const handleUpdateTicketStatus = (id: string, newStatus: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  // Handler: Delete ticket
  const handleDeleteTicket = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
  };

  // Safe navigation helper
  const handlePageNavigation = (page: string) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col antialiased text-slate-800" id="ephi-master-viewport">
      
      {/* Top Header Panel */}
      <header className="bg-slate-900 border-b border-slate-800 shrink-0 sticky top-0 z-40 text-white select-none">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 hover:bg-slate-800 rounded-lg lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5 text-slate-300" />
            </button>
            <div 
              onClick={() => handlePageNavigation("home")}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-90"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-mono font-black text-slate-950 text-base shadow-sm">
                EP
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-white block">EPHI ICT</span>
                <span className="text-[10px] text-slate-400 font-medium block -mt-1 font-mono uppercase tracking-wider">Support Command</span>
              </div>
            </div>
          </div>

          {/* Core network indicators and clock in desktop view */}
          <div className="hidden md:flex items-center gap-6 text-xs text-slate-350">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Central Gateways: Online
            </span>
            <span className="w-px h-4 bg-slate-800"></span>
            <span className="flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              05-June-2026 ~ 02:44 UTC
            </span>
            <span className="w-px h-4 bg-slate-800"></span>
            <div className="flex items-center gap-2 bg-slate-850 py-1 px-3 rounded-md border border-slate-700/40">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">weldemariam (HQ Command)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Wrap */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row relative">
        
        {/* SIDE BAR NAVIGATION - LARGE SCREENS */}
        <nav className="w-64 shrink-0 hidden lg:flex flex-col border-r border-slate-200/80 p-5 space-y-2 select-none text-left bg-white" id="desktop-sidebar-nav">
          <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest block px-3 mb-2">
            Portal Operations
          </span>

          <button 
            onClick={() => handlePageNavigation("home")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePage === "home" 
                ? "bg-slate-900 text-white shadow-3xs" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Home className="w-4 h-4" />
            Portal Home
          </button>

          <button 
            onClick={() => handlePageNavigation("chatbot")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePage === "chatbot" 
                ? "bg-slate-900 text-white shadow-3xs" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Bot className="w-4 h-4" />
            Support Copilot (AI)
          </button>

          <button 
            onClick={() => handlePageNavigation("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePage === "dashboard" 
                ? "bg-slate-900 text-white shadow-3xs" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Incident Dashboard
          </button>

          <button 
            onClick={() => handlePageNavigation("employees")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePage === "employees" 
                ? "bg-slate-900 text-white shadow-3xs" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Users2 className="w-4 h-4" />
            Employee Performance
          </button>

          <button 
            onClick={() => handlePageNavigation("recommendations")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePage === "recommendations" 
                ? "bg-slate-900 text-white shadow-3xs" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            SLA Recommendations
          </button>

          <div className="pt-8 border-t border-slate-100 mt-auto text-center">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 text-left space-y-1.5">
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-medium inline-block">SLA AUDITOR</span>
              <p className="text-[11px] font-bold text-slate-800">Support Status: Active</p>
              <p className="text-[10.5px] text-slate-500 leading-normal">Our SLAs target a resolution time under 45 minutes on core diagnostics.</p>
            </div>
            <p className="text-[9px] font-mono text-slate-400 mt-4">&copy; 2026 EPHI ICT Directorate</p>
          </div>
        </nav>

        {/* MOBILE MENU NAVIGATION */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-start lg:hidden" id="mobile-menu-overlay">
            <div className="bg-white w-64 max-w-[80vw] h-full p-5 space-y-4 flex flex-col border-r border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                <span className="font-extrabold text-sm tracking-tight text-slate-800">EPHI ICT Portal</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="flex-1 space-y-2 text-left">
                <button 
                  onClick={() => handlePageNavigation("home")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold ${activePage === "home" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <Home className="w-4 h-4" />
                  Portal Home
                </button>
                <button 
                  onClick={() => handlePageNavigation("chatbot")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold ${activePage === "chatbot" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <Bot className="w-4 h-4" />
                  Support Copilot (AI)
                </button>
                <button 
                  onClick={() => handlePageNavigation("dashboard")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold ${activePage === "dashboard" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Incident Dashboard
                </button>
                <button 
                  onClick={() => handlePageNavigation("employees")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold ${activePage === "employees" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <Users2 className="w-4 h-4" />
                  Employee Performance
                </button>
                <button 
                  onClick={() => handlePageNavigation("recommendations")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold ${activePage === "recommendations" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <Lightbulb className="w-4 h-4" />
                  SLA Recommendations
                </button>
              </div>

              <div className="text-[10px] text-slate-400 font-mono border-t border-slate-150 pt-3">
                &copy; 2026 EPHI Support Desk 
                |designed by: weldemariam Bahre
              </div>
            </div>
          </div>
        )}

        {/* PRIMARY MAIN APP VIEWWORKSPACE */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-0 bg-slate-50/30 overflow-y-auto" id="main-view-wrapper">
          {activePage === "home" && (
            <HomeView 
              systems={systems} 
              tickets={tickets} 
              onNavigate={handlePageNavigation} 
            />
          )}

          {activePage === "chatbot" && (
            <ChatView 
              onAddTicket={handleAddTicket} 
              onNavigate={handlePageNavigation} 
            />
          )}

          {activePage === "dashboard" && (
            <DashboardView 
              tickets={tickets} 
              onUpdateTicketStatus={handleUpdateTicketStatus} 
              onDeleteTicket={handleDeleteTicket} 
              onAddTicket={handleAddTicket}
            />
          )}

          {activePage === "employees" && (
            <EmployeeView 
              tickets={tickets} 
            />
          )}

          {activePage === "recommendations" && (
            <RecommendationsView 
              tickets={tickets} 
            />
          )}
        </main>
      </div>
    </div>
  );
}
