var fs = require('fs');

var dataModel = JSON.parse(fs.readFileSync('model/empty.datamodel.js', 'utf8'));
var geoJSON = JSON.parse(fs.readFileSync('data/route.geo.json', 'utf8'));

var coordinates = geoJSON.features[0].geometry.coordinates;

var waypoints = [];
for(var i in coordinates) {
	var coordinate = {
		lat: coordinates[i][0],
		lon: coordinates[i][1],
		speed: 100
	}
	dataModel.push(coordinate);
}

var exportJSON = JSON.stringify(dataModel);
console.log(exportJSON);

fs.writeFile('export/dataSample.json', exportJSON, 'utf8', function() {
	console.log("done. see export/dataSample.js!");
});
