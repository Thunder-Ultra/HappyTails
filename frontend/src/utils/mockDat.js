import { Pet } from '../types';

export const initializeMockData = () => {
  // Check if data already exists
  const existingPets = localStorage.getItem('pets');

  if (!existingPets) {
    const mockPets = [
      {
        id: '1',
        parentId,
        name,
        age,
        weight,
        height,
        breed,
        type,
        vaccinated,
        address, San Francisco, CA',
        description,
        images=800&q=80',
          'https://images.unsplash.com/photo-1612536989959-9b58e0e9d300?w=800&q=80'
        ],
        status,
      {
        id: '2',
        parentId,
        name,
        age,
        weight,
        height,
        breed,
        type,
        vaccinated,
        address, Los Angeles, CA',
        description,
        images=800&q=80',
          'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80'
        ],
        status,
      {
        id: '3',
        parentId,
        name,
        age,
        weight,
        height,
        breed,
        type,
        vaccinated,
        address, Seattle, WA',
        description,
        images=800&q=80'
        ],
        status,
      {
        id: '4',
        parentId,
        name,
        age,
        weight,
        height,
        breed,
        type,
        vaccinated,
        address, Portland, OR',
        description,
        images=800&q=80'
        ],
        status,
      {
        id: '5',
        parentId,
        name,
        age,
        weight,
        height,
        breed,
        type,
        vaccinated,
        address, Denver, CO',
        description,
        images=800&q=80'
        ],
        status,
      {
        id: '6',
        parentId,
        name,
        age,
        weight,
        height,
        breed,
        type,
        vaccinated,
        address, Austin, TX',
        description,
        images=800&q=80'
        ],
        status];

    localStorage.setItem('pets', JSON.stringify(mockPets));
  }

  // Initialize empty arrays for requests, health records, and messages if they don't exist
  if (!localStorage.getItem('adoptionRequests')) {
    localStorage.setItem('adoptionRequests', JSON.stringify([]));
  }

  if (!localStorage.getItem('healthRecords')) {
    localStorage.setItem('healthRecords', JSON.stringify([]));
  }

  if (!localStorage.getItem('messages')) {
    localStorage.setItem('messages', JSON.stringify([]));
  }
};
