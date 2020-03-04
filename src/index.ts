import connect from "./mongodb";
import { Collection } from "mongodb";
import * as HID from "node-hid";

let collection: Collection;

async function initialize() {
  collection = await connect();
  const devices = HID.devices();
  const keyboards = devices.filter(i => i.product.includes("ErgoDox"));
  for (let i = 0; i < keyboards.length; i++) {
    try {
      const deviceInfo = keyboards[i];
      const device = new HID.HID(deviceInfo.path);
      device.on("data", data => {
        const message = data.toString("ascii").split("\n")[0];
        handleData(message);
      });
      console.log(deviceInfo);
      break;
    } catch (ex) {}
  }
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
