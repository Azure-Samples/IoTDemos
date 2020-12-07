using System;
using Microsoft.Extensions.Configuration;

namespace AdtGaDemo
{
  class Program
  {
    private static SimulationTask _simulationTask;
    private static SimulationOptions _simulationOptions = SimulationOptions.GetDefault();

    static void Main(string[] args)
    {
      Setup();
      string commandString = string.Empty;
      Console.ForegroundColor = ConsoleColor.White;
      Console.WriteLine("");
      Console.WriteLine("");
      Console.WriteLine("***********************************************************");
      Console.WriteLine("*              IoTHub Devices Simulation                  *");
      Console.WriteLine("*                                                         *");
      Console.WriteLine("*             Type commands to get started                *");
      Console.WriteLine("*                                                         *");
      Console.WriteLine("***********************************************************");
      Console.WriteLine("");

      while (!commandString.Equals("Exit"))
      {
        Console.ResetColor();
        Console.WriteLine("Enter command (setup | start | help | exit) >");
        commandString = Console.ReadLine();

        switch (commandString.ToUpper())
        {
          case "SETUP":
            Setup();
            break;
          case "START":
            Start();
            break;
          case "HELP":
            Help();
            break;
          case "EXIT":
            Console.WriteLine("Bye!");
            return;
          default:
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("Invalid command.");
            break;
        }
      }

      Console.WriteLine("\n\nPress any key to exit");
      Console.ReadKey();
    }

    private static void Setup()
    {
      // Load settings from file
      var builder = new ConfigurationBuilder()
          .AddJsonFile($"appSettings.json", true, true);
      var config = builder.Build();
      var iotHubConnectionString = config["IoTHubConnectionString"];
      var minutesToRunStr = config["MinutesToRun"];

      if (string.IsNullOrEmpty(iotHubConnectionString))
      {
        Console.WriteLine("");
        Console.WriteLine("Enter the IoTHub Connection String");
        iotHubConnectionString= Console.ReadLine();
      }

      if (string.IsNullOrEmpty(minutesToRunStr))
      {
        Console.WriteLine("");
        Console.WriteLine("Enter the number of minutes (as an integer) to run the simulation:");
        minutesToRunStr = Console.ReadLine();
      }

      Console.WriteLine("");
      Console.WriteLine("App will use the following IoTHub setup:");
      Console.WriteLine($"  Connection String: {iotHubConnectionString}");
      Console.WriteLine($"  Minutes to run: {minutesToRunStr}");
      Console.WriteLine("");
      var iotHubConnectionService = new IotHubConnectionService(iotHubConnectionString);
      _simulationTask = new SimulationTask(_simulationOptions, iotHubConnectionService, Int32.Parse(minutesToRunStr));
    }

    private static void Help()
    {
      Console.ForegroundColor = ConsoleColor.Green;
      Console.WriteLine("");
      Console.WriteLine("SETUP      - Setup the required information for the data generation.");
      Console.WriteLine("START      - Start the simulation of the devices updates.");
      Console.WriteLine("STATUS     - Print the current status of the configuration");
      Console.WriteLine("HELP       - Displays this page");
      Console.WriteLine("EXIT       - Closes this program");
      Console.WriteLine("");
      Console.ResetColor();
    }

    private static void Start()
    {
      if (_simulationTask == null)
      {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine("You must setup first before run the simulation.");
        Console.ResetColor();
        return;
      }

#pragma warning disable CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed
      Console.WriteLine($"Simulation will run for {_simulationOptions.SimulationTimeInSeconds} seconds.");
      _simulationTask.Start();
      ConsoleKeyInfo cki;
      do
      {
        Console.WriteLine("** If you want to stop the simulation press the key `Escape`.");
        cki = Console.ReadKey();
      } while (cki.Key != ConsoleKey.Escape && _simulationTask.GetSimulation().Status != Constants.SimulationStatusFinished);
      _simulationTask.Stop();
#pragma warning restore CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed
    }
  }
}
