const { client } = require("./database.js");
const { randomUUID } = require("crypto");

const testDB = async () => {
  await client.connect();
  console.log("Connected to database.");
  const db = client.db("runners-app");
  const runs = db.collection("runs");

  // await runs.insertOne({
  //     userId: randomUUID(),
  //     startTime: new Date().toISOString(),
  //     durationSec: Math.round((Math.random() * 1000)),
  //     distanceMeters: Math.round((Math.random() * 1000)),
  //     // paceAvgSecPerKm
  // });

  const count = await runs.countDocuments();
  console.log(`${count} runs data stored in database.`);

  const all = await runs.find();
  console.log(await all.toArray());

  // console.log(await getRunByID('69626cbd2dd5f6fcsdgf0fe4'));
  // console.log(await getRunByID('69625ec86cbd2dd5f6fc0fe4'));

  await client.close();
  console.log("Connection closed.");
};

testDB();

// try {
//   const err = new Error("Error: pow")
//   err.status = 400;
//   throw err;
// } catch (err) {
//   console.log("bla bla bla" + err.status + err)
// }
