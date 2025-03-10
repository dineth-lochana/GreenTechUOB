import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginRegister from '../client/src/LoginRegister';
import VariableDrives, { DriveForm } from '../client/src/VariableDrives';
import { auth, db } from '../client/src/firebaseConfig';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
} from 'firebase/auth';
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
    setDoc,
} from 'firebase/firestore';
import imageCompression from 'browser-image-compression';

jest.mock('../client/src/firebaseConfig', () => {
    const mockAuth = {
        createUserWithEmailAndPassword: jest.fn(),
        signInWithEmailAndPassword: jest.fn(),
        onAuthStateChanged: jest.fn(),
        currentUser: { uid: 'testUserId', email: 'test@example.com' }, 
    };
    const mockFirestore = {
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
    };
    return {
        auth: mockAuth,
        db: mockFirestore,
    };
});

jest.mock('browser-image-compression', () => jest.fn());

describe('LoginRegister Component Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Renders Login form initially', () => {
        render(<LoginRegister />);
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('Switches to Register form when "Switch to Register" button is clicked', () => {
        render(<LoginRegister />);
        fireEvent.click(screen.getByRole('button', { name: /switch to register/i }));
        expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    test('Switches back to Login form when "Switch to Login" button is clicked', () => {
        render(<LoginRegister />);
        fireEvent.click(screen.getByRole('button', { name: /switch to register/i }));
        fireEvent.click(screen.getByRole('button', { name: /switch to login/i }));
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('Handles successful registration', async () => {
        createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'testUid' } });
        render(<LoginRegister />);
        fireEvent.click(screen.getByRole('button', { name: /switch to register/i }));
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password123');
            expect(screen.getByText(/user registered successfully/i)).toBeInTheDocument();
            expect(screen.queryByRole('alert')).toBeInTheDocument(); 
        });
    });

    test('Handles failed registration', async () => {
        createUserWithEmailAndPassword.mockRejectedValue(new Error('Registration failed'));
        render(<LoginRegister />);
        fireEvent.click(screen.getByRole('button', { name: /switch to register/i }));
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(createUserWithEmailAndPassword).toHaveBeenCalled();
            expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
        });
    });

    test('Handles successful login', async () => {
        signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'testUid' } });
        render(<LoginRegister />);
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password123');
            expect(screen.getByText(/login successful/i)).toBeInTheDocument();
            expect(screen.queryByRole('alert')).toBeInTheDocument(); 
        });
    });

    test('Handles failed login', async () => {
        signInWithEmailAndPassword.mockRejectedValue(new Error('Login failed'));
        render(<LoginRegister />);
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(signInWithEmailAndPassword).toHaveBeenCalled();
            expect(screen.getByText(/login failed/i)).toBeInTheDocument();
        });
    });

    test('Updates email state on email input change', () => {
        render(<LoginRegister />);
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
    });

    test('Updates password state on password input change', () => {
        render(<LoginRegister />);
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        expect(screen.getByLabelText(/password/i)).toHaveValue('password123');
    });
});


describe('VariableDrives Component Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        onAuthStateChanged.mockImplementation(callback => {
            callback({ email: 'test@example.com' });
            return () => {}; 
        });
    });

    const mockDrivesData = [
        { id: '1', name: 'Drive 1', content: 'Content 1', price: '$100', image: 'image1.jpg', view_count: 0 },
        { id: '2', name: 'Drive 2', content: 'Content 2', price: '$200', image: 'image2.jpg', view_count: 5 },
    ];

    test('Renders VariableDrives component and displays drives', async () => {
        getDocs.mockResolvedValue({
            docs: mockDrivesData.map(drive => ({
                id: drive.id,
                data: () => drive,
            })),
        });

        render(<VariableDrives />);
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /variable drives page/i })).toBeInTheDocument();
            expect(screen.getByText(/drive 1/i)).toBeInTheDocument();
            expect(screen.getByText(/drive 2/i)).toBeInTheDocument();
        });
    });

    test('Displays loading state initially and then hides it', async () => {
        getDocs.mockResolvedValue({
            docs: mockDrivesData.map(drive => ({
                id: drive.id,
                data: () => drive,
            })),
        });

        render(<VariableDrives />);
        expect(screen.getByText(/loading variable drives/i)).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByText(/loading variable drives/i)).not.toBeInTheDocument();
        });
    });

    test('Handles error when fetching drives', async () => {
        getDocs.mockRejectedValue(new Error('Failed to fetch drives'));

        render(<VariableDrives />);
        await waitFor(() => {
            expect(screen.getByText(/error loading variable drives/i)).toBeInTheDocument();
        });
    });

    test('View Details button fetches and displays drive details', async () => {
        getDocs.mockResolvedValue({
            docs: mockDrivesData.map(drive => ({
                id: drive.id,
                data: () => drive,
            })),
        });
        getDoc.mockResolvedValue({
            exists: () => true,
            data: () => mockDrivesData[0],
            id: mockDrivesData[0].id,
        });
        updateDoc.mockResolvedValue({});

        render(<VariableDrives />);
        await waitFor(() => screen.getByText(/drive 1/i));
        fireEvent.click(screen.getByRole('button', { name: /view details/i }));

        await waitFor(() => {
            expect(getDoc).toHaveBeenCalledWith(doc(collection(db, 'variableDrives'), '1'));
            expect(screen.getByRole('heading', { name: /drive 1/i })).toBeInTheDocument();
            expect(screen.getByText(/content: content 1/i)).toBeInTheDocument();
        });
    });


    test('Back to Variable Drive List button returns to grid view', async () => {
        getDocs.mockResolvedValue({
            docs: mockDrivesData.map(drive => ({
                id: drive.id,
                data: () => drive,
            })),
        });
        getDoc.mockResolvedValue({
            exists: () => true,
            data: () => mockDrivesData[0],
            id: mockDrivesData[0].id,
        });
        updateDoc.mockResolvedValue({});

        render(<VariableDrives />);
        await waitFor(() => screen.getByText(/drive 1/i));
        fireEvent.click(screen.getByRole('button', { name: /view details/i }));
        await waitFor(() => screen.getByRole('heading', { name: /drive 1/i })); 
        fireEvent.click(screen.getByRole('button', { name: /back to variable drive list/i }));

        await waitFor(() => {
            expect(screen.queryByRole('heading', { name: /drive 1/i })).not.toBeInTheDocument(); 
            expect(screen.getByText(/drive 1/i)).toBeInTheDocument(); 
        });
    });

    test('Delete Drive button deletes a drive and updates list', async () => {
        getDocs.mockResolvedValue({
            docs: mockDrivesData.map(drive => ({
                id: drive.id,
                data: () => drive,
            })),
        });
        deleteDoc.mockResolvedValue({});

        render(<VariableDrives />);
        await waitFor(() => screen.getByText(/drive 1/i));
        global.confirm = () => true;
        fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]); 

        await waitFor(() => {
            expect(deleteDoc).toHaveBeenCalledWith(doc(collection(db, 'variableDrives'), '1'));
            expect(screen.queryByText(/drive 1/i)).not.toBeInTheDocument(); 
            expect(screen.getByText(/variable drive deleted successfully/i)).toBeInTheDocument();
        });
    });

    test('Edit button switches to edit mode', async () => {
        getDocs.mockResolvedValue({
            docs: mockDrivesData.map(drive => ({
                id: drive.id,
                data: () => drive,
            })),
        });

        render(<VariableDrives />);
        await waitFor(() => screen.getByText(/drive 1/i));
        fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /edit variable drive/i })).toBeInTheDocument();
        });
    });

    test('Cancel Edit button returns to grid view', async () => {
        getDocs.mockResolvedValue({
            docs: mockDrivesData.map(drive => ({
                id: drive.id,
                data: () => drive,
            })),
        });

        render(<VariableDrives />);
        await waitFor(() => screen.getByText(/drive 1/i));
        fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);
        await waitFor(() => screen.getByRole('heading', { name: /edit variable drive/i }));
        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

        await waitFor(() => {
            expect(screen.queryByRole('heading', { name: /edit variable drive/i })).not.toBeInTheDocument();
            expect(screen.getByText(/drive 1/i)).toBeInTheDocument();
        });
    });

    test('New Entry button switches to new entry form', async () => {
        getDocs.mockResolvedValue({
            docs: mockDrivesData.map(drive => ({
                id: drive.id,
                data: () => drive,
            })),
        });

        render(<VariableDrives />);
        await waitFor(() => screen.getByText(/drive 1/i));
        fireEvent.click(screen.getByRole('button', { name: /new entry/i }));

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /new variable drive/i })).toBeInTheDocument();
        });
    });

    test('Cancel New Entry button returns to grid view', async () => {
        getDocs.mockResolvedValue({
            docs: mockDrivesData.map(drive => ({
                id: drive.id,
                data: () => drive,
            })),
        });

        render(<VariableDrives />);
        await waitFor(() => screen.getByText(/drive 1/i));
        fireEvent.click(screen.getByRole('button', { name: /new entry/i }));
        await waitFor(() => screen.getByRole('heading', { name: /new variable drive/i }));
        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

        await waitFor(() => {
            expect(screen.queryByRole('heading', { name: /new variable drive/i })).not.toBeInTheDocument();
            expect(screen.getByText(/drive 1/i)).toBeInTheDocument();
        });
    });

    test('Toggle Favorite button adds/removes drive from favorites', async () => {
        getDocs.mockResolvedValue({
            docs: mockDrivesData.map(drive => ({
                id: drive.id,
                data: () => drive,
            })),
        });
        getDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({ driveIds: [] }),
        });
        updateDoc.mockResolvedValue({});
        setDoc.mockResolvedValue({});

        render(<VariableDrives />);
        await waitFor(() => screen.getByText(/drive 1/i));
        fireEvent.click(screen.getAllByRole('button', { name: /🤍/i })[0]); 
        await waitFor(() => {
            expect(updateDoc).toHaveBeenCalledWith(doc(db, 'userFavorites', 'test@example.com'), {
                driveIds: arrayUnion('1'),
            });
            expect(screen.getAllByRole('button', { name: /❤️/i })[0]).toBeInTheDocument(); 
        });

        fireEvent.click(screen.getAllByRole('button', { name: /❤️/i })[0]); 
        await waitFor(() => {
            expect(updateDoc).toHaveBeenLastCalledWith(doc(db, 'userFavorites', 'test@example.com'), {
                driveIds: arrayRemove('1'),
            });
            expect(screen.getAllByRole('button', { name: /🤍/i })[0]).toBeInTheDocument(); 
        });
    });

    test('Sort by Name sorts drives alphabetically', async () => {
        getDocs.mockResolvedValue({
            docs: mockDrivesData.map(drive => ({
                id: drive.id,
                data: () => drive,
            })),
        });

        render(<VariableDrives />);
        await waitFor(() => screen.getByText(/drive 1/i));
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'name' } });

        const driveNames = screen.getAllByRole('heading', { level: 3 }).map(el => el.textContent);
        expect(driveNames).toEqual(['Drive 1', 'Drive 2']); 
    });


    test('Sort by Price sorts drives by price', async () => {
        getDocs.mockResolvedValue({
            docs: mockDrivesData.map(drive => ({
                id: drive.id,
                data: () => drive,
            })),
        });

        render(<VariableDrives />);
        await waitFor(() => screen.getByText(/drive 1/i));
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'price' } });

        const drivePrices = screen.getAllByText(/price: \$[0-9]+/i).map(el => el.textContent);
        expect(drivePrices).toEqual(['Price: $100', 'Price: $200']); 
    });

    test('Sort by View Count sorts drives by view count', async () => {
        getDocs.mockResolvedValue({
            docs: mockDrivesData.map(drive => ({
                id: drive.id,
                data: () => drive,
            })),
        });

        render(<VariableDrives />);
        await waitFor(() => screen.getByText(/drive 1/i));
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'view_count' } });

        const driveNames = screen.getAllByRole('heading', { level: 3 }).map(el => el.textContent);
        expect(driveNames).toEqual(['Drive 2', 'Drive 1']);  
    });


    test('Search filters drives by name and content', async () => {
        getDocs.mockResolvedValue({
            docs: mockDrivesData.map(drive => ({
                id: drive.id,
                data: () => drive,
            })),
        });

        render(<VariableDrives />);
        await waitFor(() => screen.getByText(/drive 1/i));
        fireEvent.change(screen.getByPlaceholderText(/search drives/i), { target: { value: 'Drive 2' } });

        await waitFor(() => {
            expect(screen.queryByText(/drive 1/i)).not.toBeInTheDocument();
            expect(screen.getByText(/drive 2/i)).toBeInTheDocument();
        });
    });

    test('Create Drive successfully adds a new drive', async () => {
        getDocs.mockResolvedValueOnce({ 
            docs: mockDrivesData.map(drive => ({
                id: drive.id,
                data: () => drive,
            })),
        }).mockResolvedValueOnce({ 
            docs: [...mockDrivesData, { id: '3', name: 'New Drive', content: 'New Content', price: '$300', image: 'image3.jpg', view_count: 0 }].map(drive => ({
                id: drive.id,
                data: () => drive,
            })),
        });

        addDoc.mockResolvedValue({ id: '3' });

        render(<VariableDrives />);
        await waitFor(() => screen.getByText(/drive 1/i));
        fireEvent.click(screen.getByRole('button', { name: /new entry/i }));
        await waitFor(() => screen.getByRole('heading', { name: /new variable drive/i }));

        fireEvent.change(screen.getByLabelText(/name:/i), { target: { value: 'New Drive' } });
        fireEvent.change(screen.getByLabelText(/content:/i), { target: { value: 'New Content' } });
        fireEvent.change(screen.getByLabelText(/price:/i), { target: { value: '$300' } });
        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => {
            expect(addDoc).toHaveBeenCalledWith(collection(db, 'variableDrives'), {
                name: 'New Drive', content: 'New Content', price: '$300', image: '', misc: '', specificationDocument: '', view_count: 0
            });
            expect(screen.getByText(/variable drive created successfully/i)).toBeInTheDocument();
            expect(screen.getByText(/new drive/i)).toBeInTheDocument();
        });
    });

    test('Update Drive successfully updates an existing drive', async () => {
        getDocs.mockResolvedValue({
            docs: mockDrivesData.map(drive => ({
                id: drive.id,
                data: () => drive,
            })),
        });
        updateDoc.mockResolvedValue({});

        render(<VariableDrives />);
        await waitFor(() => screen.getByText(/drive 1/i));
        fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);
        await waitFor(() => screen.getByRole('heading', { name: /edit variable drive/i }));

        fireEvent.change(screen.getByLabelText(/name:/i), { target: { value: 'Updated Drive 1' } });
        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => {
            expect(updateDoc).toHaveBeenCalledWith(doc(db, 'variableDrives', '1'), {
                name: 'Updated Drive 1', content: 'Content 1', price: '$100', image: 'image1.jpg', misc: '', specificationDocument: '', view_count: 0
            });
            expect(screen.getByText(/variable drive updated successfully/i)).toBeInTheDocument();
            expect(screen.getByText(/updated drive 1/i)).toBeInTheDocument();
        });
    });
});

describe('DriveForm Component Tests', () => {
    const mockOnSave = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        imageCompression.mockResolvedValue(new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' }));
    });

    test('DriveForm renders correctly in new form mode', () => {
        render(<DriveForm onSave={mockOnSave} onCancel={mockOnCancel} formType="new" />);
        expect(screen.getByRole('heading', { name: /new variable drive/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    test('DriveForm renders correctly in edit form mode with initial data', () => {
        const initialData = { name: 'Test Drive', content: 'Test Content', price: '$150' };
        render(<DriveForm initialData={initialData} onSave={mockOnSave} onCancel={mockOnCancel} formType="edit" />);
        expect(screen.getByRole('heading', { name: /edit variable drive/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/name:/i)).toHaveValue('Test Drive');
        expect(screen.getByLabelText(/content:/i)).toHaveValue('Test Content');
        expect(screen.getByLabelText(/price:/i)).toHaveValue('$150');
    });

    test('DriveForm calls onCancel when Cancel button is clicked', () => {
        render(<DriveForm onSave={mockOnSave} onCancel={mockOnCancel} formType="new" />);
        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    test('DriveForm calls onSave with form data when Save button is clicked in new mode', async () => {
        render(<DriveForm onSave={mockOnSave} onCancel={mockOnCancel} formType="new" />);
        fireEvent.change(screen.getByLabelText(/name:/i), { target: { value: 'New Drive' } });
        fireEvent.change(screen.getByLabelText(/content:/i), { target: { value: 'New Content' } });
        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledTimes(1);
            expect(mockOnSave).toHaveBeenCalledWith({
                name: 'New Drive',
                content: 'New Content',
                price: '',
                image: '',
                misc: '',
                specificationDocument: '',
                view_count: 0,
            });
        });
    });

    test('DriveForm calls onSave with form data and id when Save button is clicked in edit mode', async () => {
        const initialData = { id: '123', name: 'Test Drive', content: 'Test Content' };
        render(<DriveForm initialData={initialData} onSave={mockOnSave} onCancel={mockOnCancel} formType="edit" />);
        fireEvent.change(screen.getByLabelText(/name:/i), { target: { value: 'Updated Drive' } });
        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledTimes(1);
            expect(mockOnSave).toHaveBeenCalledWith('123', {
                name: 'Updated Drive',
                content: 'Test Content',
                price: '',
                image: '',
                misc: '',
                specificationDocument: '',
                view_count: 0,
            });
        });
    });

    test('DriveForm updates image state and preview on image upload', async () => {
        render(<DriveForm onSave={mockOnSave} onCancel={mockOnCancel} formType="new" />);
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        const fileReader = new FileReader();
        const base64String = 'data:image/png;base64,mockBase64String';
        fileReader.readAsDataURL(file);
        fileReader.onloadend = async () => {
            jest.spyOn(global, 'FileReader').mockImplementationOnce(() => {
                const fileReaderMock = {
                    onloadend: null,
                    readAsDataURL: jest.fn(),
                    result: base64String,
                };
                fileReaderMock.readAsDataURL.mockImplementationOnce(() => {
                    fileReaderMock.result = base64String;
                    if (fileReaderMock.onloadend) {
                        fileReaderMock.onloadend();
                    }
                });
                return fileReaderMock;
            });


            const inputImage = screen.getByLabelText(/image:/i);
            fireEvent.change(inputImage, { target: { files: [file] } });

            await waitFor(() => {
                expect(screen.getByRole('img', { name: /preview/i })).toBeInTheDocument();
                expect(screen.getByRole('img', { name: /preview/i })).toHaveAttribute('src', base64String);
            });
        };
    });

    test('Prevents saving while image is loading', async () => {
        render(<DriveForm onSave={mockOnSave} onCancel={mockOnCancel} formType="new" />);
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

        imageCompression.mockImplementationOnce(() => new Promise(() => {}));

        const inputImage = screen.getByLabelText(/image:/i);
        fireEvent.change(inputImage, { target: { files: [file] } });
        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => {
            expect(mockOnSave).not.toHaveBeenCalled();
            expect(screen.queryByRole('alert')).toBeInTheDocument();
        });
    });

    test('Handles image compression error and still sets image', async () => {
        imageCompression.mockRejectedValue(new Error('Compression failed'));
        render(<DriveForm onSave={mockOnSave} onCancel={mockOnCancel} formType="new" />);
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        const fileReader = new FileReader();
        const base64String = 'data:image/png;base64,mockBase64String';
        fileReader.readAsDataURL(file);
        fileReader.onloadend = async () => {
            jest.spyOn(global, 'FileReader').mockImplementationOnce(() => {
                const fileReaderMock = {
                    onloadend: null,
                    readAsDataURL: jest.fn(),
                    result: base64String,
                };
                fileReaderMock.readAsDataURL.mockImplementationOnce(() => {
                    fileReaderMock.result = base64String;
                    if (fileReaderMock.onloadend) {
                        fileReaderMock.onloadend();
                    }
                });
                return fileReaderMock;
            });

            const inputImage = screen.getByLabelText(/image:/i);
            fireEvent.change(inputImage, { target: { files: [file] } });

            await waitFor(() => {
                expect(screen.getByRole('img', { name: /preview/i })).toBeInTheDocument();
                expect(screen.getByRole('img', { name: /preview/i })).toHaveAttribute('src', base64String); 
            });
        };
    });
});
