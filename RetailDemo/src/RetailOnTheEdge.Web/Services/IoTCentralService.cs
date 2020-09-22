using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using RetailOnTheEdge.Web.Models;
using RetailOnTheEdge.Web.Options;
using RetailOnTheEdge.Web.Services.Interfaces;

namespace RetailOnTheEdge.Web.Services
{
  public class IoTCentralService : IIoTCentralService
  {
    [SuppressMessage("Microsoft.Usage", "CA2213:DisposableFieldsShouldBeDisposed", Justification = "Avoiding Improper Instantiation antipattern : https://docs.microsoft.com/en-us/azure/architecture/antipatterns/improper-instantiation/")]
    private static HttpClient Client;

    private static AzureOptions _azureOptions;
    private readonly string ApiDeviceUrl;

    public IoTCentralService(AzureOptions azureOptions)
    {
      _azureOptions = azureOptions;
      ApiDeviceUrl = string.Format("https://{0}/api/preview/devices/{1}/modules/CameraCapture/properties",
        _azureOptions.IoTCentral.IoTCentralDomain,
        _azureOptions.IoTCentral.DeviceId);
      Client = InitClient();
    }

    public async Task<IoTCentralApiDeviceState> GetDeviceState()
    {
      var response = await Client.GetAsync(ApiDeviceUrl);
      response.EnsureSuccessStatusCode();
      var responseString = await response.Content.ReadAsStringAsync();
      return JsonConvert.DeserializeObject<IoTCentralApiDeviceState>(responseString);
    }

    public async Task SetVideoPathProperty(string value)
    {
      var state = new IoTCentralApiDeviceUpdateState
      {
        Manage = new IoTCentralApiUpdateManage
        {
          VideoPath = value
        }
      };
      var body = JsonConvert.SerializeObject(state);
      var content = new ByteArrayContent(Encoding.UTF8.GetBytes(body));
      content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
      var response = await Client.PutAsync(ApiDeviceUrl, content);
      response.EnsureSuccessStatusCode();
    }

    private HttpClient InitClient()
    {
      var httpClient = new HttpClient(new HttpClientHandler { UseCookies = true });
      httpClient.DefaultRequestHeaders.Add("Authorization", _azureOptions.IoTCentral.IoTCentralApiToken);
      return httpClient;
    }
  }
}
