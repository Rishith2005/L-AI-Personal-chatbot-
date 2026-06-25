export interface User {
  id: string;
  email: string | null;
  role?: string;
}

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  last_message: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'assistant';
  content: string;
  created_at: string;
  sources?: { title: string; url: string }[];
}

