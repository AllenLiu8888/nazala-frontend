// Mock data for testing without backend
export const mockEvents = [
  {
    id: 1,
    round: 1,
    title: "Memory Cloud Storage Launch",
    description: "A large company announces the launch of a 'memory cloud storage' service, allowing users to upload and share their memories. However, once uploaded, the memories become the property of the company.",
    options: [
      {
        id: 'A',
        text: "Allow the company to provide the service, with memories exchanged for free storage space.",
        effects: {
          COMMERCIAL_POWER: 20,
          PERSONAL_PRIVACY: -15,
        }
      },
      {
        id: 'B',
        text: "Oppose the company owning memories and demand that memory ownership belongs solely to individuals.",
        effects: {
          PERSONAL_PRIVACY: 20,
          TECHNOLOGICAL_DEVELOPMENT: -10,
        }
      }
    ]
  },
  {
    id: 2,
    round: 2,
    title: "Memory Enhancement Technology",
    description: "Scientists develop a technology that can enhance human memory capacity by 500%. However, enhanced memories cannot distinguish between real and artificial experiences.",
    options: [
      {
        id: 'A',
        text: "Embrace the technology for its educational and professional benefits.",
        effects: {
          TECHNOLOGICAL_DEVELOPMENT: 25,
          MEMORY_INTEGRITY: -20,
        }
      },
      {
        id: 'B',
        text: "Restrict the technology to medical applications only.",
        effects: {
          MEMORY_INTEGRITY: 15,
          TECHNOLOGICAL_DEVELOPMENT: -5,
        }
      }
    ]
  },
  // Add more events as needed
];

export const mockPlayers = [
  { id: '1', name: 'Player 1', status: 'ready' },
  { id: '2', name: 'Player 2', status: 'ready' },
];

export const initialWorldState = {
  COMMERCIAL_POWER: 50,
  PERSONAL_PRIVACY: 50,
  TECHNOLOGICAL_DEVELOPMENT: 50,
  SOCIAL_EQUALITY: 50,
  CULTURAL_DIVERSITY: 50,
  MEMORY_INTEGRITY: 50,
};