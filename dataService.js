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

const getMinMaxRange = async (catalogRefID, from, to, variable) => {
  const { data } = await axios.post(
    "http://localhost:8082/portuscopia//api/catalog/ncdata/minmax",
    {
      catalogRefID,
      from,
      to,
      isMean: false,
      variable,
    }
  );
  return data;
};

const getTimeData = async (
  catalogRefID,
  date,
  variable,
  minValue,
  maxValue
) => {
  const { data } = await axios.post(
    "http://localhost:8082/portuscopia//api/catalog/ncdata",
    {
      catalogRefID,
      date,
      isMean: false,
      variable,
      minValue,
      maxValue,
    }
  );
  return data;
};

export { getTimeData, getMinMaxRange };
