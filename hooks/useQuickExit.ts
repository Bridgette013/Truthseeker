import { useEffect, useCallback, useRef } from 'react';

export const useQuickExit = () => {
  // Use weather as a safe, innocuous landing page
  const exitUrl = 'https://www.google.com/search?q=weather';
  
  // Use ref to track time between key presses to avoid closure staleness
  const lastEscTime = useRef<number>(0);

  const performExit = useCallback(() => {
    // Replace current history entry so back button doesn't return here
    try {
        window.history.replaceState(null, '', window.location.href);
    } catch (e) {
        // Ignore history errors
    }
    
    // Navigate away immediately
    window.location.replace(exitUrl);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const now = Date.now();
        // Check for double press within 500ms
        if (now - lastEscTime.current < 500) {
          performExit();
        }
        lastEscTime.current = now;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [performExit]);

  return { performExit };
};