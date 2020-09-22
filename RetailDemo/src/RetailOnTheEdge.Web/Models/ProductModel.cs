using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RetailOnTheEdge.Web.Models
{
  public class ProductModel
  {
    public Guid Code { get; set; }

    public string Name { get; set; }

    public int Rating { get; set; }

    public Decimal Price { get; set; }
  }
}
