// src/utils/dateUtils.ts
import { Timestamp } from 'firebase/firestore';

export function toJSDate(date: string | Timestamp | Date | undefined): Date | null {
  if (!date) return null;
  
  if (typeof date === 'string') {
    return new Date(date);
  }
  
  if (date instanceof Timestamp) {
    return date.toDate();
  }
  
  return date;
}