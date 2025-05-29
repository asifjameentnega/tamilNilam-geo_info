var geoServerURL = 'https://tngis.tnega.org/geoserver/wms';
var wmts_url = 'https://tngis.tnega.org/geoserver/gwc/service/wmts';
var isMeasureActive = false; // flag to check if measurement function is active
var storedUserId = localStorage.getItem('user_id');
var valid_user = localStorage.getItem('valid_user');
var user_name = localStorage.getItem('username');


let dropdownContainer;
let dropdownContainerfmb;
if (!storedUserId) {
  // Redirect to index.html if user_id is not present
  window.location.href = 'index.html';
}
if (valid_user === "false") {
  window.location.href = "index.html";
}
if (user_name.trim() === "") {
  window.location.href = "sign-up.html";
}

// function checkScreenSize() {
//   //console("Screen width:", window.innerWidth);
//   if (window.innerWidth > 768) {
//     const messageElement = document.createElement('access-denied');
//     document.body.innerHTML = ''; // Clear the body content
//     document.body.appendChild(messageElement); // Append the web component
//   }
// }

function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function checkScreenSize() {
  console.log("Screen width:", window.innerWidth, "Orientation:", screen.orientation?.type);

  const existingMessage = document.querySelector('access-denied');
  const isWideScreen = window.innerWidth > 768;
  const isMobile = isMobileDevice(); // Check if it's a mobile device

  if (isWideScreen && !isMobile) {
    // Show access-denied only for large screens (not mobile)
    if (!existingMessage) {
      const messageElement = document.createElement('access-denied');
      document.body.innerHTML = ''; // Clear body content
      document.body.appendChild(messageElement);
    }
  } else {
    // Remove access-denied for mobile screens and landscape mode
    if (existingMessage) {
      existingMessage.remove();
      location.reload(); // Reload to restore original content
    }
  }
}

// Geolocation and map zoom function
function zoomLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const currentLocation = ol.proj.fromLonLat([longitude.toFixed(6), latitude.toFixed(6)]);

  // Assumes `view` is defined elsewhere in your map setup code
  view.animate({
    center: currentLocation,
    duration: 100,
    zoom: 17,
  });
}

// Date display function
function displayDate() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const output = `${day}/${month}/${d.getFullYear()}`;
  document.getElementById("showdate").innerHTML = output;
}

// Time update function for clock
function updateClock() {
  const clockElement = document.getElementById("showTime");
  if (!clockElement) return;  // Exit if the element doesn't exist

  const currentTime = new Date();
  let hours = currentTime.getHours();
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');
  const timeOfDay = hours < 12 ? "AM" : "PM";

  hours = hours % 12 || 12;  // Convert hours to 12-hour format

  const currentTimeString = `${hours}:${minutes}:${seconds} ${timeOfDay}`;
  clockElement.innerHTML = currentTimeString;
}

// Initialize functions on page load
// window.onload = () => {
// checkScreenSize();
// displayDate();
// // zoomLocation();  // Call zoomLocation as the first function
// // getLocation();
// if (document.getElementById("showTime")) {
//   setInterval(updateClock, 500);
// }
// };

// Run on load and resize/orientation change
window.onload = checkScreenSize;
window.onresize = checkScreenSize;
window.addEventListener("orientationchange", checkScreenSize);

$('#show_date').html('On ' + new Date().toUTCString().split(',')[1].slice(0, 12));
$('#current_date').val(new Date().toISOString().split('T')[0]);
var date1 = new Date().toISOString().split('T')[0];
data2 = date1.replace("-", "");
date = data2.replace("-", "");
//getPoints(user_details.user_id,date,date);
$("#getLocation").click(function () {
  getLocation();
  var geolocation = JSON.parse(window.localStorage.getItem('geolocation'));
  var latitude = geolocation.latitude;
  var longitude = geolocation.longitude;
  const currentLocation = ol.proj.fromLonLat([longitude.toFixed(6), latitude.toFixed(6)]);
  view.animate({
    center: currentLocation,
    duration: 1000,
    zoom: 17,
  });
});

const gpsOptions = {
  enableHighAccuracy: true,
  //timeout: 15000,
  maximumAge: 0
};
function getLocation() {
  if ("geolocation" in navigator) { //check geolocation available 
    // alert("Geolocation is supported in your device");
    locationCapture();
  } else {
    ////console("Browser doesn't support geolocation!");
    alert("Geolocation is not supported in your device");
  }
}
// Location Capture Function
function locationCapture() {
  const watchID = navigator.geolocation.watchPosition(gpsSuccess, gpsError, gpsOptions);
}
// Geolocation: Error
function gpsError(err) {
  console.error(`Error: ${err.code}, ${err.message}`);
}
// Geolocation: Success
function gpsSuccess(pos) {
  // Get the lat, long, accuracy from Geolocation return (pos.coords)
  const {
    latitude,
    longitude,
    accuracy,
    altitude
  } = pos.coords;
  // //console(latitude + '--' + longitude);
  const localStorageGeoLocation = {
    latitude: latitude,
    longitude: longitude,
    accuracy: accuracy,
    altitude: altitude
  };
  window.localStorage.setItem('geolocation', JSON.stringify(localStorageGeoLocation));
  $("#user_lat").empty();
  $("#user_long").empty();
  $('#accuracy').empty();
  $("#user_lat").append(latitude.toFixed(6));
  $("#user_long").append(longitude.toFixed(6));
  var coordinates = [longitude.toFixed(6), latitude.toFixed(6)];
  // coordinates = ol.proj.transform(coordinates, 'EPSG:4326', 'EPSG:3857');
  positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates).transform('EPSG:4326', 'EPSG:3857') : null);
  //circle_current_location(longitude,latitude);
  $('#accuracy').text(accuracy.toFixed(2))
}
function searchlocation() {

  clearTimeout(searchTimeout);
  $('#search_location').addClass('pevent-none');
  var search_query = $('#search_query_text').val();
  if (search_query.length >= 3) {
    var data = {
      "format": "json",
      "countrycodes": "IN",
      "addressdetails": 1,
      "q": search_query,
      //"limit": 5
    };
    $.ajax({
      method: "GET",
      //url: "https://nominatim.openstreetmap.org",
      url: "https://tngis.tnega.org/nominatim/search.php",
      data: data
    })
      .done(function (msg) {
        ////console( msg );
        if (msg.length > 0) {
          var result_elements = '';
          $('#result_search').empty();
          for (var i = 0; i < msg.length; i++) {
            //var bbox = msg[i].lat.toString();
            result_elements += '<li onclick="zoomtosearch(' + msg[i].lat + ',' + msg[i].lon + ')">' + msg[i].display_name + '</li>';
          }
          $('#result_search').append(result_elements);
          $('#result_search').removeClass('d-none');

        }
        else {
          $('#result_search').empty();
          $('#result_search').append('<li class="search_noresult">No Result Found</li>');
          $('#result_search').removeClass('d-none');

        }
      });
    $('.loaderGif').addClass('d-none');
    $('#search_location').removeClass('pevent-none');
  }
}
//search zoom to location
function zoomtosearch(lat, lon) {
  var lat = parseFloat(lat);
  var long = parseFloat(lon);
  // Zoom to lat lon
  const currentLocation_point_search = ol.proj.fromLonLat([long.toFixed(6), lat.toFixed(6)]);
  view.animate({
    center: currentLocation_point_search,
    duration: 1000,
    zoom: 17,
  });
  $('#result_search').addClass('d-none');
  const offcanvas = document.getElementById('offcanvasTop');

  if (offcanvas.classList.contains('show') || offcanvas.style.visibility === 'visible') {
    offcanvas.classList.remove('show');
    offcanvas.style.visibility = 'hidden';
  } else {
    offcanvas.classList.add('show');
    offcanvas.style.visibility = 'visible';
  }
  //$('#search_location').addClass('d-none');
}

$(document).on({
  ajaxStart: function () {
    // $("body").addClass("user_loading");
    showSpinner();
  },
  ajaxStop: function () {
    // $("body").removeClass("user_loading");
    hideSpinner();
  },
  //  ajaxError: function () {
  //   hideSpinner(); // Hide spinner in case of an error or network failure
  // }
});

// Function to show spinner
function showSpinner(message) {
  // Show spinner
  $("#spinner-container").show();
  $("#spinner-text").text(message);
}

// Function to hide spinner
function hideSpinner() {
  // Hide spinner
  $("#spinner-container").hide();
  $("#spinner-text").text("Fetching data... Please wait");

}


//var geoServerURL = 'http://localhost:8080/geoserver/wms';
const projection = ol.proj.get('EPSG:4326');
const projectionExtent = projection.getExtent();
const tileSizePixels = 256;
const tileSizeMtrs = ol.extent.getWidth(projectionExtent) / tileSizePixels;
const matrixIds = new Array(22);
var resolutions = new Array(22);
for (var z = 0; z < 22; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = tileSizeMtrs / Math.pow(2, z + 1);
  matrixIds[z] = "EPSG:4326:" + z;
}
var wmtstilegrid = new ol.tilegrid.WMTS({
  origin: ol.extent.getTopLeft(projectionExtent),
  resolutions: resolutions,
  matrixIds: matrixIds
});
/*resolutions = [
      0.703125, 0.3515625, 0.17578125, 0.087890625,
      0.0439453125, 0.02197265625, 0.010986328125,
      0.0054931640625, 0.00274658203125, 0.001373291015625,
      6.866455078125E-4, 3.4332275390625E-4, 1.71661376953125E-4,
      8.58306884765625E-5, 4.291534423828125E-5, 2.1457672119140625E-5,
        1.0728836059570312E-5, 5.364418029785156E-6, 2.682209014892578E-6,
      1.341104507446289E-6, 6.705522537231445E-7, 3.3527612686157227E-7
];*/

var result_data;
// View
var view = new ol.View({
  zoom: 7,
  center: [8781480.570496075, 1174732.6162325153],
  enableRotation: false,
  // maxZoom:20,
  // minZoom:7
});

/* MAP */
/*******/
var map = new ol.Map({
  target: 'map',
  view,
});
// No Map
var noTile = new ol.layer.Tile({
  title: 'None',
  baseLayer: true,
  visible: false,
  displayInLayerSwitcher: false,
  name: "Basemap",
});
// OSM
var osmTile = new ol.layer.Tile({
  title: "OSM",
  //baseLayer: true,
  source: new ol.source.OSM(),
  visible: false,
  name: "Basemap",
});
map.addLayer(osmTile);
map.addLayer(noTile);
// Google Satellite Map
var satelliteTile = new ol.layer.Tile({
  title: 'Google Satellite',
  visible: true,
  //baseLayer: true,
  name: "Basemap",
  opacity: 0.8,
  source: new ol.source.XYZ({
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
  })
});
map.addLayer(satelliteTile);
// getLocation();
// zoomLocation();

// District
// var district_source = new ol.source.TileWMS({
//   // TODO: Change URL
//   url: geoServerURL,
//   params: {
//     'LAYERS': 'generic_viewer' + ':' + 'land_details_districts',
//   },
//   serverType: 'geoserver'
// });
// const district = new ol.layer.Tile({
//   title: 'District',
//   type: 'wms',
//   source: district_source,
//   name: "District",
//   visible: true,
//   displayInLayerSwitcher: false,
//   minResolution: 200,
//   maxResolution: 3000,
// });

// setTimeout(function () {
//   // map.addLayer(district);
//   //console("district layer");
// }, 5000);
// // Taluk
// var taluk_source = new ol.source.TileWMS({
//   url: geoServerURL,
//   params: {
//     'LAYERS': 'generic_viewer' + ':' + 'taluks',
//     //'STYLES': 'taluk_name',
//   },
//   serverType: 'geoserver'
// });
// const taluk = new ol.layer.Tile({
//   title: 'Taluk',
//   type: 'wms',
//   source: taluk_source,
//   name: "Taluk",
//   visible: true,
//   displayInLayerSwitcher: false,
//   minResolution: 30,
//   maxResolution: 200,
// });
// // Revenue Village
// var village_master_source = new ol.source.TileWMS({
//   url: geoServerURL,
//   params: {
//     'LAYERS': 'generic_viewer' + ':' + 'revenue_villages',
//     //'STYLES': 'rvill_name',
//   },
//   serverType: 'geoserver'
// });
// var village_master = new ol.layer.Tile({
//   title: 'Village Master',
//   type: 'wms',
//   source: village_master_source,
//   name: "Village",
//   visible: true,
//   displayInLayerSwitcher: false,
//   minResolution: 1,
//   maxResolution: 30,
// });

//fmb survey master wmts
// var fmb_survey_wmts_source = new ol.source.WMTS({
//   url: wmts_url,
//   layer: 'land_detalis:land_details_cadastral',
//   matrixSet: 'EPSG:4326',
//   format: 'image/png',
//   projection: projection,
//   tileGrid: new ol.tilegrid.WMTS({
//     origin: ol.extent.getTopLeft(projectionExtent),
//     resolutions: resolutions,
//     matrixIds: matrixIds,
//     extent: [76.35889434814453, 8.079532623291016, 80.34642028808594, 13.568115234375]
//   })
// });
// var fmb_survey_wmts = new ol.layer.Tile({
//   title: 'Cadasatral Boundry',
//   source: fmb_survey_wmts_source,
//   name: "fmb_survey_wmts",
//   visible: true,
//   displayInLayerSwitcher: false,
// });
// map.addLayer(fmb_survey_wmts);

//fmb subdivision master wmts
// var fmb_subdivision_wmts_source = new ol.source.WMTS({
//   url: wmts_url,
//   layer: 'land_detalis:land_details_fmb',
//   matrixSet: 'EPSG:4326',
//   format: 'image/png',
//   projection: projection,
//   tileGrid: new ol.tilegrid.WMTS({
//     origin: ol.extent.getTopLeft(projectionExtent),
//     resolutions: resolutions,
//     matrixIds: matrixIds,
//     extent: [76.35889434814453, 8.079546928405762, 80.34642028808594, 13.568115234375]
//   })
// });
// var fmb_subdivision_wmts = new ol.layer.Tile({
//   title: 'Subdivision Boundry',
//   source: fmb_subdivision_wmts_source,
//   name: "fmb_subdivision_wmts",
//   visible: true,
//   displayInLayerSwitcher: false,
// });
// map.addLayer(fmb_subdivision_wmts);

// map.addLayer(village_master);
// map.addLayer(taluk);

var cadastral_xyz = new ol.layer.Tile({
  title: "Cadastral XYZ",
  visible: true,
  name: "Cadastral XYZ",
  source: new ol.source.XYZ({
    url: `https://tngis.tn.gov.in/data/xyz_tiles/cadastral_xyz/{z}/{x}/{y}.png`,
    attributions: "© TNGIS",
  }),
  displayInLayerSwitcher: true,
});
// checkScreenSize();
displayDate();
zoomLocation();  // Call zoomLocation as the first function
getLocation();
if (document.getElementById("showTime")) {
  setInterval(updateClock, 500);
}
map.addLayer(cadastral_xyz);

// var roadnetwork = new ol.layer.Group(
//   {
//     title: 'Cadastral',
//     fold: 'close',
//     openInLayerSwitcher: false,
//     displayInLayerSwitcher: false,
//     layers: [fmb_subdivision_wmts, fmb_survey_wmts, village_master, taluk, district]

//   });

// setTimeout(function () {
//   // map.addLayer(roadnetwork);
//   //console("district layer");
// }, 5000);

var tog_flag = 0;
//UI for toggle on and off different layers
var layerSwitcher = new ol.control.LayerSwitcher({
  activationMode: 'click',
  startActive: false,
  groupSelectStyle: 'children'
});
map.addControl(layerSwitcher);
$('#switch_layer').on('click', function () {
  if (tog_flag == 0) {
    satelliteTile.setVisible(false);
    osmTile.setVisible(true);
    tog_flag = 1;
  } else {
    satelliteTile.setVisible(true);
    osmTile.setVisible(false);
    tog_flag = 0;
  }
});

// Marker
const applicants = new ol.Feature({
  geometry: new ol.geom.Point([[]])
});
const applicantsSource = new ol.source.Vector({
  features: [applicants]
});

const applicantsLayer = new ol.layer.Vector({
  source: applicantsSource,
  displayInLayerSwitcher: false,
  style: new ol.style.Style({
    image: new ol.style.Icon({
      src: "assets/img/icon.png",
      anchor: [20, 2],
      anchorXUnits: "pixels",
      anchorYUnits: "pixels",
      anchorOrigin: "bottom-left"
    })
  })

});

// map.addLayer(applicantsLayer);
// Current Location
const currenLocationtLayer = new ol.layer.Vector({ // VectorLayer({
  source: new ol.source.Vector(),
  displayInLayerSwitcher: false,
});
map.addLayer(currenLocationtLayer);
const currentLocationSource = currenLocationtLayer.getSource();
const positionFeature = new ol.Feature();
positionFeature.setStyle(
  new ol.style.Style({
    image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({
        color: '#3399CC',
      }),
      stroke: new ol.style.Stroke({
        color: '#fff',
        width: 2,
      }),
    }),
  })
);
currentLocationSource.addFeature(positionFeature);
// Lat/Lon on mouse hover
map.on('pointermove', function (e) {
  var lonlat = ol.proj.toLonLat(e.coordinate);
  $("#user_long").html(lonlat[0].toFixed(6));
  $("#user_lat").html(lonlat[1].toFixed(6));
});

// Zoom in/zoom Out
document.getElementById('zoomIn').onclick = function () {
  var view = map.getView();
  var zoom = view.getZoom();
  view.setZoom(zoom + 1);
};

document.getElementById('zoomOut').onclick = function () {
  var view = map.getView();
  var zoom = view.getZoom();
  view.setZoom(zoom - 1);
};

// Error Message
function error_message(message) {
  Swal.fire({
    icon: "error",
    title: message,
    showConfirmButton: false,
    timer: 2000
  })
}

// Success Message
function success_message(message) {
  Swal.fire({
    icon: "success",
    title: message,
    showConfirmButton: false,
    timer: 2000
  })
}
function circle_current_location(longitude, latitude)//circle over current location
{
  var centerLongitudeLatitude = ol.proj.fromLonLat([longitude, latitude]);
  if (radius_layer != undefined) {
    map.removeLayer(radius_layer);
  }
  radius_layer = new ol.layer.Vector({
    displayInLayerSwitcher: false,
    source: new ol.source.Vector({
      projection: 'EPSG:4326',
      features: [new ol.Feature(new ol.geom.Circle(centerLongitudeLatitude, 50))]
    }),
    style: [
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'green',
          width: 3
        }),
        fill: new ol.style.Fill({
          color: 'rgba(147,196,125,0.2)'
        })
      })
    ]
  });
  map.addLayer(radius_layer);
  ////console(radius_layer.getSource().getExtent())
}

function draw_point_geo(coordinates) {
  coordinates.forEach(function (coord) {
    var longitude = coord[0];
    var latitude = coord[1];
    // Create an OpenLayers feature from the coordinate
    var feature = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([longitude, latitude]))
    });
    // Add the feature to the vector source
    applicantsSource.addFeature(feature);
  });
  map.getView().fit(applicantsLayer.getSource().getExtent(), { duration: 3000, maxZoom: 22, padding: [170, 50, 90, 150] });
}
window.onload = function () {
  var buttons = document.querySelectorAll('#eservice_div .icon-box');
  buttons.forEach(function (button) {
    button.setAttribute('disabled', 'disabled');
  });
};
var responseData;
var adminresponseData;
var currentVectorLayer = null; // To keep track of the current vector layer

function survey_no_display() {
  if (responseData.data.sub_division != null) {
    $('#survey_subdivision').text('(' + responseData.data.survey_number + ' / ' + responseData.data.sub_division + ')');

    $('#survey_subdivision3').text('(' + responseData.data.survey_number + ' / ' + responseData.data.sub_division + ')');

    $('#survey_subdivision1').text('(' + responseData.data.survey_number + ' / ' + responseData.data.sub_division + ')');
  } else {
    $('#survey_subdivision').text('(' + responseData.data.survey_number + ' / -)');
    $('#survey_subdivision1').text('(' + responseData.data.survey_number + ' / -)');
    $('#survey_subdivision3').text('(' + responseData.data.survey_number + ' / -)');
  }

}
var mapClickSource = new ol.source.Vector();
var mapClickLayer = new ol.layer.Vector({
  source: mapClickSource,
  displayInLayerSwitcher: false,
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'cyan',
      width: 5
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 255, 0.1)'
    })
  })
});

map.addLayer(mapClickLayer);
mapClickLayer.setVisible(false);

function mapclick(evt, latitude = null, longitude = null) {
  $('#patta_btn_close').click();
  // var lonlat = tranformProj(evt);
  // marker.getGeometry().setCoordinates(evt.coordinate);
  // center(evt);
  // //console(lonlat[1].toFixed(6) + ' , ' + lonlat[0].toFixed(6))
  // latitude = lonlat[1].toFixed(6);
  // longitude = lonlat[0].toFixed(6);
  if (!marker.getGeometry()) {
    marker.setGeometry(new ol.geom.Point([0, 0])); // Initialize with placeholder coordinates
    // markerSource.addFeature(marker); // Add the marker to the source initially
  }

  var lonlat, projectedCoords;
  if (!latitude || !longitude) {
    lonlat = tranformProj(evt); // Transform event coordinates
    latitude = lonlat[1].toFixed(6);
    longitude = lonlat[0].toFixed(6);
    projectedCoords = ol.proj.fromLonLat([longitude, latitude], 'EPSG:3857');
  } else {
    // Transform provided latitude and longitude to the map's projection
    projectedCoords = ol.proj.fromLonLat([longitude, latitude], 'EPSG:3857');
  }

  // Clear previous marker and set new coordinates
  markerSource.clear(); // Remove previous markers
  marker.setGeometry(new ol.geom.Point(projectedCoords)); // Update marker position
  markerSource.addFeature(marker); // Add the marker back to the source

  // Center map on new marker position
  center({ coordinate: projectedCoords });
  //console(latitude + ' , ' + longitude);

  var form = new FormData();
  form.append("latitude", latitude);
  form.append("longitude", longitude);
  form.append("app_name", "mug@vari");
  var settings = {
    // "url": config.admin_hierarchy_url,
    url: config.tamil_nilam_url + '/v1/admin_hierarchy',
    "method": "POST",
    "timeout": 0,
    "headers": {

      'X-APP-USER-ID': storedUserId,
    },
    "dataType": "json",
    "processData": false,
    "mimeType": "multipart/form-data",
    "contentType": false,
    "data": form
  };
  $.ajax(settings).done(function (response) {
    adminresponseData = response; // Store the response data
    // adminresponseData.data.type = 'Rural';
    if (adminresponseData.success === 0) {
      Swal.fire({
        icon: 'error',
        title: '',
        text: 'Please click inside Tamilnadu boundary to get the data',
        showConfirmButton: true
      });

      return;
    }


    if (adminresponseData.data.type === 'Rural') {


      document.getElementById("others-modal-id").style.display = "block"; // Ensure it's visible for other types
      document.getElementById("urban_tooltip").style.display = "none"; // Ensure it's visible for other types
      //console("rural visible");
    } else {
      document.getElementById("others-modal-id").style.display = "none"; // Ensure it's visible for other types
      document.getElementById("urban_tooltip").style.display = "block"; // Ensure it's visible for other types

      //console("urban hide");
    }
    // //console("adminresponseData", adminresponseData);
    let taluk_name = adminresponseData.data.taluk_name;
    let corporation_name = adminresponseData.data.corporation_name;
    let town_panchayat_name = adminresponseData.data.town_panchayat_name
    let municipality_name = adminresponseData.data.municipality_name
    //   $('.district').empty().append(`<option value="${response.data.district_code}">${response.data.district_name}</option>`);
    // $('.taluk').empty().append(`<option value="${response.data.taluk_code}">${response.data.taluk_name}</option>`);
    // $('.village').empty().append(`<option value="${response.data.revenue_village_code}">${response.data.revenue_village_name}</option>`);
    let location_name = taluk_name || corporation_name || municipality_name || town_panchayat_name;
    $('body').addClass('showHalfMap');
    var myOffcanvas = document.getElementById('land_info_canvas');
    var user_info_canvas = new bootstrap.Offcanvas(myOffcanvas);
    user_info_canvas.hide();
    localStorage.setItem('district_name', response.data.district_name);

    function setText(type, name, value) {
      $(`#${type}`).text(`(District | ${name})`);
      $(`#${value}`).text(`${response.data.district_name} | ${response.data[name]}`);
      localStorage.setItem('taluk_name', response.data[name]);
    }

    if (response.data.town_panchayat_name) {
      setText('type', 'town_panchayat_name', 'value', 'Town Panchayat');
      setText('type1', 'town_panchayat_name', 'value1', 'Town Panchayat');
      setText('type2', 'town_panchayat_name', 'value2', 'Town Panchayat');
      setText('type3', 'town_panchayat_name', 'value3', 'Town Panchayat');
    }
    if (response.data.corporation_name) {

      $('#type').text('(corporation | zone | ward)');
      $('#value').text(`${response.data.corporation_name} | ${response.data.zone_name} | ${response.data.ward_number}`);
      $('#type1').text('(corporation | zone | ward)');
      $('#value1').text(`${response.data.corporation_name} | ${response.data.zone_name} | ${response.data.ward_number}`);
      $('#type2').text('(corporation | zone | ward)');
      $('#value2').text(`${response.data.corporation_name} | ${response.data.zone_name} | ${response.data.ward_number}`);
      $('#type3').text('(corporation | zone | ward)');
      $('#value3').text(`${response.data.corporation_name} | ${response.data.zone_name} | ${response.data.ward_number}`);
    }


    if (response.data.municipality_name) {
      setText('type', 'municipality_name', 'value', 'Municipality');
      setText('type1', 'municipality_name', 'value1', 'Municipality');
      setText('type2', 'municipality_name', 'value2', 'Municipality');
      setText('type3', 'municipality_name', 'value3', 'Municipality');
    }

    if (response.data.type === "Forest") {

      Swal.fire({
        icon: 'error',
        title: '',
        text: 'This land is not in Tamil Nilam (Rural) database. You may contact the ' + location_name + ' taluk office for details.',
        showConfirmButton: true
      });
    }

    if (response.data.taluk_name) {
      $('#type').text('(District | Taluk');
      $('#value').text(`${response.data.district_name} | ${response.data.taluk_name}`);
      $('#type1').text('(District | Taluk');
      $('#value1').text(`${response.data.district_name} | ${response.data.taluk_name}`);
      $('#type2').text('(District | Taluk');
      $('#value2').text(`${response.data.district_name} | ${response.data.taluk_name}`);
      $('#type3').text('(District | Taluk');
      $('#value3').text(`${response.data.district_name} | ${response.data.taluk_name}`);
      localStorage.setItem('taluk_name', response.data.taluk_name);

      if (response.data.revenue_village_name) {
        $('#type').append(' | Village)');
        $('#value').append(` | ${response.data.revenue_village_name}`);
        $('#type1').append(' | Village)');
        $('#value1').append(` | ${response.data.revenue_village_name}`);
        $('#type2').append(' | Village)');
        $('#value2').append(` | ${response.data.revenue_village_name}`);
        $('#type3').append(' | Village)');
        $('#value3').append(` | ${response.data.revenue_village_name}`);
        localStorage.setItem('village_name', response.data.revenue_village_name);
      } else {
        $('#type').append(')');
        $('#type1').append(')');
        $('#type2').append(')');
        $('#type3').append(')');
      }
    }

    // After the admin hierarchy call, make the call to get land details by coordinates
    $.ajax({
      // url: config.api_url,
      url: config.aregcheck + '/v2/land_details',
      method: 'POST',
      headers: {
        'X-APP-NAME': 'demo'
      },
      data: {
        'latitude': latitude,
        'longitude': longitude
      },
      dataType: 'json',
      success: function (response) {
        responseData = response; // Store the response data

        if (response.success != 2) {
          //console("get details by coordinates", response.data);
          $('#location_details').show();
          $('#location_details1').show();
          $('#location_details2').show();
          $('.service_div').removeClass('d-none');
          $('.service_error_div').addClass('d-none');

          $('#latitude').val(latitude);
          $('#longitude').val(longitude);
          $('.tnservices').removeClass('d-none');
          $('#a_register').removeAttr('disabled');
          $('#fmb_service').removeAttr('disabled');
          $('#patta_service').removeAttr('disabled');
          $('#patta_search_service').removeAttr('disabled');
          var buttons = document.querySelectorAll('#eservice_div .icon-box');
          buttons.forEach(function (button) {
            button.disabled = false;
            document.getElementById("patta_chitta").disabled = false;
          });

          // $('#dropdownclose').trigger('click');

          var geojson_geom = JSON.parse(response.data.geojson_geom);
          var features = new ol.format.GeoJSON().readFeatures(geojson_geom, {
            featureProjection: 'EPSG:3857'
          });
          mapClickSource.clear(); // Clear previous features
          mapClickSource.addFeatures(features); // Add new features
          // Update visibility
          mapClickLayer.setVisible(true);
          dropdownLayer.setVisible(false);
          var extent = mapClickLayer.getSource().getExtent();
          map.getView().fit(extent, { duration: 1000 });
          $('#sur_suv_dt').removeClass('d-none');
          $('#sur_suv_dt1').removeClass('d-none');



          survey_no_display();
          if (zoom_extent = getExtentfromgeom(geojson_geom)) {
            // var zoom_extent = response.extent;
            // zoom_extent = Array.from(zoom_extent.split(','), Number);
            // zoom_extent = ol.proj.transformExtent(zoom_extent, ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
            // map.getView().fit(zoom_extent, map.getSize());


            // var zoom_extent = response.extent;
            // zoom_extent = Array.from(zoom_extent.split(','), Number);
            // zoom_extent = ol.proj.transformExtent(zoom_extent, ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));

            // Expand the extent to zoom out slightly
            var expandedExtent = [
              zoom_extent[0] - (zoom_extent[2] - zoom_extent[0]) * 0.3,
              zoom_extent[1] - (zoom_extent[3] - zoom_extent[1]) * 0.3,
              zoom_extent[2] + (zoom_extent[2] - zoom_extent[0]) * 0.3,
              zoom_extent[3] + (zoom_extent[3] - zoom_extent[1]) * 0.3
            ];

            map.getView().fit(expandedExtent, map.getSize());
          }
        } else {
          $('#eservice_div').removeClass('d-none');
          $('body').removeClass('showHalfMap');
          $('#location_details').hide();
          $('#location_details1').hide();
          $('#location_details2').hide();
          $('#survey_subdivision').text('');
          $('#survey_subdivision1').text('');
          $('#survey_subdivision3').text('');
          $('#a_register').attr('disabled', true);
          $('#fmb_service').attr('disabled', true);
          $('#patta_service').attr('disabled', true);
          $('#patta_search_service').attr('disabled', true);

          const currentLocation = ol.proj.fromLonLat([longitude, latitude]);
          view.animate({
            center: currentLocation,
            duration: 1000,
            zoom: 15,
          });
          Swal.fire({
            icon: 'error',
            title: '',
            text: 'Survey Number and Subdivision Details Not available in map.  Please contact the Revenue Surveyor in ' + location_name + ' taluk office .',
            showConfirmButton: true
          });

          $('#sur_suv_dt').addClass('d-none');
          $('#sur_suv_dt1').addClass('d-none');
          $('.service_div').removeClass('d-none');
          $('.service_error_div').removeClass('d-none');
        }
      },
      error: function (data, textStatus, http) {
        hideSpinner(); // Hide spinner on error
        $('#location_details').hide();
        $('#location_details1').hide();
        $('#location_details2').hide();
        $('body').removeClass('showHalfMap');
        $('#eservice_div').removeClass('d-none');
        $('#a_register').attr('disabled', true);
        $('#fmb_service').attr('disabled', true);
        $('#patta_service').attr('disabled', true);
        $('#patta_search_service').attr('disabled', true);

        $('#survey_subdivision').text('');
        const currentLocation = ol.proj.fromLonLat([longitude, latitude]);
        view.animate({
          center: currentLocation,
          duration: 1000,
          zoom: 15,
        });
        Swal.fire({
          icon: 'error',
          title: '',
          text: 'Survey Number and Subdivision Details Not available in map.  Please contact the Revenue Surveyor in ' + location_name + ' taluk office .',
          showConfirmButton: true
        });
        $('#sur_suv_dt').addClass('d-none');
        $('#sur_suv_dt1').addClass('d-none');
        $('.service_div').addClass('d-none');
        $('.service_error_div').removeClass('d-none');
      }
    });
  }).fail(function (jqXHR, textStatus, errorThrown) {
    $(".list_of_faclities_close").trigger('click');
    if (jqXHR.responseJSON[0]) {
      Swal.fire({
        icon: "error",
        title: jqXHR.responseJSON[0].message,
        showConfirmButton: false,
        timer: 2000
      });
    }
  });

}
map.on('singleclick', function (evt) {
  mapclick(evt);

});

var fmbAjaxRequest = null; // Global variable to store the AJAX request of FMB pdf display

function triggerFMB() {
  if (fmbAjaxRequest) {
    fmbAjaxRequest.abort(); // Abort any existing request before making a new one
    fmbRequest = null; // Clear the reference after aborting
  }

  let taluk_name = adminresponseData.data.taluk_name;
  let corporation_name = adminresponseData.data.corporation_name;
  let town_panchayat_name = adminresponseData.data.town_panchayat_name
  let municipality_name = adminresponseData.data.municipality_name


  let location_name = taluk_name || corporation_name || municipality_name || town_panchayat_name;

  var canvas = document.getElementById('pdfCanvas');
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  pdfBlob = null; // Clear the stored PDF blob
  fmbAjaxRequest = $.ajax({
    // url: 'https://tngis.tnega.org/village_dashboard_api/v1/encrypt',
    url: config.tamil_nilam_url + '/v1/encrypt',
    type: 'POST',
    headers: {
      'X-APP-USER-ID': storedUserId,
      // 'X-APP-NAME': 'T@mi!_nill@m^&'
    },
    data: {
      districtCode: responseData.data.district_code.toString().padStart(2, '0'),
      talukCode: responseData.data.taluk_code.toString().padStart(2, '0'),
      villageCode: responseData.data.village_code.toString().padStart(3, '0'),
      surveyNumber: responseData.data.survey_number,
      subdivisionNumber: responseData.data.sub_division ? responseData.data.sub_division.toString() : '-',
      type: "rural"
    },
    beforeSend: function () {
      showSpinner("Fetching data from NIC... Please wait...!");
    },
    complete: function () {
      hideSpinner();
    },
    xhrFields: {
      responseType: 'blob' // Important to handle binary data
    },
    success: function (response) {
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var jsonResponse = JSON.parse(reader.result);
          //console(jsonResponse);
          if (jsonResponse.status !== 1 && jsonResponse.message) {
            alert(jsonResponse.message);
            //console(jsonResponse.message);
            return;
          }
        } catch (e) {
          // If parsing fails, it means it's not a JSON error message
        }

        //console("PDF file received");

        // Clear the previous PDF data
        var canvas = document.getElementById('pdfCanvas');
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Create a blob URL from the binary PDF data
        pdfBlob = response;
        var url = URL.createObjectURL(pdfBlob);

        // Use PDF.js to render the PDF
        var loadingTask = pdfjsLib.getDocument(url);
        loadingTask.promise.then(function (pdf) {
          //console('PDF loaded');

          // Fetch the first page
          var pageNumber = 1;
          pdf.getPage(pageNumber).then(function (page) {
            //console('Page loaded');

            // Calculate the scale dynamically to fit the width of the container
            var container = document.getElementById('pdfViewer');
            var desiredWidth = container.clientWidth;
            var viewport = page.getViewport({ scale: 1 });
            var scale = desiredWidth / viewport.width;
            viewport = page.getViewport({ scale: scale * 2 }); // Increase scale for better clarity

            // Prepare canvas using PDF page dimensions
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render PDF page into canvas context
            var renderContext = {
              canvasContext: context,
              viewport: viewport
            };
            var renderTask = page.render(renderContext);
            renderTask.promise.then(function () {
              //console('Page rendered');
            });
          });
        }, function (reason) {
          // alert('no data from NIC');
          Swal.fire({
            icon: 'error',
            title: '',
            text: `Subdivision map (FMB) could not be downloaded for visualization. Please contact the Revenue Surveyor in  ${location_name} taluk office.`,
            showConfirmButton: true
          }).then((result) => {
            if (result.isConfirmed) {
              $('#close_fmb').click(); // Trigger the click event
            }
          });
          return;
        });
      };
      reader.readAsText(response);
    },
    error: function (error, textStatus, errorThrown) {
      hideSpinner(); // Hide spinner on error
      // **Handle silent abort (avoid showing error messages when aborted)**
      if (textStatus === 'abort' || error.status === 0) {
        console.log("AJAX request aborted silently.");
        return;
      }
      Swal.fire({
        icon: 'error',
        title: '',
        text: `Subdivision map (FMB) could not be downloaded for visualization. Please contact the Revenue Surveyor in  ${location_name} taluk office .`,
        showConfirmButton: true
      }).then((result) => {
        if (result.isConfirmed) {
          $('#close_fmb').click(); // Trigger the click event
        }
      });
      return;
    }
  });
}

$(document).ready(function () {
  let pdfBlob;


  $('#fmb_trigger').on('click', function (e) {
    e.preventDefault();

    const targetSelector = ".fmb-info";
    // check_areg();


    $.ajax({
      url: config.aregcheck + '/v1/check_Areg',
      type: 'GET',
      headers: {
        'X-APP-USER-ID': storedUserId,
        'X-APP-NAME': 'T@mi!_nill@m^&'
      },
      data: {
        district_code: responseData.data.district_code.toString().padStart(2, '0'),
        taluk_code: responseData.data.taluk_code.toString().padStart(2, '0'),
        village_code: responseData.data.village_code.toString().padStart(2, '0'),
        survey_number: responseData.data.survey_number,
        sub_division_number: responseData.data.sub_division ? responseData.data.sub_division.toString() : land_type === "urban" ? '-' : '-',
        area_type: adminresponseData.data.type.toLowerCase()
      },
      beforeSend: function () {
        showSpinner("Fetching data from NIC... Please wait...!");
      },
      complete: function () {
        hideSpinner();
      },
      success: function (response) {
        if (response.success === 1 || response.success === 3) {
          if ($(targetSelector).length) {
            // Use Bootstrap's native offcanvas method
            const offcanvas = new bootstrap.Offcanvas($(targetSelector)[0]);
            offcanvas.show();
          } else {
            console.error(`Target element "${targetSelector}" not found`);
          }


          // Directly trigger FMB function
          $('#subdivisionDropdownContainerfmb').remove();
          survey_no_display();
          triggerFMB();
        } else if (response.success === 2) {
          if ($(targetSelector).length) {
            // Use Bootstrap's native offcanvas method
            const offcanvas = new bootstrap.Offcanvas($(targetSelector)[0]);
            offcanvas.show();
          } else {
            console.error(`Target element "${targetSelector}" not found`);
          }

          hideSpinner();
          console.log("Subdivision response received:", response.data); // Debugging
          // Remove existing dropdown if any
          $('#subdivisionDropdownContainerfmb').remove();


          // Create a new dropdown
          dropdownContainerfmb = `
                  <div id="subdivisionDropdownContainerfmb" style="margin-top: 5px; font-size: 12px;">
                      <label for="subdivisionDropdownfmb" style="color: #fff218; font-weight: bold; font-size: 12px;">Select Subdivision:</label>
                      <select id="subdivisionDropdownfmb" class="swal2-select" style="width: 150px; padding: 3px; font-size: 12px;">   
                      </select>
                  </div>`;

          // Append the dropdown inside the Offcanvas Header
          $('#fmbheader').append(dropdownContainerfmb);

          // Populate dropdown
          response.data.forEach(item => {
            $('#subdivisionDropdownfmb').append(`<option value="${item.subdiv_no}">${item.subdiv_no}</option>`);
          });

          $('#subdivisionDropdownfmb').select2({
            width: '150px',
          });



          // Trigger FMB function when a subdivision is selected
          $('#subdivisionDropdownfmb').on('change', function () {
            let selectedSubdivision = $(this).val();
            if (selectedSubdivision && selectedSubdivision !== "0") {
              responseData.data.sub_division = selectedSubdivision; // Update responseData
              triggerFMB();
              survey_no_display();

            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: '',
            text: `Subdivision data found for survey number ${responseData.data.survey_number} and sub division number ${responseData.data.sub_division}.`,
            showConfirmButton: true
          });
        }
      }, error: function (err) {
        swal.fire({
          icon: 'error',
          title: '',
          text: err.responseJSON.message,
          showConfirmButton: true
        })
      }
    });





  });

  $('#downloadButton').on('click', function () {
    if (pdfBlob) {
      saveAs(pdfBlob, 'document.pdf');
    }
  });

  $('#close_fmb').on('click', function () {
    if (fmbAjaxRequest) {
      fmbAjaxRequest.abort();
      fmbAjaxRequest = null;
      // console.log("FMB AJAX request aborted.");
    }
    var canvas = document.getElementById('pdfCanvas');
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    pdfBlob = null; // Clear the stored PDF blob
    //console("PDF viewer reset");
  });
});
$(document).on('click', '#trigger', function (e) {
  e.preventDefault();
  // Get target selector from data-bs-target
  const targetSelector = ".aregister-info";


  let district_name = adminresponseData.data.district_name;
  let taluk_name = adminresponseData.data.taluk_name;
  let village_name = adminresponseData.data.revenue_village_name;
  let corporation_name = adminresponseData.data.corporation_name;
  let town_panchayat_name = adminresponseData.data.town_panchayat_name
  let municipality_name = adminresponseData.data.municipality_name
  let surveyNumber = responseData.data.survey_number;
  // let locationDetailsArray = [
  //     district_name ? `<span style="color:#fff218; font-weight:bold;">District:</span> <span style="color:white;">${district_name}</span>` : '',
  //     taluk_name ? `<span style="color:#fff218; font-weight:bold;">Taluk:</span> <span style="color:white;">${taluk_name}</span>` : '',
  //     village_name ? `<span style="color:#fff218; font-weight:bold;">Village:</span> <span style="color:white;">${village_name}</span>` : '',
  //     corporation_name ? `<span style="color:#fff218; font-weight:bold;">Corporation:</span> <span style="color:white;">${corporation_name}</span>` : '',
  //     town_panchayat_name ? `<span style="color:#fff218; font-weight:bold;">Town Panchayat:</span> <span style="color:white;">${town_panchayat_name}</span>` : '',
  //     municipality_name ? `<span style="color:#fff218; font-weight:bold;">Municipality:</span> <span style="color:white;">${municipality_name}</span>` : '',
  //     surveyNumber ? `<span style="color:#fff218; font-weight:bold;">Survey:</span> <span style="color:white;">${surveyNumber}</span>` : ''
  // ];

  // let locationDetails = locationDetailsArray.filter(value => value !== '').join('<br>');


  $.ajax({
    url: config.aregcheck + '/v1/check_Areg',
    type: 'GET',
    headers: {
      'X-APP-USER-ID': storedUserId,
      'X-APP-NAME': 'T@mi!_nill@m^&'
    },
    data: {
      district_code: responseData.data.district_code.toString().padStart(2, '0'),
      taluk_code: responseData.data.taluk_code.toString().padStart(2, '0'),
      village_code: responseData.data.village_code.toString().padStart(2, '0'),
      survey_number: responseData.data.survey_number,
      sub_division_number: responseData.data.sub_division ? responseData.data.sub_division.toString() : land_type === "urban" ? '-' : '-',
      area_type: adminresponseData.data.type.toLowerCase()
    },

    success: function (response) {
      if (response.success === 1 || response.success === 3) {

        // Ensure the target exists
        if ($(targetSelector).length) {
          // Use Bootstrap's native offcanvas method
          const offcanvas = new bootstrap.Offcanvas($(targetSelector)[0]);
          offcanvas.show();
        } else {
          console.error(`Target element "${targetSelector}" not found`);
        }

        $('#subdivisionDropdownContainer').remove();
        survey_no_display();

        callTriggerFunction();
      } else if (response.success === 2) {



        if ($(targetSelector).length) {
          // Use Bootstrap's native offcanvas method
          const offcanvas = new bootstrap.Offcanvas($(targetSelector)[0]);
          offcanvas.show();
        } else {
          console.error(`Target element "${targetSelector}" not found`);
        }
        // Remove existing dropdown if any
        $('#subdivisionDropdownContainer').remove();



        // Create a new dropdown container
        dropdownContainer = `<div id="subdivisionDropdownContainer" style="margin-top: 5px; font-size: 12px;">
            <label for="subdivisionDropdown" style="color: #fff218; font-weight: bold; font-size: 12px;">Select Subdivision:</label>
            <select id="subdivisionDropdown" class="swal2-select" style="width: 150px; padding: 3px; font-size: 12px;">
                <option value="0">Select Subdivision</option>
            </select>
        </div>`;

        // Append the dropdown next to location_details1
        $('#location_details1').after(dropdownContainer);

        // Populate dropdown options
        response.data.forEach(item => {
          $('#subdivisionDropdown').append(`<option value="${item.subdiv_no}">${item.subdiv_no}</option>`);
        });

        $('#subdivisionDropdown').select2({
          width: '150px',

        });
        $('#rural_areg_header').removeClass('hidden');
        $('#rural_ownerinfo').removeClass('hidden');
        $('#urban_ownerinfo').addClass('hidden');
        $('#urban_areg_header').addClass('hidden');

        // Handle change event
        $('#subdivisionDropdown').on('change', function () {
          let selectedSubdivision = $(this).val();
          if (selectedSubdivision && selectedSubdivision !== "0") {
            responseData.data.sub_division = selectedSubdivision; // Store selection
            callTriggerFunction(); // Trigger function after selection
            survey_no_display();
          }
        });

      } else {
        Swal.fire({
          icon: 'error',
          title: '',
          text: `Subdivision data found for survey number ${responseData.data.survey_number} and sub division number ${responseData.data.sub_division}.`,
          showConfirmButton: true
        });
      }
    }, error: function (err) {
      Swal.fire({
        icon: 'error',
        title: '',
        text: err.responseJSON.message,
        showConfirmButton: true
      });
    }
  });




});


let land_type
//   if (responseData && responseData.success != 2) {)

// Store AJAX request globally to be able to abort later
let aregRequest = null;

function callTriggerFunction() {
  // Abort any previous request before making a new one
  if (aregRequest) {
    aregRequest.abort();
    aregRequest = null; // Clear the reference after aborting
  }
  // $('#trigger').on('click', function () {
  if (responseData && responseData.success != 2) {

    // Convert land_type to lowercase
    land_type = adminresponseData.data.type.toLowerCase();

    let commonData = {
      district_code: responseData.data.district_code.toString().padStart(2, '0'),
      taluk_code: responseData.data.taluk_code.toString().padStart(2, '0'),
      survey_number: responseData.data.survey_number,
      sub_division_number: responseData.data.sub_division
        ? responseData.data.sub_division.toString()
        : land_type === "urban" ? '0' : '-', // Set sub_division_number dynamically
      land_type: land_type, // Convert to lowercase
      code_type: "revenue",
      search_type: "survey_number"
    };

    // Add specific fields based on land_type
    let specificData = {};
    if (land_type === "rural") {
      specificData = {
        village_code: responseData.data.village_code.toString().padStart(3, '0')
      };
    } else if (land_type === "urban") {
      specificData = {
        town_code: responseData.data.village_code.toString().padStart(3, '0'),
        block_code: responseData.data.urban_block_number || "null", // Set to null if undefined
        ward_code: responseData.data.firka_ward_number
          ? responseData.data.firka_ward_number.toString().padStart(3, '0')
          : "null"
      };
    }

    // Merge commonData and specificData
    let payload = { ...commonData, ...specificData };



    // Set sub_division_number based on land_type
    // let subDivisionNumber = (land_type === "urban")
    //   ? (responseData.data.sub_division ? responseData.data.sub_division.toString() : '0')
    //   : (responseData.data.sub_division ? responseData.data.sub_division.toString() : '-');
    // let wardCode = responseData.data.firka_ward_number
    //   ? responseData.data.firka_ward_number.toString().padStart(3, '0')
    //   : "null";

    aregRequest = $.ajax({
      url: config.tamil_nilam_url + '/v1/tamil_nillam_ownership',

      type: 'POST',
      headers: {

        'X-APP-USER-ID': storedUserId,

      },
      data: payload,

      beforeSend: function () {
        showSpinner("Fetching data from NIC... Please wait...!");
      },
      complete: function () {
        hideSpinner();
        if (land_type === "rural") {
          $('#rural_ownerinfo').removeClass('hidden');

          $('#rural_areg_header').removeClass('hidden');
          $('#urban_ownerinfo').addClass('hidden');
          $('#urban_areg_header').addClass('hidden');

        } else {
          $('#rural_ownerinfo').addClass('hidden');
          $('#rural_areg_header').addClass('hidden');
          $('#urban_areg_header').removeClass('hidden');
          $('#urban_ownerinfo').removeClass('hidden');

        }
      },
      success: function (data1) {
        $('#ownerContainer').empty();
        let district_name = adminresponseData.data.district_name;
        let taluk_name = adminresponseData.data.taluk_name;
        let corporation_name = adminresponseData.data.corporation_name;
        let town_panchayat_name = adminresponseData.data.town_panchayat_name
        let municipality_name = adminresponseData.data.municipality_name
        let surveyNumber = responseData.data.survey_number;
        let subDivisionNumber = responseData.data.sub_division ? responseData.data.sub_division.toString() : '-';
        let location_name = taluk_name || corporation_name || municipality_name || town_panchayat_name;

        if (data1.success === "400") {
          clearFields();
          // alert("No data found from NIC");
          Swal.fire({
            icon: 'error',
            title: '',
            text: `Details of Land (${surveyNumber} / ${subDivisionNumber}) selected is not available in Tamil Nilam Records.  Please contact the Revenue Surveyor in  ${location_name} taluk office.`,
            showConfirmButton: true
          }).then((result) => {
            if (result.isConfirmed) {
              $('#areg_button').click(); // Trigger the click event
            }
          });
          return;
        }
        else if (data1.success === 0) {
          Swal.fire({
            icon: 'error',
            title: '',
            text: `Details of Land (${surveyNumber} / ${subDivisionNumber}) selected is not available in Tamil Nilam Records.  Please contact the Revenue Surveyor in  ${location_name} taluk office.`,
            // text: `Connection Refused from NIC`,
            showConfirmButton: true
          }).then((result) => {
            if (result.isConfirmed) {
              $('#areg_button').click(); // Trigger the click event
            }
          });
          return;
        }
        else if (
          data1.success === 1 &&
          data1.data.land_detail.length === 0 &&
          data1.data.ownership_detail.length === 0
        ) {
          Swal.fire({
            icon: 'error',
            title: '',
            text: `Details of Land (${surveyNumber} / ${subDivisionNumber}) selected are not available in Tamil Nilam Records. Please contact the Revenue Surveyor in  ${location_name} taluk office.`,
            showConfirmButton: true
          }).then((result) => {
            if (result.isConfirmed) {
              $('#areg_button').click(); // Trigger the click event
            }
          });
          return;
        }

        function setText(id, text) {
          $('#' + id).text(text ? text : '-');
        }

        function clearFields() {
          var fields = ['ownerContainer', 'govtPriTamil', 'osurvey_no', 'partInd', 'govtPriCode', 'govtPriEng', 'taxRate', 'soilTypPri', 'soilTypSec', 'soilClass', 'taxHect', 'extHect', 'extAres', 'totTax', 'pattaNo', 'poramboke', 'remarks', 'remarks1', 'form8No', 'form6No', 'assessed', 'cultivable'];
          fields.forEach(function (field) {
            setText(field, null);
          });
        }
        if (land_type === "rural") {


          //<-------------------------------------------------------------rural--------------------------------------------------------------------------->
          var ownerCountRow = $('<div>').addClass('row');
          var ownerCountLabel = $('<div>').addClass('col-6').append($('<p>').addClass('mb-1  txt-orange small-font1').attr('id', 'ownerCountLabel').text(languageContent[currentLang]['ownerCountLabel']));
          var ownerCountValue = $('<div>').addClass('col-6').append($('<p>').addClass('mb-0  text-white small-font ').text(data1.data.ownership_detail.length));
          ownerCountRow.append(ownerCountLabel, ownerCountValue);
          $('#ownerContainer').append(ownerCountRow);

          data1.data.ownership_detail.forEach(function (owner, index) {
            var ownerNameRow = $('<div>').addClass('row');
            var ownerNameLabel = $('<div>').addClass('col-6').append($('<p>').addClass('mb-1 txt-orange small-font1').attr('id', 'ownerNameLabel' + index).text((index + 1) + '. ' + languageContent[currentLang]['ownerNameLabel']));
            var ownerNameValue = $('<div>').addClass('col-6').append($('<p>').addClass('mb-0  text-white small-font').text(owner.Owner ? owner.Owner : '-'));
            ownerNameRow.append(ownerNameLabel, ownerNameValue);

            var relationAndRelativeRow = $('<div>').addClass('row');
            var relationLabel = $('<div>').addClass('col-6').append($('<p>').addClass('mb-1  txt-orange small-font1').attr('id', 'ownerRelativeLabel' + index).text((index + 1) + '. ' + languageContent[currentLang]['ownerRelativeLabel']));
            var relationValue = $('<div>').addClass('col-6').append($('<p>').addClass('mb-0  text-white small-font').text((owner.Relative ? owner.Relative : '-') + ' - ' + (owner.Relation ? owner.Relation : '-')));
            relationAndRelativeRow.append(relationLabel, relationValue);
            $('#ownerContainer').append(ownerNameRow, relationAndRelativeRow);
          });

          setText('govtPriTamil', data1.data.land_detail.govtPriTamil);
          setText('osurvey_no', data1.data.land_detail.osurveyNo);
          setText('partInd', data1.data.land_detail.partInd);
          setText('govtPriCode', data1.data.land_detail.govtPriCode);
          setText('govtPriEng', data1.data.land_detail.govtPriEng);
          setText('taxRate', data1.data.land_detail.taxRate);
          setText('soilTypPri', data1.data.land_detail.soilTypPri);
          setText('soilTypSec', data1.data.land_detail.soilTypSec);
          setText('soilClass', data1.data.land_detail.soilClass);
          setText('taxHect', data1.data.land_detail.taxHect);
          setText('extHect', data1.data.land_detail.extHect);
          setText('extAres', data1.data.land_detail.extAres);
          setText('totTax', data1.data.land_detail.totTax);
          setText('pattaNo', data1.data.land_detail.pattaNo);
          setText('poramboke', data1.data.land_detail.poramboke);
          setText('remarks', data1.data.land_detail.remarks);
          setText('remarks1', data1.data.land_detail.remarks1);
          setText('form8No', data1.data.land_detail.form8No);
          setText('form6No', data1.data.land_detail.form6No);
          setText('assessed', data1.data.land_detail.assessed);
          setText('cultivable', data1.data.land_detail.cultivable);
        } else {

          setText('owner_nameurban1', data1.data.ownership_detail.owner);
          setText('ward', data1.data.land_detail.Ward);
          setText('street', data1.data.land_detail.Street);
          setText('oldSurveyNoAndLetter', data1.data.land_detail.OldSurveyNoAndLetter);
          setText('govtMittaZamindariInam', data1.data.land_detail.GovtMittaZamindariInam);
          setText('dryWetUnassessedPorambokeHouse', data1.data.land_detail["DryWetUnassessedPorambokeHouse-Site"]);
          setText('sourceOfIrrigationAndClass', data1.data.land_detail.SourceOfIrrigationAndClass);
          setText('ifdoubleCropReteofComposition', data1.data.land_detail.IfdoubleCropReteofComposition);
          setText('classAndSortOfSoil', data1.data.land_detail.ClassAndSortOfSoil);
          setText('taram', data1.data.land_detail.Taram);
          setText('hecter', data1.data.land_detail.Hecter);
          setText('squareMeter', data1.data.land_detail.SquareMeter);
          setText('howTheHoldingIsUtilised', data1.data.land_detail.HowTheHoldingIsUtilised);
          setText('ares', data1.data.land_detail.Ares);
          setText('rubees', data1.data.land_detail.Rubees);
          setText('paise', data1.data.land_detail.paise);
          setText('digitalSignatureDate', data1.data.land_detail.DigitalSignatureDate);
          setText('signedBy', data1.data.land_detail.SignedBy);
          setText('destination', data1.data.land_detail.Destination);
          setText('place', data1.data.land_detail.Place);
          setText('cossBlockCode', data1.data.land_detail.CossBlockCode);
          setText('remark_urban', data1.data.land_detail.Remarks);
          const landDetail = data1.data.land_detail;

          // Format the data into "District | Taluk | Town | Block | Ward | SurveyNo/SubDivNo"
          const formattedText = `${landDetail.District[0]} | ${landDetail.Taluk} | ${landDetail.Town} | ${landDetail.Block} | 
                                  ${landDetail.Ward} | ${landDetail.SurveyNo}/${landDetail.SubDivNo}`;
          document.getElementById("urban_data").innerText = formattedText;

        }

        //<-------------------------------------------------------------rural--------------------------------------------------------------------------->


      },
      error: function (error, textStatus, errorThrown) {
        hideSpinner(); // Hide spinner on error
        // **Handle silent abort (avoid showing error messages when aborted)**
        if (textStatus === 'abort' || error.status === 0) {
          console.log("Areg AJAX request aborted silently.");
          return;
        }
        let district_name = adminresponseData.data.district_name;
        let taluk_name = adminresponseData.data.taluk_name;
        let corporation_name = adminresponseData.data.corporation_name;
        let town_panchayat_name = adminresponseData.data.town_panchayat_name
        let municipality_name = adminresponseData.data.municipality_name

        let surveyNumber = responseData.data.survey_number;
        let subDivisionNumber = responseData.data.sub_division ? responseData.data.sub_division.toString() : '-';

        let location_name = taluk_name || corporation_name || municipality_name || town_panchayat_name;
        Swal.fire({
          icon: 'error',
          title: '',
          text: `Details of Land (${surveyNumber} / ${subDivisionNumber}) selected is not available in Tamil Nilam Records.  Please contact the Revenue Surveyor in  ${location_name} taluk office.`,
          showConfirmButton: true
        }).then((result) => {
          if (result.isConfirmed) {
            $('#areg_button').click(); // Trigger the click event
          }
        });
        return;
      }
    });
  }
}
$('#areg_button').on('click', function () {
  clearFields();
  if (aregRequest) {
    aregRequest.abort();
    aregRequest = null; // Clear the reference
  }
  function setText(id, text) {
    $('#' + id).text(text ? text : '-');
  }

  function clearFields() {
    var fields = ['ownerContainer', 'govtPriTamil', 'osurvey_no', 'partInd', 'govtPriCode', 'govtPriEng', 'taxRate', 'soilTypPri', 'soilTypSec', 'soilClass', 'taxHect', 'extHect', 'extAres', 'totTax', 'pattaNo', 'poramboke', 'remarks', 'remarks1', 'form8No', 'form6No', 'assessed', 'cultivable'];
    fields.forEach(function (field) {
      setText(field, null);
    });
  }
});
// rural_urban(); 
function rural_urban() {
  let rural_urban = adminresponseData.data.type;
  //console("rural_urban",rural_urban);
  if (rural_urban === 'Rural') {

    $('#othersModalPopup').modal('show');
    // document.getElementById("others-modal-id").style.display = "block"; // Ensure it's visible for other types
    //console("rural visible");
  } else {
    // document.getElementById("others-modal-id").style.display = "none"; // Ensure it's visible for other types
    $('#othersModalPopup').modal('hide');
    //console("urban hide");
  }

}

// check_areg();

function check_areg() {



}

let blob;

let base64String;

$(document).ready(function () {

  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
  const $spinner = $('#spinner');
  const $pattaInfoContainer = $('#patta_info_container');
  const $pattaNumberSearch = $('#patta_number_search');
  const $searchPattaNumber = $('#search_patta_number');
  const $displayAllOnMap = $('#display_all_on_map');
  const $downloadPdf = $('#downloadButton');
  let pattaNo;
  $searchPattaNumber.on('click', function (event) {
    event.preventDefault(); // Prevent the default form submission.

    // Store survey and subdivision numbers
    pattaNo = $pattaNumberSearch.val();

    if (responseData && responseData.success !== 2) {
      $.ajax({
        // url: config.ddl_url + '/v1/pattacopy',
        url: config.tamil_nilam_url + '/v1/pattacopy',
        type: 'POST',
        headers: {

          'X-APP-USER-ID': storedUserId, // Replace with your app NAME
        },
        data: {
          district_code: responseData.data.district_code.toString().padStart(2, '0'),
          taluk_code: responseData.data.taluk_code.toString().padStart(2, '0'),
          village_code: responseData.data.village_code.toString().padStart(3, '0'),
          patta_number: pattaNo
        },
        beforeSend: function () {
          showSpinner("Fetching data from NIC... Please wait...!");
        },
        complete: function () {
          hideSpinner();
        },
        success: function (response) {
          //console("Full Response:", response); // Log the full response
          // Check if response is a string and parse it
          if (typeof response === 'string') {
            try {
              response = JSON.parse(response);
            } catch (e) {
              console.error("Failed to parse response JSON:", e);
              return;
            }
          }
          // $('.show_label_wrap').removeClass('hidden'); 
          $('.mb-4.hidden').removeClass('hidden');

          // Check the success field in the response
          if (response.success === '1') {
            // Proceed to handle the base64 data for the PDF
            base64String = response.data;

            // Log the base64 string to ensure it's valid
            //console("Base64 PDF Data:", base64String);

            // Check if the base64 string is valid
            if (base64String && typeof base64String === 'string') {
              try {
                // Convert base64 string to a Blob (PDF format)
                var byteCharacters = atob(base64String); // Decode the base64 string
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                blob = new Blob([byteArray], { type: "application/pdf" });

                // Use PDF.js to render the PDF onto the canvas
                var url = URL.createObjectURL(blob);
                var loadingTask = pdfjsLib.getDocument(url);
                loadingTask.promise.then(function (pdf) {
                  //console('PDF loaded');
                  var totalPages = pdf.numPages; // Get the total number of pages in the PDF
                  //console('Total Pages:', totalPages);

                  pdf.getPage(1).then(function (page) {
                    //console('PDF loaded');

                    var totalPages = pdf.numPages; // Get the total number of pages in the PDF
                    //console('Total Pages:', totalPages);

                    // Loop through each page and render it
                    for (let i = 1; i <= totalPages; i++) {
                      renderPage(i, pdf);
                    }
                    $pattaNumberSearch.hide();
                    $searchPattaNumber.hide();
                    // Display the patta number in the span element
                    $('#pattanoinput').text(pattaNo);
                    $('#survey_subdivision2label').css('display', 'block');
                    $('#pattanolable').css('display', 'block');
                  });
                  function renderPage(pageNumber, pdf) {
                    pdf.getPage(pageNumber).then(function (page) {
                      //console('Rendering page:', pageNumber);

                      var scale = 1.5; // Scale factor for rendering
                      var viewport = page.getViewport({ scale: scale });

                      // Create a new canvas element for each page
                      var canvas = document.createElement('canvas');
                      canvas.id = 'canvas_' + pageNumber; // Give each canvas a unique ID
                      canvas.className = 'pdf-canvas';


                      // Append the canvas to the container (assuming #patta_info_container exists)
                      document.getElementById('patta_info_container').appendChild(canvas);

                      // Set canvas dimensions
                      var context = canvas.getContext('2d');
                      canvas.height = viewport.height;
                      canvas.width = viewport.width;

                      // Render the PDF page into the canvas context
                      var renderContext = {
                        canvasContext: context,
                        viewport: viewport
                      };
                      page.render(renderContext).promise.then(function () {
                        //console('Page', pageNumber, 'rendered');
                      });
                    });
                  }
                }, function (reason) {
                  // PDF loading error
                  console.error('Error loading PDF: ', reason);
                });
              } catch (e) {
                console.error("Error processing base64 PDF string: ", e);
              }
            } else {
              console.error("Invalid base64 string.");
            }
          } else if (response.success === '2') {
            // Display SweetAlert message when no patta details are found
            Swal.fire({
              icon: 'error',
              title: 'Patta Details Not Found',
              text: response.message || 'Please check the patta number and try again.',
              confirmButtonText: 'OK'
            }).then(() => {
              // Clear the patta_info_container and reset the patta number search input
              $('#patta_info_container').empty();
              $('#patta_number_search').val('');
            });
          } else if (response.success === '3') {
            // Display SweetAlert for inappropriate response from API
            Swal.fire({
              icon: 'warning',
              title: 'Inappropriate API Response',
              text: response.message || 'The API returned an inappropriate response.',
              confirmButtonText: 'OK'
            }).then(() => {
              // Clear the patta_info_container and reset the patta number search input
              $('#patta_info_container').empty();
              $('#patta_number_search').val('');
            });
          } else {
            console.error("Unexpected response:", response);
          }
        },
        error: function (xhr, status, error) {
          hideSpinner(); // Hide spinner on error
          console.error('Error:', error);
          console.error('Status:', status);
          console.error('Response Text:', xhr.responseText);
        }
      });

      getsurveysubdivison();
    }
  });

  function getsurveysubdivison() {


    $.ajax({
      // url: config.send_verify_otp + '/v2/tamil_nillam_ownership',
      // url: 'https://tngis.tnega.org/generic_api/v2/tamil_nillam_ownership',
      url: config.tamil_nilam_url + '/v1/tamil_nillam_ownership',
      type: 'POST',
      headers: {

        'X-APP-USER-ID': storedUserId, // Replace with your app name
      },
      data: {
        district_code: responseData.data.district_code.toString().padStart(2, '0'),
        taluk_code: responseData.data.taluk_code.toString().padStart(2, '0'),
        village_code: responseData.data.village_code.toString().padStart(3, '0'),
        patta_number: pattaNo,
        code_type: "revenue",
        search_type: "patta_number"
      },
      beforeSend: function () {
        // $spinner.show();
      },
      complete: function () {
        // $spinner.hide();
      },
      success: function (pattaresponse) {
        // //console(pattaresponse);
        displayResults(pattaresponse);
      },
      error: function (error) {
        console.error('Error:', error);
      }
    });

  }
  function displayResults(pattaresponse) {
    let village_name = adminresponseData.data.revenue_village_name;

    if (pattaresponse.success === 1) {
      $displayAllOnMap.removeClass('hidden');
      $downloadPdf.removeClass('hidden');
      const landInfo = pattaresponse.data.land_info;
      $pattaInfoContainer.empty(); // Clear the container before appending new data
      // Clear the arrays
      allSurveys = [];
      allSubdivisions = [];



      landInfo.forEach(item => {
        const surveyNo = item.surveyNo.trim();
        const subdivNo = item.subdivNo;
        allSurveys.push(surveyNo);
        allSubdivisions.push(subdivNo);
        let surveySubdivisionText = allSurveys.map((survey, index) => {
          return `(${survey}/${allSubdivisions[index]})`;
        }).join(', ');

        // Display the survey and subdivision information
        $('#survey_subdivision2').text(surveySubdivisionText);
        $('#location_details2').show(); // Ensure the container is visible

        // const newItem = `
        //   // <div class="box_wrap px-2 py-3 mb-2">
        //   //   <div class="row">
        //   //     <div class="col-4">
        //   //       <label for="inputEmail4" class="form-label txt-orange">Survey / Sub Division No</label>
        //   //     </div>
        //   //     <div class="col-3">
        //   //       <label for="inputEmail4" class="form-label text-white">${surveyNo} <span>/<span>${subdivNo}</label>
        //   //     </div>
        //   //     <div class="col-5 d-flex flex-column">
        //   //     <span class="patta_btn_details badge text-bg-primary bg-primary mb-1 px-2 py-2" data-survey="${surveyNo}" data-subdiv="${subdivNo}">
        //   //         <i class="bi bi-file-earmark-check"></i> Details
        //   //       </span>
        //   //       <span class="patta_btn_map badge text-bg-success bgred bg-success mb-1 px-2 py-2" data-survey="${surveyNo}" data-subdiv="${subdivNo}">
        //   //       <i class="bi bi-pin-map"></i> view on map</span>
        //   //     </div>
        //   //   </div>
        //   // </div>

        //     <div id="pdfViewer1">
        //       <canvas id="pdfCanvas1" class="pdf-canvas"></canvas>
        //     </div>
        // `;
        // $pattaInfoContainer.append(newItem);
      });
      // displayAllGeometries(allSurveys, allSubdivisions);
    } else {
      Swal.fire({
        icon: 'error',
        title: '',
        // text: `No records available for this Patta Number. Please recheck`,
        text: `No records available for this Patta Number( ${pattaNo} ) in ${village_name}.  
       Please recheck your entered patta number.`,
        showConfirmButton: true
      }).then((result) => {
        if (result.isConfirmed) {
          $displayAllOnMap.addClass('hidden');
          $downloadPdf.addClass('hidden');
          $('#patta_btn_close').click(); // Trigger the click event

        }
      });
      return;
    }
  }

  // Event handler for the new button
  $displayAllOnMap.on('click', function () {

    // Debugging: Check if variables are defined
    //console('allSurveys:', allSurveys);
    //console('allSubdivisions:', allSubdivisions);

    // Ensure variables are arrays or convert them if needed
    if (!Array.isArray(allSurveys) || !Array.isArray(allSubdivisions)) {
      console.error('Error: allSurveys and allSubdivisions must be arrays');
      return;
    }
    $('#othersModalPopup').modal('hide');

    // Call the function to display all geometries
    displayAllGeometries(allSurveys.join(','), allSubdivisions.join(','));
    // displayAllGeometries(allSurveys, allSubdivisions);
  });

  function displayAllGeometries(surveys, subdivisions) {

    // Ensure surveys and subdivisions are strings
    if (typeof surveys !== 'string' || typeof subdivisions !== 'string') {
      console.error('Invalid input: surveys and subdivisions should be strings');
      return;
    }

    //console('Surveys:', surveys, 'Type:', typeof surveys);
    //console('Subdivisions:', subdivisions, 'Type:', typeof subdivisions);

    // Split comma-separated values into arrays
    const surveyArray = surveys.split(',').map(item => item.trim()).filter(item => item);
    const subdivArray = subdivisions.split(',').map(item => item.trim()).filter(item => item);

    // Ensure arrays have equal length
    if (surveyArray.length !== subdivArray.length) {
      console.error('Mismatch between number of survey numbers and subdivision numbers');
      return;
    }

    // Clear previous features
    dropdownSource.clear();
    //  dropdownSource.addFeatures(features); // Add new features

    // Prepare AJAX requests
    const ajaxCalls = surveyArray.map((survey, index) => {
      let subdiv = subdivArray[index];
      let caseType = 'sub_division_number';
      if (subdiv === '-') {
        subdiv = 'all';
        caseType = 'survey_number';
      }
      // Prepare request data for each AJAX call
      const requestData = {
        'district_code': responseData.data.district_code,
        'taluk_code': responseData.data.taluk_code,
        'village_code': responseData.data.village_code,
        'case': caseType, // Ensure the 'case' is appropriate
        'code_type': 'revenue',
        'survey_number': survey,
        'sub_division_number': subdiv
      };

      // Return the AJAX promise
      return $.ajax({
        type: 'POST',
        headers: {

          'X-APP-USER-ID': storedUserId,
        },
        // url: config.send_verify_otp + '/v1/get_geom', // Adjust URL if necessary
        url: config.tamil_nilam_url + '/v1/get_geom',
        data: requestData
      }).done(function (geom) {
        if (geom.success) {
          const featureCollection = geom.data;
          const features = new ol.format.GeoJSON().readFeatures(featureCollection, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          });

          // dropdownSource.addFeatures(features); // Add new features to existing ones

          // dropdownSource.clear(); // Clear previous features
          dropdownSource.addFeatures(features); // Add new features
          // Update visibility
          dropdownLayer.setVisible(true);
          mapClickLayer.setVisible(false);

          var extent = dropdownLayer.getSource().getExtent();
          map.getView().fit(extent, { duration: 4000, maxZoom: 20, padding: [30, 30, 30, 30] });

          // dropdownLayer.setVisible(true);
          //console('Geometry Data for survey:', survey, 'subdivision:', subdiv);
        } else if (geom.success === 0) {
          Swal.fire({
            icon: 'error',
            title: '',
            text: `This subdivision is not available in Map`,
            showConfirmButton: true
          }).then((result) => {
            if (result.isConfirmed) {
              $('#areg_button').click(); // Trigger the click event
            }
          });
          return;
        } else {
          console.error('Error fetching geometry for survey:', survey, 'subdivision:', subdiv, 'Message:', geom.message);
        }
      }).fail(function (xhr, status, error) {
        console.error('AJAX Error:', status, error);
      });
    });

    // Wait for all AJAX calls to complete
    $.when.apply($, ajaxCalls).done(function () {
      // Update visibility and map view
      dropdownLayer.setVisible(true);
      mapClickLayer.setVisible(false);

      const extent = dropdownLayer.getSource().getExtent();
      map.getView().fit(extent, { duration: 4000, maxZoom: 20, padding: [30, 30, 30, 30] });

      //console('All geometries displayed.');
    });
  }

  // Event delegation for dynamically added .patta_btn_details elements
  $pattaInfoContainer.on('click', '.patta_btn_details', function () {
    // survey_no_display();

    responseData.data.survey_number = $(this).data('survey');
    responseData.data.sub_division = $(this).data('subdiv');


    // $('#patta_btn_close').click();
    $('#othersModalPopup').modal('hide');
    $('#areg_button').addClass('add_othersModalPopup');

    survey_no_display();

    $('#trigger').click();

  });

  $(document).on('click', '.add_othersModalPopup', function () {
    // rural_urban();
    $('#othersModalPopup').modal('show');

  })

  $pattaInfoContainer.on('click', '.patta_btn_map', function () {
    responseData.data.survey_number = $(this).data('survey');
    responseData.data.sub_division = $(this).data('subdiv') || ''; // Default to an empty string if undefined
    $('#othersModalPopup').modal('hide');
    highlight_survey();

    // // $('#patta_btn_close').click();
    // $('#othersModalPopup').modal('hide');
    // $('#areg_button').addClass('add_othersModalPopup');

    //   survey_no_display();

    // $('#trigger').click();

  });

  function highlight_survey() {
    var dist_code = responseData.data.district_code;
    var taluk_code = responseData.data.taluk_code;
    var village_code = responseData.data.village_code;

    var survey_number = responseData.data.survey_number;
    var subdiv = responseData.data.sub_division ? responseData.data.sub_division.toString() : '';
    var caseType = 'sub_division_number';
    if (subdiv === '-') {
      subdiv = 'All';
      caseType = 'survey_number';
    }
    var requestData = {
      'district_code': dist_code,
      'taluk_code': taluk_code,
      'village_code': village_code,
      'survey_number': survey_number,
      'sub_division_number': subdiv,
      'case': caseType,
      'code_type': 'revenue'
    };

    //console("Request Data:", requestData);

    // AJAX request to get geometry data based on dropdown selection
    $.ajax({
      type: 'POST',
      headers: {

        'X-APP-USER-ID': storedUserId,
      },

      //  url: config.send_verify_otp + '/v1/get_geom',
      url: config.tamil_nilam_url + '/v1/getgeom',
      data: requestData,
      success: function (geom) {
        if (geom.success) {
          var featureCollection = geom.data;
          var features = new ol.format.GeoJSON().readFeatures(featureCollection, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          });

          dropdownSource.clear(); // Clear previous features
          dropdownSource.addFeatures(features); // Add new features
          // Update visibility
          dropdownLayer.setVisible(true);
          mapClickLayer.setVisible(false);

          var extent = dropdownLayer.getSource().getExtent();
          map.getView().fit(extent, { duration: 4000, maxZoom: 20, padding: [30, 30, 30, 30] });

          dropdownLayer.setVisible(true);
          //console('Geometry Data:', geom.data);
        } else if (geom.success === 0) {
          Swal.fire({
            icon: 'error',
            title: '',
            text: `This Subdivision is not availbel in Map.`,
            showConfirmButton: true
          }).then((result) => {
            if (result.isConfirmed) {
              $('#areg_button').click(); // Trigger the click event
            }
          });
          return;
        }
      }
    });
  }
  $('#patta_btn_close').on('click', function () {
    $('#areg_button').removeClass('add_othersModalPopup');
    $displayAllOnMap.addClass('hidden');
    $downloadPdf.addClass('hidden');
    $('#survey_subdivision2').text('');
    $('#survey_subdivision2label').hide();
    $('#pattanolable').hide();
    $pattaInfoContainer.empty();
    $('#patta_number_search').val('');
    $('#pattanoinput').text('');
    dropdownSource.clear();
    //console("container empty");
    $pattaNumberSearch.show();
    $searchPattaNumber.show();
  });
});

function callAndroidFunction() {

  if (base64String) {
    if (typeof AndroidFunction !== 'undefined') {
      // Pass the base64 string directly to the Android function
      AndroidFunction.downloadFile(base64String, 'document.pdf');
    } else {
      //console("Android function not available.");
    }
  } else {
    //console("No base64 string available.");
  }



}


function callAndroidFunctionfmb() {
  // Ensure you have the Base64 string before calling Android function
  if (window.base64PDF) {
    // Check if the Android function is available
    if (typeof AndroidFunction !== 'undefined') {
      // Pass the base64 string directly to the Android function
      AndroidFunction.downloadFile(window.base64PDF, 'document.pdf');
    } else {
      //console("Android function not available.");
    }
  } else {
    //console("No base64 string available.");
  }
}



function clearRelatedFacilityData() {
  /*$("#offCanvas_facility_name").empty();
  $("#nearby_facility_list_parent").empty();
  var myOffcanvas = document.getElementById('facilitiesCanvas');
  var facilitiesOffCanvas = new bootstrap.Offcanvas(myOffcanvas);
  facilitiesOffCanvas.hide();
  clearVectorSourceData();*/
}

/**
 * Converts from EPSG:3857 to EPSG:4326
 * @param "Array containing Longitude and Latitude from the click Event" 
 * @returns "Array containing converted Longitude and Latitude"
 */
function tranformProj(obj) {
  return ol.proj.transform(obj.coordinate, 'EPSG:3857', 'EPSG:4326');
}

/**
 * Centres to the given long,lat
 * @param "[long,lat]"
 */
function center(obj) {
  view.animate({
    duration: 700,
    center: obj.coordinate
  });
}

/**
 * Onclick Marker
 */
const marker = new ol.Feature({
  geometry: new ol.geom.Point([[]])
});
marker.setStyle(
  new ol.style.Style({
    image: new ol.style.Icon({
      src: "assets/img/marker_icon.png",
      anchor: [20, 2],
      anchorXUnits: "pixels",
      anchorYUnits: "pixels",
      anchorOrigin: "bottom-left"
    })
  })
);
const markerSource = new ol.source.Vector({
  features: [marker]
});
const markerLayer = new ol.layer.Vector({
  source: markerSource,
  displayInLayerSwitcher: false,
});
map.addLayer(markerLayer);







function clearDependentDropdowns() {
  $('#taluk').empty().append('<option value="all">Select Taluk</option>');
  $('#village').empty().append('<option value="all">Select Village</option>');
  $('.survey').empty().append('<option value="all">Select Survey Number</option>');
  $('#subdivision1').empty().append('<option value="all">Select Subdivision</option>');
}

districtDropDown();
$('#district').change(function () {
  clearDependentDropdowns();
  getTaluk();
  highlight();

});

$('#taluk').change(function () {
  $('#village').empty().append('<option value="all">Select Village</option>');
  $('.survey').empty().append('<option value="all">Select Survey Number</option>');
  $('#subdivision1').empty().append('<option value="all">Select Subdivision</option>');
  getVillage();
  highlight();

});

$('#village').change(function () {
  $('.survey').empty().append('<option value="all">Select Survey Number</option>');
  $('#subdivision1').empty().append('<option value="all">Select Subdivision</option>');
  getSurveyNo();
  highlight();

});

$('.survey').change(function () {
  $('#subdivision1').empty().append('<option value="all">Select Subdivision</option>');
  getSubdivision();
  highlight();

});

$('#subdivision1').change(function () {
  let selectedSubdivision = $(this).val();
  highlight();
  // surveyhighlight();
  if (selectedSubdivision && selectedSubdivision !== "all") {
    responseData.data.sub_division = selectedSubdivision; // Update subdivision value
  }

  survey_no_display(); // Call function to update display


});



// Setup Geolocation API options
// const gpsOptions = {

var vectorLayer;
// District Dropdown
function districtDropDown() {
  // $('#taluk').empty().append('<option value="all">Select Taluk</option>');
  // $('#village').empty().append('<option value="all">Select Village</option>');
  // $('.survey').empty().append('<option value="all">Select Survey Number</option>');
  // $('#subdivision1').empty().append('<option value="all">Select Subdivision</option>');

  $.ajax({
    type: 'POST',
    headers: {

      'X-APP-USER-ID': storedUserId
    },
    url: config.tamil_nilam_url + '/v1/admin_dropdown',
    data: { 'type': 'district' },
    dataType: 'json',
    success: function (result) {
      if (result.success == 1) {
        var district = result.data;
        var district_option = '<option value="all">Select District</option>';
        $('#district').empty();
        district.forEach(function (select) {
          district_option += `<option value='${select.district_code}'>${select.district_name}</option>`;
        });
        $('#district').append(district_option);
      }
    }
  });
}

// Taluk Dropdown
function getTaluk() {

  var district = $("#district").val();
  $.ajax({
    type: 'POST',
    headers: {

      'X-APP-USER-ID': storedUserId
    },
    url: config.tamil_nilam_url + '/v1/admin_dropdown',
    data: {
      'type': 'taluk',
      'district_code': district
    },
    dataType: 'json',
    success: function (result) {
      if (result.success == 1) {
        var taluks = result.data;
        var taluk_option = '<option value="all">Select Taluk</option>';
        $('#taluk').empty();
        taluks.forEach(function (taluk) {
          taluk_option += `<option value='${taluk.taluk_code}'>${taluk.taluk_name}</option>`;
        });
        $('#taluk').append(taluk_option);
      }
    }
  });
}

// Village Dropdown
// function getVillage() {
// var district = $('#district').val();
// var taluk = $('#taluk').val();
// // $('#village').empty().append('<option value="all">Select Village</option>');
// // $('.survey').empty().append('<option value="all">Select Survey Number</option>');
// // $('#subdivision1').empty().append('<option value="all">Select Subdivision</option>');

// $.ajax({
//   type: 'POST',
//   headers: {

//     'X-APP-USER-ID': storedUserId
//   },
//   url: config.tamil_nilam_url + '/v1/admin_dropdown',

//   data: {
//     'type': 'village',
//     'taluk_code': taluk,
//     'district_code': district
//   },
//   dataType: 'json',
//   success: function (result) {
//     if (result.success == 1) {
//       var villages = result.data;
//       var village_option = '<option value="all">Select Village</option>';
//       $('#village').empty();
//       villages.forEach(function (village) {
//         village_option += `<option value='${village.village_code}'>${village.village_name} (${village.village_type})</option>`;
//       });
//       $('#village').append(village_option);
//     }
//   }
// });
// }

function getVillage() {
  var district = $('#district').val();
  var taluk = $('#taluk').val();

  $.ajax({
    type: 'POST',
    headers: {
      'X-APP-USER-ID': storedUserId
    },
    url: config.tamil_nilam_url + '/v1/admin_dropdown',
    data: {
      'type': 'village',
      'taluk_code': taluk,
      'district_code': district
    },
    dataType: 'json',
    success: function (result) {
      if (result.success == 1) {
        var villages = result.data;
        var village_option = '<option value="all">Select Village</option>';
        $('#village').empty(); // Clear existing options

        // Populate village options
        villages.forEach(function (village) {
          village_option += `<option value='${village.village_code}'>${village.village_name} (${village.village_type})</option>`;
        });

        $('#village').append(village_option);

        // Initialize Select2 with search functionality
        $('#village').select2({
          width: '100%', // Adjust width as needed

        });
      }
    }
  });
}

// Survey Dropdown
function getSurveyNo() {
  var district = $('#district').val();
  var taluk = $('#taluk').val();
  var village = $('#village').val();
  village = formatVillageCode(village); // Custom function to format village code

  // $('.survey').empty().append('<option value="all">Select Survey Number</option>');
  $.ajax({
    type: 'POST',
    headers: {

      'X-APP-USER-ID': storedUserId
    },
    // url: config.tamil_nilam_url + '/v1/survey_subdivision_dropdown',
    url: config.tamil_nilam_url + '/v1/survey_subdivision_dropdown',
    data: {
      'type': 'survey',
      'taluk_code': taluk,
      'district_code': district,
      'village_code': village
    },
    dataType: 'json',
    success: function (result) {
      if (result.success == 1) {
        var surveys = result.data;
        var survey_option = '<option value="all">Select Survey Number</option>';
        $('.survey').empty();
        surveys.forEach(function (survey) {
          survey_option += `<option value='${survey.survey_code}'>${survey.survey_name}</option>`;
        });
        $('.survey').append(survey_option);
      }
    }
  });
}
//  var hightype;
// Subdivision Dropdown
function getSubdivision() {
  var district = $('#district').val();
  var taluk = $('#taluk').val();
  var village = $('#village').val();
  var survey = $('.survey').val();
  village = formatVillageCode(village); // Custom function to format village code

  // $('#subdivision1').empty().append('<option value="all">Select Subdivision</option>');
  $.ajax({

    url: config.aregcheck + '/v1/check_Areg',
    type: 'GET',
    headers: {
      'X-APP-USER-ID': storedUserId, // Replace with your app NAME
      'X-APP-NAME': 'T@mi!_nill@m^&'
    },
    data: {

      district_code: district,
      taluk_code: taluk,
      village_code: village,
      survey_number: survey,
      sub_division_number: 'jjj',
    },

    success: function (result) {
      if (result.success === 2) {
        var subdivisions = result.data;
        var subdivision_option = '<option value="all">Select Subdivision</option>';
        $('#subdivision1').empty();
        subdivisions.forEach(function (subdivision) {
          subdivision_option += `<option value='${subdivision.subdiv_no}'>${subdivision.subdiv_no}</option>`;
        });
        $('#subdivision1').append(subdivision_option);
        $('#subdivision1').select2({
          width: '100%', // Adjust width as needed
        });
        surveyhighlight();

      } else {
        // surveyhighlight();
      }
    }
  });
}

// Helper function to format the village code
function formatVillageCode(village) {
  if (village == 'xxx') {
    return '000';
  } else if (village.length === 1) {
    return '00' + village;
  } else if (village.length === 2) {
    return '0' + village;
  }
  return village;
}


var dropdownSource = new ol.source.Vector();
var dropdownLayer = new ol.layer.Vector({
  source: dropdownSource,
  displayInLayerSwitcher: false,
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'cyan',
      width: 5
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 0, 0.1)'
    })
  })
});



map.addLayer(dropdownLayer);
dropdownLayer.setVisible(false);


function surveyhighlight() {
  var dist_code = $('#district').val();
  //console("distcode", dist_code);
  var taluk_code = $('#taluk').val();
  var village_code = $('#village').val();
  var survey_number = $('.survey').val().trim(); // Trim leading/trailing spaces
  var subdiv = $('#subdivision1').val().trim(); // Trim leading/trailing spaces

  var type = '';

  if (subdiv && subdiv !== 'all' && subdiv !== 'select subdivision Number') {
    type = 'sub_division_number';
  } else if (survey_number && survey_number !== 'all') {
    type = 'survey_number';
  } else if (village_code && village_code !== 'all') {
    type = 'revenue_village';
  } else if (taluk_code && taluk_code !== 'all') {
    type = 'taluk';
  } else if (dist_code && dist_code !== 'all') {
    type = 'district';
  } else {
    //console("Invalid input");
    return;
  }

  var requestData = {
    'district_code': dist_code,
    'taluk_code': taluk_code,
    'village_code': village_code,
    'survey_number': survey_number,
    'sub_division_number': subdiv,
    'case': type,
    'code_type': 'revenue'
  };

  //console("Request Data in highlight:", requestData);

  // AJAX request to get geometry data based on dropdown selection
  $.ajax({
    type: 'POST',
    headers: {
      'X-APP-KEY': config.otp_app_key,
      'X-APP-NAME': config.otp_app_name,
      'X-APP-USER-ID': storedUserId,
    },
    url: config.tamil_nilam_url + '/v1/get_geom',
    data: requestData,
    success: function (geom) {
      if (geom.success) {
        var featureCollection = geom.data;
        var features = new ol.format.GeoJSON().readFeatures(featureCollection, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });

        dropdownSource.clear(); // Clear previous features
        dropdownSource.addFeatures(features); // Add new features
        dropdownLayer.setVisible(true);
        mapClickLayer.setVisible(false);
        var extent = dropdownLayer.getSource().getExtent();
        map.getView().fit(extent, { duration: 4000, maxZoom: 20, padding: [30, 30, 30, 30] });
        // Get the centroid of the highlighted area to place the marker
        if ((type === 'survey_number') && features.length > 0) {
          var centroid = ol.extent.getCenter(extent); // Get the center of the extent
          var lonlatCentroid = ol.proj.toLonLat(centroid, 'EPSG:3857'); // Convert centroid to latitude and longitude
          mapclick(null, lonlatCentroid[1], lonlatCentroid[0]); // Call mapclick with centroid coordinates
          // Set marker position
          markerSource.clear();
          marker.setGeometry(new ol.geom.Point(centroid));
          markerSource.addFeature(marker);
        }
      } else {
        console.error(geom.message);
      }
    }
  });
}

function highlight() {
  var dist_code = $('#district').val();
  //console("distcode", dist_code);
  var taluk_code = $('#taluk').val();
  var village_code = $('#village').val();
  var survey_number = $('.survey').val().trim(); // Trim leading/trailing spaces
  var subdiv = $('#subdivision1').val().trim(); // Trim leading/trailing spaces
  var type = '';

  if (subdiv && subdiv !== 'all' && subdiv !== 'select subdivision Number') {
    type = 'sub_division_number';
  } else if (survey_number && survey_number !== 'all') {
    type = 'survey_number';
  } else if (village_code && village_code !== 'all') {
    type = 'revenue_village';
  } else if (taluk_code && taluk_code !== 'all') {
    type = 'taluk';
  } else if (dist_code && dist_code !== 'all') {
    type = 'district';
  } else {
    //console("Invalid input");
    return;
  }

  var requestData = {
    'district_code': dist_code,
    'taluk_code': taluk_code,
    'village_code': village_code,
    'survey_number': survey_number,
    'sub_division_number': subdiv,
    'case': type,
    'code_type': 'revenue'
  };

  //console("Request Data in highlight:", requestData);

  // AJAX request to get geometry data based on dropdown selection
  $.ajax({
    type: 'POST',
    headers: {
      'X-APP-KEY': config.otp_app_key,
      'X-APP-NAME': config.otp_app_name,
      'X-APP-USER-ID': storedUserId,
    },
    url: config.tamil_nilam_url + '/v1/get_geom',
    data: requestData,
    success: function (geom) {
      if (geom.success) {
        var featureCollection = geom.data;
        var features = new ol.format.GeoJSON().readFeatures(featureCollection, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });

        dropdownSource.clear(); // Clear previous features
        dropdownSource.addFeatures(features); // Add new features
        dropdownLayer.setVisible(true);
        mapClickLayer.setVisible(false);

        var extent = dropdownLayer.getSource().getExtent();
        map.getView().fit(extent, { duration: 4000, maxZoom: 20, padding: [30, 30, 30, 30] });

        // Get the centroid of the highlighted area to place the marker
        if ((type === 'sub_division_number') && features.length > 0) {
          var centroid = ol.extent.getCenter(extent); // Get the center of the extent
          var lonlatCentroid = ol.proj.toLonLat(centroid, 'EPSG:3857'); // Convert centroid to latitude and longitude
          mapclick(null, lonlatCentroid[1], lonlatCentroid[0]); // Call mapclick with centroid coordinates
          // Set marker position
          markerSource.clear();
          marker.setGeometry(new ol.geom.Point(centroid));
          markerSource.addFeature(marker);
        }
      } else {
        console.error(geom.message);
      }
    }
  });
}

function tranformProj(obj) {
  return ol.proj.transform(obj.coordinate, 'EPSG:3857', 'EPSG:4326');
}

$("#getOfficial").click(function () {
  // Retrieve the user role from localStorage
  var userRole = localStorage.getItem('role');

  // Check if the user role matches the required roles
  if (userRole === 'Firka Surveyor' || userRole === 'Deputy Inspector Survey') {
    // Redirect to the official map page
    window.location.href = 'officialmap.html';
  } else {
    // Optionally, handle cases where the role doesn't match (e.g., show a warning)
    alert('You do not have permission to access this page.');
  }
});


$(document).ready(function () {
  // $('#a_register').addClass('disabled-link').removeAttr('href');
  $('button').on('click', function () {
    $('button').removeClass('b1-highlight');
    $(this).addClass('b1-highlight')
  });
});

var storedMobileNumber;
var storedusername;

// Retrieve mobile number from LOCAL STORAGE
storedMobileNumber = localStorage.getItem('mobile_number');
storedusername = localStorage.getItem('username');
// //console('Retrieved mobile number IN MAP.HTML:', storedMobileNumber);
$("#mobile_number").append(storedMobileNumber);
$("#username").append(storedusername);
// });


$(document).ready(function () {
  const $resultSearch = $('#result_search');

  function adjustHeight() {
    if ($resultSearch.prop('scrollHeight') > 341) {
      $resultSearch.css('height', '341px'); // Fix height at 341px with scroll
    } else {
      $resultSearch.css('height', 'auto'); // Adjust height to content if less than max
    }
  }

  // Initial adjustment
  adjustHeight();
});




function getExtentfromgeom(geojson_geom) {

  var geojsonFormat = new ol.format.GeoJSON();
  var geojsonSource = new ol.source.Vector();
  var features = geojsonFormat.readFeatures(geojson_geom, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857'
  });

  geojsonSource.clear();
  geojsonSource.addFeatures(features);

  var extent = geojsonSource.getExtent();
  return extent;
}
