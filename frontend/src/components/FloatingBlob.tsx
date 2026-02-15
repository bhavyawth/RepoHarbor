import { motion } from 'framer-motion';

export default function FloatingBlob() {
  return (
    <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-purple-400/50 dark:bg-purple-600/24 rounded-full blur-3xl"
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.12, 0.95, 1],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-80 h-80 bg-blue-400/50 dark:bg-blue-600/30 rounded-full blur-3xl"
          animate={{
            x: [0, -70, 50, 0],
            y: [0, 60, -40, 0],
            scale: [1, 1.18, 0.92, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-72 h-72 bg-indigo-400/50 dark:bg-indigo-600/24 rounded-full blur-3xl"
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -50, 30, 0],
            scale: [1, 1.15, 0.94, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
  )
}
