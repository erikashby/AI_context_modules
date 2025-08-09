export interface FileInfo {
  name: string;
  path: string;
  size: number;
  lastModified: Date;
  isDirectory: boolean;
}

export interface UserProfile {
  username: string;
  email: string;
  passwordHash: string;
  apiKey: string;
  createdAt: Date;
  lastActive: Date;
  settings: UserSettings;
}

export interface UserSettings {
  timezone: string;
  theme: 'light' | 'dark';
  notifications: boolean;
}

export interface ModuleInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  author: string;
}

export interface ModuleTemplate {
  module: ModuleInfo;
  structure: Record<string, any>;
  defaultFiles: Record<string, string>;
}

export interface FileService {
  // User Profile Operations
  getUserProfile(username: string): Promise<UserProfile>;
  setUserProfile(username: string, profile: UserProfile): Promise<void>;
  userExists(username: string): Promise<boolean>;

  // Project Operations
  listUserProjects(username: string): Promise<string[]>;
  createProject(
    username: string,
    projectName: string,
    moduleId: string,
  ): Promise<void>;
  deleteProject(username: string, projectName: string): Promise<void>;

  // File Operations (Core MCP Tools)
  readFile(username: string, path: string): Promise<string>;
  writeFile(username: string, path: string, content: string): Promise<void>;
  deleteFile(username: string, path: string): Promise<void>;
  listFiles(username: string, path: string): Promise<FileInfo[]>;
  createFolder(username: string, folderPath: string): Promise<void>;
  removeFolder(username: string, folderPath: string, recursive?: boolean): Promise<void>;

  // Module Template Operations
  listAvailableModules(): Promise<ModuleInfo[]>;
  getModuleTemplate(moduleId: string): Promise<ModuleTemplate>;

  // Security & Validation
  validatePath(username: string, path: string): boolean;
  sanitizePath(path: string): string;
}
