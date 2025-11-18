// Minimal runtime "types" used across the app. These are plain JS shapes
// exported so other modules can import them without TypeScript syntax.

export const User = function () {
  return {
    id: "",
    name: "",
    email: "",
    role: "adopter",
  };
};

export const Pet = function () {
  return {
    id: "",
    parentId: "",
    name: "",
    age: 0,
    weight: 0,
    height: 0,
    breed: "",
    type: "",
    vaccinated: false,
    address: "",
    description: "",
    images: [],
    status: "available",
  };
};

export const AdoptionRequest = function () {
  return {
    id: "",
    adopterId: "",
    parentId: "",
    petId: "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };
};

export const Message = function () {
  return {
    id: "",
    adoptionRequestId: "",
    senderId: "",
    receiverId: "",
    text: "",
    timestamp: new Date().toISOString(),
  };
};
