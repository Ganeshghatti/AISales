import React from "react";
import "./Panel.scss";
import { Link } from "react-router-dom";

export default function Panel() {
  return (
    <div className="flex flex-col w-1/5 md:fixed items-end gap-6" id="Panel">
      <div
        className="w-full flex items-center justify-center py-4 h-24"
        style={{ borderBottom: "1px solid #B0BBC9" }}
      >
        <img src="/public\Assets\Images\logo2.png" alt="" />
      </div>

      <div className="flex flex-col gap-4 w-3/4">
        <p className="title">Dashboard</p>
        <div className="flex flex-col gap-4">
          <Link to="/single-call">
            <div className="gap-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <circle cx="6" cy="6" r="5.5" fill="#1A518A" stroke="#1E66AB" />
              </svg>
              <p className="menu-item">Send a Call</p>
            </div>
          </Link>
          <Link to="/bulk-call">
            <div className="gap-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <circle cx="6" cy="6" r="5.5" fill="#1A518A" stroke="#1E66AB" />
              </svg>
              <p className="menu-item">Bulk Call</p>
            </div>
          </Link>
          <Link to="/call-log">
            <div className="gap-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <circle cx="6" cy="6" r="5.5" fill="#1A518A" stroke="#1E66AB" />
              </svg>
              <p className="menu-item">Call Log</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
