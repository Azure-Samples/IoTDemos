using System;

namespace RetailOnTheEdge.Web
{
  public static class Constants
  {
    public const string CameraCaptureModuleName = "CameraCapture";

    public const string StockedShelf = "./StockedShelf.mp4";

    public const string LowStockedShelf = "./LowStockedShelf.mp4";

    public const double FakeUserDefaultLatitude = 47.643112;

    public const double FakeUserDefaultLongitude = -122.124683;

    public const int GeofenceRatioInMeters = 500;

    public static Guid DemoProductId = Guid.Parse("E116E46B-DC84-4986-BAE2-17FE1DBB759E");
  }
}
