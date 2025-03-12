import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setMessage('Login successful.');
            alert('Login Successful! Refresh the page to see logged in state.');
            // eslint-disable-next-line no-unused-vars 
            const user = userCredential.user; 
        } catch (error) {
            console.error("Firebase Auth error:", error);
            setMessage(error.message); 
        }
    };

    return (
    <div className="login-register-container">
        <div className="form-wrapper">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    </div>
    );
}

export default Login;
