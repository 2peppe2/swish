const generateUUID = (): string => {
  const hexValues = "0123456789ABCDEF";
  let hexNumber = "";
  for (let i = 0; i < 32; i++) {
    hexNumber += hexValues[Math.floor(Math.random() * hexValues.length)];
  }
  return hexNumber;
};

export { generateUUID };