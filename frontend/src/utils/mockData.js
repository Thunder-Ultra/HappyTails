// Minimal mock data initializer — keeps shape simple and avoids syntax errors
export function initializeMockData() {
  if (!localStorage.getItem("pets")) {
    const mockPets = [
      {
        id: "1",
        parentId: "p1",
        name: "Buddy",
        age: 3,
        weight: 12,
        height: 30,
        breed: "Mixed",
        type: "Dog",
        vaccinated: true,
        address: "San Francisco, CA",
        description: "Friendly and playful",
        images: [
          "https://images.unsplash.com/photo-1612536989959-9b58e0e9d300?w=800&q=80",
        ],
        status: "available",
      },
    ];

    localStorage.setItem("pets", JSON.stringify(mockPets));
  }

  if (!localStorage.getItem("adoptionRequests")) {
    localStorage.setItem("adoptionRequests", JSON.stringify([]));
  }

  if (!localStorage.getItem("healthRecords")) {
    localStorage.setItem("healthRecords", JSON.stringify([]));
  }

  if (!localStorage.getItem("messages")) {
    localStorage.setItem("messages", JSON.stringify([]));
  }
}
