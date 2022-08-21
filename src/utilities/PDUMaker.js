const {
  messageToFunctionCode,
  isByte,
  decomposeWordAndGetArray,
} = require("./utilities");

const PDUReadsAndSingleWritesMaker = (
  type,
  startOrAddress,
  quantityOrValue
) => {
  const functionCode = messageToFunctionCode[type];
  const functionCodeBuffer = Buffer.from([functionCode]);
  const startOrAddressBuffer = isByte(startOrAddress)
    ? Buffer.from([0x00, startOrAddress])
    : Buffer.from(decomposeWordAndGetArray(startOrAddress));
  const quantityOrValueBuffer = isByte(quantityOrValue)
    ? Buffer.from([0x00, quantityOrValue])
    : Buffer.from(decomposeWordAndGetArray(quantityOrValue));

  return Buffer.concat([
    functionCodeBuffer,
    startOrAddressBuffer,
    quantityOrValueBuffer,
  ]);
};

const PDUMultyWritesMaker = (type, start, quantity, count, values) => {
  const valuesBuffer = [];
  const functionCode = messageToFunctionCode[type];
  const functionCodeBuffer = Buffer.from([functionCode]);
  const startBuffer = isByte(start)
    ? Buffer.from([0x00, start])
    : Buffer.from(decomposeWordAndGetArray(start));
  const quantityBuffer = isByte(quantity)
    ? Buffer.from([0x00, quantity])
    : Buffer.from(decomposeWordAndGetArray(quantity));
  const countBuffer = Buffer.from([count]);

  switch (type) {
    case "write-multiple-registers":
      values.forEach((value, index) => {
        valuesBuffer.push(
          ...decomposeWordAndGetArray(value).map((v, index) => {
            return Buffer.from([v]);
          })
        );
      });

      break;
    case "write-multiple-coils":
      const length = values.length;
      values = values.reduce((pre, acc, index) => {
        if (~[true, 1].indexOf(acc)) {
          pre.push(1);
          return pre;
        }
        pre.push(0);
        return pre;
      }, []);

      let lastBits = [];
      if (length % 8 > 0) {
        lastBits = values.splice(length - (length % 8));
        lastBits = lastBits;

        for (let i = 0; i < 8 - (length % 8); i++) {
          lastBits.push(0);
        }
      }

      if (lastBits.length) {
        values = values.concat(lastBits);
      }

      values = values.join("");
      const arr = [];
      for (let i = 0; i < values.length; i++) {
        if (i % 8 === 0) {
          arr.push(
            values
              .slice(i, i + 8)
              .split("")
              .reverse()
              .join("")
          );
        }
      }
      arr.forEach((byte, index) => {
        valuesBuffer.push(Buffer.from([parseInt(byte, 2)]));
      });
      valuesBuffer.push(Buffer.from(values));
  }

  return Buffer.concat([
    functionCodeBuffer,
    startBuffer,
    quantityBuffer,
    countBuffer,
    ...valuesBuffer,
  ]);
};

const makePDU = (...args) => {
  if (args.length === 3) {
    return PDUReadsAndSingleWritesMaker(...args);
  }
  return PDUMultyWritesMaker(...args);
};
module.exports = { PDUReadsAndSingleWritesMaker, PDUMultyWritesMaker, makePDU };
