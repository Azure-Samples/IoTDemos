using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AzureMapsDemo.Web.Models;

namespace AzureMapsDemo.Web.Services.Interfaces
{
  public interface IAzureMapsApiService
  {
    Task CreateGeofence(List<List<double>> polygonCoordinates);

    Task RemoveCurrentGeofence();

    string GetCurrentGeofenceUdId();

    Task NotifyUserGeoposition(UserLocationModel userLocation);

    Task<bool> CheckGeofence(string deviceId, double latitude, double longitude);

    Task<UploadGeofenceModel> GetGeofence();
  }
}
