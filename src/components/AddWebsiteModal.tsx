import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Website } from '../types';

interface Props {
  onAdd: (website: Omit<Website, 'id'>) => void;
  onClose: () => void;
  isDark: boolean;
}

export function AddWebsiteModal({ onAdd, onClose, isDark }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    icon: '🌐',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: '', url: '', icon: '🌐' });  // Clear form after submission
  };

  const inputClass = `w-full px-4 py-2 rounded-lg outline-none transition-all ${
    isDark
      ? 'bg-white/5 border border-white/10 text-white focus:border-white/20'
      : 'bg-black/5 border border-black/10 text-gray-800 focus:border-black/20'
  }`;

  const buttonClass = `w-full py-2 rounded-lg font-medium transition-all ${
    isDark
      ? 'bg-white/10 hover:bg-white/20 text-white'
      : 'bg-black/10 hover:bg-black/20 text-gray-800'
  }`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-md p-6 relative rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
          aria-label="Close"
        >
          <X className={`w-5 h-5 ${isDark ? 'text-white/60' : 'text-black/60'}`} />
        </button>

        <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Add New Website
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-white/60' : 'text-black/60'}`}>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClass}
              required
              aria-label="Website Name"
            />
          </div>

          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-white/60' : 'text-black/60'}`}>URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className={inputClass}
              required
              aria-label="Website URL"
            />
          </div>

          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-white/60' : 'text-black/60'}`}>Icon (emoji)</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className={inputClass}
              required
              aria-label="Website Icon"
            />
          </div>

          <button type="submit" className={buttonClass}>
            Add Website
          </button>
        </form>
      </div>
    </div>
  );
}
