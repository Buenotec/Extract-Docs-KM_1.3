import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return 'dark'; // Default to dark mode as preferred
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  return (
    <div
      className="inline-flex items-center p-1 rounded-xl bg-stone-200/80 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 shadow-2xs"
      role="group"
      aria-label="Seletor de Tema Claro ou Escuro"
    >
      <button
        type="button"
        id="theme-btn-light"
        onClick={() => toggleTheme('light')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
          theme === 'light'
            ? 'bg-white text-stone-900 shadow-xs border border-stone-300/80 font-bold'
            : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
        }`}
        title="Mudar para Tema Claro (Light)"
      >
        <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>Claro</span>
      </button>

      <button
        type="button"
        id="theme-btn-dark"
        onClick={() => toggleTheme('dark')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
          theme === 'dark'
            ? 'bg-stone-900 text-white shadow-xs dark:bg-stone-700 dark:text-stone-100 font-bold border border-stone-600'
            : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
        }`}
        title="Mudar para Tema Escuro (Dark)"
      >
        <Moon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span>Escuro</span>
      </button>
    </div>
  );
}
