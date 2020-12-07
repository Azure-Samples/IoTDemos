using System;
using System.Collections.Generic;

namespace AdtGaDemo
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
        new DeviceProperty() { Name = "Humidity", Min = 60, Max = 70 },
        new DeviceProperty() { Name = "Temperature", Min = 82, Max = 90 },
        new DeviceProperty() { Name = "Vibration", Min = 65, Max = 75 }
      }
    };
    public static readonly DeviceModel BoatShipmentModel = new DeviceModel()
    {
      BaseName = "CB23251-",
      InitialIdReference = 12,
      Properties = new List<DeviceProperty>
      {
        new DeviceProperty() { Name = "Humidity", Min = 60, Max = 70 },
        new DeviceProperty() { Name = "Temperature", Min = 82, Max = 90 },
        new DeviceProperty() { Name = "Vibration", Min = 65, Max = 75 }
      }
    };
    public static readonly DeviceModel ConveyorModel = new DeviceModel()
    {
      BaseName = "CV",
      InitialIdReference = 90321,
      Properties = new List<DeviceProperty>
      {
        new DeviceProperty() { Name = "Speed", Min = 60, Max = 70 }
      }
    };
    public static readonly DeviceModel CutterModel = new DeviceModel()
    {
      BaseName = "CU",
      InitialIdReference = 90447,
      Properties = new List<DeviceProperty>
      {
        new DeviceProperty() { Name = "Speed", Min = 30, Max = 50 }
      }
    };
    public static readonly DeviceModel FactoryModel = new DeviceModel()
    {
      BaseName = "FA",
      InitialIdReference = 44210,
      Properties = new List<DeviceProperty>
      {
        new DeviceProperty() { Name = "Efficiency", Min = 85, Max = 95 },
        new DeviceProperty() { Name = "Reliability", Min = 87, Max = 93 },
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
      InitialIdReference = 36,
      Properties = new List<DeviceProperty>
      {
        new DeviceProperty() { Name = "Humidity", Min = 55, Max = 65, IssueMin = 78, IssueMax = 92 },
        new DeviceProperty() { Name = "Temperature", Min = 55, Max = 60 }
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
}
