using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RetailOnTheEdge.Web.Models
{
  public class OrderModel
  {
    public Guid CustomerId { get; set; }

    public List<OrderProductDetail> Products { get; set; }
  }

  public class OrderProductDetail
  {
    public Guid Code { get; set; }

    public int Quantity { get; set; }
  }
}
