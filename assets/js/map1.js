//var geoServerURL = 'http://192.168.4.247:8080/geoserver/wms';
var geoServerURL = 'https://tngis.tnega.org/geoserver/wms';
var wmts_url = 'https://tngis.tnega.org/geoserver/gwc/service/wmts_url';
var tamilNaduView;
var OSM;
var satellite;
var tn_district;
var tn_district_layer = 'admin_master:administrative_boundary_district';
var taluk_layer = 'admin_master:administrative_boundary_taluk';
var village_layer = 'admin_master:administrative_boundary_revenue_village';
var taluk1;
var village_master1;
tamilNaduView = new L.LatLng(10.92304,78.81107);
//var app_temp_path = 'https://tngis.tnega.org/cadastral_api/app/helper/tmp/';
var app_temp_path = 'https://tngis.tnega.org/cadastral_api/app/helper/files/';
// Initialize Map
raw_map = L.map('raw_map',{
    //zoomControl: false,
    center: [10, 70],
    crs: L.CRS.EPSG4326,
    /*minZoom: 7,
    maxZoom: 12,*/
});

georef_map1 = L.map('georef_map1',{
    //zoomControl: false,
    center: [11.1271, 78.6569],
    //minZoom: 7,
    maxZoom: 25,
});

var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';   
// Basemaps
OSM = L.tileLayer(osmUrl, {
    maxZoom: 25,
    attribution: 'TNGIS',
    opacity: 0.25
});
var googleSatellite = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
 maxZoom: 30,
 attribution: '© Google Satellite',
 //visible: false,
 //opacity: 0.7
}).addTo(georef_map1);

osm1 = L.tileLayer(osmUrl, {
    maxZoom: 30,
    attribution: 'TNGIS',
    //opacity: 0.25
});
//osm1.addTo(georef_map1);

raw_map.setView([-60,100], 0.5);
georef_map1.setView(tamilNaduView, 7);
var wmsPane = georef_map1.createPane('wmsPane');
wmsPane.style.zIndex = 250;

tn_district= new L.tileLayer.wms(geoServerURL,{
    layers:tn_district_layer,
    format: 'image/png',
    transparent: true,
    crs: L.CRS.EPSG4326,
    style:'district_label',
    pane: wmsPane
})
tn_district.addTo(georef_map1);
taluk1= new L.tileLayer.wms(geoServerURL,{
    layers:taluk_layer,
    format: 'image/png',
    transparent: true,
    crs: L.CRS.EPSG4326,
    style:'taluk_name',
    pane: wmsPane
})
taluk1.addTo(georef_map1);
village_master1= new L.tileLayer.wms(geoServerURL,{
    layers:village_layer,
    format: 'image/png',
    transparent: true,
    crs: L.CRS.EPSG4326,
    style:'rvill_name',
    pane: wmsPane
})
village_master1.addTo(georef_map1);
var survey_master = new L.tileLayer.wms(geoServerURL, {
    layers: 'fmb:cadastral',
    style: "",
    //tilematrixSet: "EPSG:4326",
    format: "image/png",
    transparent: true,
    //extent: [76.89948074973644, 8.231564608139875, 80.11202992654356, 13.329351416759772],
    pane: wmsPane,
    maxZoom:30
}).addTo(georef_map1);
var subdivision_master = new L.tileLayer.wms(geoServerURL, {
    layers: 'fmb:fmb_new_subdivision_master',
    style: "",
    //tilematrixSet: "EPSG:4326",
    format: "image/png",
    transparent: true,
    //extent: [76.89948074973644, 8.231564608139875, 80.11202992654356, 13.329351416759772],
    pane: wmsPane,
    maxZoom:30
}).addTo(georef_map1);
let mylayer = L.layerGroup();
let mylayer1 = L.layerGroup();
let mylayer2 = L.layerGroup();
L.control.scale().addTo(georef_map1);
function shapetojson_raw_fmb(district_val,taluk_val,village_val,survey_number)
{
    if (rawgeojsonLayer != undefined) {
        raw_map.removeLayer(rawgeojsonLayer);
    };
    //var full_path = app_temp_path+'raw_fmb/'+village_val+'/fmb/raw/'+survey_number+'.zip';
    if(district_val<10)
    {
        district_val = '0'+district_val;
    }
    if(taluk_val<10)
    {
        taluk_val = '0'+taluk_val;
    } 
    var full_path = app_temp_path+'fmb_new/'+district_val+'/'+taluk_val+'/'+village_val+'/fmb/raw/'+survey_number+'.zip';
    $.ajax({
        url:full_path,
        type:'HEAD',
        error: function()
        {
            if (goeref_fmbgeojsonLayer != undefined) {
                georef_map1.removeLayer(goeref_fmbgeojsonLayer);
            };
            if (goeref_vectorgeojsonLayer != undefined) {
                georef_map1.removeLayer(goeref_vectorgeojsonLayer);
            };
            if (raster_image_layer != undefined) {
                georef_map1.removeLayer(raster_image_layer);
            };
            //file not exists
            Swal.fire({
                icon: "error",
                title: 'Digital FMB from Collabland is not available for this Survey Number',
                showConfirmButton: true,
                timer: 5000
             })
            return;
        },
        success: function()
        {
            $('.raw_fmb_menu').empty();
            $('.geojson_label_raw').text('');
            $('.raw_fmb_add_marker').removeClass('d-none')
            var id = 1;
            //file exists
            var shapefile_raw_fmb = shp(full_path).then(function(geojson){
                rawgeojsonLayer = L.Proj.geoJson(geojson, {
                    onEachFeature: function(feature, layer) {
                        $('.raw_fmb_menu').append('<li><div class="form-check dropdown-item"><input class="form-check-input" type="radio" name="raw_fmb_survey_sb" id="flexRadioDefault'+id+'" value="'+feature.properties.KIDE+'"><label class="form-check-label" for="flexRadioDefault'+id+'">'+feature.properties.KIDE+'</label></div></li>');
                        label_raw_fmb = L.marker(layer.getBounds().getCenter(), {
                          icon: L.divIcon({
                            className: 'geojson_label_raw',
                            html: feature.properties.KIDE,
                            iconSize: [100, 40]
                          })
                        }).addTo(raw_map);
                        id++;
                    },
                    style: raw_style
                }).addTo(raw_map); 
                //geojsonLayer.addTo(map);
                //console.log(geojson); 
                raw_map.fitBounds(rawgeojsonLayer.getBounds());
            });
        }
    });
    

}
function shapetojson_georef_fmb(district_val,taluk_val,district_text,taluk_text,village_text,village_val,georef_fmb_file)
{
    if(district_val<10)
    {
        district_val = '0'+district_val;
    }
    if(taluk_val<10)
    {
        taluk_val = '0'+taluk_val;
    } 
    if (goeref_fmbgeojsonLayer != undefined) {
        georef_map1.removeLayer(goeref_fmbgeojsonLayer);
        $('.geojson_label').text('');
    };
     if (goeref_vectorgeojsonLayer != undefined) {
        georef_map1.removeLayer(goeref_vectorgeojsonLayer);
    };
    mylayer.clearLayers();
    //var full_path_fmb = app_temp_path+'georef_vector_fmb/'+village_val_excluding_zero+'_'+village_text+'_merged'+'/'+village_val+'/fmb/georef/'+village_val+'_merged_fmb';
    //var full_path_fmb = app_temp_path+'fmb_merged/'+district_val+'/'+taluk_val+'/'+village_val+'/fmb/georef/'+village_val+'_merged_fmb';
    //var full_path_fmb = app_temp_path+'fmb_new/'+district_val+'/'+taluk_val+'/'+village_val+'/fmb/georef/'+village_val+'_merged_fmb';
    var full_path_fmb = app_temp_path+'fmb_new/'+district_val+'/'+taluk_val+'/'+village_val+'/fmb/georef/'+georef_fmb_file;
    var shapefile_georef_fmb = shp(full_path_fmb).then(function(geojson){
        //console.log(JSON.stringify(geojson));
        goeref_fmbgeojsonLayer = L.Proj.geoJson(geojson, {
            onEachFeature: addMyData,
            style: georef_fmb_style
        }).addTo(georef_map1);   
    });
    /*var full_path_vector = app_temp_path+'fmb_merged/'+district_val+'/'+taluk_val+'/'+village_val+'/vector/'+georef_vector_file;
    var shapefile_georef_vector = shp(full_path_vector).then(function(geojson){
        goeref_vectorgeojsonLayer = L.Proj.geoJson(geojson, {
            onEachFeature: addMyData1,
            style: vector_style
        });   
    });*/
    mylayer.addTo( georef_map1 )
    //mylayer.addTo( georef_map1 )
}
function shapetojson_georef_cadastral(district_val,taluk_val,district_text,taluk_text,village_text,village_val,village_val_excluding_zero,georef_vector_file)
{
    if(district_val<10)
    {
        district_val = '0'+district_val;
    }
    if(taluk_val<10)
    {
        taluk_val = '0'+taluk_val;
    } 
    if (goeref_fmbgeojsonLayer != undefined) {
        georef_map1.removeLayer(goeref_fmbgeojsonLayer);
        $('.geojson_label').text('');
    };
     if (goeref_vectorgeojsonLayer != undefined) {
        georef_map1.removeLayer(goeref_vectorgeojsonLayer);
    };
    mylayer.clearLayers();
    //var full_path_vector = app_temp_path+'fmb_merged/'+district_val+'/'+taluk_val+'/'+village_val+'/vector/'+georef_vector_file;
    var full_path_vector = app_temp_path+'fmb_new/'+district_val+'/'+taluk_val+'/'+village_val+'/vector/'+georef_vector_file;
    var shapefile_georef_vector = shp(full_path_vector).then(function(geojson){
        goeref_vectorgeojsonLayer = L.Proj.geoJson(geojson, {
            onEachFeature: addMyData1,
            style: vector_style
        });   
    });
    //mylayer1.addTo( georef_map1 )
    //mylayer.addTo( georef_map1 )
}
function shapetojson_raster_image(district_text,taluk_text,village_text,village_val,village_val_excluding_zero,tiff_file)
{
    var wmsPane = georef_map1.createPane('wmsPane');
    wmsPane.style.zIndex = 250;
    if (raster_image_layer != undefined) {
        georef_map1.removeLayer(raster_image_layer);
    };
    var full_path_image = app_temp_path+'raster_image/'+village_val_excluding_zero+'_'+village_text+'_'+taluk_text+'_'+district_text+'_raster_08.tif/'+village_val+'_'+village_text+'_'+taluk_text+'_'+district_text+'_raster_08.tif.tif';
    var imageBounds = georef_map1.getBounds();
    if(village_check_val == village_val)
    {

    }
    else
    {
        /*fetch(full_path_image)
          .then(response => response.arrayBuffer())
          .then(arrayBuffer => {
            parseGeoraster(arrayBuffer).then(georaster => {
              //console.log("georaster:", georaster);
              raster_image_layer = new GeoRasterLayer({
                  georaster: georaster,
                  opacity: 0.5,
                  //pixelValuesToColorFn: values => values[0] > 100 ? '#ff0000' : '#0000ff',
                  resolution: 256, // optional parameter for adjusting display resolution
                  pane: wmsPane
              });
              addMyData2(raster_image_layer)

          });
        });*/
        //var image_layer = village_val+'_'+village_text+'_'+taluk_text+'_'+district_text+'_raster_08.tif';
        var image_layer = tiff_file;
        raster_image_layer = new L.tileLayer.wms(geoServerURL,{
            layers:image_layer,
            format: 'image/png',
            transparent: true,
            crs: L.CRS.EPSG4326,
            opacity: 0.4,
            maxZoom: 30,
            pane: wmsPane
        })
        addMyData2(raster_image_layer)
        village_check_val = village_val;
    }
}
function addMyData( feature, layer ){
  mylayer.addLayer( layer )
  if (feature.properties) {
        layer.bindPopup("<b>Survey Number: " + feature.properties.KIDE + "</b> <br><b>Area: " + feature.properties.Area+'</b>');
        var label_text = String(feature.properties.KIDE);
        /*label_georef_fmb = L.marker(layer.getBounds().getCenter(), {
          icon: L.divIcon({
            className: 'geojson_label',
            html: label_text,
            iconSize: [100, 40]
          })
        }).addTo(georef_map1);*/
    }
}
function addMyData1( feature, layer ){
  mylayer1.addLayer( layer )
}
function addMyData2(  layer ){
  mylayer2.addLayer( layer )
}
var baseLayers = {
    'Cadastral(Vector)': mylayer1,
    'Digital FMB': mylayer,
    'Scanned Village Map':mylayer2
};
var baseMaps = {
    "OpenStreetMap": osm1,
    "GoogleSatelliteMap": googleSatellite,
};
var layerControl = L.control.layers(baseMaps,baseLayers).addTo(georef_map1);
function vector_style(feature)
{
    return {
       weight: 5,
       opacity: 1,
       color: 'violet',
       dashArray: '3',
       fillOpacity: 0,
       fillColor: '#ff0000'
     };
}
function georef_fmb_style(feature)
{
    if(feature.properties.KIDE == highlight_survey_number)
    {
        return {
           weight: 9,
           opacity: 1,
           color: '#BF0603',
           dashArray: '2',
           fillOpacity: 0,
           //fillColor: '#ff0000'
         };
    }
    else
    {
        return {
           weight: 2,
           opacity: 2,
           color: '#b6d7a8',
           dashArray: '2',
           fillOpacity: 0.1,
           //fillColor: '#ff0000'
         };
    }
}
function raw_style(feature)
{
    return {
       weight: 3,
       opacity: 2,
       color: 'black',
       dashArray: '2',
       fillOpacity: 0,
       //fillColor: '#ff0000'
     };
}
/*function toggleLayer(layerName){
    map.getLayers().forEach(function (layer) {
        if (layer.get('name') != 'Basemap') {
            if(layer.get('name') == layerName){
                if(layer.getVisible()){
                    layer.setVisible(false);
                }else{
                    layer.setVisible(true);
                }
            }else{
                if(layer.get('name') != 'Boundary'){
                    layer.setVisible(false);
                }
            }
        }
    });
}*/
$('.raw_fmb_add_marker').on('click',function(){
    raw_map_point = true;
    if(raw_fmb_marker === undefined)
    {

    }
    else
    {
        //raw_map.removeLayer(raw_fmb_marker);
        raw_fmb_marker_group.clearLayers();
    }
})
raw_map.on('click', async function(e) {
    if (rawgeojsonLayer != undefined) {
        if(raw_map_point==true)
        {
            //L.DomUtil.addClass(raw_map._container,'crosshair-cursor-enabled');
            var BBOX = raw_map.getBounds().toBBoxString();
            var WIDTH = raw_map.getSize().x;
            var HEIGHT = raw_map.getSize().y;
            var X = Math.round(raw_map.layerPointToContainerPoint(e.layerPoint).x);
            var Y = Math.round(raw_map.layerPointToContainerPoint(e.layerPoint).y);
            var icon = L.divIcon({
                className: 'custom-div-icon',
                html: "<i class='bi bi-geo'></i>",
                /*iconSize: [30, 42],
                iconAnchor: [15, 42]*/
            });
            raw_fmb_marker_group = L.layerGroup().addTo(raw_map);
            raw_fmb_marker = new L.marker(e.latlng,{icon: icon,draggable:true}).addTo(raw_fmb_marker_group);
            //alert(BBOX);
        }
    }
});
georef_map1.on('overlayadd', function(e) {
    //console.log(e.name)
    if(e.name == 'Digital FMB')
    {
      if(georef_fmb_status==false)
      {
        Swal.fire({
            icon: "error",
            title: 'Digital FMB from Collabland is not available for this Survey Number',
            showConfirmButton: true,
            timer: 5000
        })
      }
    }
    else if(e.name == 'Cadastral(Vector)')
    {
      if(georef_vector_status==false)
      {
        Swal.fire({
            icon: "error",
            title: 'Digital FMB from Collabland is not available for this Survey Number',
            showConfirmButton: true,
            timer: 5000
        })
      }
    }
    else if(e.name == 'Scanned Village Map')
    {
      if(village_raster_status==false)
      {
        Swal.fire({
            icon: "error",
            title: 'Digital FMB from Collabland is not available for this Survey Number',
            showConfirmButton: true,
            timer: 5000
        })
      }
    }
});