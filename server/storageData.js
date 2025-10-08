// Export in-memory data for migration
import { storage } from './storage.ts';

// Convert Map to Array for each data type
export const users = Array.from(storage.users.values());
export const vendors = Array.from(storage.vendors.values());
export const solutions = Array.from(storage.solutions.values());
export const challenges = Array.from(storage.challenges.values());
export const applications = Array.from(storage.applications.values());
export const chatMessages = Array.from(storage.chatMessages.values());
