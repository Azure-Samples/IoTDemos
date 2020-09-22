using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RetailOnTheEdge.Web.Models;
using RetailOnTheEdge.Web.Services.Interfaces;

namespace RetailOnTheEdge.Web.Controllers
{
  [Route("api/[controller]")]
  public class ProductsController : Controller
  {
    private static IInventoryService _inventoryService;

    public ProductsController(IInventoryService inventoryService)
    {
      _inventoryService = inventoryService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProductModel>>> GetAll()
    {
      var products = await _inventoryService.GetAllProducts();
      return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductModel>> GetProduct([FromRoute] Guid id)
    {
      var product = await _inventoryService.GetProductById(id);
      if (product == null)
      {
        return NotFound();
      }
      return Ok(product);
    }
  }
}
