using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AzureMapsDemo.Web.Models
{
  public class GeoCoordinateModel
  {
    public GeoCoordinateModel(double latitude, double longitude, double altitude = 0)
    {
      Latitude = latitude;
      Longitude = longitude;
    }

    public double Latitude { get; set; }

    public double Longitude { get; set; }
  }
}
