"use client";

import { useState, useEffect, useCallback } from "react";
import {
  GlobalSettings,
  HomePageContent,
  AboutPageContent,
  ContactPageContent,
  ServiceItem,
  PortfolioItem,
} from "./types";
import {
  DEFAULT_GLOBAL_SETTINGS,
  DEFAULT_HOME_CONTENT,
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_CONTACT_CONTENT,
  DEFAULT_SERVICES_CMS,
  DEFAULT_PORTFOLIO_CMS,
} from "./data";

export function useSiteContent() {
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_GLOBAL_SETTINGS);
  const [home, setHome] = useState<HomePageContent>(DEFAULT_HOME_CONTENT);
  const [about, setAbout] = useState<AboutPageContent>(DEFAULT_ABOUT_CONTENT);
  const [contact, setContact] = useState<ContactPageContent>(DEFAULT_CONTACT_CONTENT);
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES_CMS);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(DEFAULT_PORTFOLIO_CMS);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch(`/api/content?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.settings) {
            setSettings((prev) => ({ ...prev, ...json.data.settings }));
          }
          if (json.data.home) {
            setHome((prev) => ({ ...prev, ...json.data.home }));
          }
          if (json.data.about) {
            setAbout((prev) => ({ ...prev, ...json.data.about }));
          }
          if (json.data.contact) {
            setContact((prev) => ({ ...prev, ...json.data.contact }));
          }
          if (Array.isArray(json.data.services)) {
            setServices(json.data.services);
          }
          if (Array.isArray(json.data.portfolio)) {
            setPortfolio(json.data.portfolio);
          }
        }
      }
    } catch {
      // Keep existing/default fallback state seamlessly
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();

    const handleUpdate = () => {
      fetchContent();
    };

    window.addEventListener("site-content-updated", handleUpdate);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "site-content-updated") {
        fetchContent();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("site-content-updated", handleUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchContent]);

  return {
    settings,
    home,
    about,
    contact,
    services,
    portfolio,
    loading,
    refresh: fetchContent,
  };
}
