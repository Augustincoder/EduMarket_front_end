// src/lib/observability.js
import * as Sentry from "@sentry/react";
import mixpanel from "mixpanel-browser";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;
const API_URL = import.meta.env.VITE_API_URL;
const IS_PROD = import.meta.env.PROD;

const getApiOrigin = () => {
  try {
    return API_URL ? new URL(API_URL).origin : null;
  } catch {
    return null;
  }
};

export function initObservability() {
  // ─── Sentry Initialization ────────────────────
  if (SENTRY_DSN) {
    const apiOrigin = getApiOrigin();
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: IS_PROD ? "production" : "development",
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: false,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: IS_PROD ? 0.1 : 1.0,
      tracePropagationTargets: ["localhost", ...(apiOrigin ? [apiOrigin] : [])],
      // Session Replay
      replaysSessionSampleRate: 0.05,
      replaysOnErrorSampleRate: 1.0,

      beforeSend(event) {
        if (event.request?.headers?.Authorization) {
          event.request.headers.Authorization = '[Filtered]';
        }
        return event;
      },
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
 * Identify user in analytics systems.
 * Only non-PII traits are sent (no names, usernames or emails).
 * @param {Object} user
 */
export function identifyUser(user) {
  if (!user?.id) return;

  if (MIXPANEL_TOKEN) {
    mixpanel.identify(user.id);
    mixpanel.people.set({
      "Role": user.role,
      "Is VIP": user.isVip,
    });
  }

  if (SENTRY_DSN) {
    Sentry.setUser({
      id: user.id,
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
