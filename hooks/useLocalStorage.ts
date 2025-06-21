
import { useState, useEffect } from 'react';

function useLocalStorage<T,>(key: string, initialValue: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item) as T;
      }
      // If initialValue is a function, call it to get the value. Otherwise, use it directly.
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      // Fallback to initialValue logic in case of error too
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    }
  });

  useEffect(() => {
    try {
      // Avoid storing "undefined" as a string if storedValue becomes undefined
      if (typeof storedValue !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } else {
        // If the value is undefined, we might want to remove the item from localStorage
        // or store it as null, depending on desired behavior. Removing is cleaner.
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;