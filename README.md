# EduMarket Frontend 📱 — Premium TMA Freelance Experience

[![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5-443E38.svg?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![TanStack_Query](https://img.shields.io/badge/TanStack_Query-5-FF4154.svg?style=for-the-badge&logo=react-query)](https://tanstack.com/query)

> **A World-Class Student Micro-Task Marketplace explicitly optimized for the Telegram Mini App (TMA) Ecosystem.**

EduMarket Frontend is a high-performance Web Application designed with a **Senior Premium Minimalist** philosophy. It bridges the gap between web and native by leveraging advanced iOS-native design patterns, real-time synchronization, and deep Telegram API integration.

---

## 🎨 Design Philosophy: The "Senior Premium" Edge

EduMarket isn't just an app; it's a **Tactile Interface**. We follow the **iOS 17+ Design Language** strictly:

-   **32px Squircle Corners**: Every card and modal uses Apple's G2 curvature proxy for a softer, organic feel.
-   **Glassmorphism & Depth**: Multi-layered backgrounds (`backdrop-blur-xl`) and ambient "Aurora Mesh" gradients create a sense of physical space.
-   **Haptic Interaction Engine**: Integrated with Telegram's `HapticFeedback` API to provide physical confirmation for every critical action (submit, toggle, error).
-   **Physics-Based Motion**: Animations use spring-damping constants (Stiffness: 400, Damping: 25) instead of linear transitions, making the UI feel responsive and weightful.

---

## 🚀 Key Marketplace Capabilities

### 🪪 Reputation Passport (Verifiable Profile)
A next-gen freelancer profile that visualizes trust. It cryptographic-style badges, completion velocity charts, and student verification status directly from the university system.

### 🧬 Task DNA Discovery
A personalized "Discovery Feed" that uses AI-driven compatability scores. Tasks are rendered in a high-density, minimalist layout optimized for quick scanning and decision making.

### 💬 Unified Collaborative Rooms
Every task has a dedicated **Collaboration Room**.
- **Real-time Chat**: Optimistic UI with Socket.io.
- **Workspace Overlay**: Shared milestones and task progress tracking.
- **EduDrive Integration**: Seamless file previewing for documents and media.

### 🛡️ Peer Quality Shield (E-Sign & Escrow)
Built-in protection for both parties. Deliveries include a "Watermarked Preview" before funds are released, ensuring quality control before final delivery.

---

## 📐 Advanced State Management Architecture

We strictly separate ephemeral UI state from persistent server state to maintain **60FPS performance**.

```mermaid
graph TD;
    UI[React 19 Components] -->|Select/Mutate| Z[Zustand Store]
    UI -->|Query/Prefetch| RQ[TanStack Query]
    
    SubGraph ClientState [Zustand: Synchronous]
        Z --> Auth[Auth Session & Role]
        Z --> Nav[TMA BackButton History]
        Z --> Opt[Optimistic Chat Engine]
    End
    
    SubGraph ServerState [TanStack Query: Async]
        RQ --> Feed[Task & Gig Feed]
        RQ --> Prof[User Reputation Stats]
        RQ --> Milestone[Shared Workspaces]
    End
    
    Socket[Socket.io Client] -.->|Invalidation| RQ
    Socket -.->|Immediate Updates| Z
```

---

## ⚡ Performance Engineering

-   **Atomic Renders**: Leveraging memoized components and Zustand selectors to prevent unnecessary re-renders in high-frequency views (like chat).
-   **SWR (Stale-While-Revalidate)**: Ultra-fast loading states using TanStack Query's background synchronization.
-   **Virtualized Tasmasi**: High-performance infinite scrolling for task feeds and messaging history.
-   **Edge-Optimized Assets**: Dynamic image resizing and CDN-aware caching headers for freelancer portfolios.

---

## 📱 Deep Telegram Integration

-   **Native Navigation**: Orchestrates Telegram's `MainButton` and `BackButton` for a truly native navigation flow.
-   **Biometric-Ready Auth**: HMCA-based validation of Telegram's `initData` ensuring zero fake user accounts.
-   **Cloud Storage**: Persisting user-specific theme preferences (Glass vs Solid) directly in Telegram's secure cloud.

---

## 🛠️ Installation & Tech Stack

### Requirements
- **Node.js**: v20+
- **Vite**: v6 (Next-gen build tool)
- **Styling**: Tailwind CSS v4 (Modern utility-first)

### 1. Setup
```bash
git clone https://github.com/your-username/edumarket-frontend.git
cd edumarket-frontend
npm install
```

### 2. Environment
Create `.env` in root:
```env
VITE_API_URL="https://your-api.com/v1"
VITE_SOCKET_URL="https://your-api.com"
VITE_TELEGRAM_BOT_TOKEN="xxx"
```

### 3. Execution
```bash
npm run dev   # Local development with TMA simulator
npm run build # Production-optimized bundle
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
