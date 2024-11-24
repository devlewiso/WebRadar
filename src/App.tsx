import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { WebsiteCard } from './components/WebsiteCard';
import { AddWebsiteModal } from './components/AddWebsiteModal';
import { ThemeToggle } from './components/ThemeToggle';
import { Website, Theme } from './types';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [websites, setWebsites] = useState<Website[]>([
    { id: 1, name: 'GitHub', url: 'https://github.com', icon: '🐱' },
    { id: 2, name: 'Gmail', url: 'https://gmail.com', icon: '📧' },
    { id: 3, name: 'Drive', url: 'https://drive.google.com', icon: '📁' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<Theme>({
    name: 'dark',
    background: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e',
    isDark: true,
  });

  const addWebsite = (website: Omit<Website, 'id'>) => {
    setWebsites([...websites, { ...website, id: Date.now() }]);
    setShowModal(false);
  };

  const removeWebsite = (id: number) => {
    setWebsites(websites.filter(site => site.id !== id));
  };

  const filteredWebsites = websites.filter(site => 
    site.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed transition-all duration-300"
      style={{ backgroundImage: `url('${theme.background}')` }}
    >
      <div className={`min-h-screen backdrop-blur-sm ${
        theme.isDark ? 'bg-black/30' : 'bg-white/30'
      } p-8 flex flex-col`}>
        {/* Header Controls */}
        <div className="flex justify-between items-start mb-12">
          {/* Add Website Button */}
          <button
            onClick={() => setShowModal(true)}
            className={`p-2 rounded-lg backdrop-blur-md transition-all group flex items-center gap-2 ${
              theme.isDark
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-black/10 hover:bg-black/20 text-gray-800'
            }`}
          >
            <Plus className={`w-5 h-5 ${
              theme.isDark
                ? 'text-white/60 group-hover:text-white'
                : 'text-black/60 group-hover:text-black'
            }`} />
            <span className={theme.isDark ? 'text-white/80' : 'text-black/80'}>
              Add Website
            </span>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle currentTheme={theme} onThemeChange={setTheme} />
        </div>
        
        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-12 w-full">
          <div className={`backdrop-blur-md rounded-lg p-2 flex items-center border ${
            theme.isDark 
              ? 'bg-white/10 border-white/20' 
              : 'bg-black/5 border-black/10'
          }`}>
            <Search className={`w-5 h-5 ml-2 ${
              theme.isDark ? 'text-white/60' : 'text-black/60'
            }`} />
            <input
              type="text"
              placeholder="Search websites..."
              className={`bg-transparent w-full px-4 py-2 outline-none ${
                theme.isDark 
                  ? 'text-white placeholder-white/60' 
                  : 'text-gray-800 placeholder-black/60'
              }`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Websites Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-auto">
          {filteredWebsites.map(website => (
            <WebsiteCard
              key={website.id}
              website={website}
              onRemove={() => removeWebsite(website.id)}
              isDark={theme.isDark}
            />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <a
            href="https://neuralcodelab.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-sm ${
              theme.isDark 
                ? 'text-white/40 hover:text-white/60' 
                : 'text-black/40 hover:text-black/60'
            } transition-colors`}
          >
            <span>Created by</span>
            <span className="font-semibold">neuralcodelab.com</span>
          </a>
        </footer>

        {/* Add Website Modal */}
        {showModal && (
          <AddWebsiteModal
            onAdd={addWebsite}
            onClose={() => setShowModal(false)}
            isDark={theme.isDark}
          />
        )}
      </div>
    </div>
  );
}

export default App;