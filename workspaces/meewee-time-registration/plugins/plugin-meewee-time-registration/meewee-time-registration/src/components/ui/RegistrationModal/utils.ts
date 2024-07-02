export const transformHoursMinsStringToMins = (timeString?: string): number => {
  if (timeString) {
    const [hours, minutes] = timeString.split(' ');

    const totalHours = parseFloat(hours) * 60 + parseFloat(minutes);

    return Number(totalHours);
  } else return 0;
}; // convert '1h 30m' to 90
