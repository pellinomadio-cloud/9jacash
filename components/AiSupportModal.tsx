import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { User } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface AiSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  vendorTelegramLink?: string;
  onNavigateToTab?: (tab: string) => void;
}

// Built-in intelligent fallback for post-deployment zero-downtime
function getOfflineAiResponse(query: string, user: User): string {
  const lower = query.toLowerCase();
  const userName = user.name || 'Valued Customer';
  const balanceStr = `₦${(user.balance || 0).toLocaleString()}`;

  if (lower.includes('quick code') || lower.includes('code') || lower.includes('clearance') || lower.includes('tier') || lower.includes('cost')) {
    return `Hello ${userName}! To ensure instant automated bank clearance via NIBSS, withdrawals require a purchased Quick Code pass:

• ₦7,500 Starter Code — Valid for 1 withdrawal
• ₦10,250 Standard Code — Valid for 3 consecutive withdrawals
• ₦19,000 Pro Active Code — Valid for 10 active withdrawals
• ₦30,000 Unlimited VIP Code — Lifetime unlimited withdrawals

To get one: Tap 'Quick Code' on your dashboard, select your preferred plan, pay the exact amount to the official company account, and upload your proof. You'll receive your code immediately!`;
  }

  if (lower.includes('withdraw') || lower.includes('payout') || lower.includes('cashout') || lower.includes('transfer')) {
    return `Withdrawing from 9jacash is fast and automated:
1. Tap 'Withdraw' on your home screen.
2. Select your bank and enter your 10-digit account number.
3. Input your purchased Quick Code.
4. Tap 'Authorize & Withdraw' for instant payout!

Your current available balance is ${balanceStr}.`;
  }

  if (lower.includes('refer') || lower.includes('invite') || lower.includes('bonus') || lower.includes('15000') || lower.includes('15,000')) {
    return `With 9jacash Refer & Earn:
• You receive an instant ₦15,000.00 commission directly into your balance for every friend who signs up with your link.
• Your friends receive an extra ₦2,500 welcome bonus (total ₦12,500 starting funds).

Visit the 'Refer & Earn' tab to copy your unique link or share directly to WhatsApp!`;
  }

  if (lower.includes('balance') || lower.includes('my money') || lower.includes('account status')) {
    return `Your account is active! Current available balance: ${balanceStr}. You also have ${user.referralCount || 0} registered referrals.`;
  }

  if (lower.includes('human') || lower.includes('agent') || lower.includes('telegram') || lower.includes('representative')) {
    return `You can connect directly with our Verified Human Support Desk on Telegram:
👉 https://t.me/9jacash_support
Our customer care team is available 24/7 for manual verification and account inquiries.`;
  }

  if (lower.includes('deposit') || lower.includes('fund') || lower.includes('add money')) {
    return `To top up your wallet balance, tap 'Fund Wallet' on the home dashboard, select your desired amount, and make a transfer to the provided account details. Funds reflect automatically upon payment!`;
  }

  return `Hello ${userName}! I'm Adaeze, your 24/7 AI Support Assistant for 9jacash. How can I help you today?

I can assist you with:
• Purchasing & using Quick Codes (₦7,500 - ₦30,000)
• Making automated bank withdrawals
• Earning ₦15,000 per referral
• Linking your payout bank account
• Escalating to our Telegram human desk`;
}

export const AiSupportModal: React.FC<AiSupportModalProps> = ({
  isOpen,
  onClose,
  user,
  vendorTelegramLink = 'https://t.me/9jacash_support',
  onNavigateToTab,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `Hello ${user.name || 'there'}! 👋 Welcome to 9jacash 24/7 AI Assistance. I can help you with withdrawals, Quick Codes, your ₦15,000 referral bonus, and account inquiries. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'How do I withdraw?',
    'What is Quick Code?',
    '₦15,000 Referral Bonus',
    'Check my balance',
    'Talk to Human Agent',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || inputValue).trim();
    if (!messageText) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      // Call server-side /api/support-chat
      const response = await fetch('/api/support-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: messages.slice(-6),
          userContext: {
            name: user.name,
            email: user.email,
            balance: user.balance,
            activeQuickCode: user.activeQuickCode,
            referrals: user.referralCount,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          const botMsg: Message = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, botMsg]);
          setIsTyping(false);
          return;
        }
      }
      throw new Error('Fallback required');
    } catch {
      // Offline / post-deployment intelligent fallback engine ensures 100% uptime
      setTimeout(() => {
        const fallbackText = getOfflineAiResponse(messageText, user);
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md bg-[#f4f7f6] rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl flex flex-col h-[85vh] sm:h-[680px] max-h-[92vh] overflow-hidden border border-slate-200"
        >
          {/* Header matching 9jacash Forest Green */}
          <div className="bg-[#013a24] text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 p-0.5 shadow-sm flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#013a24] flex items-center justify-center text-amber-300">
                    <Icons.Bot size={20} />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#013a24] rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-black text-sm tracking-tight text-white">Adaeze • AI Assistant</h3>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                    24/7 AI
                  </span>
                </div>
                <p className="text-[10px] text-emerald-100/70 font-medium">9jacash Official Instant Help Desk</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={onClose}
                className="p-2 hover:bg-emerald-900/60 rounded-full transition-colors text-emerald-100 hover:text-white cursor-pointer active:scale-95"
                aria-label="Close"
              >
                <Icons.X size={20} />
              </button>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="bg-emerald-950/80 px-4 py-2 flex items-center justify-between border-b border-emerald-900/50 text-[11px] text-emerald-200">
            <div className="flex items-center space-x-1.5">
              <Icons.ShieldCheck size={14} className="text-emerald-400" />
              <span>NIBSS Verified Banking Node</span>
            </div>
            <a
              href={vendorTelegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:text-amber-200 font-bold flex items-center space-x-1 transition-colors"
            >
              <span>Telegram Desk</span>
              <Icons.ExternalLink size={12} />
            </a>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#f4f7f6]">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] ${
                    isUser ? 'ml-auto' : 'mr-auto'
                  }`}
                >
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-gradient-to-r from-[#013a24] to-[#025636] text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs whitespace-pre-line'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center space-x-2 bg-white text-slate-500 border border-slate-200/80 px-4 py-3 rounded-2xl w-fit rounded-bl-xs shadow-xs">
                <span className="text-xs font-medium text-slate-500">Adaeze is thinking</span>
                <span className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></span>
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200/80 text-[11px] font-semibold text-slate-700 rounded-full transition-all active:scale-95 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200/80 shrink-0">
            <div className="flex items-center space-x-2 bg-[#f4f7f6] border border-slate-300/80 rounded-2xl p-1.5 pl-3.5 focus-within:border-[#008751] focus-within:ring-2 focus-within:ring-[#008751]/15 transition-all">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about withdrawal, quick code, referrals..."
                className="flex-1 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="w-9 h-9 rounded-xl bg-[#008751] hover:bg-[#007043] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0 shadow-xs"
                aria-label="Send Message"
              >
                <Icons.Send size={15} />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400 font-medium">
              <span>9jacash AI Assistant • Works 24/7 & post-deployment</span>
              <a
                href={vendorTelegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 font-bold hover:underline"
              >
                Contact Human Agent
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
