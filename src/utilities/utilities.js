const supportedFunctionCodes = {
  readCoils: "read-coil",
  readInputs: "read-input",
  readHoldingRegisters: "read-holding-registers",
  readInputRegisters: "read-input-registers",
  writeSingleCoil: "write-single-coil",
  writeSingleRegister: "write-single-register",
  writeMultipleCoils: "write-multiple-coils",
  writeMultipleRegisters: "write-multiple-registers",
};
const messageToFunctionCode = {
  "read-coil": 0x01,
  "read-input": 0x02,
  "read-holding-registers": 0x03,
  "read-input-registers": 0x04,
  "write-single-coil": 0x05,
  "write-single-register": 0x06,
  "write-multiple-coils": 0x0f,
  "write-multiple-registers": 0x10,
};
const functionCodeToMessage = {
  0x01: "read-coils",
  0x02: "read-inputs",
  0x03: "read-holding-registers",
  0x04: "read-input-registers",
  0x05: "write-single-coil",
  0x06: "write-single-register",
  0x0f: "write-multiple-coils",
  0x10: "write-multiple-registers",
};
const functionCodeErrors = {
  0x81: "read coils",
  0x82: "read inputs",
  0x83: "read holding registers",
  0x84: "read input registers",
  0x85: "write single coil",
  0x86: "write single register",
  0x8f: "write multiple coils",
  0x90: "write multiple registers",
};
const exceptionCodes = {
  0x01: "invalide functioncode",
  0x02: "invalide data  address",
  0x03: "invalide data  value",
  0x04: "execution error",
  
};
const isNumber = (number) => {
  return typeof number === "number";
};
const isPositiveNumber = (number) => {
  return isNumber(number) && number > 0;
};
const decToHex = (number) => {
  return number.toString(16);
};
const isByte = (number) => {
  return number <= 0xff;
};
const calculateCount = (type, quantity) => {
  if (type === supportedFunctionCodes.writeMultipleCoils) {
    return quantity % 8 ? Math.floor(quantity / 8 + 1) : quantity / 8;
  }
  if (type === supportedFunctionCodes.writeMultipleRegisters) {
    return quantity * 2;
  }
};

const decomposeWordAndGetArray = (number) => {
  const L = number % 0x100;
  const H = (number - L) / 0x100;
  return [H, L];
};
const decomposeDoubleWordAndGetArray = (number) => {
  const L = number % 0x100;
  const H = ((number % 0x10000) - L) / 0x100;
  const L1 = ((number - H * 0x100 - L) / 0x10000) % 0x100;
  const H1 = (number - L1 * 0x10000 - H * 0x100 - L) / 0x1000000;
  return [H1, L1, H, L];
};

module.exports = {
  messageToFunctionCode,
  functionCodeToMessage,
  supportedFunctionCodes,
  exceptionCodes,
  isPositiveNumber,
  decToHex,
  isByte,
  decomposeWordAndGetArray,
  decomposeDoubleWordAndGetArray,
  calculateCount,
  
};
