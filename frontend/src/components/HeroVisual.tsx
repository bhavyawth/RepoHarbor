import { motion } from 'framer-motion';
import { FlickeringGrid } from './ui/flickering-grid';

export default function HeroVisual() {
  return (
    <div className="relative hidden lg:block h-64">
      <motion.div
        initial={{
          opacity: 0,
          x: 60,
          scale: 0.96,
          filter: "blur(8px)",
        }}
        whileInView={{
          opacity: 1,
          x: 0,
          scale: 1,
          filter: "blur(0px)",
        }}
        viewport={{ once: true }}
        transition={{
          duration: 1,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative w-full h-full"
      >
        {/* Grid pattern */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden bg-gradient-to-br from-purple-200 via-blue-200 to-indigo-200 dark:from-[#020617] dark:via-[#020617] dark:to-[#020617]">
          {/* Primary grid */}
          
          <FlickeringGrid
            className="absolute inset-0 z-2 size-full"
            squareSize={8}
            gridGap={12}
            color="#6366F1"
            maxOpacity={0.15}
            flickerChance={0.015}
            height={300}
            width={600}
          />

          {/* Soft glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-300/40 via-blue-300/30 to-indigo-300/40 dark:from-purple-900/20 dark:via-blue-900/10 dark:to-indigo-900/20" />
        </div>

        {/* Floating code blocks */}
        <motion.div
          className="z-50 absolute top-6 left-8 bg-white/60 dark:bg-gray-900/80 backdrop-blur-sm border border-purple-500/50 dark:border-purple-500/30 rounded-lg p-3 shadow-2xl shadow-purple-200/50 dark:shadow-purple-900/30"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <code className="text-xs text-purple-700 dark:text-purple-400 font-medium">
            const answer = await chat()
          </code>
        </motion.div>

        <motion.div
          className="z-50 absolute bottom-6 right-8 bg-white/60 dark:bg-gray-900/80 backdrop-blur-sm border border-blue-500/60 dark:border-blue-500/30 rounded-lg p-3 shadow-2xl shadow-blue-200/50 dark:shadow-blue-900/30"
          animate={{
            y: [0, 8, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <code className="text-xs text-blue-700 dark:text-blue-400 font-medium">
            export default function App() {'{'}
          </code>
        </motion.div>

        <motion.div
          className="z-50 absolute top-1/2 -translate-y-1/2 right-36 bg-white/60 dark:bg-gray-900/80 backdrop-blur-sm border border-indigo-500/60 dark:border-indigo-500/30 rounded-lg p-3 shadow-2xl shadow-indigo-200/70 dark:shadow-indigo-900/30"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <code className="text-xs text-indigo-700 dark:text-indigo-400 font-medium">
            import {`{ Request }`}
          </code>
        </motion.div>

        {/* Geometric shapes */}
        <motion.div
          className="z-50 absolute top-10 right-12 w-24 h-14 border-2 border-purple-400/60 dark:border-purple-600/40 rounded-2xl"
          animate={{
            rotate: [0, 180, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        <motion.div
          className="z-50 absolute bottom-10 left-20 w-24 h-16 border-2 border-blue-400/60 dark:border-blue-500/40"
          animate={{
            rotate: [0, -180, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  );
}