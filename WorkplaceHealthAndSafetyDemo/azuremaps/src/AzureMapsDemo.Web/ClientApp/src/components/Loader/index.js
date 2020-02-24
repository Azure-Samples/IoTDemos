import React, { Component } from 'react'
import './Loader.scss';

export default class Loader extends Component {
  render() {
    return (
      <div className="Loader">
        <div className="ball-loader">
          <div className="ball-loader-ball ball1"></div>
          <div className="ball-loader-ball ball2"></div>
          <div className="ball-loader-ball ball3"></div>
        </div>
      </div>
    )
  }
}
