import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INSTRUCTION = `You are Adaeze, the premier 24/7 AI Customer Support Specialist for 9jacash (9jacash.online) — Nigeria's leading digital financial, rewards, and rapid payout platform.

Your primary mission is to provide warm, polite, highly accurate, and reassuring assistance to 9jacash users regarding withdrawals, quick codes, referral bonuses, deposits, bank linking, and account security.

Key Facts about 9jacash:
1. Quick Codes & Withdrawals:
   - To ensure secure automated bank clearance across NIBSS routing nodes, users must authorize withdrawals using a purchased Quick Code.
   - Quick Code Pricing Tiers:
     • ₦7,500: Starter Code (Valid for 1 withdrawal)
     • ₦10,250: Standard Code (Valid for 3 consecutive withdrawals)
     • ₦19,000: Pro Active Code (Valid for 10 active withdrawals with priority clearance)
     • ₦30,000: Unlimited VIP Code (Unlimited lifetime withdrawals to any Nigerian bank)
   - How to purchase: Click 'Quick Code' on the dashboard or Services page, select your preferred plan, transfer the exact amount to the official company clearance account displayed, and upload your payment receipt for instant clearance.
   - Once acquired, enter the code in the 'Quick Code' field on the Withdrawal/Transfer page to complete your payout.

2. Referral Program (Refer & Earn):
   - Users earn an instant ₦15,000 commission credited directly to their balance for every friend or contact who registers with their referral link/code.
   - Each invited friend receives an immediate ₦2,500 welcome bonus on top of standard starting funds (₦12,500 starting balance).
   - Users can copy their referral link or share directly via WhatsApp with one tap.

3. Account Verification & Payout Bank Linking:
   - Payout accounts can be linked in the user Profile (becomes accessible once a user initiates their first withdrawal).
   - Automatic NIBSS name resolution verifies account details in real-time.

4. Customer Care Tone & Style:
   - Greet users respectfully (e.g., "Hello!", "Good day! Welcome to 9jacash support.").
   - Be concise, direct, helpful, and reassuring.
   - If a user has a complex billing dispute or urgent escalation, advise them that they can also contact our Verified Human Telegram Desk directly at @9jacash_support.`;

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Support Chat endpoint
  app.post('/api/support-chat', async (req, res) => {
    try {
      const { message, history = [], userContext = {} } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

      if (!apiKey) {
        // Fallback intelligent response if API key is not set in environment
        return res.json({
          reply: generateIntelligentFallback(message, userContext),
          source: 'local_engine',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Format previous chat history for Gemini
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Add conversation context
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-6)) {
          if (item.sender === 'user' && item.text) {
            contents.push({ role: 'user', parts: [{ text: item.text }] });
          } else if (item.sender === 'bot' && item.text) {
            contents.push({ role: 'model', parts: [{ text: item.text }] });
          }
        }
      }

      // Add user context note
      const userContextString = userContext?.name
        ? `[Current User: ${userContext.name}, Balance: ₦${Number(userContext.balance || 0).toLocaleString()}, Active Code: ${userContext.activeQuickCode || 'None'}] `
        : '';

      contents.push({
        role: 'user',
        parts: [{ text: `${userContextString}${message}` }],
      });

      const geminiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timeout')), 5000)
      );

      const response = await Promise.race([geminiPromise, timeoutPromise]);
      const replyText = response.text || generateIntelligentFallback(message, userContext);
      return res.json({ reply: replyText, source: 'gemini' });
    } catch (err: any) {
      console.error('Error generating AI support response:', err);
      // Even on error, always return a helpful response so the user is never left hanging
      const fallback = generateIntelligentFallback(req.body?.message || '', req.body?.userContext);
      return res.json({ reply: fallback, source: 'fallback_error_recovery' });
    }
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`9jacash full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

// Comprehensive intelligent fallback knowledge engine for zero-downtime deployment
export function generateIntelligentFallback(message: string, userContext?: any): string {
  const query = (message || '').toLowerCase();
  const userName = userContext?.name || 'Valued Customer';
  const balance = userContext?.balance ? `₦${Number(userContext.balance).toLocaleString()}` : 'your balance';

  if (query.includes('quick code') || query.includes('code') || query.includes('pass') || query.includes('clearance')) {
    return `Hello ${userName}! To authorize a withdrawal to your bank, a valid Quick Code clearance pass is required. Here are the available tiers:

• ₦7,500 — Starter Code (Valid for 1 withdrawal)
• ₦10,250 — Standard Code (Valid for 3 consecutive withdrawals)
• ₦19,000 — Pro Active Code (Valid for 10 active withdrawals)
• ₦30,000 — Unlimited VIP Code (Unlimited lifetime payouts)

Tap 'Quick Code' on your dashboard, select your preferred plan, pay the exact amount to our official company account, and upload your proof for automated clearance!`;
  }

  if (query.includes('withdraw') || query.includes('payout') || query.includes('transfer') || query.includes('send money')) {
    return `To make a withdrawal on 9jacash:
1. Tap 'Withdraw' on your home dashboard.
2. Select your recipient Nigerian bank and enter your 10-digit account number.
3. Enter your purchased Quick Code in the clearance box.
4. Click 'Authorize & Withdraw' for instant NIBSS automated payout!

You currently have ${balance} in your account available for withdrawal.`;
  }

  if (query.includes('refer') || query.includes('invite') || query.includes('bonus') || query.includes('15000') || query.includes('earn')) {
    return `With the 9jacash Refer & Earn Program, you earn an instant ₦15,000 commission for every friend who registers using your referral link!

Plus, each friend you invite receives an extra ₦2,500 sign-up bonus (starting with ₦12,500 instead of ₦10,000). You can copy your unique link or share directly to WhatsApp from the 'Refer & Earn' tab!`;
  }

  if (query.includes('balance') || query.includes('my money') || query.includes('account status')) {
    return `Your current available balance is ${balance}. You can use this balance for rapid bank payouts, airtime, utilities, or accumulate more through our ₦15,000 referral program!`;
  }

  if (query.includes('human') || query.includes('agent') || query.includes('real person') || query.includes('telegram') || query.includes('contact')) {
    return `If you need dedicated human assistance or manual receipt confirmation, our Verified Official Vendor & Support Desk is available on Telegram:
👉 Official Channel: https://t.me/9jacash_support

Our agents are on standby to assist you 24/7!`;
  }

  if (query.includes('deposit') || query.includes('fund') || query.includes('add money')) {
    return `To fund your 9jacash wallet, click 'Fund Wallet' or 'Deposit' on the dashboard, select your desired deposit amount, and follow the simple bank transfer instructions. Your funds will be credited instantly once confirmed!`;
  }

  return `Hello ${userName}! I am Adaeze, your 9jacash 24/7 AI Support Specialist. How can I assist you today? 

I can help you with:
• Withdrawing funds & entering your Quick Code
• Purchasing a Quick Code clearance tier (₦7,500 - ₦30,000)
• Earning ₦15,000 per referral on Refer & Earn
• Linking your payout bank account
• Checking account status or speaking with a Telegram human agent!`;
}

startServer();
