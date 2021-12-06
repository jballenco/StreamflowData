"use strict";

let map;

let request = new XMLHttpRequest();
request.open("GET", "gageDatav1.json", false);
request.send(null);
let gages = JSON.parse(request.responseText);

let formatDate = function (t) {
  moment(t).format("M/D/YY HH:mm");
};

let returnParamName = (gageAbv) =>
  gageAbv.includes("RESCO") ? "storage (AF)" : "flow (cfs)";
$.ajaxSetup({ async: true });
for (let i = 1; i < gages.length; i++) {
  let connStr = `https://dwr.state.co.us/Rest/GET/api/v2/telemetrystations/telemetrytimeserieshour/?format=json&dateFormat=spaceSepToMinutes&fields=measDate%2CmeasValue&abbrev=${
    gages[i].abbrev
  }&includeThirdParty=true&parameter=${
    gages[i].abbrev.includes("RESCO") ? "STORAGE" : "DISCHRG"
  }&startDate=${moment().subtract(2, "days").format("MM/DD/YYYY")}`;
  $.getJSON(connStr, function (d) {
    gages[i]["data"] = d.ResultList.map(function (e) {
      return e.measValue;
    });
    gages[i]["labels"] = d.ResultList.map(function (e) {
      return e.measDate;
      console.log(moment(e.measDate, "YYYY-MM-DD HH:mm"));
    });
    gages[i]["content"] = `<a href="${gages[i].link}" target="_blank">${
      gages[i].name
    }</a><h4>${moment(gages[i].labels[gages[i].labels.length - 1]).format(
      "M/D/YY HH:mm"
    )} </h4><h5>${returnParamName(gages[i].abbrev)}: ${
      gages[i].data[gages[i].data.length - 1]
    }</h5>`;
  }).fail(function () {
    gages[i][
      "content"
    ] = `<a href="${gages[i].link}" target="_blank">${gages[i].name}</a><h4>This gage may be seasonal or does not have current data</h4>`;
  });
}

function initMap() {
  let options = {
    zoom: 8,
    gestureHandling: "greedy",
    center: { lat: 39.209275, lng: -105.268136 },
    // mapTypeId: "terrain",
  };
  map = new google.maps.Map(document.getElementById("map"), options);

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
  let request1 = new XMLHttpRequest();
  request1.open("GET", "waterFacts.json", false);
  request1.send(null);
  let wtrFacts = JSON.parse(request1.responseText);
  for (let i = 0; i < wtrFacts.length; i++) {
    let contentString =
      `<h2>${wtrFacts[i].name}</h2>` +
      `<h3>Capacity:&emsp;${wtrFacts[i].Capacity} acre-ft<br>` +
      `
      Water Right Date:&emsp;${moment(
        wtrFacts[i].WaterRightDate,
        "MM/D/YYYY"
      ).format("MMMM D, YYYY")}<br>` +
      `Admin. Number:&emsp;${wtrFacts[i].adminNumber}<br>` +
      `Spillway Elevation:&emsp;${wtrFacts[i].SpillwayElevation} ft.</h3>`;
    let marker1 = new google.maps.Marker({
      position: wtrFacts[i].coordinates,
      map: map,
    });
    marker1.setIcon("folderIcon.png");
    google.maps.event.addListener(marker1, "click", function () {
      let infowindow = new google.maps.InfoWindow();
      infowindow.setContent(contentString);
      infowindow.open(map, marker1);
    });
  }
  for (let i = 0; i < gages.length; i++) {
    let marker = new google.maps.Marker({
      position: gages[i].coordinates,
      map: map,
    });
    if (gages[i].abbrev.includes("RESCO")) {
      marker.setIcon("greenTriangle.png");
    } else if (gages[i].abbrev.includes("WTRFAC")) {
      marker.setIcon("folderIcon.png");
    } else {
      marker.setIcon("waterDrop.png");
    }
    if (typeof gages[i].data !== "undefined") {
      google.maps.event.addListener(marker, "click", function () {
        drawChart(
          this,
          gages[i].name,
          gages[i].data,
          gages[i].labels,
          gages[i].content,
          returnParamName(gages[i].abbrev)
        );
      });
    } else {
      google.maps.event.addListener(marker, "click", function () {
        let infowindow = new google.maps.InfoWindow();
        infowindow.setContent(gages[i].content);
        infowindow.open(map, marker);
      });
    }
  }
}

function drawChart(
  marker,
  tString,
  dataArr,
  labelsArr,
  contentString,
  paramName
) {
  let data = new google.visualization.DataTable();
  data.addColumn("datetime", "date and time");
  data.addColumn("number", paramName);
  for (let i = 0; i < dataArr.length; i++) {
    data.addRow([
      new Date(moment(labelsArr[i]).format("MMMM DD, YYYY HH:mm:ss Z")),
      dataArr[i],
    ]);
  }

  let options = {
    // title: tString,
    width: 300,
    height: 200,
    vAxis: {
      title: paramName,
      scaleType: "linear",
      textStyle: {
        fontSize: 8,
      },
    },
    chartArea: {
      width: "100%",
      height: "80%",
      top: "2%",
      left: "15%",
      right: "15%",
      bottom: "35%",
    },
    legend: {
      position: "none",
    },
    hAxis: {
      textPosition: "out",
      slantedText: true,
      slantedTextAngle: 70,
      showTextEvery: 4,
      format: "M/d/yy HH:mm",
    },
  };
  let infoWindowNode = document.createElement("div");
  let node = document.createElement("div");
  let textNode = document.createElement("div");
  textNode.innerHTML = contentString;
  infoWindowNode.appendChild(textNode);
  infoWindowNode.appendChild(node);
  let infoWindow = new google.maps.InfoWindow();
  let chart = new google.visualization.LineChart(node);
  infoWindow.setContent(infoWindowNode);
  infoWindow.open(marker.getMap(), marker);
  google.maps.event.addListener(infoWindow, "domready", function () {
    chart.draw(data, options);
  });
}
google.load("visualization", "current", { packages: ["corechart", "line"] });
// google.charts.setOnLoadCallback(drawChart);
