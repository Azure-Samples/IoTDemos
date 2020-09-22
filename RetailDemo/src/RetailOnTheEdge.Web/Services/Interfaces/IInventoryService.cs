using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RetailOnTheEdge.Web.Models;

namespace RetailOnTheEdge.Web.Services.Interfaces
{
  public interface IInventoryService
  {
    Task ResetDemo();

    Task CreateOrder(OrderModel order);

    Task<List<ProductModel>> GetAllProducts();

    Task<ProductModel> GetProductById(Guid id);
  }
}
