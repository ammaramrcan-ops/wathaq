import { ReactNode } from "react";
import { motion } from "motion/react";

interface PageTransitionProps {
  children: ReactNode;
  key?: string;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.995 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex-grow flex flex-col"
    >
      {children}
    </motion.div>
  );
}
