using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Data.SqlClient;
using RetailOnTheEdge.Web.Models;
using RetailOnTheEdge.Web.Options;
using RetailOnTheEdge.Web.Services.Interfaces;

namespace RetailOnTheEdge.Web.Services
{
  public class SqlService : ISqlService
  {
    private static AzureOptions _azureOptions;

    public SqlService(AzureOptions azureOptions)
    {
      _azureOptions = azureOptions;
    }

    public async Task CreateOrder(Guid productId, Guid customerId, int quantity)
    {
      var queryString = $"INSERT INTO CustomerOrders (CreatedDate,DeliveryDate,CustomerId,ProductCode,Quantity) "
        + $" VALUES (CURRENT_TIMESTAMP, DATEADD(DAY, 1, CURRENT_TIMESTAMP), @CustomerId, @ProductCode, @Quantity);";
      using SqlConnection connection = new SqlConnection(_azureOptions.Sql.ConnectionString);
      SqlDataAdapter command = new SqlDataAdapter(queryString, connection);
      command.SelectCommand.Parameters.AddWithValue("@CustomerId", customerId);
      command.SelectCommand.Parameters.AddWithValue("@ProductCode", productId);
      command.SelectCommand.Parameters.AddWithValue("@Quantity", quantity);
      await connection.OpenAsync();
      await command.SelectCommand.ExecuteNonQueryAsync();
    }

    public async Task UpdateProductQuantity(Guid productId, int quantity)
    {
      var queryString = "UPDATE Products SET Stock = Stock - @Quantity WHERE Code = @ProductCode";
      using SqlConnection connection = new SqlConnection(_azureOptions.Sql.ConnectionString);
      SqlDataAdapter command = new SqlDataAdapter(queryString, connection);
      command.SelectCommand.Parameters.AddWithValue("@Quantity", quantity);
      command.SelectCommand.Parameters.AddWithValue("@ProductCode", productId);
      await connection.OpenAsync();
      await command.SelectCommand.ExecuteNonQueryAsync();
    }

    public async Task<List<ProductModel>> QueryAllProducts()
    {
      var products = new List<ProductModel>();
      using SqlConnection connection = new SqlConnection(_azureOptions.Sql.ConnectionString);
      await connection.OpenAsync();
      var results = await connection.QueryAsync<ProductModel>("SELECT * FROM products");
      return results.ToList();
    }

    public async Task<ProductModel> QueryProductById(Guid code)
    {
      using SqlConnection connection = new SqlConnection(_azureOptions.Sql.ConnectionString);
      await connection.OpenAsync();
      var results = await connection.QueryAsync<ProductModel>("SELECT * FROM products WHERE code = @Code", new { Code = code });
      return results.FirstOrDefault();
    }

    public async Task ResetDemo()
    {
      var queryString = $"EXEC [dbo].[ResetDemo];";
      using SqlConnection connection = new SqlConnection(_azureOptions.Sql.ConnectionString);
      SqlDataAdapter command = new SqlDataAdapter(queryString, connection);
      await connection.OpenAsync();
      await command.SelectCommand.ExecuteNonQueryAsync();
    }
  }
}
