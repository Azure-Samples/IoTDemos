using System;
using System.Collections.Generic;
using System.Configuration;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.Devices.Client;
using Newtonsoft.Json;

namespace TSIDataGenerator.Model.IoTHub
{
    public class SimulatedDevice
    {
        private DeviceClient _deviceClient;

        private readonly Random _rand = new Random();

        private readonly int _waitingTimeInSeconds;

        private readonly int _totalTimeInHours;

        public string DeviceId { get; set; }

        public SimulatedDevice(string host, string deviceName, string deviceKey, int totalTimeInHours, int waitingTimeInSeconds)
        {
            this.DeviceId = deviceName;
            _waitingTimeInSeconds = waitingTimeInSeconds;
            _totalTimeInHours = totalTimeInHours;
            if (_deviceClient == null)
            {
                _deviceClient = DeviceClient.Create(host, new DeviceAuthenticationWithRegistrySymmetricKey(this.DeviceId, deviceKey), Microsoft.Azure.Devices.Client.TransportType.Amqp);
                _deviceClient.ProductInfo = deviceName;
            }
        }

        public async Task StartSendingMessagesAsync()
        {
            var maxPersonNoPPE = Convert.ToInt32(ConfigurationManager.AppSettings["MaxPersonNoPPE"]);
            var maxPersonSafetyVest = Convert.ToInt32(ConfigurationManager.AppSettings["MaxPersonSafetyVest"]);
            var maxPersonHardHat = Convert.ToInt32(ConfigurationManager.AppSettings["MaxPersonHardHat"]);
            var totalTimeOfMessages = (_totalTimeInHours * 60 * 60 / _waitingTimeInSeconds);
            var eventTime = DateTime.Now;
            for (var i = 0; i < totalTimeOfMessages; i++)
            {
                await SendDeviceMessageAsync(eventTime, maxPersonNoPPE, maxPersonSafetyVest, maxPersonHardHat);
                await Task.Delay(100);
                eventTime = eventTime.AddSeconds(_waitingTimeInSeconds);
            }
        }

        private async Task SendDeviceMessageAsync(DateTime eventTime, int maxPersonNoPPE, int maxPersonSafetyVest, int maxPersonHardHat)
        {
            // Create JSON message
            var messageBody = new
            {
                message_type = "metrics",
                timestamp = eventTime,
                PersonNoPPE = double.Parse($"{ _rand.Next(maxPersonNoPPE)}"),
                PersonSafetyVest = double.Parse($"{ _rand.Next(maxPersonSafetyVest)}"),
                PersonHardHat = double.Parse($"{ _rand.Next(maxPersonHardHat)}"),
            };

            var messageString = JsonConvert.SerializeObject(messageBody);

            var message = new Message(Encoding.ASCII.GetBytes(messageString))
            {
              ContentEncoding = "utf-8",
              ContentType = "application/json"
            };

            // Send the telemetry message
            await _deviceClient.SendEventAsync(message);
            Console.WriteLine("{0} > DeviceId: {1} Sending message: {2}", eventTime, DeviceId, messageString);
        }
    }
}
