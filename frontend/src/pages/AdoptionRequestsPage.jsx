import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { formatDate } from "../utils/formatters";

// UI Components
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
import { Input } from "../components/ui/input";

// Icons
import {
  ArrowLeft, User, MessageCircle, ChevronRight, Inbox, Loader2,
  Calendar, Send, Briefcase, Home, Clock, Baby, Fence, CheckCircle2, XCircle, X
} from "lucide-react";

export default function AdoptableIncomingRequestsPage() {
  const { id } = useParams(); // Adoptable ID
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [requests, setRequests] = useState([]);
  const [petName, setPetName] = useState("");
  const [loading, setLoading] = useState(true);

  // --- MODAL & CHAT STATES ---
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isProcessingStatus, setIsProcessingStatus] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [id, token]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/adoption/incoming?adoptableId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch");
      setRequests(data);
      if (data.length > 0) setPetName(data[0].pet_name);
    } catch (err) {
      toast.error("Error loading applications");
    } finally {
      setLoading(false);
    }
  };

  // --- OPEN MODAL AND LOAD DETAILS ---
  const handleOpenRequest = async (requestId) => {
    setIsModalOpen(true);
    setModalLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/adoption/request/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelectedRequest(data);
      loadMessages(requestId);
    } catch (err) {
      toast.error("Could not load details");
      setIsModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };
  // Find and replace these specific functions in your AdoptableIncomingRequestsPage.jsx

  const loadMessages = async (requestId) => {
    if (!requestId) return;
    try {
      const res = await fetch(`${BASE_URL}/messages/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // Ensure we set an empty array if no messages exist yet
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Chat fetch error", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRequest || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch(`${BASE_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // MUST BE PRESENT
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          adop_req_id: selectedRequest.id,
          content: newMessage
        }),
      });

      if (res.ok) {
        setNewMessage("");
        await loadMessages(selectedRequest.id); // Immediate refresh after send
      } else {
        const errData = await res.json();
        toast.error(errData.msg || "Could not send message");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setIsSending(false);
    }
  };

  // Poll for messages when modal is open
  useEffect(() => {
    let interval;
    if (isModalOpen && selectedRequest) {
      interval = setInterval(() => loadMessages(selectedRequest.id), 4000);
    }
    return () => clearInterval(interval);
  }, [isModalOpen, selectedRequest]);

  const handleStatusUpdate = async (newStatus) => {
    setIsProcessingStatus(true);
    try {
      const res = await fetch(`${BASE_URL}/adoption/status/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Marked as ${newStatus}`);
        handleOpenRequest(selectedRequest.id); // Reload modal details
        fetchRequests(); // Reload list background
      }
    } catch (err) { toast.error("Update failed"); } finally { setIsProcessingStatus(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" className="mb-6 hover:bg-white rounded-full px-4 cursor-pointer" onClick={() => navigate("/adoptables")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to My Adoptables
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Applications for <span className="text-blue-600">{petName}</span></h1>
          <p className="text-gray-500 mt-2 font-medium">You have {requests.length} total applicant{requests.length !== 1 ? 's' : ''}.</p>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white p-20 rounded-[2rem] border-2 border-dashed border-gray-100 text-center">
            <Inbox className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest">No Applications</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <Card key={req.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all cursor-pointer group rounded-2xl" onClick={() => handleOpenRequest(req.id)}>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">{req.applicant_name.charAt(0)}</div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{req.applicant_name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-gray-400 text-xs font-medium">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(req.created_at)}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> Click to Review</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <Badge className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${req.status === 'Approved' ? 'bg-green-100 text-green-700' : req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{req.status}</Badge>
                      <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-all" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* --- APPLICATION DETAIL & CHAT MODAL --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          /* INLINE STYLES: This overrides your component's internal CSS limits */
          style={{
            maxWidth: '1400px',
            width: '95vw',
            height: '90vh',
            borderRadius: '2rem',
            padding: 0
          }}
          className="flex flex-col overflow-hidden border-none shadow-2xl bg-white"
        >
          {modalLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
            </div>
          ) : selectedRequest && (
            <div className="flex flex-col h-full">

              {/* MODAL HEADER: Unified Large Header */}
              <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-blue-100">
                    {selectedRequest.applicant_name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                      {selectedRequest.applicant_name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-orange-50 text-orange-600 border-orange-100 text-[10px] font-black uppercase tracking-widest px-3">
                        {selectedRequest.status}
                      </Badge>
                      <span className="text-gray-300">|</span>
                      <p className="text-xs text-gray-400 font-medium italic">Application for {petName}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {selectedRequest.status === 'Pending' && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleStatusUpdate('Approved')}
                        className="cursor-pointer !bg-green-600 hover:!bg-green-700 !text-white font-black px-8 h-12 rounded-xl shadow-md"
                      >
                        Approve Adopter
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleStatusUpdate('Rejected')}
                        className="cursor-pointer font-black px-8 h-12 rounded-xl"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                  {/* <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="h-7 w-7 text-gray-400" />
                  </button> */}
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden">

                {/* LEFT: ADOPTER PROFILE (40% Width) */}
                <div className="w-[40%] border-r border-gray-100 overflow-y-auto p-12 space-y-12 bg-white">

                  {/* SECTION 1: COVER LETTER */}
                  <section>
                    <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" /> Cover Letter
                    </h3>
                    <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-inner">
                      <p className="text-gray-600 leading-relaxed italic text-lg text-center">
                        "{selectedRequest.message || "No message provided."}"
                      </p>
                    </div>
                  </section>

                  {/* SECTION 2: ADOPTER BACKGROUND */}
                  <section>
                    <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
                      <User className="h-4 w-4" /> Eligibility Profile
                    </h3>
                    <div className="grid grid-cols-2 gap-x-10 gap-y-10">
                      <ProfileItem icon={Briefcase} label="Occupation" value={selectedRequest.occupation} />
                      <ProfileItem icon={Home} label="Housing" value={selectedRequest.housing_type} />
                      <ProfileItem icon={Clock} label="Time Away" value={`${selectedRequest.daily_hours_away} hrs/day`} />
                      <ProfileItem icon={Fence} label="Fenced Yard" value={selectedRequest.has_fenced_yard} />
                      <ProfileItem icon={Baby} label="Has Kids" value={selectedRequest.has_kids} />
                      <ProfileItem icon={CheckCircle2} label="Experience" value={selectedRequest.experience_level} />
                    </div>
                  </section>

                  {/* NEW SECTION 3: DECISION ACTIONS */}
                  <section className="pt-8 border-t border-gray-100">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.25em] mb-6">
                      Final Decision
                    </h3>

                    {selectedRequest.status === 'Pending' || selectedRequest.status === 'Interviewing' ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-4">
                          <Button
                            onClick={() => handleStatusUpdate('Approved')}
                            disabled={isProcessingStatus}
                            className="flex-1 cursor-pointer !bg-green-600 hover:!bg-green-700 !text-white font-black h-14 rounded-2xl shadow-lg shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            {isProcessingStatus ? <Loader2 className="animate-spin h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                            Approve Adoption
                          </Button>

                          <Button
                            variant="destructive"
                            onClick={() => handleStatusUpdate('Rejected')}
                            disabled={isProcessingStatus}
                            className="flex-1 cursor-pointer font-black h-14 rounded-2xl shadow-lg active:scale-95 flex items-center justify-center gap-2"
                          >
                            {isProcessingStatus ? <Loader2 className="animate-spin h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                            Reject Request
                          </Button>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center font-medium px-4">
                          Approving will notify the adopter and set the pet's status to "On Hold".
                        </p>
                      </div>
                    ) : (
                      <div className={`p-6 rounded-2xl text-center border ${selectedRequest.status === 'Approved' ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
                        }`}>
                        <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Application Closed</p>
                        <p className="text-xl font-black">Status: {selectedRequest.status}</p>
                      </div>
                    )}
                  </section>
                </div>

                {/* RIGHT: CHAT INTERFACE (60% Width) */}
                <div className="w-[60%] flex flex-col bg-gray-50/50">
                  <ScrollArea className="flex-1 px-10 py-10">
                    <div className="space-y-6">
                      {messages.length === 0 ? (
                        <div className="py-20 text-center opacity-30 flex flex-col items-center">
                          <Send className="h-12 w-12 mb-4" />
                          <p className="font-bold uppercase tracking-widest text-sm">No messages yet</p>
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isMe = Number(msg.sender_id) === Number(user.user?.id);
                          return (
                            <div key={msg.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[70%] px-5 py-3.5 shadow-sm border ${isMe
                                ? "bg-blue-600 text-white border-blue-600 rounded-3xl rounded-tr-none"
                                : "bg-white text-gray-900 border-gray-200 rounded-3xl rounded-tl-none"
                                }`}>
                                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                <p className={`text-[9px] mt-2 font-black uppercase tracking-tighter text-right ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                                  {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>

                  {/* CHAT INPUT AREA */}
                  <div className="p-8 bg-white border-t border-gray-100">
                    <div className="flex gap-4 items-center bg-gray-50 p-2 rounded-2xl border border-gray-100 shadow-inner">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Message ${selectedRequest.applicant_name}...`}
                        className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 h-12 px-4 font-medium"
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={isSending || !newMessage.trim()}
                        className="!bg-blue-600 hover:!bg-blue-700 h-12 w-12 rounded-xl shrink-0 flex items-center justify-center active:scale-90 transition-all"
                      >
                        {isSending ? <Loader2 className="animate-spin h-5 w-5 text-white" /> : <Send className="h-5 w-5 text-white" />}
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProfileItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-gray-100 rounded-lg shrink-0"><Icon className="h-4 w-4 text-gray-400" /></div>
      <div className="min-w-0">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-bold text-gray-900 truncate">{value || 'N/A'}</p>
      </div>
    </div>
  );
}