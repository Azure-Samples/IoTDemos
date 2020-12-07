import * as signalR from "@microsoft/signalr";
import { ApiService } from "./apiService";

const ConnectionRetries = 10;

class SignalRService {

  onReconnectionCallback = null;

  async initialize() {
    let connectionTries = 0;
    while ((!this.connection || this.connection.state !== signalR.HubConnectionState.Connected)
      && connectionTries < ConnectionRetries) {
      try {
        connectionTries++;
        const config = await ApiService.getConfig();
        this.connection = new signalR.HubConnectionBuilder()
          .withUrl(config.signalRHubUrl)
          .configureLogging(signalR.LogLevel.Debug)
          .withAutomaticReconnect()
          .build();

        this.connection.onreconnected(() => {
          if (this.onReconnectionCallback) {
            this.onReconnectionCallback();
          }
        });

        if (this.connection.state !== signalR.HubConnectionState.Connected) {
          console.log("[SignalR] Connecting...");
          await this.connection.start();
          console.log("[SignalR] Connected.");
        }
      } catch (err) {
        console.error(`Error while establishing connection : ${err}`);
      }
    }

    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      console.log("Can't connect with SignalR Hub, please refresh the page.");
    }
  }

  setOnReconnectionMethod(callback) {
    this.onReconnectionCallback = callback;
  }

  async subscribe(action, callback) {
    await this.initialize();
    this.connection.on(action, callback);
  }

  async unsubscribe(action, callback) {
    if (this.connection) {
      await this.connection.off(action, callback);
    }
  }

  async emit(action, ...args) {
    await this.initialize();
    this.connection
      .invoke(action, ...args)
      .catch(err => console.error(err));
  }

}

export const signalRService = new SignalRService();
