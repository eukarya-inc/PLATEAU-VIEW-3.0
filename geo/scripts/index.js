const SphericalMercator = require("@mapbox/sphericalmercator");

var merc = new SphericalMercator({
  size: 256,
  antimeridian: true,
});

const bbox = [
  140.23066937753947, 39.51987120355335, 140.41359997232712, 39.61062723280773,
];

const zoom = 16;

const tms_style = false;

console.log(merc.xyz(bbox, zoom, tms_style));

// Output: { minX: 58296, minY: 24902, maxX: 58329, maxY: 24924 }
