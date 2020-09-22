using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RetailOnTheEdge.Web.Models
{
  public class MapsStateSetUpdateRequest
  {
    public List<MapsStateSetUpdate> States { get; set; }
  }

  public class MapsStateSetUpdate
  {
    public string KeyName { get; set; }

    public bool Value { get; set; }

    public DateTime EventTimestamp { get; set; }
  }
}
