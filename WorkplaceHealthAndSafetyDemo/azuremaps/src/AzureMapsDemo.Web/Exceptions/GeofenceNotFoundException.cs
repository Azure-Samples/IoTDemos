using System;

namespace AzureMapsDemo.Web.Exceptions
{
  public class GeofenceNotFoundException : Exception
  {
    public GeofenceNotFoundException()
    {
    }

    public GeofenceNotFoundException(string message)
        : base(message)
    {
    }

    public GeofenceNotFoundException(string message, Exception inner)
        : base(message, inner)
    {
    }
  }
}
