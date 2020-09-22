using System.Collections.Generic;

namespace IndoorMapSetupApp
{
    public class CreateStateSetRequest
    {
        public List<CreateStateSetRequestStyle> Styles { get; set; }
    }

    public class CreateStateSetRequestStyle
    {
        public string Keyname { get; set; }

        public string Type { get; set; }

        public List<CreateStateSetRequestStyleBooleanRule> Rules { get; set; }
    }

    public class CreateStateSetRequestStyleBooleanRule
    {
        public string True { get; set; }

        public string False { get; set; }
    }

    public class UploadStatusResponseModel
    {
        public string OperationId { get; set; }

        public string Created { get; set; }

        public string Status { get; set; }

        public string ResourceLocation { get; set; }
    }

    public class UploadResource
    {
        public string Udid { get; set; }

        public string ConversionId { get; set; }

        public string DatasetId { get; set; }

        public string TilesetId { get; set; }
    }

    public class CreateStatesetResponse
    {
        public string StatesetId { get; set; }
    }
}