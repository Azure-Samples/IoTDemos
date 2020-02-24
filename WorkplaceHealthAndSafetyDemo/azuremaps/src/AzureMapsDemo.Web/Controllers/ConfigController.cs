using AzureMapsDemo.Web.Models;
using AzureMapsDemo.Web.Options;
using Microsoft.AspNetCore.Mvc;

namespace AzureMapsDemo.Web.Controllers
{
  [Route("api/[controller]")]
  public class ConfigController : Controller
  {
    private static AzureMapsOptions _azureMapsOptions;

    public ConfigController(AzureMapsOptions azureMapsOptions)
    {
      _azureMapsOptions = azureMapsOptions;
    }

    [HttpGet]
    public MapsConfigModel GetConfig()
    {
      return new MapsConfigModel
      {
        Key = _azureMapsOptions.Key
      };
    }
  }
}
