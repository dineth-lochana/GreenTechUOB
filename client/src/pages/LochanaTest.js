/* eslint-disable */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginRegister from '../LoginRegister';

jest.mock('firebase/auth', () => ({
    createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'testUid' } })),
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'testUid' } })),
}));
global.alert = jest.fn();

describe('LoginRegister Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.alert.mockClear();
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
