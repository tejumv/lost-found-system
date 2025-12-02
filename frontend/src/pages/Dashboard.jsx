import React from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";
import Footer from "../components/Footbar";
import Image2 from "../assets/img2.jpg"
import Watch from "../assets/watch.jpg"

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dash-wrapper">
        <div className="dash-content">
          <h1 className="dash-title">
            Find & Recover <br /> <span>With Ease</span>
          </h1>

          <p className="dash-sub">
            Experience effortless searching & reporting for lost and found items.
          </p>

          <div className="dash-buttons">
            <button className="btn-lost">Search an Item</button>
            <Link to="/report-item">
              <button className="btn-found">Report Lost/Found Item</button>
            </Link>
          </div>
        </div>

        <div className="dash-cards">
          <div className="dash-card">
            <img src={Watch} alt="" />
            <p>A dedicated place for people to look for and reclaim their misplaced possessions.</p>
          </div>

          <div className="dash-card">
            <img src={Image2} alt="Found Items" />
            <p>Enhances security by providing a secure, accountable process for handling items.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;