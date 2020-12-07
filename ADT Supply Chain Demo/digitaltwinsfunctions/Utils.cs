using System;

namespace DigitalTwinsToTsi
{
  public static class Utils
  {
    public static DeviceType GetDeviceType(string id)
    {
      if (id.Contains(Constants.DeviceTypeAirShipmentInitials, StringComparison.OrdinalIgnoreCase)
        || id.Contains(Constants.DeviceTypeBoatShipmentInitials, StringComparison.OrdinalIgnoreCase)
        || id.Contains(Constants.DeviceTypeTruckShipmentInitials, StringComparison.OrdinalIgnoreCase))
      {
        return DeviceType.Shipment;
      }
      else if (id.Contains(Constants.DeviceTypeConveyorInitials, StringComparison.OrdinalIgnoreCase))
      {
        return DeviceType.Conveyor;
      }
      else if (id.Contains(Constants.DeviceTypeCutterInitials, StringComparison.OrdinalIgnoreCase))
      {
        return DeviceType.Cutter;
      }
      else if (id.Contains(Constants.DeviceTypeFactoryInitials, StringComparison.OrdinalIgnoreCase))
      {
        return DeviceType.Factory;
      }
      else if (id.Contains(Constants.DeviceTypeShopInitials, StringComparison.OrdinalIgnoreCase))
      {
        return DeviceType.Shop;
      }
      else if (id.Contains(Constants.DeviceTypeStoreRoomInitials, StringComparison.OrdinalIgnoreCase))
      {
        return DeviceType.Storeroom;
      }
      else if (id.Contains(Constants.DeviceTypeSupplierInitials, StringComparison.OrdinalIgnoreCase))
      {
        return DeviceType.Supplier;
      }
      else if (id.Contains(Constants.DeviceTypeWareHouseInitials, StringComparison.OrdinalIgnoreCase))
      {
        return DeviceType.Warehouse;
      }
      else
      {
        return DeviceType.Unknown;
      }
    }
  }
}
