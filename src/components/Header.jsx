import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import ShinyText from './ui/ShinyText';
import GooeyNav from './ui/GooeyNav';
import { Switch } from './ui/switch-button';
import { runThemeTransition } from '../lib/themeTransition';

const navItems = [
  { label: '首页', href: '#home' },
  { label: '搜索', href: '#search' },
  { label: '关于', href: '#about' },
];

const LANGS = [
  { code: 'zh', label: '简体中文', short: '中' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ja', label: '日本語', short: '日' },
];

function LangSwitcher() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('zh');
  const wrapRef = useRef(null);

  // 点击外部关闭下拉
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const current = LANGS.find((l) => l.code === lang);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="切换语言"
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#F8F8F8] border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/25 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        {current.short}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 min-w-[120px] border border-white/15 bg-black/95 backdrop-blur-xl py-1 z-50"
          >
            {LANGS.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  onClick={() => {
                    setLang(l.code);
                    document.documentElement.lang = l.code;
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-white/[0.08] ${
                    l.code === lang ? 'text-[#FAFAFA]' : 'text-[#AAAAAA]'
                  }`}
                >
                  {l.label}
                  {l.code === lang && <span className="float-right">✓</span>}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * 同步落地主题到 <html>。
 * 必须直接操作 DOM 而不是放进 useEffect —— View Transition 在回调返回后
 * 立刻截取 new 快照，passive effect 那时还没执行，会截到旧主题。
 */
function applyTheme(dark) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('light', !dark);
  try {
    localStorage.setItem('gravlens-theme', dark ? 'dark' : 'light');
  } catch {
    /* 隐私模式下 localStorage 不可写，忽略 */
  }
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('gravlens-theme');
    return saved ? saved !== 'light' : true;
  });

  // 首帧恢复已保存的主题，不走动画
  useEffect(() => {
    applyTheme(isDark);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = () => {
    const next = !isDark;
    // 暗 → 亮：白色从中心向外扩散；亮 → 暗：白色从边缘收缩到中心
    runThemeTransition(next ? 'to-dark' : 'to-light', () => {
      applyTheme(next);
      setIsDark(next);
    });
  };

  return (
    <Switch
      value={isDark}
      onToggle={handleToggle}
      iconOn={<Moon className="size-4 text-black" />}
      iconOff={<Sun className="size-4 text-black" />}
      className="border border-white/15"
    />
  );
}

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
            text="Gravlens"
            speed={3}
            color="#F8F8F8"
            shineColor="#FAFAFA"
            spread={120}
            className="text-lg font-bold tracking-tight"
          />
          <span className="text-xs text-[#AAAAAA] font-mono tracking-wide hidden sm:block">
            引力透镜
          </span>
        </button>

        <div className="flex items-center gap-4">
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
          <LangSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
