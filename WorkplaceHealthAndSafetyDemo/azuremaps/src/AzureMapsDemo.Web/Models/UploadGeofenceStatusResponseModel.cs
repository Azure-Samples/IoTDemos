using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AzureMapsDemo.Web.Models
{
  public class UploadGeofenceStatusResponseModel
  {
    public string OperationId { get; set; }

    public string Status { get; set; }

    public string ResourceLocation { get; set; }
  }
}
