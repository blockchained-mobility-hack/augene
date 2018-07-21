const parse = require("csv-parse/lib/sync");
const fs = require("fs");
const path = require("path");

const tripCount = 3;
path.resolve(__dirname, "..", "..", "frontend", "public");
const files = [
  {
    from: "Dortmund",
    to: "Aachen",
    name: "Dor-Aac_sample trip.csv"
  },
  {
    from: "Frankfurt a. Main",
    to: "Cologne",
    name: "Ffm-Cgn_sample trip.csv"
  },
  {
    from: "Hannover",
    to: "Hamburg",
    name: "Han-Hh_sample trip.csv"
  },
  {
    from: "Muenchen",
    to: "Nuernberg",
    name: "Muc-Nbg_sample trip.csv"
  },

  {
    from: "Nuernberg",
    to: "Wuerzburg",
    name: "Nbg-Wzb_sample trip.csv"
  },

  {
    from: "Potsdam",
    to: "Leipzig",
    name: "Pot-Lpz_sample trip.csv"
  },
  {
    from: "Stuttgart",
    to: "Freiburg",
    name: "Stg-Frb_sample trip.csv"
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
  return {
    from: file.from,
    to: file.to,
    name: `Route ${i}`,
    specifier: `Route-${i}`,
    vehicle_type: "Vehicle ${i}",
    waypoints,
    driving_behaviour: waypoints[0].driving_behaviour
  };
});

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

fs.writeFileSync(
  path.resolve(__dirname, "..", "..", "frontend", "public", `mock-data.json`),
  JSON.stringify(mockData, null, 4)
);
