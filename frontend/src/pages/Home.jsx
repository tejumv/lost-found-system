import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Background Overlay */}
      <div className="background-overlay"></div>

      {/* Top Bar with Logo, Theme, and Settings */}
      <div className="top-bar">
        {/* Left Top: Logo Placeholder */}
        <div className="clg-logo-placeholder">
          {/* ACTION REQUIRED: 
            Replace "YOUR_LOGO_IMAGE_PATH_HERE.png" with the actual path 
            to your college logo image file. 
            
            Example if your logo is in 'public/logo.png': src="/logo.png"
            Example if your logo is in 'src/assets/logo.png' and Home.jsx is in 'src/pages': src="../assets/logo.png"
          */}
          <img 
            src="src\pages\idRhhe7nrF_1763398090675.png" // <--- **UPDATE THIS PATH**
            alt="KLE Tech Logo" 
            className="logo-image" 
          />
        </div>

        {/* Right Top: Utility Icons */}
        <div className="utility-icons">
          {/* Placeholder for Theme Selector (Light/Dark/Custom) */}
          <div className="theme-selector" title="Theme">
            <span className="theme-text">Theme</span>
          </div>

          {/* Settings Icon Placeholder */}
          <div className="settings-placeholder" title="Settings"></div>
        </div>
      </div>

      {/* Main Content Area (Single column and centered) */}
      <main className="main-content-single-column">
        
        {/* Main Content Block (Centered) */}
        <div className="center-content-block">
            {/* Title */}
            <h1 className="main-title">Lost and Found System</h1>

            {/* Sub-Description */}
            <p className="sub-description">
                An advanced platform for efficiently managing and recovering lost and found items 
                within KLE Technological University, ensuring a secure and streamlined process.
            </p>

            {/* Get Started Card (Moved to the center below the description) */}
            <div className="get-started-card center-card">
                <h2>Get Started</h2>
                <p className="card-description">
                    Access the Lost & Found dashboard to manage your reports, track items, and
                    securely claim your property with ease.
                </p>
                {/* Action Buttons */}
                <button className="login-button">Search for an Item</button>
                <button className="create-account-button">Report a Lost Item</button>
            </div>
        </div>
      </main>
    </div>
  );
};

export default Home;