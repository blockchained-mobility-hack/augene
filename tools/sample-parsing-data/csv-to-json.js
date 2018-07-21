const parse = require("csv-parse/lib/sync");
const fs = require("fs");
const path = require("path");

const tripCount = 3;
path.resolve(__dirname, "..", "..", "frontend", "public");

const trips = new Array(tripCount)
  .fill()
  .map((_, i) => {
    console.log(i);
    const table = parse(
      fs.readFileSync(
        path.resolve(__dirname, "data", `sample-trip-${i}.csv`),
        "utf8"
      )
    );
    const [header, ...rows] = table;
    return rows.map((row, acc) => {
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
  })
  .map(waypoints => {
    return {
      name: `Test-Route-${Math.random()}`,
      from: "Berlin",
      to: "Munich",
      vehicle_type: "BMW i3",
      consumption_percentage: 45,
      waypoints
    };
  });

const outDir = path.resolve(__dirname, "export");
fs.writeFileSync(
  path.resolve(outDir, `sample-trips.json`),
  JSON.stringify(trips)
);

const mockData = trips.map(data => {
  return {
    data,
    hash: "",
    proof_link: "https://thetangle.org"
  }
});

// console.log(JSON.stringify(mockData, null, 4));
fs.writeFileSync(
  path.resolve(__dirname, "..", "..", "frontend", "public", `mock-data.json`),
  JSON.stringify(mockData, null, 4)
);
