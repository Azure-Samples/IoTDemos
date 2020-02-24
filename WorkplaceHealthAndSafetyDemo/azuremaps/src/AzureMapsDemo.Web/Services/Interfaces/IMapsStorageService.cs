using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AzureMapsDemo.Web.Models;

namespace AzureMapsDemo.Web.Services.Interfaces
{
  public interface IMapsStorageService
  {
    void Register(UserLocationModel mapsUserCoords);

    bool UserExists(string userId);

    void RemoveUser(string userId);

    UserLocationModel UpdateUserLocation(string userId, UpdateUserLocationModel updateUserLocation);

    Task<List<UserLocationModel>> GetUsersLocations();
  }
}
