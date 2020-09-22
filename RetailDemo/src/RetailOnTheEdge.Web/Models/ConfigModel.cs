using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RetailOnTheEdge.Web.Models
{
  public class ConfigModel
  {
    public MapsModel Maps { get; set; }
  }

  public class MapsModel
  {
    public string Key { get; set; }

    public string Endpoint { get; set; }

    public string Version { get; set; }

    public string TilesetId { get; set; }

    public string StateSetId { get; set; }

    public string UnitName { get; set; }
  }
}
