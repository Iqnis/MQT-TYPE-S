import { useState, useEffect, useCallback } from "react";
import { RotateCcw, Play, Pause } from "lucide-react";

export default function Index() {
  const [timeLeft, setTimeLeft] = useState(60);
  const [initialTime, setInitialTime] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Timer phase states
  const getTimerPhase = (time: number, total: number) => {
    const percentage = (time / total) * 100;
    if (percentage <= 16.67) return "ending"; // Last 10 seconds of 60s = 16.67%
    if (percentage <= 50) return "warning"; // Last 30 seconds of 60s = 50%
    return "normal";
  };

  const phase = getTimerPhase(timeLeft, initialTime);

  // Color schemes for different phases
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

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false);
            setIsFinished(true);
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

  // Keyboard controls
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.code === "ArrowUp") {
      event.preventDefault();
      setTimeLeft((prev) => {
        const newTime = prev + 5;
        setInitialTime((prevInitial) => Math.max(prevInitial, newTime));
        return newTime;
      });
    } else if (event.code === "ArrowDown") {
      event.preventDefault();
      setTimeLeft((prev) => Math.max(0, prev - 5));
    } else if (event.code === "Space") {
      event.preventDefault();
      toggleTimer();
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const toggleTimer = () => {
    if (isFinished) {
      resetTimer();
    } else {
      setIsRunning(!isRunning);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
    setIsFinished(false);
  };

  // Calculate progress for circle
  const progress = ((initialTime - timeLeft) / initialTime) * 100;
  const circumference = 2 * Math.PI * 45; // radius of 45%
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Format time display
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

      {/* Replay button */}
      <button
        onClick={resetTimer}
        className={`absolute left-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 ${colors.glow} shadow-xl group z-10`}
        aria-label="Reset timer"
      >
        <RotateCcw
          className={`w-6 h-6 ${colors.text} group-hover:rotate-180 transition-transform duration-500`}
        />
      </button>

      {/* Main timer container */}
      <div className="relative">
        {/* Outer glow */}
        <div
          className={`absolute inset-0 rounded-full blur-3xl ${colors.glow} shadow-2xl opacity-40 scale-110`}
        ></div>

        {/* Timer circle */}
        <div className="relative w-80 h-80 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem]">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
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
              strokeWidth="3"
              fill="none"
              className={`${colors.circle} transition-all duration-1000 drop-shadow-lg`}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                filter: `drop-shadow(0 0 8px currentColor)`,
                transition: "stroke-dashoffset 1s ease-in-out",
              }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Time display */}
            <div
              className={`text-6xl md:text-7xl lg:text-8xl font-mono font-bold ${colors.text} mb-4 transition-colors duration-1000`}
            >
              {formatTime(timeLeft)}
            </div>

            {/* Control button */}
            <button
              onClick={toggleTimer}
              className={`p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/20 transition-all duration-300 ${colors.glow} shadow-xl group`}
              aria-label={isRunning ? "Pause timer" : "Start timer"}
            >
              {isRunning ? (
                <Pause
                  className={`w-8 h-8 ${colors.text} group-hover:scale-110 transition-transform duration-200`}
                />
              ) : (
                <Play
                  className={`w-8 h-8 ${colors.text} group-hover:scale-110 transition-transform duration-200 ml-1`}
                />
              )}
            </button>

            {/* Status text */}
            <div
              className={`mt-6 text-lg ${colors.text} opacity-75 transition-all duration-1000`}
            >
              {isFinished
                ? "Time's up!"
                : isRunning
                  ? "Running..."
                  : "Ready to start"}
            </div>
          </div>
        </div>

        {/* Progress percentage */}
        <div
          className={`absolute -bottom-16 left-1/2 -translate-x-1/2 text-2xl font-semibold ${colors.text} opacity-60 transition-all duration-1000`}
        >
          {Math.round(progress)}%
        </div>
      </div>

      {/* Controls help */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <div className={`text-sm ${colors.text} opacity-50 space-y-1`}>
          <p>↑↓ Add/Remove 5s • Space Play/Pause</p>
          <p>Current: {initialTime}s default</p>
        </div>
      </div>

      {/* Pulsing effect when timer ends */}
      {isFinished && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-red-500/20 animate-pulse"></div>
        </div>
      )}
    </div>
  );
}
