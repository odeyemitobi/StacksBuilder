'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-muted animate-pulse" />
    );
  }

  const themes = [
    { name: 'light', icon: FiSun, label: 'Light' },
    { name: 'dark', icon: FiMoon, label: 'Dark' },
    { name: 'system', icon: FiMonitor, label: 'System' },
  ];

  return (
    <div className="relative group">
      <button
        type="button"
        className="w-9 h-9 rounded-lg bg-muted hover:bg-accent transition-colors duration-200 flex items-center justify-center border border-border cursor-pointer"
        aria-label="Toggle theme"
      >
        {theme === 'light' && <FiSun className="w-4 h-4 text-foreground" />}
        {theme === 'dark' && <FiMoon className="w-4 h-4 text-foreground" />}
        {theme === 'system' && <FiMonitor className="w-4 h-4 text-foreground" />}
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-32 bg-card rounded-lg shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            return (
              <button
                type="button"
                key={themeOption.name}
                onClick={() => setTheme(themeOption.name)}
                className={`flex items-center space-x-2 w-full px-3 py-2 text-sm transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg cursor-pointer ${
                  theme === themeOption.name
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{themeOption.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
