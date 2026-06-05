// src/lib/observability.js
import * as Sentry from "@sentry/react";
import mixpanel from "mixpanel-browser";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;
const IS_PROD = import.meta.env.PROD;

export function initObservability() {
  // ─── Sentry Initialization ────────────────────────
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: 1.0, 
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
      // Session Replay
      replaysSessionSampleRate: 0.1, 
      replaysOnErrorSampleRate: 1.0,
      environment: IS_PROD ? "production" : "development",
    });
  } else {
    console.warn("Sentry DSN not found. Skipping initialization.");
  }

  // ─── Mixpanel Initialization ──────────────────────
  if (MIXPANEL_TOKEN) {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: !IS_PROD,
      track_pageview: true,
      persistence: "localStorage",
      api_host: "https://api-eu.mixpanel.com",
    });
  } else {
    console.warn("Mixpanel Token not found. Skipping initialization.");
  }
}

/**
 * Identify user in analytics systems
 * @param {Object} user 
 */
export function identifyUser(user) {
  if (!user?.id) return;

  if (MIXPANEL_TOKEN) {
    mixpanel.identify(user.id);
    mixpanel.people.set({
      "$name": user.fullname,
      "$email": user.username ? `${user.username}@t.me` : "no-username",
      "Role": user.role,
      "Is VIP": user.isVip,
    });
  }

  if (SENTRY_DSN) {
    Sentry.setUser({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  }
}

/**
 * Track custom event
 * @param {string} name 
 * @param {Object} props 
 */
export function trackEvent(name, props = {}) {
  if (MIXPANEL_TOKEN) {
    mixpanel.track(name, props);
  }
}
