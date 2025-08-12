import { useEffect, useState } from "react";
import Display from "./Display";
import Settings from "./Settings";

export default function Index() {
  const [currentPage, setCurrentPage] = useState("settings"); // Default to settings
  const [previewSettings, setPreviewSettings] = useState(null);

  useEffect(() => {
    // Simple client-side routing
    const path = window.location.pathname;
    if (path === "/display") {
      setCurrentPage("display");
    } else {
      setCurrentPage("settings"); // Default to settings
    }

    // Listen for navigation
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/display") {
        setCurrentPage("display");
      } else {
        setCurrentPage("settings");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Handle navigation between pages
  const navigateToDisplay = (settings = null) => {
    setPreviewSettings(settings);
    setCurrentPage("display");
    window.history.pushState({}, "", "/display");
  };

  const navigateToSettings = () => {
    setCurrentPage("settings");
    window.history.pushState({}, "", "/");
  };

  if (currentPage === "display") {
    return (
      <Display
        previewSettings={previewSettings}
        onBackToSettings={navigateToSettings}
      />
    );
  }

  return <Settings onNavigateToDisplay={navigateToDisplay} />;
}
