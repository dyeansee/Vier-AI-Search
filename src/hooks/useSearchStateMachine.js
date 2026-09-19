import { useState, useCallback, useRef } from 'react';
import { simulateSearch } from '../data/mockResults';

export const INITIAL_STATE = {
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
};

/**
 * Compute next state when a search is initiated.
 * Pure function — suitable for unit testing state transitions.
 */
export function reduceStartSearch(prev, { queryKey, isFollowUp, followUpLabel }) {
  const newHistory = [...prev.history];
  // Archive previous completed round
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
    queryKey,
    isSearching: true,
    stage: 'searching',
    modelAnswers: [],
    summaryResult: null,
    currentModelIndex: -1,
    isFollowUp,
  };
}

/**
 * Compute next state on search progress callback.
 */
export function reduceProgress(prev, progress) {
  return {
    ...prev,
    stage: progress.stage,
    modelAnswers: progress.answers || prev.modelAnswers,
    currentModelIndex: progress.modelIndex ?? prev.currentModelIndex,
    summaryResult: progress.summary || null,
    isSearching: progress.stage !== 'done',
    isFollowUp: progress.isFollowUp || prev.isFollowUp,
  };
}

/**
 * Compute next state when search is stopped.
 */
export function reduceStopSearch(prev) {
  return {
    ...prev,
    isSearching: false,
    stage: prev.modelAnswers.length > 0 ? 'done' : 'idle',
  };
}

/**
 * Full state machine hook — drop-in replacement for the logic in App.jsx.
 */
export default function useSearchStateMachine() {
  const [searchState, setSearchState] = useState(INITIAL_STATE);
  const searchGenerationRef = useRef(0);
  const selectedModelsRef = useRef(INITIAL_STATE.selectedModels);

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

    const generation = searchGenerationRef.current + 1;
    searchGenerationRef.current = generation;
    const selectedModels = selectedModelsRef.current;

    setSearchState((prev) => reduceStartSearch(prev, { queryKey, isFollowUp, followUpLabel }));

    await simulateSearch(queryKey, (progress) => {
      if (searchGenerationRef.current !== generation) return;
      setSearchState((prev) => reduceProgress(prev, progress));
    }, isFollowUp, selectedModels);
  }, []);

  const handleStopSearch = useCallback(() => {
    searchGenerationRef.current += 1;
    setSearchState((prev) => reduceStopSearch(prev));
  }, []);

  const handleNewSearch = useCallback(() => {
    searchGenerationRef.current += 1;
    selectedModelsRef.current = INITIAL_STATE.selectedModels;
    setSearchState(INITIAL_STATE);
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
    selectedModelsRef.current = models;
    setSearchState((prev) => ({ ...prev, selectedModels: models }));
  }, []);

  return {
    searchState,
    handleSearch,
    handleStopSearch,
    handleNewSearch,
    handlePresetSearch,
    handlePathModeChange,
    handleFollowUp,
    handleModelSelection,
  };
}
