const Rainbow = require("rainbowvis.js");

const PaletteService = {
  PALETTES: [
    {
      paletteId: "cirana",
      rangeValues: { min: 0, max: 1.5 },
      step: 0.01,
      spectrum: [
        "#ff00ff",
        "#00ffff",
        "#ffff00",
        "#ff6400",
        "#ff3c00",
        "#ff2800",
        "#ff1400",
        "#c80000",
        "#9b0000",
        "#460000",
        "#000000",
      ],
    },
    {
      paletteId: "atmosfera",
      rangeValues: { min: 0, max: 20 },
      step: 0.1,
      spectrum: [
        "#0a246a",
        "#0002f5",
        "#0072ff",
        "#00f2ff",
        "#32ffa8",
        "#6fff43",
        "#fff900",
        "#ffa200",
        "#ff6d00",
        "#c20000",
        "#030000",
      ],
    },
    {
      paletteId: "wave_med",
      rangeValues: { min: 0, max: 6 },
      step: 0.1,
      spectrum: [
        "#0a246a",
        "#0002f5",
        "#0072ff",
        "#00f2ff",
        "#32ffa8",
        "#6fff43",
        "#fff900",
        "#ffa200",
        "#ff6d00",
        "#c20000",
        "#030000",
      ],
    },
    {
      paletteId: "wave_atl",
      rangeValues: { min: 0, max: 10 },
      step: 0.1,
      spectrum: [
        "#0a246a",
        "#0002f5",
        "#0072ff",
        "#00f2ff",
        "#32ffa8",
        "#6fff43",
        "#fff900",
        "#ffa200",
        "#ff6d00",
        "#c20000",
        "#030000",
      ],
    },
    {
      paletteId: "historic",
      rangeValues: { min: 0, max: 20 },
      step: 0.1,
      spectrum: [
        "#0a246a",
        "#0002f5",
        "#0072ff",
        "#00f2ff",
        "#32ffa8",
        "#6fff43",
        "#fff900",
        "#ffa200",
        "#ff6d00",
        "#c20000",
        "#9d0202",
      ],
    },
    {
      paletteId: "historic_blue",
      rangeValues: { min: 0, max: 20 },
      step: 0.1,
      spectrum: [
        "#9ccdfb",
        "#87c4fc",
        "#69b5fc",
        "#4aa7ff",
        "#2c97fc",
        "#1b90ff",
        "#0b88fc",
        "#007df3",
        "#0070da",
        "#0066c6",
      ],
    },
  ],

  getColor(paletteId, value, max) {
    var palette = this.PALETTES.find((p) => p.paletteId == paletteId);
    if (max != null) {
      palette = { ...palette };
      palette.rangeValues.max = max;
    }
    var numberOfItems =
      (palette.rangeValues.max - palette.rangeValues.min) / palette.step;
    var position =
      ((value - palette.rangeValues.min) * numberOfItems) /
      palette.rangeValues.max;
    var rainbow = new Rainbow();
    rainbow.setNumberRange(1, numberOfItems);
    rainbow.setSpectrum(...palette.spectrum);
    var color = rainbow.colourAt(position);
    return color;
  },

  hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    let result = [r, g, b, [1]];
    return result;
  },

  getColorsArray(paletteId, step) {
    let result = [];
    var palette = this.PALETTES.find((p) => p.paletteId == paletteId);
    if (step != null) {
      palette = { ...palette };
      palette.step = step;
    }
    var numberOfItems =
      (palette.rangeValues.max - palette.rangeValues.min) / palette.step;
    var rainbow = new Rainbow();
    rainbow.setNumberRange(1, numberOfItems);
    rainbow.setSpectrum(...palette.spectrum);
    for (let position = 1; position <= numberOfItems; position++) {
      var color = rainbow.colourAt(position);
      result.push(this.hexToRgb(color));
    }
    return result;
  },
};

export default PaletteService;
