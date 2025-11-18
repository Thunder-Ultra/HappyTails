import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { Pet, User, Message, AdoptionRequest } from "../types";

import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

import {
  ArrowLeft,
  MapPin,
  Heart,
  CheckCircle,
  MessageCircle,
  Send,
} from "lucide-react";

import { toast } from "sonner";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";

export default function PetDetailsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [pet, setPet] = useState<Pet | null>(null);
  const [parent, setParent] = useState<User | null>(null);
  const [myRequest, setMyRequest] = useState<AdoptionRequest | null>(null);

  const [chatOpen, setChatOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // ------------------------
  // LOAD PET DETAILS
  // ------------------------
  useEffect(() => {
    if (id) loadPetDetails(id);
  }, [id]);

  const loadPetDetails = (petId: string) => {
    const pets: Pet[] = JSON.parse(localStorage.getItem("pets") || "[]");
    const foundPet = pets.find((p) => p.id === petId);

    if (!foundPet) {
      setPet(null);
      return;
    }

    setPet(foundPet);

    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    const foundParent = users.find((u) => u.id === foundPet.parentId) || null;
    setParent(foundParent);

    if (user) {
      const requests: AdoptionRequest[] = JSON.parse(
        localStorage.getItem("adoptionRequests") || "[]"
      );

      const req = requests.find(
        (r) => r.petId === foundPet.id && r.adopterId === user.id
      );

      setMyRequest(req || null);
    }
  };

  // ------------------------
  // CHAT MESSAGES
  // ------------------------
  useEffect(() => {
    if (chatOpen && myRequest) loadMessages();
  }, [chatOpen, myRequest]);

  const loadMessages = () => {
    if (!myRequest) return;

    const allMessages: Message[] = JSON.parse(
      localStorage.getItem("messages") || "[]"
    );

    const requestMessages = allMessages.filter(
      (m) => m.adoptionRequestId === myRequest.id
    );

    setMessages(
      requestMessages.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() -
          new Date(b.timestamp).getTime()
      )
    );
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !myRequest || !user || !pet) return;

    const allMessages: Message[] = JSON.parse(
      localStorage.getItem("messages") || "[]"
    );

    const message: Message = {
      id: Date.now().toString(),
      adoptionRequestId: myRequest.id,
      senderId: user.id,
      receiverId: pet.parentId,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    allMessages.push(message);
    localStorage.setItem("messages", JSON.stringify(allMessages));

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  // ------------------------
  // ADOPTION REQUEST
  // ------------------------
  const handleAdoptionRequest = () => {
    if (!user || !pet) return;

    const requests: AdoptionRequest[] = JSON.parse(
      localStorage.getItem("adoptionRequests") || "[]"
    );

    const existing = requests.find(
      (r) =>
        r.petId === pet.id &&
        r.adopterId === user.id &&
        r.status === "pending"
    );

    if (existing) {
      toast.info("You already sent a request.");
      return;
    }

    const newRequest: AdoptionRequest = {
      id: Date.now().toString(),
      petId: pet.id,
      adopterId: user.id,
      parentId: pet.parentId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    requests.push(newRequest);
    localStorage.setItem("adoptionRequests", JSON.stringify(requests));

    toast.success("Adoption request sent!");
    setMyRequest(newRequest);
  };

  // ------------------------
  // PET NOT FOUND
  // ------------------------
  if (!pet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Pet not found</p>
        <Button onClick={() => navigate("/home")}>Back to Home</Button>
      </div>
    );
  }

  // ------------------------
  // COMPONENT JSX
  // ------------------------
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back */}
      <Button variant="ghost" className="mb-6" onClick={() => navigate("/home")}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Browse
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* ------------------ */}
        {/* IMAGE GALLERY */}
        {/* ------------------ */}
        <div>
          {pet.images.length === 1 ? (
            <ImageWithFallback
              src={pet.images[0]}
              alt={pet.name}
              className="w-full rounded-xl aspect-square object-cover"
            />
          ) : (
            <Carousel className="w-full">
              <CarouselContent>
                {pet.images.map((img: string, i: number) => (
                  <CarouselItem key={i}>
                    <div className="rounded-xl overflow-hidden">
                      <ImageWithFallback
                        src={img}
                        alt={`${pet.name} ${i + 1}`}
                        className="w-full aspect-square object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          )}
        </div>

        {/* ------------------ */}
        {/* PET INFO */}
        {/* ------------------ */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl mb-1">{pet.name}</h1>
              <p className="text-xl text-gray-600">{pet.breed}</p>
            </div>

            <Badge
              variant={pet.status === "available" ? "default" : "secondary"}
              className="text-sm"
            >
              {pet.status}
            </Badge>
          </div>

          {pet.vaccinated && (
            <div className="flex items-center text-green-600 mb-6">
              <CheckCircle className="h-5 w-5 mr-2" /> Fully Vaccinated
            </div>
          )}

          {/* INFO CARD */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p>{pet.age} years</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p>{pet.type}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p>{pet.weight} kg</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Height</p>
                  <p>{pet.height} cm</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ABOUT */}
          <div className="mb-6">
            <h2 className="text-xl mb-3">About {pet.name}</h2>
            <p className="text-gray-700">{pet.description}</p>
          </div>

          {/* LOCATION */}
          <div className="mb-6">
            <h2 className="text-xl mb-3">Location</h2>
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <p>{pet.address}</p>
            </div>
          </div>

          {/* ------------------ */}
          {/* Adoption Button */}
          {/* ------------------ */}
          {pet.status === "available" &&
            user &&
            user.role === "adopter" &&
            !myRequest && (
              <Button className="w-full" size="lg" onClick={handleAdoptionRequest}>
                <Heart className="h-5 w-5 mr-2" />
                Interested — Adopt {pet.name}
              </Button>
            )}

          {/* Request Status + Chat */}
          {myRequest && user?.role === "adopter" && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-center text-sm">
                  Your request is{" "}
                  <Badge
                    variant={
                      myRequest.status === "accepted"
                        ? "default"
                        : myRequest.status === "pending"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {myRequest.status}
                  </Badge>
                </p>
              </div>

              {myRequest.status === "accepted" && (
                <Button className="w-full" size="lg" onClick={() => setChatOpen(true)}>
                  <MessageCircle className="h-5 w-5 mr-2" /> Chat with Pet
                  Parent
                </Button>
              )}
            </div>
          )}

          {/* Not logged in */}
          {!user && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-center text-sm">
                <button onClick={() => navigate("/login")} className="text-purple-600 underline">
                  Sign in
                </button>{" "}
                or{" "}
                <button onClick={() => navigate("/register")} className="text-purple-600 underline">
                  Create an account
                </button>{" "}
                to adopt this pet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ------------------ */}
      {/* CHAT DIALOG */}
      {/* ------------------ */}
      {chatOpen && myRequest && parent && (
        <Dialog open={chatOpen} onOpenChange={setChatOpen}>
          <DialogContent className="max-w-2xl h-[600px] flex flex-col">
            <DialogHeader>
              <DialogTitle>Chat with {parent.name}</DialogTitle>
              <DialogDescription>About {pet.name}</DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 py-4">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm">
                    No messages yet.
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderId === user?.id ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          msg.senderId === user?.id
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.senderId === user?.id
                              ? "text-purple-200"
                              : "text-gray-500"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString()}
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
