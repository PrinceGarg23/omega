import React, { useState } from 'react';
import { auth, firestore } from '../../firebase';
import { useNavigate, Link } from 'react-router-dom';
import Web3 from 'web3';
import LoyaltyToken from '../../contracts/LoyaltyToken.json';
import './register.css';

function Register() {
  const web3 = new Web3(window.ethereum);
  const contractAddress = '0x34d3aEA61363c9328C8f75dAE13afa80d1220b8c';
  const loyaltyTokenContract = new web3.eth.Contract(LoyaltyToken.abi, contractAddress);



  const [category, setCategory] = useState('buyer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  // const [tokenHistory, setTokenHistory] = useState([]);
  // const [address, setAddress] = useState('');

  const navigate = useNavigate();
  // const fetchUserData = async (userId) => {
  //   try {
  //     const userRef = firestore.collection('users').doc(userId);
  //     await userRef.get().then((doc) => {
  //       if (doc.exists) {
  //         setTokenHistory(doc.data().rewardHistory || []);
  //         setAddress(doc.data().ethereumAddress || '');
  //       }
  //       console.log(doc.data().rewardHistory);
  //     });
  //   } catch (error) {
  //     console.error('Error fetching user data:', error);
  //   }
  // }

  const addRewardHistoryEntry = async (customerId, rewardAmount) => {
    try {
      console.log(customerId);
      const userRef = firestore.collection('users').doc(customerId);
      console.log(userRef);
      const userDoc = await userRef.get();
      console.log(userDoc);

      if (userDoc.exists) {
        const currentRewardHistory = userDoc.data().rewardHistory || []; // Default to an empty array
        const address = userDoc.data().ethereumAddress || '';

        const accounts = await web3.eth.getAccounts();
        const userAddress = accounts[0];
        loyaltyTokenContract.methods.rewardBuyerWithPredefinedAmount(address, 50).send({
          from: userAddress,
        });

        // Add the new reward entry to the history
        const newRewardEntry = {
          rewardAmount: rewardAmount,
          rewardDate: new Date(),
          product: "Referral"
        };
        const updatedRewardHistory = [...currentRewardHistory, newRewardEntry];

        // Update the user document with the updated reward history
        await userRef.update({ rewardHistory: updatedRewardHistory });
        console.log('Referred and awarded tokens successfully');
        console.log('Reward history entry added to user document successfully');
        // ... (rest of the code)
      } else {
        console.error(`User document with ID ${customerId} does not exist`);
      }

    } catch (error) {
      console.error('Error adding reward history entry to user document:', error);
    }
  };
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
      if (referralCode) {
        addRewardHistoryEntry(referralCode, 50);
        // const accounts = await web3.eth.getAccounts();
        // const userAddress = accounts[0];
        // console.log(referralCode);

        // const userRef = firestore.collection('users').doc(referralCode);
        // const doc = await userRef.get();
        // if (doc.exists) {
        //   setTokenHistory(doc.data().rewardHistory || []);
        //   setAddress(doc.data().ethereumAddress || '');
        //   console.log(doc.data().rewardHistory);
        // }
        // await fetchUserData(referralCode);
        // console.log(tokenHistory);
        // console.log(address);


        // loyaltyTokenContract.methods.rewardBuyerWithPredefinedAmount(address, 50).send({
        //   from: userAddress,
        // });
        // await fetchUserData(referralCode);
        // console.log("Before: ", history);
        // const rewardEntry = {
        //   rewardDate: new Date(),
        //   rewardAmount: 50,
        //   product: "Referral",
        // };
        // const updatedRewardHistory = [...tokenHistory, rewardEntry];
        // await firestore.collection('users').doc(referralCode).update({
        //   rewardHistory: updatedRewardHistory,
        // });
        // await fetchUserData(referralCode);
        // console.log("After: ", updatedRewardHistory);
        // console.log('Referred and awarded tokens successfully');

      }
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
    // console.log('Category:', category);
    // console.log('Name:', name);
    // console.log('Email:', email);
    // console.log('Password:', password);
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
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>
        <input
          type="text"
          placeholder="Referral Code (Optional)"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className="register-input"
        />
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
