import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Lock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Image as ImageIcon,
  Clock,
  User,
  AlertCircle,
  ArrowRight,
  Volume2,
} from 'lucide-react';
import { Conversation, CustomerRequest, LanguageCode, PageTab } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { useAuth } from '../../context/AuthContext';
import { sendChatMessage } from '../../services/conversationService';
import { speakText } from '../../utils/audioSpeech';

interface MessagesPageProps {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  requests: CustomerRequest[];
  setCurrentTab: (tab: PageTab) => void;
  currentLang: LanguageCode;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({
  conversations,
  setConversations,
  requests,
  setCurrentTab,
  currentLang,
}) => {
  const { user, artisan } = useAuth();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    conversations.length > 0 ? conversations[0].id : null
  );
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0] || null;

  // Check if there are any pending requests that have locked messaging
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  const quickReplies = [
    'Namaste! I have received your requirement and will prepare the base materials.',
    'I have uploaded new progress photos to your order tracker.',
    'Could you confirm your preference for the natural mineral glaze tint?',
    'The artwork is kiln-cured and ready for safe protective packing.',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !activeConv) return;

    const artistId加快 = user?.uid || 'sample-artist';
    const artistName = artisan?.name || 'Rameshwar Lal Kumhar';

    setIsSending(true);
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: artistId加快,
      senderRole: 'artist' as const,
      senderName: artistName,
      text,
      createdAt: new Date().toISOString(),
    };

    try {
      await sendChatMessage(activeConv.id, artistId加快, newMsg);
      setConversations((prev) =>
        prev.map((c的的) =>
          c的的.id === activeConv.id
            ? {
                ...c的的,
                messages: [...c的的.messages, newMsg],
                lastMessage: text,
                lastMessageAt: new Date().toISOString(),
              }
            : c的的
        )
      );
      setInputText('');
    } catch (err) {
      console.error('Error sending chat message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C25E3E]/10 text-[#C25E3E] border border-[#C25E3E]/20 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              Verified Client Inquiries
            </span>
            <span className="text-xs text-stone-500 font-medium">
              Direct Artist-to-Customer Messaging
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-serif">
            Messages
          </h1>
          <p className="text-sm text-stone-500 mt-1 max-w-xl">
            Chat directly with buyers whose commission requests you have accepted. Keep all specifications and updates in one place.
          </p>
        </div>

        {pendingRequests.length > 0 && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900">
                {pendingRequests.length} Request{pendingRequests.length > 1 ? 's' : ''} Pending
              </p>
              <button
                onClick={() => setCurrentTab('requests')}
                className="text-[11px] font-bold text-[#C25E3E] hover:underline"
              >
                Review & Accept Requests to Unlock Chat →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Split Chat Layout */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[560px]">
        
        {/* Left Conversation List (4 Cols) */}
        <div className="md:col-span-4 border-r border-stone-200 p-4 space-y-3 bg-stone-50/50">
          <div className="flex items-center justify-between px-2 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Active Conversations ({conversations.length})
            </h3>
          </div>

          {conversations.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <Lock className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-xs font-bold text-slate-800">No active conversations</p>
              <p className="text-[11px] text-stone-500">
                Direct chat is locked until you accept incoming commission requests from customers.
              </p>
              <button
                onClick={() => setCurrentTab('requests')}
                className="px-3.5 py-1.5 rounded-xl bg-[#C25E3E] text-white text-xs font-bold"
              >
                View Customer Requests
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {conversations.map((conv) => {
                const isSelected = activeConv?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-white shadow-sm border border-stone-200'
                        : 'hover:bg-white/60 text-stone-600'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 overflow-hidden shrink-0">
                      {conv.customerAvatar ? (
                        <img
                          src={conv.customerAvatar}
                          alt={conv.customerName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-indigo-700">
                          {conv.customerName.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {conv.customerName}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-[#C25E3E] truncate">
                        {conv.artworkTitle}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {conv.lastMessage || 'No messages yet.'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Pending locked notice */}
          {pendingRequests.length > 0 && (
            <div className="pt-4 border-t border-stone-200">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-2 mb-2">
                Locked Inquiries ({pendingRequests.length})
              </h4>
              <div className="space-y-1.5">
                {pendingRequests.map((pr) => (
                  <div
                    key={pr.id}
                    className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-left space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                      <span>{pr.customerName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-semibold">
                        Locked
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 truncate">{pr.title}</p>
                    <button
                      onClick={() => setCurrentTab('requests')}
                      className="text-[11px] font-bold text-[#C25E3E] hover:underline pt-1 block"
                    >
                      Accept Request to Chat →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Chat Window (8 Cols) */}
        <div className="md:col-span-8 flex flex-col justify-between p-4 sm:p-6 bg-white min-h-[500px]">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="pb-4 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 overflow-hidden shrink-0">
                    {activeConv.customerAvatar ? (
                      <img
                        src={activeConv.customerAvatar}
                        alt={activeConv.customerName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-indigo-700">
                        {activeConv.customerName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {activeConv.customerName}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Commission Client
                      </span>
                    </div>
                    <p className="text-xs text-stone-500">
                      Artwork: <span className="font-semibold text-slate-700">{activeConv.artworkTitle}</span> (₹{activeConv.budget.toLocaleString('en-IN')})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentTab('orders')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 text-xs font-bold transition-colors"
                >
                  <span>Order Tracker</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
                <div className="text-center">
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-500">
                    Direct communication unlocked after commission acceptance
                  </span>
                </div>

                {activeConv.messages.map((msg) => {
                  const isMe = msg.senderRole === 'artist';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-stone-500">
                          {isMe ? 'You (Artisan)' : activeConv.customerName}
                        </span>
                        <span className="text-[9px] text-stone-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-[#C25E3E] text-white rounded-br-xs shadow-xs'
                            : 'bg-stone-100 text-slate-900 rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Reply Suggestions */}
              <div className="pt-2 pb-3 border-t border-stone-100">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  <span className="text-stone-400 font-medium shrink-0">Quick responses:</span>
                  {quickReplies.map((qr, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(qr)}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 shrink-0 transition-colors"
                    >
                      {qr.slice(0, 32)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message, workshop update, or requirement clarification..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C25E3E]"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isSending}
                  className="p-2.5 rounded-xl bg-[#C25E3E] text-white hover:bg-[#a94e32] transition-colors disabled:opacity-40 shadow-xs"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="m-auto text-center space-y-3 p-8">
              <Lock className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                Accept a customer request to start chatting
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Once a commission request is accepted, your direct messaging channel will appear here.
              </p>
              <button
                onClick={() => setCurrentTab('requests')}
                className="px-4 py-2 rounded-xl bg-[#C25E3E] text-white text-xs font-bold"
              >
                Go to Customer Requests
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
