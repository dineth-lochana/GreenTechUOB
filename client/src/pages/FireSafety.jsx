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
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';

function VariableExtinguishers() {
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
    const [searchQuery, setSearchQuery] = useState([]);
    const navigate = useNavigate();

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
                const extinguishersCollection = collection(db, 'fireExtinguishers');
                const querySnapshot = await getDocs(extinguishersCollection);
                const extinguishersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setFireExtinguishers(extinguishersList);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching Extinguishers:', error);
                setErrorMessage('Error loading Extinguishers.');
                setIsLoading(false);
            }
        };
        fetchFireExtinguishers();
    }, []);

    const handleViewDetails = async (id) => {
        navigate(`/fire-extinguishers/${id}`);
    };

    const handleBackToGrid = () => {
        setSelectedExtinguisherId(null);
        setIsEditing(false);
        setIsCreatingNew(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleDeleteExtinguisher = async (id) => {
        if (!window.confirm('Are you sure you want to delete this Extinguisher?')) {
            return;
        }
        setIsLoading(true);
        try {
            const extinguisherDocRef = doc(db, 'fireExtinguishers', id);
            await deleteDoc(extinguisherDocRef);
            setFireExtinguishers(fireExtinguishers.filter(extinguisher => extinguisher.id !== id));
            setSuccessMessage('Fire Extinguisher deleted successfully.');
            setErrorMessage('');
            setIsLoading(false);
        } catch (error) {
            console.error('Error deleting Fire Extinguisher:', error);
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

    const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

const handleShare = async (extinguisherDetails) => {
    const slug = slugify(extinguisherDetails.name);
    const shareUrl = `${window.location.origin}/fire-extinguishers/${slug}`;
    const shareData = {
        title: extinguisherDetails.name,
        text: `Check out this fire extinguisher: ${extinguisherDetails.name}. Price: ${extinguisherDetails.price}. Details: ${extinguisherDetails.content}. Additional Info: ${extinguisherDetails.misc}`,
        url: shareUrl,
    };

    if (navigator.share) {
        await navigator.share(shareData);
    } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        alert('Extinguisher details copied to clipboard!');
    }
};

    const handleToggleFavorite = async (extinguisherId) => {
        if (!isLoggedIn) {
            alert("Please log in to favorite Extinguisher.");
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
        } else if (sortCriteria === 'price_asc' || sortCriteria === 'price_desc') {
            sortedAndFilteredExtinguishers.sort((a, b) => {
                const cleanPrice = (price) => {
                    return parseFloat(
                        price
                            .replace(/Rs\.?\s*/i, '')
                            .replace(/ ,/g, '')
                            .replace(/[^0-9.]/g, '')
                            || 0
                    );
                };

                const priceA = cleanPrice(a.price);
                const priceB = cleanPrice(b.price);
                return sortCriteria === 'price_asc' ? priceA - priceB : priceB - priceA;
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
        setIsLoading(true);
        try {
            const extinguishersCollection = collection(db, 'fireExtinguishers');
            await addDoc(extinguishersCollection, extinguisherData);
            const querySnapshot = await getDocs(extinguishersCollection);
            const extinguishersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFireExtinguishers(extinguishersList);

            setIsCreatingNew(false);
            setSuccessMessage('Fire Extinguisher created successfully.');
            setErrorMessage('');
            setIsLoading(false);
        } catch (error) {
            console.error('Error creating Fire Extinguishers:', error);
            setErrorMessage('Error creating Fire Extinguisher.');
            setSuccessMessage('');
            setIsLoading(false);
        }
    };

    const handleUpdateExtinguisher = async (id, extinguisherData) => {
        setIsLoading(true);
        try {
            const extinguisherDocRef = doc(db, 'fireExtinguishers', id);
            await updateDoc(extinguisherDocRef, extinguisherData);
            const querySnapshot = await getDocs(collection(db, 'fireExtinguishers'));
            const extinguishersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFireExtinguishers(extinguishersList);
            setIsEditing(false);
            setEditingExtinguisherId(null);
            setSuccessMessage('Fire Extinguisher updated successfully .');
            setErrorMessage('');
            setIsLoading(false);
        } catch (error) {
            console.error('Error updating Fire Extinguishers:', error);
            setErrorMessage('Error updating Fire Extinguisher.');
            setSuccessMessage('');
            setIsLoading(false);
        }
    };

    return (
        <div className="fire-extinguishers-page">
            <h1>Fire Extinguishers Page</h1>
            {isLoggedIn && !isCreatingNew && !isEditing && !selectedExtinguisherId && (
                <button onClick={handleNewEntryClick} className="new-entry-button">New Entry</button>
            )}

            <div className="search-filter-options">
                <input
                    type="text"
                    placeholder="Search extinguishers..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="sorting-options">
                <label htmlFor="sort">Sort by:</label>
                <select id="sort" value={sortCriteria} onChange={handleSortChange}>
                    <option value="name">Name</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="view_count">View Count</option>
                </select>
            </div>

            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            {isLoading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading Fire Extinguishers...</p>
                </div>
            ) : (
                isCreatingNew ? renderNewEntryForm() :
                    isEditing ? renderEditForm() :
                        selectedExtinguisherId ? renderExtinguisherDetails() :
                            renderExtinguisherGrid()
            )}
        </div>
    );
}

const ExtinguisherForm = ({ initialData, onSave, onCancel, formType }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [price, setPrice] = useState(initialData?.price || '');
    const [image, setImage] = useState(initialData?.image || '');
    const [misc, setMisc] = useState(initialData?.misc || '');
    const [previewImage, setPreviewImage] = useState(initialData?.image || null);
    const [isImageLoading, setIsImageLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isImageLoading) {
            alert("Please wait for the image to finish loading before saving.");
            return;
        }
        const extinguisherData = { name, content, price, image, misc, view_count: initialData?.view_count || 0 };
        if (formType === 'edit') {
            await onSave(initialData.id, extinguisherData);
        } else {
            await onSave(extinguisherData);
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
        <form onSubmit={handleSubmit} className="extinguisher-form">
            <h2>{formType === 'edit' ? 'Edit Fire Extinguisher' : 'New Fire Extinguisher'}</h2>
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
            <div className="form-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
};

export default VariableExtinguishers;
/* eslint-enable react/prop-types */
