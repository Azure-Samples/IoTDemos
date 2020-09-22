using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AzureMapsDemo.Web.Models
{
  public class CreateGeofenceRequestModel
  {
    public List<List<double>> Coordinates { get; set; }
  }
}
