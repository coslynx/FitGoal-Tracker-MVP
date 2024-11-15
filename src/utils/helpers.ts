import moment from 'moment';
import { Goal } from '@api/models/goalInterface';
import { ProgressEntry } from '@api/models/progressInterface';

/**
 * Formats a date object into a user-friendly string.
 * @param date - The date object to format.  Throws an error if date is invalid.
 * @returns A formatted date string (MMMM D, YYYY).
 */
export const formatDate = (date: Date): string => {
  if (!moment(date).isValid()) {
    throw new Error('Invalid date provided');
  }
  return moment(date).format('MMMM D, YYYY');
};


/**
 * Calculates the progress percentage based on goal and progress entries.
 * @param goal - The goal object. Throws error if goal is invalid.
 * @param progressEntries - An array of progress entries. Throws error if entries are invalid.
 * @returns The progress percentage (0-100). Returns 0 if no progress entries.
 */
export const calculateProgress = (goal: Goal, progressEntries: ProgressEntry[]): number => {
  if (!goal || !goal.targetValue || !goal.goalType) {
    throw new Error('Invalid goal object provided');
  }
  if (!Array.isArray(progressEntries)) {
      throw new Error('Invalid progress entries provided');
  }

  const totalProgress = progressEntries.reduce((sum, entry) => sum + entry.progressValue, 0);

  if (totalProgress === 0) return 0;

  //Handle different goal types if needed in future iterations
  //For now, assume a simple percentage calculation
  return Math.min(Math.round((totalProgress / goal.targetValue) * 100), 100);
};

/**
 * Sanitizes user input to prevent XSS attacks.  Throws an error if input is invalid.
 * @param input - The input string to sanitize.  Throws error if input is not a string.
 * @returns The sanitized string.
 */

export const sanitizeInput = (input: string): string => {
    if(typeof input !== 'string'){
        throw new Error("Invalid input type. Input must be a string.")
    }
    //In a real application, use a robust library like DOMPurify.  For this MVP, we'll use a simple escape for demonstration
    return input.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
}
```