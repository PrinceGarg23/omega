import React, { useEffect, useState } from 'react';
import Sidebar from './BuySidebar';
import { auth } from '../../firebase';
import './BuyerDashboard.css';
import ProductDisplay from '../ProductDisplay';
import CartPage from '../CartPage';
import { Redirect } from 'react-router-dom';


function BuyerDashboard() {
  const [selectedSection, setSelectedSection] = useState('list-product');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        console.log(user.uid);
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);


  const renderSectionContent = () => {
    switch (selectedSection) {
      case 'display-product':
        return <ProductDisplay />;
      case 'cart':
        return <CartPage />;
      // Add more cases for other sections
      default:
        return null; // Default to no content
    }
  };

  return (
    <div className="dashboard-content">
      <Sidebar setSelectedSection={setSelectedSection} />
      <div className="main-content">
        {renderSectionContent()}
      </div>
    </div>
  );
}

export default BuyerDashboard;
