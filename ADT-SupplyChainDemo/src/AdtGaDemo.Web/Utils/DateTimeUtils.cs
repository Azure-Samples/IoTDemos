using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace AdtGaDemo.Web.Utils
{
  public static class DateTimeUtils
  {
    public static DateTime Now()
    {
      var timeUtc = DateTime.UtcNow;
      var cstZone = TimeZoneInfo.FindSystemTimeZoneById(Constants.TsiTimeZone);
      return TimeZoneInfo.ConvertTimeFromUtc(timeUtc, cstZone);
    }

    public static DateTime Parse(string str)
    {
      return DateTime.ParseExact(
        str,
        Constants.DateTimeFormat,
        CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal);
    }

    public static string Format(DateTime dateTime)
    {
      return dateTime.ToString(Constants.DateTimeFormat);
    }
  }
}
