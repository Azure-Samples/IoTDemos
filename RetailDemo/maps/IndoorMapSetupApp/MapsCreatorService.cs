using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace IndoorMapSetupApp
{
    public class MapsCreatorService
    {
        [SuppressMessage("Microsoft.Usage", "CA2213:DisposableFieldsShouldBeDisposed", Justification = "Avoiding Improper Instantiation antipattern : https://docs.microsoft.com/en-us/azure/architecture/antipatterns/improper-instantiation/")]
        private static readonly HttpClient Client = new HttpClient(new HttpClientHandler { UseCookies = true });

        private const int WaitingTimeBeforeRetry = 1000;
        private const string ApiUrl = "https://atlas.microsoft.com";
        private const string ApiVersion = "1.0";
        private readonly string _subscriptionKey;
        private static string _uploadUdid;
        private static string _conversionUdid;
        private static string _datasetId;
        private static string _tilesetId;
        private static string _statesetId;

        public MapsCreatorService(
        string key,
        string uploadUdid,
        string conversionUdid,
        string datasetId,
        string tilesetId,
        string statesetId)
        {
            _subscriptionKey = key;
            _uploadUdid = uploadUdid;
            _conversionUdid = conversionUdid;
            _datasetId = datasetId;
            _tilesetId = tilesetId;
            _statesetId = statesetId;
        }

        public async Task<string> GetStatesetIdFromDataset(string datasetId)
        {
            if (!string.IsNullOrEmpty(_statesetId))
            {
                return _statesetId;
            }
            var serializerSettings = new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            };
            var request = new CreateStateSetRequest()
            {
                Styles = new List<CreateStateSetRequestStyle>
            {
            new CreateStateSetRequestStyle
            {
                Keyname = "occupied",
                Type = "boolean",
                Rules = new List<CreateStateSetRequestStyleBooleanRule>
                {
                new CreateStateSetRequestStyleBooleanRule { True = "#FF0000", False = "#00FF00"}
                }
            }
            }
            };
            var body = JsonConvert.SerializeObject(request, serializerSettings);
            var queryString = HttpUtility.ParseQueryString(string.Empty);
            queryString["subscription-key"] = _subscriptionKey;
            queryString["api-version"] = ApiVersion;
            queryString["datasetId"] = datasetId;

            var requestUri = $"{ApiUrl}/featureState/stateset?{queryString}";
            var content = new ByteArrayContent(Encoding.UTF8.GetBytes(body));
            content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            var responseMessage = await Client.PostAsync(requestUri, content);
            responseMessage.EnsureSuccessStatusCode();
            var responseString = await responseMessage.Content.ReadAsStringAsync();
            var createStatesetResponse = JsonConvert.DeserializeObject<CreateStatesetResponse>(responseString);
            return createStatesetResponse.StatesetId;
        }

        public async Task<string> GetTilesetIdFromDataset(string datasetId)
        {
            if (!string.IsNullOrEmpty(_tilesetId))
            {
                return _tilesetId;
            }
            var queryString = HttpUtility.ParseQueryString(string.Empty);
            queryString["subscription-key"] = _subscriptionKey;
            queryString["api-version"] = ApiVersion;
            queryString["datasetId"] = datasetId;

            var requestUri = $"{ApiUrl}/tileset/create/vector?{queryString}";
            var content = new ByteArrayContent(Encoding.UTF8.GetBytes(string.Empty));
            content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            var responseMessage = await Client.PostAsync(requestUri, content);
            responseMessage.EnsureSuccessStatusCode();
            var locationHeader = responseMessage.Headers.FirstOrDefault(header => string.Equals(header.Key, "Location", StringComparison.OrdinalIgnoreCase));
            if (locationHeader.Key == null)
            {
                throw new Exception("Can't get the Location header to know the status.");
            }
            var tries = 0;
            while (tries < 100)
            {
                var uploadStatus = await GetOperationStatus(locationHeader.Value.FirstOrDefault());
                if (uploadStatus != null && string.Equals(uploadStatus.Status, "Succeeded"))
                {
                    var resourceLocationResponse = await GetResourceLocation(uploadStatus.ResourceLocation);
                    return resourceLocationResponse.TilesetId;
                }
                else
                {
                    await Task.Delay(WaitingTimeBeforeRetry); // Wait 200 milliseconds before try again
                }
                tries++;
            }
            throw new Exception("Can't get the tileset Id.");
        }

        public async Task<string> GetDatasetUdidFromConversion(string conversionId)
        {
            if (!string.IsNullOrEmpty(_datasetId))
            {
                return _datasetId;
            }
            var queryString = HttpUtility.ParseQueryString(string.Empty);
            queryString["subscription-key"] = _subscriptionKey;
            queryString["api-version"] = ApiVersion;
            queryString["conversionId"] = conversionId;
            queryString["type"] = "facility";

            var requestUri = $"{ApiUrl}/dataset/create?{queryString}";
            var content = new ByteArrayContent(Encoding.UTF8.GetBytes(string.Empty));
            content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            var responseMessage = await Client.PostAsync(requestUri, content);
            responseMessage.EnsureSuccessStatusCode();
            var locationHeader = responseMessage.Headers.FirstOrDefault(header => string.Equals(header.Key, "Location", StringComparison.OrdinalIgnoreCase));
            if (locationHeader.Key == null)
            {
                throw new Exception("Can't get the Location header to know the status.");
            }
            var tries = 0;
            while (tries < 100)
            {
                var uploadStatus = await GetOperationStatus(locationHeader.Value.FirstOrDefault());
                if (uploadStatus != null && string.Equals(uploadStatus.Status, "Succeeded"))
                {
                    var resourceLocationResponse = await GetResourceLocation(uploadStatus.ResourceLocation);
                    return resourceLocationResponse.DatasetId;
                }
                else
                {
                    await Task.Delay(WaitingTimeBeforeRetry); // Wait 200 milliseconds before try again
                }
                tries++;
            }
            throw new Exception("Can't finish the conversion.");
        }

        public async Task<string> GetConversionUdidFromUpload(string uploadUdid)
        {
            if (!string.IsNullOrEmpty(_conversionUdid))
            {
                return _conversionUdid;
            }
            var queryString = HttpUtility.ParseQueryString(string.Empty);
            queryString["subscription-key"] = _subscriptionKey;
            queryString["api-version"] = ApiVersion;
            queryString["udid"] = uploadUdid;
            queryString["inputType"] = "DWG";
            queryString["description"] = "Demo";

            var requestUri = $"{ApiUrl}/conversion/convert?{queryString}";
            var content = new ByteArrayContent(Encoding.UTF8.GetBytes(string.Empty));
            content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            var responseMessage = await Client.PostAsync(requestUri, content);
            responseMessage.EnsureSuccessStatusCode();
            var locationHeader = responseMessage.Headers.FirstOrDefault(header => string.Equals(header.Key, "Location", StringComparison.OrdinalIgnoreCase));
            if (locationHeader.Key == null)
            {
                throw new Exception("Can't get the Location header to know the status.");
            }
            var tries = 0;
            while (tries < 100)
            {
                var uploadStatus = await GetOperationStatus(locationHeader.Value.FirstOrDefault());
                if (uploadStatus != null && string.Equals(uploadStatus.Status, "Succeeded"))
                {
                    var resourceLocationResponse = await GetResourceLocation(uploadStatus.ResourceLocation);
                    return resourceLocationResponse.ConversionId;
                }
                else
                {
                    await Task.Delay(WaitingTimeBeforeRetry); // Wait 200 milliseconds before try again
                }
                tries++;
            }
            throw new Exception("Can't finish the conversion.");
        }

        public async Task<string> GetUploadUdid(string filePath)
        {
            if (!string.IsNullOrEmpty(_uploadUdid))
            {
                return _uploadUdid;
            }
            var queryString = HttpUtility.ParseQueryString(string.Empty);
            queryString["subscription-key"] = _subscriptionKey;
            queryString["api-version"] = ApiVersion;
            queryString["dataFormat"] = "zip";

            var requestUri = $"{ApiUrl}/mapData/upload?{queryString}";
            var content = new ByteArrayContent(File.ReadAllBytes(filePath));
            content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");

            var responseMessage = await Client.PostAsync(requestUri, content);
            responseMessage.EnsureSuccessStatusCode();
            var locationHeader = responseMessage.Headers.FirstOrDefault(header => string.Equals(header.Key, "Location", StringComparison.OrdinalIgnoreCase));
            if (locationHeader.Key == null)
            {
                throw new Exception("Can't get the Location header to know the status of the Geofence upload.");
            }
            var tries = 0;
            while (tries < 100)
            {
                var uploadStatus = await GetOperationStatus(locationHeader.Value.FirstOrDefault());
                if (uploadStatus != null && string.Equals(uploadStatus.Status, "Succeeded"))
                {
                    var resourceLocationResponse = await GetResourceLocation(uploadStatus.ResourceLocation);
                    return resourceLocationResponse.Udid;
                }
                else
                {
                    await Task.Delay(WaitingTimeBeforeRetry); // Wait 200 milliseconds before try again
                }
                tries++;
            }
            throw new Exception("Can't upload geofence.");
        }

        private async Task<UploadStatusResponseModel> GetOperationStatus(string uploadStatusUri)
        {
            var requestUri = $"{uploadStatusUri}&subscription-key={_subscriptionKey}";
            var responseMessage = await Client.GetAsync(requestUri);
            responseMessage.EnsureSuccessStatusCode();
            if (responseMessage.StatusCode == System.Net.HttpStatusCode.Created)
            {
                var responseString = await responseMessage.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<UploadStatusResponseModel>(responseString);
            }
            else
            {
                return null;
            }
        }

        private async Task<UploadResource> GetResourceLocation(string uploadStatusUri)
        {
            var requestUri = $"{uploadStatusUri}&subscription-key={_subscriptionKey}";
            var responseMessage = await Client.GetAsync(requestUri);
            responseMessage.EnsureSuccessStatusCode();
            var responseString = await responseMessage.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<UploadResource>(responseString);
        }
    }
}