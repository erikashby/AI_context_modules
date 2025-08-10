/**
 * Module metadata structure from module.json
 */
export interface ModuleMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  created: string;
  updated: string;
  path?: string;
  source?: 'r2' | 'github';
  features?: string[];
}

/**
 * Complete module.json structure
 */
export interface ModuleJson {
  module: ModuleMetadata;
  structure?: Record<string, string>;
  features?: string[];
}

/**
 * Module validation result
 */
export interface ModuleValidationResult {
  isValid: boolean;
  errors: string[];
  metadata: ModuleMetadata | null;
  structure: {
    hasConfiguration: boolean;
    hasContent: boolean;
    hasProtectedFiles: boolean;
    hasModuleJson: boolean;
    hasReadme: boolean;
  };
}

/**
 * Module list item for display
 */
export interface ModuleListItem {
  id: string;
  name: string;
  description: string;
  version: string;
  features?: string[];
  source: 'r2' | 'github';
}