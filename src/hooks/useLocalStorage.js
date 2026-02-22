/**
 * useLocalStorage.js
 * A custom React hook that works like useState, but automatically
 * saves and loads the value from the browser's localStorage.
 *
 * This means data persists even when you close and reopen the browser.
 *
 * Usage:
 *   const [name, setName] = useLocalStorage('my_key', 'default value');
 *   // Works just like useState, but 'name' is saved to localStorage under 'my_key'
 */

import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
