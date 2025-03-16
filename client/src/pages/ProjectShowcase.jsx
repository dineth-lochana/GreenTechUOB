/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import './ProjectShowcase.css';
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

function ProjectShowcase() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState(null);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [favoriteProjectIds, setFavoriteProjectIds] = useState([]);
    const [sortCriteria, setSortCriteria] = useState('name');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isPaused, setIsPaused]=useState(false);
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
                        setFavoriteProjectIds(favoritesData.projectIds || []);
                    } else {
                        setFavoriteProjectIds([]);
                        await setDoc(favoritesDocRef, { projectIds: [] });
                    }
                } catch (error) {
                    console.error("Error fetching favorites:", error);
                    setErrorMessage('Error loading favorites.');
                }
            } else {
                setIsLoggedIn(false);
                setUserEmail(null);
                setFavoriteProjectIds([]);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true);
            try {
                const projectsCollection = collection(db, 'projects');
                const querySnapshot = await getDocs(projectsCollection);
                const projectsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProjects(projectsList);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching Projects:', error);
                setErrorMessage('Error loading Projects.');
                setIsLoading(false);
            }
        };
        fetchProjects();
    }, []);

    //auto slide
    
    useEffect(() => {
        if (!selectedProjectDetails || !selectedProjectDetails.images || isPaused) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                (prevIndex + 1) % selectedProjectDetails.images.length
            );
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [selectedProjectDetails, isPaused]);

    const handleViewDetails = async (id) => {
        setSelectedProjectId(id);
        setSelectedProjectDetails(null);
        setIsEditing(false);
        setIsCreatingNew(false);
        setErrorMessage('');
        setSuccessMessage('');
        setIsLoading(true);
        try {
            const projectDocRef = doc(db, 'projects', id);
            await updateDoc(projectDocRef, { view_count: increment(1) });

            const docSnap = await getDoc(projectDocRef);
            if (docSnap.exists()) {
                setSelectedProjectDetails({ id: docSnap.id, ...docSnap.data() });
            } else {
                console.error('Project details not found');
                setErrorMessage('Project details not found.');
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching Project details:', error);
            setErrorMessage('Error loading Project details.');
            setIsLoading(false);
        }
    };


    const handleBackToGrid = () => {
        setSelectedProjectId(null);
        setIsEditing(false);
        setIsCreatingNew(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleDeleteProject = async (id) => {
        if (!window.confirm('Are you sure you want to delete this Project?')) {
            return;
        }
        setIsLoading(true);
        try {
            const projectDocRef = doc(db, 'projects', id);
            await deleteDoc(projectDocRef);
            setProjects(projects.filter(project => project.id !== id));
            setSuccessMessage('Project deleted successfully.');
            setErrorMessage('');
            setIsLoading(false);
        } catch (error) {
            console.error('Error deleting Project:', error);
            setErrorMessage('Error deleting Project.');
            setSuccessMessage('');
            setIsLoading(false);
        }
    };

    const handleEditProject = (id) => {
        setEditingProjectId(id);
        setIsEditing(true);
        setSelectedProjectId(null);
        setIsCreatingNew(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingProjectId(null);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleNewEntryClick = () => {
        setIsCreatingNew(true);
        setSelectedProjectId(null);
        setIsEditing(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleCancelNewEntry = () => {
        setIsCreatingNew(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleShare = async (projectDetails) => {
        try {
            const subject = `Check out this project: ${projectDetails.name}`;
            const body = `Details of the project:\n\n` +
                         `Name: ${projectDetails.name}\n` +
                         `Client: ${projectDetails.client}\n` +
                         `Capacity: ${projectDetails.capacity}\n` +
                         `Category: ${projectDetails.category}\n` +
                         `Description: ${projectDetails.description}\n\n` +
                         `Check it out!`;
    
            const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
            window.open(gmailLink, '_blank');
    
        } catch (error) {
            console.error('Error sharing:', error);
            alert('Sharing failed. Please try again.');
        }
    };

    const handleToggleFavorite = async (projectId) => {
        if (!isLoggedIn) {
            alert("Please log in to favorite Project.");
            return;
        }

        const favoritesDocRef = doc(db, 'userFavorites', userEmail);
        const isFavorite = favoriteProjectIds.includes(projectId);

        try {
            if (isFavorite) {
                await updateDoc(favoritesDocRef, {
                    projectIds: arrayRemove(projectId)
                });
                setFavoriteProjectIds(favoriteProjectIds.filter(id => id !== projectId));
            } else {
                await updateDoc(favoritesDocRef, {
                    projectIds: arrayUnion(projectId)
                });
                setFavoriteProjectIds([...favoriteProjectIds, projectId]);
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

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) => 
            (prevIndex + 1) % selectedProjectDetails.images.length
        );
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) => 
            (prevIndex - 1 + selectedProjectDetails.images.length) % selectedProjectDetails.images.length
        );
    };

    const renderProjectGrid = () => {
        let filteredProjects = [...projects];

        if (selectedCategory !== 'all') {
            filteredProjects = filteredProjects.filter(
                (project) => project.category === selectedCategory
            );
        }

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filteredProjects = filteredProjects.filter((project) => {
                return (
                    project.name.toLowerCase().includes(lowerQuery) ||
                    project.description.toLowerCase().includes(lowerQuery)
                );
            });
        }

        let sortedAndFilteredProjects = [...filteredProjects];
        if (sortCriteria === 'name') {
            sortedAndFilteredProjects.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortCriteria === 'capacity_asc' || sortCriteria === 'capacity_desc') {
            sortedAndFilteredProjects.sort((a, b) => {
                const capacityA = parseFloat(a.capacity);
                const capacityB = parseFloat(b.capacity);
                return sortCriteria === 'capacity_asc' ? capacityA - capacityB : capacityB - capacityA;
            });
        } else if (sortCriteria === 'view_count') {
            sortedAndFilteredProjects.sort((a, b) => b.view_count - a.view_count);
        }

        const finalProjects = [...sortedAndFilteredProjects].sort((a, b) => {
            const aIsFavorite = favoriteProjectIds.includes(a.id);
            const bIsFavorite = favoriteProjectIds.includes(b.id);
            if (aIsFavorite && !bIsFavorite) return -1;
            if (!aIsFavorite && bIsFavorite) return 1;
            return 0;
        });

        return (
            <div className="projects-grid">
                {finalProjects.map(project => (
                    <div key={project.id} className="project-card">
                        <img src={project.images[0]} alt={project.name} className="project-image" />
                        <h3>{project.name}</h3>
                        <p>Capacity: {project.capacity}</p>
                        <p>Category: {project.category}</p>
                        <p>Client: {project.client}</p>
                        <div className="project-actions">
                            <button onClick={() => handleViewDetails(project.id)}>View Details</button>
                            {isLoggedIn && (
                                <>
                                    <button onClick={() => handleEditProject(project.id)}>Edit</button>
                                    <button onClick={() => handleDeleteProject(project.id)}>Delete</button>
                                    <button
                                        className={`favorite-button ${favoriteProjectIds.includes(project.id) ? 'favorited' : ''}`}
                                        onClick={() => handleToggleFavorite(project.id)}
                                        aria-label={favoriteProjectIds.includes(project.id) ? 'Remove from favorites' : 'Add to favorites'}
                                    >
                                        {favoriteProjectIds.includes(project.id) ? '❤️' : '🤍'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderProjectDetails = () => {
        if (!selectedProjectDetails) return <div>Loading details...</div>;

        return (
            <div className="project-details-container">
                <div className="image-slider">
                    <button className="slider-button prev" onClick={handlePrevImage}>&#10094;</button>
                    <img src={selectedProjectDetails.images[currentImageIndex]} alt={selectedProjectDetails.name} className="project-details-image" />
                    <button className="slider-button next" onClick={handleNextImage}>&#10095;</button>
                </div>
                <div className="project-details">
                    <h2>{selectedProjectDetails.name}</h2>
                    <p><strong>Client:</strong> {selectedProjectDetails.client}</p>
                    <p><strong>Capacity:</strong> {selectedProjectDetails.capacity}</p>
                    <p><strong>Category:</strong> {selectedProjectDetails.category}</p>
                    <p><strong>Description:</strong> {selectedProjectDetails.description}</p>
                    <br />
                    <br />
                    <button onClick={() => handleShare(selectedProjectDetails)}>Share</button>
                    <br />
                    <br />
                    <button onClick={handleBackToGrid}>Back to Project List</button>
                </div>
            </div>
        );
    };

    const renderEditForm = () => {
        const projectToEdit = projects.find(project => project.id === editingProjectId);
        if (!projectToEdit) return <div>Loading edit form...</div>;

        return <ProjectForm
            initialData={projectToEdit}
            onSave={handleUpdateProject}
            onCancel={handleCancelEdit}
            formType="edit"
        />;
    };

    const renderNewEntryForm = () => {
        return <ProjectForm
            onSave={handleCreateProject}
            onCancel={handleCancelNewEntry}
            formType="new"
        />;
    };

    const handleCreateProject = async (projectData) => {
        setIsLoading(true);
        try {
            const projectsCollection = collection(db, 'projects');
            await addDoc(projectsCollection, projectData);
            const querySnapshot = await getDocs(projectsCollection);
            const projectsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(projectsList);

            setIsCreatingNew(false);
            setSuccessMessage('Project created successfully.');
            setErrorMessage('');
            setIsLoading(false);
        } catch (error) {
            console.error('Error creating Project:', error);
            setErrorMessage('Error creating Project.');
            setSuccessMessage('');
            setIsLoading(false);
        }
    };

    const handleUpdateProject = async (id, projectData) => {
        setIsLoading(true);
        try {
            const projectDocRef = doc(db, 'projects', id);
            await updateDoc(projectDocRef, projectData);
            const querySnapshot = await getDocs(collection(db, 'projects'));
            const projectsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(projectsList);
            setIsEditing(false);
            setEditingProjectId(null);
            setSuccessMessage('Project updated successfully.');
            setErrorMessage('');
            setIsLoading(false);
        } catch (error) {
            console.error('Error updating Project:', error);
            setErrorMessage('Error updating Project.');
            setSuccessMessage('');
            setIsLoading(false);
        }
    };

    return (
        <div className="project-showcase-page">
            <h1>Project Showcase</h1>
            {isLoggedIn && !isCreatingNew && !isEditing && !selectedProjectId && (
                <button onClick={handleNewEntryClick} className="new-entry-button">New Entry</button>
            )}

            <div className="filter-options">
                <label htmlFor="category-filter">Filter by Category:</label>
                <select
                    id="category-filter"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                >
                    <option value="all">All</option>
                    <option value="residential">Residential</option>
                    <option value="industrial">Industrial</option>
                </select>
            </div>

            <div className="search-filter-options">
                <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="sorting-options">
                <label htmlFor="sort">Sort by:</label>
                <select id="sort" value={sortCriteria} onChange={handleSortChange}>
                    <option value="name">Name</option>
                    <option value="capacity_asc">Capacity: Low to High</option>
                    <option value="capacity_desc">Capacity: High to Low</option>
                    <option value="view_count">View Count</option>
                </select>
            </div>

            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            {isLoading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading Projects...</p>
                </div>
            ) : (
                isCreatingNew ? renderNewEntryForm() :
                    isEditing ? renderEditForm() :
                        selectedProjectId ? renderProjectDetails() :
                            renderProjectGrid()
            )}
        </div>
    );
}

const ProjectForm = ({ initialData, onSave, onCancel, formType }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [capacity, setCapacity] = useState(initialData?.capacity || '');
    const [client, setClient] = useState(initialData?.client || '');
    const [images, setImages] = useState(initialData?.images || []);
    const [category, setCategory] = useState(initialData?.category || 'residential');
    const [previewImages, setPreviewImages] = useState(initialData?.images || []);
    const [isImageLoading, setIsImageLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isImageLoading) {
            alert("Please wait for the image to finish loading before saving.");
            return;
        }
        const projectData = { name, description, capacity, client, images, category, view_count: initialData?.view_count || 0 };
        if (formType === 'edit') {
            await onSave(initialData.id, projectData);
        } else {
            await onSave(projectData);
        }
    };

    const handleImageChange = async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsImageLoading(true);

        try {
            const compressedFiles = await Promise.all(
                Array.from(files).map(file => imageCompression(file, {
                    maxSizeMB: 0.1,
                    maxWidthOrHeight: 800,
                    useWebWorker: true,
                }))
            );

            const readers = compressedFiles.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result);
                    };
                    reader.readAsDataURL(file);
                });
            });

            const base64Strings = await Promise.all(readers);
            setImages(base64Strings);
            setPreviewImages(base64Strings);
            setIsImageLoading(false);
        } catch (error) {
            console.error('Image compression error:', error);
            setIsImageLoading(false);
            const readers = Array.from(files).map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result);
                    };
                    reader.readAsDataURL(file);
                });
            });

            const base64Strings = await Promise.all(readers);
            setImages(base64Strings);
            setPreviewImages(base64Strings);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="project-form">
            <h2>{formType === 'edit' ? 'Edit Project' : 'New Project'}</h2>
            <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="form-group"> 
                <label htmlFor="capacity">Capacity:</label>
                <input type="text" id="capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="client">Client:</label>
                <input type="text" id="client" value={client} onChange={(e) => setClient(e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="category">Category:</label>
                <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="residential">Residential</option>
                    <option value="industrial">Industrial</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="images">Images:</label>
                <input type="file" id="images" accept="image/*" multiple onChange={handleImageChange} />
                <div className="image-preview-container">
                    {previewImages.map((image, index) => (
                        <img key={index} src={image} alt={`Preview ${index}`} className="image-preview" />
                    ))}
                </div>
            </div>
            <div className="form-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
};

export default ProjectShowcase;
