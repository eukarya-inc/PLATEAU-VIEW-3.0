import fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const main = async (filename: string, newFileName: string) => {
  const filePath = path.resolve(__dirname, filename);
  const file = await fs.readFile(filePath, { encoding: "utf-8" });
  const lines = file.split(/\r\n|\n/);
  const result: string[] = [];
  let i = -1;
  for (const line of lines) {
    i++;
    if (i === 0 || !line) {
      continue;
    }

    const columns = line.split(",");

    const featureType = columns[2];
    const tag1 = columns[5];
    const tag2 = columns[6];
    const tag3 = columns[7];
    const tag4 = columns[8];
    const description = columns[9];
    const dataType = (() => {
      switch (columns[10]) {
        case "日付型（xs:date）":
          return "date";
        case "グレゴリオ年型（xs:gYear）":
          return "gYear";
      }
    })();

    const key = [tag1, tag2, tag3, tag4].filter(Boolean).join("_");

    result.push([key, JSON.stringify({ featureType, description, dataType })].join(","));
  }

  await fs.writeFile(path.resolve(__dirname, newFileName), result.join("\n"));
};

// const temp = async (filename: string, newFileName: string) => {
//   const filePath = path.resolve(__dirname, filename);
//   const file = await fs.readFile(filePath, { encoding: "utf-8" });
//   const lines = file.split(/\r\n|\n/);
//   const nestedTag1: string[] = [];
//   const result: string[] = [];
//   let i = -1;
//   for (const line of lines) {
//     i++;
//     if (i === 0 || !line) {
//       continue;
//     }

//     const columns = line.split(",");

//     const tag1 = columns[2];
//     const description = columns[6];

//     const key = tag1.split(".")[1];
//     if (tag1.includes(".") && !nestedTag1.includes(key)) {
//       result.push([key, description].join(","));
//       nestedTag1.push(key);
//     }
//   }

//   await fs.writeFile(path.resolve(__dirname, newFileName), result.join("\n"));
// };

await main("../attributes_raw.csv", "../attributes.txt");
// await temp("../attributes_v3_raw.csv", "../attributes_temp.txt");
