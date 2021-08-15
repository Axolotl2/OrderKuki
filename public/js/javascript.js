var oDB = {};
var oOrder = {};

async function loadJSONFromDB() {
    await firebase
        .database()
        .ref()
        .get()
        .then((data) => {
            if (data.exists()) {
                oDB = data.val();
            } else {
                console.log(`No data available`);
            }
        })
        .catch((error) => {
            console.error(error);
        });
}
function initializeDB() {
    // Your web app's Firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyDIcfyhJ9f8ed8YCDBcrhgc1Jm3l7eJY64",
        authDomain: "schnitzelkuki.firebaseapp.com",
        databaseURL: "https://schnitzelkuki-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "schnitzelkuki",
        storageBucket: "schnitzelkuki.appspot.com",
        messagingSenderId: "104128094690",
        appId: "1:104128094690:web:6bf3269de17ec1a9f2d9bb"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
}
function prepareOrderMessage() {
    const sUrlNewLine = "%0A";
    var sText = "היי, אני רוצה להזמין בבקשה:";
    var index = 1;
    //var oOrderRows = document.getElementById("orderLines").rows;

    for (orderKey in oOrder) {
        var orderLine = oOrder[orderKey];
        var sName = orderLine.name;
        var sType = orderLine.type;
        var sMeal = getArrayDescriptionAsString(orderLine.meals);
        var sAdditions = getArrayDescriptionAsString(orderLine.additions);
        var sSauces = getArrayDescriptionAsString(orderLine.sauces);
        var sDrinks = getArrayDescriptionAsString(orderLine.drinks);
        var sNotes = orderLine.notes;

        if (sAdditions) sAdditions = `, ${sAdditions}`;
        if (sSauces) sSauces = `, ${sSauces}`;
        if (sDrinks) sDrinks = `, ${sDrinks}`;
        if (sNotes) sNotes = `, ${sNotes}`;
        sText += `${sUrlNewLine} ${index++}. *${sType}* ${sMeal}${sAdditions}${sSauces}${sDrinks}${sNotes} (${sName})`;
    }

    //for (var i = 1; i < oOrderRows.length; i++) {
    //	var sName = oOrderRows[i].cells[0].innerText;
    //	var sType = oOrderRows[i].cells[1].innerText;
    //	var sMeal = oOrderRows[i].cells[2].innerText;
    //	var sAdditions = oOrderRows[i].cells[3].innerText;
    //	var sSauces = oOrderRows[i].cells[4].innerText;
    //	var sDrinks = oOrderRows[i].cells[5].innerText;
    //	var sNotes = oOrderRows[i].cells[6].innerText;
    //
    //	if (sAdditions) sAdditions = `, ${sAdditions}`;
    //	if (sSauces) sSauces = `, ${sSauces}`;
    //	if (sDrinks) sDrinks = `, ${sDrinks}`;
    //	if (sNotes) sNotes = `, ${sNotes}`;
    //	sText += `${sUrlNewLine} ${i}. *${sType}* ${sMeal}${sAdditions}${sSauces}${sDrinks}${sNotes} (${sName})`;
    //}

    return sText;
}
function saveOrderToDB() {
    var databaseRef = firebase.database().ref();
    var updates = {};
    //var oOrderRows = document.getElementById("orderLines").rows;

    if (!isProd()) return;

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

        var newOrderKey = databaseRef.child("orders").push().key;
        updates["orders/" + newOrderKey] = orderLine;
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
function isProd() {
    return location.hostname === "schnitzelkuki.web.app";
}
function order(event) {
    const sKukiPhone = "+972525585252",
        sTestPhone = "+972526241919";

    var sPhone = isProd() ? sKukiPhone : sTestPhone;
    sText = prepareOrderMessage();
    saveOrderToDB();
    var sUrl = `https://api.whatsapp.com/send?phone=${sTestPhone}&text=${sText}`;
    window.open(sUrl);
}
function addLineToOrder(orderLine) {
    var orderTableBody = document.getElementById("orderLinesBody");
    var tr = document.createElement("tr");
    tr.id = "order";
    //var typeDesc = oDB["types"][orderLine.type]; //data.types[object.type].description;
    //var mealDesc = oDB["meals"][orderLine.meal]; //data.meals[object.meal].description;
    var mealsString = getArrayDescriptionAsString(orderLine.meals);
    var additionsString = getArrayDescriptionAsString(orderLine.additions);
    var saucesString = getArrayDescriptionAsString(orderLine.sauces);
    var drinksString = getArrayDescriptionAsString(orderLine.drinks);

    if (!confirmOrderOverwrite(orderLine)) return false;

    tr.innerHTML =
        "<td id='name'>" +
        orderLine.name +
        "</td>" +
        "<td id='type'>" +
        orderLine.type +
        "</td>" +
        "<td id='meals'>" +
        mealsString +
        "</td>" +
        "<td id='additions'>" +
        additionsString +
        "</td>" +
        "<td id='sauces'>" +
        saucesString +
        "</td>" +
        "<td id='drinks'>" +
        drinksString +
        "</td>" +
        "<td id='notes'>" +
        orderLine.notes +
        "</td>" +
        "<td>" +
        '<button class="btn btn btn-outline-danger" id="removeLineFromOrder" onclick="removeLineFromOrder(this)" type="button">הסרה</button>' +
        "</td>";

    debugger;
    // create\replace order line
    if (oOrder[orderLine.name]) {
        for (var i = 0; i < orderTableBody.children.length; i++) {
            if (orderTableBody.children[i].querySelector("#name") == orderLine.name) {
                orderTableBody.replaceChild(tr, orderTableBody.children[i]);
                break;
            }
        }
    } else {
        orderTableBody.appendChild(tr);
    }
    oOrder[orderLine.name] = orderLine;

    return true;
}
function showOlderOrdersForName(event) {
    var modal = document.getElementById("olderOrdersModal");
    var orders = [];
    var name = event.innerHTML;
    modal.style.display = "block";
    // get unique flag from checkbox
    orders = getOrdersForName(oDB["orders"], name, false);
    prepareOlderOrdersTable(name, orders);
}
function closeOlderOrdersModal(event) {
    var modal = document.getElementById("olderOrdersModal");

    modal.style.display = "none";
}
function removeLineFromOrder(event) {
    debugger;
    var orderTable = document.getElementById("orderLines");
    var order = $(event).closest("#order")[0];
    var orderID = order.querySelector("#name").outerText;

    order.remove();
    delete oOrder[orderID];
}
function confirmOrderOverwrite(orderLine) {
    debugger;
    var lineAlreadyExists = oOrder[orderLine.name] != null;

    return (lineAlreadyExists && confirm(`ל${orderLine.name} כבר קיימת הזמנה, לדרוס אותה?`)) || !lineAlreadyExists;
}
function validateMenuItemSelection(event) {

    return true;
}
function addMenuItemToOrder(event) {
    var typeFromMenu, mealsFromMenu = [], additionsFromMenu = [], saucesFromMenu = [], drinksFromMenu = [];
    var nameFromInput, notesFromInput;
    var inputsToClear = [];
    var header = event.parentElement;

    switch (header.id) {
        case "type1":
            typeFromMenu = 'חמגשית';
            break;
        case "type2":
            // get type from checkbox
            break;
        case "type3":
            typeFromMenu = `צ'יפס`;
            break;
        default:
            return;
    }

    for (menuIndex in header.nextElementSibling.children) {
        var element = header.nextElementSibling.children[menuIndex];

        switch (element.id) {
            case "types":
                for (typeIndex in element.children) {
                    var type = element.children[typeIndex];
                    inputsToClear.push(type);
                    if (type.tagName != "LABEL") continue;
                    if (type.previousElementSibling.checked) typeFromMenu = type.innerText;
                }
                break;
            case "meals":
                for (mealIndex in element.children) {
                    var meal = element.children[mealIndex];
                    inputsToClear.push(meal);
                    if (meal.tagName != "LABEL") continue;
                    if (meal.previousElementSibling.checked) mealsFromMenu.push(meal.innerText);
                }
                break;
            case "additions":
                for (additionIndex in element.children) {
                    var addition = element.children[additionIndex];
                    inputsToClear.push(addition);
                    if (addition.tagName != "LABEL") continue;
                    if (addition.previousElementSibling.checked) additionsFromMenu.push(addition.innerText);
                }
                break;
            case "sauces":
                for (sauceIndex in element.children) {
                    var sauce = element.children[sauceIndex];
                    inputsToClear.push(drink);
                    if (sauce.tagName != "LABEL") continue;
                    if (sauce.previousElementSibling.checked) saucesFromMenu.push(sauce.innerText);
                }
                break;
            case "drinks":
                for (drinkIndex in element.children) {
                    var drink = element.children[drinkIndex];
                    inputsToClear.push(drink);
                    if (drink.tagName != "LABEL") continue;
                    if (drink.previousElementSibling.checked) drinksFromMenu.push(drink.innerText);
                }
                break;
            case "name":
                var name = element.children[1];
                inputsToClear.push(name);
                nameFromInput = name.value;
                break;
            case "notes":
                var notes = element.children[1];
                inputsToClear.push(notes);
                notesFromInput = notes.value;
                break;
            default:
                break;
        }
    }

    var orderLine = {
        name: nameFromInput,
        type: typeFromMenu,
        meals: mealsFromMenu,
        additions: additionsFromMenu,
        sauces: saucesFromMenu,
        drinks: drinksFromMenu,
        notes: notesFromInput,
    };

    if (!validateMenuItemSelection(event)) return false;

    addLineToOrder(orderLine);

    for (inputIndex in inputsToClear) {
        var input = inputsToClear[inputIndex];
        if (input.tagName != "INPUT") continue;

        if (input.type === "checkbox") {
            input.checked = false;
        } else {
            input.value = "";
        }
    }
}
function addOlderOrderLineToOrder(event) {
    if (addRecentOrderLineToOrder(event)) closeOlderOrdersModal(event);
}
function addRecentOrderLineToOrder(event) {
    var rowID = event.parentElement.parentElement.cells[0].outerText;
    var row = oDB["orders"][rowID];

    var orderLine = {
        name: row.name,
        type: row.type,
        meals: row.meals != null ? row.meals : [],
        additions: row.additions != null ? row.additions : [],
        sauces: row.sauces != null ? row.sauces : [],
        drinks: row.drinks != null ? row.drinks : [],
        notes: row.notes,
    };

    return addLineToOrder(orderLine);
}
function getArrayDescriptionAsString(array) {
    var resultString = "";

    if (array == null) return resultString;

    array.forEach(function (value) {
        if (resultString) resultString += ", ";
        resultString += value;
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
//function fillTableFromDB(tableName) {
//    var rows = oDB[tableName];
//    var table = document.getElementById(tableName);
//    rows.forEach(function (object, i) {
//        var tr = document.createElement("tr");
//        tr.innerHTML = "<td>" + rows[i] + "</td>";
//        // tr.innerHTML = `<td> <img class="imageContainer" src = ${data.types[i].img}> ${data.types[i].description} </td>`;
//        // tr.innerHTML = `<td> <img class="img-fluid of img-thumbnail" src = ${data.types[i].img} <div> ${data.types[i].description} </div> </td>`;
//        table.appendChild(tr);
//    });
//
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
//}
function parseOrdersFromDBToArray(ordersFromDB) {
    var orders = [];

    for (orderKey in ordersFromDB) {
        var order = ordersFromDB[orderKey];
        order["id"] = orderKey;
        orders.push(order);
    }

    return orders;
}
function sortOrdersByNameAndDate(orders) {
    orders.sort((a, b) => {
        if (a["name"] === b["name"] && a["date"] === b["date"]) {
            return 0;
        } else if (a["name"] === b["name"]) {
            return a["date"] > b["date"] ? -1 : 1;
        } else {
            return a["name"] < b["name"] ? -1 : 1;
        }
    });

    return orders;
}
function isObjectsEqualsByData(obj1, obj2) {
    const obj1Length = Object.keys(obj1).length;
    const obj2Length = Object.keys(obj2).length;

    if (obj1Length === obj2Length) {
        return Object.keys(obj1).every(
            key => obj2.hasOwnProperty(key)
                && obj2[key] === obj1[key]);
    }
    return false;
}
function isOrdersEqualsByData(order1, order2) {
    var order1Data = order1, order2Data = order2;

    delete order1Data.id;
    delete order1Data.date;
    delete order2Data.id;
    delete order2Data.date;

    return isObjectsEqualsByData(order1Data, order2Data);
}
function isOrderMostRecentDuplicate(order1, order2) {

    var equals = isOrdersEqualsByData(order1, order2);

    return (equals && order1.date > order2) || !equals;

}
function groupOrdersByName(orders) {
    orders = orders.reduce((order, val) => {
        if (Object.keys(order).includes(val.name)) return order;

        order[val.name] = orders.filter((g) => g.name === val.name);
        return order;
    }, {});

    return orders;
}
function groupOrdersByDataEquality(orders) {
    orders = orders.reduce((order, val) => {
        if (Object.keys(order).includes(val.name)) return order;

        order[val.date] = orders.filter(g => isOrderMostRecentDuplicate(g, val));
        return order;
    }, {});

    return orders;
}
function getLastOrderPerName(ordersFromDB) {
    var orders = [],
        peopleLastOrders = [];

    orders = parseOrdersFromDBToArray(ordersFromDB);
    orders = sortOrdersByNameAndDate(orders);
    orders = groupOrdersByName(orders);

    for (name in orders) {
        peopleLastOrders.push(orders[name][0]);
    }

    return peopleLastOrders;
}
function filterOrdersByName(orders, name) {
    var filteredOrders = [];

    for (orderKey in orders) {
        if (orders[orderKey]["name"] === name) filteredOrders.push(orders[orderKey]);
    }

    return filteredOrders;
}
function getOrdersForName(ordersFromDB, name, uniqueFlag) {
    var orders = [], ordersOfName = [];
    debugger;

    orders = parseOrdersFromDBToArray(ordersFromDB);
    orders = filterOrdersByName(orders, name);
    orders = sortOrdersByNameAndDate(orders);

    if (uniqueFlag) {
        orders = groupOrdersByDataEquality(orders);
        delete orders.undefined;

        for (date in orders) {
            ordersOfName.push(orders[date][0]);
        }
    } else {
        ordersOfName = orders;
    }

    return ordersOfName;
}
function convertDateForOutput(date) {
    var sDate = new Date(date);
    var dd = String(sDate.getDate()).padStart(2, '0');
    var mm = String(sDate.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = sDate.getFullYear();

    sDate = `${dd}/${mm}/${yyyy}`

    return sDate;
}
function prepareOlderOrdersTable(name, orders) {
    var olderOrdersTable = document.getElementById("olderOrders");
    var olderOrdersTableTitle = olderOrdersTable.previousElementSibling;
    var olderOrders = olderOrdersTable.children[1];

    olderOrdersTableTitle.innerHTML = `הזמנות קודמות - ${name}`;

    for (var i = olderOrdersTable.rows.length - 1; i > 0; i--) {
        olderOrdersTable.deleteRow(i);
    }

    orders.forEach(function (object) {
        var tr = document.createElement("tr");
        //var typeDesc = oDB["types"][object.type]; //data.types[object.type].description;
        //var mealDesc = oDB["meals"][object.meal]; //data.meals[object.meal].description;
        var mealsString = getArrayDescriptionAsString(object.meals);
        var additionsString = getArrayDescriptionAsString(object.additions);
        var saucesString = getArrayDescriptionAsString(object.sauces);
        var drinksString = getArrayDescriptionAsString(object.drinks);

        tr.innerHTML =
            '<td style="display:none;">' +
            object.id +
            "</td>" +
            "<td>" +
            //new Date(object.date).toLocaleDateString() +
            convertDateForOutput(object.date) +
            "</td>" +
            "<td>" +
            object.type +
            "</td>" +
            "<td>" +
            mealsString +
            "</td>" +
            "<td>" +
            additionsString +
            "</td>" +
            "<td>" +
            saucesString +
            "</td>" +
            "<td>" +
            drinksString +
            "</td>" +
            "<td>" +
            object.notes +
            "</td>" +
            "<td>" +
            '<button class="btn btn btn-light" id="addOlderOrderLineToOrder" onclick="addOlderOrderLineToOrder(this)" type="button">הוספה</button>' +
            "</td>";

        olderOrders.appendChild(tr);
    });
}
function preparePeopleRecentOrdersTable(orders) {
    var recentOrdersTableBody =
        document.getElementById("peopleRecentOrders").children[1];

    orders.forEach(function (object) {
        var tr = document.createElement("tr");
        //var typeDesc = oDB["types"][object.type]; //data.types[object.type].description;
        //var mealDesc = oDB["meals"][object.meal]; //data.meals[object.meal].description;
        var mealsString = getArrayDescriptionAsString(object.meals);
        var additionsString = getArrayDescriptionAsString(object.additions);
        var saucesString = getArrayDescriptionAsString(object.sauces);
        var drinksString = getArrayDescriptionAsString(object.drinks);

        tr.innerHTML =
            '<td style="display:none;">' +
            object.id +
            "</td>" +
            "<td class='bg-light'>" +
            `<button class="btn btn btn-light" id="showOlderOrdersForName" onclick="showOlderOrdersForName(this)" type="button">${object.name}</button>` +
            "</td>" +
            "<td class='bg-light'>" +
            object.type +
            "</td>" +
            "<td class='bg-light'>" +
            mealsString +
            "</td>" +
            "<td class='bg-light'>" +
            additionsString +
            "</td>" +
            "<td class='bg-light'>" +
            saucesString +
            "</td>" +
            "<td class='bg-light'>" +
            drinksString +
            "</td>" +
            "<td class='bg-light'>" +
            object.notes +
            "</td>" +
            "<td class='bg-light'>" +
            //'<input type="checkbox"/>' +
            '<button class="btn btn btn-outline-primary" id="addRecentOrderLineToOrder" onclick="addRecentOrderLineToOrder(this)" type="button">הוספה</button>' +
            "</td>";

        recentOrdersTableBody.appendChild(tr);
    });
}
function fillPeopleRecentOrdersTable() {
    preparePeopleRecentOrdersTable(getLastOrderPerName(oDB["orders"]));
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
    debugger;
    var collapsibles = document.getElementsByClassName("collapsible");

    for (index in collapsibles) {
        var collapsible = collapsibles[index];
        var clickedCollapsible = $(this).closest(".collapsible")[0];

        collapsible.querySelector("#collapsible-title").addEventListener("click", function () {
            var collapsibles = document.getElementsByClassName("collapsible");
            var clickedCollapsible = $(this).closest(".collapsible")[0];

            for (var i = 0; i < collapsibles.length; i++) {
                var collapsible = collapsibles[i];
                if (collapsible === clickedCollapsible) continue;
                var button = collapsible.querySelector("#addMenuItemToOrder");
                var content = collapsible.querySelector("#content");
                button.style.display = "none";
                content.style.display = "none";
            }
            this.classList.toggle("active");
            button = clickedCollapsible.querySelector("#addMenuItemToOrder");
            content = clickedCollapsible.querySelector("#content");
            button.style.display = (button.style.display === "block") ? "none" : "block";
            content.style.display = (content.style.display === "block") ? "none" : "block";
        });
    }

    //	collapsible.querySelector("#collapsible-title").addEventListener("click", function () {
    //		debugger;
    //		var collapsibles = document.getElementsByClassName("collapsible");
    //		for (var i = 0; i < collapsibles.length; i++) {
    //			var collapsible = collapsibles[i];
    //			if (collapsible === this) continue;
    //			var button = collapsible.querySelector("#addMenuItemToOrder");
    //			var content = collapsible.querySelector("#content");
    //			button.style.display = "none";
    //			content.style.display = "none";
    //		}
    //		this.classList.toggle("active");
    //		button = this.querySelector("#addMenuItemToOrder");
    //		content = this.querySelector("#content");
    //		button.style.display = (button.style.display === "block") ? "none" : "block";
    //		content.style.display = (content.style.display === "block") ? "none" : "block";
    //	});
    //}
    //var menuDiv = document.getElementById("menu");
    //
    //for ( type in oDB["types"] ) {
    //	var headerDiv = document.createElement("div");
    //	headerDiv.class = "collapsible";
    //	var contentDiv = document.createElement("div");
    //	contentDiv.class = "content";
    //	var testH1 = document.createElement("h1");
    //	testH1.textContent = oDB["types"][type];
    //	var test2H1 = document.createElement("h2");
    //	test2H1.textContent = "collapse me";
    //	var button = document.createElement("button");
    //	button.class = "btn btn btn-light";
    //	button.onclick = "addMenuItemToOrder(button)";
    //	button.type = "button";
    //	button.textContent = "הוספה";
    //
    //	headerDiv.appendChild(testH1);
    //	headerDiv.appendChild(button);
    //	contentDiv.appendChild(test2H1);
    //
    //	headerDiv.addEventListener("click", function() {
    //		this.classList.toggle("active");
    //		var content = this.nextElementSibling;
    //		if (content.style.display === "block") {
    //		content.style.display = "none";
    //		} else {
    //		content.style.display = "block";
    //		}
    //	});
    //	menuDiv.appendChild(headerDiv);
    //	menuDiv.appendChild(contentDiv);
    //}
}
async function initialize() {
    initializeDB();
    await loadJSONFromDB();
    fillPeopleRecentOrdersTable();
    createCollapsibleMenu();
    //fillTableFromDB("types");
    //fillTableFromDB("meals");
    //fillTableFromDB("additions");
    //fillTableFromDB("drinks");
    //fillTypesTable();
    //fillMealsTable();
    //fillAdditionsTable();
    //fillDrinksTable();
}

initialize();
