const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const { _onRequestWithOptions } = require("firebase-functions/v1/https");
const cors = require("cors")({ origin: true });
const app = express();
app.use(cors);
const admin = require("firebase-admin");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

admin.initializeApp();


exports.myFunction = functions.firestore.document("users/{userId}/calender/{yearId}/{monthId}/{dayId}").onUpdate((change, context) => {
  var today = new Date();
  var day = today.getDate();
  var month = today.getMonth();
  var year = today.getFullYear();
  console.log(change.after.data().goal, change.after.data().waterIntake);
  console.log(context.params.userId);

  if (change.after.data().goal <= change.after.data().waterIntake&&!change.before.data().achieved) {
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
       
      fetch(`https://us-central1-ms-users.cloudfunctions.net/app/api/users/${context.params.userId}/streak`, {
        method: "PUT", // or 'PUT',

        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      })
        .then((res) => {

        })
        .catch((err) => {
          console.log(err);
        });
    return 0;
  }
  return 1;
});

///api/users/:userId/create
app.post("/api/users/:userId", (req, res) => {
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




app.get("/api/users/:userId/waterintake/today", (req, res) => {
  var today = new Date();
  var day = today.getDate();
  var month = today.getMonth();
  var year = today.getFullYear();

  admin
    .firestore()
    .collection("users")
    .doc(req.params.userId)
    .collection("calender")
    .doc(`${year}`)
    .collection(`${month}`)
    .doc(`${day}`)
    .get()
    .then((doc) => {
      res.json({ data: doc.data() });
    })
    .catch((err) => {
      console.log(err);
    });
});
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
///api/users/:userId/waterintake/today/update/
app.put("/api/users/:userId/waterintake/today", urlencodedParser, (req, res) => {
  var today = new Date();
  var day = today.getDate();
  var month = today.getMonth();
  var year = today.getFullYear();

  admin
    .firestore()
    .collection("users")
    .doc(req.params.userId)
    .collection("calender")
    .doc(`${year}`)
    .collection(`${month}`)
    .doc(`${day}`)
    .update({
      waterIntake: admin.firestore.FieldValue.increment(100),
    })
    .then((doc) => {
      console.log(doc);
      res.json({ data: +req.body.oldAmount + +req.body.amount });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/api/users/:userId/waterintake/lastweek", (req, res) => {
  var today = new Date();
  var day = today.getDate();
  var month = today.getMonth();
  var year = today.getFullYear();
  var dayOfWeek=today.getDay();
  let days=["mon","tue","wed","thu","fri","sat","sun"]

  let data=[{index:0,data:[]},
  {index:1,data:[]},
{index:2,data:[]},
{index:3,data:[]},
{index:4,data:[]},
{index:5,data:[]},
{index:6,data:[]}]
function f1(){


 admin
   .firestore()
   .collection("users")
   .doc(req.params.userId)
   .collection("calender")
   .doc(`${year}`)
   .collection(`${month}`)
   .doc(`${day}`)
   .get()
   .then((doc) => {
     // res.json({ data: doc.data() });
     
       data[6].data = doc.data();

     
    if(day-1>=1){
       f2()

    }else{
      month--
     let newDate= new Date(year, month, 0).getDate();
     day=newDate
     f2()
    }
    
     
   })
   .catch((err) => {
     console.log(err);
   });
  }
  function f2(){
    
   admin
   .firestore()
   .collection("users")
   .doc(req.params.userId)
   .collection("calender")
   .doc(`${year}`)
   .collection(`${month}`)
   .doc(`${day- 1}`)
   .get()
   .then((doc) => {
     // res.json({ data: doc.data() });
     data[5].data = doc.data();
     if (day - 2 >= 1) {
       f3();
     } else {
       month--;
       let newDate = new Date(year, month, 0).getDate();
       day = newDate;
       f3();
     }
     
   })
   .catch((err) => {
     console.log(err);
   });
  }
  function f3(){
   admin
   .firestore()
   .collection("users")
   .doc(req.params.userId)
   .collection("calender")
   .doc(`${year}`)
   .collection(`${month}`)
   .doc(`${day- 2}`)
   .get()
   .then((doc) => {
     // res.json({ data: doc.data() });
     data[4].data = doc.data();
     if (day - 3 >= 1) {
       f4();
     } else {
       month--;
       let newDate = new Date(year, month, 0).getDate();
       day = newDate;
       f4();
     }
    
   })
   .catch((err) => {
     console.log(err);
   });
  }
  function f4(){
   admin
     .firestore()
     .collection("users")
     .doc(req.params.userId)
     .collection("calender")
     .doc(`${year}`)
     .collection(`${month}`)
     .doc(`${day - 3}`)
     .get()
     .then((doc) => {
       // res.json({ data: doc.data() });
       data[3].data = doc.data();
       if(day-4>=1){
       f5()

    }else{
      month--
     let newDate= new Date(year, month, 0).getDate();
     day=newDate
     f5()
    }
       
       
     })
     .catch((err) => {
       console.log(err);
     });
    }
    function f5(){
     admin
       .firestore()
       .collection("users")
       .doc(req.params.userId)
       .collection("calender")
       .doc(`${year}`)
       .collection(`${month}`)
       .doc(`${day - 4}`)
       .get()
       .then((doc) => {
         // res.json({ data: doc.data() });
         data[2].data = doc.data();
         if (day - 5 >= 1) {
           f6();
         } else {
           month--;
           let newDate = new Date(year, month, 0).getDate();
           day = newDate;
           f6();
         }
        
         
       })
       .catch((err) => {
         console.log(err);
       });
      }
      function f6(){
       admin
         .firestore()
         .collection("users")
         .doc(req.params.userId)
         .collection("calender")
         .doc(`${year}`)
         .collection(`${month}`)
         .doc(`${day - 5}`)
         .get()
         .then((doc) => {
           // res.json({ data: doc.data() });
           data[1].data = doc.data();
           if (day - 6 >= 1) {
             f7();
           } else {
             month--;
             let newDate = new Date(year, month, 0).getDate();
             day = newDate;
             f7();
           }
           
          
         })
         .catch((err) => {
           console.log(err);
         });
        }
        function f7(){
         admin
   .firestore()
   .collection("users")
   .doc(req.params.userId)
   .collection("calender")
   .doc(`${year}`)
   .collection(`${month}`)
   .doc(`${day- 6}`)
   .get()
   .then((doc) => {
     // res.json({ data: doc.data() });
     data[0].data = doc.data();
    
     res.json({ data:data });
    
   })
   .catch((err) => {
     console.log(err);
   });
  }
  f1()


 
});
app.get("/api/users/:userId/waterintake/lastmonth", (req, res) => {
  var today = new Date();
  var day = today.getDate();
  var month = today.getMonth();
  var year = today.getFullYear();
  var dayOfWeek = today.getDay();
  let days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  let data=[];
  let go=true
 function resolveAfterEnd(yr,mon,d) {
   return new Promise((resolve) => {
     admin
       .firestore()
       .collection("users")
       .doc(req.params.userId)
       .collection("calender")
       .doc(`${yr}`)
       .collection(`${mon}`)
       .doc(`${d }`)
       .get()
       .then((doc) => {
         // res.json({ data: doc.data() });
         if(doc.exists){
data.push(doc.data()); 
         }
         
          // console.log(doc.data());
        //  res.json({ data: data });
        resolve("succes")
       })
       .catch((err) => {
         console.log(err);
         resolve("non")
       });
   });
 }
 async function f1(yr,mon,d) {
   const x = await resolveAfterEnd(yr,mon,d);
 }
 async function loopie() {   
 for(let i=0;i<31;i++){
  const result = await f1(year, month, day);
  if (day - 1 >= 1) {
    day--
             
           } else {
             month--;
             let newDate = new Date(year, month, 0).getDate();
             day = newDate;
            
           }
  
  if(i===30){
    console.log("done")
    
    return 0;
   
  }

 }
}
 loopie().then((doc)=>{
  res.json({ data: data });

 });
console.log("last month")

 


})
const runtimeOpts = {
  timeoutSeconds: 300,
  memory: "2GB",
};

exports.app = functions.runWith(runtimeOpts).https.onRequest(app);
// exports.scheduledFunctionEndDay = functions.pubsub
//   .schedule("59 23 * * *")
//   .timeZone("Europe/Paris")
//   .onRun((context) => {
//     var today = new Date();
//     var day = today.getDate();
//     var month = today.getMonth();
//     var year = today.getFullYear();

//     admin
//       .firestore()
//       .collection("users")
//       .get()
//       .forEach((doc) => {
//         admin
//           .firestore()
//           .collection("users")
//           .doc(doc.id)
//           .collection("calender")
//           .doc(`${year}`)
//           .collection(`${month}`)
//           .doc(`${day}`)
//           .get()
//           .then((doc) => {
//             if (doc.data().goal <= doc.data().waterIntake) {
//               admin
//                 .firestore()
//                 .collection("users")
//                 .doc(doc.id)
//                 .update({
//                   streak: FieldValue.Increment(1),
//                 });
//             } else {
//               admin.firestore().collection("users").doc(doc.id).update({
//                 streak: 0,
//               });
//             }
//           });

//         admin.firestore().collection("users").doc(doc.id).collection("calender").doc(`${year}`).collection(`${month}`).doc(`${day}`).update({ available: false });
//       });
//   });