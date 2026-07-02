import { motion } from 'framer-motion';

/**
 * RelatedQuestions — Follow-up suggestions.
 * Shows after search completes.
 */

const FOLLOW_UP_SUGGESTIONS = {
  new_energy: [
    { key: 'new_energy__brands', label: '哪些品牌最值得关注？' },
  ],
  react_vue: [
    { key: 'react_vue__learn', label: '那我应该从哪个开始学？怎么入门？' },
  ],
  remote_work: [
    { key: 'remote_work__tools', label: '有什么具体工具推荐吗？最好是免费的' },
  ],
};

const GENERIC_SUGGESTIONS = [
  { label: '能再详细展开讲讲吗？' },
  { label: '有什么需要注意的风险？' },
  { label: '有没有具体的案例或数据？' },
];

export default function RelatedQuestions({
  queryKey,
  stage,
  onFollowUp,
}) {
  if (stage !== 'done') return null;

  const parentKey = queryKey?.split('__')[0] || queryKey;
  const suggestions = FOLLOW_UP_SUGGESTIONS[parentKey] || [];
  const allSuggestions = [
    ...suggestions.map((s) => ({ ...s, isPreset: true })),
    ...GENERIC_SUGGESTIONS.map((s) => ({ ...s, isPreset: false })),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="mt-6 mb-[30px]"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="shrink-0">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <h4 className="text-sm font-semibold text-[#FAFAFA] shrink-0">继续探索</h4>
        <span className="text-xs text-[#AAAAAA] font-mono shrink-0">Related</span>

        {allSuggestions.map((s, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.08 }}
            onClick={() => {
              if (s.isPreset && s.key) {
                onFollowUp(s.key, s.label);
              } else {
                onFollowUp(s.label, s.label);
              }
            }}
            className="pill text-sm flex items-center gap-2 group hover:bg-white/[0.06]"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-[#AAAAAA] group-hover:text-[#FAFAFA] transition-colors"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
            {s.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
