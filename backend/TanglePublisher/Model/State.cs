using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace TanglePublisher.Model
{
    public class State
    {

        [JsonProperty("routes")]
        public int Routes { get; set; }

        [JsonProperty("available_route_proofs")]
        public int AvailableRootProofs { get; set; }

    }
}
