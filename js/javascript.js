// separate js file and json file by this url: https://stackoverflow.com/questions/19706046/how-to-read-an-external-local-json-file-in-javascript
var oDB = {};
var oOrder = {};

async function loadJSONFromDB() {
  await firebase.database().ref().get().then((data) => {
      if (data.exists()) {
        oDB = data.val();
      } else {
        console.log(`No data available`);
      }
    }).catch((error) => {
      console.error(error);
    });
}
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
  var oOrderRows = document.getElementById("orderLines").rows;
  
  for (var i = 1; i < oOrderRows.length; i++) {
    //var sChecked = oOrderRows[i].cells[0].children[0].checked;
    var sName = oOrderRows[i].cells[0].innerText;
    var sType = oOrderRows[i].cells[1].innerText;
    var sMeal = oOrderRows[i].cells[2].innerText;
    var sAdditions = oOrderRows[i].cells[3].innerText;
    var sDrinks = oOrderRows[i].cells[4].innerText;
    var sNotes = oOrderRows[i].cells[5].innerText;

    if (sDrinks) sDrinks = `, ${sDrinks}`;
    if (sNotes) sNotes = `, ${sNotes}`;
    if (sMeal) {
      sText += `${sUrlNewLine} ${i}. *${sType}* ${sMeal}, ${sAdditions} ${sDrinks} ${sNotes} (${sName})`;
    }
  }

  return sText;
}
function saveOrderToDB() {
    var databaseRef = firebase.database().ref();
    var updates = {};
    //var oOrderRows = document.getElementById("orderLines").rows;

    for (orderKey in oOrder) {
        var orderLine = oOrder[orderKey];
        orderLine["date"] = new Date();
        //var orderData = {
	    //	"name": orderLine.name, 
	    //	"type": orderLine.type, 
	    //	"meal": orderLine.meal, 
	    //	"additions": orderLine.additions,
	    //	"drinks": orderLine.drinks,
	    //	"notes": orderLine.notes,
        //    "date" : new Date()
	    //};

        var newOrderKey = databaseRef.child('orders').push().key;
        updates['orders/' + newOrderKey] = orderLine;
    }
    //for ( var i = 1; i < oOrderRows.length ; i++ ) {
    //    var rowID = oOrderRows[i].children[0].innerHTML;
    //    var row = oDB["orders"][rowID];
    //    var orderData = {
	//    	"name": row.name, //oOrderRows[i].children[0].innerHTML,
	//    	"type": row.type, //oOrderRows[i].children[1].innerHTML,
	//    	"meal": row.meal, //oOrderRows[i].children[2].innerHTML,
	//    	"additions": row.additions,
	//    	"drinks": row.drinks,
	//    	"notes": row.notes, //oOrderRows[i].children[5].innerHTML,
    //        "date" : new Date()
	//    };
    //
    //    var newOrderKey = databaseRef.child('orders').push().key;
    //    updates['orders/' + newOrderKey] = orderData;
    //}
    
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
function addLineToOrder(orderLine) {
    var orderTableBody = document.getElementById("orderLines").children[1];
    var tr = document.createElement("tr");
    var typeDesc = oDB["types"][orderLine.type]; //data.types[object.type].description;
    var mealDesc = oDB["meals"][orderLine.meal]; //data.meals[object.meal].description;
    var additionsString = getArrayDescriptionAsString(oDB["additions"], orderLine.additions );
    var drinksString = getArrayDescriptionAsString(oDB["drinks"], orderLine.drinks );
    debugger;

    tr.innerHTML =
      "<td>" +
      orderLine.name +
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
      orderLine.notes +
      "</td>" +
      "<td>" +
      '<button class="btn btn btn-light" id="removeLineFromOrder" onclick="removeLineFromOrder(this)" type="button">הסרה</button>' +
      "</td>";

    // create\replace order line
    if (oOrder[orderLine.name]) {
        for ( var i = 1; i < orderTableBody.children.length; i++) {
            if (orderTableBody.children[i].children[0].innerHTML == orderLine.name) {
                orderTableBody.replaceChild(tr, orderTableBody.children[i]);
                break;
            }
        }
    } else {
        orderTableBody.appendChild(tr);  
    }  
    oOrder[orderLine.name] = orderLine;
}
function removeLineFromOrder(event) {
    var orderTable = document.getElementById("orderLines");
    var row = event.parentElement.parentElement;
    var rowID = row.cells[0].outerText;

    row.remove();
    delete oOrder[rowID];
}
function addRecentOrderLineToOrder(event) {
    var rowID = event.parentElement.parentElement.cells[0].outerText;
    var row = oDB["orders"][rowID];

    var orderLine = {
		"name": row.name,
		"type": row.type,
		"meal": row.meal,
		"additions": (row.additions != null) ? row.additions : [],
		"drinks": (row.drinks != null) ? row.drinks : [],
		"notes": row.notes
	};

    addLineToOrder(orderLine);
}
function getArrayDescriptionAsString(tableName, keys) {
  var resultString = "";

  if (keys == null) return resultString;

  keys.forEach(function (object) {
    if (resultString) resultString += ", ";
    resultString += tableName[object];    
  });

  //firebase.database().ref().child(tableName).get().then((data) => {
  //    if (data.exists()) {
  //      var table = document.getElementById(tableName);
  //      data.val().forEach(function (object, i) {
  //          if (resultString) resultString += ", ";
  //          resultString += data.val()[i].description;
  //      });
  //    } else {
  //      console.log(`No ${tableName} available`);
  //    }
  //  }).catch((error) => {
  //    console.error(error);
  //  });

  //keys.forEach(function (object, i) {
  //  if (resultString) resultString += ", ";
  //  resultString += json[i].description;
  //});
  
  return resultString;
}
//function fillPeoplePreferencesTable() {
//  var peoplePreferencesTable = document.getElementById("peoplePreferences");
//  data.peoplePreferences.forEach(function (object) {
//    var tr = document.createElement("tr");
//    var typeDesc = "" //data.types[object.type].description;
//    var mealDesc = "" //data.meals[object.meal].description;
//    var additionsString = getArrayDescriptionAsString(
//      "additions", //data.additions,
//      object.additions
//    );
//    var drinksString = getArrayDescriptionAsString( "drinks", object.drinks );//data.drinks, object.drinks);
//
//    tr.innerHTML =
//      "<td>" +
//      '<input type="checkbox"/>' +
//      "</td>" +
//      "<td>" +
//      object.name +
//      "</td>" +
//      "<td>" +
//      typeDesc +
//      "</td>" +
//      "<td>" +
//      mealDesc +
//      "</td>" +
//      "<td>" +
//      additionsString +
//      "</td>" +
//      "<td>" +
//      drinksString +
//      "</td>" +
//      "<td>" +
//      object.notes +
//      "</td>";
//
//    peoplePreferencesTable.appendChild(tr);
//  });
//}
function fillTableFromDB(tableName) {
    var rows = oDB[tableName];
    var table = document.getElementById(tableName);
    rows.forEach(function (object, i) {
        var tr = document.createElement("tr");
        tr.innerHTML = "<td>" + rows[i] + "</td>";
        // tr.innerHTML = `<td> <img class="imageContainer" src = ${data.types[i].img}> ${data.types[i].description} </td>`;
        // tr.innerHTML = `<td> <img class="img-fluid of img-thumbnail" src = ${data.types[i].img} <div> ${data.types[i].description} </div> </td>`;
        table.appendChild(tr);
    });

  //firebase.database().ref().child(tableName).get().then((data) => {
  //    if (data.exists()) {
  //      var table = document.getElementById(tableName);
  //      data.val().forEach(function (object, i) {
  //        var tr = document.createElement("tr");
  //        tr.innerHTML = "<td>" + data.val()[i].description + "</td>";
  //        // tr.innerHTML = `<td> <img class="imageContainer" src = ${data.types[i].img}> ${data.types[i].description} </td>`;
  //        // tr.innerHTML = `<td> <img class="img-fluid of img-thumbnail" src = ${data.types[i].img} <div> ${data.types[i].description} </div> </td>`;
  //        table.appendChild(tr);
  //      });
  //    } else {
  //      console.log(`No ${tableName} available`);
  //    }
  //  }).catch((error) => {
  //    console.error(error);
  //  });
}
function getRecentOrderPerName(ordersFromDB) {
    var orders = [], peopleRecentOrders = [];

    for (orderKey in ordersFromDB) {
        var order = ordersFromDB[orderKey];
        order["id"] = orderKey;
        orders.push( order );
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
    
    return peopleRecentOrders;
}
function preparePeopleRecentOrdersTable(orders) {
    var recentOrdersTableBody = document.getElementById("peopleRecentOrders").children[1];

    orders.forEach(function (object) {
        var tr = document.createElement("tr");
        var typeDesc = oDB["types"][object.type]; //data.types[object.type].description;
        var mealDesc = oDB["meals"][object.meal]; //data.meals[object.meal].description;
        var additionsString = getArrayDescriptionAsString(oDB["additions"], object.additions );
        var drinksString = getArrayDescriptionAsString(oDB["drinks"], object.drinks );

        tr.innerHTML =
          '<td style="display:none;">' +
          object.id +
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
          "</td>" + 
          "<td>" +
          //'<input type="checkbox"/>' +
          '<button class="btn btn btn-light" id="addRecentOrderLineToOrder" onclick="addRecentOrderLineToOrder(this)" type="button">הוספה</button>' +
          "</td>";

        recentOrdersTableBody.appendChild(tr);
    });
}
function fillPeopleRecentOrdersTable() {
  preparePeopleRecentOrdersTable(getRecentOrderPerName(oDB["orders"]));
  //firebase.database().ref().child("orders").get().then((data) => {
  //    if (data.exists()) {
  //      preparePeopleRecentOrdersTable(getRecentOrderPerName(data.toJSON()));
  //    } else {
  //      console.log(`No orders available`);
  //    }
  //  }).catch((error) => {
  //    console.error(error);
  //  });
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
function createCollapsibleMenu() {
    
}
async function initialize() {
    initializeDB();
    await loadJSONFromDB();
    fillPeopleRecentOrdersTable();
    createCollapsibleMenu();
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