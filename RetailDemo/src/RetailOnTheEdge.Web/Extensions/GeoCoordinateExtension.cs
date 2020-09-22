using System;
using RetailOnTheEdge.Web.Models;

namespace RetailOnTheEdge.Web.Extensions
{
  public static class GeoCoordinateExtension
  {
    private const double DegreesToRadians = Math.PI/180.0;
    private const double RadiansToDegrees = 180.0/ Math.PI;
    private const double EarthRadius = 6378137.0;

    /// <summary>
    /// Calculates the end-point from a given source at a given range (meters) and bearing (degrees).
    /// This methods uses simple geometry equations to calculate the end-point.
    /// </summary>
    /// <param name="source">Point of origin</param>
    /// <param name="range">Range in meters</param>
    /// <param name="bearing">Bearing in degrees</param>
    /// <returns>End-point from the source given the desired range and bearing.</returns>
    public static GeoCoordinateModel CalculateDerivedPosition(this GeoCoordinateModel source, double range, double bearing)
    {
      var latA = source.Latitude * DegreesToRadians;
      var lonA = source.Longitude * DegreesToRadians;
      var angularDistance = range / EarthRadius;
      var trueCourse = bearing * DegreesToRadians;

      var lat = Math.Asin(
          Math.Sin(latA) * Math.Cos(angularDistance) +
          Math.Cos(latA) * Math.Sin(angularDistance) * Math.Cos(trueCourse));

      var dlon = Math.Atan2(
          Math.Sin(trueCourse) * Math.Sin(angularDistance) * Math.Cos(latA),
          Math.Cos(angularDistance) - Math.Sin(latA) * Math.Sin(lat));

      var lon = ((lonA + dlon + Math.PI) % (Math.PI * 2)) - Math.PI;

      return new GeoCoordinateModel(lat * RadiansToDegrees, lon * RadiansToDegrees);
    }
  }
}
