/* eslint-disable */
import * as L from 'leaflet';
import {LeafletLayer} from 'deck.gl-leaflet';
import {MapView} from '@deck.gl/core';
import {HeatmapLayer} from '@deck.gl/aggregation-layers';
// import times from './points';
import getTimeData from './dataService';

const map = L.map(document.getElementById('map'), {
  center: [36, -5.4],
  zoom: 8
});
L.tileLayer(
  'http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
).addTo(map);

const deckLayer = new LeafletLayer({
  views: [
    new MapView({
      repeat: true
    })
  ]
});
map.addLayer(deckLayer);

let currentTime = 0;
const buffer = [];

const getLayerTime = async time => {
  const data = await getDataFromBuffer(time);
  const nextLayer = new HeatmapLayer({
    data,
    visible: true,
    id: 'heatmp-layer',
    pickable: false,
    getPosition: d => [d[0], d[1]],
    getWeight: d => d[2],
    intensity: 1,
    threshold: 0.05,
    radiusPixels: 20,
    aggregation: 'MEAN',
    colorRange: [
      [255, 255, 204, [1]],
      [255, 237, 160, [1]],
      [254, 217, 118, [1]],
      [254, 178, 76, [1]],
      [253, 141, 60, [1]],
      [252, 78, 42, [1]],
      [227, 26, 28, [1]],
      [189, 0, 38, [1]],
      [128, 0, 38, [1]]
    ]
    // colorDomain: [0, 100]
    // weightsTextureSize: 1000
  });
  return nextLayer;
};

const getDataFromBuffer = async time => {
  if (!buffer[time]) await fillBufferdata(time);
  return buffer[time];
};

const fillBufferdata = async time => {
  buffer[time] = await getTimeData(time);
};

const fillBuffer = async min => {
  console.log('iniciando buffer...');
  const minPromises = [];
  const remainingPromises = [];
  for (let time of [0, 1, 2]) {
    if (time < min) minPromises.push(fillBufferdata(time));
    else remainingPromises.push(fillBufferdata(time));
  }
  Promise.all(remainingPromises).then(() => {
    console.log('buffer filled!');
  });
  await Promise.all(minPromises);
  console.log('buffer mínimo relleno...');
};

const start = async () => {
  // deckLayer.setProps({layers: [await getLayerTime(currentTime)]});

  await fillBuffer(1);
  while (true) {
    if (!Window.paused) {
      deckLayer.setProps({layers: [await getLayerTime(currentTime)]});
      currentTime++;
      if (currentTime > 2) currentTime = 0;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

start();
