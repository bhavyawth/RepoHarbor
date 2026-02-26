import { motion } from 'framer-motion';

type BlobConfig = {
  size: number;
  top: string;
  left: string;
  color: string;
  darkColor: string;
  duration: number;
  x: [number, number, number, number];
  y: [number, number, number, number];
  scale: [number, number, number, number];
};

const blobs: BlobConfig[] = [
  {
    size: 320,
    top: '6%',
    left: '8%',
    color: 'bg-sky-400/35',
    darkColor: 'dark:bg-sky-600/25',
    duration: 17,
    x: [0, 28, -18, 0],
    y: [0, -22, 16, 0],
    scale: [1, 1.08, 0.95, 1],
  },
  {
    size: 280,
    top: '14%',
    left: '72%',
    color: 'bg-cyan-400/30',
    darkColor: 'dark:bg-cyan-600/22',
    duration: 13,
    x: [0, -30, 20, 0],
    y: [0, 26, -12, 0],
    scale: [1, 1.1, 0.94, 1],
  },
  {
    size: 360,
    top: '30%',
    left: '46%',
    color: 'bg-indigo-400/30',
    darkColor: 'dark:bg-indigo-600/20',
    duration: 19,
    x: [0, 24, -14, 0],
    y: [0, -20, 14, 0],
    scale: [1, 1.09, 0.93, 1],
  },
  {
    size: 260,
    top: '44%',
    left: '10%',
    color: 'bg-blue-400/32',
    darkColor: 'dark:bg-blue-600/22',
    duration: 15,
    x: [0, -20, 16, 0],
    y: [0, 18, -14, 0],
    scale: [1, 1.07, 0.95, 1],
  },
  {
    size: 300,
    top: '58%',
    left: '74%',
    color: 'bg-sky-400/32',
    darkColor: 'dark:bg-sky-600/22',
    duration: 21,
    x: [0, 22, -16, 0],
    y: [0, -16, 18, 0],
    scale: [1, 1.1, 0.94, 1],
  },
  {
    size: 260,
    top: '74%',
    left: '34%',
    color: 'bg-cyan-400/30',
    darkColor: 'dark:bg-cyan-600/20',
    duration: 14,
    x: [0, 18, -14, 0],
    y: [0, 20, -10, 0],
    scale: [1, 1.06, 0.96, 1],
  },
  {
    size: 340,
    top: '88%',
    left: '68%',
    color: 'bg-indigo-400/28',
    darkColor: 'dark:bg-indigo-600/20',
    duration: 20,
    x: [0, -24, 14, 0],
    y: [0, -18, 14, 0],
    scale: [1, 1.11, 0.93, 1],
  },
];

export default function FloatingBlob() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[260vh] overflow-hidden">
      {blobs.map((blob, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full blur-3xl will-change-transform ${blob.color} ${blob.darkColor}`}
          style={{
            top: blob.top,
            left: blob.left,
            width: blob.size,
            height: blob.size,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            x: blob.x,
            y: blob.y,
            scale: blob.scale,
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.35,
          }}
        />
      ))}
    </div>
  );
}
