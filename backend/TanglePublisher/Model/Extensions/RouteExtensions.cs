using System;
using System.Collections.Generic;
using System.Text;

namespace TanglePublisher.Model.Extensions
{
    public static class RouteExtensions
    {

        public static Route AddHash(this Route route, string hash) {
            route.Hash = hash;
            return route;
        }

        public static Route AddProofLink(this Route route, string proof_link) {
            route.ProofLink = proof_link;
            return route;
        }



    }
}
