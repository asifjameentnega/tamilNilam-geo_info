var geoServerURL = 'https://tngis.tnega.org/geoserver/wms';
var wmts_url = 'https://tngis.tnega.org/geoserver/gwc/service/wmts';
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
// View
var view = new ol.View({
    zoom: 7,
    center: [8781480.570496075, 1224732.6162325153],
    enableRotation: false,
    constrainResolution: true,
});
/* MAP */
/*******/
var map = new ol.Map({
    target: 'map',
    view,
});
// Loading Spinner
map.on('loadstart', function () {
    map.getTargetElement().classList.add('spinner');
});
map.on('loadend', function () {
    map.getTargetElement().classList.remove('spinner');
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
    visible: true,
    name: "Basemap",
});
map.addLayer(osmTile);
map.addLayer(noTile);
// Google Satellite Map
var satelliteTile = new ol.layer.Tile({
    title: 'Google Satellite',
    visible: false,
    baseLayer: true,
    name: "Basemap",
    source: new ol.source.XYZ({
        url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
    })
});
map.addLayer(satelliteTile);

// District
var district_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' admin_master' + ':' + 'administrative_boundary_district',
        'STYLES': 'district_label'
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
    //minResolution: 200,
    //maxResolution: 3000,
});
map.addLayer(district);

// Taluk
var taluk_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' admin_master' + ':' + 'administrative_boundary_taluk',
        'STYLES': 'taluk_name',
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
    //minResolution: 30,
    //maxResolution: 200,
});
map.addLayer(taluk);
// Revenue Village
var village_master_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' admin_master' + ':' + 'administrative_boundary_revenue_village',
        'STYLES': 'rvill_name',
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
    /*minResolution: 1,
    maxResolution: 30,*/
});
map.addLayer(village_master);

var urban_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' land_information_system' + ':' + 'semmencheri_town',
        'STYLES': '',
    },
    serverType: 'geoserver'
});
var urban = new ol.layer.Tile({
    title: 'Urban',
    type: 'wms',
    source: urban_source,
    name: "Urban",
    visible: true,
    displayInLayerSwitcher: false,
    /*minResolution: 1,
    maxResolution: 30,*/
});
map.addLayer(urban);

var fmb_master_wmts_source = new ol.source.WMTS({
    url: wmts_url,
    layer: 'fmb:fmb',
    matrixSet: 'EPSG:4326',
    format: 'image/png',
    projection: projection,
    tileGrid: wmtstilegrid
});
var fmb_master_wmts = new ol.layer.Tile({
    title: 'FMB Master',
    source: fmb_master_wmts_source,
    name: "fmb_master_wmts",
    visible: false,
    displayInLayerSwitcher: false,
});
map.addLayer(fmb_master_wmts);


// fmb_survey_wms
var fmb_survey_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' fmb' + ':' + 'cadastral',
    },
    serverType: 'geoserver'
});
var fmb_survey = new ol.layer.Tile({
    title: 'Cadastral',
    type: 'wms',
    source: fmb_survey_source,
    name: "Cadastral",
    visible: false,
    displayInLayerSwitcher: false,
});
map.addLayer(fmb_survey);
//fmb survey master wmts
var fmb_survey_wmts_source = new ol.source.WMTS({
    url: wmts_url,
    layer: 'fmb:cadastral',
    matrixSet: 'EPSG:4326',
    format: 'image/png',
    projection: projection,
    tileGrid: new ol.tilegrid.WMTS({
        origin: ol.extent.getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds,
        extent: [76.89947509765625, 8.23156452178955, 80.23233795166016, 13.329351425170898]
    })
});
var fmb_survey_wmts = new ol.layer.Tile({
    title: 'Cadasatral ',
    source: fmb_survey_wmts_source,
    name: "fmb_survey_wmts",
    visible: true,
    displayInLayerSwitcher: false,
});
map.addLayer(fmb_survey_wmts);
// fmb_subdivision_wms
var fmb_subdivision_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' fmb' + ':' + 'fmb_new_subdivision_master',
    },
    serverType: 'geoserver'
});
var fmb_subdivision = new ol.layer.Tile({
    title: 'FMB subdivision',
    type: 'wms',
    source: fmb_subdivision_source,
    name: "FMB_Subdivision",
    visible: false,
    displayInLayerSwitcher: false,
});
map.addLayer(fmb_subdivision);
//fmb subdivision master wmts
var fmb_subdivision_wmts_source = new ol.source.WMTS({
    url: wmts_url,
    layer: 'fmb:fmb_new_subdivision_master',
    matrixSet: 'EPSG:4326',
    format: 'image/png',
    projection: projection,
    tileGrid: new ol.tilegrid.WMTS({
        origin: ol.extent.getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds,
        extent: [76.89948075000007, 8.231564608000042, 80.23194318800006, 13.329351417000055]
    })
});
var fmb_subdivision_wmts = new ol.layer.Tile({
    title: 'FMB subdivision ',
    source: fmb_subdivision_wmts_source,
    name: "fmb_subdivision_wmts",
    visible: true,
    displayInLayerSwitcher: false,
});
map.addLayer(fmb_subdivision_wmts);


// ZoomIn Control
$('#zoomIn').on('click', function () {
    map.getView().animate({
        zoom: map.getView().getZoom() + 1,
        duration: 250
    })
});
// ZoomOut Control
$('#zoomOut').on('click', function () {
    map.getView().animate({
        zoom: map.getView().getZoom() - 1,
        duration: 250
    })
});
$('#switch_layer').on('click', function () {
    $('#switch_layer').toggleClass('base_map_switch_active');
    if (osmTile.getVisible()) {
        osmTile.setVisible(false)
        satelliteTile.setVisible(true);
    }
    else {

        satelliteTile.setVisible(false);
        osmTile.setVisible(true)
    }
});
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

/**
 * This is the layer for plotting nearest 5 features into map
 */
const nearest_feature_source = new ol.source.Vector();
const nearest_feature_layer = new ol.layer.Vector({
    source: nearest_feature_source,
    visible: false,
    style: new ol.style.Style({
        image: new ol.style.Icon({
            src: "assets/img/nearme_marker.png",
            scale: 0.17,
        }),
        text: new ol.style.Text({
            text: name.toString(),
            font: '12px Calibri,sans-serif',
            fill: new ol.style.Fill({ color: '#000' }),
            stroke: new ol.style.Stroke({ color: '#fff', width: 2 }),
            offsetY: -15
        })
    })
});
map.addLayer(nearest_feature_layer);

/**
 * Converts from EPSG:3857 to EPSG:4326
 * @param "Array containing Longitude and Latitude from the click Event" 
 * @returns "Array containing converted Longitude and Latitude"
 */
function tranformProj(obj) {
    return ol.proj.transform(obj.coordinate, 'EPSG:3857', 'EPSG:4326');
}

/**
 * Converts from EPSG:4326 to EPSG:3857
 * @param "Array containing Longitude and Latitude from the click Event" 
 * @returns "Array containing converted Longitude and Latitude"
 */
function tranformToMapProj(obj) {
    return ol.proj.transform(obj.coordinate, 'EPSG:4326', 'EPSG:3857');
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

function clearRelatedFacilityData() {
    $("#offCanvas_facility_name").empty();
    $("#nearby_facility_list_parent").empty();
    var myOffcanvas = document.getElementById('facilitiesCanvas');
    var facilitiesOffCanvas = new bootstrap.Offcanvas(myOffcanvas);
    facilitiesOffCanvas.hide();
    clearVectorSourceData();
}

function clearVectorSourceData() {
    marker.getGeometry().setCoordinates([]);
    nearest_feature_source.clear();
}

map.on('singleclick', function (evt) {
    console.log(evt);
    getFeatureData(evt);
    $('#result_search').addClass('d-none');
});
/*var geolocation_details = JSON.parse(window.localStorage.getItem('geolocation'));
var lat = geolocation_details.latitude;
var long = geolocation_details.longitude;

map.dispatchEvent({    //        
  type: 'singleclick',
  pixel: [lat, long],
});*/

function getFeatureData(evt) {
    // Converting from 3857 Projection to 4326 Projection
    var lonlat = tranformProj(evt);
    center(evt);
    var lon = lonlat[0];
    var lat = lonlat[1];
    slectedFacilitiesCount = 0;

    clearVectorSourceData();
    marker.getGeometry().setCoordinates(evt.coordinate);
    $.ajax({
        type: 'POST',
        headers: { 'X-APP-KEY': 'en-arukil' },
        url: 'https://tngis.tnega.org/cadastral_api/land_details/api/land_detail',
        data: {
            'type': "land_detail",
            'longitude': lon,
            'latitude': lat,
        },
        dataType: 'json',
        success: function (data, textStatus, http) {
            if (http.status == 200) {
                console.log(data[0]);
                var facilities_available_data = data[0].data;
                var juridiction = data[0].juridiction;
                //console.log(juridiction);
                $("#offCanvas_facility_name").empty();
                $("#nearby_facility_list_parent").empty();
                $("#current_facility").empty();
                $("#local_body").empty();
                $("#jurisdiction").empty();
                $("#local_body").text("(" + juridiction.local_body + ")");
                if (juridiction.local_body == "U") {
                    $("#jurisdiction").text(juridiction.Town + "," + juridiction.Zone);
                    //$("#jurisdiction").attr('data-bs-title',juridiction.Town+","+juridiction.Zone+","+juridiction.Ward);
                }
                else {
                    $("#jurisdiction").text(juridiction.District + juridiction.Taluk + juridiction.Village);
                    //$("#jurisdiction").attr('data-bs-title',juridiction.District+","+juridiction.Taluk+","+juridiction.Village);
                }
                var accordian_items = '';
                accordian_items += `
                                <div class="accordion-item">
                                    <h2 class="accordion-header">
                                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_layer" aria-expanded="false" aria-controls="flush-collapseOne">
                                            <p class="mb-0">Sy No: ${facilities_available_data.survey_number}; Sub Division: ${facilities_available_data.sub_division_number}</p>
                                        </button>
                                    </h2>
                                </div>
                            `;
                $("#nearby_facility_list_parent").append(accordian_items);
                var myOffcanvas = document.getElementById('facilitiesCanvas');
                var facilitiesOffCanvas = new bootstrap.Offcanvas(myOffcanvas);
                facilitiesOffCanvas.show();
                $('body').addClass('showHalfMap');
            }
        }, error: function (xhr, ajaxOptions, thrownError) {
            if (xhr.status == 404) {
                console.log("Error");
            }
        }
    })
}


const generateLink = (coordinates) => {
    let link = "https://www.google.com/maps/dir/?api=1&origin=";
    coordinates.forEach((coordinate, index) => {
        if (index === 0) {
            link += `${coordinate[1]},${coordinate[0]}`;
        } else {
            link += `&destination=${coordinate[1]},${coordinate[0]}`;
        }
    });
    return link;
};

function create_feature(obj, layer_code) {
    var transformed_coordinates = tranformToMapProj({ "coordinate": [obj.longitude, obj.latitude] });
    return new ol.Feature({
        geometry: new ol.geom.Point(transformed_coordinates),
        name: obj.label,
        id: layer_code + '_' + obj.object_id
    });
}
//get mis data for layerid objectid
function getmisdata(layer_id, object_id, lat, long) {
    map.setView(
        new ol.View({
            center: ol.proj.fromLonLat([long.toFixed(6), lat.toFixed(6)]),
            zoom: 14
        }));
    $('.mis_name').text('');
    $('.mis_desig').text('');
    $('.mis_addr').text('');
    $('.mis_mobile').text('');
    $('.mis_email').text('');
    $('.mis_open_time').text('');
    $('.mis_close_time').text('');
    $('.mis_services_offered').text('');
    $('.mis_photo').attr('src', '');
    var user_details = JSON.parse(window.localStorage.getItem('user_details'));
    var session_id = window.localStorage.getItem('session_id');
    var user_id = user_details.user_id;
    $.ajax({
        type: 'POST',
        headers: { 'X-APP-KEY': 'en-arukil' },
        url: 'https://tngis.tnega.org/en_arukil_api/api/getmis',
        data: {
            'type': "getmis",
            'layer_id': layer_id,
            'object_id': object_id,
            'session_id': session_id,
            'user_id': user_id,
        },
        dataType: 'json',
        success: function (data, textStatus, http) {
            if (data === undefined || data == '' || data == null) {
                $('.mis_name').text('To be Updated');
                $('.mis_desig').text('To be Updated');
                $('.mis_addr').text('To be Updated');
                $('.mis_mobile').text('To be Updated');
                $('.mis_email').text('To be Updated');
                $('.mis_open_time').text('10');
                $('.mis_close_time').text('05');
                $('.mis_services_offered').text('To be Updated');
                $('.mis_photo').attr('src', 'https://tngis.tnega.org/en_arukil/assets/img/no-preview-available.png');
            }
            else {
                var session_id = data[0].session_id;
                if (window.localStorage.getItem('session_id') == null || window.localStorage.getItem('session_id') == '') {
                    window.localStorage.setItem('session_id', session_id);
                }
                var mis_data = data[0].data;
                $('.mis_name').text(mis_data['name'] ? mis_data['name'] : 'To be Updated');
                $('.mis_desig').text(mis_data['designation'] ? mis_data['designation'] : 'To be Updated');
                var address = '';
                if (mis_data['doorno'] != '' || mis_data['doorno'] != null) {
                    address += mis_data['doorno'] ? mis_data['doorno'] + ',' : ''
                }
                if (mis_data['building'] != '' || mis_data['building'] != null) {
                    address += mis_data['building'] ? mis_data['building'] + ',' : ''
                }
                if (mis_data['street'] != '' || mis_data['street'] != null) {
                    address += mis_data['street'] ? mis_data['street'] + ',' : ''
                }
                if (mis_data['addr1'] != '' || mis_data['addr1'] != null) {
                    address += mis_data['addr1'] ? mis_data['addr1'] : 'To be Updated'
                }
                if (mis_data['addr2'] != '' || mis_data['addr2'] != null) {
                    address += mis_data['addr2'] ? mis_data['addr2'] + ',' : ''
                }
                if (mis_data['pincode'] != '' || mis_data['pincode'] != null) {
                    address += mis_data['pincode'] ? mis_data['pincode'] + ',' : ''
                }
                if (mis_data['area'] != '' || mis_data['area'] != null) {
                    address += mis_data['area'] ? mis_data['area'] + ',' : ''
                }
                if (mis_data['locality'] != '' || mis_data['locality'] != null) {
                    address += mis_data['locality'] ? mis_data['locality'] + ',' : ''
                }
                if (mis_data['villageward'] != '' || mis_data['villageward'] != null) {
                    address += mis_data['villageward'] ? mis_data['villageward'] + ',' : ''
                }
                if (mis_data['taluktown'] != '' || mis_data['taluktown'] != null) {
                    address += mis_data['taluktown'] ? mis_data['taluktown'] + ',' : ''
                }
                if (mis_data['district'] != '' || mis_data['district'] != null) {
                    address += mis_data['district'] ? mis_data['district'] + ',' : ''
                }
                $('.mis_addr').text(address);
                $('.mis_mobile').text(mis_data['mobileno'] ? mis_data['mobileno'] : 'To be Updated');
                $('.mis_mobile').attr('href', 'tel:' + mis_data['mobileno'] + '');
                $('.mis_email').text(mis_data['email'] ? mis_data['email'] : 'To be Updated');
                $('.mis_email').attr('href', 'mailto:' + mis_data['email']);
                $('.mis_email').attr('target', '_blank');
                $('.mis_open_time').text(mis_data['open_time'] ? mis_data['open_time'] : '10');
                $('.mis_close_time').text(mis_data['close_time'] ? mis_data['close_time'] : '5');
                $('.mis_services_offered').text(mis_data['service_offered'] ? mis_data['service_offered'] : 'To be Updated');
                if (mis_data['photo_path'] == '' || mis_data['photo_path'] == null) {
                    $('.mis_photo').attr('src', 'https://tngis.tnega.org/en_arukil/assets/img/no-preview-available.png');
                }
                else {
                    $('.mis_photo').attr('src', mis_data['photo_path']);
                }
            }
        }
    });
}