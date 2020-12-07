import moment from "moment";

/* eslint-disable */

export const millisToReadable = (millis) => {

  const oneSecondInMillis = 1000;
  const oneMinuteInMillis = 60000;
  const oneHourInMillis = 3.6e6;
  const oneDayInMillis = 8.64e7;
  const oneMonthMillis = 2.628e9;
  const oneYearInMillis = 3.154e10; //3.154e10;

  const createTime = (millis) => new moment.duration(millis);

  let result = "";

  if (typeof millis !== "number") return "0 ms";

  let time = createTime(millis);

  let years = Math.floor(time.asYears());
  millis = millis - years * oneYearInMillis;
  time = createTime(millis);

  let months = Math.floor(time.asMonths());
  millis = millis - months * oneMonthMillis;
  time = createTime(millis);

  let days = Math.floor(time.asDays());
  millis = millis - days * oneDayInMillis;
  time = createTime(millis);

  let hours = Math.floor(time.asHours());
  millis = millis - hours * oneHourInMillis;
  time = createTime(millis);

  let minutes = Math.floor(time.asMinutes());
  millis = millis - minutes * oneMinuteInMillis;
  time = createTime(millis);

  let seconds = Math.floor(time.asSeconds());
  millis = millis - seconds * oneSecondInMillis;
  time = new moment.duration(millis);

  if (years > 0) {
    result += ` ${years}y`;
  }
  if (years > 0 || months > 0) {
    result += ` ${months}m`;
  }
  if (years > 0 || months > 0 || days > 0) {
    result += ` ${days}d`;
  }
  if (years > 0 || months > 0 || days > 0 || hours > 0) {
    result += ` ${hours}h`;
  }
  if (years > 0 || months > 0 || days > 0 || hours > 0 || minutes > 0) {
    result += ` ${minutes}m`;
  }
  if (
    years > 0 ||
    months > 0 ||
    days > 0 ||
    hours > 0 ||
    minutes > 0 ||
    seconds > 0
  ) {
    result += ` ${seconds}s`;
  }

  return result;
};
