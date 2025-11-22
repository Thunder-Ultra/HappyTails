// src/components/AdoptableCard.tsx
import React from "react";
import { Adoptable } from "../types";

export function AdoptableCard({ adoptable, onShowDetails }: {
  adoptable: Adoptable;
  onShowDetails: (id: string) => void;
}) {
  return (
    <div
      className="border rounded-lg shadow-sm cursor-pointer"
      onClick={() => onShowDetails(adoptable.id)}
    >
      <img
        src={adoptable.image}
        alt={adoptable.name}
        className="w-full h-40 object-cover rounded-t-lg"
        loading="lazy"
      />
      <div className="p-4">
        <h3 className="font-semibold">{adoptable.name}</h3>
        <p className="text-sm text-gray-500">{adoptable.breed}</p>
        <p className="text-sm">{adoptable.age} years old</p>
        <p className="text-sm">
          {adoptable.vaccinated ? "Vaccinated ✓" : "Not Vaccinated"}
        </p>
      </div>
    </div>
  );
}
