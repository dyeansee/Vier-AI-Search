import { useState } from 'react';
import { motion } from 'framer-motion';
import BorderGlow from './ui/BorderGlow';

export default function SummaryCard({ summary }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `【共识结论】\n${summary.consensus}\n\n【差异分析】\n${summary.divergence}\n\n【综合建议】\n${summary.recommendation}\n\n可信度: ${summary.trustScore}%`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <BorderGlow
      backgroundColor="#0a0a0a"
      borderRadius={0}
      glowColor="45 90 60"
      colors={['#FAFAFA', '#F8F8F8', '#AAAAAA']}
      glowRadius={30}
      glowIntensity={0.6}
      edgeSensitivity={25}
      className="mb-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-white/5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white text-black flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-[#FAFAFA]">AI 综合总结</h3>
              <p className="text-xs text-[#AAAAAA] font-mono truncate">由 GPT-4o 基于多个模型答案生成</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#AAAAAA] font-mono tracking-wide hidden sm:inline">可信度</span>
              <div className="w-12 sm:w-20 h-2 bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${summary.trustScore}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                  className={`h-full ${
                    summary.trustScore >= 90
                      ? 'bg-[#FAFAFA]'
                      : summary.trustScore >= 75
                        ? 'bg-[#F8F8F8]'
                        : 'bg-[#AAAAAA]'
                  }`}
                />
              </div>
              <span className="text-sm font-bold text-[#F8F8F8] font-mono">
                {summary.trustScore}%
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="w-8 h-8 flex items-center justify-center text-[#AAAAAA] hover:text-[#FAFAFA] bg-white/[0.03] hover:bg-white/[0.06] transition-all"
              title="复制总结"
            >
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="px-5 sm:px-7 py-5 sm:py-6 space-y-5 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3"
          >
            <div className="mt-0.5 flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white/5 border border-white/10">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#FAFAFA] mb-1.5">共识结论</h4>
              <p className="text-sm text-[#F8F8F8] leading-relaxed">{summary.consensus}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex gap-3"
          >
            <div className="mt-0.5 flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white/5 border border-white/10">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#FAFAFA] mb-1.5">差异分析</h4>
              <p className="text-sm text-[#F8F8F8] leading-relaxed">{summary.divergence}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-3"
          >
            <div className="mt-0.5 flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white/5 border border-white/10">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#FAFAFA] mb-1.5">综合建议</h4>
              <p className="text-sm text-[#F8F8F8] leading-relaxed">{summary.recommendation}</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </BorderGlow>
  );
}
