const parse = require("csv-parse/lib/sync");
const fs = require("fs");
const path = require("path")


const table = parse(
  fs.readFileSync(path.resolve(__dirname, "data", "sample-trip.csv"), "utf8")
);

const [header, ...rows] = table;

const data = rows.map((row, acc) => {
  return row.reduce((acc, value, i) => {
    // console.log("value", value);
    const key = header[i];
    if(key == ''){
      return acc;
    }
    const camelcasedKey = key.toLowerCase().replace(/\s/g, "_");
    return Object.assign(acc, {
      [camelcasedKey]: value
    });
  }, {});
});


const outDir = path.resolve(__dirname, "export");
fs.writeFileSync(path.resolve(outDir, "sample-trip.json"), JSON.stringify(data));

const dataTemplate = require("./model/datamodel.json");
const [trip] = dataTemplate;

trip.data.waypoints = data;
fs.writeFileSync(path.resolve(outDir, "mock-data.json"), JSON.stringify([trip]));
