using System;
using System.Collections.Generic;
using AdtGaDemo.Web.Services.Interfaces;
using AdtGaDemo.Web.Utils;
using AdtGaDemo.Web.Models;

namespace AdtGaDemo.Web.Services
{
  public class TsiDataGeneratorService : ITsiDataGeneratorService
  {
    private readonly Random _r = new Random();

    public List<Dictionary<string, Dictionary<string, TsiDataPoint>>> GenerateData()
    {
      var lines = new List<Dictionary<string, Dictionary<string, TsiDataPoint>>>();
      var startDate = DateTimeUtils.Now().AddDays(-7);
      var reference = 0;
      var variance = 0;
      for (var i = 1; i <= 4; i++)
      {
        var line = new Dictionary<string, Dictionary<string, TsiDataPoint>>();
        var values = new Dictionary<string, TsiDataPoint>();
        for (var k = 0; k <= 60 * 24 * 7; k++)
        {
          if (k % 200 == 0 || k % 300 == 0)
          {
            var to = DateTimeUtils.Format(startDate.AddMinutes(k));
            if (i == Constants.SensorWithIssues)
            {
              reference = 85;
              variance = 7;
            }
            else
            {
              reference = 65;
              variance = _r.NextDouble() > 0.8 ? 10 : 2;
            }

            values[to] = new TsiDataPoint { Avg = _r.Next(reference - variance, reference + variance) };
          }
        }
        line.Add("Humidity", values);
        lines.Add(line);
      }
      return lines;
    }
  }
}
