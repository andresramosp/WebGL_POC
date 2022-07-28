/* eslint-disable */
import * as L from "leaflet";
import { LeafletLayer } from "deck.gl-leaflet";
import { MapView } from "@deck.gl/core";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import PaletteService from "./palette.service";
import { getTimeData, getMinMaxRange } from "./dataService";

////////////
let buffer = [];
let catalogRefID = "circulation_coastal_alm";
let variable = "salinity";
let minMaxRange = null;
const today = new Date().addDays(-1);
const ago = today.addDays(-1);
const playerDelay = 750;
const palette = "cirana";
const hourGap = 1;

let paused = false;
let timeIndex = 0;
let timeArray = [];
let radiusPixels = 30;
let dymanicRadiusPixel = false;
let radiusFactor = 2;
/////////////

const map = L.map(document.getElementById("map"), {
  center: [39, -5.4],
  zoom: 3,
});
L.tileLayer(
  "http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
).addTo(map);

if (dymanicRadiusPixel) radiusPixels = Math.pow(map.getZoom(), radiusFactor);

const deckLayer = new LeafletLayer({
  views: [
    new MapView({
      repeat: true,
    }),
  ],
});
map.addLayer(deckLayer);

const getLayerTime = async (time) => {
  if (!buffer[time]) await fillBufferdata(time);
  const data = buffer[time];

  const nextLayer = new HeatmapLayer({
    data,
    visible: true,
    id: "heatmp-layer",
    pickable: false,
    getPosition: (d) => [d[0], d[1]],
    getWeight: (d) => d[2],
    intensity: 1,
    threshold: 0.05,
    radiusPixels, //30,
    aggregation: "MEAN",
    colorRange: PaletteService.getColorsArray(palette),
    colorDomain: [5, 100],
    // colorDomain: [colorRange.min, colorRange.max],
    // weightsTextureSize: 1000
  });
  return nextLayer;
};

const fillBufferdata = async (time) => {
  let mapBox = map.getBounds().pad(0.2);
  let zoom = map.getZoom();
  buffer[time] = await getTimeData(
    catalogRefID,
    time,
    variable,
    minMaxRange.min,
    minMaxRange.max,
    mapBox,
    zoom
  );
};

const fillBuffer = async (timeArray, minBuffer) => {
  const minPromises = [];
  const remainingPromises = [];

  console.log("iniciando buffer mínimo...");
  for (let time of timeArray.slice(0, minBuffer)) {
    minPromises.push(fillBufferdata(time));
  }
  await Promise.all(minPromises);
  console.log("buffer mínimo relleno con ", minPromises.length);

  console.log("iniciando resto del buffer...");
  for (let time of timeArray.slice(minBuffer, timeArray.length)) {
    remainingPromises.push(fillBufferdata(time));
  }
  Promise.all(remainingPromises).then(() => {
    console.log("buffer filled!");
  });
};

const getTimeIntervalArray = (dateFrom, dateTo) => {
  let result = [];
  let currentDate = new Date(dateFrom);
  currentDate.setHours(0, 0, 0, 0);
  let stopDate = dateTo;
  while (currentDate < stopDate) {
    result.push(currentDate);
    currentDate = currentDate.addHours(hourGap);
  }
  return result.map((d) => d.toJSON());
};

const start = async () => {
  timeArray = getTimeIntervalArray(ago, today);

  minMaxRange = await getMinMaxRange(
    catalogRefID,
    timeArray[0],
    timeArray[timeArray.length - 1],
    variable
  );

  await fillBuffer(timeArray, 12);

  while (true) {
    if (!paused) {
      const currentDate = timeArray[timeIndex];
      console.log(currentDate);
      deckLayer.setProps({ layers: [await getLayerTime(currentDate)] });
      timeIndex++;
      if (timeIndex >= timeArray.length) timeIndex = 0;
    }

    await new Promise((resolve) => setTimeout(resolve, playerDelay));
  }
};

let refreshTimeout;

const refreshLayer = () => {
  clearTimeout(refreshTimeout);
  refreshTimeout = setTimeout(async () => {
    buffer = [];
    const currentDate = timeArray[timeIndex];
    deckLayer.setProps({ layers: [await getLayerTime(currentDate)] });
  }, 500);
};

map.on("zoomend", async () => {
  if (dymanicRadiusPixel) {
    radiusPixels = Math.pow(map.getZoom(), radiusFactor);
    console.log("radious pixel: ", radiusPixels);
  }
  // deckLayer.setProps({ layers: [] });
  refreshLayer();
});

map.on("moveend", async () => {
  refreshLayer();
});

document.getElementById("pause").onclick = () => {
  paused = !paused;
  document.getElementById("pause").innerHTML = paused ? "Play" : "Paused";
};

document.getElementById("back").onclick = async () => {
  timeIndex--;
  const currentDate = timeArray[timeIndex];
  console.log(currentDate);
  deckLayer.setProps({ layers: [await getLayerTime(currentDate)] });
};

document.getElementById("forward").onclick = async () => {
  timeIndex++;
  const currentDate = timeArray[timeIndex];
  console.log(currentDate);
  deckLayer.setProps({ layers: [await getLayerTime(currentDate)] });
};

start();
