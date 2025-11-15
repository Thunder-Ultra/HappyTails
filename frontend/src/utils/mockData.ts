import { Pet } from '../types';

export const initializeMockData = () => {
  // Check if data already exists
  const existingPets = localStorage.getItem('pets');
  
  if (!existingPets) {
    const mockPets: Pet[] = [
      {
        id: '1',
        parentId: 'mock-parent-1',
        name: 'Max',
        age: 2,
        weight: 25,
        height: 60,
        breed: 'Golden Retriever',
        type: 'Dog',
        vaccinated: true,
        address: '123 Maple Street, San Francisco, CA',
        description: 'Max is a friendly and energetic Golden Retriever who loves to play fetch and go on long walks. He is great with kids and other pets.',
        images: [
          'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800&q=80',
          'https://images.unsplash.com/photo-1612536989959-9b58e0e9d300?w=800&q=80'
        ],
        status: 'available'
      },
      {
        id: '2',
        parentId: 'mock-parent-1',
        name: 'Luna',
        age: 1,
        weight: 4,
        height: 25,
        breed: 'Persian',
        type: 'Cat',
        vaccinated: true,
        address: '456 Oak Avenue, Los Angeles, CA',
        description: 'Luna is a sweet and gentle Persian cat with beautiful long fur. She loves to cuddle and is very affectionate.',
        images: [
          'https://images.unsplash.com/photo-1573865526739-10c1dd12f6bb?w=800&q=80',
          'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80'
        ],
        status: 'available'
      },
      {
        id: '3',
        parentId: 'mock-parent-2',
        name: 'Charlie',
        age: 3,
        weight: 15,
        height: 45,
        breed: 'Beagle',
        type: 'Dog',
        vaccinated: true,
        address: '789 Pine Road, Seattle, WA',
        description: 'Charlie is a playful Beagle with a great sense of smell. He enjoys outdoor activities and is very curious about everything.',
        images: [
          'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800&q=80'
        ],
        status: 'available'
      },
      {
        id: '4',
        parentId: 'mock-parent-2',
        name: 'Bella',
        age: 4,
        weight: 20,
        height: 55,
        breed: 'Labrador',
        type: 'Dog',
        vaccinated: false,
        address: '321 Birch Lane, Portland, OR',
        description: 'Bella is a calm and loving Labrador who enjoys swimming and being around people. She is well-trained and obedient.',
        images: [
          'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80'
        ],
        status: 'available'
      },
      {
        id: '5',
        parentId: 'mock-parent-3',
        name: 'Whiskers',
        age: 2,
        weight: 5,
        height: 28,
        breed: 'Siamese',
        type: 'Cat',
        vaccinated: true,
        address: '654 Cedar Drive, Denver, CO',
        description: 'Whiskers is an elegant Siamese cat with striking blue eyes. She is vocal and loves to communicate with her humans.',
        images: [
          'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800&q=80'
        ],
        status: 'available'
      },
      {
        id: '6',
        parentId: 'mock-parent-3',
        name: 'Rocky',
        age: 5,
        weight: 30,
        height: 65,
        breed: 'German Shepherd',
        type: 'Dog',
        vaccinated: true,
        address: '987 Elm Street, Austin, TX',
        description: 'Rocky is a loyal and protective German Shepherd. He is well-trained and makes an excellent guard dog while being gentle with family.',
        images: [
          'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800&q=80'
        ],
        status: 'available'
      }
    ];

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
