export const secondsSinceGivenTime = async (
  givenDate: Date
): Promise<number> => {
  const currentDate = new Date();

  const differenceInMilliseconds = currentDate.getTime() - givenDate.getTime();

  const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);

  return differenceInSeconds;
};
