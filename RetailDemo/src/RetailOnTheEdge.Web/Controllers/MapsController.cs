using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RetailOnTheEdge.Web.Models;
using RetailOnTheEdge.Web.Options;
using RetailOnTheEdge.Web.Services.Interfaces;

namespace RetailOnTheEdge.Web.Controllers
{
  [Route("api/[controller]")]
  public class MapsController : Controller
  {
    private static IAzureMapsApiService _azureMapsApiService;

    public MapsController(IAzureMapsApiService azureMapsApiService, AzureOptions options)
    {
      _azureMapsApiService = azureMapsApiService;
    }

    [HttpPost("unit")]
    public async Task<ActionResult> UpdateUnitState([FromBody] UpdateUnitStateModel updateUnitState)
    {
      await _azureMapsApiService.UpdateUnitState(updateUnitState);
      return NoContent();
    }
  }
}
