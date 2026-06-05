/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry User-Agent as instructed in gemini-api skill
const getGeminiClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY environment variable is not configured in Secrets.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Endpoint: EPHI Copilot Chat Proxy
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, categoryHint } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages payload." });
    }

    let ai: GoogleGenAI;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      console.warn("Gemini client configuration warning:", err.message);
      return res.status(500).json({ 
        error: "Google Gemini API Key is missing. Please add your GEMINI_API_KEY key in Settings > Secrets in the top-right corner of AI Studio.",
        isMissingKey: true
      });
    }

    // Prepare system instructions adhering to EPHI ICT criteria
    const systemInstruction = `You are the EPHI ICT Support Copilot, an intelligent full-stack AI troubleshooting assistant for the Ethiopian Public Health Institute (EPHI).
Your goal is to support EPHI ICT staff and end-users with standard technical support.

Core Support Categories:
- Account Management (Password resets, lockouts)
- Email (Microsoft Outlook, Exchange server, email sync)
- Network (Connectivity, IP address, WiFi, fiber cables)
- Hardware (Computer maintenance, diagnostics, devices)
- Software (Application installations, updates, web portals)
- Printer (Toner replacement, jams, network print queue, scanners)
- Security (Phishing reporting, malware, endpoint client protection, suspicious logins)
- VPN (Secure AnyConnect, certificate issues, remote portal)
- Operating System (Windows startup, blue screens, update failures)
- Other (General questions)

When a user reports an incident, you MUST lead them through the organizational "Incident Handling Procedure":
1. IDENTIFY THE ISSUE: Attempt to determine or ask for User Name, Department, Location, Device Type, System Affected, Priority Level, and Category.
2. CLARIFY: Ask 1 or 2 relevant diagnostic questions if keys facts are missing (e.g. "When did it start?", "Is any error message displayed?").
3. TROUBLESHOOT: Provide clean, numbered step-by-step troubleshooting procedures. Explain expected outcomes and offer simple alternatives. Keep language straightforward.
4. RESOLUTION/ESCALATION: Assess if resolving or escalating is needed (recommend Teams like Network Admin, Web Admin, or hardware suppliers).

AT THE VERY END of your message, if the user has provided enough incident details (even a minimal amount), you MUST generate a highly formatted Support Log summary block in XML tags. This allows our client dashboard to parse and draft tickets instantly!
Format the XML exactly like this (JSON parsable block inside):
<ticket_extract>
{
  "userName": "Name of user (or guess 'Unknown User' if not specified)",
  "department": "EPHI Department (choice from: 'Epidemiology & PHEM', 'National Reference Laboratory', 'Operations & Logistics', 'Finance & Treasury', 'Human Resources', 'Information Technology', 'Vaccinology & Research', 'Director General Office' or guess)",
  "location": "Room or suite location (or 'Not Provided')",
  "deviceType": "Laptop, desktop, printer, switch etc.",
  "systemAffected": "Software or system name affected",
  "priority": "Low, Medium, High, or Critical",
  "category": "Select one matching the Core list above",
  "description": "Short description of the issue",
  "rootCause": "Postulated or verified root cause",
  "actionsTaken": "Actions suggested or taken in chat"
}
</ticket_extract>

Respond professionally, politely, and structure text using clean Markdown tables and bold lists.`;

    // Map incoming message list into GoogleGenAI structure
    // Since GoogleGenAI `chat` or generateContent accepts standard structures:
    // { role: "user" | "model", parts: [{ text: "..." }] }
    const contents = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    // Generate output from gemini-3.5-flash
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "I was unable to formulate a response. Please verify details and try again.";
    return res.json({ text: replyText });

  } catch (error: any) {
    console.error("Gemini API server proxy error:", error);
    return res.status(500).json({ 
      error: error.message || "Internal server error communicating with the AI backend." 
    });
  }
});

// Configure Vite or Static Assets Server
async function main() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting developer server with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets from /dist...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EPHI ICT Support Copilot listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
});
