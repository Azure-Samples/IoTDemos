using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AzureMapsDemo.Web.Models
{
  public class GeofenceResourceLocationResponseModel
  {
    public string Udid { get; set; }

    public string Location { get; set; }

    public int SizeInBytes { get; set; }
  }
}
