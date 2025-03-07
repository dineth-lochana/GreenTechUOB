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
    const [isPaused, setIsPaused] = useState(false); // For pause-on-hover

    // Fetch user authentication state
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

    // Fetch projects from Firebase
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

    // Automatic slideshow logic
    useEffect(() => {
        if (!selectedProjectDetails || !selectedProjectDetails.images || isPaused) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                (prevIndex + 1) % selectedProjectDetails.images.length
            );
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [selectedProjectDetails, isPaused]);

    // Handle viewing project details
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

    // Handle manual navigation for the image slider
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

    // Handle new entry click
    const handleNewEntryClick = () => {
        setIsCreatingNew(true);
        setSelectedProjectId(null);
        setIsEditing(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    // Handle back to grid
    const handleBackToGrid = () => {
        setSelectedProjectId(null);
        setIsEditing(false);
        setIsCreatingNew(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    // Render project details with the image slider
    const renderProjectDetails = () => {
        if (!selectedProjectDetails) return <div>Loading details...</div>;

        return (
            <div className="project-details-container">
                <div
                    className="image-slider"
                    onMouseEnter={() => setIsPaused(true)} // Pause on hover
                    onMouseLeave={() => setIsPaused(false)} // Resume on mouse leave
                >
                    <button className="slider-button prev" onClick={handlePrevImage}>&#10094;</button>
                    <img
                        src={selectedProjectDetails.images[currentImageIndex]}
                        alt={selectedProjectDetails.name}
                        className="project-details-image"
                    />
                    <button className="slider-button next" onClick={handleNextImage}>&#10095;</button>
                    <div className="slider-indicators">
                        {selectedProjectDetails.images.map((_, index) => (
                            <div
                                key={index}
                                className={`slider-indicator ${index === currentImageIndex ? 'active' : ''}`}
                                onClick={() => setCurrentImageIndex(index)}
                            />
                        ))}
                    </div>
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

    // Render the project grid
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
                        {project.images && project.images.length > 0 ? (
                            <img src={project.images[0]} alt={project.name} className="project-image" />
                        ) : (
                            <div className="no-image">No Image Available</div>
                        )}
                        <h3>{project.name}</h3>
                        <p>Capacity: {project.capacity}</p>
                        <p>Category: {project.category}</p>
                        <p>Client: {project.client}</p>
                        <p>Description: {project.description}</p>
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

    return (
        <div className="project-showcase-page">
            <h1>Project Showcase</h1>
            {isLoggedIn && !isCreatingNew && !isEditing && !selectedProjectId && (
                <button onClick={handleNewEntryClick} className="new-entry-button">New Entry</button>
            )}

            {/* Filter, search, and sorting options */}
            <div className="filter-options">
                <label htmlFor="category-filter">Filter by Category:</label>
                <select
                    id="category-filter"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="sorting-options">
                <label htmlFor="sort">Sort by:</label>
                <select id="sort" value={sortCriteria} onChange={(e) => setSortCriteria(e.target.value)}>
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

export default ProjectShowcase;
