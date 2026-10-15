/**
 * Shared motion variants adhering to danishkhan-webskill rules:
 * - Subtle opacity and small y translations (8-16px)
 * - Zero off-screen x translations
 * - No bounce, spring oscillations, or loops
 */

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

export const slideUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};
