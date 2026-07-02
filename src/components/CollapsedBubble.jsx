import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingAnswerPanel from './FloatingAnswerPanel';
import SummaryCard from './SummaryCard';

/**
 * CollapsedBubble — 折叠的历史对话气泡
 * 点击展开显示该轮的完整结果（FloatingAnswerPanel + SummaryCard）
 */
export default function CollapsedBubble({ entry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-6">
      {/* 折叠头部 — 约束在 max-w-2xl 内 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-start"
      >
        <div className="max-w-2xl w-full">
          <div className="flex items-start gap-3">
            {/* 用户头像 */}
            <div className="w-8 h-8 flex items-center justify-center text-black text-xs font-bold flex-shrink-0 mt-1 bg-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <div className="relative flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-3 px-5 py-3 border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/12 transition-all cursor-pointer text-left"
              >
                <span className="text-sm text-[#AAAAAA] truncate flex-1 min-w-0">
                  {entry.query}
                </span>

                <span className="text-xs text-[#555555] font-mono flex-shrink-0">
                  已回答
                </span>

                <motion.svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[#555555] flex-shrink-0"
                >
                  <polyline points="6 9 12 15 18 9" />
                </motion.svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 展开内容 — 全宽 */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="collapsed-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden mt-4"
          >
            {entry.modelAnswers.length > 0 && (
              <FloatingAnswerPanel
                answers={entry.modelAnswers}
                currentIndex={entry.modelAnswers.length - 1}
                isComplete={true}
              />
            )}
            {entry.summaryResult && (
              <SummaryCard summary={entry.summaryResult} stage="done" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
