import { motion } from 'framer-motion';
import { Github, ArrowRight } from 'lucide-react';
import NavBar from '../components/NavBar';

export default function Hero() {
  const handleGithubLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/github";
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white transition-colors duration-500 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-purple-400/30 dark:bg-purple-600/20 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-80 h-80 bg-blue-400/30 dark:bg-blue-600/20 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-72 h-72 bg-indigo-400/30 dark:bg-indigo-600/20 rounded-full blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Navbar */}
      <NavBar />

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-4rem)]">
          {/* Left side - Text content */}
          <div className="pt-20 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6">
                Chat with your{' '}
                <span className="bg-linear-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  GitHub repositories
                </span>{' '}
                using AI.
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-xl">
                Index any public repository. Ask questions. Understand code instantly using
                Retrieval-Augmented Generation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={handleGithubLogin} 
                className="group px-8 py-4 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25">
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
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full h-150"
            >
              {/* Grid pattern */}
              <div className="absolute inset-0 bg-linear-to-br from-purple-200/60 via-blue-200/60 to-indigo-200/60 dark:from-purple-900/20 dark:to-blue-900/20 rounded-3xl">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000012_1px,transparent_1px),linear-gradient(to_bottom,#00000012_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[4rem_4rem]" />
              </div>

              {/* Floating code blocks */}
              <motion.div
                className="absolute top-20 left-10 bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm border border-purple-300/60 dark:border-purple-500/30 rounded-lg p-4 shadow-2xl shadow-purple-200/50 dark:shadow-purple-900/50"
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
                className="absolute bottom-32 right-10 bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm border border-blue-300/60 dark:border-blue-500/30 rounded-lg p-4 shadow-2xl shadow-blue-200/50 dark:shadow-blue-900/50"
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
                  function embedRepo() {'{'}
                </code>
              </motion.div>

              <motion.div
                className="absolute top-1/2 right-20 bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm border border-indigo-300/60 dark:border-indigo-500/30 rounded-lg p-4 shadow-2xl shadow-indigo-200/50 dark:shadow-indigo-900/50"
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
                  import {'{'} RAG {'}'} from 'ai'
                </code>
              </motion.div>

              {/* Geometric shapes */}
              <motion.div
                className="absolute top-40 right-32 w-20 h-20 border-2 border-purple-400/60 dark:border-purple-500/40 rounded-lg"
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
                className="absolute bottom-20 left-32 w-16 h-16 border-2 border-blue-400/60 dark:border-blue-500/40"
                animate={{
                  rotate: [0, -360, 0],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}