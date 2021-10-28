"use strict";

let map;

////
let request = new XMLHttpRequest();
request.open("GET", "gageDatav6.json", false);
request.send(null);
let gages = JSON.parse(request.responseText);

const connStr =
  "https://dwr.state.co.us/Rest/GET/api/v2/telemetrystations/telemetrystation/?format=csv&dateFormat=spaceSepToMinutes&fields=measDateTime%2CmeasValue&abbrev=";
const connGageLink = "https://dwr.state.co.us/tools/stations/";

let returnParamName = (gageAbv) =>
  gageAbv === "DILRESCO" || gageAbv === "CHARESCO" || gageAbv === "STRRESCO"
    ? "storage (AF)"
    : "flow (cfs)";

for (let i = 1; i < gages.length; i++) {
  let request = new XMLHttpRequest();
  // console.log(gages[i].abbrev);
  request.open("GET", connStr + gages[i].abbrev + "&includeThirdParty=true");
  request.onload = function () {
    let responseStr = request.response;
    let dataPoint = responseStr
      .substring(responseStr.indexOf("measValue") + 11)
      .split(",");
    gages[i]["flow"] = Number(dataPoint[1]).toFixed(2);
    gages[i]["date"] = dataPoint[0];
    gages[i]["link"] = gages[i].link;
    gages[i]["content"] = `<a href="${gages[i].link}" target="_blank">${
      gages[i].name
    }</a><h4>${gages[i].date} </h4><h5>${returnParamName(gages[i].abbrev)}: ${
      gages[i].flow
    }</h5>`;
    // console.log(gages[i]);
  };
  request.send();
}

function initMap() {
  let options = {
    zoom: 8,
    gestureHandling: "greedy",
    center: { lat: 39.209275, lng: -105.268136 },
    // mapTypeId: "terrain",
  };
  map = new google.maps.Map(document.getElementById("map"), options);

  // let buttonNameArr = [("SS", "RT", "CM", "GR", "DL"),(39.432175,39.45941346491131,39.209275,39.938324),(-105.12757,-105.65996006068643)];
  // buttonNameArr.forEach(function (r) {
  //   console.log(r);
  //   google.maps.event.addDomListener(
  //     document.getElementById("SS"),
  //     "click",
  //     function () {
  //       map.setCenter(new google.maps.LatLng(39.432175, -105.12757));
  //       map.setZoom(14);
  //     }
  //   );
  // });

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
    // -------
    console.log(gages[i]);
    if (gages[i].abbrev.includes("RESCO")) {
      marker.setIcon("greenTriangle.png");
    } else if (gages[i].abbrev.includes("WTRFAC")) {
      marker.setIcon("folderIcon.png");
    } else {
      marker.setIcon("waterDrop.png");
    }
    // gages[i].abbrev === "DILRESCO" ||
    // gages[i].abbrev === "CHARESCO" ||
    // gages[i].abbrev === "STRRESCO"
    //   ? marker.setIcon("greenTriangle.png")
    //   : marker.setIcon("waterDrop.png");

    google.maps.event.addListener(
      marker,
      "click",
      (function (marker, i) {
        return function () {
          var infowindow = new google.maps.InfoWindow();
          console.log(gages[i].content);
          infowindow.setContent(gages[i].content);
          infowindow.open(map, marker);
        };
      })(marker, i)
    );
  }
}
// window.onload = initMap;
