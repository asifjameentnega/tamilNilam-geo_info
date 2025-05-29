var geoServerURL = 'https://tngis.tnega.org/geoserver/wms';
var wmts_url = 'https://tngis.tnega.org/geoserver/gwc/service/wmts';

//var geoServerURL = 'http://localhost:8080/geoserver/wms';
const projection = ol.proj.get('EPSG:4326');
const projectionExtent = projection.getExtent();
const tileSizePixels = 256;
const tileSizeMtrs = ol.extent.getWidth(projectionExtent) / tileSizePixels;
const matrixIds = new Array(22);
var resolutions = new Array(22);
for (var z = 0; z < 22; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = tileSizeMtrs / Math.pow(2, z+1);
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
map.addLayer(district);
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
    layer:'land_detalis:land_details_cadastral',
    matrixSet: 'EPSG:4326',
    format: 'image/png',
    projection: projection,
    tileGrid: new ol.tilegrid.WMTS({
        origin: ol.extent.getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds,
        extent: [76.35889434814453, 8.079532623291016,80.34642028808594, 13.568115234375]
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
    layer:'land_detalis:land_details_fmb',
    matrixSet: 'EPSG:4326',
    format: 'image/png',
    projection: projection,
    tileGrid: new ol.tilegrid.WMTS({
        origin: ol.extent.getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds,
        extent: [76.35889434814453, 8.079546928405762,80.34642028808594, 13.568115234375]
    })
});
var fmb_subdivision_wmts = new ol.layer.Tile({
    title: 'Subdivision Boundry',
    source: fmb_subdivision_wmts_source,
    name: "fmb_subdivision_wmts",
    visible: true,
    displayInLayerSwitcher: false,
});
map.addLayer(fmb_subdivision_wmts);

map.addLayer(village_master);
map.addLayer(taluk);

var roadnetwork = new ol.layer.Group(
{
    title: 'Cadastral',
    fold: 'close',
    openInLayerSwitcher: true,
    layers: [fmb_subdivision_wmts, fmb_survey_wmts,village_master, taluk, district]
});
map.addLayer(roadnetwork);
var tog_flag = 0;
//UI for toggle on and off different layers
var layerSwitcher = new ol.control.LayerSwitcher({
  activationMode: 'click',
  startActive: false,
  groupSelectStyle: 'children'
});
map.addControl(layerSwitcher);
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
    displayInLayerSwitcher: false,
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
    //$(".btn-close").trigger('click')
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
            $('.service_div').removeClass('d-none')
            $('.service_error_div').addClass('d-none')
            $('#district_code').val(response.data.district_code)
            $('#taluk_code').val(response.data.taluk_code)
            $('#village_code').val(response.data.village_code)
            $('#village_lgd').val(response.data.lgd_village_code)
            $('#survey').val(response.data.survey_number)
            $('#subdivision').val(response.data.sub_division)
            $('#latitude').val(latitude)
            $('#longitude').val(longitude)
            $('.tnservices').removeClass('d-none')
            //$('#survey_txt').text(response.data.survey_number)
            $('#sur_suv_dt').removeClass('d-none');
            if(response.data.sub_division != null) {  $('#survey_subdivision').text('('+response.data.survey_number+' / '+response.data.sub_division+')') } else { $('#survey_subdivision').text('('+response.data.survey_number+' / -)'); }
            /*var myOffcanvas = document.getElementById('land_info_canvas');
            var user_info_canvas = new bootstrap.Offcanvas(myOffcanvas);
            user_info_canvas.show();
            $('body').addClass('showHalfMap');*/
            if(response.extent)
            {
                var zoom_extent = response.extent;
                zoom_extent = Array.from(zoom_extent.split(','), Number);
                zoom_extent = ol.proj.transformExtent(zoom_extent, ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
                map.getView().fit(zoom_extent, map.getSize());
            }

        },
        error: function (data, textStatus, http) {
            /*$(".list_of_faclities_close").trigger('click')
            Swal.fire({
                icon: 'error',
                title: '',
                text: data.responseJSON.message,
            }).then(() => {
                //marker.getGeometry().setCoordinates([]);
                $('.tnservices').addClass('d-none')
            });*/
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
                text: data.responseJSON.message,
                showConfirmButton: true
            })
            $('#sur_suv_dt').addClass('d-none')
            $('.service_div').addClass('d-none')
            $('.service_error_div').removeClass('d-none')
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
        $('body').addClass('showHalfMap');
        var myOffcanvas = document.getElementById('land_info_canvas');
        var user_info_canvas = new bootstrap.Offcanvas(myOffcanvas);
        user_info_canvas.show();
      //$('#district').text(response[0].data.district_name)
      if(response[0].data.town_panchayat_name) {  $('#type').text('(District | Town Panchayat)'); $('#value').text(response[0].data.district_name+' | '+response[0].data.town_panchayat_name)}
      if(response[0].data.corporation_name) {  $('#type').text('(District | Corportaion)'); $('#value').text(response[0].data.district_name+' | '+response[0].data.corporation_name)}
      if(response[0].data.municipality_name) {  $('#type').text('(District | Municipality)'); $('#value').text(response[0].data.district_name+' | '+response[0].data.municipality_name)}
      if(response[0].data.taluk_name) {  
        $('#type').text('(District | Taluk'); 
        $('#value').text(response[0].data.district_name+' | '+response[0].data.taluk_name); 
        if(response[0].data.revenue_village_name) { 
            $('#type').append(' | Village)'); 
            $('#value').append(' | '+response[0].data.revenue_village_name) 
        } else { 
            $('#type').append(')'); 
        }
    }

    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        $(".list_of_faclities_close").trigger('click')
      // Handle request failure
        if(jqXHR.responseJSON[0])
        {
            Swal.fire({
                icon: "error",
                title: jqXHR.responseJSON[0].message,
                showConfirmButton: false,
                timer: 2000
            })
        }

      
    });
});
$('#a_register').on('click',function(){
    $('#service_name').val('a_register')
    $('#patta_number_enter').attr('disabled',true)
    $('#post_tn_form').submit();
})
$('#tslr_service').on('click',function(){
    $('#service_name').val('tslr_service')
    $('#patta_number_enter').attr('disabled',true)
    $('#post_tn_form').submit();
})
$('#fmb_service').on('click',function(){
    $('#service_name').val('fmb_service')
    $('#patta_number_enter').attr('disabled',true)
    $('#post_tn_form').submit();
})
$('#patta_service').on('click',function(){
    $('#service_name').val('patta_chitta')
    $('#patta_number_enter').attr('disabled',true)
    $('#post_tn_form').submit();
})
$('#patta_search_service').on('click',function(){
    $('#othersModalPopup').modal('show');
})
$('#search_patta_number').on('click',function(){
    var patta_number = $('#patta_number_search').val()
    if(patta_number)
    {
       $('#patta_number_enter').val(patta_number);
       $('#patta_number_enter').attr('disabled',false)
       $('#service_name').val('search_by_patta')
       $('#post_tn_form').submit();
    }
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
    source: markerSource,
    displayInLayerSwitcher: false,
});
map.addLayer(markerLayer);
