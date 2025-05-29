//var geoServerURL = 'http://192.168.4.247:8080/geoserver/wms';
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
// View
var view = new ol.View({
    zoom: 6.9,
    center: [8781480.570496075, 1224732.6162325153],
    enableRotation: false
});
/* MAP */
/*******/
var map = new ol.Map({
    target: 'map',
    attribution: false,
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
    opacity: 0.25,
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



// FMB Master
var fmb_master_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' fmb' + ':' + 'fmb',
        'STYLES': '',
    },
    serverType: 'geoserver'
});
var fmb_master = new ol.layer.Tile({
    title: 'FMB Master',
    type: 'wms',
    source: fmb_master_source,
    name: "fmb_master",
    visible: false,
    displayInLayerSwitcher: false,
});
map.addLayer(fmb_master);

var fmb_master_wmts_source = new ol.source.WMTS({
    url: wmts_url,
    layer:'fmb:fmb',
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
    layer:'fmb:cadastral',
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
    layer:'fmb:fmb_new_subdivision_master',
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

// landtype_matched_roro
var land_type_matched_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' fmb' + ':' + 'fmb_new_matched_ror'
    },
    serverType: 'geoserver'
});
var land_type_matched = new ol.layer.Tile({
    title: 'Matched with roro',
    type: 'wms',
    source: land_type_matched_source,
    name: "land_type_matched",
    visible: false,
    displayInLayerSwitcher: false,
});
map.addLayer(land_type_matched);
// unmatched_roro
var fmb_unmatched_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' fmb' + ':' + 'fmb_new_unmatched_ror'
    },
    serverType: 'geoserver'
});
var fmb_unmatched = new ol.layer.Tile({
    title: 'UnMatched with roro',
    type: 'wms',
    source: fmb_unmatched_source,
    name: "fmb_unmatched",
    visible: false,
    displayInLayerSwitcher: false,
});
map.addLayer(fmb_unmatched);
//matched wmts
var land_type_matched_wmts_source = new ol.source.WMTS({
    url: wmts_url,
    layer:'fmb:fmb_new_matched_ror',
    matrixSet: 'EPSG:4326',
    format: 'image/png',
    projection: projection,
    tileGrid: new ol.tilegrid.WMTS({
        origin: ol.extent.getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds,
        extent: [76.89948075000007, 8.235352180000064,80.23194318800006, 13.329074329000036]
    })
});
var land_type_matched_wmts = new ol.layer.Tile({
    title: 'FMB Matched',
    source: land_type_matched_wmts_source,
    name: "land_type_matched_wmts",
    visible: false,
    displayInLayerSwitcher: false,
});
map.addLayer(land_type_matched_wmts);

//unmatched wmts
var land_type_unmatched_wmts_source = new ol.source.WMTS({
    url: wmts_url,
    layer:'fmb:fmb_new_unmatched_ror',
    matrixSet: 'EPSG:4326',
    format: 'image/png',
    projection: projection,
    tileGrid: new ol.tilegrid.WMTS({
        origin: ol.extent.getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds,
        extent: [76.90240449600003, 8.231564608000042, 80.23230597100007, 13.329351417000055]
    })
});
var land_type_unmatched_wmts = new ol.layer.Tile({
    title: 'FMB Unmatched',
    source: land_type_unmatched_wmts_source,
    name: "land_type_unmatched_wmts",
    visible: false,
    displayInLayerSwitcher: false,
});
map.addLayer(land_type_unmatched_wmts);

// hamlets wms
var hamlets_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' fmb' + ':' + 'hamlets',
    },
    serverType: 'geoserver'
});
var hamlets = new ol.layer.Tile({
    title: 'Hamlets',
    type: 'wms',
    source: hamlets_source,
    name: "Hamlets",
    visible: false,
    displayInLayerSwitcher: false,
});

//hamlets wmts
var hamlets_wmts_source = new ol.source.WMTS({
    url: wmts_url,
    layer:'fmb:hamlets',
    matrixSet: 'EPSG:4326',
    format: 'image/png',
    projection: projection,
    tileGrid: new ol.tilegrid.WMTS({
        origin: ol.extent.getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds,
        extent: [76.24100494384766 ,8.081062316894531, 80.33477020263672, 13.54409408569336]
    })
});
var hamlets_wmts = new ol.layer.Tile({
    title: 'Hamlets',
    source: hamlets_wmts_source,
    name: "hamlets_wmts",
    visible: true,
    displayInLayerSwitcher: false,
});
map.addLayer(hamlets_wmts);

// pramboku wms
var poramboku_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' fmb' + ':' + 'fmb_matched_poramboku',
    },
    serverType: 'geoserver'
});
var poramboku = new ol.layer.Tile({
    title: 'Poramboku',
    type: 'wms',
    source: poramboku_source,
    name: "poramboku",
    visible: false,
    displayInLayerSwitcher: false,
});
map.addLayer(poramboku);
//poramboku wmts
var poramboku_wmts_source = new ol.source.WMTS({
    url: wmts_url,
    layer:'fmb:fmb_matched_poramboku',
    matrixSet: 'EPSG:4326',
    format: 'image/png',
    projection: projection,
    tileGrid: new ol.tilegrid.WMTS({
        origin: ol.extent.getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds,
        extent: [77.22674840301602, 9.305460007954613, 79.72496264964332, 12.85708474455838]
    })
});
var poramboku_wmts = new ol.layer.Tile({
    title: 'Poramboku',
    source: poramboku_wmts_source,
    name: "poramboku_wmts",
    visible: false,
    displayInLayerSwitcher: false,
});
map.addLayer(poramboku_wmts);

// unmatched_roro
var unmatched_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' fmb' + ':' + 'fmb_unmatched_view',
        'STYLES': 'unmatched_with_roro',
    },
    serverType: 'geoserver'
});
var unmatched_roro = new ol.layer.Tile({
    title: 'UnMatched with roro',
    type: 'wms',
    source: unmatched_source,
    name: "unmatched_roro",
    visible: false,
    displayInLayerSwitcher: false,
});
map.addLayer(unmatched_roro);

// no_fmb_village
var no_fmb_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' fmb' + ':' + 'village_without_fmb_overall',
        //'STYLES': 'no_fmb_vill',
    },
    serverType: 'geoserver'
});
var no_fmb = new ol.layer.Tile({
    title: 'No fmb',
    type: 'wms',
    source: no_fmb_source,
    name: "no_fmb",
    visible: false,
    displayInLayerSwitcher: false,
});
map.addLayer(no_fmb);
//with fmb
var with_fmb_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' fmb' + ':' + 'village_with_fmb_overall',
        //'STYLES': 'partial_fmb',
    },
    serverType: 'geoserver'
});
var with_fmb = new ol.layer.Tile({
    title: 'with fmb',
    type: 'wms',
    source: with_fmb_source,
    name: "with_fmb",
    visible: false,
    displayInLayerSwitcher: false,
});
map.addLayer(with_fmb);
// partial_fmb
/*var partial_fmb_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' fmb' + ':' + 'partially_fmb_village',
        'STYLES': 'partial_fmb',
    },
    serverType: 'geoserver'
});
var partial_fmb = new ol.layer.Tile({
    title: 'Partial fmb',
    type: 'wms',
    source: partial_fmb_source,
    name: "partial_fmb",
    visible: false,
    displayInLayerSwitcher: false,
});
map.addLayer(partial_fmb);*/

// single_owner
var single_owner_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' fmb' + ':' + 'fmb',
        'STYLES': 'single_owner_fmb',
    },
    serverType: 'geoserver'
});
var single_owner = new ol.layer.Tile({
    title: 'Single Owner',
    type: 'wms',
    source: single_owner_source,
    name: "single_owner",
    visible: false,
    displayInLayerSwitcher: false,
});
map.addLayer(single_owner);

// multiowner
var multiowner_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' fmb' + ':' + 'fmb',
        'STYLES': 'multiowner_fmb',
    },
    serverType: 'geoserver'
});
var multiowner = new ol.layer.Tile({
    title: 'Multi Owner',
    type: 'wms',
    source: multiowner_source,
    name: "multiowner",
    visible: false,
    displayInLayerSwitcher: false,
});
map.addLayer(multiowner);


// with lgd code
var with_lgd_code_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' admin_master' + ':' + 'with_lgd_code',
        'STYLES': '',
    },
    serverType: 'geoserver'
});
var with_lgd_code = new ol.layer.Tile({
    title: 'With LGD Code',
    type: 'wms',
    source: with_lgd_code_source,
    name: "with_lgd_code",
    visible: false,
    displayInLayerSwitcher: false,
});
map.addLayer(with_lgd_code);

// with lgd code wmts
var with_lgd_code_wmts_source = new ol.source.WMTS({
    url: wmts_url,
    layer:'admin_master:with_lgd_code',
    matrixSet: 'EPSG:4326',
    format: 'image/png',
    projection: projection,
    tileGrid: new ol.tilegrid.WMTS({
        origin: ol.extent.getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds,
        extent: [76.23298306555137 ,8.077613669882195, 80.34881798479452 ,13.562842580179414]
    })
});
var with_lgd_code_wmts = new ol.layer.Tile({
    title: 'With LGD Code',
    source: with_lgd_code_wmts_source,
    name: "with_lgd_code_wmts",
    visible: false,
    displayInLayerSwitcher: true,
});
//map.addLayer(with_lgd_code_wmts);

// No lgd code
var no_lgd_code_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' admin_master' + ':' + 'no_lgd_code',
        'STYLES': '',
    },
    serverType: 'geoserver'
});
var no_lgd_code = new ol.layer.Tile({
    title: 'No LGD Code',
    type: 'wms',
    source: no_lgd_code_source,
    name: "no_lgd_code",
    visible: false,
    displayInLayerSwitcher: true,
});
//map.addLayer(no_lgd_code);

// others lgd code
var others_lgd_code_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' admin_master' + ':' + 'others_lgd_code',
        'STYLES': '',
    },
    serverType: 'geoserver'
});
var others_lgd_code = new ol.layer.Tile({
    title: 'Others LGD Code',
    type: 'wms',
    source: others_lgd_code_source,
    name: "others_lgd_code",
    visible: false,
    displayInLayerSwitcher: true,
});
//map.addLayer(others_lgd_code);

var lgdGroup = new ol.layer.Group({
    layers: [with_lgd_code_wmts,no_lgd_code,others_lgd_code],
    name: 'LGD',
    visible:true,
    displayInLayerSwitcher:true
});
map.addLayer(lgdGroup);
// with Census code
var with_census_code_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' admin_master' + ':' + 'with_census_code',
        'STYLES': '',
    },
    serverType: 'geoserver'
});
var with_census_code = new ol.layer.Tile({
    title: 'With census Code',
    type: 'wms',
    source: with_census_code_source,
    name: "with_census_code",
    visible: false,
    displayInLayerSwitcher: false,
});
map.addLayer(with_census_code);

//with census wmts
var with_census_code_wmts_source = new ol.source.WMTS({
    url: wmts_url,
    layer:'admin_master:with_census_code',
    matrixSet: 'EPSG:4326',
    format: 'image/png',
    projection: projection,
    tileGrid: new ol.tilegrid.WMTS({
        origin: ol.extent.getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds,
        extent: [76.23298306555137, 8.077672470533972,80.34881798479452, 13.562842580179414]
    })
});
var with_census_code_wmts = new ol.layer.Tile({
    title: 'With Census Code',
    source: with_census_code_wmts_source,
    name: "with_census_code_wmts",
    visible: false,
    displayInLayerSwitcher: true,
});
//map.addLayer(with_census_code_wmts);

// No census code
var no_census_code_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' admin_master' + ':' + 'no_census_code',
        'STYLES': '',
    },
    serverType: 'geoserver'
});
var no_census_code = new ol.layer.Tile({
    title: 'No census Code',
    type: 'wms',
    source: no_census_code_source,
    name: "no_census_code",
    visible: false,
    displayInLayerSwitcher: true,
});
//map.addLayer(no_census_code);

// others census code
var others_census_code_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' admin_master' + ':' + 'others_census_code',
        'STYLES': '',
    },
    serverType: 'geoserver'
});
var others_census_code = new ol.layer.Tile({
    title: 'Others census Code',
    type: 'wms',
    source: others_census_code_source,
    name: "others_census_code",
    visible: false,
    displayInLayerSwitcher: true,
});
//map.addLayer(others_census_code);
var censusGroup = new ol.layer.Group({
    layers: [with_census_code_wmts,no_census_code,others_census_code],
    name: 'Census',
    visible:true,
    displayInLayerSwitcher:true
});
map.addLayer(censusGroup);

// with Tamil Nillam code
var with_tn_code_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' admin_master' + ':' + 'with_tamil_nillam_code',
        'STYLES': '',
    },
    serverType: 'geoserver'
});
var with_tamil_nillam_code = new ol.layer.Tile({
    title: 'With Tamil Nillam Code',
    type: 'wms',
    source: with_tn_code_source,
    name: "with_tn_code",
    visible: false,
    displayInLayerSwitcher: false,
});
map.addLayer(with_tamil_nillam_code);

var with_tamil_nillam_code_wmts_source = new ol.source.WMTS({
    url: wmts_url,
    layer:'admin_master:with_tamil_nillam_code',
    matrixSet: 'EPSG:4326',
    format: 'image/png',
    projection: projection,
    tileGrid: new ol.tilegrid.WMTS({
        origin: ol.extent.getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds,
        extent: [76.23298306555137, 8.077613669882195,80.34881798479452, 13.562842580179414]
    })
});
var with_tamil_nillam_code_wmts = new ol.layer.Tile({
    title: 'With Tamil Nillam Code',
    source: with_tamil_nillam_code_wmts_source,
    name: "with_tamil_nillam_code_wmts",
    visible: false,
    displayInLayerSwitcher: true,
});
//map.addLayer(with_tamil_nillam_code_wmts);

// No Tamil Nillam code
var no_tn_code_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' admin_master' + ':' + 'no_tamil_nillam_code',
        'STYLES': '',
    },
    serverType: 'geoserver'
});
var no_tamil_nillam_code = new ol.layer.Tile({
    title: 'No Tamil Nillam Code',
    type: 'wms',
    source: no_tn_code_source,
    name: "no_tn_code",
    visible: false,
    displayInLayerSwitcher: true,
});
//map.addLayer(no_tamil_nillam_code);

// others Tamil Nillam code
var others_tn_code_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' admin_master' + ':' + 'others_tamil_nillam_code',
        'STYLES': '',
    },
    serverType: 'geoserver'
});
var others_tamil_nillam_code = new ol.layer.Tile({
    title: 'Others Tamil Nillam Code',
    type: 'wms',
    source: others_tn_code_source,
    name: "others_tn_code",
    visible: false,
    displayInLayerSwitcher: true,
});
//map.addLayer(others_tamil_nillam_code);

var tamilnilamGroup = new ol.layer.Group({
    layers: [with_tamil_nillam_code_wmts,no_tamil_nillam_code,others_tamil_nillam_code],
    name: 'Tamil Nilam',
    visible:true,
    displayInLayerSwitcher:true
});
map.addLayer(tamilnilamGroup);




map.addLayer(village_master);
map.addLayer(taluk);
map.addLayer(district);



/*fmb_master_wmts.setVisible(true);*/
/*land_type_matched_wmts.setVisible(true);
land_type_unmatched_wmts.setVisible(true);*/
legend();
var scaleControl = new ol.control.ScaleLine({
  bar: true,
  text: true
});
map.addControl(scaleControl);
map.on('loadstart', function () {
  map.getTargetElement().classList.add('spinner');
});
map.on('loadend', function () {
  map.getTargetElement().classList.remove('spinner');
});
//UI for toggle on and off different layers
var layerSwitcher = new ol.control.LayerSwitcher({
  activationMode: 'click',
  startActive: false,
  groupSelectStyle: 'children'
});
map.addControl(layerSwitcher);

function toggleLayer(layerName,legend_layer_name,current_layer){
    map.getLayers().forEach(function (layer) {
        if (layer.get('name') != 'Basemap') {
            if(layer.get('name') == layerName){
                if(layer.getVisible()){
                    layer.setVisible(false);
                    $('.show-info-list1').empty();
                    $('.map_current_layer').text('');
                }else{
                    
                    layer.setVisible(true);
                    layer.setZIndex(9999);
                    getlegend(legend_layer_name);
                    $('.map_current_layer').text(current_layer);
                    
                }
                
                
            }else{
                if(layer.get('name') == 'District'){
                }
                else if(layer.get('name') == 'Taluk'){
                }
                else if(layer.get('name') == 'Village'){
                }
                else if(layer.get('name') == 'fmb_survey_wmts'){
                }
                else if(layer.get('name') == 'fmb_subdivision_wmts'){
                }
                else if(layer.get('name') == 'hamlets_wmts'){
                }
                else if(layer.get('name') == 'LGD'){
                }
                else if(layer.get('name') == 'Census'){
                }
                else if(layer.get('name') == 'Tamil Nilam'){
                }
                else
                {
                    layer.setVisible(false);
                }
            }
        }
    });
}
/*  ADD Legend */
function legend() {
    var active_layer = [district,taluk,village_master,hamlets,fmb_survey,fmb_subdivision];
    $('.show-info-list').empty();
    for(var i=0;i<active_layer.length;i++)
    {
            var img = new Image();
            var resolution = map.getView().getResolution();
            var legend_url;
            legend_url = active_layer[i].getSource().getLegendUrl();
            legend_url = legend_url + '&LEGEND_OPTIONS=forceLabels:on;fontColor:0x000000;fontAntiAliasing:true&transparent=true';
            img.src = legend_url;
            $('.show-info-list').append(
                $('<div>').append(
                    $('<h6>').append(active_layer[i].get('name'))
                ).append(img)
            );
        }
}
/*  ADD Legend wms*/
function getlegend(layername) {
     map.getLayers().forEach(function (layer) {
        if (layer.get('name') != 'Basemap') {
            if(layer.get('name') == layername){
                
                    $('.show-info-list1').empty();
                    var img = new Image();
                    var resolution = map.getView().getResolution();
                    var legend_url;
                    legend_url = layer.getSource().getLegendUrl();
                    legend_url = legend_url + '&LEGEND_OPTIONS=forceLabels:on;fontColor:0x000000;fontAntiAliasing:true&transparent=true';
                    img.src = legend_url;
                    $('.show-info-list1').append(
                        $('<div class="clicklayer">').append(
                            $('<h6>').append(layer.get('name'))
                        ).append(img)
                    );
                
            }
        }
    });
}
var popup = new ol.Overlay.Popup();
map.addOverlay(popup);
map.on('singleclick', function(event) {
   /* var lonlat = ol.proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
    console.log("latitude : " + lonlat[1] + ", longitude : " + lonlat[0]);
*/
    popup.hide();
    popup.setOffset([0, 0]);
    const fmb_url = fmb_survey_source.getFeatureInfoUrl(
        event.coordinate,
        map.getView().getResolution(), 
        map.getView().getProjection(),
        {
            'INFO_FORMAT': 'application/json',
            'FEATURE_COUNT': 1
        }
    );
    const village_url = village_master_source.getFeatureInfoUrl(
        event.coordinate,
        map.getView().getResolution(), 
        map.getView().getProjection(),
        {
            'INFO_FORMAT': 'application/json',
            'FEATURE_COUNT': 1
        }
    );
    //console.log(fmb_url);
    if (fmb_url) {
        fetch(fmb_url)
            .then((response) => response.json())
            .then((json) => {
            if(json.features.length != 0){
                var properties = json.features[0].properties;
                var popupContent = `<table class='table table-bordered table-sm'>
                    <tr class='bg-black-view'>
                        <th colspan='2' class='text-center'>FMB Details</th>
                    </tr>
                    <tr style='background-color:#ffffff;'>
                        <td>District_code</td>
                        <td >${properties.district_c}</td>
                    </tr>
                    <tr style='background-color:#ffffff;'>
                        <td>Taluk_code</td>
                        <td >${properties.taluk_code}</td>
                    </tr>
                    <tr style='background-color:#ffffff;'>
                        <td>Village_code</td>
                        <td >${properties.village_co}</td>
                    </tr>
                    <tr style='background-color:#ffffff;'>
                        <td>KIDE</td>
                        <td >${properties.survey_no}</td>
                    </tr>
                </table>`;
                popup.show(event.coordinate, popupContent);
            }
            else
            {
                if (village_url) {
                    fetch(village_url)
                        .then((response) => response.json())
                        .then((json) => {
                        if(json.features.length != 0){
                            var properties = json.features[0].properties;
                            var popupContent = `<table class='table table-bordered table-sm'>
                                <tr class='bg-black-view'>
                                    <th colspan='2' class='text-center'>Village Details</th>
                                </tr>
                                <tr style='background-color:#ffffff;'>
                                    <td>District_code</td>
                                    <td >${properties.ed_district_code}</td>
                                </tr>
                                <tr style='background-color:#ffffff;'>
                                    <td>Taluk_code</td>
                                    <td >${properties.ed_taluk_code}</td>
                                </tr>
                                <tr style='background-color:#ffffff;'>
                                    <td>Village_code</td>
                                    <td >${properties.ed_rv_code}</td>
                                </tr>
                                <tr style='background-color:#ffffff;'>
                                    <td>Village LGD</td>
                                    <td >${properties.tamilnilam_code}</td>
                                </tr>
                            </table>`;
                            popup.show(event.coordinate, popupContent);
                        }

                    });
                }
            }

        });
    }

});
/*with_tamil_nillam_code_wmts.on('change:visible', function(){
    if(with_tamil_nillam_code_wmts.getVisible()){
        $('.show-info-list1').empty();
        var img = new Image();
        var resolution = map.getView().getResolution();
        var legend_url;
        legend_url = with_tamil_nillam_code.getSource().getLegendUrl();
        legend_url = legend_url + '&LEGEND_OPTIONS=forceLabels:on;fontColor:0x000000;fontAntiAliasing:true&transparent=true';
        img.src = legend_url;
        $('.show-info-list1').append(
            $('<div class="clicklayer">').append(
                $('<h6>').append(with_tamil_nillam_code.get('name'))
            ).append(img)
        );
    }else{
        $('.show-info-list1').empty();
    }
});*/
