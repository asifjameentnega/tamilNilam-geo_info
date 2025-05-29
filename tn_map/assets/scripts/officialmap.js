var geoServerURL = 'https://tngis.tnega.org/geoserver/wms';
var wmts_url = 'https://tngis.tnega.org/geoserver/gwc/service/wmts';
var isMeasureActive = false; // flag to check if measurement function is active
console.log("measureacive1",isMeasureActive);

$(document).on({
  ajaxStart: function () {
    // $("body").addClass("user_loading");
    showSpinner();
  },
  ajaxStop: function () {
    // $("body").removeClass("user_loading");
    hideSpinner();  
  },
});

// Function to show spinner
function showSpinner() {
  // Show spinner
  $("#spinner").show();
}

// Function to hide spinner
function hideSpinner() {
  // Hide spinner
  $("#spinner").hide();
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
var district_source = new ol.source.TileWMS({
  // TODO: Change URL
  url: geoServerURL,
  params: {
    'LAYERS': 'generic_viewer' + ':' + 'land_details_districts',
  },
  serverType: 'geoserver'
});
const district = new ol.layer.Tile({
  title: 'District',
  type: 'wms',
  source: district_source,
  name: "District",
  visible: true,
  displayInLayerSwitcher: false,
  minResolution: 200,
  maxResolution: 3000,
});

setTimeout(function () {
  // map.addLayer(district);
  
}, 5000);
// Taluk
var taluk_source = new ol.source.TileWMS({
  url: geoServerURL,
  params: {
    'LAYERS': 'generic_viewer' + ':' + 'taluks',
    //'STYLES': 'taluk_name',
  },
  serverType: 'geoserver'
});
const taluk = new ol.layer.Tile({
  title: 'Taluk',
  type: 'wms',
  source: taluk_source,
  name: "Taluk",
  visible: true,
  displayInLayerSwitcher: false,
  minResolution: 30,
  maxResolution: 200,
});
// Revenue Village
var village_master_source = new ol.source.TileWMS({
  url: geoServerURL,
  params: {
    'LAYERS': 'generic_viewer' + ':' + 'revenue_villages',
    //'STYLES': 'rvill_name',
  },
  serverType: 'geoserver'
});
var village_master = new ol.layer.Tile({
  title: 'Village Master',
  type: 'wms',
  source: village_master_source,
  name: "Village",
  visible: true,
  displayInLayerSwitcher: false,
  minResolution: 1,
  maxResolution: 30,
});

//fmb survey master wmts
var fmb_survey_wmts_source = new ol.source.WMTS({
  url: wmts_url,
  layer: 'land_detalis:land_details_cadastral',
  matrixSet: 'EPSG:4326',
  format: 'image/png',
  projection: projection,
  tileGrid: new ol.tilegrid.WMTS({
    origin: ol.extent.getTopLeft(projectionExtent),
    resolutions: resolutions,
    matrixIds: matrixIds,
    extent: [76.35889434814453, 8.079532623291016, 80.34642028808594, 13.568115234375]
  })
});
var fmb_survey_wmts = new ol.layer.Tile({
  title: 'Cadasatral Boundry',
  source: fmb_survey_wmts_source,
  name: "fmb_survey_wmts",
  visible: true,
  displayInLayerSwitcher: false,
});
map.addLayer(fmb_survey_wmts);

//fmb subdivision master wmts
var fmb_subdivision_wmts_source = new ol.source.WMTS({
  url: wmts_url,
  layer: 'land_detalis:land_details_fmb',
  matrixSet: 'EPSG:4326',
  format: 'image/png',
  projection: projection,
  tileGrid: new ol.tilegrid.WMTS({
    origin: ol.extent.getTopLeft(projectionExtent),
    resolutions: resolutions,
    matrixIds: matrixIds,
    extent: [76.35889434814453, 8.079546928405762, 80.34642028808594, 13.568115234375]
  })
});
var fmb_subdivision_wmts = new ol.layer.Tile({
  title: 'Subdivision Boundry',
  source: fmb_subdivision_wmts_source,
  name: "fmb_subdivision_wmts",
  visible: true,
  displayInLayerSwitcher: false,
});
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
map.addLayer(cadastral_xyz);

var roadnetwork = new ol.layer.Group(
  {
    title: 'Cadastral',
    fold: 'close',
    openInLayerSwitcher: false,
    displayInLayerSwitcher: false,
    layers: [fmb_subdivision_wmts, fmb_survey_wmts, village_master, taluk, district]
   
  });
  
setTimeout(function () {
  // map.addLayer(roadnetwork);

}, 5000);

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
  // style: new ol.style.Style({  
  //     image: new ol.style.Circle({
  //         radius: 7,
  //         fill: new ol.style.Fill({
  //           color: '#FFF'
  //         }),
  //         stroke: new ol.style.Stroke({
  //            color: '#FF0000',
  //            width: 2
  //         }),
  //     })
  // })
});

map.addLayer(applicantsLayer);
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
  //console.log(radius_layer.getSource().getExtent())
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

function survey_no_display(){
  if (responseData.data.sub_division != null) {
    // $('#survey_subdivision').text('(' + responseData.data.survey_number + ' / ' + responseData.data.sub_division + ')');
    $('#survey_subdivision1').text('(' + responseData.data.survey_number + ' / ' + responseData.data.sub_division + ')');
  } else {
    // $('#survey_subdivision').text('(' + responseData.data.survey_number + ' / -)');
    $('#survey_subdivision1').text('(' + responseData.data.survey_number + ' / -)');
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


map.on('singleclick', function (evt) {
  $('#patta_btn_close').click();
  if (isMeasureActive) {
    console.log("Map click disabled due to active measurement tool.");
    return; // Do nothing if measure tool is active
}
   if (localLayer.getVisible()) {
        var isInside = false;
        map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
            if (layer === localLayer) {
                isInside = true;
            }
        });
        if (!isInside) {
            console.log("Click outside the highlighted boundary is not allowed.");
            alert("Please click inside the highlighted area.");
            return;
        }
    }

    // Proceed with the rest of the logic if the click is valid
    console.log("Valid click inside the boundary.");

console.log("Map click event triggered.");
    var lonlat = tranformProj(evt);
    marker.getGeometry().setCoordinates(evt.coordinate);
    center(evt);
    console.log(lonlat[1].toFixed(6) + ' , ' + lonlat[0].toFixed(6))
    latitude = lonlat[1].toFixed(6);
    longitude = lonlat[0].toFixed(6);
  
    var form = new FormData();
    form.append("latitude", latitude);
    form.append("longitude", longitude);
    form.append("app_name", "mug@vari");
    var settings = {
      "url": config.admin_hierarchy_url,
      "method": "POST",
      "timeout": 0,
      "headers": {
        "X-APP-NAME": "mug@vari"
      },
      "dataType": "json",
      "processData": false,
      "mimeType": "multipart/form-data",
      "contentType": false,
      "data": form
    };
    $.ajax(settings).done(function (response) {
      adminresponseData = response; // Store the response data
      // console.log("adminresponseData", adminresponseData);
      let taluk_name = adminresponseData[0].data.taluk_name;
      let corporation_name = adminresponseData[0].data.corporation_name;
      let town_panchayat_name = adminresponseData[0].data.town_panchayat_name
      let municipality_name = adminresponseData[0].data.municipality_name
       
    
      let location_name = taluk_name || corporation_name || municipality_name || town_panchayat_name ;
      $('body').addClass('showHalfMap');
      var myOffcanvas = document.getElementById('land_info_canvas');
      var user_info_canvas = new bootstrap.Offcanvas(myOffcanvas);
      user_info_canvas.hide();
      localStorage.setItem('district_name', response[0].data.district_name);
  
      function setText(type, name, value) {
        $(`#${type}`).text(`(District | ${name})`);
        $(`#${value}`).text(`${response[0].data.district_name} | ${response[0].data[name]}`);
        localStorage.setItem('taluk_name', response[0].data[name]);
      }
  
      if (response[0].data.town_panchayat_name) {
        setText('type', 'town_panchayat_name', 'value', 'Town Panchayat');
        setText('type1', 'town_panchayat_name', 'value1', 'Town Panchayat');
        setText('type2', 'town_panchayat_name', 'value2', 'Town Panchayat');
      }
      if (response[0].data.corporation_name) {
        setText('type', 'corporation_name', 'value', 'Corporation');
        setText('type1', 'corporation_name', 'value1', 'Corporation');
        setText('type2', 'corporation_name', 'value2', 'Corporation');
      }
      if (response[0].data.municipality_name) {
        setText('type', 'municipality_name', 'value', 'Municipality');
        setText('type1', 'municipality_name', 'value1', 'Municipality');
        setText('type2', 'municipality_name', 'value2', 'Municipality');
      }

      if (response[0].data.type === "Forest") {
        
        Swal.fire({
          icon: 'error',
          title: '',
          text: 'This land is not in Tamil Nilam (Rural) database. You may contact the ' +location_name+' taluk office for details.',
          showConfirmButton: true
        });
      }
  
      if (response[0].data.taluk_name) {
        $('#type').text('(District | Taluk');
        $('#value').text(`${response[0].data.district_name} | ${response[0].data.taluk_name}`);
        $('#type1').text('(District | Taluk');
        $('#value1').text(`${response[0].data.district_name} | ${response[0].data.taluk_name}`);
        $('#type2').text('(District | Taluk');
        $('#value2').text(`${response[0].data.district_name} | ${response[0].data.taluk_name}`);
        localStorage.setItem('taluk_name', response[0].data.taluk_name);
  
        if (response[0].data.revenue_village_name) {
          $('#type').append(' | Village)');
          $('#value').append(` | ${response[0].data.revenue_village_name}`);
          $('#type1').append(' | Village)');
          $('#value1').append(` | ${response[0].data.revenue_village_name}`);
          $('#type2').append(' | Village)');
          $('#value2').append(` | ${response[0].data.revenue_village_name}`);
          localStorage.setItem('village_name', response[0].data.revenue_village_name);
        } else {
          $('#type').append(')');
          $('#type1').append(')');
          $('#type2').append(')');
        }
      }
     
        // After the admin hierarchy call, make the call to get land details by coordinates
        $.ajax({
          url: config.api_url,
          method: 'POST',
          headers: { 'X-APP-KEY': config.app_key, 'X-APP-NAME': config.app_name },
          data: {
            'latitude': latitude,
            'longitude': longitude
          },
          dataType: 'json',
          success: function (response) {
            responseData = response; // Store the response data
      
            if (response.success != 2) {
              // console.log("get details by coordinates", response.data);
              $('#location_details').show();
              $('#location_details1').show();
              $('#location_details2').show();
              $('.service_div').removeClass('d-none');
              $('.service_error_div').addClass('d-none');
              $('#district_code').val(response.data.district_code);
              $('#taluk_code').val(response.data.taluk_code);
              $('#village_code').val(response.data.village_code);
              $('#village_lgd').val(response.data.lgd_village_code);
              $('#survey').val(response.data.survey_number);
              $('#subdivision').val(response.data.sub_division);
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
              

              var geojson_geom = JSON.parse(response.data.geojson_geom);
              var features = new ol.format.GeoJSON().readFeatures(geojson_geom, {
                  featureProjection: 'EPSG:3857'
              });

              mapClickSource.clear(); // Clear previous features
              mapClickSource.addFeatures(features); // Add new features
                // Update visibility
                mapClickLayer.setVisible(true);
                dropdownLayer.setVisible(true);

              var extent = mapClickLayer.getSource().getExtent();
              map.getView().fit(extent, { duration: 1000 });
      
         
      
              $('#sur_suv_dt').removeClass('d-none');
              $('#sur_suv_dt1').removeClass('d-none');

              if (response.data.sub_division != null) {
                $('#survey_subdivision').text('(' + response.data.survey_number + ' / ' + response.data.sub_division + ')');
                // $('#survey_subdivision1').text('(' + responseData.data.survey_number + ' / ' + responseData.data.sub_division + ')');
              } else {
                $('#survey_subdivision').text('(' + response.data.survey_number + ' / -)');
                // $('#survey_subdivision1').text('(' + responseData.data.survey_number + ' / -)');
              }

              survey_no_display();


           
      
              if (response.extent) {
                // var zoom_extent = response.extent;
                // zoom_extent = Array.from(zoom_extent.split(','), Number);
                // zoom_extent = ol.proj.transformExtent(zoom_extent, ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
                // map.getView().fit(zoom_extent, map.getSize());
                var zoom_extent = response.extent;
                zoom_extent = Array.from(zoom_extent.split(','), Number);
                zoom_extent = ol.proj.transformExtent(zoom_extent, ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
            
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
                text: 'Survey Number and Subdivision Details Not available in map.  Please contact the Revenue Surveyor in' +location_name+' taluk office .',
                showConfirmButton: true
              });
      
              $('#sur_suv_dt').addClass('d-none');
              $('#sur_suv_dt1').addClass('d-none');
              $('.service_div').removeClass('d-none');
              $('.service_error_div').removeClass('d-none');
            }
          },
          error: function (data, textStatus, http) {
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
              text: 'Survey Number and Subdivision Details Not available in map.  Please contact the Revenue Surveyor in ' +location_name+' taluk office .',
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
  
});




$(document).ready(function() {
  let pdfBlob;

  $('#fmb_trigger').on('click', function() {
    let taluk_name = adminresponseData[0].data.taluk_name;
    let corporation_name = adminresponseData[0].data.corporation_name;
    let town_panchayat_name = adminresponseData[0].data.town_panchayat_name
    let municipality_name = adminresponseData[0].data.municipality_name
     
  
    let location_name = taluk_name || corporation_name || municipality_name || town_panchayat_name ;
    
    var canvas = document.getElementById('pdfCanvas');
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    pdfBlob = null; // Clear the stored PDF blob
    $.ajax({
      url: config.ddl_url + '/v1/encrypt',
      type: 'POST',
      headers: { 'X-APP-ID': 'te$t' },
      data: {
        districtCode: responseData.data.district_code.toString().padStart(2, '0'),
        talukCode: responseData.data.taluk_code.toString().padStart(2, '0'),
        villageCode: responseData.data.village_code.toString().padStart(3, '0'),
        surveyNumber: responseData.data.survey_number,
        subdivisionNumber: responseData.data.sub_division ? responseData.data.sub_division.toString() : '-',
        type: "rural"
      },
      xhrFields: {
        responseType: 'blob' // Important to handle binary data
      },
      success: function(response) {
        var reader = new FileReader();
        reader.onload = function() {
          try {
            var jsonResponse = JSON.parse(reader.result);
            // console.log(jsonResponse);??
            if (jsonResponse.status !== 1 && jsonResponse.message) {
              alert(jsonResponse.message);
              // console.log(jsonResponse.message);
              return;
            }
          } catch (e) {
            // If parsing fails, it means it's not a JSON error message
          }

          // console.log("PDF file received");

          // Clear the previous PDF data
          var canvas = document.getElementById('pdfCanvas');
          var context = canvas.getContext('2d');
          context.clearRect(0, 0, canvas.width, canvas.height);

          // Create a blob URL from the binary PDF data
          pdfBlob = response;
          var url = URL.createObjectURL(pdfBlob);

          // Use PDF.js to render the PDF
          var loadingTask = pdfjsLib.getDocument(url);
          loadingTask.promise.then(function(pdf) {
            // console.log('PDF loaded');

            // Fetch the first page
            var pageNumber = 1;
            pdf.getPage(pageNumber).then(function(page) {
              // console.log('Page loaded');

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
              renderTask.promise.then(function() {
                // console.log('Page rendered');
              });
            });
          }, function(reason) {
            // alert('no data from NIC');
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
          });
        };
        reader.readAsText(response);
      },
      error: function(error) {
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
  });

  $('#downloadButton').on('click', function() {
    if (pdfBlob) {
      saveAs(pdfBlob, 'document.pdf');
    }
  });

  $('#close_fmb').on('click', function() {
    var canvas = document.getElementById('pdfCanvas');
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    pdfBlob = null; // Clear the stored PDF blob
    // console.log("PDF viewer reset");
  });
});



$(document).on('click','#trigger',function(){
  callTriggerFunction();

});
//   if (responseData && responseData.success != 2) {)
function callTriggerFunction() {

// $('#trigger').on('click', function () {
  if (responseData && responseData.success != 2) {
    let type = (adminresponseData[0].data.type === "Rural") ? "survey_number" : "Urban";
    $.ajax({
      url: config.send_verify_otp + '/v2/tamil_nillam_ownership',
      // url: 'https://tngis.tnega.org/generic_api/v2/tamil_nillam_ownership',
      type: 'POST',
      headers: {
        'X-APP-NAME': 'T@mi!_nill@m^&' // replace with your app name
      },
      data: {
        district_code: responseData.data.district_code.toString().padStart(2, '0'),
        taluk_code: responseData.data.taluk_code.toString().padStart(2, '0'),
        village_code: responseData.data.village_code.toString().padStart(3, '0'),
        town_code: responseData.data.village_code.toString().padStart(3, '0'),
        ward_code: responseData.data.firka_ward_number,
        block_code: responseData.data.survey_number,
        survey_number: responseData.data.survey_number,
        town_survey_number:responseData.data.sub_division ? responseData.data.sub_division.toString() : '-',
        sub_division_number: responseData.data.sub_division ? responseData.data.sub_division.toString() : '-',
        type:type,
       
        code_type: "revenue",
       search_type:"survey_number"
      },
      beforeSend: function () {
        // Show the spinner
        // $('#spinner').show();
      },
      complete: function () {
        // Hide the spinner
        // $('#spinner').hide();
      },
      success: function (data1) {
        $('#ownerContainer').empty();
        let district_name = adminresponseData[0].data.district_name;
        let taluk_name = adminresponseData[0].data.taluk_name;
        let corporation_name = adminresponseData[0].data.corporation_name;
        let town_panchayat_name = adminresponseData[0].data.town_panchayat_name
        let municipality_name = adminresponseData[0].data.municipality_name
         
        let surveyNumber = responseData.data.survey_number;
        let subDivisionNumber = responseData.data.sub_division ? responseData.data.sub_division.toString() : '-';

        let location_name = taluk_name || corporation_name || municipality_name || town_panchayat_name ;

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
        else if(data1.success === 0) {
          Swal.fire({
            icon: 'error',
            title: '',
            text: `Connection Refused from NIC`,
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

        var ownerCountRow = $('<div>').addClass('row');
        var ownerCountLabel = $('<div>').addClass('col-6').append($('<p>').addClass('mb-1 small-txt txt-orange').attr('id', 'ownerCountLabel').text(languageContent[currentLang]['ownerCountLabel']));
        var ownerCountValue = $('<div>').addClass('col-6').append($('<p>').addClass('mb-0 small-txt text-white').text(data1.data.ownership_detail.length));
        ownerCountRow.append(ownerCountLabel, ownerCountValue);
        $('#ownerContainer').append(ownerCountRow);

        data1.data.ownership_detail.forEach(function (owner, index) {
          var ownerNameRow = $('<div>').addClass('row');
          var ownerNameLabel = $('<div>').addClass('col-6').append($('<p>').addClass('mb-1 small-txt txt-orange').attr('id', 'ownerNameLabel' + index).text((index + 1) + '. ' + languageContent[currentLang]['ownerNameLabel']));
          var ownerNameValue = $('<div>').addClass('col-6').append($('<p>').addClass('mb-0 small-txt text-white').text(owner.Owner ? owner.Owner : '-'));
          ownerNameRow.append(ownerNameLabel, ownerNameValue);

          var relationAndRelativeRow = $('<div>').addClass('row');
          var relationLabel = $('<div>').addClass('col-6').append($('<p>').addClass('mb-1 small-txt txt-orange').attr('id', 'ownerRelativeLabel' + index).text((index + 1) + '. ' + languageContent[currentLang]['ownerRelativeLabel']));
          var relationValue = $('<div>').addClass('col-6').append($('<p>').addClass('mb-0 small-txt text-white').text((owner.Relative ? owner.Relative : '-') + ' - ' + (owner.Relation ? owner.Relation : '-')));
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
      },
      error: function (error) {

         let district_name = adminresponseData[0].data.district_name;
          let taluk_name = adminresponseData[0].data.taluk_name;
          let corporation_name = adminresponseData[0].data.corporation_name;
          let town_panchayat_name = adminresponseData[0].data.town_panchayat_name
          let municipality_name = adminresponseData[0].data.municipality_name
           
          let surveyNumber = responseData.data.survey_number;
          let subDivisionNumber = responseData.data.sub_division ? responseData.data.sub_division.toString() : '-';

          let location_name = taluk_name || corporation_name || municipality_name || town_panchayat_name ;
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


$(document).ready(function() {
  const $spinner = $('#spinner');
  const $pattaInfoContainer = $('#patta_info_container');
  const $pattaNumberSearch = $('#patta_number_search');
  const $searchPattaNumber = $('#search_patta_number');
  const $displayAllOnMap = $('#display_all_on_map');

  
  

  let pattaNo
  

  $searchPattaNumber.on('click', function(event) {
    // 
    
  
    event.preventDefault(); // Prevent the default form submission
    
    
    // Store survey and subdivision numbers
    pattaNo = $pattaNumberSearch.val(); 

    if (responseData && responseData.success !== 2) {
      $.ajax({
        url: config.send_verify_otp + '/v2/tamil_nillam_ownership',
        // url: 'https://tngis.tnega.org/generic_api/v2/tamil_nillam_ownership',
        type: 'POST',
        headers: {
          'X-APP-NAME': 'T@mi!_nill@m^&' // Replace with your app name
        },
        data: {
          district_code: responseData.data.district_code.toString().padStart(2, '0'),
          taluk_code: responseData.data.taluk_code.toString().padStart(2, '0'),
          village_code: responseData.data.village_code.toString().padStart(3, '0'),
          patta_number: pattaNo,
          code_type: "revenue",
          search_type: "patta_number"
        },
        beforeSend: function() {
          // $spinner.show();
        },
        complete: function() {
          // $spinner.hide();
        },
        success: function(pattaresponse) {
          // console.log(pattaresponse);
          displayResults(pattaresponse);
        },
        error: function(error) {
          console.error('Error:', error);
        }
      });
    }
    
  });
 

   function displayResults(pattaresponse) {
    let village_name = adminresponseData[0].data.revenue_village_name;

    if (pattaresponse.success === 1) {
      $displayAllOnMap.removeClass('hidden');
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
        const newItem = `
          <div class="box_wrap px-2 py-3 mb-2">
            <div class="row">
              <div class="col-4">
                <label for="inputEmail4" class="form-label txt-orange">Survey / Sub Division No</label>
              </div>
              <div class="col-3">
                <label for="inputEmail4" class="form-label text-white">${surveyNo} <span>/<span>${subdivNo}</label>
              </div>
              <div class="col-5 d-flex flex-column">
              <span class="patta_btn_details badge text-bg-primary bg-primary mb-1 px-2 py-2" data-survey="${surveyNo}" data-subdiv="${subdivNo}">
                  <i class="bi bi-file-earmark-check"></i> Details
                </span>
                <span class="patta_btn_map badge text-bg-success bgred bg-success mb-1 px-2 py-2" data-survey="${surveyNo}" data-subdiv="${subdivNo}">
                <i class="bi bi-pin-map"></i> view on map</span>
              </div>
            </div>
          </div>
        `;
        $pattaInfoContainer.append(newItem);
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
        $('#patta_btn_close').click(); // Trigger the click event
        
      }
    });
      return;
    }
  }

    // Event handler for the new button
$displayAllOnMap.on('click', function() {
   
   // Debugging: Check if variables are defined
  //  console.log('allSurveys:', allSurveys);
  //  console.log('allSubdivisions:', allSubdivisions);
   
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

  console.log('Surveys:', surveys, 'Type:', typeof surveys);
  console.log('Subdivisions:', subdivisions, 'Type:', typeof subdivisions);

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
        'X-APP-KEY': config.otp_app_key,
        'X-APP-NAME': config.otp_app_name
      },
      url: config.send_verify_otp + '/v1/get_geom', // Adjust URL if necessary
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
        // console.log('Geometry Data for survey:', survey, 'subdivision:', subdiv);
      } else if (geom.success === 0) {
        Swal.fire({
          icon: 'error',
          title: '',
          text: `This subdivision is not availbel in Map`,
          showConfirmButton: true
        }).then((result) => {
        if (result.isConfirmed) {
          $('#areg_button').click(); // Trigger the click event
        }
      });
        return;
     }else {
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

    // console.log('All geometries displayed.');
  });
}

      
      
      

  // Event delegation for dynamically added .patta_btn_details elements
   $pattaInfoContainer.on('click', '.patta_btn_details', function() {
    // survey_no_display();
   
    responseData.data.survey_number = $(this).data('survey');
    responseData.data.sub_division = $(this).data('subdiv');
     
   
    // $('#patta_btn_close').click();
    $('#othersModalPopup').modal('hide');
    $('#areg_button').addClass('add_othersModalPopup');
   
      survey_no_display();
    
    $('#trigger').click();

  });
  
  $(document).on('click', '.add_othersModalPopup', function() {
    $('#othersModalPopup').modal('show');
    
  })

  

   $pattaInfoContainer.on('click', '.patta_btn_map', function() {
   
   
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

    console.log("Request Data:", requestData);

    // AJAX request to get geometry data based on dropdown selection
    $.ajax({
        type: 'POST',
        headers: {
            'X-APP-KEY': config.otp_app_key,
            'X-APP-NAME': config.otp_app_name
        },
       
         url: config.send_verify_otp + '/v1/get_geom',
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
                // console.log('Geometry Data:', geom.data);
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



$('#patta_btn_close').on('click', function() {
  $('#areg_button').removeClass('add_othersModalPopup');
  $displayAllOnMap.addClass('hidden');
  $pattaInfoContainer.empty();
  $('#patta_number_search').val('');
  dropdownSource.clear();
  // console.log("container empty");
});


    


});



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


// <--------------------------------------------Measure & navigation------------------------------------------------------>
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement("div");
  measureTooltipElement.className = "mtooltip tooltip-measure";
  measureTooltip = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: "bottom-center",
  });
  map.addOverlay(measureTooltip);
}

function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement("div");
  helpTooltipElement.className = "mtooltip hidden";
  helpTooltip = new ol.Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: "center-left",
  });
  map.addOverlay(helpTooltip);
}
var measurementSource = new ol.source.Vector();
var measurementVectorLayer = new ol.layer.Vector({
  title: "measure",
  name: "measure",
  source: measurementSource,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: "rgba(214, 240, 110, 0.8)",
    }),
    stroke: new ol.style.Stroke({
      color: "rgba(255, 255, 0, 0.8)", // This is yellow
      lineDash: [10, 10],
      width: 4,
    }),
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({
        color: "rgba(255, 255, 0, 0.1)", // This is yellow
      }),
    }),
  }),
  displayInLayerSwitcher: false,
});
map.addLayer(measurementVectorLayer);
var measuretype;
var sketch;
var sketch1;
var draw;
var draw1;
var helpTooltipElement;
var helpTooltip;
var measureTooltipElement;
var measureTooltip;
var continuePolygonMsg = "Click to continue drawing the polygon";
var continueLineMsg = "Click to continue drawing the line";

function removeMeasureTooltip() {
  map.removeOverlay(measureTooltip);
  map.removeOverlay(helpTooltip);
  if (measureTooltipElement) {
    var elem = document.getElementsByClassName("mtooltip tooltip-static");
    for (var i = elem.length - 1; i >= 0; i--) {
      elem[i].remove();
    }
  }
}

function changeMeasurement(e) {
  measuretype = e;
  if (measuretype == "None") {
    isMeasureActive = false; // set the flag to false when measurement function is disabled
    measurementVectorLayer.getSource().clear();
    removeMeasureTooltip();
    map.removeInteraction(draw);
  } else {
    isMeasureActive = true; // set the flag to true when measurement function is enabled
    map.removeInteraction(draw);
    addInteraction();
    map.on("pointermove", pointerMoveHandler);
  }
  console.log("Measure Active:", isMeasureActive); // Log the status
}

var formatLength = function (line) {
  var length = ol.sphere.getLength(line, { projection: "EPSG:3857" });
  // var length = getLength(line);
  // var length = line.getLength({projection:'EPSG:4326'});
  var output;
  if (length > 1000) {
    output = Math.round((length / 1000) * 100) / 100 + " " + "km";
  } else {
    output = Math.round(length * 100) / 100 + " " + "m";
  }
  return output;
};
var formatArea = function (polygon) {
  // var area = getArea(polygon);
  var area = ol.sphere.getArea(polygon, { projection: "EPSG:3857" });
  // var area = polygon.getArea();
  //alert(area);
  var output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + " " + "km<sup>2</sup>";
  } else {
    output = Math.round(area * 100) / 100 + " " + "m<sup>2</sup>";
  }
  return output;
};
function addInteraction() {
  var type = measuretype;
  draw = new ol.interaction.Draw({
    source: measurementSource,
    type: type,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        // color: "rgba(244, 4, 4, 0.36)",
        color: "rgba(214, 240, 110, 0.8)",
      }),
      stroke: new ol.style.Stroke({
        // /color: "rgba(244, 4, 4, 0.8)",
        color: "rgba(255, 255, 0, 0.8)", // This is yellow
        lineDash: [10, 10],
        width: 4,
      }),
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          // color: "#ffcc33",

          color: "rgba(255, 255, 0, 0.8)", // This is yellow


        }),
      }),
    }),
  });
  map.addInteraction(draw);
  createMeasureTooltip();
  createHelpTooltip();
  var listener;
  draw.on(
    "drawstart",
    function (evt) {
      // set sketch
      // measurementVectorLayer.getSource().clear();
      sketch = evt.feature;
      var tooltipCoord = evt.coordinate;
      listener = sketch.getGeometry().on("change", function (evt) {
        var geom = evt.target;
        var output;
        if (geom instanceof ol.geom.Polygon) {
          output = formatArea(geom);
          tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof ol.geom.LineString) {
          output = formatLength(geom);
          tooltipCoord = geom.getLastCoordinate();
        }
        measureTooltipElement.innerHTML = output;
        measureTooltip.setPosition(tooltipCoord);
      });
    },
    this
  );
  draw.on(
    "drawend",
    function () {
      measureTooltipElement.className = "mtooltip tooltip-static";
      measureTooltip.setOffset([0, -7]);
      // unset sketch
      sketch = null;
      // unset tooltip so that a new one can be created
      measureTooltipElement = null;
      createMeasureTooltip();
      ol.Observable.unByKey(listener);
    },
    this
  );
}
var pointerMoveHandler = function (evt) {
  if (evt.dragging) {
    return;
  }
  var helpMsg = "Click to start drawing";
  if (sketch) {
    var geom = sketch.getGeometry();
    if (geom instanceof ol.geom.Polygon) {
      helpMsg = continuePolygonMsg;
    } else if (geom instanceof ol.geom.LineString) {
      helpMsg = continueLineMsg;
    }
  }
  helpTooltipElement.innerHTML = helpMsg;
  helpTooltip.setPosition(evt.coordinate);
  helpTooltipElement.classList.remove("hidden");
};

// $(document).ready(function() {
//   // Get the stored values for district, taluk, and village
//   const assignedDistrict = localStorage.getItem('assignedDistrict');
//   console.log("district_code from local storage",assignedDistrict);
//   const assignedTaluk = localStorage.getItem('assignedTaluk');
//   const assignedVillage = localStorage.getItem('assignedVillage');

//   // Populate the dropdowns with the assigned values
//   if (assignedDistrict) {
//       $('#district').html(`<option value="${assignedDistrict}">${assignedDistrict}</option>`);
//   }

//   if (assignedTaluk) {
//       $('#taluk').html(`<option value="${assignedTaluk}">${assignedTaluk}</option>`);
//   }

//   if (assignedVillage) {
//       $('#village').html(`<option value="${assignedVillage}">${assignedVillage}</option>`);
//   }

//   // If needed, trigger change events to cascade updates
//   $('#district').trigger('change');
//   $('#taluk').trigger('change');
// });




