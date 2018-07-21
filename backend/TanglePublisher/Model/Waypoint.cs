using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace TanglePublisher.Model
{
    public class Waypoint
    {

        [JsonProperty("longitude")]
        public decimal Longitude { get; set; }

        [JsonProperty("latitude")]
        public decimal Latitude { get; set; }

        [JsonProperty("elevation")]
        public decimal Elevation { get; set; }

        [JsonProperty("battery_state_of_charge")]
        public decimal BatteryStateOfCharge { get; set; }

        [JsonProperty("outside_temp")]
        public decimal OutsideTemp { get; set; }

        [JsonProperty("driving_behavior")]
        public decimal DrivingBehavior { get; set; }

    }
}
