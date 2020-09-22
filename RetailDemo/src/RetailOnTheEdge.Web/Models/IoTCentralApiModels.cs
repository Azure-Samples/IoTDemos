using System;
using Newtonsoft.Json;

namespace RetailOnTheEdge.Web.Models
{
  public class IoTCentralApiDeviceState
  {
    public IoTCentralApiManage Manage { get; set; }
  }

  public class IoTCentralApiManage
  {
    public string VideoPath { get; set; }

    [JsonProperty("$metadata")]
    public IoTCentralApiMetadata Metadata { get; set; }
  }

  public class IoTCentralApiMetadata
  {
    public IoTCentralApiVideoPath VideoPath { get; set; }
  }

  public class IoTCentralApiVideoPath
  {
    public string DesiredValue { get; set; }

    public string DesiredLastUpdatedTimestamp { get; set; }

    public int DesiredVersion { get; set; }
  }

  public class IoTCentralApiDeviceUpdateState
  {
    [JsonProperty("manage")]
    public IoTCentralApiUpdateManage Manage { get; set; }
  }

  public class IoTCentralApiUpdateManage
  {
    public string VideoPath { get; set; }
  }
}
