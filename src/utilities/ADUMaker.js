const { decomposeWordAndGetArray } = require("./utilities");
const { makePDU } = require("./PDUMaker");

const makeMBAP = (tid, length, unitId) => {
  const tidArray = decomposeWordAndGetArray(tid);
  const protocalIdArray = decomposeWordAndGetArray(0x0000);
  const lengthArray = decomposeWordAndGetArray(length);

  const tidBuffer = Buffer.from(tidArray);
  const protocalIdBuffer = Buffer.from(protocalIdArray);
  const lengthBuffer = Buffer.from(lengthArray);
  const unitIdBuffer = Buffer.from([unitId]);

  return Buffer.concat([
    tidBuffer,
    protocalIdBuffer,
    lengthBuffer,
    unitIdBuffer,
  ]);
};

const ADUMaker = (tid, length, unitId, ...PDUArgs) => {
  const MBABuffer = makeMBAP(tid, length, unitId);
  const PDUBuffer = makePDU(...PDUArgs);
  return Buffer.concat([MBABuffer, PDUBuffer]);
};
module.exports = ADUMaker;
