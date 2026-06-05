# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-05

### Added
- **Observability Layer**: Integrated Sentry for error tracking and Mixpanel for analytics.
- **Automated Testing**: Set up Vitest and React Testing Library for unit and integration tests.
- **Optimistic UI**: Implemented instant message sending in chat and smooth task state transitions.
- **Dynamic Pricing**: Added real-time budget calculation in task creation with automatic rush fee computation.
- **Voice Messages**: Added support for recording and playing audio messages natively in chat.
- **Task Promotion**: New "Pin to Top" feature for clients to boost task visibility.
- **Automated Payments**: Integrated Click and Payme UI into the VIP checkout flow.
- **Scalability**: Implemented list virtualization for the Task Feed using `@tanstack/react-virtual`.
- **Internationalization**: Set up `i18next` foundation with initial Uzbek and Russian locales.
- **Admin CRM**: Refactored admin panel with lazy-loading and sanitized broadcasts.

### Changed
- **Architecture**: Decomposed monolithic components into reusable hooks and sub-components.
- **Security**: Hardened Auth persistence to only store tokens and force profile refreshes on load.
- **UX**: Polished native "Telegram Mini App" feel with consistent haptics and animations.

### Fixed
- **Chat Scrolling**: Resolved unreliable auto-scroll issues by syncing with render cycles and typing indicators.
- **XSS Risks**: Sanitized all user-generated content and admin messages using DOMPurify.
- **Bundle Size**: Reduced initial load time by lazy-loading heavy charting and utility libraries.

## [0.0.0] - Initial Version
- Initial prototype implementation.
