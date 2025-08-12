import { useEffect, useState } from "react";
import Display from "./Display";
import Settings from "./Settings";

export default function Index() {
  const [currentPage, setCurrentPage] = useState("display");

  useEffect(() => {
    // Simple client-side routing
    const path = window.location.pathname;
    if (path === "/settings") {
      setCurrentPage("settings");
    } else {
      setCurrentPage("display");
    }

    // Listen for navigation
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/settings") {
        setCurrentPage("settings");
      } else {
        setCurrentPage("display");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (currentPage === "settings") {
    return <Settings />;
  }

  return <Display />;
}
