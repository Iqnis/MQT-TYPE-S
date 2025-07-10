import { useState, useEffect } from "react";
import { RotateCcw, Play, Pause, Plus, Minus, Settings, X } from "lucide-react";

export default function Index() {
  // State
  const [timeLeft, setTimeLeft] = useState(60);
  const [initialTime, setInitialTime] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(true);
  const [preciseTime, setPreciseTime] = useState(60);
  const [showSettings, setShowSettings] = useState(false);
  const [defaultTimer, setDefaultTimer] = useState(60);
  const [backgroundTheme, setBackgroundTheme] = useState("slate");

  // Sound effects for warning and time-up
  const playSound = (soundType: string) => {
    try {
      const audio = new Audio(`/${soundType}.mp3`);
      audio.play().catch(() => {
        console.log(`Sound ${soundType} not available`);
      });
    } catch (error) {
      console.log("Sound not available");
    }
  };

  // Timer phases - based on absolute countdown values
  const getTimerPhase = (time: number) => {
    if (time <= 10) return "ending"; // Last 10 seconds
    if (time <= 30) return "warning"; // Last 30 seconds
    return "normal";
  };

  const phase = getTimerPhase(timeLeft);

  // Colors for each phase with background theme support
  const getColors = (phase: string, theme: string) => {
    switch (phase) {
      case "ending":
        return {
          bg: "from-red-900 via-red-800 to-red-900",
          circle: "stroke-red-400",
          text: "text-red-100",
          glow: "shadow-red-500/50",
        };
      case "warning":
        return {
          bg: "from-amber-900 via-orange-800 to-amber-900",
          circle: "stroke-amber-400",
          text: "text-amber-100",
          glow: "shadow-amber-500/50",
        };
      default:
        // Background and circle colors based on theme
        if (theme === "purple") {
          return {
            bg: "from-purple-900 via-purple-800 to-purple-900",
            circle: "stroke-purple-400",
            text: "text-purple-100",
            glow: "shadow-purple-500/50",
          };
        } else if (theme === "green") {
          return {
            bg: "from-green-900 via-green-800 to-green-900",
            circle: "stroke-green-400",
            text: "text-green-100",
            glow: "shadow-green-500/50",
          };
        } else if (theme === "white") {
          return {
            bg: "from-gray-100 via-gray-200 to-gray-100",
            circle: "stroke-gray-700",
            text: "text-gray-800",
            glow: "shadow-gray-500/50",
          };
        } else {
          // Default (current emerald/slate theme)
          return {
            bg: "from-slate-900 via-slate-800 to-slate-900",
            circle: "stroke-emerald-400",
            text: "text-emerald-100",
            glow: "shadow-emerald-500/50",
          };
        }
    }
  };

  const colors = getColors(phase, backgroundTheme);

  // Timer countdown logic with smooth movement
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && preciseTime > 0) {
      interval = setInterval(() => {
        setPreciseTime((time) => {
          const newTime = time - 0.1; // Decrease by 0.1 seconds

          if (newTime <= 0) {
            setTimeLeft(0);
            setIsRunning(false);
            setIsFinished(true);
            playSound("time-up");
            return 0;
          }

          // Update displayed time (whole seconds)
          const displayTime = Math.ceil(newTime);
          if (displayTime !== timeLeft) {
            setTimeLeft(displayTime);
            // Play warning sound when reaching 10 seconds
            if (displayTime === 10) {
              playSound("warn-sound");
            }
          }

          return newTime;
        });
      }, 100); // Update every 100ms for smooth animation
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, preciseTime, timeLeft]);

  // Control functions
  const toggleTimer = () => {
    if (isFinished) {
      resetTimer();
    } else {
      setIsRunning(!isRunning);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(defaultTimer);
    setInitialTime(defaultTimer);
    setPreciseTime(defaultTimer);
    setIsFinished(false);
  };

  const addTime = () => {
    setTimeLeft((prev) => {
      const newTime = prev + 5;
      setInitialTime((prevInitial) => Math.max(prevInitial, newTime));
      setPreciseTime(newTime);
      return newTime;
    });
  };

  const subtractTime = () => {
    setTimeLeft((prev) => {
      const newTime = Math.max(0, prev - 5);
      setPreciseTime(newTime);
      return newTime;
    });
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.code) {
        case "Enter":
          event.preventDefault();
          toggleTimer();
          showButtons();
          break;
        case "Space":
          event.preventDefault();
          resetTimer();
          showButtons();
          break;
        case "Equal":
        case "NumpadAdd":
          event.preventDefault();
          addTime();
          showButtons();
          break;
        case "Minus":
        case "NumpadSubtract":
          event.preventDefault();
          subtractTime();
          showButtons();
          break;
        case "Backslash":
          event.preventDefault();
          setButtonsVisible(!buttonsVisible);
          break;
      }

      // CTRL key for settings
      if (event.ctrlKey && event.code === "Period") {
        event.preventDefault();
        setShowSettings(!showSettings);
        showButtons();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [toggleTimer, resetTimer, addTime, subtractTime]);

  // Auto-hide buttons after 5 seconds
  useEffect(() => {
    const hideTimer = setTimeout(() => {
      setButtonsVisible(false);
    }, 5000);

    return () => clearTimeout(hideTimer);
  }, [buttonsVisible]);

  // Show buttons on any user interaction
  const showButtons = () => {
    setButtonsVisible(true);
  };

  // Progress calculation (depleting) - using precise time for smooth movement
  const progress = (preciseTime / initialTime) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = -circumference * (1 - progress / 100);

  // Time formatting
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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

      {/* Left control panel */}
      <div
        className={`absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10 transition-all duration-500 ${
          buttonsVisible
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-8 pointer-events-none"
        }`}
        onMouseEnter={showButtons}
        onMouseMove={showButtons}
      >
        {/* Play/Pause button */}
        <button
          onClick={() => {
            toggleTimer();
            showButtons();
          }}
          className={`p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 ${colors.glow} shadow-xl group`}
          aria-label={isRunning ? "Pause timer" : "Start timer"}
        >
          {isRunning ? (
            <Pause
              className={`w-6 h-6 ${colors.text} group-hover:scale-110 transition-transform duration-200`}
            />
          ) : (
            <Play
              className={`w-6 h-6 ${colors.text} group-hover:scale-110 transition-transform duration-200 ml-1`}
            />
          )}
        </button>

        {/* Reset button */}
        <button
          onClick={() => {
            resetTimer();
            showButtons();
          }}
          className={`p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 ${colors.glow} shadow-xl group`}
          aria-label="Reset timer to 60 seconds"
        >
          <RotateCcw
            className={`w-6 h-6 ${colors.text} group-hover:rotate-180 transition-transform duration-500`}
          />
        </button>

        {/* Add time button */}
        <button
          onClick={() => {
            addTime();
            showButtons();
          }}
          className={`p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 ${colors.glow} shadow-xl group`}
          aria-label="Add 5 seconds"
        >
          <Plus
            className={`w-6 h-6 ${colors.text} group-hover:scale-110 transition-transform duration-200`}
          />
        </button>

        {/* Subtract time button */}
        <button
          onClick={() => {
            subtractTime();
            showButtons();
          }}
          className={`p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 ${colors.glow} shadow-xl group`}
          aria-label="Remove 5 seconds"
        >
          <Minus
            className={`w-6 h-6 ${colors.text} group-hover:scale-110 transition-transform duration-200`}
          />
        </button>

        {/* Settings button */}
        <button
          onClick={() => {
            setShowSettings(true);
            showButtons();
          }}
          className={`p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 ${colors.glow} shadow-xl group`}
          aria-label="Settings"
        >
          <Settings
            className={`w-6 h-6 ${colors.text} group-hover:rotate-90 transition-transform duration-300`}
          />
        </button>
      </div>

      {/* Settings popup */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-80 max-w-sm mx-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${colors.text}`}>
                Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className={`p-2 rounded-full hover:bg-white/10 transition-colors ${colors.text}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timer Duration Setting */}
            <div className="mb-6">
              <label
                className={`block text-sm font-medium ${colors.text} mb-3`}
              >
                Default Timer: {Math.floor(defaultTimer / 60)}:
                {(defaultTimer % 60).toString().padStart(2, "0")}
              </label>
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                value={defaultTimer}
                onChange={(e) => setDefaultTimer(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div
                className={`flex justify-between text-xs ${colors.text} opacity-60 mt-1`}
              >
                <span>5s</span>
                <span>5m</span>
              </div>
            </div>

            {/* Background Theme */}
            <div className="mb-6">
              <label
                className={`block text-sm font-medium ${colors.text} mb-3`}
              >
                Background Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "slate", name: "Default", color: "emerald" },
                  { key: "purple", name: "Purple", color: "purple" },
                  { key: "green", name: "Green", color: "green" },
                  { key: "white", name: "White", color: "gray" },
                ].map((theme) => (
                  <button
                    key={theme.key}
                    onClick={() => setBackgroundTheme(theme.key)}
                    className={`p-3 rounded-lg border transition-all ${
                      backgroundTheme === theme.key
                        ? "border-white/40 bg-white/20"
                        : "border-white/20 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full mx-auto bg-${theme.color}-400`}
                    ></div>
                    <span className={`text-xs ${colors.text} mt-1 block`}>
                      {theme.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => {
                resetTimer();
                setShowSettings(false);
              }}
              className={`w-full py-3 rounded-lg bg-white/20 border border-white/30 hover:bg-white/30 transition-all ${colors.text} font-medium`}
            >
              Apply & Reset Timer
            </button>
          </div>
        </div>
      )}

      {/* Main timer */}
      <div className="relative">
        {/* Outer glow */}
        <div
          className={`absolute inset-0 rounded-full blur-3xl ${colors.glow} shadow-2xl opacity-40 scale-110`}
        ></div>

        {/* Timer circle */}
        <div className="relative w-[32rem] h-[32rem] md:w-[40rem] md:h-[40rem] lg:w-[48rem] lg:h-[48rem]">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Clock face background */}
            <circle
              cx="50"
              cy="50"
              r="47"
              fill="rgba(255, 255, 255, 0.05)"
              stroke="rgba(255, 255, 255, 0.1)"
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
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-white/20"
            />

            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className={`${colors.circle} transition-colors duration-1000`}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                filter: `drop-shadow(0 0 8px currentColor)`,
                transition:
                  "stroke-dashoffset 0.1s linear, stroke 1s ease-in-out",
              }}
            />
          </svg>

          {/* Center time display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`text-8xl md:text-9xl lg:text-[8rem] font-mono ${colors.text} transition-colors duration-1000 text-center leading-none`}
              style={{ fontWeight: 400 }}
            >
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      {/* Pulsing effect when finished */}
      {isFinished && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-red-500/20 animate-pulse"></div>
        </div>
      )}
    </div>
  );
}
