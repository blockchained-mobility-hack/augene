using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Text;
using TanglePublisher.Model;

namespace TanglePublisher.Controllers
{
    [Route("/")]
    [Produces("application/json")]
    [Consumes("application/json")]
    [EnableCors("CorsPolicy")]
    public class ApiController : Controller
    {

        private TangleService _tangleService;

        public ApiController(TangleService tangleService) {
            _tangleService = tangleService;
        }

        [HttpPost]
        [Route("simulation")]
        public void Simulation() {

            _tangleService.StartSimulation();

        }

        [HttpGet]
        [Route("state")]
        public State State() {

            return new State() {
                Routes = _tangleService.Routes?.Length ?? 0,
                AvailableRootProofs = _tangleService.ProovedRoutes?.Length ?? 0
            };

        }

        [HttpGet]
        [Route("routes")]
        public Route[] Routes() {

            return _tangleService.ProovedRoutes;

        }

    }
}
