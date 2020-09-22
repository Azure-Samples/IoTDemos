using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RetailOnTheEdge.Web.Models;
using RetailOnTheEdge.Web.Options;
using RetailOnTheEdge.Web.Services.Interfaces;

namespace RetailOnTheEdge.Web.Controllers
{
  [Route("api/[controller]")]
  public class ConfigController : Controller
  {
    private static AzureOptions _options;
    private static IInventoryService _inventoryService;

    public ConfigController(IInventoryService inventoryService, AzureOptions options)
    {
      _options = options;
      _inventoryService = inventoryService;
    }

    [HttpGet]
    public ActionResult<ConfigModel> GetConfig()
    {
      return Ok(
        new ConfigModel
        {
          Maps = new MapsModel {
            Key = _options.Maps.Key,
            Endpoint = _options.Maps.ApiEndpoint,
            Version = _options.Maps.ApiVersion,
            TilesetId = _options.Maps.TilesetId,
            StateSetId = _options.Maps.StateSetId,
            UnitName = _options.Maps.UnitName
          }
        });
    }

    [HttpPost("reset")]
    public async Task<ActionResult> ResetDemo()
    {
      await _inventoryService.ResetDemo();
      return Ok();
    }
  }
}
