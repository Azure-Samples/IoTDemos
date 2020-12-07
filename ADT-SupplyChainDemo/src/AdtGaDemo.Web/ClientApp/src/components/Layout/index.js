// Node_modules
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Svg from "react-inlinesvg";
import moment from "moment";
import NavIcon1 from "../../assets/NavIcon1.svg";
import NavIcon2 from "../../assets/NavIcon2.svg";
import NavIcon3 from "../../assets/NavIcon3.svg";
import NavIcon4 from "../../assets/NavIcon4.svg";
import NavIcon5 from "../../assets/NavIcon5.svg";
import NavIcon6 from "../../assets/NavIcon6.svg";
import HistoryIcon from "../../assets/IconHistorical.svg";
import IconTee from "../../assets/Icon-Tee.svg";
import IconHat from "../../assets/Icon-Hat.svg";
import IconJacket from "../../assets/Icon-Jacket.svg";
import IconPants from "../../assets/Icon-Pants.svg";
import IconShoe from "../../assets/Icon-Shoe.svg";
import ContosoBrand from "../../assets/ContosoBrand.svg";
import TeamsNotification from "../../assets/TeamsNotification.svg";
import { ApiService } from "../../services/apiService";

// Local imports
import "./Layout.scss";

/* eslint max-lines-per-function : 0 */

export const Layout = ({ children, setDemoStage, demoStage, showTopBar = true, demoIsLive, isDashboard = false }) => {
  const [showTeamsToast, setShowTeamsToast] = useState(false);
  const [animateToastClose, setAnimateToastClose] = useState(false);
  const [topBarItemIsSelected, setTopBarItemIsSelected] = useState(false);
  const [time, setTime] = useState(moment().format("l LTS"));
  useEffect(() => {
    const handleKeyDown = e => {
      switch (e.keyCode) {
        case 32:
          setShowTeamsToast(true);
          break;
        case 68:
          ApiService.startSimulation();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    const timeInterval = setInterval(() => {
      setTime(moment().format("l LTS"));
    }, 1000);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(timeInterval);
    };
  }, [setShowTeamsToast]);

  if (!window.tsiData) {
    ApiService.getTsiData()
      .then(data => {
        window.tsiData = data;
      });
  }

  return (
    <div className="layout-wrap">
      <nav>
        <ul>
          <li className="logo">
            <a href="/" onClick={() => {
              window.location.reload();
            }}
            >
              <Svg src={ContosoBrand} />
            </a>
          </li>
          <li className="is-selected">
            <Link to="/">
              <Svg src={NavIcon1} />
              <span>World Map</span>
            </Link>
          </li>
          <li>
            <Link to="/">
              <Svg src={NavIcon2} />
              <span>Retail Data</span>
            </Link>
          </li>
          <li>
            <Link to="/">
              <Svg src={NavIcon3} />
              <span>Shipping Data</span>
            </Link>
          </li>
          <li>
            <Link to="/">
              <Svg src={NavIcon4} />
              <span>Financial Reports</span>
            </Link>
          </li>
          <li>
            <Link to="/">
              <Svg src={NavIcon5} />
              <span><div>IoT</div><div>Data</div></span>
            </Link>
          </li>
        </ul>
        <div className="settings">
          <Link to="/">
            <Svg src={NavIcon6} />
            <span>Settings</span>
          </Link>
        </div>
      </nav>
      <div className="main-content-area">
        {showTopBar && <div className="top-bar">
          <div className="label">Filter by Product:</div>
          <div
            className={`top-bar-item ${topBarItemIsSelected ? "is-selected" : ""}`}
            onClick={() => {
              if (demoStage <= 2) {
                setDemoStage(topBarItemIsSelected ? 1 : 2);
                setTopBarItemIsSelected(!topBarItemIsSelected);
              }
            }}
          >
            <div className="item-image">
              <Svg src={IconTee} />
            </div>
            <span>Signature Tee</span>
          </div>
          <div className="top-bar-item">
            <div className="item-image">
              <Svg src={IconPants} />
            </div>
            <span>Zespy Pant</span>
          </div>
          <div className="top-bar-item">
            <div className="item-image">
              <Svg src={IconJacket} />
            </div>
            <span>Miro Bomber</span>
          </div>
          <div className="top-bar-item">
            <div className="item-image">
              <Svg src={IconShoe} />
            </div>
            <span>Alt Kicks</span>
          </div>
          <div className="top-bar-item">
            <div className="item-image">
              <Svg src={IconHat} />
            </div>
            <span>Fresh Lid</span>
          </div>
        </div>}
        <main style={{ maxHeight: showTopBar ? "calc(100vh - 180px)" : "calc(100vh - 40px)" }}>{children}</main>
        <div className={`timer ${isDashboard ? "dashboard" : ""} ${demoIsLive ? "" : "history"}`}>
          <Svg src={HistoryIcon} />
          {demoIsLive ? time : demoStage > 3 ? "IMPACT ASSESSMENT" : "Order# 442-12448"}
        </div>
      </div>
      {showTeamsToast && (
        <div
          className="teams-toast"
          style={{ opacity: animateToastClose ? 0 : 1}}
          onClick={() => {
            setAnimateToastClose(true);
            setTimeout(() => {
              setShowTeamsToast(false);
              setAnimateToastClose(false);
            }, 500);
          }}
        >
          <Svg src={TeamsNotification} />
        </div>
      )}
    </div>
  );
};
