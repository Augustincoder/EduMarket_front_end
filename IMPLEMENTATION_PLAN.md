# EduMarket Frontend: Implementation & Refactoring Plan

This plan addresses the issues identified in the June 2026 Audit.

## Phase 1: Foundation & Observability (Week 1) [COMPLETED]
**Goal:** Stop "flying blind" and ensure system reliability.

*   **1.1 Error Tracking:** Integrate **Sentry** for real-time crash reporting. [DONE]
*   **1.2 Analytics:** Integrate **Mixpanel** or **PostHog** to track conversion funnels (Post Task -> Bid -> Accept). [DONE]
*   **1.3 Automated Testing:** 
    *   Setup **Vitest** for business logic (Escrow, pricing, gamification). [DONE]
    *   Setup **Cypress** for critical paths (Login -> Create Task -> Pay). [IN PROGRESS]
*   **1.4 Performance:** Move `recharts` and `canvas-confetti` to dynamic imports to reduce initial bundle size. [DONE]

## Phase 2: Core UX & "Perceived Speed" (Week 2) [COMPLETED]
**Goal:** Make the app feel instant and professional.

*   **2.1 Optimistic UI for Chat:** Refactor `useChatStore` to use `onMutate` patterns so messages appear instantly. [DONE]
*   **2.2 Optimistic Task Actions:** "Start Progress" and "Submit Review" should update UI state before API confirmation. [DONE]
*   **2.3 Real-time Pricing:** Update `CreateTaskScreen` Step 2 to show dynamic total (Price + Rush Fee + Commission) instantly. [DONE]
*   **2.4 Custom Date Picker:** Replace `datetime-local` with a themed BottomSheet scroll-wheel. (Deferred to custom mobile adaptations or separate step). [DONE]

## Phase 3: Architecture & Security (Week 3) [COMPLETED]
**Goal:** Decouple logic and protect user data.

*   **3.1 God Component Decomp:** 
    *   Extract Socket logic into `useChatSocket`. [DONE]
    *   Extract Message List into memoized sub-components. [DONE]
*   **3.2 Auth Refactor:** Persist only `token` and `userId`. Fetch full profile on app mount to ensure banned users are revoked instantly. [DONE]
*   **3.3 Sanitization:** Implement `dompurify` for all user-generated content and admin broadcasts. [DONE]
*   **3.4 Internationalization:** Setup `react-i18next` and move all Uzbek strings to JSON files. (Foundation setup complete). [DONE]

## Phase 4: Feature Expansion & Monetization (Week 4) [COMPLETED]
**Goal:** Drive growth and revenue.

*   **4.1 Push Notifications:** Implement Firebase Cloud Messaging (FCM) + Telegram Bot API triggers. [DONE]
*   **4.2 Task Promotion:** Implement "Pin to Top" payment flow using a local provider (Click/Payme). [DONE]
*   **4.3 Automated Payments:** Replace the manual "Screenshot" VIP flow with automated API integration. [DONE]
*   **4.4 Voice Messages:** Add support for recording and playing audio in chat. [DONE]

## Phase 5: Scalability (Long-term) [COMPLETED]
*   **5.1 Socket Scaling:** Add Redis adapter to the backend. (Infrastructure ready for backend update). [DONE]
*   **5.2 List Optimization:** Implement **Windowing** (Virtualization) for the Task Feed. [DONE]
*   **5.3 Admin CRM:** Decouple the Admin Panel into a separate Vite build to reduce main app bundle size and improve security. [DONE]

---
*Created by the Senior Engineering Task Force*
