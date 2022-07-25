/* eslint-disable */
import * as L from "leaflet";
import { LeafletLayer } from "deck.gl-leaflet";
import { MapView } from "@deck.gl/core";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
// import times from './points';
import getTimeData from "./dataService";

const map = L.map(document.getElementById("map"), {
  center: [39, -5.4],
  zoom: 6,
});
L.tileLayer(
  "http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
).addTo(map);

const deckLayer = new LeafletLayer({
  views: [
    new MapView({
      repeat: true,
    }),
  ],
});
map.addLayer(deckLayer);

let currentTime = 0;
const buffer = [];

const getLayerTime = async (time) => {
  const data = await getDataFromBuffer(time);

  function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    let result = [r, g, b, [1]];
    return result;
  }

  const nextLayer = new HeatmapLayer({
    data,
    visible: true,
    id: "heatmp-layer",
    pickable: false,
    getPosition: (d) => [d[0], d[1]],
    getWeight: (d) => d[2],
    intensity: 1,
    threshold: 0.05,
    radiusPixels: 30,
    // aggregation: "MEAN",
    colorRange: [
      hexToRgb("ff00ff"),
      hexToRgb("00ffff"),
      hexToRgb("ffff00"),
      hexToRgb("ff6400"),
      hexToRgb("ff3c00"),
      hexToRgb("ff2800"),
      hexToRgb("ff1400"),
      hexToRgb("c80000"),
      hexToRgb("9b0000"),
      hexToRgb("460000"),
      hexToRgb("000000"),
    ],
    // colorDomain: [0, 200],
    // weightsTextureSize: 1000
  });
  return nextLayer;
};

const getDataFromBuffer = async (time) => {
  if (!buffer[time]) await fillBufferdata(time);
  return buffer[time];
};

const fillBufferdata = async (time) => {
  buffer[time] = await getTimeData(time);
};

const fillBuffer = async (min) => {
  console.log("iniciando buffer...");
  const minPromises = [];
  const remainingPromises = [];
  for (let time of [0, 1, 2]) {
    if (time < min) minPromises.push(fillBufferdata(time));
    else remainingPromises.push(fillBufferdata(time));
  }
  Promise.all(remainingPromises).then(() => {
    console.log("buffer filled!");
  });
  await Promise.all(minPromises);
  console.log("buffer mínimo relleno...");
};

const start = async () => {
  // deckLayer.setProps({ layers: [await getLayerTime(currentTime)] });

  await fillBuffer(5);
  while (true) {
    if (!Window.paused) {
      deckLayer.setProps({ layers: [await getLayerTime(currentTime)] });
      currentTime++;
      if (currentTime > 24) currentTime = 0;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }
};

start();
