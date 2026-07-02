import { useState } from 'react';
import { motion } from 'framer-motion';
import ShinyText from './ui/ShinyText';

const COLLAPSE_THRESHOLD = 60;

export default function QueryBubble({ query, isFollowUp }) {
  const [expanded, setExpanded] = useState(false);

  if (!query) return null;

  const isLong = query.length > COLLAPSE_THRESHOLD;
  const displayText = isLong && !expanded
    ? query.slice(0, COLLAPSE_THRESHOLD) + '...'
    : query;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8 flex justify-start"
    >
      <div className="max-w-2xl w-full">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 flex items-center justify-center text-black text-xs font-bold flex-shrink-0 mt-1 bg-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <div className="relative flex-1 min-w-0">
            <div className={`px-5 py-3.5 border text-base leading-relaxed ${
              isFollowUp ? 'bg-white/[0.03] border-white/10' : 'bg-white/[0.04] border-white/8'
            }`}>
              <ShinyText
                text={displayText}
                color="#F8F8F8"
                shineColor="#FAFAFA"
                speed={3}
                spread={120}
                className="font-semibold"
              />
            </div>

            <div className="flex items-center gap-3 mt-1.5 ml-1">
              <span className="text-xs text-[#AAAAAA] font-mono tracking-wide">
                {isFollowUp ? '追问' : '搜索问题'}
              </span>
              {isLong && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-[#AAAAAA] hover:text-[#FAFAFA] font-mono transition-colors"
                >
                  {expanded ? '收起' : '展开全部'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
