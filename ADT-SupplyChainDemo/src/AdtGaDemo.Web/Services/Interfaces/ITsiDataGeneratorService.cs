using System.Collections.Generic;
using System.Threading.Tasks;
using AdtGaDemo.Web.Models;

namespace AdtGaDemo.Web.Services.Interfaces
{
  public interface ITsiDataGeneratorService
  {
    List<Dictionary<string, Dictionary<string, TsiDataPoint>>> GenerateData();
  }
}
