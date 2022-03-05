/*
Create and Render map on div with zoom and center
*/
class OLMap {
  //Constructor accepts html div id, zoom level and center coordinaes
  constructor(map_div, zoom, center) {
    this.map = new ol.Map({
      target: map_div,
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat(center),
        zoom: zoom
      })
    });
  }
}

// Defining Static Style
let staticStyle = new ol.style.Style({
  // Line and Polygon Style
  stroke: new ol.style.Stroke({
    color: '#0e97fa',
    width: 4
  }),
  fill: new ol.style.Fill({
    color: 'rgba(0, 153, 255, 0.2)'
  }),

  // Point Style
  image: new ol.style.Circle({
    radius: 9,
    fill: new ol.style.Fill({
      color: [0, 153, 255, 1],
    }),
    stroke: new ol.style.Stroke({
      color: [255, 255, 255, 1],
      width: 5
    })
  })
});

// Defining advance Styles
// Create a pattern
const patternCanvas = document.createElement('canvas');
const patternContext = patternCanvas.getContext('2d');

// Give the pattern a width and height of 50
patternCanvas.width = 50;
patternCanvas.height = 50;

// Give the pattern a background color and draw an arc
patternContext.fillStyle = 'rgba(255, 238, 204, 0.33)';
patternContext.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
patternContext.arc(0, 0, 50, 0, .5 * Math.PI);
patternContext.stroke();

// Create our primary canvas and fill it with the pattern
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const pattern = ctx.createPattern(patternCanvas, 'repeat');


let advanceStyle = {
  'point': new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      scale: [0.5, 0.5],
      src: './assets/location.png'
    })
  }),
  'line': [
    //Implement Dash style
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [191, 17, 183, 1],
        width: 3,
        lineDash: [10, 10]
      })  
    }),
    //Implement Dot style for LineString vertices
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: 'orange',
        })
      }),
      geometry: (feature) => {
        const coordinates = feature.getGeometry().getCoordinates();
        return new ol.geom.MultiPoint(coordinates);
      }
    })
  ],
  'polygon': [
    new ol.style.Style({
      //Width of the stroke
      stroke: new ol.style.Stroke({
        color: [255, 0, 51, 1],
        width: 3
      }),
      //Fill polygon with canvas pattern
      fill: new ol.style.Fill({
        // color: [255, 0, 51, 0.1]
        color: pattern
      })
    }),
    //Implement Dot style for Polygon vertices
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: 'orange',
        }),
      }),
      geometry: (feature) => {
        const coordinates = feature.getGeometry().getCoordinates()[0];
        return new ol.geom.MultiPoint(coordinates);
      }
    })
  ]
}

/*
Create Vector Layer
*/
class VectorLayer{
  //Constructor accepts title of vector layer and map object
  constructor(title, map) {
    this.layer = new ol.layer.Vector({
      title: title,      
      source: new ol.source.Vector({
        projection:map.getView().projection
      }),
      style: staticStyle
    })
  }
}


/*
Create a Draw interaction for LineString and Polygon
*/
class Draw {  
  //Constructor accepts geometry type, map object and vector layer
  constructor(type, map, vector_layer) {
    this.map = map;
    this.vector_layer = vector_layer;
    this.features = [];
    
    //Draw feature
    this.draw = new ol.interaction.Draw({
        type: type,
        stopClick: true,
        source: vector_layer.getSource()
    });
    
    this.map.addInteraction(this.draw);   
  }
}


//Create map and vector layer
let map = new OLMap('map', 9, [-96.6345990807462, 32.81890764151014]).map;
let vector_layer = new VectorLayer('Temp Layer', map).layer
map.addLayer(vector_layer);


//Add Interaction to map depending on your selection
let draw = null;
let btnClick = (e) => {  
  removeInteractions();
  let geomType = e.srcElement.attributes.geomtype.nodeValue;
  //Create interaction
  draw = new Draw(geomType, map, vector_layer);
}


//Remove map interactions except default interactions
let removeInteractions = () => {
  let extra_interactions = map.getInteractions().getArray().slice(9);
  let len = extra_interactions.length;
  for (let i in extra_interactions) {
    map.removeInteraction(extra_interactions[i]);
  }  
}


//Clear vector features and overlays and remove any interaction
let clear = () => {
  removeInteractions();
  map.getOverlays().clear();
  vector_layer.getSource().clear();
}

//Bind methods to click events of buttons
let line = document.getElementById('btn1');
line.onclick = btnClick;

let poly = document.getElementById('btn2');
poly.onclick = btnClick;

let point = document.getElementById('btn4');
point.onclick = btnClick;

let clearGraphics = document.getElementById('btn3');
clearGraphics.onclick = clear;

function styleChange(val) {
  if (val == "static") {
    vector_layer.setStyle(staticStyle);
  }
  else if (val == "advance") {
    vector_layer.setStyle((e)=>{
      let geomType = e.getGeometry().getType();
      if (geomType == 'Point') {        
        return advanceStyle['point']
      } else if (geomType == 'LineString') {
        return advanceStyle['line']
      } else if (geomType == 'Polygon') {
        return advanceStyle['polygon']
      }      
    });
  }
}