/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ticket, Employee, SystemHealth } from "./types";

export const EPHI_DEPARTMENTS = [
  "Epidemiology & PHEM",
  "National Reference Laboratory",
  "Operations & Logistics",
  "Finance & Treasury",
  "Human Resources",
  "Information Technology",
  "Vaccinology & Research",
  "Director General Office",
  "Health System research directorate "
];

export const EPHI_OFFICERS = [
  "kirubel mengesha",
  "Kirubeal Alemu",
  "Tsiyon",
  "meseret",
  "Dawit Negash"
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: "EPHI-INC-1001",
    date: "2026-06-01",
    userName: "Dr. Aster Lemma",
    department: "National Reference Laboratory",
    location: "Block B, Room 204",
    deviceType: "Lab Workstation Desktop",
    systemAffected: "LIMS Database Access",
    category: "Account Management",
    priority: "High",
    description: "User is locked out of the Laboratory Information Management System (LIMS) server after 3 failed password attempts due to forgotten credentials.",
    rootCause: "Expired Active Directory credentials triggered automatic lockout policies.",
    actionsTaken: "Verified identity via department roster list, reset AD password, cleared lockout bit in Active Directory controller, and verified success.",
    status: "Closed",
    supportOfficer: "kirubeal mengesha",
    timeSpentMinutes: 15
  },
  {
    id: "EPHI-INC-1002",
    date: "2026-06-02",
    userName: "Solomon Tekle",
    department: "Epidemiology & PHEM",
    location: "Main Building, Room 105",
    deviceType: "Lenovo ThinkPad Laptop",
    systemAffected: "AnyConnect Safe VPN",
    category: "VPN",
    priority: "Critical",
    description: "Cannot establish secure VPN connectivity from remote surveillance site in Awasa. Receives gateway error 'Security certificate rejected'.",
    rootCause: "Outdated AnyConnect VPN client version lacking the newly deployed Root CA certificate authority files.",
    actionsTaken: "Walked user through manual installation of root CA bundle via insecure guest gateway; updated AnyConnect VPN app to latest 4.10 version.",
    status: "Closed",
    supportOfficer: "Tigist Assefa",
    timeSpentMinutes: 45
  },
  {
    id: "EPHI-INC-1003",
    date: "2026-06-03",
    userName: "Genet Hailu",
    department: "Finance & Treasury",
    location: "Block A, Room 312",
    deviceType: "Dell Latitude Laptop",
    systemAffected: "Outlook Mail Relay",
    category: "Email",
    priority: "Medium",
    description: "Unable to send encrypted financial statements to external auditor. Server rejects with 'undeliverable SMTP restriction'.",
    rootCause: "Exchange transport rule restricting the dissemination of cleartext financial spreadsheets to off-domain recipients.",
    actionsTaken: "Coordinated with Security Operations; instructed user to append [CONFIDENTIAL] prefix corresponding to modern encryption rule triggers.",
    status: "Closed",
    supportOfficer: "Yonas Hailu",
    timeSpentMinutes: 30
  },
  {
    id: "EPHI-INC-1004",
    date: "2026-06-04",
    userName: "Zelalem Tadesse",
    department: "Operations & Logistics",
    location: "Warehouse Office",
    deviceType: "HP LaserJet Printer",
    systemAffected: "Local Network Printing",
    category: "Printer",
    priority: "Low",
    description: "High-volume printer has faded text streaks on supply manifests. Self-test page displays low warning.",
    rootCause: "Toner drum depleted and transfer rollers require preventive dust blowoff.",
    actionsTaken: "Headed to warehouse; swapped toner cartridge and cleaned the primary corona wires using anti-static wipes.",
    status: "Closed",
    supportOfficer: "Marta Demeke",
    timeSpentMinutes: 20
  },
  {
    id: "EPHI-INC-1005",
    date: "2026-06-04",
    userName: "Dr. Meron Kassahun",
    department: "Vaccinology & Research",
    location: "Block C, Lab 12",
    deviceType: "Spectrophotometer Controller PC",
    systemAffected: "Windows 10 Pro OS",
    category: "Operating System",
    priority: "High",
    description: "Operating system stuck on infinite BSOD loop (Error: INACCESSIBLE_BOOT_DEVICE) following automated monthly security patches.",
    rootCause: "SATA controller driver conflicted with a recent Windows patch, forcing a boot sector loop.",
    actionsTaken: "Booted into Recovery Environment, uninstalled last cumulative update, reverted SATA controller back to generic AHCI mode.",
    status: "Partially Resolved",
    supportOfficer: "Dawit Negash",
    timeSpentMinutes: 60
  },
  {
    id: "EPHI-INC-1006",
    date: "2026-06-04",
    userName: "Almaz Kebede",
    department: "Human Resources",
    location: "Main Building, Room 218",
    deviceType: "Desktop Companion Tower",
    systemAffected: "Organizational HR Portal",
    category: "Software",
    priority: "Medium",
    description: "HR Portal refuses to load files larger than 10MB; displays gateway timeout errors during employee evaluation uploads.",
    rootCause: "IIS web server configuration limits maxAllowedContentLength to default 10MB limits.",
    actionsTaken: "Escalated case to web administration team, drafted configuration edit requests for web.config adjustments.",
    status: "Escalated",
    supportOfficer: "Dawit Negash",
    timeSpentMinutes: 25,
    escalationTeam: "Web Administrations Group"
  },
  {
    id: "EPHI-INC-1007",
    date: "2026-06-05",
    userName: "Haile Michael",
    department: "Director General Office",
    location: "Block A, Floor 5",
    deviceType: "MacBook Pro",
    systemAffected: "Office 365 License Server",
    category: "Software",
    priority: "Medium",
    description: "Word and Excel display 'Unlicensed Product' banner and block editing of administrative briefings.",
    rootCause: "O365 Enterprise license expired because of billing pool structural adjustments under centralized framework.",
    actionsTaken: "Reassigned modern Microsoft O365 E5 license via Azure AD portal, forced manual login refresh in MS suite.",
    status: "Closed",
    supportOfficer: "Abebe Kebede",
    timeSpentMinutes: 15
  },
  {
    id: "EPHI-INC-1008",
    date: "2026-06-05",
    userName: "Biniam Girma",
    department: "Epidemiology & PHEM",
    location: "Control Center Desk 4",
    deviceType: "Core Switch Link Panel",
    systemAffected: "Local LAN Networking",
    category: "Network",
    priority: "Critical",
    description: "Subnet 10.150.4.x experiencing intermittent packet drops (up to 40% loss), hindering live disease surveillance telemetry updates.",
    rootCause: "Faulty RJ-45 copper port on switch patch panel with structural physical layer degradation.",
    actionsTaken: "Traced network cables with toner; patched LAN drop to spare active RJ-45 uplink slot on Switch-3B.",
    status: "Open",
    supportOfficer: "Yonas Hailu",
    timeSpentMinutes: 10
  }
];

export const INITIAL_SYSTEM_HEALTH: SystemHealth[] = [
  {
    name: "EPHI Active Directory Server",
    status: "online",
    latency: "12ms",
    details: "Master Domain Controller (LDAP/Kerberos) running with 0 errors.",
    category: "Core"
  },
  {
    name: "Surveillance Web Gateway",
    status: "online",
    latency: "28ms",
    details: "PHEM data collection gateway is online, receiving surveillance packets.",
    category: "Application"
  },
  {
    name: "Central Exchange Email Relay",
    status: "online",
    latency: "18ms",
    details: "Inbound and outbound mail routers operating normally.",
    category: "Core"
  },
  {
    name: "EPHI VPN Gateway Panel",
    status: "warning",
    latency: "140ms",
    details: "High traffic throughput detected causing slightly high tunnel network pingtimes.",
    category: "Network"
  },
  {
    name: "National Clinical Lab LIMS",
    status: "online",
    latency: "35ms",
    details: "LIMS databases synchronized cleanly with region servers.",
    category: "Application"
  },
  {
    name: "Core Inter-Building Fiber Link",
    status: "offline",
    latency: "N/A",
    details: "Physical splicing damage suspected under research wing path; traffic auto-rerouted via wireless failsafe.",
    category: "Network"
  }
];
