/**
 * 搜索状态机核心路径测试
 * 覆盖: 搜索发起 / 追问归档 / 停止搜索 / 新搜索重置 / 关键状态转移
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  INITIAL_STATE,
  reduceStartSearch,
  reduceProgress,
  reduceStopSearch,
} from '../hooks/useSearchStateMachine';

// Mock simulateSearch to make state transitions deterministic
vi.mock('../data/mockResults', () => ({
  simulateSearch: vi.fn(),
}));

import useSearchStateMachine from '../hooks/useSearchStateMachine';
import { simulateSearch } from '../data/mockResults';

beforeEach(() => {
  vi.clearAllMocks();
  // Default: resolve immediately without calling progress
  simulateSearch.mockResolvedValue(null);
  // Mock window.scrollTo
  window.scrollTo = vi.fn();
});

// =====================================================================
// Part 1: Pure reducer unit tests (fastest, no React rendering)
// =====================================================================
describe('reduceStartSearch — 搜索发起状态转移', () => {
  it('from idle → searching, sets queryKey and isFollowUp=false', () => {
    const next = reduceStartSearch(INITIAL_STATE, {
      queryKey: 'new_energy',
      isFollowUp: false,
      followUpLabel: null,
    });
    expect(next.stage).toBe('searching');
    expect(next.queryKey).toBe('new_energy');
    expect(next.isSearching).toBe(true);
    expect(next.isFollowUp).toBe(false);
    expect(next.modelAnswers).toEqual([]);
    expect(next.history).toEqual([]);
  });

  it('from done with answers → archives to history before new search', () => {
    const doneState = {
      ...INITIAL_STATE,
      stage: 'done',
      query: '原始问题',
      queryKey: 'orig_key',
      modelAnswers: [{ id: 'deepseek', answer: '...' }],
      summaryResult: { trustScore: 90 },
      isFollowUp: false,
    };

    const next = reduceStartSearch(doneState, {
      queryKey: 'follow_key',
      isFollowUp: true,
      followUpLabel: '追问内容',
    });

    expect(next.history).toHaveLength(1);
    expect(next.history[0].query).toBe('原始问题');
    expect(next.history[0].queryKey).toBe('orig_key');
    expect(next.history[0].modelAnswers).toHaveLength(1);
    expect(next.stage).toBe('searching');
    expect(next.query).toBe('追问内容');
    expect(next.isFollowUp).toBe(true);
  });

  it('from done without answers → does NOT archive', () => {
    const doneEmpty = {
      ...INITIAL_STATE,
      stage: 'done',
      modelAnswers: [],
    };
    const next = reduceStartSearch(doneEmpty, {
      queryKey: 'k',
      isFollowUp: false,
      followUpLabel: null,
    });
    expect(next.history).toHaveLength(0);
  });

  it('from searching (interrupted) → does NOT archive partial results', () => {
    const partialState = {
      ...INITIAL_STATE,
      stage: 'searching',
      modelAnswers: [{ id: 'deepseek' }],
    };
    const next = reduceStartSearch(partialState, {
      queryKey: 'k2',
      isFollowUp: false,
      followUpLabel: null,
    });
    expect(next.history).toHaveLength(0);
    expect(next.stage).toBe('searching');
  });

  it('preserves existing history across multiple follow-ups', () => {
    const withHistory = {
      ...INITIAL_STATE,
      stage: 'done',
      query: 'Q2',
      queryKey: 'k2',
      modelAnswers: [{ id: 'tongyi' }],
      summaryResult: null,
      history: [{ id: 1, query: 'Q1', queryKey: 'k1', modelAnswers: [] }],
    };
    const next = reduceStartSearch(withHistory, {
      queryKey: 'k3',
      isFollowUp: true,
      followUpLabel: null,
    });
    expect(next.history).toHaveLength(2);
    expect(next.history[0].query).toBe('Q1');
    expect(next.history[1].query).toBe('Q2');
  });
});

describe('reduceProgress — 搜索进度状态转移', () => {
  it('updates modelAnswers incrementally', () => {
    const searching = { ...INITIAL_STATE, stage: 'searching', isSearching: true };
    const next = reduceProgress(searching, {
      stage: 'searching',
      answers: [{ id: 'deepseek' }],
      modelIndex: 0,
    });
    expect(next.modelAnswers).toHaveLength(1);
    expect(next.currentModelIndex).toBe(0);
    expect(next.isSearching).toBe(true);
  });

  it('transitions to summarizing stage', () => {
    const withAnswers = {
      ...INITIAL_STATE,
      stage: 'searching',
      isSearching: true,
      modelAnswers: [{ id: 'deepseek' }, { id: 'tongyi' }, { id: 'doubao' }],
    };
    const next = reduceProgress(withAnswers, { stage: 'summarizing' });
    expect(next.stage).toBe('summarizing');
    expect(next.isSearching).toBe(true);
    // modelAnswers preserved when progress.answers is undefined
    expect(next.modelAnswers).toHaveLength(3);
  });

  it('transitions to done and marks isSearching=false', () => {
    const summarizing = { ...INITIAL_STATE, stage: 'summarizing', isSearching: true };
    const next = reduceProgress(summarizing, {
      stage: 'done',
      answers: [{ id: 'deepseek' }],
      summary: { trustScore: 92 },
      isFollowUp: false,
    });
    expect(next.stage).toBe('done');
    expect(next.isSearching).toBe(false);
    expect(next.summaryResult).toEqual({ trustScore: 92 });
  });
});

describe('reduceStopSearch — 停止搜索', () => {
  it('with partial answers → stage becomes done', () => {
    const partial = {
      ...INITIAL_STATE,
      stage: 'searching',
      isSearching: true,
      modelAnswers: [{ id: 'deepseek' }],
    };
    const next = reduceStopSearch(partial);
    expect(next.stage).toBe('done');
    expect(next.isSearching).toBe(false);
  });

  it('without answers → stage reverts to idle', () => {
    const empty = { ...INITIAL_STATE, stage: 'searching', isSearching: true };
    const next = reduceStopSearch(empty);
    expect(next.stage).toBe('idle');
    expect(next.isSearching).toBe(false);
  });
});

// =====================================================================
// Part 2: Hook integration tests (with React renderHook)
// =====================================================================
describe('useSearchStateMachine hook — 集成行为验证', () => {
  it('initial state is idle', () => {
    const { result } = renderHook(() => useSearchStateMachine());
    expect(result.current.searchState.stage).toBe('idle');
    expect(result.current.searchState.isSearching).toBe(false);
  });

  it('handleSearch initiates search and calls simulateSearch', async () => {
    simulateSearch.mockImplementation(async (key, onProgress, isFollowUp) => {
      onProgress({ stage: 'searching', answers: [{ id: 'deepseek' }], modelIndex: 0 });
      onProgress({ stage: 'done', answers: [{ id: 'deepseek' }], summary: { trustScore: 90 } });
    });

    const { result } = renderHook(() => useSearchStateMachine());

    await act(async () => {
      await result.current.handleSearch('new_energy', 'new');
    });

    expect(simulateSearch).toHaveBeenCalledWith('new_energy', expect.any(Function), false);
    expect(result.current.searchState.stage).toBe('done');
    expect(result.current.searchState.isSearching).toBe(false);
    expect(result.current.searchState.summaryResult).toEqual({ trustScore: 90 });
  });

  it('handleFollowUp sets isFollowUp=true and archives previous round', async () => {
    simulateSearch.mockImplementation(async (key, onProgress) => {
      onProgress({ stage: 'done', answers: [{ id: 'deepseek' }], summary: { trustScore: 85 } });
    });

    const { result } = renderHook(() => useSearchStateMachine());

    // First search to reach 'done'
    await act(async () => {
      await result.current.handleSearch('new_energy', 'new');
    });
    expect(result.current.searchState.stage).toBe('done');

    // Follow-up triggers archival
    await act(async () => {
      await result.current.handleFollowUp('new_energy__brands', '哪些品牌值得关注');
    });

    expect(result.current.searchState.history).toHaveLength(1);
    expect(result.current.searchState.isFollowUp).toBe(true);
    expect(simulateSearch).toHaveBeenLastCalledWith('new_energy__brands', expect.any(Function), true);
  });

  it('handleStopSearch during active search → done if answers exist', async () => {
    simulateSearch.mockImplementation(async (key, onProgress) => {
      onProgress({ stage: 'searching', answers: [{ id: 'deepseek' }], modelIndex: 0 });
      // Simulate hanging — never calls 'done'
      await new Promise(() => {});
    });

    const { result } = renderHook(() => useSearchStateMachine());

    // Start search (won't complete because of hanging promise)
    let searchPromise;
    act(() => {
      searchPromise = result.current.handleSearch('new_energy', 'new');
    });

    // Give microtask a tick for the first onProgress to fire
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.searchState.modelAnswers).toHaveLength(1);

    // Stop search
    act(() => {
      result.current.handleStopSearch();
    });

    expect(result.current.searchState.stage).toBe('done');
    expect(result.current.searchState.isSearching).toBe(false);
  });

  it('handleNewSearch resets everything to initial', async () => {
    simulateSearch.mockImplementation(async (key, onProgress) => {
      onProgress({ stage: 'done', answers: [{ id: 'deepseek' }], summary: {} });
    });

    const { result } = renderHook(() => useSearchStateMachine());

    await act(async () => {
      await result.current.handleSearch('react_vue', 'new');
    });
    expect(result.current.searchState.stage).toBe('done');

    act(() => {
      result.current.handleNewSearch();
    });

    expect(result.current.searchState).toEqual(INITIAL_STATE);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('handlePresetSearch sets query label before triggering search', async () => {
    simulateSearch.mockImplementation(async (key, onProgress) => {
      onProgress({ stage: 'done', answers: [{ id: 'deepseek' }], summary: {} });
    });

    const { result } = renderHook(() => useSearchStateMachine());

    await act(async () => {
      await result.current.handlePresetSearch('remote_work', '远程办公效率');
    });

    expect(simulateSearch).toHaveBeenCalledWith('remote_work', expect.any(Function), false);
  });

  it('handleModelSelection updates selected models', () => {
    const { result } = renderHook(() => useSearchStateMachine());

    act(() => {
      result.current.handleModelSelection(['deepseek', 'doubao']);
    });

    expect(result.current.searchState.selectedModels).toEqual(['deepseek', 'doubao']);
  });

  it('handlePathModeChange updates pathMode', () => {
    const { result } = renderHook(() => useSearchStateMachine());

    act(() => {
      result.current.handlePathModeChange('explore');
    });

    expect(result.current.searchState.pathMode).toBe('explore');
  });

  it('multiple follow-ups accumulate history correctly', async () => {
    let callCount = 0;
    simulateSearch.mockImplementation(async (key, onProgress) => {
      callCount++;
      onProgress({
        stage: 'done',
        answers: [{ id: 'deepseek', callCount }],
        summary: { round: callCount },
      });
    });

    const { result } = renderHook(() => useSearchStateMachine());

    // Round 1
    await act(async () => {
      await result.current.handleSearch('new_energy', 'new');
    });
    // Round 2 (follow-up)
    await act(async () => {
      await result.current.handleFollowUp('new_energy__brands', '品牌');
    });
    // Round 3 (another follow-up)
    await act(async () => {
      await result.current.handleFollowUp('remote_work__tools', '工具');
    });

    expect(result.current.searchState.history).toHaveLength(2);
    expect(result.current.searchState.stage).toBe('done');
  });

  it('modeOrLabel as custom label sets followUpLabel and isFollowUp', async () => {
    simulateSearch.mockImplementation(async (key, onProgress) => {
      onProgress({ stage: 'done', answers: [{ id: 'tongyi' }], summary: {} });
    });

    const { result } = renderHook(() => useSearchStateMachine());

    await act(async () => {
      await result.current.handleSearch('react_vue__learn', '怎么入门');
    });

    // custom label (not 'new' or 'memory') → isFollowUp=true with custom label
    expect(result.current.searchState.isFollowUp).toBe(true);
    expect(simulateSearch).toHaveBeenCalledWith('react_vue__learn', expect.any(Function), true);
  });
});
