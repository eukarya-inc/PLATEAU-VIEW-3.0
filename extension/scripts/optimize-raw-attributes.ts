import fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const main = async (filename: string, newFileName: string) => {
  const filePath = path.resolve(__dirname, filename);
  const file = await fs.readFile(filePath, { encoding: "utf-8" });
  const lines = file.split(/\r\n|\n/);
  const result: string[] = [];
  const names: string[] = [];
  let i = -1;
  for (const line of lines) {
    i++;
    if (i === 0 || !line) {
      continue;
    }

    const columns = line.split(",");

    const name = columns
      .slice(0, -1)
      .reverse()
      .find(c => !!c)
      ?.split(".")
      .slice(-1)[0];
    const translatedName = columns[columns.length - 1];

    if (!name || !translatedName) {
      throw new Error(`${name} or ${translatedName} is wrong`);
    }

    if (names.includes(name)) {
      continue;
    }

    names.push(name);

    result.push([name, translatedName].join(","));
  }

  await fs.writeFile(path.resolve(__dirname, newFileName), result.join("\n"));
};

await main("../attributes_v3_raw.csv", "../attributes.csv");
