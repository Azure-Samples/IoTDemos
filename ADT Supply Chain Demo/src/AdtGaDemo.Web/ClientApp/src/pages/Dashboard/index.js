// Node_modules
import React, { useState } from "react";
import moment from "moment";
import "./Dashboard.scss";
import Svg from "react-inlinesvg";
import { Gauge } from "../../components/Gauge";
import { Map } from "./components/Map";
import { Popup } from "../../components/Popup";
import ShipmentIcon from "../../assets/Transport-Ship.svg";
import RetailIcon from "../../assets/Shop.svg";
import FactoryIcon from "../../assets/Factory.svg";
import BackIcon from "../../assets/Icon-Back.svg";
import OrderIcon from "../../assets/OrderIcon.svg";
import { withRouter } from "react-router-dom";
import { productIcons } from "../../services/icons";

export const Dashboard = withRouter(
  ({
    demoStage,
    history,
    selectedOrder,
    setSelectedOrder,
    data,
    setDemoIsLive,
    demoIsLive,
    setDemoStage
  }) => {
    const {
      pakistanFactoryData,
      southAmericaFactoryData,
      atlanticOceanShipmentData,
      indianOceanShipmentData,
      usRetailData,
      ukRetailData
    } = data;

    const [showPakistanFactoryPopup, setShowPakistanFactoryPopup] = useState(
      false
    );
    const [showSouthAmericaFactoryPopup, setShowSouthAmericaFactoryPopup] = useState(false);
    const [showAtlanticOceanShipmentPopup, setShowAtlanticOceanShipmentPopup] = useState(false);
    const [showIndianOceanShipmentPopup, setShowIndianOceanShipmentPopup] = useState(false);
    const [showUSRetailPopup, setShowUSRetailPopup] = useState(false);
    const [showUKRetailPopup, setShowUKRetailPopup] = useState(false);
    const [showGaugeData, setShowGaugeData] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);

    const resetPopups = () => {
      setShowPakistanFactoryPopup(false);
      setShowSouthAmericaFactoryPopup(false);
      setShowAtlanticOceanShipmentPopup(false);
      setShowIndianOceanShipmentPopup(false);
      setShowUSRetailPopup(false);
      setShowUKRetailPopup(false);
      setShowGaugeData(false);
      setSelectedAsset(null);
    };

    return (
      <div className="main-content-wrap">
        <Map
          stage={demoStage}
          onShowPakistanFactoryPopup={() => {
            resetPopups();
            setShowPakistanFactoryPopup(true);
            setSelectedAsset("pakistan-factory");
            setTimeout(() => {
              setShowGaugeData(true);
            }, 200);
          }}
          onShowSouthAmericaFactoryPopup={() => {
            resetPopups();
            setShowSouthAmericaFactoryPopup(true);
            setSelectedAsset("south-america-factory");
            setTimeout(() => {
              setShowGaugeData(true);
            }, 200);
          }}
          onShowAtlanticOceanShipmentPopup={() => {
            resetPopups();
            setShowAtlanticOceanShipmentPopup(true);
            setSelectedAsset("atlantic-ocean-shipment");
            setTimeout(() => {
              setShowGaugeData(true);
            }, 200);
          }}
          onShowIndianOceanShipmentPopup={() => {
            resetPopups();
            setShowIndianOceanShipmentPopup(true);
            setSelectedAsset("indian-ocean-shipment");
            setTimeout(() => {
              setShowGaugeData(true);
            }, 200);
          }}
          handleUSStoreClick={() => {
            resetPopups();
            setShowUSRetailPopup(true);
            setSelectedAsset("us-retail");
          }}
          handleUKStoreClick={() => {
            resetPopups();
            setShowUKRetailPopup(true);
            setSelectedAsset("uk-retail");
          }}
          selectedAsset={selectedAsset}
        >
          {showPakistanFactoryPopup && (
            <Popup
              icon={FactoryIcon}
              title="Twin Type: Factory"
              id={pakistanFactoryData.id}
              onClose={() => {
                setShowPakistanFactoryPopup(false);
                setShowGaugeData(false);
                setSelectedAsset(null);
              }}
              position={
                demoStage > 3
                  ? {
                    top: "29%",
                    left: "50.6%",
                  }
                  : {
                    top: "26%",
                    left: "30.6%",
                  }
              }
              width={demoStage > 3 ? "39vh" : "52vh"}
              style={{ paddingBottom: 0 }}
              className={demoStage > 3 ? "impacted" : ""}
            >
              {demoStage <= 3 ? (
                <>
                  <div style={{ paddingBottom: 20 }}>
                    <div className="gauge">
                      <Gauge
                        value={
                          showGaugeData ? pakistanFactoryData.efficiency : 0
                        }
                        max={pakistanFactoryData.maxEfficiency}
                      />
                      <div className="title">
                        {demoIsLive ? "Efficiency" : "AVG Efficiency"}
                      </div>
                    </div>
                    <div className="value-wrap">
                      <div className="value">
                        {pakistanFactoryData.openorders}
                      </div>
                      <div className="title">Open Orders</div>
                    </div>
                    <div className="gauge">
                      <Gauge
                        value={
                          showGaugeData ? pakistanFactoryData.reliability : 0
                        }
                        max={pakistanFactoryData.maxReliability}
                      />
                      <div className="title">
                        {demoIsLive ? "Reliability" : "AVG Reliability"}
                      </div>
                    </div>
                  </div>
                  <div style={{ flexDirection: "column" }}>
                    <div className="orders">
                      <div className="flex space-between v-align">
                        <h4>Recent orders:</h4>
                        <div className="link">SEE ALL</div>
                      </div>
                      {southAmericaFactoryData.recentOrders.map(o => (
                        <div key={o.id} className="order selectable">
                          <div className="icon">
                            <Svg src={OrderIcon} />
                          </div>
                          <h5>Order# {o.id}</h5>
                          <div className="products" style={{ marginRight: 15 }}>
                            {o.products.map((p, i) => (
                              <Svg src={productIcons[p]} key={p + i} />
                            ))}
                          </div>
                          <div className="date">
                            {o.date}
                          </div>
                          <div className="status">
                            Status: {o.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    className="button-full-width"
                    onClick={() => {
                      setSelectedOrder(null);
                      setDemoIsLive(true);
                      history.push("/factory");
                    }}
                  >
                    <span>View Factory</span>
                  </div>
                </>
              ) : (
                <div
                  className="button-full-width"
                  onClick={() => {
                    setDemoIsLive(true);
                    setDemoStage(5);
                    setShowPakistanFactoryPopup(false);
                    setShowGaugeData(false);
                    setSelectedAsset(null);
                  }}
                >
                  <span>Stop Line</span>
                </div>
              )}
            </Popup>
          )}
          {showSouthAmericaFactoryPopup && (
            <Popup
              icon={FactoryIcon}
              title="Twin Type: Factory"
              id={southAmericaFactoryData.id}
              onClose={() => {
                setShowSouthAmericaFactoryPopup(false);
                setShowGaugeData(false);
                setSelectedAsset(null);
              }}
              position={{
                top: "22%",
                left: "7.6%",
              }}
              width="52vh"
              style={{ paddingBottom: 0 }}
            >
              <div style={{ paddingBottom: 20 }}>
                <div className="gauge">
                  <Gauge
                    value={
                      showGaugeData ? southAmericaFactoryData.efficiency : 0
                    }
                    max={southAmericaFactoryData.maxEfficiency}
                  />
                  <div className="title">Efficiency</div>
                </div>
                <div className="value-wrap">
                  <div className="value">
                    {southAmericaFactoryData.openorders}
                  </div>
                  <div className="title">Open Orders</div>
                </div>
                <div className="gauge">
                  <Gauge
                    value={
                      showGaugeData ? southAmericaFactoryData.reliability : 0
                    }
                    max={southAmericaFactoryData.maxReliability}
                  />
                  <div className="title">Reliability</div>
                </div>
              </div>
              <div style={{ flexDirection: "column" }}>
                <div className="orders">
                  <div className="flex space-between v-align">
                    <h4>Recent orders:</h4>
                    <div className="link">SEE ALL</div>
                  </div>
                  {southAmericaFactoryData.recentOrders.map(o => (
                    <div key={o.id} className="order selectable">
                      <div className="icon">
                        <Svg src={OrderIcon} />
                      </div>
                      <h5>Order# {o.id}</h5>
                      <div className="products" style={{ marginRight: 15 }}>
                        {o.products.map((p, i) => (
                          <Svg src={productIcons[p]} key={p + i} />
                        ))}
                      </div>
                      <div className="date">
                        {o.date}
                      </div>
                      <div className="status">
                        Status: {o.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="button-full-width">
                <span>View Factory</span>
              </div>
            </Popup>
          )}
          {showAtlanticOceanShipmentPopup && (
            <Popup
              icon={ShipmentIcon}
              title="Twin Type: Shipment"
              id={atlanticOceanShipmentData.id}
              onClose={() => {
                setShowAtlanticOceanShipmentPopup(false);
                setShowGaugeData(false);
                setSelectedAsset(null);
              }}
              position={{
                top: "40%",
                left: "14.2%",
              }}
              style={{ paddingBottom: 0 }}
            >
              <div style={{ paddingBottom: 5 }}>
                <div className="gauge">
                  <Gauge
                    value={
                      showGaugeData ? atlanticOceanShipmentData.humidity : 0
                    }
                    min={atlanticOceanShipmentData.minHumidity}
                    max={atlanticOceanShipmentData.maxHumidity}
                  />
                  <div className="title">
                    {demoIsLive ? "Humidity" : "AVG Humidity"}
                  </div>
                </div>
                <div className="twin-data">
                  {demoIsLive ? (
                    <>
                      <div>
                        <div className="property-title">ETA:</div>
                        <div className="property-value">
                          {atlanticOceanShipmentData.estimatedtimeofarrival.format("l LTS")}
                        </div>
                      </div>
                      <div>
                        <div className="property-title">Status:</div>
                        <div className="property-value">
                          {atlanticOceanShipmentData.status
                            ? atlanticOceanShipmentData.status
                            : "On time"}
                        </div>
                      </div>
                      <div>
                        <div className="property-title">Location:</div>
                        <div className="property-value">
                          {atlanticOceanShipmentData.location
                            ? atlanticOceanShipmentData.location
                            : "39.5771, -40.1922"}
                        </div>
                      </div>
                      <div>
                        <div className="property-title">Temp:</div>
                        <div className="property-value">
                          {atlanticOceanShipmentData.temperature}
                          {atlanticOceanShipmentData.temperature ? "°F" : ""}
                          <span className="property-info">(Max 100.8°F)</span>
                        </div>
                      </div>
                      <div>
                        <div className="property-title">Vibration:</div>
                        <div className="property-value">
                          {atlanticOceanShipmentData.vibration}
                          {atlanticOceanShipmentData.vibration ? "Hz" : ""}
                          <span className="property-info">(Max 160.5Hz)</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="property-title">Delivered On:</div>
                        <div className="property-value">
                          {moment()
                            .subtract("3", "days")
                            .subtract("1", "hours")
                            .format("l LTS")}
                        </div>
                      </div>
                      <div>
                        <div className="property-title">Status:</div>
                        <div className="property-value">Delivered</div>
                      </div>
                      <div>
                        <div className="property-title">AVG Temp:</div>
                        <div className="property-value">
                          {atlanticOceanShipmentData.temperature}
                          {atlanticOceanShipmentData.temperature ? "°F" : ""}
                        </div>
                      </div>
                      <div>
                        <div className="property-title">AVG Vibration:</div>
                        <div className="property-value">
                          {atlanticOceanShipmentData.vibration}
                          {atlanticOceanShipmentData.vibration ? "Hz" : ""}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="button-full-width">
                <span>View Shipment</span>
              </div>
            </Popup>
          )}
          {showIndianOceanShipmentPopup && (
            <Popup
              icon={ShipmentIcon}
              title="Twin Type: Shipment"
              id={indianOceanShipmentData.id}
              onClose={() => {
                setShowIndianOceanShipmentPopup(false);
                setShowGaugeData(false);
                setSelectedAsset(null);
              }}
              position={{
                top: "45%",
                left: "49.2%",
              }}
              style={{ paddingBottom: 0 }}
            >
              <div style={{ paddingBottom: 5 }}>
                <div className="gauge">
                  <Gauge
                    value={
                      showGaugeData ? indianOceanShipmentData.humidity : 0
                    }
                    min={indianOceanShipmentData.minHumidity}
                    max={indianOceanShipmentData.maxHumidity}
                  />
                  <div className="title">Humidity</div>
                </div>
                <div className="twin-data">
                  <div>
                    <div className="property-title">ETA:</div>
                    <div className="property-value">
                      {indianOceanShipmentData.estimatedtimeofarrival.format("l LTS")}
                    </div>
                  </div>
                  <div>
                    <div className="property-title">Status:</div>
                    <div className="property-value">
                      {indianOceanShipmentData.status
                        ? indianOceanShipmentData.status
                        : "On time"}
                    </div>
                  </div>
                  <div>
                    <div className="property-title">Location:</div>
                    <div className="property-value">
                      {indianOceanShipmentData.location
                        ? indianOceanShipmentData.location
                        : "39.5771, -40.1922"}
                    </div>
                  </div>
                  <div>
                    <div className="property-title">Temp:</div>
                    <div className="property-value">
                      {indianOceanShipmentData.temperature}
                      {indianOceanShipmentData.temperature ? "°F" : ""}
                      <span className="property-info">(Max 100.8°F)</span>
                    </div>
                  </div>
                  <div>
                    <div className="property-title">Vibration:</div>
                    <div className="property-value">
                      {indianOceanShipmentData.vibration}
                      {indianOceanShipmentData.vibration ? "Hz" : ""}
                      <span className="property-info">(Max 160.5Hz)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="button-full-width">
                <span>View Shipment</span>
              </div>
            </Popup>
          )}
          {showUSRetailPopup && (
            <Popup
              icon={RetailIcon}
              title={selectedOrder ? null : "Twin Type: Retail"}
              id={usRetailData.id}
              onClose={
                selectedOrder
                  ? null
                  : () => {
                    setShowUSRetailPopup(false);
                    setSelectedAsset(null);
                  }
              }
              position={{
                top: selectedOrder ? "41%" : "33%",
                left: "7.20%",
              }}
              width="39vh"
              style={{
                paddingBottom: 0,
              }}
              className={demoStage > 3 ? "impacted" : ""}
            >
              {selectedOrder ? (
                <div className="selected-order">
                  <Svg
                    src={BackIcon}
                    className="back"
                    onClick={() => {
                      setSelectedOrder(null);
                    }}
                  />
                  <div className="order">
                    <div className="icon">
                      <Svg src={OrderIcon} />
                    </div>
                    <h5>Order# {selectedOrder.id}</h5>
                    <div className="products">
                      <span>Product Lines:</span>
                      {selectedOrder.products.map((p, i) => (
                        <Svg src={productIcons[p]} key={p + i} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ flexDirection: "column" }}>
                  <div className="retail-data">
                    <div>
                      <div className="value">
                        {demoStage > 3
                          ? usRetailData.impactedStock
                          : usRetailData.stock}
                      </div>
                      <span>
                        {demoStage > 3
                          ? "Estimated financial impact"
                          : "Stock levels"}
                      </span>
                    </div>
                    <div>
                      <div className="value">
                        {demoStage > 3
                          ? usRetailData.impactedOrders
                          : usRetailData.openOrders}
                      </div>
                      <span>
                        {demoStage > 3 ? "Impacted orders" : "Open orders"}
                      </span>
                    </div>
                  </div>
                  <div className="orders">
                    <h4>
                      {demoStage > 3 ? "Impacted orders" : "Recent orders"}:
                    </h4>
                    {(demoStage > 3
                      ? usRetailData.recentOrders.filter(o => o.impacted)
                      : usRetailData.recentOrders
                    ).map(o => (
                      <div
                        key={o.id}
                        className="order selectable"
                        onClick={() => {
                          if (o.canSelect) {
                            setSelectedOrder(o);
                            setDemoIsLive(false);
                            setDemoStage(3);
                          }
                        }}
                      >
                        <div className="icon">
                          <Svg src={OrderIcon} />
                        </div>
                        <h5>Order# {o.id}</h5>
                        {demoStage <= 3 ? (
                          <div className="products">
                            <span>Product Lines:</span>
                            {o.products.map((p, i) => (
                              <Svg src={productIcons[p]} key={p + i} />
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, marginLeft: 30 }}>
                            Revised ETA: {o.estimatedtimeofarrival}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="button-full-width">
                    <span>View Outlet</span>
                  </div>
                </div>
              )}
            </Popup>
          )}
          {showUKRetailPopup && (
            <Popup
              icon={RetailIcon}
              title="Twin Type: Retail"
              id={ukRetailData.id}
              onClose={() => {
                setShowUKRetailPopup(false);
                setSelectedAsset(null);
              }}
              position={{
                top: "31%",
                left: "30.20%",
              }}
              width="39vh"
              style={{
                paddingBottom: 0,
              }}
              className={demoStage > 3 ? "impacted" : ""}
            >
              <div style={{ flexDirection: "column" }}>
                <div className="retail-data">
                  <div>
                    <div className="value">
                      {demoStage > 3
                        ? ukRetailData.impactedStock
                        : ukRetailData.stock}
                    </div>
                    <span>
                      {demoStage > 3
                        ? "Estimated financial impact"
                        : "Stock levels"}
                    </span>
                  </div>
                  <div>
                    <div className="value">
                      {demoStage > 3
                        ? ukRetailData.impactedOrders
                        : ukRetailData.openOrders}
                    </div>
                    <span>
                      {demoStage > 3 ? "Impacted orders" : "Open orders"}
                    </span>
                  </div>
                </div>
                <div className="orders">
                  <h4>
                    {demoStage > 3 ? "Impacted orders" : "Recent orders"}:
                  </h4>
                  {(demoStage > 3
                    ? ukRetailData.recentOrders.filter(o => o.impacted)
                    : ukRetailData.recentOrders
                  ).map(o => (
                    <div
                      key={o.id}
                      className="order selectable"
                      onClick={() => {
                        setSelectedOrder(o);
                        setDemoIsLive(false);
                      }}
                    >
                      <div className="icon">
                        <Svg src={OrderIcon} />
                      </div>
                      <h5>Order# {o.id}</h5>
                      {demoStage <= 3 ? (
                        <div className="products">
                          <span>Product Lines:</span>
                          {o.products.map((p, i) => (
                            <Svg src={productIcons[p]} key={p + i} />
                          ))}
                        </div>
                      ) : (
                        <div className="eta">
                          Revised ETA: {o.estimatedtimeofarrival}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="button-full-width">
                  <span>View Outlet</span>
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    );
  }
);
