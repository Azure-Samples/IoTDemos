using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Azure.Devices.Client;

namespace AdtGaDemo
{
  public class SimulationTask
  {
    private readonly Simulation _simulation;
    private readonly SimulationOptions _options;
    private readonly Random _random;
    private readonly int _minutesToRun;
    private IotHubConnectionService _iotHubConnectionService;
    private Dictionary<string, DeviceClient> _deviceClients;

    public SimulationTask(SimulationOptions options, IotHubConnectionService iotHubConnectionService, int minutesToRun)
    {
      _options = options;
      _iotHubConnectionService = iotHubConnectionService;
      _minutesToRun = minutesToRun;
      _random = new Random();
      _deviceClients = new Dictionary<string, DeviceClient>();
      var devices = new List<SimulatedDevice>();
      for (var i = 0; i < options.AirShipmentDevices; i++)
      {
        devices.Add(new SimulatedDevice() {
          DeviceId = $"{Constants.AirShipmentModel.BaseName}{(Constants.AirShipmentModel.InitialIdReference + i)}",
          Model = Constants.AirShipmentModel
        });
      }
      for (var i = 0; i < options.BoatShipmentDevices; i++)
      {
        devices.Add(new SimulatedDevice() {
          DeviceId = $"{Constants.BoatShipmentModel.BaseName}{(Constants.BoatShipmentModel.InitialIdReference + i)}",
          Model = Constants.BoatShipmentModel
        });
      }
      for (var i = 0; i < options.ConveyorDevices; i++)
      {
        devices.Add(new SimulatedDevice()
        {
          DeviceId = $"{Constants.ConveyorModel.BaseName}{(Constants.ConveyorModel.InitialIdReference + i)}",
          Model = Constants.ConveyorModel
        });
      }
      for (var i = 0; i < options.CutterDevices; i++)
      {
        devices.Add(new SimulatedDevice() {
          DeviceId = $"{Constants.CutterModel.BaseName}{(Constants.CutterModel.InitialIdReference + i)}",
          Model = Constants.CutterModel
        });
      }
      for (var i = 0; i < options.FactoryDevices; i++)
      {
        devices.Add(new SimulatedDevice() {
          DeviceId = $"{Constants.FactoryModel.BaseName}{(Constants.FactoryModel.InitialIdReference + i)}",
          Model = Constants.FactoryModel
        });
      }
      for (var i = 0; i < options.ShopDevices; i++)
      {
        devices.Add(new SimulatedDevice() {
          DeviceId = $"{Constants.ShopModel.BaseName}{(Constants.ShopModel.InitialIdReference + i)}",
          Model = Constants.ShopModel
        });
      }
      for (var i = 0; i < options.StoreRoomDevices; i++)
      {
        devices.Add(new SimulatedDevice() {
          DeviceId = $"{Constants.StoreRoomModel.BaseName}{(Constants.StoreRoomModel.InitialIdReference + i)}",
          Model = Constants.StoreRoomModel,
          UseIssueValues = i == 1
        });
      }
      for (var i = 0; i < options.SupplierDevices; i++)
      {
        devices.Add(new SimulatedDevice() {
          DeviceId = $"{Constants.SupplierModel.BaseName}{(Constants.SupplierModel.InitialIdReference + i)}",
          Model = Constants.SupplierModel
        });
      }
      for (var i = 0; i < options.TruckShipmentDevices; i++)
      {
        devices.Add(new SimulatedDevice() {
          DeviceId = $"{Constants.TruckShipmentModel.BaseName}{(Constants.TruckShipmentModel.InitialIdReference + i)}",
          Model = Constants.TruckShipmentModel
        });
      }
      for (var i = 0; i < options.WareHouseDevices; i++)
      {
        devices.Add(new SimulatedDevice() {
          DeviceId = $"{Constants.WareHouseModel.BaseName}{(Constants.WareHouseModel.InitialIdReference + i)}",
          Model = Constants.WareHouseModel
        });
      }
      _simulation = new Simulation()
      {
        Devices = devices,
        Status = Constants.SimulationStatusCreated
      };
    }

    public async Task Start()
    {
      // Set initial generation time
      Console.WriteLine("Initializing devices...");
      foreach (var device in _simulation.Devices)
      {
        device.NextGeneration = DateTime.Now.AddSeconds(_random.Next(device.MinSecondsBeforeGeneration, device.MaxSecondsBeforeGeneration));
        var deviceClient = await _iotHubConnectionService.GetOrCreateDeviceAsync(device.DeviceId);
        _deviceClients.Add(device.DeviceId, deviceClient);
        Console.WriteLine($"Device {device.DeviceId} initialized.");
      }
      Console.WriteLine("Devices initialized.");
      _simulation.StartedAt = DateTime.Now;
      _simulation.Status = Constants.SimulationStatusStarted;
      _simulation.FinishedAt = _simulation.StartedAt.AddSeconds(_minutesToRun * 60);

      while (DateTime.Now.CompareTo(_simulation.FinishedAt) == -1)
      {
        foreach (var device in _simulation.Devices)
        {
          if (DateTime.Now.CompareTo(device.NextGeneration) > -1)
          {
            _ = _iotHubConnectionService.SendMessage(_deviceClients[device.DeviceId], device.Model, device.UseIssueValues);
            device.MessagesCounter++;
            device.NextGeneration = DateTime.Now.AddSeconds(_random.Next(device.MinSecondsBeforeGeneration, device.MaxSecondsBeforeGeneration));
            Console.WriteLine($"Sending property update for {device.DeviceId}.");
          }
        }
      }
      _simulation.Status = Constants.SimulationStatusFinished;
      Console.WriteLine("Simulation Finished, press the `Escape` key to continue.");
    }

    public void Stop()
    {
      _simulation.FinishedAt = DateTime.Now;
    }

    public Simulation GetSimulation()
    {
      return _simulation;
    }

    public void ResetEndTime()
    {
       _simulation.FinishedAt = DateTime.Now.AddSeconds(_minutesToRun * 60);
    }
  }
}
