using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RetailOnTheEdge.Web.Models;
using RetailOnTheEdge.Web.Options;
using RetailOnTheEdge.Web.Services.Interfaces;

namespace RetailOnTheEdge.Web.Controllers
{
  [Route("api/[controller]")]
  public class OrdersController : Controller
  {
    private static IInventoryService _inventoryService;

    public OrdersController(IInventoryService inventoryService)
    {
      _inventoryService = inventoryService;
    }

    [HttpPost]
    public async Task<IActionResult> Order([FromBody] OrderModel model)
    {
      await _inventoryService.CreateOrder(model);
      return Ok();
    }
  }
}
