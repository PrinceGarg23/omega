import React, { useState } from 'react';
import { auth, firestore } from '../../firebase';
import { useNavigate, Link } from 'react-router-dom';
import './register.css';

function Register() {
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleRegistration = async () => {
    // Implement your registration logic here
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      const userDocRef = firestore.collection('users').doc(user.uid);
      await userDocRef.set({
        category,
        name,
        // Other user data you want to store
      });

      // Now you can navigate the user to their dashboard
      if (category === 'buyer') {
        navigate('/dashboard/buyer');
      } else if (category === 'seller') {
        navigate('/dashboard/seller');
      }


    } catch (error) {
      console.error('Error registering user:', error.message);
    }



    console.log('Registration clicked');
    console.log('Category:', category);
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">Register</div>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="register-input"
        />
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="register-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="register-input"
        />
        <select
          onChange={(e) => setCategory(e.target.value)}
          className="register-input"
        >
          <option value="" disabled>Select User Type</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>
        <button
          onClick={handleRegistration}
          // disabled={buttonDisabled}
          className="register-button"
        >Sign Up!
          {/* {loading ? <Loader type="TailSpin" color="#111" height={16} width={16} /> : 'Register'} */}
        </button>
        <div className="register-links">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
