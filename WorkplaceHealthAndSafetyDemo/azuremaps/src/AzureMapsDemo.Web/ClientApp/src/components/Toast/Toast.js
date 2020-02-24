import React, { Component } from 'react'
import './Toast.scss';
import WarningIcon from './assets/WarningIcon.svg';
import ReminderIcon from './assets/ReminderIcon.svg';

export default class Toast extends Component {
  render() {
    const { type, title, text, clickHandler } = this.props;
    return (
      <div className={`Toast ${type}`} onClick={clickHandler}>
        <div className="icon">
          <div className="icon-wrap">
            <img src={type === 'reminder' ? ReminderIcon : WarningIcon} alt="alert" />
          </div>
        </div>
        <div className="warning">
          <h3>{title}</h3>
          <span>{text}</span>
        </div>
      </div>
    )
  }
}
