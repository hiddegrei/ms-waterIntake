const functions = require("firebase-functions");
const express = require("express");
const app = express();
const cors = require("cors")({ origin: true });
app.use(cors);
const admin = require("firebase-admin");
admin.initializeApp();

exports.myFunction = functions.firestore.document("users/{userId}/calender/{yearId}/{monthId}/{dayId}").onUpdate((change, context) => {
  var today = new Date();
  var day = today.getDate();
  var month = today.getMonth();
  var year = today.getFullYear();
  console.log(change.after.data().goal, change.after.data().waterIntake);
  console.log(context.params.userId);

  if (change.after.data().goal <= change.after.data().waterIntake) {
    admin
      .firestore()
      .collection("users")
      .doc(context.params.userId)
      .collection("calender")
      .doc(context.params.yearId)
      .collection(context.params.monthId)
      .doc(context.params.dayId)
      .update({ achieved: true })
      .catch((err) => {
        console.log(err);
      });
    return 0;
  }
  return 1;
});

app.get("/", (req, res) => {
  const date = new Date();
  const hours = (date.getHours() % 12) + 1; // London is UTC + 1hr;
  res.send(`
    <!doctype html>
    <head>
      <title>Time</title>
      <link rel="stylesheet" href="/style.css">
      <script src="/script.js"></script>
    </head>
    <body>
      <p>In London, the clock strikes:
        <span id="bongs">${"BONG ".repeat(hours)}</span></p>
      <button onClick="refresh(this)">Refresh</button>
    </body>
  </html>`);
});

app.get("/api", (req, res) => {
  const date = new Date();
  const hours = (date.getHours() % 12) + 1; // London is UTC + 1hr;
  res.json({ bongs: "BONG ".repeat(hours) });
});

app.post("/api/users/:userId/create", (req, res) => {
  var today = new Date();
  let avaiTrue = false;
  for (let j = 0; j < 12; j++) {
    let months = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"];

    var year = today.getFullYear();
    var month = j;
    var newDate = new Date(year, j, 0);
    var newDays = newDate.getDate();
    console.log(year, month, newDays);

    var today2 = new Date();
    var day2 = today.getDate();
    var month2 = today.getMonth();
    var year2 = today.getFullYear();

    for (let i = 1; i < newDays + 1; i++) {
      if (year === year2 && month === month2 && i === day2) {
        avaiTrue = true;
      }
      if (avaiTrue) {
        admin
          .firestore()
          .collection("users")
          .doc(req.params.userId)
          .collection("calender")
          .doc(`${year}`)
          .collection(`${month}`)
          .doc(`${i}`)
          .set({ waterIntake: 0, goal: 2000, date: new Date(year, j, i), achieved: false, available: true })
          .catch((err) => console.log(err));
      }
    }
  }
});

app.get("/api/users/:userId/waterintake", (req, res) => {
  var today = new Date();
  var day = today.getDate();
  var month = today.getMonth();
  var year = today.getFullYear();
  let dataR = [];

  function resolveAfterEnd() {
    return new Promise((resolve) => {
      for (let i = 0; i < 7; i++) {
        admin
          .firestore()
          .collection("users")
          .doc(req.params.userId)
          .collection("calender")
          .doc(`${year}`)
          .collection(`${month}`)
          .doc(`${day + i}`)
          .get()
          .then((doc) => {
            if (dataR.length == undefined) {
              dataR[0] = doc.data();
            } else {
              dataR[dataR.length] = doc.data();
            }

            if (dataR.length === 7) {
              console.log(dataR);
              resolve("succes");
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  }
  async function f1() {
    const x = await resolveAfterEnd();
  }
  let result1 = f1().then(() => {
    res.json({ data: dataR });
    return dataR;
  });
});

exports.app = functions.https.onRequest(app);
