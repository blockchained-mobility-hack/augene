using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using Tangle.Net.Cryptography;
using Tangle.Net.Entity;
using TanglePublisher.Model;

namespace TanglePublisher {
    public class HashBuilder
    {

        public static string ComputeHash(Route route) {

            var rawData = JsonConvert.SerializeObject(route.Data);
            return ComputeHash(rawData);

        }

        public static string ComputeHash(string rawData) {

            using (var hashAlgorithm = SHA256.Create()) {
                var bytes = hashAlgorithm.ComputeHash(Encoding.UTF8.GetBytes(rawData));
                return TryteString.FromBytes(bytes).Value;
            }

        }

    }
}
