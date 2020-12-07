using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Azure.Core.Pipeline;
using Azure.DigitalTwins.Core;
using Azure.DigitalTwins.Core.Serialization;
using Azure.Identity;
using Microsoft.Azure.EventGrid.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.EventGrid;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;


namespace DigitalTwinsToTsi
{
  public class IotHubToTwins
  {
    private static readonly string adtInstanceUrl = Environment.GetEnvironmentVariable("ADT_SERVICE_URL");
    private static readonly HttpClient httpClient = new HttpClient();

    [FunctionName("IotHubToTwins")]
    public async Task Run([EventGridTrigger] EventGridEvent eventGridEvent, ILogger log)
    {
      if (adtInstanceUrl == null) log.LogError("Application setting \"ADT_SERVICE_URL\" not set");

      try
      {
        if (eventGridEvent != null && eventGridEvent.Data != null)
        {
          // Authenticate with Digital Twins
          ManagedIdentityCredential cred = new ManagedIdentityCredential("https://digitaltwins.azure.net");
          DigitalTwinsClient client = new DigitalTwinsClient(
              new Uri(adtInstanceUrl), cred, new DigitalTwinsClientOptions
              { Transport = new HttpClientTransport(httpClient) });
          log.LogInformation(eventGridEvent.Data.ToString());
          // Reading deviceId and temperature for IoT Hub JSON
          JObject deviceMessage = (JObject)JsonConvert.DeserializeObject(eventGridEvent.Data.ToString());
          string deviceId = (string)deviceMessage["systemProperties"]["iothub-connection-device-id"];
          var deviceType = Utils.GetDeviceType(deviceId);
          var body = deviceMessage["body"];
          switch (deviceType)
          {
            case DeviceType.Cutter:
              await UpdateDigitalTwinProperty(client, deviceId, body,  Constants.CutterProperties);
              break;
            case DeviceType.Conveyor:
              await UpdateDigitalTwinProperty(client, deviceId, body,  Constants.ConveyorProperties);
              break;
            case DeviceType.Factory:
              await UpdateDigitalTwinProperty(client, deviceId, body,  Constants.FactoryProperties);
              break;
            case DeviceType.Shipment:
              await UpdateDigitalTwinProperty(client, deviceId, body,  Constants.ShipmentProperties);
              break;
            case DeviceType.Shop:
              await UpdateDigitalTwinProperty(client, deviceId, body,  Constants.ShopProperties);
              break;
            case DeviceType.Storeroom:
              await UpdateDigitalTwinProperty(client, deviceId, body,  Constants.StoreRoomProperties);
              break;
            case DeviceType.Supplier:
              await UpdateDigitalTwinProperty(client, deviceId, body,  Constants.SupplierProperties);
              break;
            case DeviceType.Warehouse:
              await UpdateDigitalTwinProperty(client, deviceId, body,  Constants.WareHouseProperties);
              break;
            default:
              log.LogInformation("Unknown device type.");
              break;
          }
          log.LogInformation($"DigitalTwin Updated.");
        }
      }
      catch (Exception e)
      {
        log.LogError(e, $"Error in ingest function: {e.Message}");
      }
    }

    private async Task UpdateDigitalTwinProperty(DigitalTwinsClient client, string deviceId, JToken body, List<string> properties)
    {
      foreach (var property in properties)
      {
        await UpdateDigitalTwinProperty(client, deviceId, body, property);
      }
    }

    private async Task UpdateDigitalTwinProperty(DigitalTwinsClient client, string deviceId, JToken body, string propertyName)
    {
      var propertyToken = body[propertyName];
      if (propertyToken != null)
      {
        if (Constants.Telemetries.Contains(propertyName.ToUpper()))
        {
          var data = new Dictionary<string, double>();
          data.Add(propertyName, propertyToken.Value<double>());
          await client.PublishTelemetryAsync(deviceId, JsonConvert.SerializeObject(data));
        }
        else
        {
          // Update twin using device property
          var uou = new UpdateOperationsUtility();
          uou.AppendReplaceOp($"/{propertyName}", propertyToken.Value<double>());
          await client.UpdateDigitalTwinAsync(deviceId, uou.Serialize());
        }
      }
    }
  }
}
