import connect from "./mongodb";
import { Collection } from "mongodb";
import { ChildProcess, spawn } from "child_process";
import { join } from "path";
import * as os from "os";

let collection: Collection;
let hidListen: ChildProcess;
async function initialize() {
  collection = await connect();
  let executable;
  switch (os.type()) {
    case "Darwin": {
      executable = join(__dirname, "../hid_listen.mac");
    }
  }
  console.log(executable);
  hidListen = spawn(executable);
  hidListen.stdout.on("data", data => handleData(data.toString("ascii")));
}

function handleData(message: string) {
  const data = message.split(",");
  if (data.length === 4) {
    const [col, row, pressed, layer] = data.map(str => parseInt(str));
    if (isNaN(col) || isNaN(row)) {
      // don't why some time row or col is NaN. Whatever ignore this data
      return;
    }
    const event = { col, row, pressed, layer };
    if (pressed) {
      console.log(event);
      collection.updateOne(
        { row, col },
        { $inc: { count: 1 }, $setOnInsert: { row, col } },
        {
          upsert: true
        }
      );
    }
  }
}

initialize();
