namespace AdtGaDemo
{
  public class SimulationOptions
  {
    public int SimulationTimeInSeconds { get; set; }
    public int AirShipmentDevices { get; set; }
    public int BoatShipmentDevices { get; set; }
    public int ConveyorDevices { get; set; }
    public int CutterDevices { get; set; }
    public int FactoryDevices { get; set; }
    public int ShopDevices { get; set; }
    public int StoreRoomDevices { get; set; }
    public int SupplierDevices { get; set; }
    public int TruckShipmentDevices { get; set; }
    public int WareHouseDevices { get; set; }

    public static SimulationOptions GetDefault()
    {
      return new SimulationOptions
      {
        AirShipmentDevices = 14,
        BoatShipmentDevices = 10,
        ConveyorDevices = 20,
        CutterDevices = 20,
        FactoryDevices = 5,
        ShopDevices = 20,
        StoreRoomDevices = 20,
        SupplierDevices = 8,
        TruckShipmentDevices = 26,
        WareHouseDevices = 8
      };
    }
  }
}
