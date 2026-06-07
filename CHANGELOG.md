# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-06-07

### Added
- **Senior Premium Overhaul**: Complete migration to iOS 17+ Design Language, featuring 32px squircle geometry and multi-layered ambient shadows.
- **Interactive Workspace ("Ish maydoni")**: Collaborative task management overlay in chat with real-time milestone tracking and progress visualization.
- **Conversational UX**: Fluid, step-by-step task creation journey with smart budget visualizers and task 'Digital Twin' previews.
- **Haptic Feedback Engine**: Integrated physical confirmation for all critical UI interactions using the Telegram SDK.
- **Advanced Micro-Interactions**: Premium spring-based damping for all transitions and iOS-style 'Pop' modal animations.
- **Enhanced Loading Systems**: Replaced pulse loaders with sophisticated shimmer-based skeletons across all high-traffic views.

### Changed
- **Client Home 2.0**: Redesigned as a widget-based dashboard with glassmorphism and "Mesh Aurora" animated backgrounds.
- **Core Atomic Components**: All inputs, buttons, chips, and badges upgraded to industrial-grade premium standards.
- **Foundation Upgrade**: Rebuilt the design token system in Tailwind CSS for world-class visual consistency.

### Fixed
- **Zero-Error State**: Completed a comprehensive ESLint audit resolving all critical hook violations and unused variable issues.
- **Legacy Typos**: Fixed logical bugs in `TaskCard` and `chatStore` that affected local persistence and message synchronization.

## [1.2.0] - 2026-06-06

### Added
- **Enterprise Features**: Implemented Phase 1-8 of the Enterprise Plan.
- **Reputation Passport**: Added unified verifiable freelancer metrics.
- **Peer Quality Shield & Disputes**: Fair and transparent dispute resolution UI.
- **Live Task Pulse**: Real-time ticker for ecosystem activity and demand.
- **Task DNA Matching**: AI-driven task recommendations.
- **Stealth Mode**: Privacy-first task exploration for high-profile clients.
- **Learning Compass**: Goal-oriented milestone and path tracking for freelancers.

### Changed
- **Task Feed & Details**: Complete redesign with enterprise features integration.
- **Code Quality**: Extensive ESLint fixes including React purity checks and effect state synchronizations to ensure zero-bug performance.

## [1.1.0] - 2026-06-05

### Added
- **Premium iOS Redesign**: Migrated visual identity to iOS 17+ standards, including system palettes, squircle geometry, and glassmorphism.
- **Native Integration**: Replaced browser dialogues with high-fidelity Telegram SDK native overlays (`showConfirm`, `showAlert`).
- **Enhanced Loading UX**: New premium spinners and soft-pulse skeleton loaders for a physically reactive feel.

### Changed
- **Micro-interactions**: Implemented spring-based physics for tactile feedback and smooth screen transitions across all core components.
- **Visual Hierarchy**: Refined typography tracking and surface depth layering to improve "breathability" and reduce scan fatigue.

### Fixed
- **Voice Message Support**: Dynamically handles audio MIME types (including iOS M4A) for seamless cross-platform recording and playback.
- **Chat Stability**: Refactored Zustand store to eliminate duplicate messages and improve optimistic state synchronization.
- **Referral Flow**: Fixed UI sync issues by integrating the new backend referral stats implementation.

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
