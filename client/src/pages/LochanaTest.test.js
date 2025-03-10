/* eslint-disable */

/* eslint-disable */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import LoginRegister from './LoginRegister';

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: 'testUid' } })),
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: 'testUid' } })),
}));

vi.stubGlobal('alert', vi.fn());

describe('LoginRegister Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(alert).mockClear();
  });

  test('renders login form', () => {
    render(<LoginRegister />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });

  test('toggles to register form', () => {
    render(<LoginRegister />);
    fireEvent.click(screen.getByRole('button', { name: /switch to register/i }));
    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
  });
});
