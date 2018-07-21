using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace TanglePublisher.Model
{
    public class Route
    {

        [JsonProperty("data")]
        public Data Data { get; set; }

        [JsonProperty("hash")]
        public string Hash { get; set; }

        [JsonProperty("proof_link")]
        public string ProofLink { get; set; }

    }
}
