const parse = require("csv-parse/lib/sync");
const fs = require("fs");
const path = require("path");

const tripCount = 3;
path.resolve(__dirname, "..", "..", "frontend", "public");
const files = [
  {
    from: "Dortmund",

    to: "Aachen",

    name: "Dor-Aac_sample trip.csv",

    distance: "160 km"
  },

  {
    from: "Frankfurt a. Main",

    to: "Cologne",

    name: "Ffm-Cgn_sample trip.csv",

    distance: "187 km"
  },

  {
    from: "Hannover",

    to: "Hamburg",

    name: "Han-Hh_sample trip.csv",

    distance: "162 km"
  },

  {
    from: "Muenchen",

    to: "Nuernberg",

    name: "Muc-Nbg_sample trip.csv",

    distance: "151 km"
  },

  {
    from: "Nuernberg",

    to: "Wuerzburg",

    name: "Nbg-Wzb_sample trip.csv",

    distance: "92 km"
  },

  {
    from: "Potsdam",

    to: "Leipzig",

    name: "Pot-Lpz_sample trip.csv",

    distance: "164 km"
  },

  {
    from: "Stuttgart",
    to: "Freiburg",
    name: "Stg-Frb_sample trip.csv",
    distance: "177 km"
  },

  {
    from: "Augsburg",
    to: "Reutlingen",
    name: "Aug-Ret_sampleTrip.csv",
    distance: "147 km"
  },

  {
    from: "Hallstadt",

    to: "Bad Wintersheim",

    name: "Hal-wnt_smapleRoute.csv",

    distance: "78 km"
  },

  {
    from: "Stuttgart",

    to: "Regensburg",

    name: "Stu-Reg_sample trip.csv",

    distance: "287 km"
  },

  {
    from: "Cologne",

    to: "Essen",

    name: "Kol-Ess_sampleTrip.csv",

    distance: "72 km"
  },

  {
    from: "Jena",

    to: "Goettingen",

    name: "Jen-Got_sample trip.csv",

    distance: "202 km"
  },

  {
    from: "Kassel",

    to: "Magedeburg",

    name: "Kas-Mag_sample trip.csv",

    distance: "246 km"
  },

  {
    from: "Osnarbrueck",

    to: "Koblenz",

    name: "Osn-Kob_sample trip.csv",

    distance: "295 km"
  }
];
const trips = files.map((file, i) => {
  const fullPath = path.resolve(__dirname, "tripdata", file.name);
  const table = parse(fs.readFileSync(fullPath, "utf8"));
  const [header, ...rows] = table;
  const waypoints = rows.map((row, acc) => {
    return row.reduce((acc, value, i) => {
      // console.log("value", value);
      const key = header[i];
      if (key == "") {
        return acc;
      }
      const camelcasedKey = key.toLowerCase().replace(/\s/g, "_");
      return Object.assign(acc, {
        [camelcasedKey]: parseFloat(value)
      });
    }, {});
  });

  const timeStamp = randInt(1514764800, 1532255813);
  return {
    data: {
      from: file.from,
      to: file.to,
      distance: file.distance,
      name: `Route ${i}`,
      specifier: `Route-${i}`,
      vehicle_type: `Vehicle ${i}`,
      waypoints,
      driving_behaviour: waypoints[0].driving_behaviour,
      recording_date: timeStamp
    }
  };
});

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const outDir = path.resolve(
  __dirname,
  "..",
  "..",
  "backend",
  "TanglePublisher",
  "SampleRoutes",
  "Input"
);

fs.writeFileSync(
  path.resolve(outDir, `Routes.json`),
  JSON.stringify(trips)
);

const mockData = trips.map(data => {
  return {
    data,
    hash: "",
    proof_link: "https://thetangle.org"
  };
});

// fs.writeFileSync(
//   path.resolve(__dirname, "..", "..", "frontend", "public", `mock-data.json`),
//   JSON.stringify(mockData, null, 4)
// );
