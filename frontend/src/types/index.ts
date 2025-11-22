export type UserRole = 'parent' | 'adopter';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  occupation?: string;
  address?: string;
  availableTime?: string;
  pastExperience?: string;
}

export interface Pet {
  id: string;
  parentId: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  breed: string;
  type: string;
  vaccinated: boolean;
  address: string;
  description: string;
  images: string[];
  status: 'available' | 'pending' | 'adopted';
  adoptedBy?: string;
}

export type Adoptable = {
  id: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  vaccinated?: boolean;
  status?: "available" | "adopted";
  image?: string;
  [key: string]: any;
};

export interface AdoptionRequest {
  id: string;
  petId: string;
  adopterId: string;
  parentId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface HealthRecord {
  id: string;
  petId: string;
  date: string;
  weight: number;
  height: number;
  notes?: string;
}

export interface Message {
  id: string;
  adoptionRequestId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}
