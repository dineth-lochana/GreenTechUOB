/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import './SolarEnergy.css';
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

function SolarEnergy() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState(null);
    const [solarProducts, setSolarProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [selectedProductDetails, setSelectedProductDetails] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [favoriteProductIds, setFavoriteProductIds] = useState([]);
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
                        setFavoriteProductIds(favoritesData.productIds || []);
                    } else {
                        setFavoriteProductIds([]);
                        await setDoc(favoritesDocRef, { productIds: [] });
                    }
                } catch (error) {
                    console.error("Error fetching favorites:", error);
                    setErrorMessage('Error loading favorites.');
                }
            } else {
                setIsLoggedIn(false);
                setUserEmail(null);
                setFavoriteProductIds([]);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        const fetchSolarProducts = async () => {
            setIsLoading(true);
            try {
                const productsCollection = collection(db, 'solarProducts');
                const querySnapshot = await getDocs(productsCollection);
                const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setSolarProducts(productsList);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching Solar Products:', error);
                setErrorMessage('Error loading Solar Products.');
                setIsLoading(false);
            }
        };
        fetchSolarProducts();
    }, []);

    const handleViewDetails = async (id) => {
        setSelectedProductId(id);
        setSelectedProductDetails(null);
        setIsEditing(false);
        setIsCreatingNew(false);
        setErrorMessage('');
        setSuccessMessage('');
        setIsLoading(true);
        try {
            const productDocRef = doc(db, 'solarProducts', id);
            await updateDoc(productDocRef, { view_count: increment(1) });

            const docSnap = await getDoc(productDocRef);
            if (docSnap.exists()) {
                setSelectedProductDetails({ id: docSnap.id, ...docSnap.data() });
            } else {
                console.error('Product details not found');
                setErrorMessage('Product details not found.');
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching Product details:', error);
            setErrorMessage('Error loading Product details.');
            setIsLoading(false);
        }
    };

    const handleBackToGrid = () => {
        setSelectedProductId(null);
        setIsEditing(false);
        setIsCreatingNew(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this Product?')) {
            return;
        }
        setIsLoading(true);
        try {
            const productDocRef = doc(db, 'solarProducts', id);
            await deleteDoc(productDocRef);
            setSolarProducts(solarProducts.filter(product => product.id !== id));
            setSuccessMessage('Solar Product deleted successfully.');
            setErrorMessage('');
            setIsLoading(false);
        } catch (error) {
            console.error('Error deleting Solar Product:', error);
            setErrorMessage('Error deleting Solar Product.');
            setSuccessMessage('');
            setIsLoading(false);
        }
    };

    const handleEditProduct = (id) => {
        setEditingProductId(id);
        setIsEditing(true);
        setSelectedProductId(null);
        setIsCreatingNew(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingProductId(null);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleNewEntryClick = () => {
        setIsCreatingNew(true);
        setSelectedProductId(null);
        setIsEditing(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleCancelNewEntry = () => {
        setIsCreatingNew(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleShare = async (productDetails) => {
        try {
            const subject = `Check out this solar product: ${productDetails.name}`;
            const body = `Details of the solar product:\n\n` +
                         `Name: ${productDetails.name}\n` +
                         `Price: ${productDetails.price}\n` +
                         `Content: ${productDetails.content}\n` +
                         `Additional Info: ${productDetails.misc}\n\n` +
                         `Check it out!`;
    
            const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
            window.open(gmailLink, '_blank');
    
        } catch (error) {
            console.error('Error sharing:', error);
            alert('Sharing failed. Please try again.');
        }
    };

    const handleToggleFavorite = async (productId) => {
        if (!isLoggedIn) {
            alert("Please log in to favorite Product.");
            return;
        }

        const favoritesDocRef = doc(db, 'userFavorites', userEmail);
        const isFavorite = favoriteProductIds.includes(productId);

        try {
            if (isFavorite) {
                await updateDoc(favoritesDocRef, {
                    productIds: arrayRemove(productId)
                });
                setFavoriteProductIds(favoriteProductIds.filter(id => id !== productId));
            } else {
                await updateDoc(favoritesDocRef, {
                    productIds: arrayUnion(productId)
                });
                setFavoriteProductIds([...favoriteProductIds, productId]);
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

    const renderProductGrid = () => {
        let filteredProducts = [...solarProducts];

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filteredProducts = filteredProducts.filter(product => {
                return (
                    product.name.toLowerCase().includes(lowerQuery) ||
                    product.content.toLowerCase().includes(lowerQuery)
                );
            });
        }

        let sortedAndFilteredProducts = [...filteredProducts];

        if (sortCriteria === 'name') {
            sortedAndFilteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortCriteria === 'price_asc' || sortCriteria === 'price_desc') {
            sortedAndFilteredProducts.sort((a, b) => {
                const cleanPrice = (price) => {
                    return parseFloat(
                        price
                            .replace(/Rs\.?\s*/i, '')
                            .replace(/,/g, '')
                            .replace(/[^0-9.]/g, '')
                            || 0
                    );
                };

                const priceA = cleanPrice(a.price);
                const priceB = cleanPrice(b.price);
                return sortCriteria === 'price_asc' ? priceA - priceB : priceB - priceA;
            });
        } else if (sortCriteria === 'view_count') {
            sortedAndFilteredProducts.sort((a, b) => b.view_count - a.view_count);
        }

        const finalProducts = [...sortedAndFilteredProducts].sort((a, b) => {
            const aIsFavorite = favoriteProductIds.includes(a.id);
            const bIsFavorite = favoriteProductIds.includes(b.id);
            if (aIsFavorite && !bIsFavorite) return -1;
            if (!aIsFavorite && bIsFavorite) return 1;
            return 0;
        });

        return (
            <div className="solar-products-grid">
                {finalProducts.map(product => (
                    <div key={product.id} className="product-card">
                        <img src={product.image} alt={product.name} className="product-image" />
                        <h3>{product.name}</h3>
                        <p>Price: {product.price}</p>
                        <div className="product-actions">
                            <button onClick={() => handleViewDetails(product.id)}>View Details</button>
                            {isLoggedIn && (
                                <>
                                    <button onClick={() => handleEditProduct(product.id)}>Edit</button>
                                    <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                                    <button
                                        className={`favorite-button ${favoriteProductIds.includes(product.id) ? 'favorited' : ''}`}
                                        onClick={() => handleToggleFavorite(product.id)}
                                        aria-label={favoriteProductIds.includes(product.id) ? 'Remove from favorites' : 'Add to favorites'}
                                    >
                                        {favoriteProductIds.includes(product.id) ? '❤️' : '🤍'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderProductDetails = () => {
        if (!selectedProductDetails) return <div>Loading details...</div>;

        return (
            <div className="product-details-container">
                <div className="product-image-container">
                    <img src={selectedProductDetails.image} alt={selectedProductDetails.name} className="product-details-image" />
                </div>
                <div className="product-details">
                    <h2>{selectedProductDetails.name}</h2>
                    <p><strong>Content:</strong> {selectedProductDetails.content}</p>
                    <p><strong>Price:</strong> {selectedProductDetails.price}</p>
                    <p><strong>Misc:</strong> {selectedProductDetails.misc}</p>
                    <br/>
                    <br/>
                    <button onClick={() => handleShare(selectedProductDetails)}>Share</button>
                    <br/>
                    <br/>
                    <button onClick={handleBackToGrid}>Back to Solar Product List</button>
                </div>
            </div>
        );
    };

    const renderEditForm = () => {
        const productToEdit = solarProducts.find(product => product.id === editingProductId);
        if (!productToEdit) return <div >Loading edit form...</div>;

        return <ProductForm
            initialData={productToEdit}
            onSave={handleUpdateProduct}
            onCancel={handleCancelEdit}
            formType="edit"
        />;
    };

    const renderNewEntryForm = () => {
        return <ProductForm
            onSave={handleCreateProduct}
            onCancel={handleCancelNewEntry}
            formType="new"
        />;
    };

    const handleCreateProduct = async (productData) => {
        setIsLoading(true);
        try {
            const productsCollection = collection(db, 'solarProducts');
            await addDoc(productsCollection, productData);
            const querySnapshot = await getDocs(productsCollection);
            const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSolarProducts(productsList);

            setIsCreatingNew(false);
            setSuccessMessage('Solar Product created successfully.');
            setErrorMessage('');
            setIsLoading(false);
        } catch (error) {
            console.error('Error creating Solar Products:', error);
            setErrorMessage('Error creating Solar Product.');
            setSuccessMessage('');
            setIsLoading(false);
        }
    };

    const handleUpdateProduct = async (id, productData) => {
        setIsLoading(true);
        try {
            const productDocRef = doc(db, 'solarProducts', id);
            await updateDoc(productDocRef, productData);
            const querySnapshot = await getDocs(collection(db, 'solarProducts'));
            const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSolarProducts(productsList);
            setIsEditing(false);
            setEditingProductId(null);
            setSuccessMessage('Solar Product updated successfully.');
            setErrorMessage('');
            setIsLoading(false);
        } catch (error) {
            console.error('Error updating Solar Products:', error);
            setErrorMessage('Error updating Solar Product.');
            setSuccessMessage('');
            setIsLoading(false);
        }
    };

    return (
        <div className="solar-products-page">
            <h1>Solar Energy Products Page</h1>
            {isLoggedIn && !isCreatingNew && !isEditing && !selectedProductId && (
                <button onClick={handleNewEntryClick} className="new-entry-button">New Entry</button>
            )}

            <div className="search-filter-options">
                <input
                    type="text"
                    placeholder="Search products..."
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
                    <p>Loading Solar Products...</p>
                </div>
            ) : (
                isCreatingNew ? renderNewEntryForm() :
                    isEditing ? renderEditForm() :
                        selectedProductId ? renderProductDetails() :
                            renderProductGrid()
            )}
        </div>
    );
}

const ProductForm = ({ initialData, onSave, onCancel, formType }) => {
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
        const productData = { name, content, price, image, misc, view_count: initialData?.view_count || 0 };
        if (formType === 'edit') {
            await onSave(initialData.id, productData);
        } else {
            await onSave(productData);
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
        <form onSubmit={handleSubmit} className="product-form">
            <h2>{formType === 'edit' ? 'Edit Solar Product' : 'New Solar Product'}</h2>
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

export default SolarEnergy;
/* eslint-enable react/prop-types */
