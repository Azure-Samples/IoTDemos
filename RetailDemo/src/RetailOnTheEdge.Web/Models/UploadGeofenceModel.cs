using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RetailOnTheEdge.Web.Models
{
  public class UploadGeofenceModel
  {
    public string Type { get; set; } = "FeatureCollection";

    public List<UploadGeofenceFeatureModel> Features { get; set; } = new List<UploadGeofenceFeatureModel>();
  }

  public class UploadGeofenceFeatureModel
  {
    public string Type { get; set; } = "Feature";

    public UploadGeofencePropertiesModel Properties { get; set; } = new UploadGeofencePropertiesModel();

    public UploadGeofenceGeometryModel Geometry { get; set; } = new UploadGeofenceGeometryModel();
  }

  public class UploadGeofencePropertiesModel
  {
    public string GeometryId { get; set; } = "1";
  }

  public class UploadGeofenceGeometryModel
  {
    public string Type { get; set; } = "Polygon";

    public List<List<List<double>>> Coordinates { get; set; } = new List<List<List<double>>>();
  }
}
