import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassBackground from './components/GlassBackground';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ResultsSection from './components/ResultsSection';
import Footer from './components/Footer';
import Strands from './components/ui/Strands';
import useSearchStateMachine from './hooks/useSearchStateMachine';

export default function App() {
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const {
    searchState,
    handleSearch,
    handleStopSearch,
    handleNewSearch,
    handlePresetSearch,
    handlePathModeChange,
    handleFollowUp,
    handleModelSelection,
  } = useSearchStateMachine();

  const showResults = searchState.stage !== 'idle';

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Page loading animation */}
      <AnimatePresence>
        {pageLoading && (
          <motion.div
            key="page-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
          >
            <div className="w-full" style={{ height: 200 }}>
            <Strands
              colors={['#da5800', '#3f0f91', '#094aaa']}
              count={1}
              speed={0.4}
              amplitude={1}
              waviness={1}
              thickness={0.9}
              glow={2.6}
              taper={3}
              spread={0.7}
              hueShift={0.27}
              intensity={0.55}
              saturation={1.5}
              opacity={1}
              scale={0.9}
            />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed background layer */}
      <GlassBackground />

      {/* Content layers */}
      <div className="relative z-[1] flex flex-col min-h-screen">
        <Header onReset={handleNewSearch} />

        <main className="flex-1">
          <HeroSection
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
              isSearching={searchState.isSearching}
              onFollowUp={handleFollowUp}
              onStopSearch={handleStopSearch}
            />
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
