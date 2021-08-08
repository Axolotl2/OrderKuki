// separate js file and json file by this url: https://stackoverflow.com/questions/19706046/how-to-read-an-external-local-json-file-in-javascript
debugger;
function initializeDB() {
    // Your web app's Firebase configuration
    var firebaseConfig = {
      apiKey: "AIzaSyDdYpByfCXzQ6Kzn922r7mkCy-aCNAs6w4",
      authDomain: "orderkuki-c5aea.firebaseapp.com",
      databaseURL: "https://orderkuki-c5aea-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "orderkuki-c5aea",
      storageBucket: "orderkuki-c5aea.appspot.com",
      messagingSenderId: "31281277899",
      appId: "1:31281277899:web:e7f3d1c4f15133a12a244e"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
}
function prepareOrderMessage() {
  const sUrlNewLine = "%0A";
  // var sText = '���, ��� ���� ������ �����:';
  var sText = "מה קורה אבאלה אני רוצה להזמין:";
  const iName = 0, iMeal = 2, iAdditions = 3;
  var oOrdersFromPreferences = document.getElementById("peoplePreferences");
  
  for (var i = 1; i < oOrdersFromPreferences.rows.length; i++) {
    var sChecked = oOrdersFromPreferences.rows[i].cells[0].children[0].checked;
    var sName = oOrdersFromPreferences.rows[i].cells[1].innerText;
    var sType = oOrdersFromPreferences.rows[i].cells[2].innerText;
    var sMeal = oOrdersFromPreferences.rows[i].cells[3].innerText;
    var sAdditions = oOrdersFromPreferences.rows[i].cells[4].innerText;
    var sDrinks = oOrdersFromPreferences.rows[i].cells[5].innerText;
    var sNotes = oOrdersFromPreferences.rows[i].cells[6].innerText;

    if (sDrinks) sDrinks = `, ${sDrinks}`;
    if (sNotes) sNotes = `, ${sNotes}`;
    if (sChecked && sMeal) {
      sText += `${sUrlNewLine} ${i}. *${sType}* ${sMeal}, ${sAdditions} ${sDrinks} ${sNotes} (${sName})`;
    }
  }

  return sText;
}
function saveOrderToDB() {
    var databaseRef = firebase.database().ref();
    
    var oOrdersFromPreferences = document.getElementById("peoplePreferences");
    var orderData = {
		"name": "אסף",
		"type": "1",
		"meal": "1",
		"additions": ["1", "8", "10"],
		"drinks": [],
		"notes": "",
        "date" : new Date()
	};

    var newOrderKey = databaseRef.child('orders').push().key;
    var updates = {};
    updates['orders/' + newOrderKey] = orderData;

    return databaseRef.update(updates);
}
function order(event) {
  const sKukiPhone = "+972525585252",
    sTestPhone = "+972526241919";

  sText = prepareOrderMessage();
  saveOrderToDB();
  var sUrl = `https://api.whatsapp.com/send?phone=${sTestPhone}&text=${sText}`;
  window.open(sUrl);
}
function getArrayDescriptionAsString(tableName, keys) {
  var resultString = "";
  
  firebase.database().ref().child(tableName).get().then((data) => {
      if (data.exists()) {
        var table = document.getElementById(tableName);
        data.val().forEach(function (object, i) {
            if (resultString) resultString += ", ";
            resultString += data.val()[i].description;
        });
      } else {
        console.log(`No ${tableName} available`);
      }
    }).catch((error) => {
      console.error(error);
    });

  //keys.forEach(function (object, i) {
  //  if (resultString) resultString += ", ";
  //  resultString += json[i].description;
  //});

  return resultString;
}
function fillPeoplePreferencesTable() {
  var peoplePreferencesTable = document.getElementById("peoplePreferences");
  data.peoplePreferences.forEach(function (object) {
    var tr = document.createElement("tr");
    var typeDesc = "" //data.types[object.type].description;
    var mealDesc = "" //data.meals[object.meal].description;
    var additionsString = getArrayDescriptionAsString(
      "additions", //data.additions,
      object.additions
    );
    var drinksString = getArrayDescriptionAsString( "drinks", object.drinks );//data.drinks, object.drinks);

    tr.innerHTML =
      "<td>" +
      '<input type="checkbox"/>' +
      "</td>" +
      "<td>" +
      object.name +
      "</td>" +
      "<td>" +
      typeDesc +
      "</td>" +
      "<td>" +
      mealDesc +
      "</td>" +
      "<td>" +
      additionsString +
      "</td>" +
      "<td>" +
      drinksString +
      "</td>" +
      "<td>" +
      object.notes +
      "</td>";

    peoplePreferencesTable.appendChild(tr);
  });
}
function fillTableFromDB(tableName) {
  firebase.database().ref().child(tableName).get().then((data) => {
      if (data.exists()) {
        var table = document.getElementById(tableName);
        data.val().forEach(function (object, i) {
          var tr = document.createElement("tr");
          tr.innerHTML = "<td>" + data.val()[i].description + "</td>";
          // tr.innerHTML = `<td> <img class="imageContainer" src = ${data.types[i].img}> ${data.types[i].description} </td>`;
          // tr.innerHTML = `<td> <img class="img-fluid of img-thumbnail" src = ${data.types[i].img} <div> ${data.types[i].description} </div> </td>`;
          table.appendChild(tr);
        });
      } else {
        console.log(`No ${tableName} available`);
      }
    }).catch((error) => {
      console.error(error);
    });
}
function fillPeopleRecentOrdersTable() {
  firebase.database().ref().child("orders").get().then((data) => {
      if (data.exists()) {
        var table = document.getElementById("peopleRecentOrders");
        var orders = [], peopleRecentOrders = [];
        debugger;
        for (orderKey in data.toJSON()) {
            orders.push( data.toJSON()[orderKey] );
        }
        orders.sort((a,b) => {
            if (a["name"] === b["name"] && a["date"] === b["date"]) {
                return 0;
            } else if (a["name"] === b["name"]) {
                return (a["date"] > b["date"]) ? -1 : 1;
            } else {
                return (a["name"] < b["name"]) ? -1 : 1;
            }
        });
        orders = orders.reduce((order, val) => {
            if (Object.keys(order).includes(val.name)) return order;

            order[val.name] = orders.filter(g => g.name === val.name); 
            return order;
        }, {});
        for (name in orders) {
            peopleRecentOrders.push( orders[name][0] );
        }
      } else {
        console.log(`No orders available`);
      }
    }).catch((error) => {
      console.error(error);
    });
}
//function fillTypesTable() {
//  firebase.database().ref().child("types").get().then((types) => {
//      if (types.exists()) {
//        var typesTable = document.getElementById("types");
//        types.val().forEach(function (object, i) {
//          var tr = document.createElement("tr");
//          tr.innerHTML = "<td>" + types.val()[i].description + "</td>";
//          // tr.innerHTML = `<td> <img class="imageContainer" src = ${data.types[i].img}> ${data.types[i].description} </td>`;
//          // tr.innerHTML = `<td> <img class="img-fluid of img-thumbnail" src = ${data.types[i].img} <div> ${data.types[i].description} </div> </td>`;
//          typesTable.appendChild(tr);
//        });
//      } else {
//        console.log("No types available");
//      }
//    }).catch((error) => {
//      console.error(error);
//    });
//
//  //data.types.forEach(function (object, i) {
//  //  var tr = document.createElement("tr");
//  //  tr.innerHTML = "<td>" + data.types[i].description + "</td>";
//  //  // tr.innerHTML = `<td> <img class="imageContainer" src = ${data.types[i].img}> ${data.types[i].description} </td>`;
//  //  // tr.innerHTML = `<td> <img class="img-fluid of img-thumbnail" src = ${data.types[i].img} <div> ${data.types[i].description} </div> </td>`;
//  //  typesTable.appendChild(tr);
//  //});
//}
//function fillMealsTable() {
//  var mealsTable = document.getElementById("meals");
//  data.meals.forEach(function (object, i) {
//    var tr = document.createElement("tr");
//    tr.innerHTML = "<td>" + data.meals[i].description + "</td>";
//    mealsTable.appendChild(tr);
//  });
//}
//function fillAdditionsTable() {
//  var additionsTable = document.getElementById("additions");
//  data.additions.forEach(function (object, i) {
//    var tr = document.createElement("tr");
//    tr.innerHTML = "<td>" + data.additions[i].description + "</td>";
//    additionsTable.appendChild(tr);
//  });
//}
//function fillDrinksTable() {
//  var drinksTable = document.getElementById("drinks");
//  data.drinks.forEach(function (object, i) {
//    var tr = document.createElement("tr");
//    tr.innerHTML = "<td>" + data.drinks[i].description + "</td>";
//    drinksTable.appendChild(tr);
//  });
//}
function initialize() {
    initializeDB();
    fillPeopleRecentOrdersTable();
    fillTableFromDB("types");
    fillTableFromDB("meals");
    fillTableFromDB("additions");
    fillTableFromDB("drinks");
    //fillTypesTable();
    //fillMealsTable();
    //fillAdditionsTable();
    //fillDrinksTable();
}

initialize();