const fs = require("fs");
const http = require("http");

const SphericalMercator = require("@mapbox/sphericalmercator");
const csv = require("csv-parser");

var merc = new SphericalMercator({
  size: 256,
  antimeridian: true,
});

// Japan BBOX
// const bbox = [122.5557, 24.1659, 148.4508, 45.3326];

// Big bbox
const bbox = [
  138.4248627531053, 35.81604488971152, 140.1352593297367, 36.73898032447832,
];

// small tokyo bbox
// const bbox = [
//   139.82310765959113, 35.78615295346866, 139.83627151311708, 35.80279642066586,
// ];

// const bbox = [
//   139.7475364735945, 35.70417358160104, 139.7912813130984, 35.73710723797193,
// ];

// const bbox = [
//   139.53651460780162, 35.74718837430548, 139.73600659980474, 35.84801407627893,
// ];

// Zoom level
const zoom = 16;

// Filename
const filename = `${zoom}.zxy.csv`;

const tms_style = false;

// Parallel requests to do. By hit and trial I have set it 10,000
const parallelRequests = 10000;

const { minX, minY, maxX, maxY } = merc.xyz(bbox, zoom, tms_style);

// Output: { minX: 55078, minY: 23489, maxX: 59792, maxY: 28232 }

const getStatusCode = (zxy) => {
  return new Promise((resolve, reject) => {
    // Hit the local tile URL.
    http
      .get(`http://localhost:5002/light-map/${zxy}`, (res) => {
        resolve(res.statusCode);
      })
      .on("error", (e) => {
        reject(e);
      });
  });
};

const processRequests = (req) => {
  return Promise.all(
    req.map(async (v) => {
      const statusCode = await getStatusCode(v);
      console.log(v, statusCode);
      fs.writeFileSync(filename, `${v},${statusCode}\n`, { flag: "a+" });
    })
  );
};

(async () => {
  let requests = [];
  const processed = {};

  // if checked already, skip those
  if (fs.existsSync(filename)) {
    await new Promise((resolve, reject) => {
      fs.createReadStream(filename)
        .pipe(csv(["url", "status"]))
        .on("data", (data) => {
          processed[data.url] = true;
        })
        .on("end", () => {
          resolve(true);
        })
        .on("error", (e) => reject(e));
    });
  }

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      const zxy = `${zoom}/${x}/${y}.png`;

      if (processed[zxy]) {
        console.log(zxy, "Skipped");
        continue;
      }
      // console.log(zxy);
      // const statusCode = await getStatusCode(zxy);
      // console.log(zxy, statusCode);
      requests.push(zxy);
      if (requests.length >= parallelRequests) {
        await processRequests(requests);
        requests = [];
      }
    }
  }
  await processRequests(requests);
})();
