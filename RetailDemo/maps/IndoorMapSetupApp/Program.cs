using System;
using System.IO;

namespace IndoorMapSetupApp
{
    class Program
    {
        private static string ApiKey = string.Empty;
        // Following are for dev only and are not required.
        private static string UploadUdid = "";
        private static string ConversionId = "";
        private static string DatasetId = "";
        private static string TilesetId = "";
        private static string StatesetId = "";

        static void Main(string[] args)
        {
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("");
            Console.WriteLine("");
            Console.WriteLine("***********************************************************");
            Console.WriteLine("*               Azure Maps Creator Setup                  *");
            Console.WriteLine("*                                                         *");
            Console.WriteLine("***********************************************************");
            Console.WriteLine("");

            Setup();

            Console.ReadKey();
        }

        private static async void Setup()
        {
            using (StreamWriter outputFile = new StreamWriter("MapCreatorSetupResult.txt"))
            {
                Console.WriteLine("Setup started...");
                Console.Write("Enter the Azure Maps subscription key and press enter: ");
                ApiKey = Console.ReadLine();
                var service = new MapsCreatorService(ApiKey, UploadUdid, ConversionId, DatasetId, TilesetId, StatesetId);
                Console.WriteLine(string.Empty);
                UploadUdid = await service.GetUploadUdid("./DrawingPackage.zip");
                AppendTextToFile(outputFile, $"Upload Udid: {UploadUdid}");
                ConversionId = await service.GetConversionUdidFromUpload(UploadUdid);
                AppendTextToFile(outputFile, $"Conversion Id: {ConversionId}");
                DatasetId = await service.GetDatasetUdidFromConversion(ConversionId);
                AppendTextToFile(outputFile, $"Dataset Id: {DatasetId}");
                TilesetId = await service.GetTilesetIdFromDataset(DatasetId);
                AppendTextToFile(outputFile, $"Tileset Id: {TilesetId}");
                StatesetId = await service.GetStatesetIdFromDataset(DatasetId);
                AppendTextToFile(outputFile, $"Stateset Id: {StatesetId}");
                Console.WriteLine("\nIMPORTANT: You can also see the results in the file: MapCreatorSetupResult.txt");
                Console.WriteLine("\nPress any key to exit");
            }
        }

        private static void AppendTextToFile(StreamWriter outputFile, string text)
        {
            Console.WriteLine(text);
            outputFile.WriteLine($"{text}");
        }
    }
}
