import { useState, useEffect } from "react";
import { RotateCcw, Play, Pause, Plus, Minus } from "lucide-react";

export default function Index() {
  // State
  const [timeLeft, setTimeLeft] = useState(60);
  const [initialTime, setInitialTime] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(true);

  // Sound effects (placeholder - replace with actual audio files)
  const playSound = (soundType: string) => {
    try {
      // Placeholder for sound effects
      // const audio = new Audio(`/sounds/${soundType}.mp3`);
      // audio.play();
      console.log(`Playing ${soundType} sound`);
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

  // Colors for each phase
  const getColors = (phase: string) => {
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
        return {
          bg: "from-slate-900 via-slate-800 to-slate-900",
          circle: "stroke-emerald-400",
          text: "text-emerald-100",
          glow: "shadow-emerald-500/50",
        };
    }
  };

  const colors = getColors(phase);

  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            playSound("timer-end");
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  // Control functions
  const toggleTimer = () => {
    if (isFinished) {
      resetTimer();
    } else {
      setIsRunning(!isRunning);
      playSound(isRunning ? "pause" : "start");
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(60);
    setInitialTime(60);
    setIsFinished(false);
    playSound("reset");
  };

  const addTime = () => {
    setTimeLeft((prev) => {
      const newTime = prev + 5;
      setInitialTime((prevInitial) => Math.max(prevInitial, newTime));
      return newTime;
    });
    playSound("add-time");
  };

  const subtractTime = () => {
    setTimeLeft((prev) => Math.max(0, prev - 5));
    playSound("subtract-time");
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
          showButtons();
          break;
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

  // Progress calculation (depleting)
  const progress = (timeLeft / initialTime) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

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
      </div>

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
                  "stroke-dashoffset 0.2s ease-out, stroke 1s ease-in-out",
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
