import React, { Component } from 'react';
import './Map.scss';
import { PolygonDrawingTool } from '../../utils/PolygonDrawingTool';
import { getConfig, getUsersLocations, createGeofence, getGeofence } from '../../api/map';
import Toast from '../../components/Toast/Toast';
import Logo from './assets/DemoLogo.png';
import BlueMarker from './assets/BlueMarker.svg';
import GreenMarker from './assets/GreenMarker.svg';
import GeofenceIcon from './assets/GeofenceIcon.svg';

const R_Key_Code = 82;

export class Map extends Component {
  constructor (props) {
    super(props);
    this.state = {
      config: {},
      showToast: false,
      toastType: 'reminder',
      toastTitle: '',
      toastText: '',
      geofenceExists: false,
      storedUsers: [],
      geofence: {}
    };
    this.center = { lat: 47.6133, long: -122.31398999999999 };
  }

  async componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    const config = await getConfig();
    const geofence = await getGeofence();
    const geofenceExists = geofence !== false;
    this.setState({ config, geofenceExists, geofence: geofenceExists ? geofence : {} }, this.setMap);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    clearInterval(this.usersPositionInterval);
  }

  handleKeyDown = (event) => {
    switch( event.keyCode ) {
        case R_Key_Code:
            window.open("register", "_blank")
            break;
        default: 
            break;
    }
  }

  checkEnterAndExitEvents = async (incomingUsers) => {
    const { storedUsers } = this.state;

    incomingUsers.forEach(user => {
      const oldUser = storedUsers.find(u => u.id === user.id);
      if (oldUser) {
        if (user.isInsideGeofence && !oldUser.isInsideGeofence) {
          this.setState({ showToast: true, toastType: 'warning', toastTitle: 'Warning', toastText: `${user.name} has entered the construction zone without authorization.` });
        } else {
          if (!user.isInsideGeofence && oldUser.isInsideGeofence) {
            this.setState({ showToast: true, toastType: 'reminder', toastTitle: 'Information', toastText: `${user.name} has left the construction zone.` });
          }
        }
      }
    });
  }

  checkUsersPositionChanges(incomingUsers) {
    const { storedUsers } = this.state;
    let positionChanges = false;
    incomingUsers.forEach(user => {
      const oldUser = storedUsers.find(u => u.id === user.id);
      if (oldUser && (oldUser.latitude !== user.latitude || oldUser.longitude !== user.longitude)) {
        positionChanges = true;
      }
    });
    return positionChanges;
  }

  addUserPinsToMap(users) {
    users.forEach((user) => {        
      const marker = new window.atlas.HtmlMarker({
        htmlContent: `<div class="map-pin-wrap">
          <img class="map-pin" src="${user.isReal ? GreenMarker : BlueMarker}" alt="pin" />
          <div class="id ${user.isReal ? 'green' : 'blue'}">${user.name}</div>
        </div>`,
        position: [user.longitude, user.latitude]
      });
      
      this.map.markers.add(marker);
      if (!this.hasCentered && user.isReal) {
        this.map.setCamera({
          center: [user.longitude, user.latitude]
        });
        this.hasCentered = true;
      }
    });
  }

  getUserPins = async () => {
    const { geofenceExists, storedUsers } = this.state;
    
    const users = await getUsersLocations();

    if (storedUsers.length > 0) {
      const clearOldPins = this.checkUsersPositionChanges(users) || storedUsers.length !== users.length;
      if (clearOldPins) {
        this.map.markers.clear();
      }
      if (geofenceExists) {
        this.checkEnterAndExitEvents(users);
      }
    }

    this.setState({ storedUsers: users });

    if (this.hasCentered && users.filter(u => u.isReal).length === 0) {
      this.map.setCamera({
        center: [this.center.long, this.center.lat]
      });
      this.hasCentered = false;
    }
    
    this.addUserPinsToMap(users);
  }

  listenForUserPositionChanges() {
    this.usersPositionInterval = setInterval(() => {
      this.getUserPins();
    }, 1000);
  }

  drawExistingGeofence(coordinates) {
    if (this.drawingTools) {
      this.drawingTools.clear();
    }
    this.dataSource = new window.atlas.source.DataSource();
    this.map.sources.add(this.dataSource);
    
    this.dataSource.add(new window.atlas.data.Feature(
      new window.atlas.data.Polygon(coordinates)
    ));

    this.map.layers.add(new window.atlas.layer.PolygonLayer(this.dataSource, null,{
      fillColor: 'rgba(255,165,0,0.2)'
    }));

    this.map.layers.add(new window.atlas.layer.LineLayer(this.dataSource, null, {
      strokeColor: 'orange',
      strokeWidth: 2
    }));
  }

  startDrawingNewGeofence = () => {
    if (this.dataSource) {
      this.setState({ geofenceExists: false });
      this.dataSource.clear();
    }
    this.drawingTools.startDrawing();
  }
  
  async setMap() {
    const { config, geofenceExists, geofence } = this.state;
      
    this.map = new window.atlas.Map('myMap', {
        center: [this.center.long, this.center.lat],
        zoom: 16,
        view: 'Auto',
        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: config.key
        }
    });
    
    this.hasCentered = false;
    
    this.map.events.add('ready', async () => {
        
      this.map.controls.add(new window.atlas.control.ZoomControl(), {
          position: 'top-right'
        });
        
        this.getUserPins();
        this.listenForUserPositionChanges();
        this.drawingTools = new PolygonDrawingTool(this.map, null, this.saveGeofence);
        
        if (geofenceExists) {
          if (geofence && geofence.features && geofence.features[0].geometry && geofence.features[0].geometry.coordinates) {
            this.drawExistingGeofence(geofence.features[0].geometry.coordinates);
          }
        }
    });
  }

  saveGeofence = async (polygon) => {
    if (polygon) {
      const created = await createGeofence(polygon.data.geometry.coordinates[0]);
      if (created) {
        this.setState({ geofenceExists: true });
      }
    }
  }

  render () {
    const { showToast, toastType, toastTitle, toastText } = this.state;
    return (
      <div className="Map">
        <div id="myMap"></div>
        <div className="left-panel">
          <img src={Logo} alt="demo logo" className="logo" />
          <button onClick={this.startDrawingNewGeofence} className="draw">
            <img src={GeofenceIcon} alt="set geofence" />
            <div className="text">Set Geofence</div>
          </button>
        </div>
        {showToast ? <Toast type={toastType} title={toastTitle} text={toastText} clickHandler={() => { this.setState({ showToast: false })}} /> : null}
      </div>
    );
  }
}