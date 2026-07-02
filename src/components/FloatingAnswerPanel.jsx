import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MODEL_CONFIG = {
  deepseek: { vendor: '深度求索', name: 'DeepSeek', version: 'V3', icon: 'D' },
  tongyi: { vendor: '阿里巴巴', name: '千问', version: '3.5', icon: '千' },
  kimi: { vendor: '月之暗面', name: 'Kimi', version: 'K2', icon: 'K' },
  zhipu: { vendor: '智谱', name: 'GLM', version: '4.5', icon: 'Z' },
  doubao: { vendor: '字节跳动', name: '豆包', version: 'Pro', icon: '豆' },
  longchat: { vendor: 'LongChat', name: 'LongChat', version: '2.0', icon: 'L' },
  minimax: { vendor: 'MiniMax', name: 'MiniMax', version: 'Text-01', icon: 'M' },
  hunyuan: { vendor: '腾讯', name: '混元', version: 'Turbo', icon: '混' },
  mimo: { vendor: 'Mimo', name: 'Mimo', version: '1.0', icon: 'Mi' },
  gpt4: { vendor: 'OpenAI', name: 'GPT', version: '4o', icon: 'G' },
  claude: { vendor: 'Anthropic', name: 'Claude', version: '4', icon: 'C' },
  gemini: { vendor: 'Google', name: 'Gemini', version: '2.5', icon: 'G' },
};

function AnswerContent({ answer }) {
  return (
    <>
      {answer.answer.split('\n\n').map((paragraph, i) => {
        const formatted = paragraph.replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="text-[#FAFAFA] font-semibold">$1</strong>'
        );
        const isConsensus =
          answer.consensus &&
          answer.consensus.some((c) => paragraph.includes(c));

        return (
          <p
            key={i}
            className={`leading-relaxed ${isConsensus ? 'border-l-2 border-white/20 pl-3' : ''}`}
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      })}

      {answer.sources && answer.sources.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-xs text-[#555555] font-mono mb-1.5">Sources</p>
          <div className="flex flex-wrap gap-1">
            {answer.sources.map((source, si) => (
              <span
                key={si}
                className="inline-block px-2 py-0.5 bg-white/[0.03] text-xs text-[#AAAAAA] border border-white/5 font-mono break-all max-w-full"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      )}

      {answer.consensus && answer.consensus.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {answer.consensus.map((tag, ti) => (
            <span
              key={ti}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/[0.04] text-xs text-[#F8F8F8] border border-white/10"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {tag}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

export default function FloatingAnswerPanel({
  answers,
  currentIndex,
  isComplete,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleToggleAll = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  if (!answers || answers.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Grid container: 2 columns, 2 rows */}
      <div
        className={`grid border border-white/10 bg-[#0a0a0a] ${
          isOpen ? 'grid-rows-[auto_1fr]' : 'grid-rows-[auto]'
        }`}
        style={{ gridTemplateColumns: 'auto 1fr' }}
      >
        {/* Button — bottom layer, spans all rows */}
        <button
          onClick={handleToggleAll}
          className="row-start-1 row-end-3 col-start-1 z-0 flex items-start gap-1.5 px-4 py-2 text-xs font-medium bg-white/[0.03] text-[#F8F8F8] border-r border-white/10 hover:bg-white/[0.06] hover:text-[#FAFAFA] transition-all duration-200 cursor-pointer select-none"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          查看对话答案
        </button>

        {/* Model cards — top layer */}
        <div className="row-start-1 col-start-2 z-10 flex items-stretch bg-[#0a0a0a]">
          {answers.map((answer, idx) => {
            const config = MODEL_CONFIG[answer.id] || {
              vendor: answer.vendor || '',
              name: answer.name,
              version: '',
              icon: answer.name?.[0] || '?',
            };
            const isActive = idx <= currentIndex;
            const isLoading = !isComplete && idx === currentIndex;
            const isHovered = !isOpen && hoveredCard === answer.id;

            return (
              <motion.div
                key={answer.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
                onMouseEnter={() => !isOpen && setHoveredCard(answer.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`relative flex-1 flex items-center gap-2 px-3 py-2 cursor-pointer transition-all duration-200 ${
                  idx < answers.length - 1 ? 'border-r border-white/10' : ''
                } ${
                  isActive ? '' : 'opacity-40'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center text-black text-xs font-bold flex-shrink-0 bg-white/80">
                  {config.icon}
                </div>
                <span className="text-xs font-semibold whitespace-nowrap truncate text-[#F8F8F8]">
                  {config.name}
                </span>
                {isLoading && (
                  <span className="w-1.5 h-1.5 bg-white animate-pulse flex-shrink-0" />
                )}

                {/* Floating popup on hover (disabled when expanded) */}
                <AnimatePresence initial={false}>
                  {isHovered && (
                    <motion.div
                      key={`popup-${answer.id}`}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute -left-[1px] -right-[1px] top-full z-50 bg-[#0a0a0a] border border-t-0 border-white/10 overflow-hidden"
                    >
                      <div className="p-3 text-sm text-[#F8F8F8] space-y-2.5 max-h-[50vh] overflow-y-auto overflow-x-hidden hide-scrollbar break-words">
                        <AnswerContent answer={answer} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Content area — row 2, col 2, flex columns aligned with model cards */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="answer-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="row-start-2 col-start-2 z-10 overflow-hidden border-t border-white/10"
            >
              <div className="flex items-stretch">
                {answers.map((answer, idx) => (
                  <div key={answer.id} className={`flex-1 ${
                    idx < answers.length - 1 ? 'border-r border-white/10' : ''
                  }`}>
                    <div className="p-3 text-sm text-[#F8F8F8] space-y-2.5 max-h-[50vh] overflow-y-auto overflow-x-hidden hide-scrollbar break-words">
                      <AnswerContent answer={answer} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
