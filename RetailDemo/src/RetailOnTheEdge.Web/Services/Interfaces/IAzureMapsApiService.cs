using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RetailOnTheEdge.Web.Models;

namespace RetailOnTheEdge.Web.Services.Interfaces
{
  public interface IAzureMapsApiService
  {
    Task CreateGeofence();

    Task ResetUserGeoposition();

    Task MoveUserInsideGeofence();

    Task RemoveCurrentGeofence();

    string GetCurrentGeofenceUdId();

    Task NotifyUserGeoposition(UserLocationModel userLocation);

    Task UpdateUnitState(UpdateUnitStateModel updateUnitState);
  }
}
