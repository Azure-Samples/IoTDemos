using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AzureMapsDemo.Web.Models
{
  public class GeofenceSyncResponse
  {
    public List<GeofenceSyncGeometry> Geometries { get; set; }
  }

  public class GeofenceSyncGeometry
  {
    public string DeviceId { get; set; }

    public string UdId { get; set; }

    public string GeometryId { get; set; }

    public double Distance { get; set; }

    public double NearestLat { get; set; }

    public double NearestLon { get; set; }
  }
}
