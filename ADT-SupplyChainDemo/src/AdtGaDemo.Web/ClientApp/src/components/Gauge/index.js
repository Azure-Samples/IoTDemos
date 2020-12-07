import React from "react";
import "./Gauge.scss";

export const Gauge = ({ value = 0, min, max, isPercentage = true}) => (
  <div className="gauge">
    <div className="box gauge--1">
      <div className="mask">
        <div className="semi-circle" />
        <div
          className="semi-circle--mask"
          style={{
            transform: `rotate(${value * 1.8}deg) translate3d(0, 0, 0)`
          }}
        />
        {min && (
          <div
            className="semi-circle--mask min"
            style={{
              transform: `rotate(${min * 1.8}deg) translate3d(0, 0, 0)`
            }}
          />
        )}
        {max && (
          <div
            className="semi-circle--mask min"
            style={{
              transform: `rotate(${max * 1.8}deg) translate3d(0, 0, 0)`
            }}
          />
        )}
        <div className="percentage">{value}{isPercentage ? "%" : ""}</div>
      </div>
    </div>
  </div>
);
