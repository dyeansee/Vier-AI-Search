"use client"

import React from "react"
import { cx } from "class-variance-authority"
import { AnimatePresence, motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BorderBeam } from "./border-beam"
import PathModeToggle from "../PathModeToggle"

// ============================================================
// ColorOrb — vibrant color orb for black theme
// ============================================================
function ColorOrb({
  dimension = "192px",
  className,
  spinDuration = 20,
}) {
  const dimValue = parseInt(dimension.replace("px", ""), 10)

  const blurStrength =
    dimValue < 50 ? Math.max(dimValue * 0.008, 1) : Math.max(dimValue * 0.015, 4)

  const contrastStrength =
    dimValue < 50 ? Math.max(dimValue * 0.004, 1.2) : Math.max(dimValue * 0.008, 1.5)

  const pixelDot = dimValue < 50 ? Math.max(dimValue * 0.004, 0.05) : Math.max(dimValue * 0.008, 0.1)

  const shadowRange = dimValue < 50 ? Math.max(dimValue * 0.004, 0.5) : Math.max(dimValue * 0.008, 2)

  const maskRadius =
    dimValue < 30 ? "0%" : dimValue < 50 ? "5%" : dimValue < 100 ? "15%" : "25%"

  const adjustedContrast =
    dimValue < 30 ? 1.1 : dimValue < 50 ? Math.max(contrastStrength * 1.2, 1.3) : contrastStrength

  return (
    <div
      className={cn("color-orb", className)}
      style={{
        width: dimension,
        height: dimension,
        "--base": "#000000",
        "--accent1": "#6366f1",
        "--accent2": "#14b8a6",
        "--accent3": "#fbbf24",
        "--spin-duration": `${spinDuration}s`,
        "--blur": `${blurStrength}px`,
        "--contrast": adjustedContrast,
        "--dot": `${pixelDot}px`,
        "--shadow": `${shadowRange}px`,
        "--mask": maskRadius,
      }}
    >
      <style>{`
        @property --angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        .color-orb {
          display: grid;
          grid-template-areas: "stack";
          overflow: hidden;
          border-radius: 50%;
          position: relative;
          transform: scale(1.1);
        }

        .color-orb::before,
        .color-orb::after {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          transform: translateZ(0);
        }

        .color-orb::before {
          background:
            conic-gradient(
              from calc(var(--angle) * 2) at 25% 70%,
              var(--accent3),
              transparent 20% 80%,
              var(--accent3)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 45% 75%,
              var(--accent2),
              transparent 30% 60%,
              var(--accent2)
            ),
            conic-gradient(
              from calc(var(--angle) * -3) at 80% 20%,
              var(--accent1),
              transparent 40% 60%,
              var(--accent1)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 15% 5%,
              var(--accent2),
              transparent 10% 90%,
              var(--accent2)
            ),
            conic-gradient(
              from calc(var(--angle) * 1) at 20% 80%,
              var(--accent1),
              transparent 10% 90%,
              var(--accent1)
            ),
            conic-gradient(
              from calc(var(--angle) * -2) at 85% 10%,
              var(--accent3),
              transparent 20% 80%,
              var(--accent3)
            );
          box-shadow: inset var(--base) 0 0 var(--shadow) calc(var(--shadow) * 0.2);
          filter: blur(var(--blur)) contrast(var(--contrast));
          animation: spin var(--spin-duration) linear infinite;
        }

        .color-orb::after {
          background-image: radial-gradient(
            circle at center,
            var(--base) var(--dot),
            transparent var(--dot)
          );
          background-size: calc(var(--dot) * 2) calc(var(--dot) * 2);
          backdrop-filter: blur(calc(var(--blur) * 2)) contrast(calc(var(--contrast) * 2));
          mix-blend-mode: overlay;
        }

        .color-orb[style*="--mask: 0%"]::after {
          mask-image: none;
        }

        .color-orb:not([style*="--mask: 0%"])::after {
          mask-image: radial-gradient(black var(--mask), transparent 75%);
        }

        @keyframes spin {
          to {
            --angle: 360deg;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .color-orb::before {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

// ============================================================
// Form Context
// ============================================================
const FormContext = React.createContext({})
const useFormContext = () => React.useContext(FormContext)

// ============================================================
// MorphPanel — Main search component (black theme, square)
// ============================================================
const FORM_WIDTH = 360
const FORM_HEIGHT = 240

export function MorphPanel({ onSearch, isSearching, onStopSearch, pathMode, onPathModeChange, hasMemory, onOpen }) {
  const wrapperRef = React.useRef(null)
  const textareaRef = React.useRef(null)

  const [showForm, setShowForm] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const triggerClose = React.useCallback(() => {
    setShowForm(false)
    textareaRef.current?.blur()
  }, [])

  const triggerOpen = React.useCallback(() => {
    onOpen?.()
    setShowForm(true)
    setTimeout(() => {
      textareaRef.current?.focus()
    })
  }, [onOpen])

  const handleSubmit = React.useCallback((text) => {
    triggerClose()
    if (onSearch && text.trim()) {
      onSearch(text)
    }
  }, [onSearch, triggerClose])

  const handleStop = React.useCallback(() => {
    if (onStopSearch) {
      onStopSearch()
    }
    triggerClose()
  }, [onStopSearch, triggerClose])

  React.useEffect(() => {
    function clickOutsideHandler(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target) && showForm) {
        triggerClose()
      }
    }
    document.addEventListener("mousedown", clickOutsideHandler)
    return () => document.removeEventListener("mousedown", clickOutsideHandler)
  }, [showForm, triggerClose])

  const ctx = React.useMemo(
    () => ({ showForm, inputValue, setInputValue, triggerOpen, triggerClose, handleSubmit, handleStop, isSearching, pathMode, onPathModeChange, hasMemory }),
    [showForm, inputValue, triggerOpen, triggerClose, handleSubmit, handleStop, isSearching, pathMode, onPathModeChange, hasMemory]
  )

  return (
    <div className="flex items-center justify-center" style={{ width: FORM_WIDTH, height: FORM_HEIGHT }}>
      <BorderBeam
        size="md"
        colorVariant="colorful"
        theme="dark"
        borderRadius={0}
        active={showForm}
        // brightness 太高（2.2）会把每个颜色通道提亮到 255 饱和 → 冲成纯白。
        // 回到 1.3 保留色彩，靠 opacity 变量拉满 + saturation 1.8 保持加亮加粗。
        brightness={1.3}
        saturation={1.8}
        style={{
          // 包内 md/dark 预设透明度太低（stroke 0.26 / inner 0.42 / bloom 0.24），
          // 用 CSS 变量放大（>1 可超出预设）：描边×4、内层×2.5、外发光×4。
          '--beam-stroke-opacity': '4',
          '--beam-inner-opacity': '2.5',
          '--beam-bloom-opacity': '4',
        }}
      >
        <motion.div
          ref={wrapperRef}
          data-panel
          className="relative z-3 flex flex-col items-center overflow-hidden border border-white/15 bg-black"
          initial={false}
          animate={{
            width: showForm ? FORM_WIDTH : "auto",
            height: showForm ? FORM_HEIGHT : 44,
            borderRadius: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 550,
            damping: 45,
            mass: 0.7,
            delay: showForm ? 0 : 0.08,
          }}
        >
          <FormContext.Provider value={ctx}>
            <DockBar />
            <InputForm ref={textareaRef} />
          </FormContext.Provider>
        </motion.div>
      </BorderBeam>
    </div>
  )
}

// ============================================================
// DockBar — Collapsed state
// ============================================================
function DockBar() {
  const { showForm, triggerOpen, isSearching, handleStop } = useFormContext()
  return (
    <footer className="mt-auto flex h-[44px] items-center justify-center whitespace-nowrap select-none">
      <div className="flex items-center justify-center gap-2 px-3">
        <div className="flex w-fit items-center gap-2">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="blank"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                className="h-5 w-5"
              />
            ) : (
              <motion.div
                key="orb"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ColorOrb dimension="24px" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 搜索中：思考中左侧的停止按钮 */}
        {isSearching && !showForm && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleStop()
            }}
            aria-label="停止搜索"
            title="停止搜索"
            className="flex items-center justify-center w-5 h-5 cursor-pointer group"
          >
            <span className="w-3.5 h-3.5 border border-white/40 flex items-center justify-center group-hover:border-white/70 transition-colors">
              <span className="w-1.5 h-1.5 bg-white/60 group-hover:bg-white/90 transition-colors" />
            </span>
          </button>
        )}

        <Button
          type="button"
          className="flex h-fit flex-1 justify-end px-2 !py-0.5"
          variant="ghost"
          onClick={triggerOpen}
          aria-label="小昕 · Singularity"
          title="小昕 · Singularity"
        >
          <span className="truncate text-sm text-[#F8F8F8]">
            {isSearching ? (
              <span className="flex items-center gap-1.5">
                思考中
                <span className="flex gap-0.5">
                  <motion.span
                    className="w-1 h-1 bg-[#F8F8F8] rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  />
                  <motion.span
                    className="w-1 h-1 bg-[#F8F8F8] rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.span
                    className="w-1 h-1 bg-[#F8F8F8] rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                </span>
              </span>
            ) : "问昕"}
          </span>
        </Button>
      </div>
    </footer>
  )
}

// ============================================================
// InputForm — Expanded search form (square, dark)
// ============================================================
const SPEED_FACTOR = 1

function InputForm({ ref }) {
  const { triggerClose, showForm, handleSubmit, pathMode, onPathModeChange, hasMemory } = useFormContext()
  const [localValue, setLocalValue] = React.useState("")
  const btnRef = React.useRef(null)

  async function handleFormSubmit(e) {
    e.preventDefault()
    if (localValue.trim()) {
      handleSubmit(localValue)
      setLocalValue("")
    }
  }

  function handleKeys(e) {
    if (e.key === "Escape") triggerClose()
    if (e.key === "Enter" && e.metaKey) {
      e.preventDefault()
      btnRef.current?.click()
    }
  }

  function handleKeyDown(e) {
    // Alt/Ctrl+Enter 插入换行（手动插入，浏览器默认不处理）
    if (e.key === "Enter" && (e.altKey || e.ctrlKey)) {
      e.preventDefault()
      const el = e.target
      const start = el.selectionStart
      const end = el.selectionEnd
      setLocalValue(localValue.slice(0, start) + "\n" + localValue.slice(end))
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 1
      })
      return
    }
    if (e.key === "Enter" && !e.shiftKey && !e.metaKey) {
      e.preventDefault()
      if (localValue.trim()) {
        handleSubmit(localValue)
        setLocalValue("")
      }
    }
  }

  return (
    <form
      onSubmit={handleFormSubmit}
      className="absolute bottom-0"
      style={{ width: FORM_WIDTH, height: FORM_HEIGHT, pointerEvents: showForm ? "all" : "none" }}
    >
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 550 / SPEED_FACTOR, damping: 45, mass: 0.7 }}
            className="flex h-full flex-col p-1"
          >
            <div className="flex justify-between py-1">
              <p className="text-[#F8F8F8] z-2 ml-[38px] flex items-center gap-[6px] text-xs select-none">
                AI Search
              </p>
              <button
                type="submit"
                ref={btnRef}
                className="text-[#F8F8F8] right-4 mt-1 flex -translate-y-[3px] cursor-pointer items-center justify-center gap-1 bg-transparent pr-1 text-center select-none"
              >
                <KeyHint>⌘</KeyHint>
                <KeyHint className="w-fit">Enter</KeyHint>
              </button>
            </div>
            {hasMemory && onPathModeChange && (
              <div className="flex justify-center py-1">
                <div style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}>
                  <PathModeToggle pathMode={pathMode} setPathMode={onPathModeChange} />
                </div>
              </div>
            )}
            <textarea
              ref={ref}
              placeholder="问问小昕..."
              name="message"
              className="h-full w-full resize-none scroll-py-2 p-4 text-sm text-[#FAFAFA] placeholder:text-[#AAAAAA] outline-none bg-transparent"
              required
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={(e) => {
                handleKeys(e)
                handleKeyDown(e)
              }}
              spellCheck={false}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-2 left-3"
          >
            <ColorOrb dimension="24px" />
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}

// ============================================================
// KeyHint — Keyboard shortcut hint (dark theme)
// ============================================================
function KeyHint({ children, className }) {
  return (
    <kbd
      className={cx(
        "text-[#AAAAAA] flex h-6 w-fit items-center justify-center border border-white/15 px-[6px] text-xs font-sans",
        className
      )}
    >
      {children}
    </kbd>
  )
}

export default MorphPanel
