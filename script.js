"use strict";

let map;

////
let request = new XMLHttpRequest();
request.open("GET", "gageData.json", false);
request.send(null);
let gages = JSON.parse(request.responseText);

const connStr =
  "https://dwr.state.co.us/Rest/GET/api/v2/telemetrystations/telemetrystation/?format=csv&dateFormat=spaceSepToMinutes&fields=measDateTime%2CmeasValue&abbrev=";
const connGageLink = "https://dwr.state.co.us/tools/stations/";

for (let i = 0; i < gages.length; i++) {
  let request = new XMLHttpRequest();
  request.open("GET", connStr + gages[i].abbrev);
  request.onload = function () {
    let responseStr = request.response;
    let dataPoint = responseStr
      .substring(responseStr.indexOf("measValue") + 11)
      .split(",");
    gages[i]["flow"] = Number(dataPoint[1]).toFixed(2);
    gages[i]["date"] = dataPoint[0];
    gages[i]["link"] = gages[i].link;
    gages[i][
      "content"
    ] = `<a href="${gages[i].link}" target="_blank">${gages[i].name}</a><h4>${gages[i].date} </h4><h5>flow: ${gages[i].flow}</h5>`;
    console.log(gages[i]);
  };
  request.send();
}

function initMap() {
  let options = {
    zoom: 9,
    center: { lat: 39.209275, lng: -105.268136 },
    // mapTypeId: "terrain",
  };
  map = new google.maps.Map(document.getElementById("map"), options);

  for (let i = 0; i < gages.length; i++) {
    var marker = new google.maps.Marker({
      position: gages[i].coordinates,
      map: map,
      draggarble: false,
      // content: prop.content,
    });
    marker.setIcon("https://img.icons8.com/color/24/000000/water.png");
    // if (prop.content) {
    google.maps.event.addListener(
      marker,
      "click",
      (function (marker, i) {
        return function () {
          var infowindow = new google.maps.InfoWindow();
          infowindow.setContent(gages[i].content);
          infowindow.open(map, marker);
        };
      })(marker, i)
    );
  }
  // window.onload = initMap;
}
window.onload = initMap;
