// node_modules
import React, { Component } from 'react';
import './Register.scss';
import Logo from './assets/MicrosoftLogo.svg';
import Header from './assets/Header.jpg';
import Header2 from './assets/Header2.jpg';
import StartOver from './assets/StartOver.svg';

import { registerUser, updateUserGeolocation, removeUser, userExists } from '../../api/map';
import Loader from '../../components/Loader';

const uuidv4 = require('uuid/v4');

export class Register extends Component {
    state = {
        id: '',
        name: '',
        error: false,
        lat: null,
        lon: null,
        userIsRegistered: false
    }

    componentDidMount() {
        this.checkForLocalUser();
        this.requestPosition();
    }

    async checkForLocalUser() {
        const userId = localStorage.getItem('userId');
        if (userId) {
            const exists = await userExists(userId);
            if (exists) {
                this.setState({ userIsRegistered: true, id: userId });
            }
        }
    }

    requestPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.setState({ lat: position.coords.latitude, lon: position.coords.longitude })
            });
        }
    }

    submit = async () => {
        const { name, lat, lon } = this.state;
        if(name !== '') {
            this.setState({ error: false });
            if (lat && lon) {
                const id = uuidv4();
                const registeredUser = await registerUser(id, name, lat, lon);
                if (registeredUser) {
                    localStorage.setItem('userId', id);
                    this.setState({ sent: true, name: '', id, userIsRegistered: true });
                }
            } else {
                this.requestPosition();
            }
        } else {
            this.setState({ error: true });
        }
    }

    async moveUser(direction) {
        const { id } = this.state;
        const hasUpdatedLocation = await updateUserGeolocation(id, direction);
        if(!hasUpdatedLocation) {
            window.location.reload();
        }
    }

    startOver = async () => {
        const { id } = this.state;
        const removed = await removeUser(id);
        if (removed) {
            localStorage.setItem('userId', null);
            this.setState({ userIsRegistered: false });
        }
    }

    render() {
        const { name, userIsRegistered } = this.state;
        return (
            <div className="Register">
                <nav>
                    <img src={Logo} alt="logo" />
                </nav>
                <header>
                    <img src={window.innerWidth > 1006 ? Header : Header2} alt="header" />
                    <h1>Azure Maps Demo</h1>
                </header>
                <main>
                    <div className="wrap">
                        { !userIsRegistered ?
                            <div className="input-box">
                                <div className="inner-box">
                                    <h3>Enter your name</h3>
                                    <input type="text" value={name} onChange={(e) => {this.setState({ name: e.target.value })}} />
                                    <button onClick={this.submit}>Submit</button>
                                    {this.state.error ? <span className="error">* Please fill out your name</span> : null}
                                </div>
                            </div>
                        :
                            <div className="user-controls">
                                <div className="input-box transmitting">
                                    <div className="inner-box">
                                        <div>Device transmitting</div>
                                        <Loader />
                                    </div>
                                </div>
                                <div className="input-box">
                                    <div className="inner-box controls">
                                        <div className="title">Adjust position</div>
                                        <svg id="DirectionalControls" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                                            <title>DirectionalPad</title>
                                            <path id="Up-BG" onClick={() => {this.moveUser('North') }} className="cls-1" d="M62.29,28.21l-9.24,9.56a4.25,4.25,0,0,1-6.1,0l-9.24-9.56a4.25,4.25,0,0,1-1.2-3v-21A4.25,4.25,0,0,1,40.76,0H59.24a4.25,4.25,0,0,1,4.25,4.25v21A4.25,4.25,0,0,1,62.29,28.21Z"/>
                                            <path id="Left-Background" onClick={() => {this.moveUser('West')}} className="cls-1" d="M28.21,37.71,37.77,47a4.25,4.25,0,0,1,0,6.1l-9.56,9.24a4.25,4.25,0,0,1-3,1.2h-21A4.25,4.25,0,0,1,0,59.24V40.76a4.25,4.25,0,0,1,4.25-4.25h21A4.25,4.25,0,0,1,28.21,37.71Z"/>
                                            <path id="Right-Background" onClick={() => {this.moveUser('East')}} className="cls-1" d="M71.79,62.29l-9.56-9.24a4.25,4.25,0,0,1,0-6.1l9.56-9.24a4.25,4.25,0,0,1,3-1.2h21A4.25,4.25,0,0,1,100,40.76V59.24a4.25,4.25,0,0,1-4.25,4.25h-21A4.25,4.25,0,0,1,71.79,62.29Z"/>
                                            <path id="Down-Background" onClick={() => {this.moveUser('South')}} className="cls-1" d="M37.71,71.79,47,62.23a4.25,4.25,0,0,1,6.1,0l9.24,9.56a4.25,4.25,0,0,1,1.2,3v21A4.25,4.25,0,0,1,59.24,100H40.76a4.25,4.25,0,0,1-4.25-4.25v-21A4.25,4.25,0,0,1,37.71,71.79Z"/>
                                            <polygon id="Up-Arrow" onClick={() => {this.moveUser('North') }} className="cls-2" points="54.37 18.3 50 13.93 45.63 18.3 43.98 16.66 50 10.64 56.02 16.66 54.37 18.3"/>
                                            <polygon id="Left-Arrow" onClick={() => {this.moveUser('West')}} className="cls-2" points="16.66 56.02 10.64 50 16.66 43.98 18.3 45.63 13.93 50 18.3 54.37 16.66 56.02"/>
                                            <polygon id="Right-Arrow" onClick={() => {this.moveUser('East')}} className="cls-2" points="83.34 56.02 81.7 54.37 86.07 50 81.7 45.63 83.34 43.98 89.36 50 83.34 56.02"/>
                                            <polygon id="Down-Arrow" onClick={() => {this.moveUser('South')}} className="cls-2" points="50 89.36 43.98 83.34 45.63 81.7 50 86.07 54.37 81.7 56.02 83.34 50 89.36"/>
                                        </svg>
                                    </div>
                                </div>
                                <button className="start-over" onClick={this.startOver}><img src={StartOver} alt="start over" />Start Over</button>
                            </div>
                        }
                    </div>
                </main>
                <footer>
                    <h4>Microsoft</h4>
                    <span>© 2019 Microsoft</span>
                </footer>
            </div>
        )
    }
}