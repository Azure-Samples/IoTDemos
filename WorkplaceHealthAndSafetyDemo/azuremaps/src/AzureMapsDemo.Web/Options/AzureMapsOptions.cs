using System;

namespace AzureMapsDemo.Web.Options
{
  public class AzureMapsOptions
  {
    public string ApiEndpoint { get; set; }

    public string ApiVersion { get; set; }

    public string Key { get; set; }

    public double FakeUserDefaultLatitude { get; set; }

    public double FakeUserDefaultLongitude { get; set; }

    public int LatitudeMinVariation { get; set; }

    public int LatitudeMaxVariation { get; set; }

    public int LongituteMinVariation { get; set; }

    public int LongituteMaxVariation { get; set; }

    public int UserStepDistanceInMeters { get; set; }

    public int UserExpirationTimeInMinutes { get; set; }
  }
}
