using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using System;
using System.Collections.Generic;
using System.Net;
using System.Security.Cryptography;
using TanglePublisher.Model;

namespace TanglePublisher {

    class Program
    {

        static void Main(string[] args) {
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args) =>
            WebHost
                .CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .UseKestrel(options => {
                    options.Listen(IPAddress.Any, 5000);
                })
                .Build();
    }
}
