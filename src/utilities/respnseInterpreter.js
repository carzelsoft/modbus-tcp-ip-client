const {
  exceptionCodes,
  supportedFunctionCodes,
  messageToFunctionCode,
} = require("./utilities");
const responseInterpreter = (responseBuffer, l, resolve, reject) => {
  const resArray = Array.prototype.slice.call(responseBuffer);

  const fuctionCode = resArray[7];

  if (fuctionCode > 0x80) {
    reject(
      new Error(
        `modbus server exception code : ${resArray[8]} (${
          exceptionCodes[resArray[8]]
        })`
      )
    );
  }

  if (
    fuctionCode === messageToFunctionCode[supportedFunctionCodes.readCoils] ||
    fuctionCode === messageToFunctionCode[supportedFunctionCodes.readInputs]
  ) {
    const resBytes = resArray
      .slice(8 + 1)
      .map((byte, index) => {
        let str = byte.toString(2);
        if (str === "0") {
          return "00000000";
        }
        if (str.length < 8) {
          while (str.length < 8) {
            str = "0" + str;
          }
          return str;
        }
        return str;
      })
      .reduce((pre, acc) => {
        pre.push(
          ...acc
            .split("")
            .reverse()
            .map((strByteite, index) => {
              return parseInt(strByteite, 2);
            })
        );
        return pre;
      }, [])
      .slice(0, l);
    resolve(resBytes);
  }
  if (
    fuctionCode ===
      messageToFunctionCode[supportedFunctionCodes.readHoldingRegisters] ||
    fuctionCode ===
      messageToFunctionCode[supportedFunctionCodes.readInputRegisters]
  ) {
    resolve(
      resArray
        .slice(9)
        .reduce((pre, acc, index) => {
          if (index % 2 === 0) {
            pre.push(acc * 256);
            return pre;
          }

          let lastElement = pre.pop();
          lastElement += acc;
          pre.push(lastElement);
          return pre;
        }, [])
        .slice(0, l)
    );
  }
  if (
    fuctionCode ===
    messageToFunctionCode[supportedFunctionCodes.writeSingleCoil]
  ) {
    resolve(resArray[10] === 0xff ? true : false);
  }

  if (
    fuctionCode ===
      messageToFunctionCode[supportedFunctionCodes.writeSingleRegister] ||
    fuctionCode ===
      messageToFunctionCode[supportedFunctionCodes.writeMultipleCoils] ||
    fuctionCode ===
      messageToFunctionCode[supportedFunctionCodes.writeMultipleRegisters]
  ) {
    resolve(resArray[11] + resArray[10] * 256);
  }
};

module.exports = { responseInterpreter };
