let map;
let popup;
let baseLayers = {};
let overlayLayers = {};

function initMap() {
    popup = new ol.Overlay({
        element: document.getElementById('popup'),
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    });

   
    map = new ol.Map({
        target: 'map',
        overlays: [popup],
        view: new ol.View({
            center: [37.018789, -1.448534], 
            zoom: 16,
            projection: 'EPSG:4326'
        })
    });

    //  base layers
    baseLayers = {
      
        satellite: new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                attributions: 'Tiles &copy; Esri &mdash; Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
            }),
            visible: true, // Default base layer
            title: "Satellite"
        }),
        
        // OSM
        streets: new ol.layer.Tile({
            source: new ol.source.OSM(),
            visible: false,
            title: "Streets"
        })
    };

   
    overlayLayers = {
        
        drone: new ol.layer.Image({
            source: new ol.source.ImageStatic({
                url: './data/basemap.png', 
                projection: 'EPSG:4326'
            }),
            visible: false, 
            title: "Drone Imagery",
            opacity: 0.8
        }),
        
        //  vector layers
        parcels: layers.parcels,
        buildings: layers.buildings,
        buildings_under_construction: layers.buildings_under_construction,
        electric_poles: layers.electric_poles,
    
    };

    // base layers
    Object.values(baseLayers).forEach(layer => map.addLayer(layer));

    // overlay layers
    Object.values(overlayLayers).forEach(layer => map.addLayer(layer));

    // layer controls
    setupLayerControls();
    
    
    setupMapInteractions();
    
    
    setupBaseLayerControls();
}

// Base layer control 
function setupBaseLayerControls() {
    const baseLayerRadios = document.querySelectorAll('input[name="baseLayer"]');
    
    baseLayerRadios.forEach(radio => {
        radio.addEventListener('change', function(e) {
            
            Object.values(baseLayers).forEach(layer => {
                layer.setVisible(false);
            });
            
           
            if (baseLayers[e.target.value]) {
                baseLayers[e.target.value].setVisible(true);
            }
        });
    });
}

// Query functions
function searchParcel() {
    const parcelNumber = document.getElementById('parcelSearch').value.trim();
    const source = overlayLayers.parcels.getSource();
    let found = false;
    
    source.forEachFeature(feature => {
        const props = feature.getProperties();
        
        if (
            
            props.Name === parcelNumber
            ) {
            
            const extent = feature.getGeometry().getExtent();
            map.getView().fit(extent, { padding: [100, 100, 100, 100], duration: 1000 });
            
           
            feature.setStyle(new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'yellow',
                    width: 4
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 0, 0.3)'
                })
            }));
            
            showFeatureInfo(feature, 'Parcel Information');
            found = true;
        }
    });
    
    if (!found) {
        document.getElementById('results').innerHTML = 
            `<div style="color: red;">❌ Parcel not found: ${parcelNumber}</div>`;
    }
}

function countBuildings() {
    const viewExtent = map.getView().calculateExtent();
    const source = overlayLayers.buildings.getSource();
    let count = 0;
    
    source.forEachFeatureIntersectingExtent(viewExtent, () => {
        count++;
    });
    
    document.getElementById('results').innerHTML = 
        `<div style="color: green;">🏠 Buildings in current view: <strong>${count}</strong></div>`;
}

function showAllConstruction() {
    const source = overlayLayers.buildings_under_construction.getSource();
    const features = source.getFeatures();
    
    if (features.length > 0) {
        const extents = features.map(f => f.getGeometry().getExtent());
        const overallExtent = ol.extent.createEmpty();
        extents.forEach(extent => ol.extent.extend(overallExtent, extent));
        
        map.getView().fit(overallExtent, { padding: [50, 50, 50, 50], duration: 1000 });
        
        document.getElementById('results').innerHTML = 
            `<div style="color: orange;">🏗️ Showing ${features.length} buildings under construction</div>`;
    } else {
        document.getElementById('results').innerHTML = 
            `<div style="color: gray;">No buildings under construction found</div>`;
    }
}

function measureArea() {
    document.getElementById('results').innerHTML = 
        `<div style="color: blue;">📐 Click and drag to measure area (feature coming soon)</div>`;
}

function showFeatureInfo(feature, title = 'Feature Information') {
    const props = feature.getProperties();
    let info = `<h4>${title}</h4>`;
    
    for (const [key, value] of Object.entries(props)) {
        if (key !== 'geometry' && value !== null && value !== undefined) {
            info += `<strong>${key}:</strong> ${value}<br>`;
        }
    }
    
    document.getElementById('popup-content').innerHTML = info;
    
    const coordinate = feature.getGeometry().getExtent();
    popup.setPosition(ol.extent.getCenter(coordinate));
}

function setupLayerControls() {

    const overlayControls = document.querySelectorAll('.overlay-controls input[type="checkbox"]');
    overlayControls.forEach(control => {
        control.addEventListener('change', function(e) {
            const layerName = e.target.id;
            if (overlayLayers[layerName]) {
                overlayLayers[layerName].setVisible(e.target.checked);
            }
        });
    });

    
    const baseLayerRadios = document.querySelectorAll('input[name="baseLayer"]');
    baseLayerRadios.forEach(radio => {
        radio.addEventListener('change', function(e) {
            Object.values(baseLayers).forEach(layer => layer.setVisible(false));
            if (baseLayers[e.target.value]) {
                baseLayers[e.target.value].setVisible(true);
            }
        });
    });
}

function setupMapInteractions() {
   
    document.querySelector('.popup-closer').addEventListener('click', function() {
        popup.setPosition(undefined);
    });
    
  
    map.on('singleclick', function(evt) {
        const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
            return feature;
        });
        
        if (feature) {
            showFeatureInfo(feature);
        } else {
            popup.setPosition(undefined);
        }
    });
}


document.addEventListener('DOMContentLoaded', initMap);


document.getElementById('togglePanel').addEventListener('click', function() {
    const panel = document.querySelector('.control-panel');
    const content = document.querySelector('.panel-content');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        panel.style.width = '350px';
    } else {
        content.style.display = 'none';
        panel.style.width = 'auto';
    }
});