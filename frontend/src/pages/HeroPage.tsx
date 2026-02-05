import { motion } from 'framer-motion';
import { Github, ArrowRight } from 'lucide-react';
import { BorderBeam } from '../components/ui/border-beam';
import { TypingAnimation } from '../components/ui/typing-animation';
import { FlickeringGrid } from '../components/ui/flickering-grid';

export default function Hero() {
  const handleGithubLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/github";
  };

  return (
    <div className="relative min-h-screen bg-[#f5f7fb] dark:bg-black text-slate-900 dark:text-white transition-colors duration-500 overflow-hidden">
      {/* Animated background blobs */}
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

      {/* Hero Content */}
      <div className="relative z-10 max-w-11/12 mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-32 items-center min-h-[calc(100vh-4rem)]">
          {/* Left side - Text content */}
          <div className="pt-20 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6">
                Chat with your{' '}
                <span className="bg-linear-to-r min-w-[22ch] from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent inline-block">
                  <TypingAnimation
                    words={[
                      "GitHub repositories",
                      "Source code",
                      "Private projects",
                      "Codebase"
                    ]}
                    showCursor={true}
                    blinkCursor={true}
                    cursorStyle={'line'}
                    pauseDelay={2000}
                    loop
                    startOnView={false}
                    className="bg-linear-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent"
                  />
                </span>
                <p>{' '}using AI.</p>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-xl">
                Index any public repository. Ask questions. Understand code instantly using
                Retrieval-Augmented Generation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleGithubLogin} 
                  className="relative group px-8 py-4 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 dark:from-purple-600 dark:to-blue-600 dark:hover:from-purple-500 dark:hover:to-blue-500 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 dark:shadow-purple-500/25"
                >
                  <BorderBeam duration={8} size={100} />
                  <Github className="w-5 h-5" />
                  Sign Up with GitHub
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right side - Abstract shapes */}
          <div className="relative hidden lg:block">
            <motion.div
              initial={{
                opacity: 0,
                x: 60,
                scale: 0.96,
                filter: "blur(8px)",
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                filter: "blur(0px)",
              }}
              transition={{
                duration: 1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative w-full h-150"
            >
              {/* Grid pattern */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden
                bg-linear-to-br from-purple-200 via-blue-200 to-indigo-200
                dark:from-[#020617] dark:via-[#020617] dark:to-[#020617]">

                {/* Primary grid */}
                <div className="absolute inset-0
                bg-[linear-gradient(to_right,rgba(0,0,0,0.18)_1px,transparent_1px),
                linear-gradient(to_bottom,rgba(0,0,0,0.18)_1px,transparent_1px)]
                dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.15)_1px,transparent_1px),
                linear-gradient(to_bottom,rgba(255,255,255,0.15)_1px,transparent_1px)]
                bg-size-[32px_32px]" />
                <FlickeringGrid
                  className="absolute inset-0 z-2 size-full"
                  squareSize={8}
                  gridGap={12}
                  color="#6366F1"
                  maxOpacity={0.15}
                  flickerChance={0.015}
                  height={800}
                  width={800}
                />

                {/* Soft glow overlay */}
                <div className="absolute inset-0 bg-linear-to-br from-purple-300/40 via-blue-300/30 to-indigo-300/40 dark:from-purple-900/20 dark:via-blue-900/10 dark:to-indigo-900/20" />

              </div>

              {/* Floating code blocks */}
              <motion.div
                className="z-50 absolute top-20 left-10 bg-white/60 dark:bg-gray-900/80 backdrop-blur-sm border border-purple-500/50 dark:border-purple-500/30 rounded-lg p-4 shadow-2xl shadow-purple-200/50 dark:shadow-purple-900/30"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <code className="text-sm text-purple-700 dark:text-purple-400 font-medium">
                  const answer = await chat()
                </code>
              </motion.div>

              <motion.div
                className="z-50 absolute bottom-32 right-10 bg-white/60 dark:bg-gray-900/80 backdrop-blur-sm border border-blue-500/60 dark:border-blue-500/30 rounded-lg p-4 shadow-2xl shadow-blue-200/50 dark:shadow-blue-900/30"
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <code className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                  export default function App() {'{'}
                </code>
              </motion.div>

              <motion.div
                className="z-50 absolute top-1/2 right-20 bg-white/60 dark:bg-gray-900/80 backdrop-blur-sm border border-indigo-500/60 dark:border-indigo-500/30 rounded-lg p-4 shadow-2xl shadow-indigo-200/70 dark:shadow-indigo-900/30"
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <code className="text-sm text-indigo-700 dark:text-indigo-400 font-medium">
                  import {`{ Request, Response }`} from 'express';
                </code>
              </motion.div>

              {/* Geometric shapes */}
              <motion.div
                className="z-50 absolute top-36 right-32 w-32 h-20 border-3 border-purple-400/60 dark:border-purple-600/40 rounded-4xl"
                animate={{
                  rotate: [0, 360, 0],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              
              <motion.div
                className="z-50 absolute bottom-20 left-32 w-20 h-32 border-3 border-blue-400/60 dark:border-blue-500/40"
                animate={{
                  rotate: [0, -360, 0],
                }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

