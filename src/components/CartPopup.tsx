"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function CartPopup({
  show,
  count,
}: {
  show: boolean;
  count: number;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-4 right-4 bg-white border shadow-lg rounded-full px-4 py-2 flex items-center gap-2 z-50"
        >
          <span className="text-black font-medium">
            🛒 {count} item(s) in cart
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
