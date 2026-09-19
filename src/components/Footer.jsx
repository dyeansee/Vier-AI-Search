export default function Footer() {
  return (
    <footer className="relative z-[1] border-t border-white/5 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center bg-[#FAFAFA] text-black">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <p className="text-sm text-[#AAAAAA] font-mono tracking-wide">
              Gravlens 引力透镜 — 多模型聚合搜索
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#555555]">
              Demo · 模拟数据
            </span>
            <span className="text-xs text-[#333333]">|</span>
            <span className="text-xs text-[#555555]">
              React + Vite + Tailwind
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
