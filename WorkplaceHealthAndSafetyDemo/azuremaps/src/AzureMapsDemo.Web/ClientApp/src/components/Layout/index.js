// node_modules
import React from "react";
import { Link } from "react-router-dom";

// local imports
import "./Layout.scss";

export const Layout = ({ children }) => (
  <>
    <header>
      <nav>
        <ul>
          <li>
            <Link to="/home">Home</Link>
          </li>
          <li>
            <Link to="/sample-data">Sample data</Link>
          </li>
          <li>
            <Link to="/sample-data-hooks">Sample data with hooks</Link>
          </li>
        </ul>
      </nav>
    </header>
    <main>{children}</main>
    <footer />
  </>
);
