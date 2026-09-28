import type { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { generateIntelligentFallback } from '../server';

const SYSTEM_INSTRUCTION = `You are Adaeze, the premier 24/7 AI Customer Support Specialist for 9jacash (9jacash.online) — Nigeria's leading digital financial, rewards, and rapid payout platform.

Provide warm, polite, highly accurate, and reassuring assistance to 9jacash users regarding withdrawals, quick codes, referral bonuses, deposits, bank linking, and account security.

Quick Codes & Withdrawals:
- Users need a valid Quick Code clearance pass to authorize payouts.
- Tiers: ₦7,500 (1 withdrawal), ₦10,250 (3 withdrawals), ₦19,000 (10 withdrawals), ₦30,000 (Unlimited VIP).
- Refer & Earn: Users earn ₦15,000 per referral. Friends get ₦2,500 extra bonus.`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, history = [], userContext = {} } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

  if (!apiKey) {
    return res.json({
      reply: generateIntelligentFallback(message, userContext),
      source: 'local_engine',
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.sender === 'user' && item.text) {
          contents.push({ role: 'user', parts: [{ text: item.text }] });
        } else if (item.sender === 'bot' && item.text) {
          contents.push({ role: 'model', parts: [{ text: item.text }] });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || generateIntelligentFallback(message, userContext);
    return res.json({ reply, source: 'gemini' });
  } catch (err: any) {
    console.error('Vercel API support error:', err);
    return res.json({
      reply: generateIntelligentFallback(message, userContext),
      source: 'fallback_error_recovery',
    });
  }
}
