import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";

import {
  CheckCircle,
  XCircle,
  MessageCircle,
  Send,
  User as UserIcon,
  Briefcase,
  Home,
  Clock,
  PawPrint
} from "lucide-react";

import { toast } from "sonner";

// ================================================
// TYPES
// ================================================

// interface AdoptionRequest {
//   id: string;
//   adopterId: string;
//   parentId: string;
//   petId: string;
//   status: "pending" | "accepted" | "rejected";
// }

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   occupation?: string;
//   address?: string;
//   availableTime?: string;
//   pastExperience?: string;
// }

// interface Pet {
//   id: string;
//   parentId: string;
//   name: string;
//   age: number;
//   weight: number;
//   height: number;
//   breed: string;
//   type: string;
//   vaccinated: boolean;
//   address: string;
//   description: string;
//   images: string[];

//   // REQUIRED — you use these in your pages
//   status: "available" | "pending" | "adopted";
//   adoptedBy?: string;
// }

// interface Message {
//   id: string;
//   adoptionRequestId: string;
//   senderId: string;
//   receiverId: string;
//   text: string;
//   timestamp: string;
// }

// interface ViewingRequestState {
//   request: AdoptionRequest;
//   adopter: User;
//   pet: Pet;
// }

// ================================================
// COMPONENT
// ================================================
export default function InterestedRequestsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [viewingRequest, setViewingRequest] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // -----------------------------
  // Load Requests
  // -----------------------------
  useEffect(() => {
    if (user) loadRequests();
  }, [user]);

  const loadRequests = () => {
    const allRequests = JSON.parse(
      localStorage.getItem("adoptionRequests") || "[]"
    );
    const myRequests = allRequests.filter((r) => r.parentId === user?.id);
    setRequests(myRequests);
  };

  // -----------------------------
  // Load Messages
  // -----------------------------
  useEffect(() => {
    if (chatOpen && viewingRequest) loadMessages();
  }, [chatOpen, viewingRequest]);

  const loadMessages = () => {
    if (!viewingRequest) return;

    const allMessages = JSON.parse(localStorage.getItem("messages") || "[]");
    const requestMessages = allMessages.filter(
      (m) => m.adoptionRequestId === viewingRequest.request.id
    );

    setMessages(
      requestMessages.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    );
  };

  // -----------------------------
  // View Request Details
  // -----------------------------
  const viewRequestDetails = (request) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const adopter = users.find((u) => u.id === request.adopterId);

    const pets = JSON.parse(localStorage.getItem("pets") || "[]");
    const pet = pets.find((p) => p.id === request.petId);

    if (adopter && pet) {
      setViewingRequest({ request, adopter, pet });
    }
  };

  // -----------------------------
  // Accept / Reject Request
  // -----------------------------
  const handleRequestAction = (requestId, action) => {
    if (!viewingRequest) return;

    const allRequests = JSON.parse(
      localStorage.getItem("adoptionRequests") || "[]"
    );
    const index = allRequests.findIndex((r) => r.id === requestId);

    if (index !== -1) {
      allRequests[index].status = action;
      localStorage.setItem("adoptionRequests", JSON.stringify(allRequests));

      if (action === "accepted") {
        const pets = JSON.parse(localStorage.getItem("pets") || "[]");
        const petIndex = pets.findIndex((p) => p.id === viewingRequest.request.petId);

        if (petIndex !== -1) {
          pets[petIndex].status = "adopted";
          pets[petIndex].adoptedBy = viewingRequest.request.adopterId;
          localStorage.setItem("pets", JSON.stringify(pets));
        }

        toast.success(`🎉 Your pet ${viewingRequest.pet.name} has found a new home!`);
      } else {
        toast.info("Adoption request rejected.");
      }

      loadRequests();
      setViewingRequest(null);
    }
  };

  // -----------------------------
  // Chat Messages
  // -----------------------------
  const sendMessage = () => {
    if (!newMessage.trim() || !viewingRequest || !user) return;

    const allMessages = JSON.parse(localStorage.getItem("messages") || "[]");

    const message = {
      id: Date.now().toString(),
      adoptionRequestId: viewingRequest.request.id,
      senderId: user.id,
      receiverId: viewingRequest.adopter.id,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    allMessages.push(message);
    localStorage.setItem("messages", JSON.stringify(allMessages));

    setMessages([...messages, message]);
    setNewMessage("");
  };

  // -----------------------------
  // Helper functions
  // -----------------------------
  const getPetName = (id) => {
    const pets = JSON.parse(localStorage.getItem("pets") || "[]");
    return pets.find((p) => p.id === id)?.name || "Unknown Pet";
  };

  const getAdopterName = (id) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    return users.find((u) => u.id === id)?.name || "Unknown User";
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const acceptedRequests = requests.filter((r) => r.status === "accepted");
  const rejectedRequests = requests.filter((r) => r.status === "rejected");

  // ================================================
  // RENDER UI
  // ================================================
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl mb-2">Interested Requests</h1>
      <p className="text-gray-600 mb-6">Review adoption requests for your pets</p>

      {/* ------------------- Empty State ------------------- */}
      {requests.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No adoption requests yet</p>
        </div>
      )}

      {/* ------------------------------------- */}
      {/* PENDING REQUESTS */}
      {/* ------------------------------------- */}
      {pendingRequests.length > 0 && (
        <div>
          <h2 className="text-xl mb-4">Pending Requests ({pendingRequests.length})</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((req) => {
              const pets = JSON.parse(localStorage.getItem("pets") || "[]");
              const pet = pets.find((p) => p.id === req.petId);

              return (
                <Card key={req.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {getAdopterName(req.adopterId)}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          wants to adopt {getPetName(req.petId)}
                        </p>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </CardHeader>

                  {pet && (
                    <div className="px-6 pb-3">
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <ImageWithFallback
                          src={pet.images[0]}
                          alt={pet.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  <CardContent>
                    <Button size="sm" className="w-full" onClick={() => viewRequestDetails(req)}>
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------- */}
      {/* ACCEPTED */}
      {/* ------------------------------------- */}
      {acceptedRequests.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl mb-4">Accepted ({acceptedRequests.length})</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {acceptedRequests.map((req) => (
              <Card key={req.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{getAdopterName(req.adopterId)}</CardTitle>
                      <p className="text-sm text-gray-500">adopted {getPetName(req.petId)}</p>
                    </div>
                    <Badge>Accepted</Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => viewRequestDetails(req)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------- */}
      {/* REJECTED */}
      {/* ------------------------------------- */}
      {rejectedRequests.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl mb-4">Rejected ({rejectedRequests.length})</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rejectedRequests.map((req) => (
              <Card key={req.id} className="opacity-60">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{getAdopterName(req.adopterId)}</CardTitle>
                      <p className="text-sm text-gray-500">{getPetName(req.petId)}</p>
                    </div>
                    <Badge variant="outline">Rejected</Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* Request Details Dialog */}
      {/* ======================================================= */}
      {viewingRequest && (
        <Dialog open onOpenChange={() => setViewingRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Adoption Request for {viewingRequest.pet.name}
              </DialogTitle>
              <DialogDescription>
                Review adopter details and make a decision
              </DialogDescription>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-6 py-4">
              {/* PET INFO */}
              <div>
                <h3 className="text-sm mb-3">Pet Information</h3>

                <div className="aspect-square rounded-lg overflow-hidden mb-3">
                  <ImageWithFallback
                    src={viewingRequest.pet.images[0]}
                    alt={viewingRequest.pet.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <p><span className="text-sm text-gray-600">Name:</span> {viewingRequest.pet.name}</p>
                  <p><span className="text-sm text-gray-600">Breed:</span> {viewingRequest.pet.breed}</p>
                  <p><span className="text-sm text-gray-600">Age:</span> {viewingRequest.pet.age} years</p>
                </div>
              </div>

              {/* ADOPTER INFO */}
              <div>
                <h3 className="text-sm mb-3">Adopter Information</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <UserIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p>{viewingRequest.adopter.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <UserIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p>{viewingRequest.adopter.email}</p>
                    </div>
                  </div>

                  {viewingRequest.adopter.occupation && (
                    <div className="flex items-start gap-2">
                      <Briefcase className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Occupation</p>
                        <p>{viewingRequest.adopter.occupation}</p>
                      </div>
                    </div>
                  )}

                  {viewingRequest.adopter.address && (
                    <div className="flex items-start gap-2">
                      <Home className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p>{viewingRequest.adopter.address}</p>
                      </div>
                    </div>
                  )}

                  {viewingRequest.adopter.availableTime && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Available Time</p>
                        <p>{viewingRequest.adopter.availableTime}</p>
                      </div>
                    </div>
                  )}

                  {viewingRequest.adopter.pastExperience && (
                    <div className="flex items-start gap-2">
                      <PawPrint className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Past Experience</p>
                        <p className="text-sm">{viewingRequest.adopter.pastExperience}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              {viewingRequest.request.status === "pending" ? (
                <>
                  <Button
                    className="flex-1"
                    onClick={() =>
                      handleRequestAction(viewingRequest.request.id, "accepted")
                    }
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Adoption
                  </Button>

                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      handleRequestAction(viewingRequest.request.id, "rejected")
                    }
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              ) : (
                <Button className="flex-1" onClick={() => setChatOpen(true)}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with Adopter
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ======================================================= */}
      {/* Chat Dialog */}
      {/* ======================================================= */}
      {chatOpen && viewingRequest && (
        <Dialog open={chatOpen} onOpenChange={setChatOpen}>
          <DialogContent className="max-w-2xl h-[600px] flex flex-col">
            <DialogHeader>
              <DialogTitle>Chat with {viewingRequest.adopter.name}</DialogTitle>
              <DialogDescription>About {viewingRequest.pet.name}</DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 py-4">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"
                        }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${message.senderId === user?.id
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-900"
                          }`}
                      >
                        <p>{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${message.senderId === user?.id ? "text-purple-200" : "text-gray-500"
                            }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-4 border-t">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
