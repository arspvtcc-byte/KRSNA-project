export type ModeId = 
  | 'FINANCE' 
  | 'RELATIONSHIP' 
  | 'ACADEMICS' 
  | 'FAMILY' 
  | 'FUTURE' 
  | 'LOST' 
  | 'COMPANION' 
  | 'GROWTH';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: ModeId;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  age: string;
  language: string;
  timezone: string;
  communicationStyle: string;
  personalGoals: string;
  relationshipStatus: string;
  academicFocus: string;
  financialPriorities: string;
  coreValues: string;
}

export interface AuthStatus {
  deviceId: string;
  approved: boolean;
  token?: string;
}
