using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using TanglePublisher.Model.Extensions;

namespace TanglePublisher
{
    public class TangleService
    {

        private ILogger<TangleService> _logger;
        private TanglePublisher _publisher;
        private Mutex _isRunningMonitor = new Mutex();

        private Model.Route[] _routes;
        public Model.Route[] Routes {
            get {
                lock (typeof(TangleService)) {
                    return _routes;
                }
            }
        }

        private Model.Route[] _proovedRoutes;
        public Model.Route[] ProovedRoutes {
            get {
                lock (typeof(TangleService)) {
                    return _proovedRoutes;
                }
            }
        }

        public TangleService(ILogger<TangleService> logger, TanglePublisher publisher) {
            _logger = logger;
            _publisher = publisher;
        }

        public void StartSimulation() {

            Task.Factory.StartNew(
                () => {
                    try {
                        Run();
                    }
                    catch (Exception e) {
                        _logger.LogError(e.ToString());
                    }
                },
                TaskCreationOptions.LongRunning
            );

        }

        private void Run() {

            if (!_isRunningMonitor.WaitOne(0)) {
                return;
            }

            try {

                // Print node-info
                _logger.LogInformation(
                    $"Node-Informations: {ModelSerializationHelper.SerializeNodeInfo(_publisher.GetNodeInfo())}"
                );

                // Get the JSON "raw-data"
                var rawRoutes = ModelSerializationHelper.DeserializeRoutes();

                lock (typeof(TangleService)) {
                    _routes = rawRoutes;
                }

                var proofedRoutes = new List<Model.Route>();
                foreach (var rawRoute in rawRoutes) {

                    Model.Route proofedRoute = null;

                    try {

                        // build the hash
                        var hash = HashBuilder.ComputeHash(rawRoute);

                        // build new JSON "hashed" based on JSON "raw-data" which includes the hash in addition
                        var hashedRoute = rawRoute.AddHash(hash);

                        // store it in the tangle
                        var tangleAddress = _publisher.PublishRouteProof(hashedRoute);

                        // build new JSON "proofed" based on JSON "hashed" which includes the proof_link
                        proofedRoute = hashedRoute.AddProofLink($"https://devnet.thetangle.org/address/{tangleAddress}");

                        ModelSerializationHelper.SerializeRoute(proofedRoute);

                    }
                    catch(Exception e) {

                        _logger.LogError($"Tangle operation failed, fallback-scenario: {e.ToString()}");
                        proofedRoute = ModelSerializationHelper.DeserializeRouteFallback(rawRoute.Data.Specifier);

                    }

                    proofedRoutes.Add(proofedRoute);

                    lock (typeof(TangleService)) {
                        _proovedRoutes = proofedRoutes.ToArray();
                    }

                }

                ModelSerializationHelper.SerializeRoutes(proofedRoutes.ToArray());

            }
            catch (Exception e) {

                _logger.LogError(e.ToString());

            }
            finally {
                _isRunningMonitor.ReleaseMutex();
            }

        }

    }
}
