using System;
using System.Collections.Generic;
using System.Text;

namespace CustomVisionLoaderApp.Models
{
  public class CustomVisionDataModel
  {
    public List<string> Tags { get; set; } = new List<string>();

    public List<CustomVisionTaggedImage> TaggedImages { get; set; } = new List<CustomVisionTaggedImage>();
  }

  public class CustomVisionTaggedImage
  {
    public List<CustomVisionTaggedImageRegion> Regions { get; set; } = new List<CustomVisionTaggedImageRegion>();

    public string FileName { get; set; }
  }

  public class CustomVisionTaggedImageRegion
  {
    public string Tag { get; set; }

    public double Left { get; set; }

    public double Top { get; set; }

    public double Width { get; set; }

    public double Height { get; set; }
  }
}
