using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RetailOnTheEdge.Web.Options;
using RetailOnTheEdge.Web.Services.Interfaces;

namespace RetailOnTheEdge.Web.Controllers
{
  [Route("api/[controller]")]
  public class LocationController : Controller
  {
    private static IAzureMapsApiService _azureMapsApiService;
    private static AzureOptions _options;

    public LocationController(IAzureMapsApiService azureMapsApiService, AzureOptions options)
    {
      _azureMapsApiService = azureMapsApiService;
      _options = options;
    }

    [HttpPost("reset")]
    public async Task<IActionResult> Reset()
    {
      await _azureMapsApiService.CreateGeofence();
      await _azureMapsApiService.ResetUserGeoposition();
      return Ok();
    }

    [HttpPost("move")]
    public async Task<IActionResult> MoveInside()
    {
      await _azureMapsApiService.MoveUserInsideGeofence();
      return Ok();
    }
  }
}
