import { motion } from 'framer-motion';
import ShinyText from './ui/ShinyText';
import GooeyNav from './ui/GooeyNav';

const navItems = [
  { label: '首页', href: '#home' },
  { label: '搜索', href: '#search' },
  { label: '关于', href: '#about' },
];

export default function Header({ onReset }) {
  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 flex items-center justify-center bg-[#FAFAFA] text-black">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <path d="M11 8v6" />
              <path d="M8 11h6" />
            </svg>
          </div>
          <ShinyText
            text="PolyGlass"
            speed={3}
            color="#F8F8F8"
            shineColor="#FAFAFA"
            spread={120}
            className="text-lg font-bold tracking-tight"
          />
        </button>

        <div className="hidden sm:flex items-center">
          <GooeyNav
            items={navItems}
            particleCount={12}
            particleDistances={[80, 8]}
            particleR={80}
            initialActiveIndex={0}
            animationTime={500}
            timeVariance={200}
            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
          />
        </div>
      </div>
    </motion.header>
  );
}
