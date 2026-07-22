import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, Lightbulb, TrendingUp, Target, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  suggestions?: string[];
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'welcome',
    role: 'ai',
    content: "I'm your AI Deal Coach. I can help you analyze deals, prepare for negotiations, and identify next steps. What would you like to discuss?",
    suggestions: [
      'Analyze my current deal pipeline',
      'How to approach builder negotiations?',
      'What deals should I prioritize?',
      'Review my conversation strategy',
    ],
  },
];

export function DealCoachChat() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addMessage = async (content: string) => {
    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateResponse(content);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    addMessage(input.trim());
  };

  const handleSuggestion = (suggestion: string) => {
    addMessage(suggestion);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                msg.role === 'ai' ? 'bg-luxury-gold-500/20' : 'bg-emerald-500/20'
              )}>
                {msg.role === 'ai' ? (
                  <Bot className="w-4 h-4 text-luxury-gold-400" />
                ) : (
                  <User className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <div className={cn(
                'max-w-[80%]',
                msg.role === 'user' ? 'text-right' : 'text-left'
              )}>
                <div className={cn(
                  'rounded-xl p-3 text-sm leading-relaxed',
                  msg.role === 'ai'
                    ? 'glass-card border-luxury-gold-500/10'
                    : 'bg-emerald-500/10 border border-emerald-500/20 text-white'
                )}>
                  {msg.content}
                </div>
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestion(suggestion)}
                        className="text-xs px-2.5 py-1 rounded-full bg-luxury-gold-500/10 text-luxury-gold-400 border border-luxury-gold-500/20 hover:bg-luxury-gold-500/20 transition-colors"
                      >
                        <Lightbulb className="w-3 h-3 inline mr-1" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-luxury-gold-400" />
              </div>
              <div className="glass-card p-3 rounded-xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-luxury-gold-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-luxury-gold-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-luxury-gold-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-luxury-border">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI Deal Coach..."
            className="input-glass flex-1"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="btn-primary !px-3 !py-2.5"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function generateResponse(userInput: string): Message {
  const input = userInput.toLowerCase();

  if (input.includes('pipeline') || input.includes('prioritize')) {
    return {
      id: `ai-${Date.now()}`,
      role: 'ai',
      content: "Based on your current pipeline analysis:\n\n1️⃣ **VTP Baner** (₹1.25 Cr) — Hot lead, high urgency. Prioritize site visit this week.\n2️⃣ **Godrej Kharadi** (₹82L) — Qualified but needs follow-up. Send brochure today.\n3️⃣ **Kolte Patil Wakad** (₹95L) — Site visit scheduled. Prepare financing options.\n\n**Recommendation:** Focus on VTP Baner first. Their budget and urgency indicate a high probability of closing within 14 days.",
      suggestions: [
        'Prepare negotiation strategy for VTP Baner',
        'Draft follow-up for Godrej Kharadi',
        'What financing options should I offer?',
      ],
    };
  }

  if (input.includes('negotiat') || input.includes('builder')) {
    return {
      id: `ai-${Date.now()}`,
      role: 'ai',
      content: "**Builder Negotiation Strategy:**\n\n1. **Know your value** — Emphasize the 3% success fee (no upfront cost). This is your strongest advantage.\n2. **Lead with data** — Show conversion metrics from similar builders: 40% higher conversion, 3x more site visits.\n3. **Offer a pilot** — Suggest onboarding one project first. Once they see results, expansion is natural.\n4. **Commission transparency** — Use the calculator to show exact numbers. Builders appreciate transparency.\n\n**Key talking points:**\n- \"You only pay when a deal closes\"\n- \"AI qualification saves your team 60% time\"\n- \"WhatsApp automation captures leads 24/7\"",
      suggestions: [
        'Show me the commission calculator',
        'What objections do builders commonly have?',
        'Create a pitch script for me',
      ],
    };
  }

  if (input.includes('deal') || input.includes('review')) {
    return {
      id: `ai-${Date.now()}`,
      role: 'ai',
      content: "I've analyzed your active deals:\n\n📊 **Pipeline Health: Strong**\n\n| Deal | Value | Confidence | Action |\n|------|-------|-----------|--------|\n| VTP Baner | ₹1.25 Cr | 94% 🔥 | Close this week |\n| Godrej Kharadi | ₹82L | 81% ⚡ | Follow up today |\n| Kolte Patil Wakad | ₹95L | 78% ⚡ | Site visit scheduled |\n| Balewadi Heights | ₹2.1 Cr | 96% 🔥 | Entering negotiation |\n\n**Expected Commission: ₹20.61 L** if all close.",
      suggestions: [
        'How to increase the 78% deal confidence?',
        'Draft a closing message for VTP Baner',
        'Analyze why Balewadi is 96% confident',
      ],
    };
  }

  return {
    id: `ai-${Date.now()}`,
    role: 'ai',
    content: "Great question! Here's what I recommend:\n\n**Key Insight:** The most successful real estate developers are closing deals 2x faster by using AI to qualify leads before scheduling site visits.\n\n**Actionable Steps:**\n1. Review your top 3 opportunities by confidence score\n2. Focus on deals with 80%+ confidence first\n3. Use the AI Opportunity Feed to spot new signals\n4. Set up automated WhatsApp follow-ups for warm leads\n\nWould you like me to dive deeper into any specific area?",
    suggestions: [
      'Show me my top opportunities',
      'How to use buying signals?',
      'Coach me on a specific deal',
    ],
  };
}
