const fs = require("fs");
const fetch = require("node-fetch"); // npm install node-fetch

const playersFile = "./players.json";

async function updateUUIDs() {
  let players = JSON.parse(fs.readFileSync(playersFile, "utf-8"));

  for (let player of players) {
    if (!player.uuid) {
      try {
        const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${player.name}`);
        if (!res.ok) {
          console.warn(`UUID für ${player.name} nicht gefunden`);
          continue;
        }
        const data = await res.json();
        player.uuid = data.id;
        console.log(`UUID für ${player.name}: ${player.uuid}`);
      } catch (err) {
        console.error(`Fehler bei ${player.name}:`, err);
      }
    }
  }

  fs.writeFileSync(playersFile, JSON.stringify(players, null, 2));
  console.log("players.json aktualisiert");
}

updateUUIDs();
