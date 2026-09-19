import { motion } from 'framer-motion';

// 颜色 / 主题切换按钮
// 原始组件为 shadcn + Tailwind 语义色（bg-background / bg-card-foreground），
// 本项目中无对应 token，已替换为项目实际调色板：
//   轨道 → bg-white/15（黑底上的微弱轨道）
//   旋钮 → bg-[#FAFAFA]（接近纯白的旋钮，承托深色图标）
export function Switch({ value, onToggle, iconOn, iconOff, className = '' }) {
  return (
    <button
      type="button"
      aria-label={value ? '切换到浅色模式' : '切换到深色模式'}
      className={`flex w-12 cursor-pointer rounded-full bg-white/15 p-0.5 ${
        value ? 'justify-end' : 'justify-start'
      } ${className}`}
      onClick={onToggle}
    >
      <motion.div
        className="flex size-6 items-center justify-center rounded-full bg-[#FAFAFA]"
        layout
        transition={{
          type: 'spring',
          duration: 0.6,
          bounce: 0.2,
        }}
      >
        {value ? (
          <motion.div
            key="on"
            initial={{ opacity: 0, rotate: -60 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 60 }}
            transition={{ duration: 0.3 }}
            className="flex size-5 items-center justify-center"
          >
            {iconOn}
          </motion.div>
        ) : (
          <motion.div
            key="off"
            initial={{ opacity: 0, rotate: 60 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -60 }}
            transition={{ duration: 0.3 }}
            className="flex size-5 items-center justify-center"
          >
            {iconOff}
          </motion.div>
        )}
      </motion.div>
    </button>
  );
}
