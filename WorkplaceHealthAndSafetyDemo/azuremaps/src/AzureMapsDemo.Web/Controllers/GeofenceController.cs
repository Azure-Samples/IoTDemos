using System.Threading.Tasks;
using AzureMapsDemo.Web.Exceptions;
using AzureMapsDemo.Web.Models;
using AzureMapsDemo.Web.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AzureMapsDemo.Web.Controllers
{
  [Route("api/[controller]")]
  public class GeofenceController : Controller
  {
    private static IAzureMapsApiService _azureMapsApiService;
    public GeofenceController( IAzureMapsApiService azureMapsApiService)
    {
      _azureMapsApiService = azureMapsApiService;
    }

    [HttpGet]
    public async Task<ActionResult<UploadGeofenceModel>> GetGeofence()
    {
      try
      {
        return Ok(await _azureMapsApiService.GetGeofence());
      }
      catch (GeofenceNotFoundException)
      {
        return Accepted();
      }
    }

    [HttpPost]
    public async Task<ActionResult> CreateGeofence([FromBody] CreateGeofenceRequestModel createGeofenceRequest)
    {
      if (createGeofenceRequest.Coordinates == null || createGeofenceRequest.Coordinates.Count == 0)
      {
        return BadRequest("List of coordinates of the polygon is required.");
      }

      await _azureMapsApiService.CreateGeofence(createGeofenceRequest.Coordinates);

      return Ok();
    }
  }
}
