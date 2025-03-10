import * as React from 'react';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VariableDrives from './VariableDrives';
import * as firebaseConfig from '../firebaseConfig';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import {
    collection,
    getDocs,
    getDoc,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    increment,
    arrayUnion,
    arrayRemove,
    setDoc
} from 'firebase/firestore';

jest.mock('../firebaseConfig', () => ({
    auth: { onAuthStateChanged: jest.fn() },
    db: {}
}));
jest.mock('firebase/auth', () => ({
    onAuthStateChanged: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    doc: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    increment: jest.fn(),
    arrayUnion: jest.fn(),
    arrayRemove: jest.fn(),
    setDoc: jest.fn(),
}));
jest.mock('browser-image-compression', () => jest.fn());


describe('VariableDrives Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        onAuthStateChanged.mockImplementation(callback => {
            // Simulate asynchronous onAuthStateChanged
            Promise.resolve().then(() => {
                callback(null);
            });
            return () => {};
        });
        getDocs.mockResolvedValue({ docs: [] });
        getDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
        updateDoc.mockResolvedValue(Promise.resolve());
    });

    it('renders "Variable Drives Page" heading', () => {
        render(<VariableDrives />);
        const headingElement = screen.getByRole('heading', { name: /Variable Drives Page/i });
        expect(headingElement).toBeInTheDocument();
    });

    it('displays loading state initially', () => {
        render(<VariableDrives />);
        const loadingElement = screen.getByText(/Loading Variable Drives/i);
        expect(loadingElement).toBeInTheDocument();
    });

    it('renders "New Entry" button when logged in (simple check - not fully testing auth)', async () => {
        onAuthStateChanged.mockImplementation(callback => {
            // Simulate user logged in asynchronously
            Promise.resolve().then(() => {
                callback({ email: 'test@example.com' });
            });
            return () => {};
        });
        render(<VariableDrives />);
        await waitFor(() => {
            const newEntryButton = screen.getByRole('button', { name: /New Entry/i });
            expect(newEntryButton).toBeInTheDocument();
        });
    });

    it('renders drive cards when drives are loaded', async () => {
        const mockDrives = [
            { id: '1', name: 'Drive 1', price: '$100', image: 'image1.jpg', content: 'Content 1' },
            { id: '2', name: 'Drive 2', price: '$200', image: 'image2.jpg', content: 'Content 2' },
        ];
        getDocs.mockResolvedValueOnce({
            docs: mockDrives.map(drive => ({
                id: drive.id,
                data: () => drive,
            })),
        });
        render(<VariableDrives />);
        await waitFor(() => {
            mockDrives.forEach(drive => {
                expect(screen.getByRole('heading', { name: drive.name })).toBeInTheDocument();
                expect(screen.getByText(`Price: ${drive.price}`)).toBeInTheDocument();
            });
        });
    });

    it('displays error message when fetching drives fails', async () => {
        getDocs.mockRejectedValueOnce(new Error('Failed to fetch drives'));
        render(<VariableDrives />);
        await waitFor(() => {
            const errorElement = screen.getByText(/Error loading Variable Drives/i);
            expect(errorElement).toBeInTheDocument();
        });
    });

    it('transitions to drive details view when "View Details" button is clicked', async () => {
        const mockDrives = [
            { id: '1', name: 'Drive 1', price: '$100', image: 'image1.jpg', content: 'Content 1' },
        ];
        getDocs.mockResolvedValueOnce({
            docs: mockDrives.map(drive => ({
                id: drive.id,
                data: () => drive,
            })),
        });
        getDoc.mockResolvedValueOnce({
            exists: () => true,
            data: () => mockDrives[0],
        });
        updateDoc.mockResolvedValueOnce(Promise.resolve());

        render(<VariableDrives />);
        await waitFor(() => {
            const viewDetailsButton = screen.getByRole('button', { name: /View Details/i });
            fireEvent.click(viewDetailsButton);
        });
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: mockDrives[0].name })).toBeInTheDocument();
            expect(screen.getByText(`Content: ${mockDrives[0].content}`)).toBeInTheDocument();
        });
    });
});