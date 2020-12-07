using System;
using System.Collections.Generic;
using System.Text;

namespace DigitalTwinsToTsi
{
  public static class Constants
  {
    public const string DeviceTypeAirShipmentInitials = "CA";
    public const string DeviceTypeBoatShipmentInitials = "CB";
    public const string DeviceTypeConveyorInitials = "CV";
    public const string DeviceTypeCutterInitials = "CU";
    public const string DeviceTypeFactoryInitials = "FA";
    public const string DeviceTypeTruckShipmentInitials = "CT";
    public const string DeviceTypeShopInitials = "RT";
    public const string DeviceTypeStoreRoomInitials = "SR";
    public const string DeviceTypeSupplierInitials = "SP";
    public const string DeviceTypeWareHouseInitials = "WH";

    public static readonly List<string> ConveyorProperties = new List<string> { "Speed" };
    public static readonly List<string> CutterProperties = new List<string> { "Speed" };
    public static readonly List<string> FactoryProperties = new List<string> { "Efficiency", "Reliability", "OpenOrders" };
    public static readonly List<string> ShipmentProperties = new List<string> { "Humidity", "Temperature", "Vibration", "EstimatedTimeOfArrival", "Location" };
    public static readonly List<string> ShopProperties = new List<string> { "StockLevel", "OpenOrders" };
    public static readonly List<string> StoreRoomProperties = new List<string> { "Humidity", "Temperature" };
    public static readonly List<string> SupplierProperties = new List<string> {};
    public static readonly List<string> WareHouseProperties = new List<string> { "StockLevel" };

    public static readonly List<string> Telemetries = new List<string> { "SPEED", "HUMIDITY", "TEMPERATURE", "VIBRATION"};
  }

  public enum DeviceType
  {
    Conveyor,
    Cutter,
    Factory,
    Shipment,
    Shop,
    Storeroom,
    Supplier,
    Warehouse,
    Unknown
  }
}
