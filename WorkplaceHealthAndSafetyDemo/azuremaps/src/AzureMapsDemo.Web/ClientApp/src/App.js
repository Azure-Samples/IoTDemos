// node_modules
import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "normalize.css";
import "./styles/global.scss";

// local components
import { Map } from "./pages/Map";
import { Register } from "./pages/Register";

function App() {
  return (
    <Router>
      <Route path="/" exact component={Map} />
      <Route path="/register" exact component={Register} />
    </Router>
  );
}

export default App;
