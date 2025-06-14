
import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

const useDarkMode = (): [boolean, () => void] => {
  const [enabled, setEnabled] = useLocalStorage<boolean>('darkModeEnabled', 
    typeof window !== "undefined" ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
  );

  useEffect(() => {
    const className = 'dark';
    const bodyClass = window.document.documentElement.classList;

    enabled ? bodyClass.add(className) : bodyClass.remove(className);
  }, [enabled]);

  const toggleDarkMode = () => {
    setEnabled(prev => !prev);
  };

  return [enabled, toggleDarkMode];
};

export default useDarkMode;
