using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace TanglePublisher.Model
{
    public class Waypoint
    {

        [JsonProperty("lon")]
        public decimal Lon { get; set; }

        [JsonProperty("lat")]
        public decimal Lat { get; set; }

        [JsonProperty("speed")]
        public int Speed { get; set; }

    }
}
