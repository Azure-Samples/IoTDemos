import React, { useState, useEffect, useRef } from "react";
import "./Factory.scss";
import FactoryBackground from "../../assets/Factory.mp4";
import Svg from "react-inlinesvg";
import moment from "moment";
import SensorIcon from "../../assets/Sensor.svg";
import HistoricalDataAsset from "../../assets/HistoricalDataAsset.svg";
import FactoryLineFilter from "../../assets/FactoryLineFilter.png";
import FutureIcon from "../../assets/IconFuture.svg";
import FactoryIcon from "../../assets/Factory.svg";
import Storeroom from "../../assets/Storeroom.svg";
import CalendarIcon from "../../assets/CalendarIcon.svg";
import TechnicianIcon from "../../assets/TechnicianIcon.svg";
import CloseIcon from "../../assets/CloseIcon-NoCircle.svg";
import OrderIcon from "../../assets/OrderIcon.svg";
import { Gauge } from "../../components/Gauge";
import { Popup } from "../../components/Popup";
import { withRouter } from "react-router-dom";
import { productIcons } from "../../services/icons";

export const Factory = withRouter(
  ({
    setDemoStage,
    data,
    history,
    setFactoryLinesData,
    setDemoIsLive,
    demoIsLive
  }) => {
    const [showGaugeData, setShowGaugeData] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [sidePanelIsOpen, setSidePanelIsOpen] = useState(false);
    const videoElement = useRef(null);
    const { usRetailData, pakistanFactoryData, factoryLinesData } = data;

    const orders = usRetailData.recentOrders;

    const openAssetPopup = (lineId, assetType) => {
      factoryLinesData
        .find(l => l.id === lineId)
        .assets.find(a => a.type === assetType).show = true;
      setFactoryLinesData(factoryLinesData);
    };

    const closeAllAssetPopups = () => {
      factoryLinesData.forEach(line => {
        line.assets.forEach(asset => {
          asset.show = false;
        });
      });
      setFactoryLinesData(factoryLinesData);
    };

    useEffect(() => {
      if (selectedAsset && window.renderTsi) {
        window.renderTsi();
      }
    }, [selectedAsset]);

    useEffect(() => {
      if (demoIsLive) {
        videoElement.current.play();
      } else {
        videoElement.current.pause();
      }
    }, [demoIsLive]);

    const renderStoreroomPopup = storeroom => (
      <Popup
        icon={SensorIcon}
        iconStyle={{ background: "transparent", marginRight: "10px" }}
        title={demoIsLive ? "Asset: Storeroom" : null}
        width={demoIsLive ? 400 : "auto"}
        id={storeroom.id}
        onClose={
          demoIsLive
            ? () => {
              closeAllAssetPopups();
              setShowGaugeData(false);
            }
            : null
        }
        position={storeroom.popupPosition}
        className={`arrow_box arrow_box_left_top storeroom ${
          storeroom.show ? "show" : "hide"
        }`}
      >
        {demoIsLive ? (
          <div>
            <div className="gauge">
              <Gauge
                value={showGaugeData ? storeroom.temperature : 0}
                min={storeroom.minTemperature}
                max={storeroom.maxTemperature}
                isPercentage={false}
              />
              <div className="title">TEMP (F)</div>
            </div>
            <div className="gauge">
              <Gauge
                value={showGaugeData ? storeroom.humidity : 0}
                min={storeroom.minHumidity}
                max={storeroom.maxHumidity}
                isPercentage
              />
              <div className="title">Humidity (%)</div>
            </div>
          </div>
        ) : (
          <div>
            <div className="center-content">
              <div
                className="primary-button time-series-button"
                onClick={() => {
                  setSelectedAsset(storeroom);
                  setSidePanelIsOpen(true);
                  setShowGaugeData(false);
                }}
              >
                <span>Time Series Insights</span>
              </div>
            </div>
          </div>
        )}
      </Popup>
    );

    const renderCutterPopup = cutter => (
      <Popup
        icon={SensorIcon}
        iconStyle={{ background: "transparent", marginRight: "10px" }}
        title={demoIsLive ? "Asset: Cutter" : null}
        width={demoIsLive ? 260 : "auto"}
        id={cutter.id}
        onClose={
          demoIsLive
            ? () => {
              closeAllAssetPopups();
              setShowGaugeData(false);
            }
            : null
        }
        position={cutter.popupPosition}
        className={`arrow_box arrow_box_left_top cutter ${
          cutter.show ? "show" : "hide"
        }`}
      >
        {demoIsLive ? (
          <div>
            <div className="gauge">
              <Gauge
                value={showGaugeData ? cutter.speed : 0}
                min={cutter.minSpeed}
                max={cutter.maxSpeed}
                isPercentage
              />
              <div className="title">Speed (% Capacity)</div>
            </div>
          </div>
        ) : (
          <div>
            <div className="center-content">
              <div
                className="primary-button time-series-button"
                onClick={() => {
                  setSelectedAsset(cutter);
                  setSidePanelIsOpen(true);
                  setShowGaugeData(false);
                }}
              >
                <span>Time Series Insights</span>
              </div>
            </div>
          </div>
        )}
      </Popup>
    );

    const renderConveyorPopup = conveyor => (
      <Popup
        icon={SensorIcon}
        iconStyle={{ background: "transparent", marginRight: "10px" }}
        title={demoIsLive ? "Asset: Conveyor" : null}
        width={demoIsLive ? 260 : "auto"}
        id={conveyor.id}
        onClose={
          demoIsLive
            ? () => {
              closeAllAssetPopups();
              setShowGaugeData(false);
            }
            : null
        }
        position={conveyor.popupPosition}
        className={`arrow_box arrow_box_left_top conveyor ${
          conveyor.show ? "show" : "hide"
        }`}
      >
        {demoIsLive ? (
          <div>
            <div className="gauge">
              <Gauge
                value={showGaugeData ? conveyor.speed : 0}
                min={conveyor.minSpeed}
                max={conveyor.maxSpeed}
                isPercentage
              />
              <div className="title">Speed (% Capacity)</div>
            </div>
          </div>
        ) : (
          <div>
            <div className="center-content">
              <div
                className="primary-button time-series-button"
                onClick={() => {
                  setSelectedAsset(conveyor);
                  setSidePanelIsOpen(true);
                  setShowGaugeData(false);
                }}
              >
                <span>Time Series Insights</span>
              </div>
            </div>
          </div>
        )}
      </Popup>
    );

    return (
      <div className="factory">
        <div className="video-wrap">
          <video
            src={FactoryBackground}
            autoPlay
            loop
            muted
            ref={videoElement}
          />
          {!demoIsLive && (
            <img className="video-cover" src={FactoryLineFilter} alt="" />
          )}
          {factoryLinesData.map(line =>
            line.assets.map(asset => (
              <>
                <div
                  key={asset.id}
                  className={`issue-hitbox ${demoIsLive ? "show" : (line.isFaulty ? "show" : "hide")}`}
                  style={{ ...asset.hitboxPosition }}
                  onClick={() => {
                    closeAllAssetPopups();
                    setShowGaugeData(false);
                    openAssetPopup(line.id, asset.type);
                    setTimeout(() => {
                      setShowGaugeData(true);
                    }, 100);
                  }}
                >
                  <Svg src={demoIsLive ? SensorIcon : HistoricalDataAsset} />
                </div>
                {asset.type === "Storeroom"
                  ? renderStoreroomPopup(asset)
                  : asset.type === "Cutter"
                    ? renderCutterPopup(asset)
                    : renderConveyorPopup(asset)}
              </>)
            )
          )}
        </div>
        {selectedOrder ? (
          <div className="twin-details">
            <header>
              <div className="icon">
                <Svg src={OrderIcon} />
              </div>
              <div className="title">
                <h3>Order# {selectedOrder.id}</h3>
                <span>Lot#: {selectedOrder.lot}</span>
              </div>
            </header>
            <div>
              <div style={{ marginBottom: "10px" }}>Order Details:</div>
              <div className="orders">
                {selectedOrder.details.map((d, i) => (
                  <div className="order" key={`od-${i}`}>
                    <div className="icon" style={{ background: "transparent" }}>
                      <Svg src={productIcons[selectedOrder.products[0]]} />
                    </div>
                    <div className="text">
                      <div className="order-detail">
                        <h5>{d.title}</h5>
                        <span>{d.text}</span>
                      </div>
                      <div className="order-progress">
                        <span>Order progress</span>
                        <div className="progress-wrap progress">
                          <div
                            className="progress-bar progress"
                            style={{ width: `${d.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="twin-details">
            <header>
              <div className="icon">
                <Svg src={FactoryIcon} />
              </div>
              <div className="title">
                <h3>TWIN TYPE: FACTORY</h3>
                <span>ID: {pakistanFactoryData.id}</span>
              </div>
            </header>
            <div>
              <div style={{ marginBottom: "10px" }}>Latest Orders:</div>
              <div className="orders">
                {orders.map((o, i) => (
                  <div
                    key={`ord-${i}`}
                    className="order"
                    onClick={() => {
                      if (o.canSelect) {
                        setSelectedOrder(o);
                        setDemoIsLive(false);
                        closeAllAssetPopups();
                      }
                    }}
                  >
                    <div className="icon">
                      <Svg src={OrderIcon} />
                    </div>
                    <div className="text">
                      <div className="order-detail">
                        <h5>Order# {o.id}</h5>
                        <span>Lot# {o.lot}</span>
                      </div>
                      <div className="order-progress">
                        <span>Order progress</span>
                        <div className="progress-wrap progress">
                          <div
                            className="progress-bar progress"
                            style={{ width: `${o.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className={`side-panel ${sidePanelIsOpen ? "open" : "closed"}`}>
          {selectedAsset && (
            <div>
              <div className="asset-bar">
                <div className="asset-detail">
                  <Svg src={Storeroom} />
                  <div>
                    <div className="title">Asset: {selectedAsset.type}</div>
                    <div className="id">ID: {selectedAsset.id}</div>
                  </div>
                </div>
                <div className="kpi-detail">
                  <div className="kpi">
                    <Svg src={CalendarIcon} />
                    <span>Date Installed</span>
                    <div className="data">02/08/16</div>
                    <span>Batch: 44718</span>
                  </div>
                  <div className="kpi">
                    <Svg src={CalendarIcon} />
                    <span>Last Serviced</span>
                    <div className="data">{moment().subtract("95", "days")
                      .format("l")}</div>
                    <span>08:38:00</span>
                  </div>
                  <div className="kpi">
                    <Svg src={TechnicianIcon} />
                    <span>Assigned Technician</span>
                    <div className="data">ID# 4415</div>
                    <span>Patel, Sanjay</span>
                  </div>
                </div>
              </div>
              <div className="tsi-chart">
                <div
                  id="linechart"
                  style={{ width: "100%", height: "100%", float: "left" }}
                />
                <div
                  className="primary-button view-future-orders"
                  onClick={() => {
                    setDemoStage(4);
                    setDemoIsLive(false);
                    history.push("/");
                  }}
                >
                  <Svg src={FutureIcon} />
                  <span>VIEW IMPACT</span>
                </div>
              </div>
              <div
                className="asset-close"
                onClick={() => {
                  setSidePanelIsOpen(false);
                  setTimeout(() => {
                    setSelectedAsset(null);
                  }, 500);
                }}
              >
                <Svg src={CloseIcon} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);
