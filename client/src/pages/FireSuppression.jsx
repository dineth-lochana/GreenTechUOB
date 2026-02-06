/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import './FireSuppression.css';
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
import imageCompression from 'browser-image-compression';

function FireSuppression() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState(null);
    const [FireSuppression, setFireSuppression] = useState([]);
    const [selectedDriveId, setSelectedDriveId] = useState(null);
    const [selectedDriveDetails, setSelectedDriveDetails] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingDriveId, setEditingDriveId] = useState(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [favoriteDriveIds, setFavoriteDriveIds] = useState([]);
    const [sortCriteria, setSortCriteria] = useState('name');
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setIsLoggedIn(true);
                setUserEmail(user.email);
                const favoritesDocRef = doc(db, 'userFavorites', user.email);
                try {
                    const docSnap = await getDoc(favoritesDocRef);
                    if (docSnap.exists()) {
                        const favoritesData = docSnap.data();
                        setFavoriteDriveIds(favoritesData.driveIds || []);
                    } else {
                        setFavoriteDriveIds([]);
                        await setDoc(favoritesDocRef, { driveIds: [] });
                    }
                } catch (error) {
                    console.error("Error fetching favorites:", error);
                    setErrorMessage('Error loading favorites.');
                }
            } else {
                setIsLoggedIn(false);
                setUserEmail(null);
                setFavoriteDriveIds([]);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        const fetchFireSuppression = async () => {
            setIsLoading(true);
            try {
                const drivesCollection = collection(db, 'FireSuppression');
                const querySnapshot = await getDocs(drivesCollection);
                const drivesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setFireSuppression(drivesList);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching Fire Suppression Systems:', error);
                setErrorMessage('Error loading Fire Suppression Systems.');
                setIsLoading(false);
            }
        };
        fetchFireSuppression();
    }, []);

    const handleViewDetails = async (id) => {
        setSelectedDriveId(id);
        setSelectedDriveDetails(null);
        setIsEditing(false);
        setIsCreatingNew(false);
        setErrorMessage('');
        setSuccessMessage('');
        setIsLoading(true);
        try {
            const driveDocRef = doc(db, 'FireSuppression', id);
            await updateDoc(driveDocRef, { view_count: increment(1) });

            const docSnap = await getDoc(driveDocRef);
            if (docSnap.exists()) {
                setSelectedDriveDetails({ id: docSnap.id, ...docSnap.data() });
            } else {
                console.error('Fire Suppression System details not found');
                setErrorMessage('Fire Suppression System details not found.');
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching Fire Suppression System details:', error);
            setErrorMessage('Error loading Fire Suppression System details.');
            setIsLoading(false);
        }
    };

    const handleBackToGrid = () => {
        setSelectedDriveId(null);
        setIsEditing(false);
        setIsCreatingNew(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleDeleteDrive = async (id) => {
        if (!window.confirm('Are you sure you want to delete this Fire Suppression?')) {
            return;
        }
        setIsLoading(true);
        try {
            const driveDocRef = doc(db, 'FireSuppression', id);
            await deleteDoc(driveDocRef);
            setFireSuppression(FireSuppression.filter(drive => drive.id !== id));
            setSuccessMessage('Fire Suppression System deleted successfully.');
            setErrorMessage('');
            setIsLoading(false);
        } catch (error) {
            console.error('Error deletingFireSuppression:', error);
            setErrorMessage('Error deleting FireSuppression.');
            setSuccessMessage('');
            setIsLoading(false);
        }
    };

    const handleEditDrive = (id) => {
        setEditingDriveId(id);
        setIsEditing(true);
        setSelectedDriveId(null);
        setIsCreatingNew(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingDriveId(null);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleNewEntryClick = () => {
        setIsCreatingNew(true);
        setSelectedDriveId(null);
        setIsEditing(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleCancelNewEntry = () => {
        setIsCreatingNew(false);
        setErrorMessage('');
        setSuccessMessage('');
    };


    const handleToggleFavorite = async (driveId) => {
        if (!isLoggedIn) {
            alert("Please log in to favorite drives.");
            return;
        }

        const favoritesDocRef = doc(db, 'userFavorites', userEmail);
        const isFavorite = favoriteDriveIds.includes(driveId);

        try {
            if (isFavorite) {
                await updateDoc(favoritesDocRef, {
                    driveIds: arrayRemove(driveId)
                });
                setFavoriteDriveIds(favoriteDriveIds.filter(id => id !== driveId));
            } else {
                await updateDoc(favoritesDocRef, {
                    driveIds: arrayUnion(driveId)
                });
                setFavoriteDriveIds([...favoriteDriveIds, driveId]);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            setErrorMessage('Error updating favorites.');
        }
    };

    const handleSortChange = (event) => {
        setSortCriteria(event.target.value);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };


    const renderDriveGrid = () => {
        let filteredDrives = [...FireSuppression];

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filteredDrives = filteredDrives.filter(drive => {
                return (
                    drive.name.toLowerCase().includes(lowerQuery) ||
                    drive.content.toLowerCase().includes(lowerQuery)
                );
            });
        }

        let sortedAndFilteredDrives = [...filteredDrives];

        if (sortCriteria === 'name') {
            sortedAndFilteredDrives.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortCriteria === 'price') {
            sortedAndFilteredDrives.sort((a, b) => {
                const priceA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
                const priceB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
                return priceA - priceB;
            });
        } else if (sortCriteria === 'view_count') {
            sortedAndFilteredDrives.sort((a, b) => b.view_count - a.view_count);
        }


        const finalDrives = [...sortedAndFilteredDrives].sort((a, b) => {
            const aIsFavorite = favoriteDriveIds.includes(a.id);
            const bIsFavorite = favoriteDriveIds.includes(b.id);
            if (aIsFavorite && !bIsFavorite) return -1;
            if (!aIsFavorite && bIsFavorite) return 1;
            return 0;
        });


        return (
            <div className="FireSuppression-grid">
                {finalDrives.map(drive => (
                    <div key={drive.id} className="drive-card">
                        <img src={drive.image} alt={drive.name} className="drive-image" />
                        <h3>{drive.name}</h3>
                        <p>Price: {drive.price}</p>
                        <div className="drive-actions">
                            <button onClick={() => handleViewDetails(drive.id)}>View Details</button>
                            {isLoggedIn && (
                                <>
                                    <button onClick={() => handleEditDrive(drive.id)}>Edit</button>
                                    <button onClick={() => handleDeleteDrive(drive.id)}>Delete</button>
                                    <button
                                        className={`favorite-button ${favoriteDriveIds.includes(drive.id) ? 'favorited' : ''}`}
                                        onClick={() => handleToggleFavorite(drive.id)}
                                        aria-label={favoriteDriveIds.includes(drive.id) ? 'Remove from favorites' : 'Add to favorites'}
                                    >
                                        {favoriteDriveIds.includes(drive.id) ? '❤️' : '🤍'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderDriveDetails = () => {
        if (!selectedDriveDetails) return <div>Loading details...</div>;

        return (
            <div className="drive-details-container">
                <div className="drive-image-container">
                    <img src={selectedDriveDetails.image} alt={selectedDriveDetails.name} className="drive-details-image" />
                </div>
                <div className="drive-details">
                    <h2>{selectedDriveDetails.name}</h2>
                    <p><strong>Content:</strong> {selectedDriveDetails.content}</p>
                    <p><strong>Price:</strong> {selectedDriveDetails.price}</p>
                    <p><strong>Misc:</strong> {selectedDriveDetails.misc}</p>
                    {selectedDriveDetails.specificationDocument && (
                        <>
                            <br />
                            <br />
                        </>
                    )}
                    {selectedDriveDetails.specificationDocument && (
                        <a href={selectedDriveDetails.specificationDocument} target="_blank" rel="noopener noreferrer">
                            <button>Download Specification Document</button>
                        </a>
                    )}
                    <br/>
                    <br/>
                    <button onClick={() => handleShare(selectedDriveDetails)}>Share</button>
                    <br/>
                    <br/>
                    <button onClick={handleBackToGrid}>Back to Fire Suppression System List</button>
                </div>
            </div>
        );
    };

    const renderEditForm = () => {
        const driveToEdit = FireSuppression.find(drive => drive.id === editingDriveId);
        if (!driveToEdit) return <div>Loading edit form...</div>;

        return <DriveForm
            initialData={driveToEdit}
            onSave={handleUpdateDrive}
            onCancel={handleCancelEdit}
            formType="edit"
        />;
    };

    const renderNewEntryForm = () => {
        return <DriveForm
            onSave={handleCreateDrive}
            onCancel={handleCancelNewEntry}
            formType="new"
        />;
    };

    const handleCreateDrive = async (driveData) => {
        setIsLoading(true);
        try {
            const drivesCollection = collection(db, 'FireSuppression');
            await addDoc(drivesCollection, driveData);
            const querySnapshot = await getDocs(drivesCollection);
            const drivesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFireSuppression(drivesList);

            setIsCreatingNew(false);
            setSuccessMessage('FireSuppression System created successfully.');
            setErrorMessage('');
            setIsLoading(false);
        } catch (error) {
            console.error('Error creating FireSuppression:', error);
            setErrorMessage('Error creating FireSuppression.');
            setSuccessMessage('');
            setIsLoading(false);
        }
    };

    const handleShare = async (driveDetails) => {
        try {
            const subject = `Check out this Fire Suppression System: ${driveDetails.name}`;
            const body = `Details of the Fire Suppression System:\n\n` +
                         `Name: ${driveDetails.name}\n` +
                         `Price: ${driveDetails.price}\n` +
                         `Content: ${driveDetails.content}\n` +
                         `Additional Info: ${driveDetails.misc}\n\n` +
                         `Check it out!`;
    
            const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
            window.open(gmailLink, '_blank');
    
        } catch (error) {
            console.error('Error sharing:', error);
            alert('Sharing failed. Please try again.');
        }
    };
    
    const handleUpdateDrive = async (id, driveData) => {
        setIsLoading(true);
        try {
            const driveDocRef = doc(db, 'FireSuppression', id);
            await updateDoc(driveDocRef, driveData);
            const querySnapshot = await getDocs(collection(db, 'FireSuppression'));
            const drivesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFireSuppression(drivesList);
            setIsEditing(false);
            setEditingDriveId(null);
            setSuccessMessage('FireSuppression updated successfully.');
            setErrorMessage('');
            setIsLoading(false);
        } catch (error) {
            console.error('Error updating FireSuppression:', error);
            setErrorMessage('Error updating FireSuppression.');
            setSuccessMessage('');
            setIsLoading(false);
        }
    };


    return (
        <div className="FireSuppression-page">
            <h1>Fire Suppression</h1>
            {isLoggedIn && !isCreatingNew && !isEditing && !selectedDriveId && (
                <button onClick={handleNewEntryClick} className="new-entry-button">New Entry</button>
            )}

            <div className="search-filter-options">
                <input
                    type="text"
                    placeholder="Search drives..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="sorting-options">
                <label htmlFor="sort">Sort by:</label>
                <select id="sort" value={sortCriteria} onChange={handleSortChange}>
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="view_count">View Count</option>
                </select>
            </div>


            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            {isLoading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading FireSuppression...</p>
                </div>
            ) : (
                isCreatingNew ? renderNewEntryForm() :
                    isEditing ? renderEditForm() :
                        selectedDriveId ? renderDriveDetails() :
                            renderDriveGrid()
            )}

        </div>
    );
}


const DriveForm = ({ initialData, onSave, onCancel, formType }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [price, setPrice] = useState(initialData?.price || '');
    const [image, setImage] = useState(initialData?.image || '');
    const [misc, setMisc] = useState(initialData?.misc || '');
    const [specificationDocument, setSpecificationDocument] = useState(initialData?.specificationDocument || '');
    const [previewImage, setPreviewImage] = useState(initialData?.image || null);
    const [isImageLoading, setIsImageLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isImageLoading) {
            alert("Please wait for the image to finish loading before saving.");
            return;
        }
        const driveData = { name, content, price, image, misc, specificationDocument, view_count: initialData?.view_count || 0 };
        if (formType === 'edit') {
            await onSave(initialData.id, driveData);
        } else {
            await onSave(driveData);
        }
    };

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsImageLoading(true);

        try {
            const compressedFile = await imageCompression(file, {
                maxSizeMB: 0.1,
                maxWidthOrHeight: 800,
                useWebWorker: true,
            });

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setImage(base64String);
                setPreviewImage(base64String);
                setIsImageLoading(false);
            };
            reader.readAsDataURL(compressedFile);
        } catch (error) {
            console.error('Image compression error:', error);
            setIsImageLoading(false);
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setImage(base64String);
                setPreviewImage(base64String);
            };
            reader.readAsDataURL(file);
        }
    };


    return (
        <form onSubmit={handleSubmit} className="drive-form">
            <h2>{formType === 'edit' ? 'Edit FireSuppression' : 'New FireSuppression'}</h2>
            <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
                <label htmlFor="content">Content:</label>
                <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="price">Price:</label>
                <input type="text" id="price" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="image">Image:</label>
                <input type="file" id="image" accept="image/*" onChange={handleImageChange} />
                {previewImage && <img src={previewImage} alt="Preview" className="image-preview" />}
            </div>
            <div className="form-group">
                <label htmlFor="misc">Misc:</label>
                <input type="text" id="misc" value={misc} onChange={(e) => setMisc(e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="specificationDocument">Specification Document URL:</label>
                <input
                    type="text"
                    id="specificationDocument"
                    value={specificationDocument}
                    onChange={(e) => setSpecificationDocument(e.target.value)}
                />
            </div>
            <div className="form-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
};

export default FireSuppression;
/* eslint-enable react/prop-types */
