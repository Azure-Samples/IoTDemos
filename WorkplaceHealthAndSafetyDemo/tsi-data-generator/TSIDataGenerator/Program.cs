using Microsoft.Azure.Devices;
using Microsoft.Azure.Devices.Shared;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TSIDataGenerator.Model.IoTHub;

namespace TSIDataGenerator
{
    public class Program
    {
        private static readonly int NumberOfDevices = Convert.ToInt32(ConfigurationManager.AppSettings["NumberOfDevices"]);
        private static readonly int TimeBetweenMessagesInSeconds = Convert.ToInt32(ConfigurationManager.AppSettings["TimeBetweenMessagesInSeconds"]);
        private static readonly int TotalTimeInHours = Convert.ToInt32(ConfigurationManager.AppSettings["TotalTimeInHours"]);
        private static readonly string IoTHubConnectionString = ConfigurationManager.AppSettings["IoTHubConnectionString"];
        private static RegistryManager registryManager;

        public static void Main(string[] args)
        {
            var sw = new Stopwatch();
            sw.Start();
            PushDataToIoTHub();
            sw.Stop();

            var timeInfo = sw.Elapsed.Hours > 0 ? $"{sw.Elapsed.Hours} hours" : sw.Elapsed.Minutes > 0 ? $"{sw.Elapsed.Minutes} minutes" : $"{sw.Elapsed.Seconds} seconds";
            Trace.WriteLine($"Finished. Time Elapsed: {timeInfo}.");

            Console.WriteLine("Press any key to exit...");
            Console.ReadLine();
        }

        public static async void PushDataToIoTHub()
        {
            try
            {
                registryManager = RegistryManager.CreateFromConnectionString(IoTHubConnectionString);
                ThreadPool.SetMinThreads(NumberOfDevices - 1, 0);
                var host = IoTHubConnectionString.Substring(IoTHubConnectionString.IndexOf("=") + 1, IoTHubConnectionString.IndexOf(".net;") - 5);
                var devices = new List<SimulatedDevice>();
                string fmt = "000.##";
                for (var i = 0; i < NumberOfDevices; i++)
                {
                    var deviceId = $"TSI-{(i + 1).ToString(fmt)}";
                    var device = await CreateDeviceIdentity(deviceId);
                    var deviceKey = device.Authentication.SymmetricKey.PrimaryKey;
                    var simulatedDevice = new SimulatedDevice(host, deviceId, deviceKey, TotalTimeInHours, TimeBetweenMessagesInSeconds);
                    devices.Add(simulatedDevice);
                }

                Parallel.ForEach(
                    devices,
                    new ParallelOptions { MaxDegreeOfParallelism = NumberOfDevices },
                    (batch, state, index) =>
                    {
                        var device = devices.ElementAt((int)index);
                        if (string.IsNullOrEmpty(Thread.CurrentThread.Name))
                        {
                            Thread.CurrentThread.Name = device.DeviceId;
                        }
                        // Start sending test data
                        try
                        {
                            if (index < devices.Count())
                            {
                                device.StartSendingMessagesAsync().Wait();
                            }
                        }
                        catch (Exception e)
                        {
                            Trace.TraceError($"Exception with thread {index}: " + e.StackTrace);
                            throw;
                        }
                    });

                Trace.WriteLine("Finished sending data.");
            }
            catch (Exception e)
            {
                Trace.TraceError("Unexpected error. {0}", e.StackTrace);
                throw;
            }
        }

        private static async Task<Device> CreateDeviceIdentity(string deviceId)
        {
            Device device;
            try
            {
                device = await registryManager.AddDeviceAsync(new Device(deviceId) { Capabilities = new DeviceCapabilities() { IotEdge = true } });
            }
            catch (Exception e)
            {
                if (e.Message.Contains("DeviceAlreadyExists"))
                {
                    Console.WriteLine("Found existing device for: " + deviceId);
                    device = await registryManager.GetDeviceAsync(deviceId);
                }
                else
                {
                    Console.WriteLine(e.StackTrace);
                    throw e;
                }
            }

            return device;
        }
    }
}
