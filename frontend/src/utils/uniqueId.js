// Wrapper for shortid to provide a consistent uniqueId utility
import { generate as uniqueIdGenerator } from 'shortid';

export default function uniqueId() {
  return uniqueIdGenerator();
}

// Also export the generate function to make it compatible with existing code
export const generate = uniqueIdGenerator;
