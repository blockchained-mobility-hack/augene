using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Tangle.Net.Cryptography;
using Tangle.Net.Entity;
using Tangle.Net.ProofOfWork;
using Tangle.Net.Repository;
using Tangle.Net.Repository.Client;
using Tangle.Net.Repository.DataTransfer;
using Tangle.Net.Utils;
using TanglePublisher.Model;

namespace TanglePublisher {
    public class TanglePublisher
    {

        private IIotaRepository _iotaRepository;
        private Seed _seed;
        private ILogger<TanglePublisher> _logger;

        public TanglePublisher(ILogger<TanglePublisher> logger, string seed = "GDVTSMDKOYGGGLVIREISBCSMZXNMPDITXEKDOAERGHQOTOCTPYHGZZZBWDWGUKWILX9SKXYSHZNUYEFWK", string uri = "https://nodes.testnet.iota.org:443") {

            _logger = 
                logger;

            _seed = 
                new Seed(seed);

            _iotaRepository =
                new RestIotaRepository(
                    new RestIotaClient(new RestClient(uri)),
                    new PoWService(new CpuPearlDiver())
                );

        }

        public NodeInfo GetNodeInfo() {

            return _iotaRepository.GetNodeInfo();

        }

        public string PublishRouteProof(Route route) {

            try {

                _logger.LogInformation($"Proof for route {route.Data?.Name} started");

                var tangleProofRoute =
                    JsonConvert.SerializeObject(
                        new TangleRouteProof() {
                            Hash = route.Hash
                        }
                    );

                var address =
                    _iotaRepository
                        .GetNewAddresses(_seed, 0, 1, SecurityLevel.Medium)
                        .First();

                _logger.LogInformation($"Address for route {route.Data?.Name} generated");

                var bundle = new Bundle();
                bundle.AddTransfer(new Transfer {
                    Address = address,
                    Message = TryteString.FromUtf8String(
                        tangleProofRoute
                    ),
                    Tag = Tag.Empty,
                    Timestamp = Timestamp.UnixSecondsTimestamp
                });

                bundle.Finalize();
                bundle.Sign();

                _iotaRepository.SendTrytes(bundle.Transactions);//, 27, 14);

                _logger.LogInformation($"Proof for route {route.Data?.Name} finished");

                return address.Value;

            }
            catch (Exception e) {

                _logger.LogError(e.ToString());
                throw;
            }

        }

    }
}
