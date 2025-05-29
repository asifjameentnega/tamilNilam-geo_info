var geoServerURL = 'https://tngis.tnega.org/geoserver/wms';
// var geoServerURL = 'http://192.168.4.247:8080/geoserver/wms';
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
var ctrl = new ol.control.Status();
// map.addControl(ctrl);

// Show information on each frame
map.on('postrender', function (e) {
    // console.log(e)
    var c = map.getView().getCenter();
    ctrl.status({
        center: [Math.round(c[0]), Math.round(c[1])],
        lonlat: ol.coordinate.toStringHDMS(ol.proj.toLonLat(c)),
        zoom: map.getView().getZoom(),
        resolution: map.getView().getResolution().toFixed(4),
        angle: Math.round(map.getView().getRotation() * 180 / Math.PI * 100) / 100,
        size: map.getSize(),
        animate: e.frameState.animate
    });
});
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
            scale: 0.2,
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
    facilitiesOffCanvas.hide();
    clearVectorSourceData();
}

function clearVectorSourceData() {
    marker.getGeometry().setCoordinates([]);
    nearest_feature_source.clear();
}

map.on('singleclick', function (evt) {
    getFeatureData(evt);
});

function getFeatureData(evt) {
    // Converting from 3857 Projection to 4326 Projection
    var lonlat = tranformProj(evt);
    center(evt);
    var lon = lonlat[0];
    var lat = lonlat[1];
    slectedFacilitiesCount = 0;
    selectedLayerId = [];
    $('#available_layers span').each(function () {
        if ($(this).hasClass('depActive')) {
            slectedFacilitiesCount += 1;
            // console.log($(this).data('layer-code'));
            var selected_facility_obj = { "layer_code": $(this).data('layer-code'), "priority_order": $(this).data('priority-order') };
            selectedLayerId.push(selected_facility_obj);
        }
    });
    if (slectedFacilitiesCount === 0) {
        clearRelatedFacilityData();
        alert("Please Select Atleast 1 Facility to find the nearest");
        return;
    }
    if (selectedLayerId.length > 0) {
        clearVectorSourceData();
        marker.getGeometry().setCoordinates(evt.coordinate);
        var user_details = JSON.parse(window.localStorage.getItem('user_details'));
        var user_id = user_details.user_id;
        $.ajax({
            type: 'POST',
            headers: { 'X-APP-KEY': 'en-arukil' },
            url: 'https://tngis.tnega.org/en_arukil_api/api/nearest',
            data: {
                'user_id': user_id,
                'type': "nearest",
                'longitude': lon,
                'latitude': lat,
                'selected_facilities': JSON.stringify(selectedLayerId)
            },
            dataType: 'json',
            success: function (data, textStatus, http) {
                if (http.status == 200) {
                    console.log(data[0]);
                    var facilities_available_data = data[0].data;
                    $("#offCanvas_facility_name").empty();
                    $("#nearby_facility_list_parent").empty();
                    var accordian_items = '';
                    for (const layer_code in facilities_available_data) {
                        var layer_display_name = $(`#layer_${layer_code}`).data("layer-display-name");
                        var layer_display_image_url = $(`#layer_${layer_code}`).data("display-image-url");
                        var layer_display_image_name = $(`#layer_${layer_code}`).data("display-image-name");
                        // Title
                        $("#offCanvas_facility_name").append(`<img src="${layer_display_image_url}/${layer_display_image_name}" alt="${layer_display_name}" class="depicons">${layer_display_name}`);
                        facilities_data = facilities_available_data[layer_code];
                        var features = [];
                        facilities_data.forEach(function (facility_data) {
                            var feature = create_feature(facility_data, layer_code)
                            features.push(feature);
                            var coordinates = [
                                [lon, lat],
                                [facility_data.longitude, facility_data.latitude]
                            ];
                            var direction = generateLink(coordinates);
                            // Accordian ITEMS
                            accordian_items += `
                                <div class="accordion-item">
                                    <h2 class="accordion-header">
                                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
                                            <p class="mb-0">${facility_data.label}</p>
                                            <span class="ml-auto">
                                                <a href="#" class="font12 deco-none">${facility_data.distance}${facility_data.distance_unit}</a>
                                                <a href="${direction}" target="__blank" class="px-1"><img src="assets/img/gmap.png" alt="map-marker" class="baseicon"></a>
                                            </span>
                                        </button>
                                    </h2>
                                </div>
                            `;
                        });
                        nearest_feature_source.addFeatures(features);
                    }
                    map.getView().fit(nearest_feature_layer.getSource().getExtent(), map.getSize(),{duration: 3000,maxZoom:8});
                    nearest_feature_layer.setVisible(true);
                    $("#nearby_facility_list_parent").append(accordian_items);
                    facilitiesOffCanvas.show();
                }
            }, error: function (xhr, ajaxOptions, thrownError) {
                if (xhr.status == 404) {
                    console.log("Error");
                }
            }
        })
    }
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