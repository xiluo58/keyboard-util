import * as hid from "node-hid";
import connect from "./mongodb";
import { Collection } from "mongodb";

let collection: Collection;
async function initialize() {
  collection = await connect();
  const devices = hid
    .devices()
    .filter(device => device.manufacturer === "ErgoDox EZ");
  const device = new hid.HID(devices[0].vendorId, devices[0].productId);
  device.on("data", data => {
    let message = data.toString("ascii");
    const index = message.indexOf("\n");
    message = message.substring(0, index);
    handleData(message);
  });
}

function handleData(message: string) {
  const data = message.split(",");
  if (data.length === 4) {
    const [col, row, pressed, layer] = data.map(str => parseInt(str));
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
