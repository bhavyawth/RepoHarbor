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
        <div className="absolute inset-0 rounded-3xl overflow-hidden bg-white dark:bg-[#020617] border border-indigo-100 dark:border-transparent shadow-inner">
          <FlickeringGrid
            className="absolute inset-0 z-2 size-full"
            squareSize={8}
            gridGap={12}
            color="#6366F1"
            maxOpacity={0.12}
            flickerChance={0.015}
            height={300}
            width={600}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]" />
        </div>
        <motion.div
          className="z-50 absolute top-6 left-8 bg-white dark:bg-gray-900/80 backdrop-blur-sm border border-indigo-200 dark:border-indigo-500/30 rounded-lg p-3 shadow-lg shadow-indigo-100/80 dark:shadow-indigo-900/30"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
          <code className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            const answer = await chat()
          </code>
        </motion.div>
        <motion.div
          className="z-50 absolute bottom-6 right-8 bg-white dark:bg-gray-900/80 backdrop-blur-sm border border-indigo-200 dark:border-indigo-500/30 rounded-lg p-3 shadow-lg shadow-indigo-100/80 dark:shadow-indigo-900/30"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
          <code className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            export default function App() {'{'}
          </code>
        </motion.div>
        <motion.div
          className="z-50 absolute top-1/2 -translate-y-1/2 right-36 bg-white dark:bg-gray-900/80 backdrop-blur-sm border border-indigo-200 dark:border-indigo-500/30 rounded-lg p-3 shadow-lg shadow-indigo-100/80 dark:shadow-indigo-900/30"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
          <code className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            import {`{ Request }`}
          </code>
        </motion.div>
        <motion.div
          className="z-50 absolute top-10 right-12 w-24 h-14 border-2 border-indigo-300/70 dark:border-indigo-600/40 rounded-2xl"
          animate={{ rotate: [0, 180, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="z-50 absolute bottom-10 left-20 w-24 h-16 border-2 border-indigo-300/70 dark:border-indigo-500/40"
          animate={{ rotate: [0, -180, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}