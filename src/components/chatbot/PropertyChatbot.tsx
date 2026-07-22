import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user' | 'lead';
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    type: 'bot',
    content: "Welcome to LeadLuxe AI! 👋 I'm your virtual property assistant. I can help you find the perfect property or schedule a site visit. What type of property are you looking for?",
    timestamp: new Date(),
  },
];

const BOT_RESPONSES: Record<string, string> = {
  default: "That's great! Let me connect you with our sales team who can provide detailed information and arrange a site visit at your convenience. Would you like to schedule a visit?",
  apartment: "Excellent choice! We have several premium apartment projects in prime locations. Could you tell me your preferred budget range and location?",
  villa: "Wonderful! Our villa projects offer luxurious living with top-notch amenities. May I know your preferred location and budget?",
  penthouse: "Excellent taste! Our penthouses offer breathtaking views and unparalleled luxury. Let me know your preferred location and when you'd like to visit.",
  budget: "I understand your budget requirements. Let me capture your details so our team can share the best options that match your criteria.",
  visit: "Perfect! I'll schedule a site visit for you. Please share your preferred date and time, and our team will confirm the appointment.",
  contact: "Our team will get in touch with you shortly. In the meantime, would you like to receive updates about new property launches via WhatsApp?",
};

interface PropertyChatbotProps {
  onLeadCapture?: (leadData: { name: string; phone: string; email?: string }) => void;
}

export function PropertyChatbot({ onLeadCapture }: PropertyChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', email: '' });
  const [showForm, setShowForm] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addBotMessage = (content: string, delay = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'bot',
          content,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, delay);
  };

  const handleSend = (text?: string) => {
    const message = text || input;
    if (!message.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'user',
        content: message,
        timestamp: new Date(),
      },
    ]);
    setInput('');

    // Generate bot response based on keywords
    const lower = message.toLowerCase();
    if (lower.includes('apartment') || lower.includes('flat')) {
      addBotMessage(BOT_RESPONSES.apartment);
      setTimeout(() => setShowForm(true), 1500);
    } else if (lower.includes('villa') || lower.includes('house') || lower.includes('bungalow')) {
      addBotMessage(BOT_RESPONSES.villa);
      setTimeout(() => setShowForm(true), 1500);
    } else if (lower.includes('penthouse') || lower.includes('luxury')) {
      addBotMessage(BOT_RESPONSES.penthouse);
      setTimeout(() => setShowForm(true), 1500);
    } else if (lower.includes('budget') || lower.includes('price') || lower.includes('cost')) {
      addBotMessage(BOT_RESPONSES.budget);
      setTimeout(() => setShowForm(true), 1500);
    } else if (lower.includes('visit') || lower.includes('schedule') || lower.includes('tour')) {
      addBotMessage(BOT_RESPONSES.visit);
      setTimeout(() => setShowForm(true), 1500);
    } else if (lower.includes('contact') || lower.includes('call') || lower.includes('whatsapp')) {
      addBotMessage(BOT_RESPONSES.contact);
      setTimeout(() => setShowForm(true), 1500);
    } else {
      addBotMessage(BOT_RESPONSES.default);
      setTimeout(() => setShowForm(true), 2000);
    }
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) return;

    onLeadCapture?.(leadForm);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'lead',
        content: `📋 Lead captured! Name: ${leadForm.name}, Phone: ${leadForm.phone}`,
        timestamp: new Date(),
      },
    ]);
    addBotMessage("Thank you! 🎉 Your information has been recorded. Our team will contact you shortly with the best property options. Would you like to explore more properties in the meantime?");
    setShowForm(false);
    setLeadForm({ name: '', phone: '', email: '' });
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 group',
          isOpen
            ? 'bg-red-500 hover:bg-red-600 rotate-90'
            : 'bg-luxury-gold-500 hover:bg-luxury-gold-600 animate-glow'
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageSquare className="w-6 h-6 text-black" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] md:w-[400px] rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl shadow-black/50 animate-slide-up overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-luxury-gold-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">LeadLuxe AI Assistant</h3>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Online
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-2.5 animate-fade-in',
                  msg.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.type !== 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center flex-shrink-0">
                    {msg.type === 'lead' ? (
                      <Building2 className="w-3.5 h-3.5 text-luxury-gold-400" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-luxury-gold-400" />
                    )}
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[75%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed',
                    msg.type === 'user'
                      ? 'bg-luxury-gold-500/20 text-white rounded-tr-sm'
                      : msg.type === 'lead'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-tl-sm'
                      : 'bg-gray-800/50 text-gray-200 rounded-tl-sm'
                  )}
                >
                  {msg.content}
                </div>
                {msg.type === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-luxury-gold-400" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-luxury-gold-400" />
                </div>
                <div className="bg-gray-800/50 px-4 py-2.5 rounded-xl rounded-tl-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Lead Capture Form */}
          {showForm && (
            <form onSubmit={handleLeadSubmit} className="p-3 border-t border-gray-800 bg-gray-900/50 space-y-2 animate-slide-up">
              <p className="text-xs text-gray-400 font-medium">Quick details to get started:</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Your name *"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  required
                  className="col-span-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold-500/50 transition-colors"
                />
                <input
                  type="tel"
                  placeholder="Phone *"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  required
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold-500/50 transition-colors"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold-500/50 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={!leadForm.name || !leadForm.phone}
                className="w-full py-2 bg-luxury-gold-500 text-black rounded-lg text-xs font-semibold hover:bg-luxury-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Submit & Get Best Deals 🎯
              </button>
            </form>
          )}

          {/* Input */}
          {!showForm && (
            <div className="p-3 border-t border-gray-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold-500/50 transition-colors"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="p-2.5 rounded-xl bg-luxury-gold-500 text-black hover:bg-luxury-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
