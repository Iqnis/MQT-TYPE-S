import { useState, useEffect } from "react";

// ========================================
// CONFIGURATION CONSTANTS
// ========================================
const CONFIG = {
  // Timer settings
  DEFAULT_TIMER: 60, // Default timer in seconds
  UPDATE_INTERVAL: 100, // Progress update frequency (ms)
  TIMER_DECREMENT: 0.1, // Timer decrease per interval (seconds)

  // Phase thresholds
  WARNING_THRESHOLD: 30, // Warning phase trigger (seconds)
  ENDING_THRESHOLD: 10, // Ending phase trigger (seconds)

  // UI settings
  CIRCLE_RADIUS: 45, // Progress circle radius

  // Sound files (in public folder)
  SOUNDS_ENABLED: true,
  SOUND_SET: 1,

  SOUNDS: {
    START: "start-sound",
    WARNING: "warn-end-sound",
    FINISHED: "end-sound",
  },
};

// ========================================
// DISPLAY COMPONENT
// ========================================
interface DisplayProps {
  previewSettings?: any;
  onBackToSettings: () => void;
}

export default function Display({
  previewSettings,
  onBackToSettings,
}: DisplayProps) {
  // Get settings from localStorage or preview settings
  const getSettings = () => {
    if (previewSettings) {
      return previewSettings;
    }

    const defaultTimer =
      localStorage.getItem("defaultTimer") || CONFIG.DEFAULT_TIMER;
    const backgroundTheme = localStorage.getItem("backgroundTheme") || "slate";
    const soundSet = localStorage.getItem("SOUND_SET") || "1";
    const soundEnabled = localStorage.getItem("soundEnabled") === "true";
    const autoStart = localStorage.getItem("autoStart") === "true";
    const showProgress = localStorage.getItem("showProgress") !== "false";
    const timerFormat = localStorage.getItem("timerFormat") || "MM:SS";
    const timerFont = localStorage.getItem("timerFont") || "inter";

    return {
      defaultTimer: parseInt(defaultTimer.toString()),
      backgroundTheme: backgroundTheme.toString(),
      soundSet: parseInt(soundSet.toString()),
      soundEnabled,
      autoStart,
      showProgress,
      timerFormat,
      timerFont,
    };
  };

  const settings = getSettings();

  // State management
  const [timeLeft, setTimeLeft] = useState(settings.defaultTimer);
  const [initialTime, setInitialTime] = useState(settings.defaultTimer);
  const [isRunning, setIsRunning] = useState(settings.autoStart || false);
  const [isFinished, setIsFinished] = useState(false);
  const [preciseTime, setPreciseTime] = useState(settings.defaultTimer);
  const [backgroundTheme] = useState(settings.backgroundTheme);
  const [soundSet] = useState(settings.soundSet);
  const [soundEnabled] = useState(settings.soundEnabled);
  const [showProgress] = useState(settings.showProgress);
  const [timerFormat] = useState(settings.timerFormat);
  const [timerFont] = useState(settings.timerFont);

  // Font configuration (without slashed zeros)
  const getFontClass = (fontKey: string) => {
    const fontMap = {
      inter: "font-sans",
      roboto: "font-mono",
      system: "font-system",
      arial: "font-arial",
    };
    return fontMap[fontKey as keyof typeof fontMap] || "font-sans";
  };

  // Dynamic font sizing based on format and content length
  const getTimerFontSize = () => {
    const timeText = formatTime(timeLeft);
    const textLength = timeText.length;

    // Adjust font size based on timer format and text length
    switch (timerFormat) {
      case "MM":
        // Short format like "5" or "15"
        return textLength <= 2 ? "32vw" : "28vw";

      case "MM:SS":
        // Standard format like "05:30"
        return "20vw";

      case "HH:MM:SS":
        // Long format like "01:05:30"
        return textLength <= 7 ? "14vw" : "12vw";

      case "HhMmSs":
        // Unit format like "1h5m30s" or "5m30s" or "30s"
        if (textLength <= 3) return "24vw"; // "30s"
        if (textLength <= 6) return "18vw"; // "5m30s"
        return "14vw"; // "1h5m30s"

      default:
        return "20vw";
    }
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  // Sound effects
  const playSound = (soundType: string) => {
    if (!soundEnabled) return; // Respect sound setting

    try {
      const baseName = CONFIG.SOUNDS[soundType as keyof typeof CONFIG.SOUNDS];

      if (!baseName) {
        console.warn(`Invalid sound type: ${soundType}`);
        return;
      }

      const suffix = soundSet > 1 ? soundSet.toString() : "";
      const fileName = `/${baseName}${suffix}.mp3`;

      const audio = new Audio(fileName);
      audio.volume = 1.0;
      audio.play().catch(() => {
        console.log(`Sound ${fileName} not available`);
      });
    } catch (error) {
      console.log("Sound error", error);
    }
  };

  // Timer phase detection
  const getTimerPhase = (time: number) => {
    if (time <= CONFIG.ENDING_THRESHOLD) return "ending";
    if (time <= CONFIG.WARNING_THRESHOLD) return "warning";
    return "normal";
  };

  // Color theme generator
  const getColors = (phase: string, theme: string) => {
    // Warning and ending phases
    if (phase === "ending") {
      return {
        ...getColors("normal", theme),
        circle: "stroke-red-700",
        timerText: "text-red-600",
      };
    }
    if (phase === "warning") {
      return {
        ...getColors("normal", theme),
        circle: "stroke-amber-400",
        timerText: "text-amber-300",
      };
    }

    // Normal phase colors based on theme
    const themeColors = {
      purple: {
        bg: "from-purple-900 via-purple-800 to-purple-900",
        circle: "stroke-purple-400",
        text: "text-purple-100",
        timerText: "text-white",
        glow: "shadow-purple-500/50",
      },
      green: {
        bg: "from-green-900 via-green-800 to-green-900",
        circle: "stroke-green-400",
        text: "text-green-100",
        timerText: "text-white",
        glow: "shadow-green-500/50",
      },
      white: {
        bg: "from-gray-100 via-gray-200 to-gray-100",
        circle: "stroke-gray-700",
        text: "text-black",
        timerText: "text-black-900",
        glow: "shadow-gray-500/50",
      },
      slate: {
        bg: "from-slate-900 via-slate-800 to-slate-900",
        circle: "stroke-emerald-400",
        text: "text-emerald-100",
        timerText: "text-white",
        glow: "shadow-emerald-500/50",
      },
      red: {
        bg: "from-red-900 via-red-800 to-red-900",
        circle: "stroke-red-400",
        text: "text-red-100",
        timerText: "text-white",
        glow: "shadow-red-500/50",
      },
      blue: {
        bg: "from-blue-900 via-blue-800 to-blue-900",
        circle: "stroke-blue-400",
        text: "text-blue-100",
        timerText: "text-white",
        glow: "shadow-blue-500/50",
      },
    };

    return themeColors[theme as keyof typeof themeColors] || themeColors.slate;
  };

  // Time formatting based on selected format
  const formatTime = (seconds: number) => {
    const totalSecs = Math.floor(seconds);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    switch (timerFormat) {
      case "MM":
        return `${Math.ceil(seconds / 60)}`;
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
  };

  // Progress calculation
  const calculateProgress = () => {
    const progress = (1 - preciseTime / initialTime) * 100; // Flip direction for countdown
    const circumference = 2 * Math.PI * CONFIG.CIRCLE_RADIUS;
    const strokeDashoffset = -circumference * (progress / 100);
    return { progress, circumference, strokeDashoffset };
  };

  // ========================================
  // CONTROL FUNCTIONS
  // ========================================

  const toggleTimer = () => {
    if (isFinished) {
      resetTimer();
    } else {
      setIsRunning(!isRunning);
      if (!isRunning) {
        setIsRunning(true);
        playSound("START");
      }
    }
  };

  const resetTimer = () => {
    const newSettings = getSettings();
    setIsRunning(false);
    setTimeLeft(newSettings.defaultTimer);
    setInitialTime(newSettings.defaultTimer);
    setPreciseTime(newSettings.defaultTimer);
    setIsFinished(false);
  };

  const addTime = () => {
    setTimeLeft((prev) => {
      const newTime = prev + 5;

      if (newTime <= settings.defaultTimer) {
        setPreciseTime(newTime);
        setInitialTime(newTime);
        return newTime;
      } else {
        return prev;
      }
    });
  };

  const subtractTime = () => {
    setTimeLeft((prev) => {
      const newTime = Math.max(0, prev - 5);
      setPreciseTime(newTime);
      return newTime;
    });
  };

  // ========================================
  // EFFECTS
  // ========================================

  // Auto-start timer if enabled
  useEffect(() => {
    if (settings.autoStart && !isRunning && !isFinished && timeLeft > 0) {
      setIsRunning(true);
      playSound("START");
    }
  }, []);

  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && preciseTime > 0) {
      interval = setInterval(() => {
        setPreciseTime((time) => {
          const newTime = time - CONFIG.TIMER_DECREMENT;

          if (newTime <= 0) {
            setTimeLeft(0);
            setIsRunning(false);
            setIsFinished(true);
            playSound("FINISHED");
            return 0;
          }

          const displayTime = Math.ceil(newTime);
          if (displayTime !== timeLeft) {
            setTimeLeft(displayTime);
            if (displayTime === CONFIG.ENDING_THRESHOLD) {
              playSound("WARNING");
            }
          }

          return newTime;
        });
      }, CONFIG.UPDATE_INTERVAL);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, preciseTime, timeLeft]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.code) {
        case "Enter":
          event.preventDefault();
          toggleTimer();
          break;
        case "Space":
          event.preventDefault();
          resetTimer();
          break;
        case "Equal":
        case "NumpadAdd":
          event.preventDefault();
          addTime();
          break;
        case "Minus":
        case "NumpadSubtract":
          event.preventDefault();
          subtractTime();
          break;
      }

      // CTRL key for settings (navigate to settings page)
      if (event.code === "ControlLeft" || event.code === "ControlRight") {
        event.preventDefault();
        onBackToSettings();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // ========================================
  // CALCULATED VALUES
  // ========================================

  const phase = getTimerPhase(timeLeft);
  const colors = getColors(phase, backgroundTheme);
  const { progress, circumference, strokeDashoffset } = calculateProgress();

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center bg-gradient-to-br ${colors.bg} transition-all duration-1000 relative overflow-hidden`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-xl"></div>
      </div>

      {/* Back to Settings button (only in preview mode) */}
      {previewSettings && (
        <button
          onClick={onBackToSettings}
          className={`absolute top-8 left-8 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 ${colors.glow} shadow-xl z-10`}
        >
          <span className={`${colors.text} text-sm font-medium`}>
            ← Back to Settings
          </span>
        </button>
      )}

      {/* Main timer */}
      <div className="relative">
        {/* Outer glow */}
        <div
          className={`absolute inset-0 rounded-full blur-3xl ${colors.glow} shadow-2xl opacity-40 scale-110`}
        ></div>

        {/* Timer circle */}
        <div className="relative w-[32rem] md:w-[40rem] lg:w-[48rem] px-4 h-[32rem] md:h-[40rem] lg:h-[48rem]">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Clock face background */}
            <circle
              cx="50"
              cy="50"
              r="47"
              fill="currentColor"
              fillOpacity="0.05"
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeWidth="0.5"
            />

            {/* Hour markers */}
            {Array.from({ length: 12 }, (_, i) => {
              const angle = i * 30 - 90;
              const isQuarterHour = i % 3 === 0;
              const innerRadius = isQuarterHour ? 40 : 42;
              const outerRadius = 45;
              const x1 = 50 + innerRadius * Math.cos((angle * Math.PI) / 180);
              const y1 = 50 + innerRadius * Math.sin((angle * Math.PI) / 180);
              const x2 = 50 + outerRadius * Math.cos((angle * Math.PI) / 180);
              const y2 = 50 + outerRadius * Math.sin((angle * Math.PI) / 180);

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth={isQuarterHour ? "0.8" : "0.4"}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Minute markers */}
            {Array.from({ length: 60 }, (_, i) => {
              if (i % 5 !== 0) {
                const angle = i * 6 - 90;
                const innerRadius = 43;
                const outerRadius = 45;
                const x1 = 50 + innerRadius * Math.cos((angle * Math.PI) / 180);
                const y1 = 50 + innerRadius * Math.sin((angle * Math.PI) / 180);
                const x2 = 50 + outerRadius * Math.cos((angle * Math.PI) / 180);
                const y2 = 50 + outerRadius * Math.sin((angle * Math.PI) / 180);

                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="0.2"
                    strokeLinecap="round"
                  />
                );
              }
              return null;
            })}

            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={CONFIG.CIRCLE_RADIUS}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="opacity-20"
            />

            {/* Progress circle - only show if showProgress is enabled */}
            {showProgress && (
              <circle
                cx="50"
                cy="50"
                r={CONFIG.CIRCLE_RADIUS}
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className={`${colors.circle} transition-colors duration-1000`}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{
                  filter: `drop-shadow(0 0 2px currentColor)`,
                  transition:
                    "stroke-dashoffset 0.1s linear, stroke 1s ease-in-out",
                }}
              />
            )}
          </svg>

          {/* Center time display */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {isFinished ? (
              <img
                src="logo.png"
                alt="Logo"
                className="w-3/4 h-3/4 object-contain"
              />
            ) : (
              <div
                id="timer-text"
                className={`${getFontClass(timerFont)} ${colors.timerText} transition-colors duration-1000 text-center leading-none`}
                style={{
                  fontWeight: 400,
                  fontSize: getTimerFontSize(),
                  lineHeight: "1",
                  maxWidth: "90%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
