import times from './pointsTemp';
const getTimeData = async time => {
  const delay = 500; //Math.random() * 10000;
  console.log('pidiendo al back ', time, delay);
  await new Promise(resolve => setTimeout(resolve, delay));
  return new Promise(resolve => resolve(times[time]));
};

export default getTimeData;
