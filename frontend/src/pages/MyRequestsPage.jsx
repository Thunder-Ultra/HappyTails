import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { formatDate } from "../utils/formatters";

// UI Components
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

// Icons
import {
  Search, MessageCircle, Send, Loader2, PawPrint, Inbox,
  Clock, CheckCircle2, XCircle, ChevronRight, User
} from "lucide-react";

export default function MyRequestsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const scrollRef = useRef(null);

  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // 1. Load all applications on mount
  useEffect(() => {
    if (token) fetchRequests();
  }, [token]);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${BASE_URL}/adoption/my-applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // console.log(data);
      if (res.ok) setRequests(data);
    } catch (err) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };


  // 3. Select a request and start polling for chat
  const handleSelectRequest = (req) => {
    setSelectedReq(req);
    loadMessages(req.id);
  };

  useEffect(() => {
    let interval;
    if (selectedReq && (selectedReq.status === 'Approved' || selectedReq.status === 'Interviewing' || selectedReq.status === 'Pending')) {
      interval = setInterval(() => loadMessages(selectedReq.id), 4000);
    }
    return () => clearInterval(interval);
  }, [selectedReq]);

  // 4. Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Find and replace these specific functions in MyRequestsPage.jsx

  const loadMessages = async (requestId) => {
    if (!requestId) return;
    try {
      const res = await fetch(`${BASE_URL}/messages/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log(data)
      console.log("user ", user)
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Chat sync error", err);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedReq || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch(`${BASE_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adop_req_id: selectedReq.id,
          content: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage("");
        await loadMessages(selectedReq.id);
      }
    } catch (err) {
      toast.error("Message not sent");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

  return (
    <div className="bg-gray-50 min-h-[calc(100-80px)]">
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">My Adoption Requests</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Track your applications and chat with caretakers</p>
        </div>

        {/* --- MAIN WRAPPER: Changed to grid-cols-3 (which exists in your CSS) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] lg:h-[700px]">

          {/* --- LEFT: REQUESTS LIST (Takes 1 column) --- */}
          <div className="md:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2">
            {requests.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-gray-100 text-center">
                <Inbox className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 font-bold text-xs uppercase">No Requests</p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => handleSelectRequest(req)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${selectedReq?.id === req.id
                    ? "bg-white border-blue-600 shadow-md ring-2 ring-blue-50"
                    : "bg-white border-gray-100 hover:border-blue-200"
                    }`}
                >
                  {/* Logo Boundary: Using h-12/w-12 from your CSS */}
                  <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                    <ImageWithFallback
                      src={req.pet_image ? `${BASE_URL}/uploads/${req.pet_image}` : null}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-sm">{req.pet_name}</h3>
                    <Badge className={`mt-1 text-[8px] px-2 py-0.5 rounded-md border-none ${req.status === 'Approved' ? 'bg-green-600 text-white' :
                      req.status === 'Rejected' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'
                      }`}>
                      {req.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* --- RIGHT: CHAT VIEW (Takes 2 columns) --- */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            {!selectedReq ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-4">
                <MessageCircle className="h-12 w-12 opacity-10" />
                <p className="font-semibold text-xs uppercase tracking-widest text-gray-400">Select a request to chat</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {selectedReq.caretaker_name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 text-sm leading-none">{selectedReq.caretaker_name}</h2>
                      <p className="text-[10px] text-blue-600 font-bold uppercase mt-1">Re: {selectedReq.pet_name}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/adoptable/${selectedReq.pet_id}`)} className="h-8 text-xs">
                    View Pet Listing
                  </Button>
                </div>

                {/* Message Area */}
                <ScrollArea className="flex-1 p-6 bg-white">
                  {/* --- WHATSAPP STYLE CHAT LOOP --- */}
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isMe = msg.sender_id === user.user?.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex w-full ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1`}
                        >
                          <div
                            className={`max-w-[80%] px-4 py-2.5 shadow-sm border ${isMe
                              ? "bg-blue-600 text-white border-blue-600 rounded-2xl rounded-tr-none"
                              : "bg-gray-50 text-gray-900 border-gray-100 rounded-2xl rounded-tl-none"
                              }`}
                          >
                            {/* Message Content */}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                            {/* Timestamp & Status */}
                            <div className={`flex items-center justify-end gap-1 mt-1 opacity-70`}>
                              <span className="text-[9px] font-bold uppercase tracking-tighter">
                                {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMe && <CheckCircle2 className="h-2.5 w-2.5" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                {/* Chat Input */}
                {/* --- UPDATED: CHAT INPUT AREA WITH STATUS LOGIC --- */}
                <div className="p-6 border-t bg-white">
                  {selectedReq.status === 'Pending' ? (
                    // CASE 1: PENDING - Show waiting message
                    <div className="flex flex-col items-center justify-center py-4 bg-blue-50/50 rounded-2xl border border-blue-100 animate-in fade-in duration-500">
                      <Clock className="h-6 w-6 text-blue-500 mb-2 animate-pulse" />
                      <p className="text-sm font-bold text-blue-700">Application Pending Review</p>
                      <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest mt-1">
                        Chat will be enabled once the caretaker starts the interview
                      </p>
                    </div>
                  ) : selectedReq.status === 'Rejected' ? (
                    // CASE 2: REJECTED - Show closed message
                    <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <XCircle className="h-6 w-6 text-gray-300 mb-2" />
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-tight">Application Closed</p>
                    </div>
                  ) : (
                    // CASE 3: INTERVIEWING/APPROVED - Enable Chat
                    <div className="flex gap-3 items-center">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Message ${selectedReq.caretaker_name}...`}
                        className="h-12 rounded-xl bg-gray-50 border-none px-5 focus:ring-2 focus:ring-blue-500 transition-all"
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={isSending}
                        className="h-12 w-12 !bg-blue-600 hover:!bg-blue-700 rounded-xl shadow-lg shadow-blue-100 shrink-0 cursor-pointer flex items-center justify-center"
                      >
                        {isSending ? (
                          <Loader2 className="animate-spin h-5 w-5 text-white" />
                        ) : (
                          <Send className="h-5 w-5 text-white" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}