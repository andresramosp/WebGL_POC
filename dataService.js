import axios from "axios";

const interPolate = (data, newMin, newMax) => {
  const min = Math.min.apply(
    Math,
    data.map((arr) => arr[2])
  );
  const max = Math.max.apply(
    Math,
    data.map((arr) => arr[2])
  );
  return data.map((row) => {
    row[2] = ((row[2] - min) * (newMax - newMin)) / (max - min) + newMin;
    return row;
  });
};

const getTimeData = async (time) => {
  const { data } = await axios.post(
    "http://localhost:8082/portuscopia//api/catalog/ncdata",
    {
      catalogRefID: "circulation_coastal_fer",
      date: `2022-07-21T${time.toString().padStart(2, "0")}:00:00.404Z`,
      isMean: false,
      variable: "u",
    }
  );
  return data; //interPolate(data, 0, 100);
};

export default getTimeData;
