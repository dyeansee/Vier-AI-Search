import { useState, useRef, useEffect } from 'react';
import GlassBackground from './components/GlassBackground';
import Galaxy from './components/ui/Galaxy';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ResultsSection from './components/ResultsSection';
import Footer from './components/Footer';
import useSearchStateMachine from './hooks/useSearchStateMachine';
import { runThemeTransition, onThemeChange } from './lib/themeTransition';

export default function App() {
  const [entered, setEntered] = useState(false);
  const [galaxyGone, setGalaxyGone] = useState(false);

  // 当前是否白天模式：决定首屏进入时是否需要「黑 → 白」扩散，
  // 以及星海是否要随波前一起隐去
  const [isLight, setIsLight] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('gravlens-theme') === 'light';
    } catch {
      return false;
    }
  });

  useEffect(() => onThemeChange((direction) => setIsLight(direction === 'to-light')), []);

  // 黑洞堙灭/抖动参考中心：实时测量「问昕」按钮中心（归一化[0,1]，与 Galaxy 的 uMouse 约定一致：y 轴翻转）
  const annihilateCenterRef = useRef({ x: 0.5, y: 0.95 });
  useEffect(() => {
    const measure = () => {
      const btn = document.querySelector('[aria-label="小昕 · Singularity"]');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      annihilateCenterRef.current = {
        x: (r.left + r.width / 2) / window.innerWidth,
        y: 1 - (r.top + r.height / 2) / window.innerHeight,
      };
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [entered]);

  const {
    searchState,
    handleStopSearch,
    handleNewSearch,
    handlePresetSearch,
    handlePathModeChange,
    handleFollowUp,
    handleModelSelection,
  } = useSearchStateMachine();

  const showResults = searchState.stage !== 'idle';

  // 首屏 → 内页：白天模式下页面底色要从黑切到白，用圆形波前从中心扩散完成，
  // 与星海（Galaxy）从中心向外的溶解同步进行；夜间模式前后都是黑底，
  // 没有颜色变化，直接切换以免多做一次无意义的过渡。
  const handleEnter = () => {
    if (isLight) {
      runThemeTransition('to-light', () => setEntered(true));
    } else {
      setEntered(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Fixed background layer */}
      <GlassBackground />

      {/* 首屏 Galaxy 动画：加载即显示，点击「问AI」后从中心向外溶解消失 */}
      {!galaxyGone && (
        <div
          className={`galaxy-layer fixed inset-0 pointer-events-none ${
            entered && isLight ? 'is-hidden' : ''
          }`}
          style={{ zIndex: 0 }}
          aria-hidden="true"
        >
          <Galaxy
            transparent
            mouseInteraction={true}
            repulsionStrength={0.09}
            repulsionRadius={0.3}
            bhRadius={0.048}
            bhGlowInner={0.06}
            bhGlowHalo={0.09}
            bhGlowStrength={0.8}
            bhParticleStrength={0.6}
            bhShakeStrength={0.02}
            bhEnabled={!entered}
            annihilateCenterRef={annihilateCenterRef}
            density={1.5}
            hueShift={225}
            saturation={0.35}
            glowIntensity={0.22}
            starSpeed={0.3}
            rotationSpeed={0.05}
            twinkleIntensity={0.45}
            speed={0.4}
            dissolving={entered}
            onDissolved={() => setGalaxyGone(true)}
          />
        </div>
      )}

      {/* Content layers */}
      <div className={`relative z-[1] flex flex-col min-h-screen ${entered ? 'theme-surface' : ''}`}>
        {/* 页面文字默认隐藏，点击问AI后浮现 */}
        <div
          className={entered ? '' : 'pointer-events-none'}
          style={{ opacity: entered ? 1 : 0, transition: 'opacity 0.6s ease-in-out' }}
        >
          <Header onReset={handleNewSearch} />
        </div>

        <main className="flex-1">
          <HeroSection
            entered={entered}
            onEnter={handleEnter}
            onSearch={handlePresetSearch}
            onStopSearch={handleStopSearch}
            isSearching={searchState.isSearching}
            hasResults={showResults}
            selectedModels={searchState.selectedModels}
            onModelSelection={handleModelSelection}
            pathMode={searchState.pathMode}
            onPathModeChange={handlePathModeChange}
            hasMemory={searchState.history.length > 0}
          />

          {showResults && (
            <ResultsSection
              query={searchState.query}
              queryKey={searchState.queryKey}
              stage={searchState.stage}
              modelAnswers={searchState.modelAnswers}
              summaryResult={searchState.summaryResult}
              currentModelIndex={searchState.currentModelIndex}
              isFollowUp={searchState.isFollowUp}
              history={searchState.history}
              onFollowUp={handleFollowUp}
            />
          )}
        </main>

        <div
          className={entered ? '' : 'pointer-events-none'}
          style={{ opacity: entered ? 1 : 0, transition: 'opacity 0.6s ease-in-out' }}
        >
          <Footer />
        </div>
      </div>
    </div>
  );
}
