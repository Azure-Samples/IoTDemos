using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.EventGrid.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Extensions.EventGrid;
using Microsoft.Azure.WebJobs.Extensions.SignalRService;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Linq;

namespace DigitalTwinsToTsi
{
  public static class SignalRFunctions
  {
    private static readonly Dictionary<string, string> EventMappings = new Dictionary<string, string>
    {
      { "microsoft.iot.telemetry", "telemetry" },
      { "microsoft.digitaltwins.twin.update", "twin-update" }
    };

    [FunctionName("negotiate")]
    public static SignalRConnectionInfo GetSignalRInfo(
        [HttpTrigger(AuthorizationLevel.Anonymous, "POST", Route = "signalr/negotiate")] HttpRequest req,
        [SignalRConnectionInfo(HubName = "dttelemetry")] SignalRConnectionInfo connectionInfo)
    {
      return connectionInfo;
    }

    [FunctionName("broadcast")]
    public static Task SendMessage(
        [EventGridTrigger] EventGridEvent eventGridEvent,
        [SignalR(HubName = "dttelemetry")] IAsyncCollector<SignalRMessage> signalRMessages,
        ILogger log)
    {
      if (eventGridEvent == null || !EventMappings.TryGetValue(eventGridEvent.EventType.ToLowerInvariant(), out var target))
      {
        log.LogInformation($"Unrecognized event type: {eventGridEvent?.EventType}, skipping");
        return Task.CompletedTask;
      }

      var dtName = eventGridEvent.Topic.Split("/", StringSplitOptions.RemoveEmptyEntries).Last();
      var dtId = eventGridEvent.Subject;
      var evt = JsonConvert.DeserializeObject<JObject>(eventGridEvent.Data.ToString());
      var data = evt["data"];

      log.LogInformation($"Received event from {dtName} for {dtId} with content {data.ToString()}");

      return signalRMessages.AddAsync(new SignalRMessage
      {
        Target = target,
        Arguments = new[] { new { dtId, data } }
      });
    }
  }
}
