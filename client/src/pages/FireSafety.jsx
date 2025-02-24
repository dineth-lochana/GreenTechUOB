/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import './FireSafety.css';
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

function FireSafety() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState(null);
    const [fireExtinguishers, setFireExtinguishers] = useState([]);
    const [selectedExtinguisherId, setSelectedExtinguisherId] = useState(null);
    const [selectedExtinguisherDetails, setSelectedExtinguisherDetails] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingExtinguisherId, setEditingExtinguisherId] = useState(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [favoriteExtinguisherIds, setFavoriteExtinguisherIds] = useState([]);
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
                        setFavoriteExtinguisherIds(favoritesData.extinguisherIds || []);
                    } else {
                        setFavoriteExtinguisherIds([]);
                        await setDoc(favoritesDocRef, { extinguisherIds: [] });
                    }
                } catch (error) {
                    console.error("Error fetching favorites:", error);
                    setErrorMessage('Error loading favorites.');
                }
            } else {
                setIsLoggedIn(false);
                setUserEmail(null);
                setFavoriteExtinguisherIds([]);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        const fetchFireExtinguishers = async () => {
            setIsLoading(true);
            try {
                const extinguishersCollection = collection(db, 'fireExtinguisher');
                const querySnapshot = await getDocs(extinguishersCollection);
                const extinguishersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setFireExtinguishers(extinguishersList);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching fire extinguishers:', error);
                setErrorMessage('Error loading Fire Extinguishers.');
                setIsLoading(false);
            }
        };
        fetchFireExtinguishers();
    }, []);

    const handleViewDetails = async (id) => {
        setSelectedExtinguisherId(id);
        setSelectedExtinguisherDetails(null);
        setIsEditing(false);
        setIsCreatingNew(false);
        setErrorMessage('');
        setSuccessMessage('');
        setIsLoading(true);
        try {
            const extinguisherDocRef = doc(db, 'fireExtinguisher', id);
            await updateDoc(extinguisherDocRef, { view_count: increment(1) });

            const docSnap = await getDoc(extinguisherDocRef);
            if (docSnap.exists()) {
                setSelectedExtinguisherDetails({ id: docSnap.id, ...docSnap.data() });
            } else {
                console.error('Fire extinguisher details not found');
                setErrorMessage('Fire Extinguisher details not found.');
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching fire extinguisher details:', error);
            setErrorMessage('Error loading Fire Extinguisher details.');
            setIsLoading(false);
        }
    };

    const handleBackToGrid = () => {
        setSelectedExtinguisherId(null);
        setIsEditing(false);
        setIsCreatingNew(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleDeleteExtinguisher = async (id) => {
        if (!window.confirm('Are you sure you want to delete this Fire Extinguisher?')) {
            return;
        }
        setIsLoading(true);
        try {
            const extinguisherDocRef = doc(db, 'fireExtinguisher', id);
            await deleteDoc(extinguisherDocRef);
            setFireExtinguishers(fireExtinguishers.filter(extinguisher => extinguisher.id !== id));
            setSuccessMessage('Fire Extinguisher deleted successfully.');
            setErrorMessage('');
            setIsLoading(false);
        } catch (error) {
            console.error('Error deleting fire extinguisher:', error);
            setErrorMessage('Error deleting Fire Extinguisher.');
            setSuccessMessage('');
            setIsLoading(false);
        }
    };

    const handleEditExtinguisher = (id) => {
        setEditingExtinguisherId(id);
        setIsEditing(true);
        setSelectedExtinguisherId(null);
        setIsCreatingNew(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingExtinguisherId(null);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleNewEntryClick = () => {
        setIsCreatingNew(true);
        setSelectedExtinguisherId(null);
        setIsEditing(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleCancelNewEntry = () => {
        setIsCreatingNew(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleToggleFavorite = async (extinguisherId) => {
        if (!isLoggedIn) {
            alert("Please log in to favorite extinguishers.");
            return;
        }

        const favoritesDocRef = doc(db, 'userFavorites', userEmail);
        const isFavorite = favoriteExtinguisherIds.includes(extinguisherId);

        try {
            if (isFavorite) {
                await updateDoc(favoritesDocRef, {
                    extinguisherIds: arrayRemove(extinguisherId)
                });
                setFavoriteExtinguisherIds(favoriteExtinguisherIds.filter(id => id !== extinguisherId));
            } else {
                await updateDoc(favoritesDocRef, {
                    extinguisherIds: arrayUnion(extinguisherId)
                });
                setFavoriteExtinguisherIds([...favoriteExtinguisherIds, extinguisherId]);
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

    const renderExtinguisherGrid = () => {
        let filteredExtinguishers = [...fireExtinguishers];

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filteredExtinguishers = filteredExtinguishers.filter(extinguisher => {
                return (
                    extinguisher.name.toLowerCase().includes(lowerQuery) ||
                    extinguisher.content.toLowerCase().includes(lowerQuery)
                );
            });
        }

        let sortedAndFilteredExtinguishers = [...filteredExtinguishers];

        if (sortCriteria === 'name') {
            sortedAndFilteredExtinguishers.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortCriteria === 'price') {
            sortedAndFilteredExtinguishers.sort((a, b) => {
                const priceA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
                const priceB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
                return priceA - priceB;
            });
        } else if (sortCriteria === 'view_count') {
            sortedAndFilteredExtinguishers.sort((a, b) => b.view_count - a.view_count);
        }

        const finalExtinguishers = [...sortedAndFilteredExtinguishers].sort((a, b) => {
            const aIsFavorite = favoriteExtinguisherIds.includes(a.id);
            const bIsFavorite = favoriteExtinguisherIds.includes(b.id);
            if (aIsFavorite && !bIsFavorite) return -1;
            if (!aIsFavorite && bIsFavorite) return 1;
            return 0;
        });

        return (
            <div className="fire-extinguishers-grid">
                {finalExtinguishers.map(extinguisher => (
                    <div key={extinguisher.id} className="extinguisher-card">
                        <img src={extinguisher.image} alt={extinguisher.name} className="extinguisher-image" />
                        <h3>{extinguisher.name}</h3>
                        <p>Price: {extinguisher.price}</p>
                        <div className="extinguisher-actions">
                            <button onClick={() => handleViewDetails(extinguisher.id)}>View Details</button>
                            {isLoggedIn && (
                                <>
                                    <button onClick={() => handleEditExtinguisher(extinguisher.id)}>Edit</button>
                                    <button onClick={() => handleDeleteExtinguisher(extinguisher.id)}>Delete</button>
                                    <button
                                        className={`favorite-button ${favoriteExtinguisherIds.includes(extinguisher.id) ? 'favorited' : ''}`}
                                        onClick={() => handleToggleFavorite(extinguisher.id)}
                                        aria-label={favoriteExtinguisherIds.includes(extinguisher.id) ? 'Remove from favorites' : 'Add to favorites'}
                                    >
                                        {favoriteExtinguisherIds.includes(extinguisher.id) ? '❤️' : '🤍'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderExtinguisherDetails = () => {
        if (!selectedExtinguisherDetails) return <div>Loading details...</div>;

        return (
            <div className="extinguisher-details-container">
                <div className="extinguisher-image-container">
                    <img src={selectedExtinguisherDetails.image} alt={selectedExtinguisherDetails.name} className="extinguisher-details-image" />
                </div>
                <div className="extinguisher-details">
                    <h2>{selectedExtinguisherDetails.name}</h2>
                    <p><strong>Content:</strong> {selectedExtinguisherDetails.content}</p>
                    <p><strong>Price:</strong> {selectedExtinguisherDetails.price}</p>
                    <p><strong>Misc:</strong> {selectedExtinguisherDetails.misc}</p>
                    <br/>
                    <br/>
                    <button onClick={handleBackToGrid}>Back to Fire Extinguisher List</button>
                </div>
            </div>
        );
    };

    const renderEditForm = () => {
        const extinguisherToEdit = fireExtinguishers.find(extinguisher => extinguisher.id === editingExtinguisherId);
        if (!extinguisherToEdit) return <div>Loading edit form...</div>;

        return <ExtinguisherForm
            initialData={extinguisherToEdit}
            onSave={handleUpdateExtinguisher}
            onCancel={handleCancelEdit}
            formType="edit"
        />;
    };

    const renderNewEntryForm = () => {
        return <ExtinguisherForm
            onSave={handleCreateExtinguisher}
            onCancel={handleCancelNewEntry}
            formType="new"
        />;
    };

    const handleCreateExtinguisher = async (extinguisherData) => {
        setIs Loading(true);
        try {
            const extinguishersCollection = collection(db, 'fireExtinguisher');
            const newExtinguisherRef = await addDoc(extinguishersCollection, extinguisherData);
            setFireExtinguishers([...fireExtinguishers, { id: newExtinguisherRef.id, ...extinguisherData }]);
            setSuccessMessage('Fire Extinguisher created successfully.');
            setErrorMessage('');
            setIsCreatingNew(false);
            setIsLoading(false);
        } catch (error) {
            console.error('Error creating fire extinguisher:', error);
            setErrorMessage('Error creating Fire Extinguisher.');
            setSuccessMessage('');
            setIsLoading(false);
        }
    };

    const handleUpdateExtinguisher = async (extinguisherData) => {
        setIsLoading(true);
        try {
            const extinguisherDocRef = doc(db, 'fireExtinguisher', editingExtinguisherId);
            await updateDoc(extinguisherDocRef, extinguisherData);
            const updatedExtinguishers = fireExtinguishers.map(extinguisher => 
                extinguisher.id === editingExtinguisherId ? { id: extinguisher.id, ...extinguisherData } : extinguisher
            );
            setFireExtinguishers(updatedExtinguishers);
            setSuccessMessage('Fire Extinguisher updated successfully.');
            setErrorMessage('');
            setIsEditing(false);
            setEditingExtinguisherId(null);
            setIsLoading(false);
        } catch (error) {
            console.error('Error updating fire extinguisher:', error);
            setErrorMessage('Error updating Fire Extinguisher.');
            setSuccessMessage('');
            setIsLoading(false);
        }
    };

    return (
        <div className="fire-safety-page">
            <h1>Fire Safety Management</h1>
            {isLoading && <p>Loading...</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
            {!isCreatingNew && !isEditing && (
                <>
                    <button onClick={handleNewEntryClick}>Add New Fire Extinguisher</button>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <select value={sortCriteria} onChange={handleSortChange}>
                        <option value="name">Sort by Name</option>
                        <option value="price">Sort by Price</option>
                        <option value="view_count">Sort by Views</option>
                    </select>
                    {renderExtinguisherGrid()}
                </>
            )}
            {isEditing && renderEditForm()}
            {isCreatingNew && renderNewEntryForm()}
            {selectedExtinguisherId && renderExtinguisherDetails()}
        </div>
    );
}

function ExtinguisherForm({ initialData, onSave, onCancel, formType }) {
    const [name, setName] = useState(initialData ? initialData.name : '');
    const [content, setContent] = useState(initialData ? initialData.content : '');
    const [price, setPrice] = useState(initialData ? initialData.price : '');
    const [misc, setMisc] = useState(initialData ? initialData.misc : '');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(initialData ? initialData.image : '');

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
            };
            try {
                const compressedFile = await imageCompression(file, options);
                setImage(compressedFile);
                setImagePreview(URL.createObjectURL(compressedFile));
            } catch (error) {
                console.error('Error compressing image:', error);
            }
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const extinguisherData = {
            name,
            content,
            price,
            misc,
            image: imagePreview,
        };
        onSave(extinguisherData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
 required
                />
            </div>
            <div className="form-group">
                <label htmlFor="content">Content:</label>
                <input
                    type="text"
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="price">Price:</label>
                <input
                    type="text"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="misc">Miscellaneous Info:</label>
                <input
                    type="text"
                    id="misc"
                    value={misc}
                    onChange={(e) => setMisc(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label htmlFor="image">Image:</label>
                <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                />
                {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
            </div>
            <button type="submit">{formType === 'edit' ? 'Update' : 'Create'} Fire Extinguisher</button>
            <button type="button" onClick={onCancel}>Cancel</button>
        </form>
    );
}

export default FireSafety;
