using System;
using System.Threading.Tasks;
using RetailOnTheEdge.Web.Models;

namespace RetailOnTheEdge.Web.Services.Interfaces
{
  public interface IIoTCentralService
  {
    Task<IoTCentralApiDeviceState> GetDeviceState();

    Task SetVideoPathProperty(string value);
  }
}
