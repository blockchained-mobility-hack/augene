using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace TanglePublisher.Model
{
    public class Data
    {

        [JsonProperty("specifier")]
        public string Specifier { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("from")]
        public string From { get; set; }

        [JsonProperty("to")]
        public string To { get; set; }

        [JsonProperty("vehicle_type")]
        public string VehicleType { get; set; }

        [JsonProperty("consumption_percentage")]
        public int ConsumptionPercentage { get; set; }

        [JsonProperty("waypoints")]
        public Waypoint[] Waypoints { get; set; }

    }
}
