using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AzureMapsDemo.Web.Exceptions;
using AzureMapsDemo.Web.Extensions;
using AzureMapsDemo.Web.Models;
using AzureMapsDemo.Web.Options;
using AzureMapsDemo.Web.Services.Interfaces;

namespace AzureMapsDemo.Web.Services
{
  public class MapsStorageService : IMapsStorageService
  {
    private static List<UserLocationModel> UsersLocations = new List<UserLocationModel>();
    private static List<UserLocationModel> FakeUsers;
    private static AzureMapsOptions _azureMapsOptions;
    private static readonly Random random = new Random();
    private static IAzureMapsApiService _azureMapsApiService;

    public MapsStorageService(IAzureMapsApiService azureMapsApiService, AzureMapsOptions azureMapsOptions)
    {
      _azureMapsOptions = azureMapsOptions;
      _azureMapsApiService = azureMapsApiService;
      FakeUsers = GetFakeUsers(_azureMapsOptions.FakeUserDefaultLatitude, _azureMapsOptions.FakeUserDefaultLongitude);
    }

    public void Register(UserLocationModel userLocation)
    {
      ClearExpiredUsers();
      var storedUserLocation = UsersLocations.FirstOrDefault(user => string.Equals(user.Id, userLocation.Id, StringComparison.OrdinalIgnoreCase));
      if (storedUserLocation == null)
      {
        userLocation.LastUpdated = DateTime.Now;
        UsersLocations.Add(userLocation);
        // Always generate new fake users after add the first user in the list.
        if (UsersLocations.Count == 1)
        {
          FakeUsers = GetFakeUsers(userLocation.Latitude, userLocation.Longitude);
        }
      }
      else
      {
        storedUserLocation.Latitude = userLocation.Latitude;
        storedUserLocation.Longitude = userLocation.Longitude;
        userLocation.LastUpdated = DateTime.Now;
      }
    }

    public bool UserExists(string userId)
    {
      ClearExpiredUsers();
      var user = UsersLocations.FirstOrDefault(userLocation => string.Equals(userId, userLocation.Id, StringComparison.OrdinalIgnoreCase));
      if (user == null)
      {
        return false;
      }
      user.LastUpdated = DateTime.Now;
      return true;
    }

    public void RemoveUser(string userId)
    {
      var removedUsers = UsersLocations.RemoveAll(userLocation => string.Equals(userId, userLocation.Id, StringComparison.OrdinalIgnoreCase));
      if (removedUsers > 0 && UsersLocations.Count == 0)
      {
        FakeUsers = GetFakeUsers(_azureMapsOptions.FakeUserDefaultLatitude, _azureMapsOptions.FakeUserDefaultLongitude);
      }
    }

    public UserLocationModel UpdateUserLocation(string userId, UpdateUserLocationModel updateUserLocation)
    {
      ClearExpiredUsers();
      var storedUserLocation = UsersLocations.FirstOrDefault(user => string.Equals(user.Id, userId, StringComparison.OrdinalIgnoreCase));
      if (storedUserLocation == null)
      {
        throw new UserNotFoundException($"User not found with the id: {userId}");
      }

      var currentPosition = new GeoCoordinateModel(storedUserLocation.Latitude, storedUserLocation.Longitude);
      GeoCoordinateModel newPosition = null;
      switch (updateUserLocation.Direction)
      {
        case Direction.North:
          newPosition = currentPosition.CalculateDerivedPosition(_azureMapsOptions.UserStepDistanceInMeters, 0);
          break;

        case Direction.South:
          newPosition = currentPosition.CalculateDerivedPosition(_azureMapsOptions.UserStepDistanceInMeters, 180);
          break;

        case Direction.West:
          newPosition = currentPosition.CalculateDerivedPosition(_azureMapsOptions.UserStepDistanceInMeters, -90);
          break;

        case Direction.East:
          newPosition = currentPosition.CalculateDerivedPosition(_azureMapsOptions.UserStepDistanceInMeters, 90);
          break;
      }

      storedUserLocation.Latitude = newPosition.Latitude;
      storedUserLocation.Longitude = newPosition.Longitude;
      storedUserLocation.LastUpdated = DateTime.Now;
      return storedUserLocation;
    }

    public async Task<List<UserLocationModel>> GetUsersLocations()
    {
      ClearExpiredUsers();
      var allUsers = new List<UserLocationModel>(UsersLocations.Count + FakeUsers.Count);
      allUsers.AddRange(UsersLocations);
      allUsers.AddRange(FakeUsers);
      allUsers.ForEach(async user =>
      {
        user.IsInsideGeofence = await _azureMapsApiService.CheckGeofence(user.Name, user.Latitude, user.Longitude);
      });
      return allUsers;
    }

    private void ClearExpiredUsers()
    {
      var removedUsers = UsersLocations.RemoveAll(userLocation => userLocation.LastUpdated.AddMinutes(_azureMapsOptions.UserExpirationTimeInMinutes) < DateTime.Now);
      if (removedUsers > 0 && UsersLocations.Count == 0)
      {
        FakeUsers = GetFakeUsers(_azureMapsOptions.FakeUserDefaultLatitude, _azureMapsOptions.FakeUserDefaultLongitude);
      }
    }

    private List<UserLocationModel> GetFakeUsers(double latitude, double longitude)
    {
      return new List<UserLocationModel>
      {
        GetFakeUserByName("John", latitude, longitude),
        GetFakeUserByName("Jake", latitude, longitude),
        GetFakeUserByName("Sue", latitude, longitude),
        GetFakeUserByName("Pete", latitude, longitude)
      };
    }

    private UserLocationModel GetFakeUserByName(string name, double latitude, double longitude)
    {
      return new UserLocationModel
      {
        Id = Guid.NewGuid().ToString(),
        Name = name,
        Latitude = GetRandomPosition(latitude, true),
        Longitude = GetRandomPosition(longitude, false),
        IsReal = false,
        IsInsideGeofence = false
      };
    }

    private double GetRandomPosition(double reference, bool isLatitude)
    {
      // Min | Max Position change.
      // Latitude:  +-0.0003, +-0.0009
      // Longitude: +-0.0010, +-0.0050
      var latitudeRefVariation = (double)random.Next(_azureMapsOptions.LatitudeMinVariation, _azureMapsOptions.LatitudeMaxVariation) / 10000;
      latitudeRefVariation = random.Next(2) == 1 ? latitudeRefVariation : latitudeRefVariation * -1;
      var longitudeRefVariation = (double)random.Next(_azureMapsOptions.LongituteMinVariation, _azureMapsOptions.LongituteMaxVariation) / 1000;
      longitudeRefVariation = random.Next(2) == 1 ? longitudeRefVariation : longitudeRefVariation * -1;
      return isLatitude ? reference + latitudeRefVariation : reference + longitudeRefVariation;
    }
  }
}
