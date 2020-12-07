using System.Collections.Generic;
using System.Threading.Tasks;
using AdtGaDemo.Web.Models;
using AdtGaDemo.Web.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace AdtGaDemo.Web.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class TsiController : ControllerBase
  {
    private readonly ITsiDataGeneratorService _tsiDataGeneratorService;

    public TsiController(ILogger<TsiController> logger, ITsiDataGeneratorService tsiDataGeneratorService)
    {
      _tsiDataGeneratorService = tsiDataGeneratorService;
    }

    [HttpGet]
    public ActionResult<List<Dictionary<string, Dictionary<string, TsiDataPoint>>>> GetData()
    {
      return Ok(_tsiDataGeneratorService.GenerateData());
    }
  }
}
