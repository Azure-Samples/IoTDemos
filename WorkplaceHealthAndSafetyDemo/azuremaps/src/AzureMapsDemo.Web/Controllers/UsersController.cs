using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AzureMapsDemo.Web.Exceptions;
using AzureMapsDemo.Web.Models;
using AzureMapsDemo.Web.Options;
using AzureMapsDemo.Web.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AzureMapsDemo.Web.Controllers
{
  [Route("api/[controller]")]
  public class UsersController : Controller
  {
    private static IMapsStorageService _mapsStorageService;
    private static IAzureMapsApiService _azureMapsApiService;
    private static AzureMapsOptions _azureMapsOptions;

    public UsersController(IMapsStorageService mapsStorageService, IAzureMapsApiService azureMapsApiService, AzureMapsOptions azureMapsOptions)
    {
      _mapsStorageService = mapsStorageService;
      _azureMapsApiService = azureMapsApiService;
      _azureMapsOptions = azureMapsOptions;
    }

    [HttpPost]
    public ActionResult RegisteredUserModel([FromBody] UserLocationModel userLocation)
    {
      if (string.IsNullOrEmpty(userLocation.Id))
      {
        return BadRequest("Id of the user is required.");
      }

      if (string.IsNullOrEmpty(userLocation.Name))
      {
        return BadRequest("Name of the user is required.");
      }

      userLocation.IsReal = true; // Set always to true if using this endpoint
      _mapsStorageService.Register(userLocation);
      return Ok();
    }

    [HttpPut("{userId}/location")]
    public ActionResult UpdateUserGeolocation([FromRoute] string userId, [FromBody] UpdateUserLocationModel updateUserLocation)
    {
      try
      {
        var userLocation = _mapsStorageService.UpdateUserLocation(userId, updateUserLocation);
        _azureMapsApiService.NotifyUserGeoposition(userLocation);
        return Ok();
      }
      catch (UserNotFoundException e)
      {
        return BadRequest(e.Message);
      }
    }

    [HttpGet("{userId}")]
    public ActionResult UserExists([FromRoute] string userId)
    {
      return Ok(_mapsStorageService.UserExists(userId));
    }

    [HttpDelete("{userId}")]
    public ActionResult UserRemove([FromRoute] string userId)
    {
      _mapsStorageService.RemoveUser(userId);
      return Ok();
    }
  }
}
