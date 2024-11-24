import React, { useState, useCallback } from 'react';
import { Sun, Moon, Image, Link, Upload } from 'lucide-react';
import { Theme } from '../types';

interface Props {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function ThemeToggle({ currentTheme, onThemeChange }: Props) {
  const [backgroundInput, setBackgroundInput] = useState({
    isVisible: false,
    url: ''
  });

  // Optimiza las funciones con useCallback
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onThemeChange({
          ...currentTheme,
          background: reader.result as string,
          isCustomBackground: true
        });
      };
      reader.readAsDataURL(file);
    }
  }, [onThemeChange, currentTheme]);

  const handleUrlSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (backgroundInput.url) {
      onThemeChange({
        ...currentTheme,
        background: backgroundInput.url,
        isCustomBackground: true
      });
      setBackgroundInput({ ...backgroundInput, url: '' });
    }
  }, [backgroundInput, onThemeChange, currentTheme]);

  const toggleBackgroundInput = () => {
    setBackgroundInput({ ...backgroundInput, isVisible: !backgroundInput.isVisible });
  };

  const toggleTheme = () => {
    onThemeChange({ ...currentTheme, isDark: !currentTheme.isDark });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative group">
        <button 
          onClick={toggleBackgroundInput}
          className={`p-2 rounded-lg backdrop-blur-md transition-all ${
            currentTheme.isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
          }`}
          aria-label="Change background"
        >
          <Image className={`w-5 h-5 ${currentTheme.isDark ? 'text-white' : 'text-gray-800'}`} />
        </button>
        
        {backgroundInput.isVisible && (
          <div className="absolute right-0 top-full mt-2 w-80">
            <div className={`rounded-lg p-4 shadow-xl backdrop-blur-md ${
              currentTheme.isDark ? 'bg-gray-800/95' : 'bg-white/95'
            }`}>
              <div className="space-y-4">
                {/* URL Input */}
                <form onSubmit={handleUrlSubmit} className="space-y-2">
                  <label className={`block text-sm ${currentTheme.isDark ? 'text-white/60' : 'text-gray-600'}`}>
                    Background Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={backgroundInput.url}
                      onChange={(e) => setBackgroundInput({ ...backgroundInput, url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className={`flex-1 px-3 py-1.5 rounded-lg outline-none ${
                        currentTheme.isDark
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'bg-black/5 text-gray-800 border border-black/10'
                      }`}
                    />
                    <button
                      type="submit"
                      className={`p-2 rounded-lg ${
                        currentTheme.isDark
                          ? 'bg-white/10 hover:bg-white/20 text-white'
                          : 'bg-black/5 hover:bg-black/10 text-gray-800'
                      }`}
                    >
                      <Link className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* File Upload */}
                <div className="space-y-2">
                  <label className={`block text-sm ${currentTheme.isDark ? 'text-white/60' : 'text-gray-600'}`}>
                    Upload Image
                  </label>
                  <label className={`flex items-center justify-center w-full p-3 rounded-lg border-2 border-dashed cursor-pointer ${
                    currentTheme.isDark
                      ? 'border-white/20 hover:border-white/40 text-white/60'
                      : 'border-black/20 hover:border-black/40 text-gray-600'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span>Choose file</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg backdrop-blur-md transition-all ${
          currentTheme.isDark
            ? 'bg-white/10 hover:bg-white/20'
            : 'bg-black/10 hover:bg-black/20'
        }`}
        aria-label="Toggle theme"
      >
        {currentTheme.isDark ? (
          <Sun className={`w-5 h-5 ${currentTheme.isDark ? 'text-white' : 'text-gray-800'}`} />
        ) : (
          <Moon className={`w-5 h-5 ${currentTheme.isDark ? 'text-white' : 'text-gray-800'}`} />
        )}
      </button>
    </div>
  );
}
