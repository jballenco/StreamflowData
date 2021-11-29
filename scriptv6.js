"use strict";

let map;

let request = new XMLHttpRequest();
request.open("GET", "gageDatav6.json", false);
request.send(null);
let gages = JSON.parse(request.responseText);

const connStr =
  "https://dwr.state.co.us/Rest/GET/api/v2/telemetrystations/telemetrystation/?format=json&dateFormat=spaceSepToMinutes&fields=measDateTime%2CmeasValue&abbrev=";
const connGageLink = "https://dwr.state.co.us/tools/stations/";

let returnParamName = (gageAbv) =>
  gageAbv.includes("RESCO") ? "storage (AF)" : "flow (cfs)";

$.ajaxSetup({ async: true });
for (let i = 1; i < gages.length; i++) {
  $.getJSON(
    connStr + gages[i].abbrev + "&includeThirdParty=true",
    function (d) {
      gages[i]["flow"] = d.ResultList[0].measValue;
      gages[i]["date"] = d.ResultList[0].measDateTime;
      gages[i]["content"] = `<a href="${gages[i].link}" target="_blank">${
        gages[i].name
      }</a><h4>${gages[i].date} </h4><h5>${returnParamName(gages[i].abbrev)}: ${
        gages[i].flow
      }</h5>`;
    }
  );
}

function initMap() {
  let options = {
    zoom: 8,
    gestureHandling: "greedy",
    center: { lat: 39.209275, lng: -105.268136 },
    // mapTypeId: "terrain",
  };
  map = new google.maps.Map(document.getElementById("map"), options);
  let buttonData = [
    [1, 2, 3],
    [4, 5, 6],
  ];
  console.log(buttonData[0][1]);
  google.maps.event.addDomListener(
    document.getElementById("SS"),
    "click",
    function () {
      map.setCenter(new google.maps.LatLng(39.432175, -105.12757));
      map.setZoom(14);
    }
  );
  google.maps.event.addDomListener(
    document.getElementById("RT"),
    "click",
    function () {
      map.setCenter(
        new google.maps.LatLng(39.45941346491131, -105.65996006068643)
      );
      map.setZoom(14);
    }
  );
  google.maps.event.addDomListener(
    document.getElementById("CM"),
    "click",
    function () {
      map.setCenter(new google.maps.LatLng(39.209275, -105.268136));
      map.setZoom(14);
    }
  );
  google.maps.event.addDomListener(
    document.getElementById("GR"),
    "click",
    function () {
      map.setCenter(new google.maps.LatLng(39.938324, -105.348963));
      map.setZoom(14);
    }
  );
  google.maps.event.addDomListener(
    document.getElementById("DL"),
    "click",
    function () {
      map.setCenter(new google.maps.LatLng(39.611545, -106.053719));
      map.setZoom(11);
    }
  );
  for (let i = 0; i < gages.length; i++) {
    var marker = new google.maps.Marker({
      position: gages[i].coordinates,
      map: map,
      draggarble: false,
    });
    if (gages[i].abbrev.includes("RESCO")) {
      marker.setIcon("greenTriangle.png");
    } else if (gages[i].abbrev.includes("WTRFAC")) {
      marker.setIcon("folderIcon.png");
    } else {
      marker.setIcon("waterDrop.png");
    }

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
}
