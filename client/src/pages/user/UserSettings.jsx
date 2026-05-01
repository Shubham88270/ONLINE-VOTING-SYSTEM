import React from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import toast from 'react-hot-toast';

export default function UserSettings() {
  const {
    theme, setTheme, themes,
    fontSize, setFontSize, fontSizes,
    fontFamily, setFontFamily, fontFamilies,
    darkMode, setDarkMode,
  } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Customize your experience</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <span className="text-lg">🎨</span>
          <h2 className="font-semibold text-gray-800">Appearance</h2>
        </div>
        <div className="p-6 space-y-6">

          {/* Color Theme */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Color Theme</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {Object.entries(themes).map(([key, t]) => (
                <button key={key} onClick={() => { setTheme(key); toast.success(`${t.name} theme applied!`); }}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    theme === key ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded-full" style={{ background: t.primary }} />
                    <div className="w-4 h-4 rounded-full" style={{ background: t.secondary }} />
                    <div className="w-4 h-4 rounded-full" style={{ background: t.accent }} />
                  </div>
                  <span className="text-xs font-medium text-gray-600">{t.name}</span>
                  {theme === key && <span className="absolute top-1.5 right-1.5 text-indigo-500 text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Font Size</label>
            <div className="flex gap-3 flex-wrap">
              {Object.entries(fontSizes).map(([key, f]) => (
                <button key={key} onClick={() => setFontSize(key)}
                  className={`px-4 py-2 rounded-xl border-2 transition-all font-medium ${
                    fontSize === key ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`} style={{ fontSize: f.base }}>
                  {f.name}
                </button>
              ))}
            </div>
            <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-500 text-xs mb-1">Preview:</p>
              <p className="text-gray-800" style={{ fontSize: fontSizes[fontSize].base }}>
                The quick brown fox jumps over the lazy dog.
              </p>
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Font Family</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(fontFamilies).map(([key, f]) => (
                <button key={key} onClick={() => setFontFamily(key)}
                  className={`px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    fontFamily === key ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: f.value }}>{f.name}</p>
                  <p className="text-xs text-gray-400" style={{ fontFamily: f.value }}>Aa Bb Cc</p>
                  {fontFamily === key && <span className="text-indigo-500 text-xs">✓ Active</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-800">Dark Mode</p>
              <p className="text-xs text-gray-400 mt-0.5">Toggle dark/light interface</p>
            </div>
            <button onClick={() => setDarkMode(!darkMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-indigo-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <button onClick={() => { setTheme('indigo'); setFontSize('md'); setFontFamily('inter'); setDarkMode(true); toast.success('Reset to defaults!'); }}
            className="text-sm text-gray-400 hover:text-gray-600 transition underline">
            Reset to defaults
          </button>
        </div>
      </div>
    </div>
  );
}
