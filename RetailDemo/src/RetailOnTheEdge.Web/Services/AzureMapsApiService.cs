using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using RetailOnTheEdge.Web.Extensions;
using RetailOnTheEdge.Web.Models;
using RetailOnTheEdge.Web.Options;
using RetailOnTheEdge.Web.Services.Interfaces;

namespace RetailOnTheEdge.Web.Services
{
  public class AzureMapsApiService : IAzureMapsApiService
  {
    [SuppressMessage("Microsoft.Usage", "CA2213:DisposableFieldsShouldBeDisposed", Justification = "Avoiding Improper Instantiation antipattern : https://docs.microsoft.com/en-us/azure/architecture/antipatterns/improper-instantiation/")]
    private static readonly HttpClient Client = new HttpClient(new HttpClientHandler { UseCookies = true });

    private static AzureOptions _azureOptions;
    private static string _currentGeofenceUdId;
    private const string DeviceName = "UserName";
    private const string SucceededStatus = "Succeeded";

    public AzureMapsApiService(AzureOptions azureOptions)
    {
      _azureOptions = azureOptions;
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
      queryString["subscription-key"] = _azureOptions.Maps.Key;
      queryString["api-version"] = _azureOptions.Maps.ApiVersion;
      var response = await Client.DeleteAsync($"{_azureOptions.Maps.ApiEndpoint}/mapData/{geofenceUdIdToRemove}?{queryString}");
      response.EnsureSuccessStatusCode();
    }

    public async Task ResetUserGeoposition()
    {
      var currentPosition = new GeoCoordinateModel(Constants.FakeUserDefaultLatitude, Constants.FakeUserDefaultLongitude);
      var ratioDistance = Constants.GeofenceRatioInMeters * 2;
      var userPosition = currentPosition.CalculateDerivedPosition(ratioDistance, -90);
      await NotifyUserGeoposition(new UserLocationModel { Latitude = userPosition.Latitude, Longitude = userPosition.Longitude });
    }

    public async Task MoveUserInsideGeofence()
    {
      var currentPosition = new GeoCoordinateModel(Constants.FakeUserDefaultLatitude, Constants.FakeUserDefaultLongitude);
      await NotifyUserGeoposition(new UserLocationModel { Latitude = currentPosition.Latitude, Longitude = currentPosition.Longitude });
    }

    public async Task NotifyUserGeoposition(UserLocationModel userLocation)
    {
      if (string.IsNullOrEmpty(_currentGeofenceUdId))
      {
        return;
      }
      var queryString = HttpUtility.ParseQueryString(string.Empty);
      // Request parameters
      queryString["subscription-key"] = _azureOptions.Maps.Key;
      queryString["api-version"] = _azureOptions.Maps.ApiVersion;
      queryString["deviceId"] = DeviceName;
      queryString["udId"] = _currentGeofenceUdId;
      queryString["lat"] = $"{userLocation.Latitude}";
      queryString["lon"] = $"{userLocation.Longitude}";
      queryString["searchBuffer"] = "5";
      queryString["isAsync"] = "True";
      queryString["mode"] = "EnterAndExit";
      var response = await Client.GetAsync($"{_azureOptions.Maps.ApiEndpoint}/spatial/geofence/json?{queryString}");
      response.EnsureSuccessStatusCode();
    }

    public async Task CreateGeofence()
    {
      // If Geofence is created do nothing
      if (!string.IsNullOrEmpty(_currentGeofenceUdId))
      {
        return;
      }
      var currentPosition = new GeoCoordinateModel(Constants.FakeUserDefaultLatitude, Constants.FakeUserDefaultLongitude);
      var firstPosition = currentPosition.CalculateDerivedPosition(Constants.GeofenceRatioInMeters, -90);
      var secondPosition = currentPosition.CalculateDerivedPosition(Constants.GeofenceRatioInMeters, 0);
      var thirdPosition = currentPosition.CalculateDerivedPosition(Constants.GeofenceRatioInMeters, 90);
      var fourthPosition = currentPosition.CalculateDerivedPosition(Constants.GeofenceRatioInMeters, 180);

      var polygonCoordinates = new List<List<double>> {
        new List<double> {firstPosition.Longitude, firstPosition.Latitude},
        new List<double> {secondPosition.Longitude, secondPosition.Latitude},
        new List<double> {thirdPosition.Longitude, thirdPosition.Latitude},
        new List<double> {fourthPosition.Longitude, fourthPosition.Latitude},
        new List<double> {firstPosition.Longitude, firstPosition.Latitude}
      };
      var geometry = new UploadGeofenceGeometryModel();
      geometry.Coordinates.Add(polygonCoordinates);
      await this.UploadGeofence(geometry);
    }

    public async Task UpdateUnitState(UpdateUnitStateModel updateUnitState)
    {
      var model = new MapsStateSetUpdateRequest
      {
        States = new List<MapsStateSetUpdate>
        {
          new MapsStateSetUpdate
          {
            KeyName = "occupied",
            Value = updateUnitState.Flashing,
            EventTimestamp = DateTime.Now
          }
        }
      };
      var body = JsonConvert.SerializeObject(model);
      Console.WriteLine($"UpdateUnitState: {body}");
      var content = new ByteArrayContent(Encoding.UTF8.GetBytes(body));
      var queryString = HttpUtility.ParseQueryString(string.Empty);
      queryString["subscription-key"] = _azureOptions.Maps.Key;
      queryString["api-version"] = _azureOptions.Maps.ApiVersion;
      queryString["datasetID"] = _azureOptions.Maps.DatasetId;
      queryString["statesetID"] = _azureOptions.Maps.StateSetId;
      queryString["featureID"] = updateUnitState.Unit;
      var requestUri = $"{_azureOptions.Maps.ApiEndpoint}/featureState/state?{queryString}";
      Console.WriteLine($"RequestUri: {requestUri}");
      content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

      var responseMessage = await Client.PostAsync(requestUri, content);
      Console.WriteLine($"Response status code: {responseMessage.StatusCode}");
      Console.WriteLine($"Response: {await responseMessage.Content.ReadAsStringAsync()}");
      responseMessage.EnsureSuccessStatusCode();
    }

    private async Task UploadGeofence(UploadGeofenceGeometryModel geometry)
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
      var requestUri = $"{_azureOptions.Maps.ApiEndpoint}/mapData/upload?api-version={_azureOptions.Maps.ApiVersion}&subscription-key={_azureOptions.Maps.Key}&dataFormat=geojson";
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
        if (uploadStatus != null && string.Equals(uploadStatus.Status, SucceededStatus))
        {
          var resourceLocationResponse = await GetResourceLocation(uploadStatus.ResourceLocation);
          _currentGeofenceUdId = resourceLocationResponse.Udid;
          return;
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
      var requestUri = $"{uploadStatusUri}&subscription-key={_azureOptions.Maps.Key}";
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
      var requestUri = $"{resourceLocationUri}&subscription-key={_azureOptions.Maps.Key}";
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
