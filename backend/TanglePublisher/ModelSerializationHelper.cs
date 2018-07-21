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

        public static void SerializeRoute(Route routes, string filename = null) {

            if (filename == null) {
                filename = $"SampleRoutes/Output/Route_{DateTimeOffset.Now:HHmmss.ffff}.json";
            }

            using (var streamWriter = new StreamWriter(filename)) {
                streamWriter.Write(JsonConvert.SerializeObject(routes));
            }

        }

        public static void SerializeRoutes(Route[] routes, string filename = null) {

            if(filename == null) {
                filename = $"SampleRoutes/Output/Routes_{DateTimeOffset.Now:HHmmss.ffff}.json";
            }

            using (var streamWriter = new StreamWriter(filename)) {
                streamWriter.Write(JsonConvert.SerializeObject(routes));
            }

        }

        public static string SerializeNodeInfo(NodeInfo nodeinfo) {

            return JsonConvert.SerializeObject(nodeinfo);

        }

    }
}
