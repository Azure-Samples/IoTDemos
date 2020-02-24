using System;

namespace AzureMapsDemo.Web.Models
{
  public class UserLocationModel
  {
    public string Id { get; set; }

    public string Name { get; set; }

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public bool IsReal { get; set; }

    public DateTime LastUpdated { get; set; }

    public bool IsInsideGeofence { get; set; }
  }
}
