import { useState, useEffect } from "react";
import { ArrowLeft, Play, Volume2, Palette, Settings2, Monitor, RotateCcw, Download, Upload } from "lucide-react";

// ========================================
// CONFIGURATION CONSTANTS
// ========================================
const CONFIG = {
  // Timer settings
  TIMER_MIN: 60, // Minimum timer (seconds)
  TIMER_MAX: 59940, // Maximum timer (seconds)
  TIMER_STEP: 5, // Step increment (seconds)

  // Timer presets
  TIMER_PRESETS: [
    { name: "1 Min", value: 60 },
    { name: "2 Min", value: 120 },
    { name: "5 Min", value: 300 },
    { name: "10 Min", value: 600 },
    { name: "15 Min", value: 900 },
    { name: "30 Min", value: 1800 },
  ],

  // Timer format options
  TIMER_FORMATS: [
    { format: "MM", example: "05", description: "Minutes only" },
    { format: "MM:SS", example: "05:30", description: "Minutes and seconds" },
    { format: "HH:MM:SS", example: "01:05:30", description: "Hours, minutes, seconds" },
    { format: "HhMmSs", example: "1h5m30s", description: "Short format with units" },
  ],

  // Font options (without slashed zeros)
  TIMER_FONTS: [
    { key: "inter", name: "Inter", class: "font-sans", description: "Clean, modern sans-serif" },
    { key: "roboto", name: "Roboto", class: "font-mono", description: "Monospace, technical look" },
    { key: "system", name: "System", class: "font-system", description: "System default font" },
    { key: "arial", name: "Arial", class: "font-arial", description: "Classic, highly readable" },
  ],

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
// SETTINGS COMPONENT INTERFACE
// ========================================
interface SettingsProps {
  onNavigateToDisplay: (settings?: any) => void;
}

export default function Settings({ onNavigateToDisplay }: SettingsProps) {

  // ========================================
  // INITIAL SETTINGS LOADER
  // ========================================
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

  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [activeTab, setActiveTab] = useState("timer");
  const [showPreview, setShowPreview] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // Timer Settings
  const [defaultTimer, setDefaultTimer] = useState(storedSettings.defaultTimer);

  // Function Settings
  const [timerFormat, setTimerFormat] = useState("MM:SS");
  const [timerFont, setTimerFont] = useState("inter");
  const [autoStart, setAutoStart] = useState(false);
  const [showProgress, setShowProgress] = useState(true);

  // Extra Function Settings
  const [backgroundTheme, setBackgroundTheme] = useState(storedSettings.backgroundTheme);
  const [soundSet, setSoundSet] = useState(storedSettings.soundSet);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  // Color theme generator
  const getColors = (theme: string) => {
    const themeColors = {
      purple: {
        bg: "from-purple-900 via-purple-800 to-purple-900",
        text: "text-purple-100",
        accent: "text-purple-300",
        button: "bg-purple-600 hover:bg-purple-700",
        cardButton: "bg-white/10 hover:bg-white/20 border-white/20",
        glow: "shadow-purple-500/50",
      },
      green: {
        bg: "from-green-900 via-green-800 to-green-900",
        text: "text-green-100",
        accent: "text-green-300",
        button: "bg-green-600 hover:bg-green-700",
        cardButton: "bg-white/10 hover:bg-white/20 border-white/20",
        glow: "shadow-green-500/50",
      },
      white: {
        bg: "from-gray-100 via-gray-200 to-gray-100",
        text: "text-black",
        accent: "text-gray-700",
        button: "bg-gray-600 hover:bg-gray-700",
        cardButton: "bg-gray-200 hover:bg-gray-300 border-gray-300",
        glow: "shadow-gray-500/50",
      },
      slate: {
        bg: "from-slate-900 via-slate-800 to-slate-900",
        text: "text-emerald-100",
        accent: "text-emerald-300",
        button: "bg-emerald-600 hover:bg-emerald-700",
        cardButton: "bg-white/10 hover:bg-white/20 border-white/20",
        glow: "shadow-emerald-500/50",
      },
      red: {
        bg: "from-red-900 via-red-800 to-red-900",
        text: "text-red-100",
        accent: "text-red-300",
        button: "bg-red-600 hover:bg-red-700",
        cardButton: "bg-white/10 hover:bg-white/20 border-white/20",
        glow: "shadow-red-500/50",
      },
      blue: {
        bg: "from-blue-900 via-blue-800 to-blue-900",
        text: "text-blue-100",
        accent: "text-blue-300",
        button: "bg-blue-600 hover:bg-blue-700",
        cardButton: "bg-white/10 hover:bg-white/20 border-white/20",
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

  // Save settings to browser storage and navigate to display
  const handleSaveSettings = () => {
    // Save all settings to localStorage
    localStorage.setItem("defaultTimer", defaultTimer.toString());
    localStorage.setItem("backgroundTheme", backgroundTheme);
    localStorage.setItem("SOUND_SET", soundSet.toString());
    localStorage.setItem("soundEnabled", soundEnabled.toString());
    localStorage.setItem("autoStart", autoStart.toString());
    localStorage.setItem("showProgress", showProgress.toString());
    localStorage.setItem("timerFormat", timerFormat);
    localStorage.setItem("timerFont", timerFont);

    // Navigate to display with saved settings
    const savedSettings = {
      defaultTimer,
      backgroundTheme,
      soundSet,
      soundEnabled,
      autoStart,
      showProgress,
      timerFormat,
      timerFont
    };
    onNavigateToDisplay(savedSettings);
  };

  // Preview current settings in popup
  const handlePreviewSettings = () => {
    setShowPreview(true);
  };

  // Export settings
  const handleExportSettings = () => {
    const settings = {
      defaultTimer,
      backgroundTheme,
      soundSet,
      soundEnabled,
      autoStart,
      showProgress
    };
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'timer-settings.json';
    link.click();
  };

  // Import settings
  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const settings = JSON.parse(e.target?.result as string);
            setDefaultTimer(settings.defaultTimer || 60);
            setBackgroundTheme(settings.backgroundTheme || "slate");
            setSoundSet(settings.soundSet || 1);
            setSoundEnabled(settings.soundEnabled !== false);
            setAutoStart(settings.autoStart || false);
            setShowProgress(settings.showProgress !== false);
          } catch (error) {
            alert('Invalid settings file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Reset to defaults
  const handleResetDefaults = () => {
    setDefaultTimer(60);
    setBackgroundTheme("slate");
    setSoundSet(1);
    setSoundEnabled(true);
    setAutoStart(false);
    setShowProgress(true);
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

    // Load additional settings from localStorage
    const storedFormat = localStorage.getItem("timerFormat") || "MM:SS";
    const storedFont = localStorage.getItem("timerFont") || "inter";
    const storedSoundEnabled = localStorage.getItem("soundEnabled") !== "false";
    const storedAutoStart = localStorage.getItem("autoStart") === "true";
    const storedShowProgress = localStorage.getItem("showProgress") !== "false";

    setTimerFormat(storedFormat);
    setTimerFont(storedFont);
    setSoundEnabled(storedSoundEnabled);
    setAutoStart(storedAutoStart);
    setShowProgress(storedShowProgress);
  }, []);

  // ========================================
  // CALCULATED VALUES
  // ========================================

  const colors = getColors(backgroundTheme);

  // ========================================
  // TAB CONTENT COMPONENTS
  // ========================================

  const TimerSettings = () => (
    <div className="space-y-8">
      {/* Timer Duration */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-xl font-semibold ${colors.text}`}>Timer Duration</h3>
            <p className={`text-sm ${colors.text} opacity-70 mt-1`}>Set how long the countdown timer will run</p>
          </div>
          <div className={`text-3xl font-mono ${colors.accent} ${colors.cardButton} px-4 py-2 rounded-lg border`}>
            {formatTime(defaultTimer)}
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="mb-6">
          <label className={`block text-sm font-medium ${colors.text} mb-3`}>Quick Presets</label>
          <div className="grid grid-cols-3 gap-3">
            {CONFIG.TIMER_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setDefaultTimer(preset.value)}
                className={`p-3 rounded-lg border transition-all ${
                  defaultTimer === preset.value
                    ? `${colors.cardButton} border-current`
                    : `${colors.cardButton}`
                }`}
              >
                <span className={`text-sm ${colors.text} font-medium`}>
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
          <p className={`text-xs ${colors.text} opacity-60 mt-2`}>Click any preset to instantly set that duration</p>
        </div>

        {/* Custom Duration - Draggable */}
        <div className="mb-6">
          <label className={`block text-sm font-medium ${colors.text} mb-3`}>Custom Duration (Drag to adjust)</label>
          <input
            type="range"
            min={CONFIG.TIMER_MIN}
            max={CONFIG.TIMER_MAX}
            step={CONFIG.TIMER_STEP}
            value={defaultTimer}
            onChange={(e) => setDefaultTimer(Number(e.target.value))}
            className={`w-full h-4 rounded-lg appearance-none cursor-grab active:cursor-grabbing ${
              backgroundTheme === 'white' ? 'bg-gray-300' : 'bg-white/20'
            }`}
            style={{
              background: backgroundTheme === 'white'
                ? `linear-gradient(to right, #6b7280 0%, #6b7280 ${(defaultTimer / CONFIG.TIMER_MAX) * 100}%, #d1d5db ${(defaultTimer / CONFIG.TIMER_MAX) * 100}%, #d1d5db 100%)`
                : `linear-gradient(to right, currentColor 0%, currentColor ${(defaultTimer / CONFIG.TIMER_MAX) * 100}%, rgba(255,255,255,0.2) ${(defaultTimer / CONFIG.TIMER_MAX) * 100}%, rgba(255,255,255,0.2) 100%)`
            }}
          />
          <div className={`flex justify-between text-xs ${colors.text} opacity-60 mt-2`}>
            <span>{CONFIG.TIMER_MIN}s</span>
            <span>{Math.floor(CONFIG.TIMER_MAX / 60)}m</span>
          </div>
          <p className={`text-xs ${colors.text} opacity-60 mt-1`}>Drag the slider to set any custom duration between 1 minute and 16+ hours</p>
        </div>

        {/* Manual Controls */}
        <div>
          <label className={`block text-sm font-medium ${colors.text} mb-3`}>Fine Adjustment</label>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() =>
                setDefaultTimer((prev) => Math.max(CONFIG.TIMER_MIN, prev - 60))
              }
              className={`px-4 py-2 text-lg rounded-lg ${colors.cardButton} border transition ${colors.text}`}
            >
              -1m
            </button>
            <button
              onClick={() =>
                setDefaultTimer((prev) => Math.max(CONFIG.TIMER_MIN, prev - 5))
              }
              className={`px-4 py-2 text-lg rounded-lg ${colors.cardButton} border transition ${colors.text}`}
            >
              -5s
            </button>
            <button
              onClick={() =>
                setDefaultTimer((prev) => Math.min(CONFIG.TIMER_MAX, prev + 5))
              }
              className={`px-4 py-2 text-lg rounded-lg ${colors.cardButton} border transition ${colors.text}`}
            >
              +5s
            </button>
            <button
              onClick={() =>
                setDefaultTimer((prev) => Math.min(CONFIG.TIMER_MAX, prev + 60))
              }
              className={`px-4 py-2 text-lg rounded-lg ${colors.cardButton} border transition ${colors.text}`}
            >
              +1m
            </button>
          </div>
          <p className={`text-xs ${colors.text} opacity-60 mt-2 text-center`}>Use these buttons to make precise adjustments to your timer duration</p>
        </div>
      </div>
    </div>
  );

  const FunctionSettings = () => (
    <div className="space-y-8">
      {/* Timer Format */}
      <div>
        <div className="mb-6">
          <h3 className={`text-xl font-semibold ${colors.text}`}>Timer Format</h3>
          <p className={`text-sm ${colors.text} opacity-70 mt-1`}>Choose how the countdown time is displayed</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {CONFIG.TIMER_FORMATS.map((option) => (
            <button
              key={option.format}
              onClick={() => setTimerFormat(option.format)}
              className={`p-4 rounded-lg border transition-all ${
                timerFormat === option.format
                  ? `${colors.cardButton} border-current`
                  : `${colors.cardButton}`
              }`}
            >
              <div className={`text-center ${colors.text}`}>
                <div className={`text-lg mb-1 ${CONFIG.TIMER_FONTS.find(f => f.key === timerFont)?.class || 'font-sans'}`}>
                  {option.example}
                </div>
                <div className="text-xs opacity-70">{option.description}</div>
              </div>
            </button>
          ))}
        </div>
        <p className={`text-xs ${colors.text} opacity-60 mt-2`}>Select the format that's easiest for you to read during countdown</p>
      </div>

      {/* Timer Font */}
      <div>
        <div className="mb-6">
          <h3 className={`text-xl font-semibold ${colors.text}`}>Timer Font</h3>
          <p className={`text-sm ${colors.text} opacity-70 mt-1`}>Choose the font style for timer display (zero without slash)</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {CONFIG.TIMER_FONTS.map((font) => (
            <button
              key={font.key}
              onClick={() => setTimerFont(font.key)}
              className={`p-4 rounded-lg border transition-all ${
                timerFont === font.key
                  ? `${colors.cardButton} border-current`
                  : `${colors.cardButton}`
              }`}
            >
              <div className={`text-center ${colors.text}`}>
                <div className={`text-2xl mb-2 ${font.class}`}>00:30</div>
                <div className="text-sm font-medium mb-1">{font.name}</div>
                <div className="text-xs opacity-70">{font.description}</div>
              </div>
            </button>
          ))}
        </div>
        <p className={`text-xs ${colors.text} opacity-60 mt-2`}>All fonts use zeros without slashes for better readability</p>
      </div>

      {/* Timer Behavior */}
      <div>
        <div className="mb-6">
          <h3 className={`text-xl font-semibold ${colors.text}`}>Timer Behavior</h3>
          <p className={`text-sm ${colors.text} opacity-70 mt-1`}>Control how the timer behaves when started</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className={`${colors.text} font-medium`}>Auto-start timer</span>
              <p className={`text-xs ${colors.text} opacity-60 mt-1`}>Timer starts immediately when display opens</p>
            </div>
            <button
              onClick={() => setAutoStart(!autoStart)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                autoStart ? colors.button : (backgroundTheme === 'white' ? 'bg-gray-300' : 'bg-white/20')
              }`}
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                  autoStart ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className={`${colors.text} font-medium`}>Show progress bar</span>
              <p className={`text-xs ${colors.text} opacity-60 mt-1`}>Display circular progress ring around timer</p>
            </div>
            <button
              onClick={() => setShowProgress(!showProgress)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                showProgress ? colors.button : (backgroundTheme === 'white' ? 'bg-gray-300' : 'bg-white/20')
              }`}
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                  showProgress ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ExtraFunctionSettings = () => (
    <div className="space-y-8">
      {/* Sound Settings */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Volume2 className={`w-6 h-6 ${colors.accent}`} />
          <h3 className={`text-xl font-semibold ${colors.text}`}>Sound Settings</h3>
          <p className={`text-sm ${colors.text} opacity-70`}>Configure audio alerts and notifications</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className={`${colors.text} font-medium`}>Enable sounds</span>
              <p className={`text-xs ${colors.text} opacity-60 mt-1`}>Play audio alerts during countdown</p>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                soundEnabled ? colors.button : (backgroundTheme === 'white' ? 'bg-gray-300' : 'bg-white/20')
              }`}
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                  soundEnabled ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div>
            <span className={`block mb-3 font-medium ${colors.text}`}>Sound Pack</span>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((setNum) => (
                <button
                  key={setNum}
                  onClick={() => setSoundSet(setNum)}
                  className={`p-4 rounded-lg border transition-all ${
                    soundSet === setNum
                      ? `${colors.cardButton} border-current`
                      : `${colors.cardButton}`
                  }`}
                >
                  <div className={`text-center ${colors.text}`}>
                    <div className="text-lg mb-1">🔊</div>
                    <div className="text-sm">Set {setNum}</div>
                  </div>
                </button>
              ))}
            </div>
            <p className={`text-xs ${colors.text} opacity-60 mt-2`}>Choose from different sound packs for warnings and completion alerts</p>
          </div>
        </div>
      </div>

      {/* Visual Theme */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Palette className={`w-6 h-6 ${colors.accent}`} />
          <h3 className={`text-xl font-semibold ${colors.text}`}>Visual Theme</h3>
          <p className={`text-sm ${colors.text} opacity-70`}>Customize the appearance and colors</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {CONFIG.THEMES.map((theme) => (
            <button
              key={theme.key}
              onClick={() => setBackgroundTheme(theme.key)}
              className={`p-4 rounded-lg border transition-all ${
                backgroundTheme === theme.key
                  ? `${colors.cardButton} border-current`
                  : `${colors.cardButton}`
              }`}
            >
              <div className={`w-8 h-8 rounded-full mx-auto mb-3 bg-${theme.color}-400`}></div>
              <span className={`text-sm ${colors.text} block font-medium`}>
                {theme.name}
              </span>
            </button>
          ))}
        </div>
        <p className={`text-xs ${colors.text} opacity-60 mt-2`}>Select a color theme that matches your preference and environment</p>
      </div>

      {/* Display Settings */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Monitor className={`w-6 h-6 ${colors.accent}`} />
          <h3 className={`text-xl font-semibold ${colors.text}`}>Display Settings</h3>
          <p className={`text-sm ${colors.text} opacity-70`}>Control fullscreen mode and display behavior</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleFullscreenToggle}
            className={`w-full py-4 rounded-lg ${colors.cardButton} border transition-all ${colors.text} font-medium text-lg`}
          >
            {fullscreen ? "🗗 Exit Display Fullscreen" : "⛶ Enter Display Fullscreen"}
          </button>
          <p className={`text-xs ${colors.text} opacity-60 text-center`}>
            Fullscreen mode hides the mouse cursor and shows only the timer display for distraction-free focus
          </p>
        </div>
      </div>
    </div>
  );

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

      {/* Main container - Card wrapper */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className={`w-full max-w-5xl ${backgroundTheme === 'white' ? 'bg-white/90' : 'bg-black/20'} backdrop-blur-md border ${backgroundTheme === 'white' ? 'border-gray-300' : 'border-white/20'} rounded-2xl shadow-2xl overflow-hidden`}>
          {/* Header */}
          <div className={`p-6 border-b ${backgroundTheme === 'white' ? 'border-gray-200' : 'border-white/10'}`}>
            <h1 className={`text-4xl font-bold ${colors.text} text-center`}>Timer Settings</h1>
          </div>

          {/* Tab Navigation */}
          <div className={`flex border-b ${backgroundTheme === 'white' ? 'border-gray-200' : 'border-white/10'}`}>
            {[
              { id: "timer", label: "Timer", icon: "⏱️" },
              { id: "function", label: "Function", icon: "🔧" },
              { id: "extra", label: "Extra Function", icon: "⚡" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                  activeTab === tab.id
                    ? `${colors.text} ${backgroundTheme === 'white' ? 'bg-gray-100' : 'bg-white/10'} border-b-2 border-current`
                    : `${colors.text} opacity-60 hover:opacity-80 ${backgroundTheme === 'white' ? 'hover:bg-gray-50' : 'hover:bg-white/5'}`
                }`}
              >
                <div className="text-2xl mb-1">{tab.icon}</div>
                <div className="text-sm">{tab.label}</div>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8 max-h-96 overflow-y-auto">
            {activeTab === "timer" && <TimerSettings />}
            {activeTab === "function" && <FunctionSettings />}
            {activeTab === "extra" && <ExtraFunctionSettings />}
          </div>

          {/* Footer Actions */}
          <div className={`p-6 border-t ${backgroundTheme === 'white' ? 'border-gray-200' : 'border-white/10'}`}>
            <div className="flex gap-4">
              <button
                onClick={handlePreviewSettings}
                className={`flex-1 py-4 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all text-white font-bold text-lg`}
              >
                🔍 Preview Timer
              </button>
              <button
                onClick={handleSaveSettings}
                className={`flex-1 py-4 rounded-lg ${colors.button} transition-all text-white font-bold text-lg`}
              >
                💾 Save & Start Timer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowPreview(false)}>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-80 h-80 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${colors.text}`}>Timer Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className={`p-2 rounded-full hover:bg-white/10 transition-colors ${colors.text}`}
              >
                ✕
              </button>
            </div>

            <div className={`relative w-full h-60 bg-gradient-to-br ${colors.bg} rounded-lg flex items-center justify-center`}>
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {showProgress && (
                    <>
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="opacity-20"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className={`${colors.cardButton.includes('stroke') ? colors.cardButton : 'stroke-current'} transition-colors duration-1000`}
                        strokeLinecap="round"
                        strokeDasharray="282.7"
                        strokeDashoffset="70.7"
                      />
                    </>
                  )}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`text-2xl ${CONFIG.TIMER_FONTS.find(f => f.key === timerFont)?.class || 'font-sans'} ${colors.text} text-center`}>
                    {(() => {
                      const totalSecs = Math.floor(defaultTimer);
                      const hours = Math.floor(totalSecs / 3600);
                      const mins = Math.floor((totalSecs % 3600) / 60);
                      const secs = totalSecs % 60;

                      switch (timerFormat) {
                        case "MM":
                          return `${Math.ceil(defaultTimer / 60)}`;
                        case "MM:SS":
                          return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
                        case "HH:MM:SS":
                          return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
                        case "HhMmSs":
                          if (hours > 0) {
                            return `${hours}h${mins}m${secs}s`;
                          } else if (mins > 0) {
                            return `${mins}m${secs}s`;
                          } else {
                            return `${secs}s`;
                          }
                        default:
                          return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <p className={`text-xs ${colors.text} opacity-60 text-center mt-4`}>
              This is how your timer will look with current settings
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
