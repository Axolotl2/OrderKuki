// separate js file and json file by this url: https://stackoverflow.com/questions/19706046/how-to-read-an-external-local-json-file-in-javascript
debugger;

function order(event) {
  const sUrlNewLine = "%0A";
  const sKukiPhone = "+972525585252",
    sTestPhone = "+972526241919";
  const iName = 0,
    iMeal = 2,
    iAdditions = 3;
  // var sText = '���, ��� ���� ������ �����:';
  var sText = "מה קורה אבאלה אני רוצה להזמין:";
  debugger;
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

  var sUrl = `https://api.whatsapp.com/send?phone=${sTestPhone}&text=${sText}`;
  window.open(sUrl);
}

function getArrayDescriptionAsString(json, keys) {
  var resultString = "";

  keys.forEach(function (object, i) {
    if (resultString) resultString += ", ";
    resultString += json[i].description;
  });

  return resultString;
}
debugger;
function fillPeoplePreferencesTable() {
  var peoplePreferencesTable = document.getElementById("peoplePreferences");
  data.peoplePreferences.forEach(function (object) {
    var tr = document.createElement("tr");
    var typeDesc = data.types[object.type].description;
    var mealDesc = data.meals[object.meal].description;
    var additionsString = getArrayDescriptionAsString(
      data.additions,
      object.additions
    );
    var drinksString = getArrayDescriptionAsString(data.drinks, object.drinks);

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
    //<option value="volvo">Volvo XC90</option>
  });
}
function fillTypesTable() {
  var typesTable = document.getElementById("types");
  data.types.forEach(function (object, i) {
    var tr = document.createElement("tr");
    tr.innerHTML = "<td>" + data.types[i].description + "</td>";
    typesTable.appendChild(tr);
  });
}
function fillMealsTable() {
  var mealsTable = document.getElementById("meals");
  data.meals.forEach(function (object, i) {
    var tr = document.createElement("tr");
    tr.innerHTML = "<td>" + data.meals[i].description + "</td>";
    mealsTable.appendChild(tr);
  });
}
function fillAdditionsTable() {
  var additionsTable = document.getElementById("additions");
  data.additions.forEach(function (object, i) {
    var tr = document.createElement("tr");
    tr.innerHTML = "<td>" + data.additions[i].description + "</td>";
    additionsTable.appendChild(tr);
  });
}
function fillDrinksTable() {
  var drinksTable = document.getElementById("drinks");
  data.drinks.forEach(function (object, i) {
    var tr = document.createElement("tr");
    tr.innerHTML = "<td>" + data.drinks[i].description + "</td>";
    drinksTable.appendChild(tr);
  });
}
fillPeoplePreferencesTable();
fillTypesTable();
fillMealsTable();
fillAdditionsTable();
fillDrinksTable();
