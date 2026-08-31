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

import { getUserPermissions, savePermissionsMap, getPermissionsMap } from '../userPermissionsService';

describe('userPermissionsService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should identify primary admin email correctly', () => {
    const adminPerms = getUserPermissions('uid123', 'ammaramrcan@gmail.com');
    expect(adminPerms.role).toBe('admin');
    expect(adminPerms.canDirectPublish).toBe(true);
    expect(adminPerms.canAccessAdmin).toBe(true);
  });

  it('should return default student permissions for normal users', () => {
    const studentPerms = getUserPermissions('uid456', 'student@example.com');
    expect(studentPerms.role).toBe('student');
    expect(studentPerms.canDirectPublish).toBe(false);
    expect(studentPerms.canAccessAdmin).toBe(false);
  });

  it('should update and retrieve saved custom user permissions map', () => {
    const customPerms = {
      uid: 'uid789',
      email: 'teacher@example.com',
      role: 'trusted_publisher' as const,
      canDirectPublish: true,
      canAccessAdmin: false
    };

    savePermissionsMap({ 'teacher@example.com': customPerms });
    const map = getPermissionsMap();
    expect(map['teacher@example.com'].role).toBe('trusted_publisher');
    expect(map['teacher@example.com'].canDirectPublish).toBe(true);

    const retrieved = getUserPermissions('uid789', 'teacher@example.com');
    expect(retrieved.role).toBe('trusted_publisher');
    expect(retrieved.canDirectPublish).toBe(true);
  });

  it('should retrieve secondary admin permissions when granted', () => {
    const secondaryAdminPerms = {
      uid: 'uid999',
      email: 'coadmin@example.com',
      role: 'admin' as const,
      canDirectPublish: true,
      canAccessAdmin: true
    };

    savePermissionsMap({ 'coadmin@example.com': secondaryAdminPerms });
    const retrieved = getUserPermissions('uid999', 'coadmin@example.com');
    expect(retrieved.role).toBe('admin');
    expect(retrieved.canAccessAdmin).toBe(true);
    expect(retrieved.canDirectPublish).toBe(true);
  });
});
