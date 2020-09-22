using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RetailOnTheEdge.Web.Options
{
  public class AzureOptions
  {
    public AzureMapsOptions Maps { get; set; }

    public SqlOptions Sql { get; set; }

    public IoTCentralOptions IoTCentral { get; set; }
  }

  public class AzureMapsOptions
  {
    public string ApiEndpoint { get; set; }

    public string ApiVersion { get; set; }

    public string Key { get; set; }

    public string DatasetId { get; set; }

    public string TilesetId { get; set; }

    public string StateSetId { get; set; }

    public string UnitName { get; set; }
  }

  public class SqlOptions
  {
    public string ConnectionString { get; set; }
  }

  public class IoTCentralOptions
  {
    public string IoTCentralDomain { get; set; }

    public string IoTCentralApiToken { get; set; }

    public string DeviceId { get; set; }
  }
}
