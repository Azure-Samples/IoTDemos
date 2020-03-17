using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using AzureMapsDemo.Web.Exceptions;
using AzureMapsDemo.Web.Extensions;
using AzureMapsDemo.Web.Models;
using AzureMapsDemo.Web.Options;
using AzureMapsDemo.Web.Services.Interfaces;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace AzureMapsDemo.Web.Services
{
  public class AzureMapsApiService : IAzureMapsApiService
  {
    [SuppressMessage("Microsoft.Usage", "CA2213:DisposableFieldsShouldBeDisposed", Justification = "Avoiding Improper Instantiation antipattern : https://docs.microsoft.com/en-us/azure/architecture/antipatterns/improper-instantiation/")]
    private static readonly HttpClient Client = new HttpClient(new HttpClientHandler { UseCookies = true });

    private static AzureMapsOptions _azureMapsOptions;
    private static string _currentGeofenceUdId;

    public AzureMapsApiService(AzureMapsOptions azureMapsOptions)
    {
      _azureMapsOptions = azureMapsOptions;
    }

    public string GetCurrentGeofenceUdId()
    {
      return _currentGeofenceUdId;
    }

    public async Task RemoveCurrentGeofence()
    {
      if (string.IsNullOrEmpty(_currentGeofenceUdId))
      {
        return;
      }

      var geofenceUdIdToRemove = _currentGeofenceUdId;
      _currentGeofenceUdId = string.Empty;
      var queryString = HttpUtility.ParseQueryString(string.Empty);
      // Request parameters
      queryString["subscription-key"] = _azureMapsOptions.Key;
      queryString["api-version"] = _azureMapsOptions.ApiVersion;
      var response = await Client.DeleteAsync($"{_azureMapsOptions.ApiEndpoint}/mapData/{geofenceUdIdToRemove}?{queryString}");
      response.EnsureSuccessStatusCode();
    }

    public async Task NotifyUserGeoposition(UserLocationModel userLocation)
    {
      if (string.IsNullOrEmpty(_currentGeofenceUdId))
      {
        return;
      }
      var queryString = HttpUtility.ParseQueryString(string.Empty);
      // Request parameters
      queryString["subscription-key"] = _azureMapsOptions.Key;
      queryString["api-version"] = _azureMapsOptions.ApiVersion;
      queryString["deviceId"] = userLocation.Name;
      queryString["udId"] = _currentGeofenceUdId;
      queryString["lat"] = $"{userLocation.Latitude}";
      queryString["lon"] = $"{userLocation.Longitude}";
      queryString["searchBuffer"] = "5";
      queryString["isAsync"] = "True";
      queryString["mode"] = "EnterAndExit";
      var response = await Client.GetAsync($"{_azureMapsOptions.ApiEndpoint}/spatial/geofence/json?{queryString}");
      response.EnsureSuccessStatusCode();
    }

    public async Task<UploadGeofenceModel> GetGeofence()
    {
      if (string.IsNullOrEmpty(_currentGeofenceUdId))
      {
        throw new GeofenceNotFoundException();
      }

      var queryString = HttpUtility.ParseQueryString(string.Empty);
      // Request parameters
      queryString["subscription-key"] = _azureMapsOptions.Key;
      queryString["api-version"] = _azureMapsOptions.ApiVersion;
      var response = await Client.GetAsync($"{_azureMapsOptions.ApiEndpoint}/mapData/{_currentGeofenceUdId}?{queryString}");
      response.EnsureSuccessStatusCode();
      var responseString = await response.Content.ReadAsStringAsync();
      return JsonConvert.DeserializeObject<UploadGeofenceModel>(responseString);
    }

    public async Task CreateGeofence(List<List<double>> polygonCoordinates)
    {
      var geometry = new UploadGeofenceGeometryModel();
      geometry.Coordinates.Add(polygonCoordinates);
      await this.UploadGeofence(geometry);
    }

    public async Task<bool> CheckGeofence(string deviceId, double latitude, double longitude)
    {
      if (string.IsNullOrEmpty(_currentGeofenceUdId))
      {
        return false;
      }

      var queryString = HttpUtility.ParseQueryString(string.Empty);
      // Request parameters
      queryString["subscription-key"] = _azureMapsOptions.Key;
      queryString["api-version"] = _azureMapsOptions.ApiVersion;
      queryString["deviceId"] = deviceId;
      queryString["udId"] = _currentGeofenceUdId;
      queryString["lat"] = $"{latitude}";
      queryString["lon"] = $"{longitude}";
      queryString["searchBuffer"] = "5";
      queryString["isAsync"] = "False";
      queryString["mode"] = "EnterAndExit";

      try
      {
        var response = await Client.GetAsync($"{_azureMapsOptions.ApiEndpoint}/spatial/geofence/json?{queryString}");
        response.EnsureSuccessStatusCode();
        var responseString = await response.Content.ReadAsStringAsync();
        var geofenceSyncResponse = JsonConvert.DeserializeObject<GeofenceSyncResponse>(responseString);
        return geofenceSyncResponse.Geometries.Count > 0 && geofenceSyncResponse.Geometries.Any(geometry => geometry.Distance < 0);
      }
      catch (Exception e)
      {
        return false;
      }
    }

    private async Task<GeofenceResourceLocationResponseModel> UploadGeofence(UploadGeofenceGeometryModel geometry)
    {
      await RemoveCurrentGeofence(); //Remove first if exists previous

      var now = DateTime.UtcNow;
      var properties = new UploadGeofencePropertiesModel();
      var uploadGeofenceFeatureModel = new UploadGeofenceFeatureModel { Geometry = geometry, Properties = properties };
      var features = new List<UploadGeofenceFeatureModel>() { uploadGeofenceFeatureModel };
      
      UploadGeofenceModel model = null;
      model = new UploadGeofenceModel
      {
        Features = features
      };

      var serializerSettings = new JsonSerializerSettings
      {
        ContractResolver = new CamelCasePropertyNamesContractResolver()
      };
      var body = JsonConvert.SerializeObject(model, serializerSettings);

      var content = new ByteArrayContent(Encoding.UTF8.GetBytes(body));
      var requestUri = $"{_azureMapsOptions.ApiEndpoint}/mapData/upload?api-version={_azureMapsOptions.ApiVersion}&subscription-key={_azureMapsOptions.Key}&dataFormat=geojson";
      content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

      var responseMessage = await Client.PostAsync(requestUri, content);
      responseMessage.EnsureSuccessStatusCode();
      var locationHeader = responseMessage.Headers.FirstOrDefault(header => string.Equals(header.Key, "Location", StringComparison.OrdinalIgnoreCase));
      if (locationHeader.Key == null)
      {
        throw new Exception("Can't get the Location header to know the status of the Geofence upload.");
      }

      // The Data Upload API is a long-running request with the following sequence of operations:
      // 1. Send the upload request
      // 2. Upload request "Accepted" but "In Progress"
      // 3. Upload request "Completed" successfully
      // We need to get the status until is Completed or we try to many times to unblock the process but should never happen.
      var tries = 0;
      while (tries < 100)
      {
        var uploadStatus = await GetUploadGeofenceStatus(locationHeader.Value.FirstOrDefault());
        if (uploadStatus != null && string.Equals(uploadStatus.Status, Constants.SucceededStatus))
        {
          var resourceLocationResponse = await GetResourceLocation(uploadStatus.ResourceLocation);
          _currentGeofenceUdId = resourceLocationResponse.Udid;
          return resourceLocationResponse;
        }
        else
        {
          await Task.Delay(200); // Wait 200 milliseconds before try again
        }
        tries++;
      }
      throw new Exception("Can't upload geofence.");
    }

    private async Task<UploadGeofenceStatusResponseModel> GetUploadGeofenceStatus(string uploadStatusUri)
    {
      var requestUri = $"{uploadStatusUri}&subscription-key={_azureMapsOptions.Key}";
      var responseMessage = await Client.GetAsync(requestUri);
      responseMessage.EnsureSuccessStatusCode();
      if (responseMessage.StatusCode == System.Net.HttpStatusCode.Created)
      {
        var responseString = await responseMessage.Content.ReadAsStringAsync();
        return JsonConvert.DeserializeObject<UploadGeofenceStatusResponseModel>(responseString);
      }
      else
      {
        return null;
      }
    }

    private async Task<GeofenceResourceLocationResponseModel> GetResourceLocation(string resourceLocationUri)
    {
      var requestUri = $"{resourceLocationUri}&subscription-key={_azureMapsOptions.Key}";
      var responseMessage = await Client.GetAsync(requestUri);
      responseMessage.EnsureSuccessStatusCode();
      if (responseMessage.StatusCode == System.Net.HttpStatusCode.OK)
      {
        var responseString = await responseMessage.Content.ReadAsStringAsync();
        return JsonConvert.DeserializeObject<GeofenceResourceLocationResponseModel>(responseString);
      }
      else
      {
        return null;
      }
    }
  }
}
