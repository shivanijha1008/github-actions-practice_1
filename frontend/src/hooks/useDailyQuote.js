import { useEffect, useState } from "react";
import { api } from "../lib/api";

const STORAGE_KEY = "scheduler.quote.v1";

export function useDailyQuote() {
  const [quote, setQuote] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      const today = new Date().toISOString().slice(0, 10);
      if (cached && cached.date === today) return cached.data;
    } catch {
      /* ignore */
    }
    return { text: "Be so good they can't ignore you.", author: "Steve Martin" };
  });

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    let cached = null;
    try {
      cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      /* ignore */
    }
    if (cached?.date === today) return;
    api
      .getQuote()
      .then((data) => {
        setQuote(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, data }));
      })
      .catch(() => {
        /* fallback already set */
      });
  }, []);

  return quote;
}
