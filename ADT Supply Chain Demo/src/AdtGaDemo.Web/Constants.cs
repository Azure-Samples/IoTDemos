using Microsoft.Azure.Devices.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AdtGaDemo.Web
{
  public static class Constants
  {
    public const int SensorWithIssues = 2;
    public const string TsiTimeZone = "Dateline Standard Time";
    public const string DateTimeFormat = "yyyy-MM-ddTHH:mm:ssZ";

    public const string SimulationStatusCreated = "Created";
    public const string SimulationStatusStarted = "Started";
    public const string SimulationStatusFinished = "Finished";
    public static readonly DeviceModel AirShipmentModel = new DeviceModel()
    {
      BaseName = "CA23251-",
      InitialIdReference = 41,
      Properties = new List<DeviceProperty>
      {
        new DeviceProperty() { Name = "Humidity", Min = 85, Max = 95 },
        new DeviceProperty() { Name = "Temperature", Min = 90, Max = 95 },
        new DeviceProperty() { Name = "Vibration", Min = 20, Max = 50 }
      }
    };
    public static readonly DeviceModel BoatShipmentModel = new DeviceModel()
    {
      BaseName = "CB23251-",
      InitialIdReference = 12,
      Properties = new List<DeviceProperty>
      {
        new DeviceProperty() { Name = "Humidity", Min = 85, Max = 95 },
        new DeviceProperty() { Name = "Temperature", Min = 90, Max = 95 },
        new DeviceProperty() { Name = "Vibration", Min = 20, Max = 50 }
      }
    };
    public static readonly DeviceModel ConveyorModel = new DeviceModel()
    {
      BaseName = "CV",
      InitialIdReference = 90372,
      Properties = new List<DeviceProperty>
      {
        new DeviceProperty() { Name = "Speed", Min = 82, Max = 88 }
      }
    };
    public static readonly DeviceModel CutterModel = new DeviceModel()
    {
      BaseName = "CU",
      InitialIdReference = 90447,
      Properties = new List<DeviceProperty>
      {
        new DeviceProperty() { Name = "Speed", Min = 83, Max = 88 }
      }
    };
    public static readonly DeviceModel FactoryModel = new DeviceModel()
    {
      BaseName = "FA",
      InitialIdReference = 44210,
      Properties = new List<DeviceProperty>
      {
        new DeviceProperty() { Name = "Efficiency", Min = 89, Max = 91 },
        new DeviceProperty() { Name = "Reliability", Min = 69, Max = 71 },
        new DeviceProperty() { Name = "OpenOrders", Min = 45, Max = 55},
      }
    };
    public static readonly DeviceModel TruckShipmentModel = new DeviceModel()
    {
      BaseName = "CT23251-",
      InitialIdReference = 71,
      Properties = new List<DeviceProperty>
      {
        new DeviceProperty() { Name = "Humidity", Min = 85, Max = 95 },
        new DeviceProperty() { Name = "Temperature", Min = 90, Max = 95 },
        new DeviceProperty() { Name = "Vibration", Min = 20, Max = 50 }
      }
    };
    public static readonly DeviceModel ShopModel = new DeviceModel()
    {
      BaseName = "RT44658",
      InitialIdReference = 79,
      Properties = new List<DeviceProperty>
      {
        new DeviceProperty() { Name = "StockLevel", Min = 61, Max = 66 },
        new DeviceProperty() { Name = "OpenOrders", Min = 45, Max = 50 }
      }
    };
    public static readonly DeviceModel StoreRoomModel = new DeviceModel()
    {
      BaseName = "SR906",
      InitialIdReference = 87,
      Properties = new List<DeviceProperty>
      {
        new DeviceProperty() { Name = "Humidity", Min = 78, Max = 92 },
        new DeviceProperty() { Name = "Temperature", Min = 85, Max = 90 }
      }
    };
    public static readonly DeviceModel SupplierModel = new DeviceModel()
    {
      BaseName = "SP658",
      InitialIdReference = 75,
      Properties = new List<DeviceProperty>
      {
      }
    };
    public static readonly DeviceModel WareHouseModel = new DeviceModel()
    {
      BaseName = "WH89125-",
      InitialIdReference = 17,
      Properties = new List<DeviceProperty>
      {
        new DeviceProperty() { Name = "StockLevel", Min = 20, Max = 40 }
      }
    };
  }

  public class SimulatedDevice
  {
    public string DeviceId { get; set; }
    public DeviceModel Model { get; set; }
    public int MinSecondsBeforeGeneration { get; set; } = 3;
    public int MaxSecondsBeforeGeneration { get; set; } = 6;
    public DateTime NextGeneration { get; set; }
    public int MessagesCounter { get; set; } = 0;
  }

  public class DeviceModel
  {
    public string BaseName { get; set; }
    public int InitialIdReference { get; set; }
    public List<DeviceProperty> Properties { get; set;}
  }

  public class DeviceProperty
  {
    public string Name { get; set; }
    public int Min { get; set; }
    public int Max { get; set; }
  }
}
