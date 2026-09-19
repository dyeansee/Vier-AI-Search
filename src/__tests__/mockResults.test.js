import { describe, expect, it, vi } from 'vitest';
import mockData, { simulateSearch } from '../data/mockResults';

describe('simulateSearch', () => {
  it('returns a deterministic generic result for an unknown query', async () => {
    const progress = vi.fn();

    const result = await simulateSearch('一个没有预设的问题', progress, false, ['deepseek']);

    expect(result.query).toBe('一个没有预设的问题');
    expect(result.models).toHaveLength(1);
    expect(result.models[0].id).toBe('deepseek');
    expect(result.summary.consensus).toContain('一个没有预设的问题');
    expect(progress).toHaveBeenCalledWith(expect.objectContaining({ stage: 'done' }));
  });

  it('filters preset answers to the selected model ids', async () => {
    const result = await simulateSearch('new_energy', vi.fn(), false, ['tongyi']);

    expect(result.models).toHaveLength(1);
    expect(result.models[0].id).toBe('tongyi');
  });

  it('supports an unknown follow-up without returning null', async () => {
    const result = await simulateSearch('任意追问', vi.fn(), true, ['doubao']);

    expect(result.models).toHaveLength(1);
    expect(result.models[0].id).toBe('doubao');
    expect(result.summary.recommendation).toContain('任意追问');
  });
});

it('keeps the original preset data available', () => {
  expect(mockData.new_energy.models).toHaveLength(3);
});
