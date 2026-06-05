/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PriorityLevel = "Low" | "Medium" | "High" | "Critical";

export type TicketCategory =
  | "Account Management"
  | "Email"
  | "Network"
  | "Hardware"
  | "Software"
  | "Printer"
  | "Security"
  | "VPN"
  | "Operating System"
  | "Other";

export type TicketStatus = "Open" | "Partially Resolved" | "Closed" | "Escalated";

export interface Ticket {
  id: string; // Issue ID (e.g., EPHI-INC-001)
  date: string; // Format: YYYY-MM-DD
  userName: string;
  department: string;
  location: string;
  deviceType: string;
  systemAffected: string;
  category: TicketCategory;
  priority: PriorityLevel;
  description: string;
  rootCause: string;
  actionsTaken: string;
  status: TicketStatus;
  supportOfficer: string;
  timeSpentMinutes: number; // Time Spent in minutes
  diagnosticQuestions?: string[];
  notes?: string;
  escalationTeam?: string;
}

export interface Employee {
  name: string;
  assigned: number;
  resolved: number;
  pending: number;
  escalated: number;
  averageResolutionTimeMin: number;
}

export interface SystemHealth {
  name: string;
  status: "online" | "warning" | "offline";
  latency: string;
  details: string;
  category: "Core" | "Network" | "Application";
}

export interface ChatMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
  ticketSuggestion?: Partial<Ticket>; // Generated dynamically by analyzing chat
}
