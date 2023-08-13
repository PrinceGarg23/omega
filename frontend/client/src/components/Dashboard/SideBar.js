// components/Sidebar.js
import React from 'react';
import './Sidebar.css'; // Import the CSS file

function Sidebar({ setSelectedSection }) {
    return (
        <div className="sidebar">
            <h3>Seller Dashboard</h3>
            <ul>
                <li>
                    <button onClick={() => setSelectedSection('list-product')}>List Product</button>
                </li>
                {/* Add more buttons for other features */}
            </ul>
        </div>
    );
}

export default Sidebar;
