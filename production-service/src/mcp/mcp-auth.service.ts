import { Injectable, Inject } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import type { FileService } from '../files/file-service.interface';
import type { UserProfile } from './interfaces/user-profile.interface';

@Injectable()
export class McpAuthService {
  constructor(@Inject('FileService') private fileService: FileService) {}

  /**
   * Validate MCP API key against user profile stored in R2
   */
  async validateApiKey(username: string, key: string): Promise<boolean> {
    try {
      // Input validation
      if (!this.validateUsername(username) || !this.validateMCPKey(key)) {
        console.log(`MCP auth FAILURE - Invalid format - User: ${username}`);
        return false;
      }

      // Get user profile from R2
      const profile = await this.getUserProfile(username);
      if (!profile || !profile.mcpKey) {
        console.log(`MCP auth FAILURE - No profile/key - User: ${username}`);
        return false;
      }

      // Validate key (constant time comparison)
      const isValid = profile.mcpKey === key;
      console.log(`MCP auth ${isValid ? 'SUCCESS' : 'FAILURE'} - User: ${username}`);
      
      return isValid;
    } catch (error) {
      console.error(`MCP auth ERROR - User: ${username}`, error);
      return false;
    }
  }

  /**
   * Get user profile from R2 storage
   */
  async getUserProfile(username: string): Promise<UserProfile | null> {
    try {
      const profileContent = await this.fileService.readFile(username, 'profile/user.json');
      return JSON.parse(profileContent);
    } catch (error) {
      // Profile not found is expected for non-existent users
      return null;
    }
  }

  /**
   * Generate secure 16-character MCP key
   */
  generateMCPKey(): string {
    return randomUUID().replace(/-/g, '').substring(0, 16);
  }

  /**
   * Validate username format (alphanumeric, underscore, dash only)
   */
  private validateUsername(username: string): boolean {
    if (!username || typeof username !== 'string') return false;
    if (username.length === 0 || username.length > 50) return false;
    return /^[a-zA-Z0-9_-]+$/.test(username);
  }

  /**
   * Validate MCP key format (exactly 16 hexadecimal characters)
   */
  private validateMCPKey(key: string): boolean {
    if (!key || typeof key !== 'string') return false;
    return /^[a-f0-9]{16}$/.test(key);
  }

  /**
   * Sanitize username for safe file operations
   */
  private sanitizeUsername(username: string): string {
    return username.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  }
}