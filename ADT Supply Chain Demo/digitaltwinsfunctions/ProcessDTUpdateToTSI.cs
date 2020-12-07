using System.Threading.Tasks;
using System.Text;
using System.Collections.Generic;
using System;
using Microsoft.Azure.EventHubs;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace DigitalTwinsToTsi
{
  public static class ProcessDTUpdateToTSI
  {
    [FunctionName("ProcessDTUpdateToTSI")]
    public static async Task Run(
        [EventHubTrigger("twins-event-hub", Connection = "EventHubAppSetting-Twins")]EventData myEventHubMessage,
        [EventHub("tsi-event-hub", Connection = "EventHubAppSetting-TSI")]IAsyncCollector<string> outputEvents,
        ILogger log)
    {
      JObject message = (JObject)JsonConvert.DeserializeObject(Encoding.UTF8.GetString(myEventHubMessage.Body));
      log.LogInformation("Reading event:" + message.ToString());

      // Read values that are replaced or added
      Dictionary<string, object> tsiUpdate = new Dictionary<string, object>();
      foreach (var operation in message["patch"])
      {
        if (operation["op"].ToString() == "replace" || operation["op"].ToString() == "add")
        {
          string path = operation["path"].ToString().Substring(1);
          path = path.Replace("/", ".");
          tsiUpdate.Add(path, operation["value"]);
        }
      }
      //Send an update if updates exist
      if (tsiUpdate.Count > 0)
      {
        tsiUpdate.Add("$dtId", myEventHubMessage.Properties["cloudEvents:subject"]);
        tsiUpdate.Add("timestamp", DateTime.Now);
        await outputEvents.AddAsync(JsonConvert.SerializeObject(tsiUpdate));
      }
    }
  }
}
