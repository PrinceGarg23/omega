import React, { useState } from 'react';
import { auth, firestore, firebase } from '../../firebase';
import { useNavigate, Link } from 'react-router-dom';
import './login.css';
import { TailSpin } from 'react-loader-spinner';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await auth.signInWithEmailAndPassword(email, password);
      // The user is logged in, now fetch their data from Firestore
      const userDoc = await firestore.collection('users').doc(auth.currentUser.uid).get();
      const userData = userDoc.data();

      // Set the user type (seller/buyer) based on data from Firestore
      setUserType(userData.category);
      // console.log(userData.category);
      setLoading(false);

      // Navigate to the appropriate dashboard based on the user's type
      if (userData.category === 'seller') {
        navigate('/dashboard/seller');
      } else if (userData.category === 'buyer') {
        navigate('/dashboard/buyer');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error logging in:', error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">Login</div>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <button
          onClick={handleLogin}
          // disabled={buttonDisabled}
          className="login-button"
        >
          {loading ? <TailSpin height={25} width={25} /> : 'Sign in'}
        </button>
        <div className="register-links">
          <p>New here? <Link to="/register">Sign Up!</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
