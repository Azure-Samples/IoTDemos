using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RetailOnTheEdge.Web.Models;
using RetailOnTheEdge.Web.Options;
using RetailOnTheEdge.Web.Services.Interfaces;

namespace RetailOnTheEdge.Web.Services
{
  public class InventoryService : IInventoryService
  {
    private static ISqlService _sqlService;
    private static IIoTCentralService _ioTCentralService;

    public InventoryService(
      ISqlService sqlService,
      IIoTCentralService ioTCentralService)
    {
      _sqlService = sqlService;
      _ioTCentralService = ioTCentralService;
    }

    public async Task CreateOrder(OrderModel order)
    {
      foreach (var productDetail in order.Products)
      {
        await CreateProductOrder(order.CustomerId, productDetail);
      }
    }

    public async Task ResetDemo()
    {
      await _sqlService.ResetDemo();
      try
      {
        var deviceState = await _ioTCentralService.GetDeviceState();
        var videoPathDesiredValue = deviceState.Manage.Metadata.VideoPath.DesiredValue;
        if (string.Equals(videoPathDesiredValue, Constants.LowStockedShelf, StringComparison.OrdinalIgnoreCase))
        {
          await _ioTCentralService.SetVideoPathProperty(Constants.StockedShelf);
        }
      }
      catch (Exception e)
      {
        throw new Exception($"Can't update desired property: {e.Message}");
      }
    }

    public Task<List<ProductModel>> GetAllProducts()
    {
      return _sqlService.QueryAllProducts();
    }

    public Task<ProductModel> GetProductById(Guid id)
    {
      return _sqlService.QueryProductById(id);
    }

    private async Task CreateProductOrder(Guid customerId, OrderProductDetail orderProductDetail)
    {
      await _sqlService.CreateOrder(orderProductDetail.Code, customerId, orderProductDetail.Quantity);
      await _sqlService.UpdateProductQuantity(orderProductDetail.Code, orderProductDetail.Quantity);
      // Only for the demo product check if we need to switch the video
      if (orderProductDetail.Code == Constants.DemoProductId)
      {
        try
        {
          var deviceState = await _ioTCentralService.GetDeviceState();
          var videoPathDesiredValue = deviceState.Manage.Metadata.VideoPath.DesiredValue;
          if (string.Equals(videoPathDesiredValue, Constants.StockedShelf, StringComparison.OrdinalIgnoreCase))
          {
            await _ioTCentralService.SetVideoPathProperty(Constants.LowStockedShelf);
          }
        }
        catch (Exception e)
        {
          throw new Exception($"Can't update desired property: {e.Message}");
        }
      }
    }
  }
}
