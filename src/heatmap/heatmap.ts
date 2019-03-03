import layout from "./keyboard-layout.json";
import mapping from "./mapping";
import connect, { closeDb } from "../mongodb";
import { join } from "path";

import { KeyLog } from "../KeyLog";
import { writeFileSync } from "fs";
import { KeyData } from "../KeyData";

interface StatisticResult {
  max: number;
  min: number;
}

function getStatistic(data: KeyLog[]): StatisticResult {
  let min = data[0].count;
  let max = data[0].count;
  data.forEach(log => {
    if (log.count < min) {
      min = log.count;
    }
    if (log.count > max) {
      max = log.count;
    }
  });
  return { max, min };
}

function normalize(count: number, statistic: StatisticResult): number {
  return (count - statistic.min) / (statistic.max - statistic.min);
}

function generateColor(frequency: number): string {
  let red = Math.round(255 * frequency)
    .toString(16)
    .padStart(2, "0");
  let green = "00";
  let blue = Math.round(255 * (1 - frequency))
    .toString(16)
    .padStart(2, "0");
  return "#" + red + green + blue;
}

function processData(data: KeyLog[]): KeyData[] {
  const statistic = getStatistic(data);
  return data.map(log => {
    const frequency = normalize(log.count, statistic);
    return {
      ...log,
      frequency,
      color: generateColor(frequency)
    };
  });
}

async function generateHeatMap() {
  const connection = await connect();
  const data = processData(await connection.find().toArray());
  data.forEach((log: KeyData) => {
    const index = mapping(log.row, log.col);
    layout[index[0]][index[1] * 2 + 1] = "" + log.frequency.toFixed(3);
    (<any>layout[index[0]][index[1] * 2]).c = log.color;
  });
  const fileName = join(__dirname, "heatMap.json");
  writeFileSync(fileName, JSON.stringify(layout));
  console.log("heatMap saved to " + fileName);
  closeDb();
  process.exit();
}

generateHeatMap();
