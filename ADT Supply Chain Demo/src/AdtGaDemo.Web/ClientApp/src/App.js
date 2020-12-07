// Node_modules
import React, { Component } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "normalize.css";
import "./styles/global.scss";
import "./styles/fonts.scss";

// Local components
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { RouteWithLayout } from "./components/RouteWithLayout";
import { Factory } from "./pages/Factory";
import { ADT } from "./services/adt";

export default class App extends Component {

  constructor(props) {
    super(props);
    this.adtService = new ADT();
    this.interval = null;
    this.state = {
      demoStage: 1,
      selectedOrder: null,
      demoIsLive: true,
      data: {
        pakistanFactoryData: this.adtService.getTwin("CA44210"),
        southAmericaFactoryData: this.adtService.getTwin("CA44220"),
        usRetailData: this.adtService.getTwin("CA4465879"),
        ukRetailData: this.adtService.getTwin("CA4461698"),
        atlanticOceanShipmentData: this.adtService.getTwin("CA44901-22"),
        indianOceanShipmentData: this.adtService.getTwin("CA91134-88"),
        factoryLinesData: this.adtService.getFactoryData()
      }
    };
  }

  setDemoStage = demoStage => this.setState({ demoStage });

  setDemoIsLive = demoIsLive => {
    if (demoIsLive) {
      this.initializeDataGeneration();
    } else {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.setState({ demoIsLive });
  }

  setSelectedOrder = selectedOrder => this.setState({ selectedOrder });

  setFactoryLinesData = lines => {
    const { data } = this.state;
    data.factoryLinesData = lines;
    this.setState({ data });
  }

  componentDidMount() {
    this.initializeDataGeneration();
  }

  initializeDataGeneration = () => {
    if (this.interval === null) {
      this.interval = setInterval(() => {
        const { data } = this.state;
        Object.keys(data).forEach(key => {
          if (data[key].liveValues) {
            data[key].liveValues.forEach(v => {
              const plusOrMinus = Math.random() < 0.5 ? -1 : 1;
              const fluctuation = plusOrMinus * Math.random();
              const newVal = parseFloat(data[key][v.title]) + fluctuation;
              if (v.min < newVal && newVal < v.max) {
                data[key][v.title] = newVal.toFixed(1);
              }
            });
          }
        });
        data.factoryLinesData.forEach(line => {
          line.assets.forEach(a => {
            if (a.liveValues) {
              a.liveValues.forEach(v => {
                const plusOrMinus = Math.random() < 0.5 ? -1 : 1;
                const fluctuation = plusOrMinus * Math.random();
                const newVal = parseFloat(a[v.title]) + fluctuation;
                console.log(newVal < v.max);
                if (v.min < newVal && newVal < v.max) {
                  a[v.title] = newVal.toFixed(1);
                  console.log(newVal);
                }
              });
            }
          });
        });
        data.atlanticOceanShipmentData.estimatedtimeofarrival.subtract("2", "seconds");
        data.indianOceanShipmentData.estimatedtimeofarrival.subtract("2", "seconds");
        this.setState({ data });
      }, 2000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const { demoStage, selectedOrder, data, demoIsLive } = this.state;
    return (
      <Router>
        <RouteWithLayout component={Dashboard} componentProps={{ demoStage, setDemoStage: this.setDemoStage, selectedOrder, setSelectedOrder: this.setSelectedOrder, data, demoIsLive, setDemoIsLive: this.setDemoIsLive }} layout={Layout} layoutProps={{ setDemoStage: this.setDemoStage, demoStage, showTopBar: true, demoIsLive, isDashboard: true }} path="/" exact />
        <RouteWithLayout component={Factory} componentProps={{ setDemoStage: this.setDemoStage, selectedOrder, data, setFactoryLinesData: this.setFactoryLinesData, setDemoIsLive: this.setDemoIsLive, demoIsLive }} layout={Layout} layoutProps={{ setDemoStage: this.setDemoStage, showTopBar: false, demoIsLive }} path="/factory" exact />
      </Router>
    );
  }

}
