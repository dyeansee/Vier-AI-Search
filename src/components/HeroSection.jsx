import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MorphPanel } from './ui/ai-input';
import ShinyText from './ui/ShinyText';
import BorderGlow from './ui/BorderGlow';

const ALL_MODELS = [
  { id: 'deepseek', vendor: '深度求索', name: 'DeepSeek', version: 'V3', icon: 'D' },
  { id: 'tongyi', vendor: '阿里巴巴', name: '千问', version: '3.5', icon: '千' },
  { id: 'kimi', vendor: '月之暗面', name: 'Kimi', version: 'K2', icon: 'K' },
  { id: 'zhipu', vendor: '智谱', name: 'GLM', version: '4.5', icon: 'Z' },
  { id: 'doubao', vendor: '字节跳动', name: '豆包', version: 'Pro', icon: '豆' },
  { id: 'longchat', vendor: 'LongChat', name: 'LongChat', version: '2.0', icon: 'L' },
  { id: 'minimax', vendor: 'MiniMax', name: 'MiniMax', version: 'Text-01', icon: 'M' },
  { id: 'hunyuan', vendor: '腾讯', name: '混元', version: 'Turbo', icon: '混' },
  { id: 'mimo', vendor: 'Mimo', name: 'Mimo', version: '1.0', icon: 'Mi' },
  { id: 'gpt4', vendor: 'OpenAI', name: 'GPT', version: '4o', icon: 'G' },
  { id: 'claude', vendor: 'Anthropic', name: 'Claude', version: '4', icon: 'C' },
  { id: 'gemini', vendor: 'Google', name: 'Gemini', version: '2.5', icon: 'G' },
];

const PRESET_QUESTIONS = [
  { key: 'new_energy', label: '2026年新能源汽车市场趋势' },
  { key: 'react_vue', label: 'React vs Vue 2026选型建议' },
  { key: 'remote_work', label: '如何提高远程工作效率' },
];

export default function HeroSection({
  onSearch,
  isSearching,
  hasResults,
  onStopSearch,
  selectedModels = ['deepseek', 'tongyi', 'doubao'],
  onModelSelection,
  pathMode = 'memory',
  onPathModeChange,
  hasMemory = false,
}) {
  const [showModelSelector, setShowModelSelector] = useState(false);
  const selectorRef = useRef(null);

  useEffect(() => {
    if (!showModelSelector) return;
    document.body.style.overflow = 'hidden';
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowModelSelector(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showModelSelector]);

  const toggleModel = useCallback((modelId) => {
    const updated = selectedModels.includes(modelId)
      ? selectedModels.length > 1
        ? selectedModels.filter((id) => id !== modelId)
        : selectedModels
      : [...selectedModels, modelId];
    onModelSelection?.(updated);
  }, [selectedModels, onModelSelection]);

  const handleMorphPanelSearch = useCallback((text) => {
    if (!text.trim()) return;
    const matched = PRESET_QUESTIONS.find((q) => q.label === text.trim());
    if (matched) {
      onSearch(matched.key, 'memory');
    } else {
      onSearch(text, 'memory');
    }
  }, [onSearch]);

  const handlePresetClick = useCallback(
    (key, label) => {
      onSearch(key, 'memory');
    },
    [onSearch]
  );

  return (
    <section
      className={`relative z-[1] transition-all duration-500 ${
        hasResults ? 'pt-24 pb-8' : 'pt-36 pb-20'
      } px-4`}
    >
      <div className="max-w-3xl mx-auto text-center">
        <AnimatePresence mode="wait">
          {!hasResults && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
                <ShinyText
                  text="让多个AI"
                  speed={2.5}
                  color="#F8F8F8"
                  shineColor="#FAFAFA"
                  spread={120}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter"
                />
                <span className="relative inline-block mx-1 text-[#FAFAFA]">
                  <span className="relative z-[1]">一起</span>
                  <span className="absolute bottom-0.5 left-0 right-0 h-[3px] bg-white/10" />
                </span>
                <ShinyText
                  text="回答你的问题"
                  speed={2.5}
                  color="#F8F8F8"
                  shineColor="#FAFAFA"
                  spread={120}
                  delay={1}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter"
                />
              </h1>
              <p className="text-base text-[#F8F8F8] max-w-xl mx-auto mb-10 leading-relaxed">
                同时向 DeepSeek、千问、豆包等主流模型发起搜索，AI 自动对比总结
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative mx-auto flex flex-col items-center"
        >
          <MorphPanel
            onSearch={handleMorphPanelSearch}
            isSearching={isSearching}
            onStopSearch={onStopSearch}
            pathMode={pathMode}
            onPathModeChange={onPathModeChange}
            hasMemory={hasMemory}
          />

          <AnimatePresence>
            {isSearching && (
              <motion.button
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                onClick={onStopSearch}
                className="mt-3 flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#FAFAFA] bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all"
              >
                <span className="w-3 h-3 border border-white/40 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white/60" />
                </span>
                停止搜索
              </motion.button>
            )}
          </AnimatePresence>

          <div className="relative mt-4">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {ALL_MODELS.filter((m) => selectedModels.includes(m.id)).map((m) => (
                <span
                  key={m.id}
                  className="pill inline-flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 bg-white/20" />
                  {m.vendor}-{m.name}{' '}
                  <span className="text-[#AAAAAA] text-[11px]">{m.version}</span>
                </span>
              ))}
              <button
                type="button"
                onClick={() => setShowModelSelector((prev) => !prev)}
                className="pill inline-flex items-center gap-1.5 text-[#F8F8F8] hover:text-[#FAFAFA] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="2" y="2" width="8" height="8" rx="1" />
                  <rect x="14" y="2" width="8" height="8" rx="1" />
                  <rect x="2" y="14" width="8" height="8" rx="1" />
                  <rect x="14" y="14" width="8" height="8" rx="1" />
                </svg>
                选择AI
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`transition-transform duration-200 ${showModelSelector ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            {createPortal(
              <AnimatePresence>
                {showModelSelector && (
                  <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Global backdrop blur overlay */}
                    <motion.div
                      className="absolute inset-0 bg-black/60"
                      style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
                      onClick={() => setShowModelSelector(false)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />

                    {/* Modal */}
                    <motion.div
                      ref={selectorRef}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="relative z-10 w-full max-w-sm"
                    >
                      <BorderGlow
                        backgroundColor="#0a0a0a"
                        borderRadius={0}
                        glowColor="0 0 98"
                        colors={['#FAFAFA', '#F8F8F8', '#AAAAAA']}
                        glowRadius={24}
                        glowIntensity={0.5}
                        className="p-5"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-[#F8F8F8]">选择AI模型</span>
                          <span className="text-xs text-[#AAAAAA] font-mono">已选 {selectedModels.length}/{ALL_MODELS.length}</span>
                        </div>
                        <div className="space-y-1 max-h-[50vh] overflow-y-auto hide-scrollbar">
                          {ALL_MODELS.map((m) => {
                            const isSelected = selectedModels.includes(m.id);
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => toggleModel(m.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-200 ${
                                  isSelected
                                    ? 'bg-[#FAFAFA] text-black'
                                    : 'bg-white/[0.02] hover:bg-white/[0.04] text-[#F8F8F8]'
                                }`}
                              >
                                <div className={`w-6 h-6 flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                                  isSelected ? 'bg-black text-white' : 'bg-white/10 text-[#F8F8F8]'
                                }`}>
                                  {m.icon}
                                </div>
                                <span className="flex-1 text-sm">
                                  {m.vendor}-{m.name}{' '}
                                  <span className={`${isSelected ? 'text-black/50' : 'text-[#AAAAAA]'} text-xs ml-0.5`}>
                                    {m.version}
                                  </span>
                                </span>
                                <div
                                  className={`w-5 h-5 border-2 flex items-center justify-center transition-all duration-200 ${
                                    isSelected ? 'border-black bg-black' : 'border-white/15'
                                  }`}
                                >
                                  {isSelected && (
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                          <button
                            type="button"
                            onClick={() => {
                              onModelSelection?.(ALL_MODELS.map(m => m.id));
                            }}
                            className="text-xs text-[#AAAAAA] hover:text-[#FAFAFA] transition-colors font-mono"
                          >
                            全选
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowModelSelector(false)}
                            className="pill-active px-5 py-1.5 text-sm font-medium"
                          >
                            完成
                          </button>
                        </div>
                      </BorderGlow>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>,
              document.body
            )}
          </div>
        </motion.div>

        {!hasResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8"
          >
            <p className="text-xs text-[#AAAAAA] mb-3 uppercase tracking-widest font-mono">
              试试这些问题
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {PRESET_QUESTIONS.map((q) => (
                <button
                  key={q.key}
                  onClick={() => handlePresetClick(q.key, q.label)}
                  disabled={isSearching}
                  className="pill text-sm disabled:opacity-30"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
