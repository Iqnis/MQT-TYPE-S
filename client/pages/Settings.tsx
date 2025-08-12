import { useState, useEffect } from "react";
import { ArrowLeft, Play } from "lucide-react";

// ========================================
// CONFIGURATION CONSTANTS
// ========================================
const CONFIG = {
  // Timer settings
  TIMER_MIN: 60, // Minimum timer (seconds)
  TIMER_MAX: 59940, // Maximum timer (seconds)
  TIMER_STEP: 5, // Step increment (seconds)

  // Available themes
  THEMES: [
    { key: "slate", name: "Default", color: "emerald" },
    { key: "purple", name: "Purple", color: "purple" },
    { key: "green", name: "Green", color: "green" },
    { key: "white", name: "White", color: "gray" },
    { key: "red", name: "Red", color: "red" },
    { key: "blue", name: "Blue", color: "blue" },
  ],
};

// ========================================
// SETTINGS COMPONENT
// ========================================
export default function Settings() {
  // Get settings from localStorage
  const getStoredSettings = () => {
    const defaultTimer = localStorage.getItem("defaultTimer") || "60";
    const backgroundTheme = localStorage.getItem("backgroundTheme") || "slate";
    const soundSet = localStorage.getItem("SOUND_SET") || "1";
    
    return {
      defaultTimer: parseInt(defaultTimer),
      backgroundTheme: backgroundTheme,
      soundSet: parseInt(soundSet)
    };
  };

  const storedSettings = getStoredSettings();

  // State management
  const [defaultTimer, setDefaultTimer] = useState(storedSettings.defaultTimer);
  const [backgroundTheme, setBackgroundTheme] = useState(storedSettings.backgroundTheme);
  const [soundSet, setSoundSet] = useState(storedSettings.soundSet);
  const [fullscreen, setFullscreen] = useState(false);

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  // Color theme generator
  const getColors = (theme: string) => {
    const themeColors = {
      purple: {
        bg: "from-purple-900 via-purple-800 to-purple-900",
        text: "text-purple-100",
        glow: "shadow-purple-500/50",
      },
      green: {
        bg: "from-green-900 via-green-800 to-green-900",
        text: "text-green-100",
        glow: "shadow-green-500/50",
      },
      white: {
        bg: "from-gray-100 via-gray-200 to-gray-100",
        text: "text-black",
        glow: "shadow-gray-500/50",
      },
      slate: {
        bg: "from-slate-900 via-slate-800 to-slate-900",
        text: "text-emerald-100",
        glow: "shadow-emerald-500/50",
      },
      red: {
        bg: "from-red-900 via-red-800 to-red-900",
        text: "text-red-100",
        glow: "shadow-red-500/50",
      },
      blue: {
        bg: "from-blue-900 via-blue-800 to-blue-900",
        text: "text-blue-100",
        glow: "shadow-blue-500/50",
      },
    };

    return themeColors[theme as keyof typeof themeColors] || themeColors.slate;
  };

  // Time formatting
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Fullscreen toggle
  const handleFullscreenToggle = () => {
    setFullscreen(!fullscreen);
    if (fullscreen) {
      document.exitFullscreen();
      document.body.style.cursor = 'auto';
    } else {
      document.documentElement.requestFullscreen();
      document.body.style.cursor = 'none';
    }
  };

  // Save settings and navigate back
  const handleSaveSettings = () => {
    localStorage.setItem("defaultTimer", defaultTimer.toString());
    localStorage.setItem("backgroundTheme", backgroundTheme);
    localStorage.setItem("SOUND_SET", soundSet.toString());
    
    // Navigate back to display
    window.location.href = "/";
  };

  // Navigate back without saving
  const handleBackToDisplay = () => {
    window.location.href = "/";
  };

  // ========================================
  // EFFECTS
  // ========================================

  // Load settings on component mount
  useEffect(() => {
    const settings = getStoredSettings();
    setDefaultTimer(settings.defaultTimer);
    setBackgroundTheme(settings.backgroundTheme);
    setSoundSet(settings.soundSet);
  }, []);

  // ========================================
  // CALCULATED VALUES
  // ========================================

  const colors = getColors(backgroundTheme);

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className={`min-h-screen w-full bg-gradient-to-br ${colors.bg} transition-all duration-1000 relative overflow-hidden`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-xl"></div>
      </div>

      {/* Settings container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 w-full max-w-md mx-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBackToDisplay}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors ${colors.text}`}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className={`text-2xl font-bold ${colors.text}`}>Settings</h1>
            <button
              onClick={handleBackToDisplay}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors ${colors.text}`}
            >
              <Play className="w-6 h-6" />
            </button>
          </div>

          {/* Timer Duration Setting */}
          <div className="mb-8">
            {/* Label and buttons */}
            <div className="flex items-center justify-between mb-4">
              <label className={`text-sm font-medium ${colors.text}`}>
                Countdown Timer (min): {formatTime(defaultTimer)}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setDefaultTimer((prev) => Math.max(CONFIG.TIMER_MIN, prev - 60))
                  }
                  className={`px-3 py-1 text-lg rounded-full bg-white/10 hover:bg-white/20 transition ${colors.text}`}
                >
                  &lt;
                </button>
                <button
                  onClick={() =>
                    setDefaultTimer((prev) => Math.min(CONFIG.TIMER_MAX, prev + 60))
                  }
                  className={`px-3 py-1 text-lg rounded-full bg-white/10 hover:bg-white/20 transition ${colors.text}`}
                >
                  &gt;
                </button>
              </div>
            </div>

            {/* Range slider */}
            <input
              type="range"
              min={CONFIG.TIMER_MIN}
              max={CONFIG.TIMER_MAX}
              step={CONFIG.TIMER_STEP}
              value={defaultTimer}
              onChange={(e) => setDefaultTimer(Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />

            {/* Min/Max Labels */}
            <div className={`flex justify-between text-xs ${colors.text} opacity-60 mt-2`}>
              <span>{CONFIG.TIMER_MIN}s</span>
              <span>{Math.floor(CONFIG.TIMER_MAX / 60)}m</span>
            </div>
          </div>

          {/* Sound Settings */}
          <div className="mb-8">
            <div className={`flex flex-col gap-2 text-sm ${colors.text}`}>
              <span className="mb-2 font-medium">Sound Set:</span>
              {[1, 2, 3].map((setNum) => (
                <button
                  key={setNum}
                  onClick={() => setSoundSet(setNum)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    soundSet === setNum
                      ? "bg-white/20 font-bold"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  Set {setNum}
                </button>
              ))}
            </div>
          </div>

          {/* Background Theme */}
          <div className="mb-8">
            <label className={`block text-sm font-medium ${colors.text} mb-4`}>
              Background Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {CONFIG.THEMES.map((theme) => (
                <button
                  key={theme.key}
                  onClick={() => setBackgroundTheme(theme.key)}
                  className={`p-4 rounded-lg border transition-all ${
                    backgroundTheme === theme.key
                      ? "border-white/40 bg-white/20"
                      : "border-white/20 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full mx-auto mb-2 bg-${theme.color}-400`}></div>
                  <span className={`text-xs ${colors.text} block`}>
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Fullscreen Toggle */}
          <div className="mb-8">
            <label className={`block text-sm font-medium ${colors.text} mb-3`}>
              Fullscreen Mode
            </label>
            <button
              onClick={handleFullscreenToggle}
              className={`w-full py-3 rounded-lg bg-white/20 border border-white/30 hover:bg-white/30 transition-all ${colors.text} font-medium`}
            >
              {fullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleBackToDisplay}
              className={`flex-1 py-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all ${colors.text} font-medium`}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              className={`flex-1 py-3 rounded-lg bg-white/20 border border-white/30 hover:bg-white/30 transition-all ${colors.text} font-medium`}
            >
              Save & Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
