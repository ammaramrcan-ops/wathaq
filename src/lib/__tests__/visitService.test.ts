import { describe, it, expect, beforeEach } from 'vitest';

// Mock localStorage for Node test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
});

import { getLocalVisitsAnalytics } from '../visitService';

describe('visitService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return initial default analytics when localStorage is empty', () => {
    const analytics = getLocalVisitsAnalytics();
    expect(analytics).toBeDefined();
    expect(typeof analytics.totalVisits).toBe('number');
    expect(typeof analytics.dailyVisits).toBe('number');
    expect(typeof analytics.recurringVisits).toBe('number');
  });

  it('should read stored analytics correctly from localStorage', () => {
    const dummyAnalytics = {
      totalVisits: 150,
      dailyVisits: 25,
      weeklyVisits: 100,
      recurringVisits: 40,
      uniqueVisitorsCount: 80,
      repeatVisitorRate: 50.0,
      lastVisitTimestamp: new Date().toISOString()
    };

    localStorage.setItem('wathaq_visit_analytics', JSON.stringify(dummyAnalytics));
    const loaded = getLocalVisitsAnalytics();
    expect(loaded.totalVisits).toBe(150);
    expect(loaded.dailyVisits).toBe(25);
    expect(loaded.repeatVisitorRate).toBe(50.0);
  });
});
