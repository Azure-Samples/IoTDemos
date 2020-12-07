import React from "react";
import CloseIcon from "../../assets/Icon-Close.svg";
import Svg from "react-inlinesvg";
import "./Popup.scss";

export const Popup = ({
  icon,
  title,
  id,
  onClose,
  children,
  position,
  width = "52vh",
  style,
  iconStyle,
  className
}) => (
  <div
    className={`popup ${className}`}
    style={{ top: position.top, left: position.left, width, ...style }}
  >
    {onClose && <Svg src={CloseIcon} className="close-icon" onClick={onClose} />}
    {title && <header>
      <div className="icon" style={{ ...iconStyle }}>
        <Svg src={icon} />
      </div>
      <div className="title">
        <h3>{title}</h3>
        <span>ID: {id}</span>
      </div>
    </header>}
    <div className="popup-content">{children}</div>
  </div>
);
