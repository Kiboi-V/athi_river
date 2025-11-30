// Layer configurations and styles
const layerStyles = {
    parcels: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'blue',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(0, 0, 255, 0.1)'
        })
    }),
    
    buildings: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'red',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255, 0, 0, 0.3)'
        })
    }),
    
    buildings_under_construction: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'orange',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255, 165, 0, 0.3)'
        })
    }),
    
    electric_poles: new ol.style.Style({
        image: new ol.style.Circle({
            radius: 4,
            fill: new ol.style.Fill({
                color: 'yellow'
            }),
            stroke: new ol.style.Stroke({
                color: 'black',
                width: 1
            })
        })
    }),
    
    electric_lines: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'yellow',
            width: 2
        })
    }),
    
    fences: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'brown',
            width: 2,
            lineDash: [5, 5]
        })
    }),
    
    walls: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'gray',
            width: 3
        })
    })
};


function createLayer(layerName, style) {
    return new ol.layer.Vector({
        source: new ol.source.Vector({
            url: `./data/${layerName}.geojson`,
            format: new ol.format.GeoJSON()
        }),
        style: style,
        visible: false 
    });
}


const layers = {
    parcels: createLayer('parcels', layerStyles.parcels),
    buildings: createLayer('building', layerStyles.buildings),
    buildings_under_construction: createLayer('build_cons', layerStyles.buildings_under_construction),
    electric_poles: createLayer('poles', layerStyles.electric_poles),
};