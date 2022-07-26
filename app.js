/* eslint-disable */
import * as L from "leaflet";
import { LeafletLayer } from "deck.gl-leaflet";
import { MapView } from "@deck.gl/core";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import PaletteService from "./palette.service";
import { getTimeData, getMinMaxRange } from "./dataService";

////////////
const buffer = [];
let catalogRefID = "wave_large_atlmed";
let variable = "VHM0";
let minMaxRange = null;
const today = new Date().addDays(-1);
const ago = today.addDays(-4);
const playerDelay = 750;
const palette = "cirana";
const hourGap = 1;
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

const deckLayer = new LeafletLayer({
  views: [
    new MapView({
      repeat: true,
    }),
  ],
});
map.addLayer(deckLayer);

const getLayerTime = async (time) => {
  const data = await getDataFromBuffer(time);

  const nextLayer = new HeatmapLayer({
    data,
    visible: true,
    id: "heatmp-layer",
    pickable: false,
    getPosition: (d) => [d[0], d[1]],
    getWeight: (d) => d[2],
    intensity: 1,
    threshold: 0.05,
    radiusPixels: 30, // Math.pow(map.getZoom(), 1.5), //30,
    // aggregation: "MEAN",
    colorRange: PaletteService.getColorsArray(palette),
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
  buffer[time] = await getTimeData(
    catalogRefID,
    time,
    variable,
    minMaxRange.min,
    minMaxRange.max
  );
};

const fillBuffer = async (timeArray, minBuffer) => {
  console.log("iniciando buffer...");
  const minPromises = [];
  const remainingPromises = [];
  for (let time of timeArray) {
    if (timeArray.indexOf(time) < minBuffer)
      minPromises.push(new Promise((res) => res(fillBufferdata(time))));
    // else
    //   remainingPromises.push(new Promise((res) => res(fillBufferdata(time))));
  }
  // await Promise.all(minPromises);
  // console.log("buffer mínimo relleno con ", minPromises.length);
  // Promise.all(remainingPromises).then(() => {
  //   console.log("buffer filled!");
  // });
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
  const timeArray = getTimeIntervalArray(ago, today);

  minMaxRange = await getMinMaxRange(
    catalogRefID,
    timeArray[0],
    timeArray[timeArray.length - 1],
    variable
  );

  let timeIndex = 0;

  // deckLayer.setProps({ layers: [await getLayerTime(timeArray[timeIndex])] });

  // await fillBuffer(timeArray, 5);
  while (true) {
    if (!Window.paused) {
      const currentDate = timeArray[timeIndex];
      console.log(currentDate);
      deckLayer.setProps({ layers: [await getLayerTime(currentDate)] });
      timeIndex++;
      if (timeIndex >= timeArray.length) timeIndex = 0;
    }

    await new Promise((resolve) => setTimeout(resolve, playerDelay));
  }
};

start();
