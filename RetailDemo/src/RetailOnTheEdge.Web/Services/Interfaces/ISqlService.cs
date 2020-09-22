using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RetailOnTheEdge.Web.Models;

namespace RetailOnTheEdge.Web.Services.Interfaces
{
  public interface ISqlService
  {
    Task UpdateProductQuantity(Guid productId, int quantity);

    Task CreateOrder(Guid productId, Guid customerId, int quantity);

    Task<List<ProductModel>> QueryAllProducts();

    Task<ProductModel> QueryProductById(Guid code);

    Task ResetDemo();
  }
}
