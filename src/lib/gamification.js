// src/lib/gamification.js

/**
 * Calculate user level based on completed tasks count.
 * @param {number} completedTasks - Total number of tasks completed by freelancer
 * @returns {Object} - Level info: { level, name, nextTarget, progress }
 */
export function calculateLevel(completedTasks) {
  const tasks = completedTasks || 0;
  
  if (tasks >= 50) {
    return { level: 4, name: 'Top Rated', nextTarget: null, progress: 1 };
  }
  if (tasks >= 20) {
    return { level: 3, name: 'Pro', nextTarget: 50, progress: (tasks - 20) / 30 };
  }
  if (tasks >= 5) {
    return { level: 2, name: 'Tajribali', nextTarget: 20, progress: (tasks - 5) / 15 };
  }
  
  return { level: 1, name: 'Yangi', nextTarget: 5, progress: tasks / 5 };
}

/**
 * Calculate user streak based on lastLogin and loginHistory.
 * For now, we will mock it based on whether the user has a `streakCount` in backend or just return a default if not found.
 */
export function calculateStreak(user) {
  // If backend supports streakCount later, use it:
  if (user?.streakCount !== undefined) {
    return user.streakCount;
  }
  
  // Dummy logic: return 3 days streak for demo if not provided
  return 3; 
}

/**
 * Fire a rich confetti animation for positive reinforcement.
 */
export function fireConfetti() {
  import('canvas-confetti').then((module) => {
    const confetti = module.default;
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#eab308']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#eab308']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  });
}
