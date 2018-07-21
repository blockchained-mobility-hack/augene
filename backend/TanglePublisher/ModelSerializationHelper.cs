using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Tangle.Net.Repository.DataTransfer;
using TanglePublisher.Model;

namespace TanglePublisher {
    public static class ModelSerializationHelper
    {

        public static Route[] DeserializeRoutes(string filename = "SampleRoutes/Input/Routes.json") {

            using (var streamReader = new StreamReader(filename)) {
                return JsonConvert.DeserializeObject<Route[]>(streamReader.ReadToEnd());
            }

        }

        public static Route DeserializeRouteFallback(string specifier) {

            return DeserializeRoute($"SampleRoutes/Input_Fallback/Route_{specifier}.json");

        }

        public static Route DeserializeRoute(string filename = "SampleRoutes/Input/Route.json") {

            using (var streamReader = new StreamReader(filename)) {
                return JsonConvert.DeserializeObject<Route>(streamReader.ReadToEnd());
            }

        }

        public static void SerializeRoute(Route route, string filename = null) {

            if (filename == null) {
                filename = $"SampleRoutes/Output/Route_{route.Data.Specifier}.json";
            }

            using (var streamWriter = new StreamWriter(filename, false)) {
                streamWriter.Write(JsonConvert.SerializeObject(route));
            }

        }

        public static void SerializeRoutes(Route[] routes, string filename = null) {

            if(filename == null) {
                filename = $"SampleRoutes/Output/Routes.json";
            }

            using (var streamWriter = new StreamWriter(filename, false)) {
                streamWriter.Write(JsonConvert.SerializeObject(routes));
            }

        }

        public static string SerializeNodeInfo(NodeInfo nodeinfo) {

            return JsonConvert.SerializeObject(nodeinfo);

        }

    }
}
