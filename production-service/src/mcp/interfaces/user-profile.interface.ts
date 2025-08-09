export interface UserProfile {
  username: string;
  email: string;
  passwordHash: string;
  mcpKey: string;
  created: string; // ISO timestamp
  lastActive: string; // ISO timestamp
  projects: string[];
  settings: UserSettings;
}

export interface UserSettings {
  theme?: 'light' | 'dark';
  notifications?: boolean;
  [key: string]: any;
}
