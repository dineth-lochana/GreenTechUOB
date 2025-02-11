import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true);
                setUserEmail(user.email);
            } else {
                setIsLoggedIn(false);
                setUserEmail(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            alert('Logged out successfully!');
        } catch (error) {
            console.error("Firebase logout error:", error);
            alert('Logout failed.');
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <button className="hamburger-menu" onClick={toggleMenu}>
                    ☰
                </button>
                <ul className={`navbar-list ${isMenuOpen ? 'open' : ''}`}>
                    <li><a href="./#/">Home</a></li>
                    <li><a href="./#/solar">Solar Energy</a></li>
                    <li><a href="./#/fireSafety">Fire Safety</a></li>
                    <li><a href="./#/variableDrives">Variable Drives</a></li>
                    <li><a href="./#/projectShowcase">Project Showcase</a></li>
                    {isLoggedIn ? (
                        <>
                            <li><span>{userEmail}</span></li>
                            <li>
                                <a href="./#logout" onClick={handleLogout} className="logout-link">
                                    Logout
                                </a>
                            </li>
                        </>
                    ) : (
                        {/* <li><a href="./#/loginRegister">Login</a></li> */} 
                        {/* Removed Public Login Button to Comply with Client Requests */}
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
