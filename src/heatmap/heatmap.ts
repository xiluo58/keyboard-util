import layout from "./keyboard-layout.json";
import mapping from "./mapping";
import connect, { closeDb } from "../mongodb";

import { KeyLog } from "../KeyLog";
import { writeFileSync } from "fs";


async function generateHeatmap() {
  const connection = await connect();
  const data = await connection.find().toArray();
  data.forEach((log: KeyLog) => {
    const index = mapping(log.row, log.col);
    layout[index[0]][index[1] * 2 + 1] = "" + log.count;
  });
  writeFileSync('./count.json', JSON.stringify(layout));
  console.log("heat map generated");
  closeDb();
  process.exit();
}

generateHeatmap();
