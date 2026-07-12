"use client";

import { useEffect } from "react";

export default function VisitTracker() {
  useEffect(() => {
    // Only count unique visits per day using localStorage
    const today = new Date().toISOString().split("T")[0];
    const lastVisit = localStorage.getItem("lastVisitDate");
    
    if (lastVisit !== today) {
      fetch("/api/visit", { method: "POST" })
        .then(() => {
          localStorage.setItem("lastVisitDate", today);
        })
        .catch(() => {});
    }
  }, []);
  
  return null;
}
