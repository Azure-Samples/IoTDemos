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
  public class LocationsController : Controller
  {
    private static IMapsStorageService _mapsStorageService;

    public LocationsController(IMapsStorageService mapsStorageService)
    {
      _mapsStorageService = mapsStorageService;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserLocationModel>>> GetUsersLocations()
    {
      var locations = await _mapsStorageService.GetUsersLocations();
      return Ok(locations);
    }
  }
}
