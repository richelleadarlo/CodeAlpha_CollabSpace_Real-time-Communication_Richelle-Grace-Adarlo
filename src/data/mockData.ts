export interface Participant {
  id: string;
  name: string;
  initials: string;
  color: string;
  isMuted?: boolean;
  isCameraOff?: boolean;
  isSpeaking?: boolean;
  avatarUrl?: string | null;
}

export interface Room {
  id: string;
  name: string;
  subtitle: string;
  participants: Participant[];
  isLive?: boolean;
  hasScreenShare?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isOwn?: boolean;
}

export interface SharedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  sharedBy: string;
  timestamp: Date;
  storagePath?: string;
}

const COLORS = [
  'hsl(162 63% 41%)', 'hsl(220 70% 55%)', 'hsl(38 92% 56%)',
  'hsl(340 65% 55%)', 'hsl(270 60% 55%)', 'hsl(190 70% 45%)',
];

export const mockParticipants: Participant[] = [
  { id: '1', name: 'Kate Smith', initials: 'KS', color: COLORS[0] },
  { id: '2', name: 'Alexandra Opalan', initials: 'AO', color: COLORS[1] },
  { id: '3', name: 'John Hudson', initials: 'JH', color: COLORS[2] },
  { id: '4', name: 'Martin Chen', initials: 'MC', color: COLORS[3] },
  { id: '5', name: 'Sarah Rivera', initials: 'SR', color: COLORS[4] },
  { id: '6', name: 'David Park', initials: 'DP', color: COLORS[5] },
];

export const mockRooms: Room[] = [
  {
    id: 'room-1',
    name: 'Subscription Growth Experiments',
    subtitle: 'Sprint Retrospective',
    participants: mockParticipants.slice(0, 3),
    isLive: true,
  },
  {
    id: 'room-2',
    name: 'Weekly Insights',
    subtitle: 'Data Review',
    participants: mockParticipants.slice(1, 4),
  },
  {
    id: 'room-3',
    name: 'Product Strategy 2025',
    subtitle: 'No upcoming meetings',
    participants: mockParticipants.slice(2, 5),
  },
  {
    id: 'room-4',
    name: 'User Onboarding Team',
    subtitle: 'Sprint Planning',
    participants: mockParticipants.slice(0, 2),
    isLive: true,
  },
  {
    id: 'room-5',
    name: 'User & Market Research',
    subtitle: 'No upcoming meetings',
    participants: mockParticipants.slice(3, 6),
  },
  {
    id: 'room-6',
    name: 'Core Product Team',
    subtitle: 'Core Product Team',
    participants: mockParticipants.slice(1, 5),
    hasScreenShare: true,
  },
];

export const mockMessages: ChatMessage[] = [
  { id: '1', senderId: '2', senderName: 'Alexandra Opalan', text: "Hi everyone, let's start the call soon 😊", timestamp: new Date(Date.now() - 300000) },
  { id: '2', senderId: '2', senderName: 'Alexandra Opalan', text: "Hey! I'm waiting 😊", timestamp: new Date(Date.now() - 240000) },
  { id: '3', senderId: '3', senderName: 'John Hudson', text: 'Hello all!', timestamp: new Date(Date.now() - 180000) },
  { id: '4', senderId: '4', senderName: 'Martin Chen', text: 'Are we waiting for absent teammates?', timestamp: new Date(Date.now() - 120000) },
  { id: '5', senderId: 'me', senderName: 'You', text: 'I suggest to start this call a little bit later 😊', timestamp: new Date(Date.now() - 60000), isOwn: true },
  { id: '6', senderId: '2', senderName: 'Alexandra Opalan', text: "Hey! I'm waiting 😊", timestamp: new Date(Date.now() - 30000) },
  { id: '7', senderId: '2', senderName: 'Alexandra Opalan', text: 'Started the call', timestamp: new Date() },
];

export const mockFiles: SharedFile[] = [
  { id: '1', name: 'Q4-Report.pdf', size: '2.4 MB', type: 'pdf', sharedBy: 'Kate Smith', timestamp: new Date(Date.now() - 600000) },
  { id: '2', name: 'Design-Mockups.fig', size: '18 MB', type: 'figma', sharedBy: 'Alexandra Opalan', timestamp: new Date(Date.now() - 300000) },
  { id: '3', name: 'Meeting-Notes.docx', size: '145 KB', type: 'doc', sharedBy: 'John Hudson', timestamp: new Date(Date.now() - 120000) },
];
