import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

function LoginRegister() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            let userCredential;
            if (isRegistering) {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                setMessage('User registered successfully.');
                alert('Registration Successful! You can now log in.');
                setIsRegistering(false);
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
                setMessage('Login successful.');
                alert('Login Successful! Refresh the page to see logged in state.');
            }
            // eslint-disable-next-line no-unused-vars 
            const user = userCredential.user; 
        } catch (error) {
            console.error("Firebase Auth error:", error);
            setMessage(error.message); 
        }
    };

    return (
    < div className="login-register-container">
        <div className="form-wrapper">
            <h2>{isRegistering ? 'Register' : 'Login'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
                <button type="button" onClick={() => setIsRegistering(!isRegistering)}>
                    {isRegistering ? 'Switch to Login' : 'Switch to Register'}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    </div>
    );
}

export default LoginRegister;
