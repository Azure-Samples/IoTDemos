using CustomVisionLoaderApp.Models;
using Microsoft.Azure.CognitiveServices.Vision.CustomVision.Training;
using Microsoft.Azure.CognitiveServices.Vision.CustomVision.Training.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Threading;

namespace CustomVisionLoaderApp
{
  class Program
  {
    static void Main(string[] args)
    {
      string commandString = string.Empty;
      Console.ForegroundColor = ConsoleColor.White;
      Console.WriteLine("");
      Console.WriteLine("");
      Console.WriteLine("***********************************************************");
      Console.WriteLine("*             Custom Vision Project Setup                 *");
      Console.WriteLine("*                                                         *");
      Console.WriteLine("***********************************************************");
      Console.WriteLine("");

      CreateProjectFromImageData();

      Console.WriteLine("\n\nPress any key to exit");
      Console.ReadKey();
    }

    private static void CreateProjectFromImageData()
    {
      var projectPath = System.IO.Path.GetFullPath(@"..\..\..\");
      var cvDataModelJsonFilePath = Path.Combine(projectPath, "Resources", "cv_data_model.json");

      if (!File.Exists(cvDataModelJsonFilePath))
      {
        Console.WriteLine($"\tModel file was not found at: {cvDataModelJsonFilePath}");
        Console.WriteLine("\tYou probably need to export the model first.");
        return;
      }

      var trainingApi = new CustomVisionTrainingClient()
      {
          ApiKey = ConfigurationManager.AppSettings["Key"],
          Endpoint = ConfigurationManager.AppSettings["Endpoint"]
      };

      // Read model from Local JsonFile
      Console.WriteLine($"*** Loading local custom vision model from: {cvDataModelJsonFilePath} ***");
      CustomVisionDataModel cvDataModel = null;
      using (StreamReader r = new StreamReader(cvDataModelJsonFilePath))
      {
        var json = r.ReadToEnd();
        cvDataModel= JsonConvert.DeserializeObject<CustomVisionDataModel>(json);
      }
      Console.WriteLine($"Tags to create: {cvDataModel.Tags.Count}");
      Console.WriteLine($"Image to tag: {cvDataModel.TaggedImages.Count}");

      Console.WriteLine("** Starting Setup of project **");

      // Find the object detection domain
      var domains = trainingApi.GetDomains();
      var objDetectionDomain = domains.FirstOrDefault(d => d.Type == "ObjectDetection" && d.Name == "General (compact)");
      var targetExportPlatforms = new List<string> { "VAIDK" };
      // Create a new project
      Console.WriteLine($"\tCreating new object detection project: {ConfigurationManager.AppSettings["ProjectName"]}");
      var project = trainingApi.CreateProject(ConfigurationManager.AppSettings["ProjectName"], null, objDetectionDomain.Id, null, targetExportPlatforms);

      // <snippet_tags>
      Console.WriteLine("\tCreating tags");
      // Create all the tags in the new project from the model
      var tagsList = new Dictionary<string, Tag>();
      cvDataModel.Tags.ForEach(tagLabel =>
      {
        var tag = trainingApi.CreateTag(project.Id, tagLabel);
        tagsList.Add(tagLabel, tag);
      });      
      // </snippet_tags>

      Console.WriteLine("\tReading and Uploading images");
      var index = 1;
      cvDataModel.TaggedImages.ForEach(taggedImage =>
      {
        var fullPath = Path.Combine(projectPath, "Resources", "TrainingImages", taggedImage.FileName);
        try
        {
          using (StreamReader r = new StreamReader(fullPath))
          {
            Console.WriteLine($"\tUploading image {index} of {cvDataModel.TaggedImages.Count}");
            var image = trainingApi.CreateImagesFromData(project.Id, r.BaseStream).Images[0];
            trainingApi.CreateImageRegions(project.Id, new ImageRegionCreateBatch()
            {
              Regions = taggedImage.Regions.Select(region =>
              {
                var tag = tagsList.FirstOrDefault(tagObject => string.Equals(tagObject.Key, region.Tag, StringComparison.OrdinalIgnoreCase));
                return new ImageRegionCreateEntry
                {
                  TagId = tag.Value.Id,
                  ImageId = image.Image.Id,
                  Height = region.Height,
                  Left = region.Left,
                  Top = region.Top,
                  Width = region.Width
                };
              }).ToList()
            });
          }
        }
        catch (Exception)
        {
          Console.Error.WriteLine($"Error uploading image: {fullPath}");
        }
        index++;
      });
      Console.WriteLine("\tImages upload is done.");

      // Now there are images with tags start training the project
      Training(trainingApi, project, cvDataModel);
    }

    private static void Training(CustomVisionTrainingClient trainingApi, Project project, CustomVisionDataModel cvDataModel)
    {
      Console.WriteLine("\tTraining");
      var iteration = trainingApi.TrainProject(project.Id);

      // The returned iteration will be in progress, and can be queried periodically to see when it has completed
      while (iteration.Status == "Training")
      {
        Thread.Sleep(1000);

        // Re-query the iteration to get its updated status
        iteration = trainingApi.GetIteration(project.Id, iteration.Id);
      }

      // The iteration is now trained. Publish it to the prediction end point.
      var publishedModelName = "IotEdgeModel";
      trainingApi.PublishIteration(project.Id, iteration.Id, publishedModelName, ConfigurationManager.AppSettings["ResourceId"]);
      Console.WriteLine("\tDone training!");
    }
  }
}
