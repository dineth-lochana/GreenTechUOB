import React from 'react';
import { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged} from 'firebase/auth';

function SolarEnergy() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState(null);

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

    return (
        <div>
            <h1>Solar Energy Page</h1>
            {isLoggedIn ? (
                <p>Logged in, username is: {userEmail}</p>
            ) : (
                <p>You are not logged in.</p>
            )}
        </div>
    );
}

export default SolarEnergy;