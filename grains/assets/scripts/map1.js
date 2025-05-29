//var geoServerURL = 'https://tngis.tnega.org/geoserver/wms';
var geoServerURL = 'http://192.168.4.247:8080/geoserver/wms';

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
    name: "Basemap",
});
// OSM
var osmTile = new ol.layer.Tile({
    title: "OSM",
    baseLayer: true,
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
    baseLayer: true,
    name: "Basemap",
    opacity: 0.5,
    source: new ol.source.XYZ({
        url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    })
});
map.addLayer(satelliteTile);

// District
var district_source = new ol.source.TileWMS({
    // TODO: Change URL
    url: geoServerURL,
    params: {
        'LAYERS': ' admin_master' + ':' + 'administrative_boundary_district',
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
map.addLayer(district);

var tog_flag = 0;
$('#switch_layer').on('click',function(){
    if(tog_flag == 0){
        satelliteTile.setVisible(false);
        osmTile.setVisible(true);
        tog_flag = 1;
    }else{
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
    style:new ol.style.Style({
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
  var lonlat = ol. proj. toLonLat(e. coordinate);
  $("#user_long").html(lonlat[0].toFixed(6));
  $("#user_lat").html(lonlat[1].toFixed(6));
});

// Zoom in/zoom Out
document.getElementById('zoomIn').onclick = function() {
  var view = map.getView();
  var zoom = view.getZoom();
  view.setZoom(zoom + 1);
};

document.getElementById('zoomOut').onclick = function() {
  var view = map.getView();
  var zoom = view.getZoom();
  view.setZoom(zoom - 1);
};

// Error Message
function error_message(message){
  Swal.fire({
    icon: "error",
    title: message,
    showConfirmButton: false,
    timer:2000
  })
}

// Success Message
function success_message(message){
  Swal.fire({
    icon: "success",
    title: message,
    showConfirmButton: false,
    timer:2000
  })
}


function circle_current_location(longitude,latitude)//circle over current location
{
 var centerLongitudeLatitude = ol.proj.fromLonLat([longitude, latitude]);
 if (radius_layer != undefined) {
    map.removeLayer(radius_layer);
 }
 radius_layer = new ol.layer.Vector({
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

function draw_point_geo(coordinates){
    coordinates.forEach(function(coord) {
        var longitude = coord[0];
        var latitude = coord[1];
        // Create an OpenLayers feature from the coordinate
        var feature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([longitude, latitude]))
        });
        // Add the feature to the vector source
        applicantsSource.addFeature(feature);
    });
    map.getView().fit(applicantsLayer.getSource().getExtent(), {duration: 3000,maxZoom:22,padding: [170, 50, 90, 150]});
}

map.on('singleclick', function (evt) {
    $(".btn-close").trigger('click')
    var lonlat = tranformProj(evt);
    marker.getGeometry().setCoordinates(evt.coordinate);
    center(evt);
    console.log(lonlat[1].toFixed(6)+ ' , '+lonlat[0].toFixed(6))
    latitude = lonlat[1].toFixed(6);
    longitude = lonlat[0].toFixed(6);
    $.ajax
    ({
        url:config.api_url,
        method: 'POST',
        headers: { 'X-APP-KEY': config.app_key, 'X-APP-NAME': config.app_name },
        data : {
            'latitude': latitude,
            'longitude': longitude
        },
        dataType: 'json',
        success: function (response) {
            console.log(response)
            $('#district_code').val(response.data.district_code)
            $('#taluk_code').val(response.data.taluk_code)
            $('#village_code').val(response.data.village_code)
            $('#village_lgd').val(response.data.lgd_village_code)
            $('#survey').val(response.data.survey_number)
            $('#subdivision').val(response.data.sub_division)
            $('#latitude').val(latitude)
            $('#longitude').val(longitude)
            $('.tnservices').removeClass('d-none')
            $('#survey_txt').text(response.data.survey_number)
            if(response.data.sub_division != null) {  $('#subdivision_txt').text(response.data.sub_division) } else { $('#subdivision_txt').text('-'); }
            var myOffcanvas = document.getElementById('land_info_canvas');
            var user_info_canvas = new bootstrap.Offcanvas(myOffcanvas);
            user_info_canvas.show();
            $('body').addClass('showHalfMap');

        },
        error: function (data, textStatus, http) {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: data.responseJSON.message,
          }).then(() => {
             //marker.getGeometry().setCoordinates([]);
            $('.tnservices').addClass('d-none')
          });
        }
    })
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
      "dataType":"json",
      "processData": false,
      "mimeType": "multipart/form-data",
      "contentType": false,
      "data": form
    };

    $.ajax(settings).done(function (response) {
      console.log(response);
      $('#district').text(response[0].data.district_name)
      if(response[0].data.town_panchayat_name) $('#taluk').text(response[0].data.town_panchayat_name)
      if(response[0].data.corporation_name) $('#taluk').text(response[0].data.corporation_name)
      if(response[0].data.municipality_name) $('#taluk').text(response[0].data.municipality_name)
      if(response[0].data.taluk_name) $('#taluk').text(response[0].data.taluk_name)
      if(response[0].data.revenue_village_name) { $('#village').text(response[0].data.revenue_village_name); } else { $('#village_div').addClass('d-none'); }

    });
});
$('#a_register').on('click',function(){
    $('#service_name').val('a_register')
    $('#post_tn_form').submit();
})
$('#tslr_service').on('click',function(){
    $('#service_name').val('tslr_service')
    $('#post_tn_form').submit();
})
$('#fmb_service').on('click',function(){
    $('#service_name').val('fmb_service')
    $('#post_tn_form').submit();
})
$('#patta_service').on('click',function(){
    $('#service_name').val('patta_chitta')
    $('#post_tn_form').submit();
})

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
    source: markerSource
});
map.addLayer(markerLayer);
