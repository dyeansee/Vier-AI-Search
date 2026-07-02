import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassBackground from './components/GlassBackground';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ResultsSection from './components/ResultsSection';
import Footer from './components/Footer';
import Strands from './components/ui/Strands';
import { simulateSearch } from './data/mockResults';

export default function App() {
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const [searchState, setSearchState] = useState({
    stage: 'idle',
    query: '',
    queryKey: '',
    modelAnswers: [],
    summaryResult: null,
    isSearching: false,
    currentModelIndex: -1,
    isFollowUp: false,
    history: [],
    selectedModels: ['deepseek', 'tongyi', 'doubao'],
    pathMode: 'memory',
  });

  const handleSearch = useCallback(async (queryKey, modeOrLabel = 'new') => {
    let isFollowUp;
    let followUpLabel = null;

    if (modeOrLabel === 'memory') {
      isFollowUp = true;
    } else if (modeOrLabel === 'new') {
      isFollowUp = false;
    } else {
      isFollowUp = true;
      followUpLabel = modeOrLabel;
    }

    setSearchState((prev) => {
      const newHistory = [...prev.history];
      // 如果上一轮已完成（有答案），归档到 history
      if (prev.stage === 'done' && prev.modelAnswers.length > 0) {
        newHistory.push({
          id: Date.now(),
          query: prev.query,
          queryKey: prev.queryKey,
          modelAnswers: prev.modelAnswers,
          summaryResult: prev.summaryResult,
          isFollowUp: prev.isFollowUp,
        });
      }
      return {
        ...prev,
        history: newHistory,
        query: followUpLabel || prev.query,
        queryKey: queryKey,
        isSearching: true,
        stage: 'searching',
        modelAnswers: [],
        summaryResult: null,
        currentModelIndex: -1,
        isFollowUp,
      };
    });

    await simulateSearch(queryKey, (progress) => {
      setSearchState((prev) => ({
        ...prev,
        stage: progress.stage,
        modelAnswers: progress.answers || prev.modelAnswers,
        currentModelIndex: progress.modelIndex ?? prev.currentModelIndex,
        summaryResult: progress.summary || null,
        isSearching: progress.stage !== 'done',
        isFollowUp: progress.isFollowUp || prev.isFollowUp,
      }));
    }, isFollowUp);
  }, []);

  const handleStopSearch = useCallback(() => {
    setSearchState((prev) => ({
      ...prev,
      isSearching: false,
      stage: prev.modelAnswers.length > 0 ? 'done' : 'idle',
    }));
  }, []);

  const handleNewSearch = useCallback(() => {
    setSearchState({
      stage: 'idle',
      query: '',
      queryKey: '',
      modelAnswers: [],
      summaryResult: null,
      isSearching: false,
      currentModelIndex: -1,
      isFollowUp: false,
      history: [],
      selectedModels: ['deepseek', 'tongyi', 'doubao'],
      pathMode: 'memory',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePresetSearch = useCallback(
    (key, label) => {
      setSearchState((prev) => ({ ...prev, query: label }));
      handleSearch(key);
    },
    [handleSearch]
  );

  const handlePathModeChange = useCallback((mode) => {
    setSearchState((prev) => ({ ...prev, pathMode: mode }));
  }, []);

  const handleFollowUp = useCallback(
    (key, label) => {
      setSearchState((prev) => ({ ...prev, query: label }));
      handleSearch(key, 'memory');
    },
    [handleSearch]
  );

  const handleModelSelection = useCallback((models) => {
    setSearchState((prev) => ({ ...prev, selectedModels: models }));
  }, []);

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
