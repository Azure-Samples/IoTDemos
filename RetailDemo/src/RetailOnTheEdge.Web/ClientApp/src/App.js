// node_modules
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import "normalize.css";
import "./styles/global.scss";

// local components
import CartContextProvider from "./context/cartContext";
import Layout from "./components/Layout";
import SplashScreen from './components/SplashScreen';
import ShoppingCart from './pages/ShoppingCart';
import Reset from "./pages/Reset";
import Home from "./pages/Home";

function App() {

  const [displaySplashScreen, setDisplaySplashScreen] = useState(true);

  return (
    <Router>
      <CartContextProvider>
        <Layout>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/shopping-cart" exact component={ShoppingCart} />
            <Route path="/reset" exact component={props => <Reset setDisplaySplashScreen={setDisplaySplashScreen} {...props}/>} />
            <Route render={() => <Redirect to="/" />} />
          </Switch>
          <SplashScreen displaySplashScreen={displaySplashScreen} setDisplaySplashScreen={setDisplaySplashScreen}/>
        </Layout>
      </CartContextProvider>
    </Router>
  );
}

export default App;
