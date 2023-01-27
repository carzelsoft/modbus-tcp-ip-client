const net = require("net");
const ADUMaker = require("./utilities/ADUMaker");
const {
  supportedFunctionCodes,

  calculateCount,
} = require("./utilities/utilities.js");
const { responseInterpreter } = require("./utilities/respnseInterpreter");

const createPrivates = () => {
  return {
    ip: "",
    port: 0,
    unitId: 0,
    client: null,
    timeout: 200,
    isConnected: false,
    tid: 1,
  };
};
const createPrivateMethods = (privates) => {
  return {
    incrementTid() {
      if (privates.tid < 0xffff) {
        return (privates.tid += 1);
      }
      privates.tid = 1;
    },

    getResponse() {
      return new Promise((resolve, reject) => {
        const dataHandler = (data) => {
          resolve(data);

          privates.client.removeListener("data", dataHandler);
        };
        privates.client.on("data", dataHandler);
      });
    },
    read(start, quantity, functionName) {
      return new Promise(async (resolve, reject) => {
        if (arguments.length !== 3) {
          reject(
            new Error(
              "clinet error : invalid  number of arguments you must provide an address and a quantity (both numbers)"
            )
          );
        }
        if (typeof start !== "number") {
          reject(
            new Error(
              "clinet error : invalid address (start type must be number)"
            )
          );
        }
        if (typeof quantity !== "number") {
          reject(
            new Error(
              "clinet error : invalid quantity (quantity type must be number)"
            )
          );
        }
        if (start < 0) {
          reject(
            new Error(
              "clinet error : invalid address (start must be 0 or more)"
            )
          );
        }
        if (quantity <= 0) {
          reject(
            new Error(
              "clinet error : invalid quantity (quantity must be 1 or more)"
            )
          );
        }
        const isConnected = this.getIsConnected();
        const tid = this.getTid();
        const unitId = this.getUnitId();
        const client = this.getClient();
        if (isConnected) {
          const buffer = ADUMaker(
            tid,
            0x06,
            unitId,
            functionName,
            Number(start),
            Number(quantity)
          );
          client.write(buffer);

          responseInterpreter(
            await this.getResponse(),
            quantity,
            resolve,
            reject
          );

          this.incrementTid();
        } else {
          reject(
            new Error("client error : cannot read before connecting to server")
          );
        }
      });
    },
    getIp() {
      return privates.ip;
    },
    getPort() {
      return privates.port;
    },
    getUnitId() {
      return privates.unitId;
    },
    getClient() {
      return privates.client;
    },
    getIsConnected() {
      return privates.isConnected;
    },
    getTimeOut() {
      return privates.timeOut;
    },
    getTid() {
      return privates.tid;
    },
    setIp(ip) {
      privates.ip = ip;
    },
    setPort(port) {
      privates.port = port;
    },
    setUnitId(unitId) {
      privates.unitId = unitId;
    },
    setClient(client) {
      privates.client = client;
    },
    setIsConnected(isConnected) {
      privates.isConnected = isConnected;
    },
    setTimeOut(timeout) {
      privates.timeOut = timeout;
      if (privates.client) privates.client.setTimeout(timeout);
    },
    setTid(tid) {
      privates.tid = tid;
    },
  };
};

class ModbusTcpIpClient {
  constructor(ip, port, unitId, timeout) {
    const privates = createPrivates();
    privates.ip = ip;
    privates.port = port;
    privates.unitId = unitId;
    privates.client = null;
    privates.timeout = typeof timeout == "number" ? timeout : 200;
    privates.isConnected = false;
    privates.tid = 1;
    this._privateMethods = createPrivateMethods(privates);
    this.getTimeout = function () {
      return this._privateMethods.getTimeOut();
    };

    this.getIsConnected = function () {
      return this._privateMethods.getIsConnected();
    };
  }

  setTimeout(timeout) {
    if (typeof timeout === "number" && timeout >= 50) {
      this._privateMethods.setTimeOut(timeout);

      return;
    }
    if (timeout === undefined) {
      return;
    }
    return Promise.reject(
      new Error("client error : timemout must be a positive number >= 50")
    );
  }
  async connect(timeout) {
    const ip = this._privateMethods.getIp();
    const port = this._privateMethods.getPort();
    return new Promise((resolve, reject) => {
      const client = net
        .connect({ port: port, host: ip, family: 4 }, () => {
          this._privateMethods.setClient(client);
          this._privateMethods.setIsConnected(true);
          if (typeof timeout === "number") {
            this._privateMethods.setTimeOut(timeout);
          }

          resolve(this);
          this._privateMethods.getClient().on("error", (error) => {
            reject(error.message);
          });
          this._privateMethods.getClient().on("timeout", () => {
            reject(new Error("timeout reached"));
          });
        })
        .on("error", (error) => {
          reject(error.message);
        });
    });
  }

  disconnect() {
    const client = this._privateMethods.getClient();
    client.destroy();
    this._privateMethods.setClient(null);
    this._privateMethods.setIsConnected(false);
  }

  readCoils(start, quantity) {
    return new Promise(async (resolve, reject) => {
      const functionName = supportedFunctionCodes.readCoils;
      try {
        const res = await this._privateMethods.read(...arguments, functionName);
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }
  readInputs(start, quantity) {
    return new Promise(async (resolve, reject) => {
      const functionName = supportedFunctionCodes.readInputs;
      try {
        const res = await this._privateMethods.read(...arguments, functionName);
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }
  readInputRegisters(start, quantity) {
    return new Promise(async (resolve, reject) => {
      const functionName = supportedFunctionCodes.readInputRegisters;
      try {
        const res = await this._privateMethods.read(...arguments, functionName);
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }
  readHoldingRegisters(start, quantity) {
    return new Promise(async (resolve, reject) => {
      const functionName = supportedFunctionCodes.readHoldingRegisters;
      try {
        const res = await this._privateMethods.read(...arguments, functionName);
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }
  writeSingleCoil(address, bool = 1) {
    return new Promise(async (resolve, reject) => {
      if (arguments.length !== 2) {
        reject(
          new Error(
            "clinet error : insufficient arguments number you must provide an address of type number and a value possible values are 1,0,true,false"
          )
        );
      }
      if (typeof address !== "number") {
        reject(
          new Error(
            "clinet error : invalid address (address type must be number)"
          )
        );
      }
      if (address < 0) {
        reject(
          new Error(
            "clinet error : invalid address (address type must be 0 or greater)"
          )
        );
      }
      if (!~[true, 1, false, 0].indexOf(bool)) {
        reject(
          new Error(
            "clinet error : invalid bool possible values are 1,0,true,false"
          )
        );
      }
      const isConnected = this._privateMethods.getIsConnected();
      const tid = this._privateMethods.getTid();
      const unitId = this._privateMethods.getUnitId();
      const client = this._privateMethods.getClient();
      if (isConnected) {
        let value = ~[true, 1].indexOf(bool) ? 0xff00 : 0x00;

        const functionName = supportedFunctionCodes.writeSingleCoil;
        const buffer = ADUMaker(
          tid,
          0x06,
          unitId,
          functionName,
          address,
          value
        );

        client.write(buffer);
        responseInterpreter(
          await this._privateMethods.getResponse(),
          1,
          resolve,
          reject
        );

        this._privateMethods.incrementTid();
      } else {
        reject(
          new Error("client error : cannot read before connecting to server")
        );
      }
    });
  }
  writeSingleRegister(address, value) {
    return new Promise(async (resolve, reject) => {
      if (arguments.length !== 2) {
        reject(
          new Error(
            "clinet error : insufficient arguments number you must provide an address of type number and a value also of type number "
          )
        );
      }
      if (typeof address !== "number") {
        reject(
          new Error(
            "clinet error : invalid address (address type must be number)"
          )
        );
      }
      if (typeof value !== "number") {
        reject(
          new Error(
            "clinet error : invalid value (value type must be a number)"
          )
        );
      }
      if (address < 0) {
        reject(
          new Error(
            "clinet error : invalid address (address type must be 0 or greater)"
          )
        );
      }
      const isConnected = this._privateMethods.getIsConnected();
      const tid = this._privateMethods.getTid();
      const unitId = this._privateMethods.getUnitId();
      const client = this._privateMethods.getClient();
      if (isConnected) {
        const functionName = supportedFunctionCodes.writeSingleRegister;
        const buffer = ADUMaker(
          tid,
          0x06,
          unitId,
          functionName,
          address,
          value
        );

        client.write(buffer);
        responseInterpreter(
          await this._privateMethods.getResponse(),
          1,
          resolve,
          reject
        );

        this._privateMethods.incrementTid();
      } else {
        reject(
          new Error("client error : cannot read before connecting to server")
        );
      }
    });
  }
  writeMultiplecoils(start, values) {
    return new Promise(async (resolve, reject) => {
      if (arguments.length !== 2) {
        reject(
          new Error(
            "clinet error : improper arguments number you must provide an address of type number and an array of possible values 1,0,false,true"
          )
        );
      }
      if (typeof start !== "number") {
        reject(
          new Error(
            "clinet error : invalid address (address type must be number)"
          )
        );
      }
      if (start < 0) {
        reject(
          new Error(
            "clinet error : invalid start (address type must be 0 or greater)"
          )
        );
      }
      if (!Array.isArray(values)) {
        reject(
          new Error(
            "clinet error : invalid argument values must be an arry of vlues like 1,0,false,true"
          )
        );
      }
      if (Array.isArray(values)) {
        if (
          values.reduce((pre, acc) => {
            return !~[true, false, 0, 1].indexOf(acc) ? true : pre;
          }, false)
        ) {
          reject(
            new Error(
              "clinet error : invalid argument values must be an arry of vlues like 1,0,false,true"
            )
          );
        }
      }
      const isConnected = this._privateMethods.getIsConnected();
      const tid = this._privateMethods.getTid();
      const unitId = this._privateMethods.getUnitId();
      const client = this._privateMethods.getClient();
      if (isConnected) {
        const count = calculateCount(
          supportedFunctionCodes.writeMultipleCoils,
          values.length
        );

        const length = 7 + count;
        const functionName = supportedFunctionCodes.writeMultipleCoils;
        const buffer = ADUMaker(
          tid,
          length,
          unitId,
          functionName,
          start,
          values.length,
          count,
          values
        );

        client.write(buffer);

        responseInterpreter(
          await this._privateMethods.getResponse(),
          values.length,
          resolve,
          reject
        );

        this._privateMethods.incrementTid();
      } else {
        reject(
          new Error("client error : cannot read before connecting to server")
        );
      }
    });
  }
  writeMultipleRegisters(start, values) {
    return new Promise(async (resolve, reject) => {
      if (arguments.length !== 2) {
        Promise.reject(
          new Error(
            "clinet error : improper arguments number you must provide an address of type number and an array of numbers"
          )
        );
      }
      if (typeof start !== "number") {
        Promise.reject(
          new Error(
            "clinet error : invalid address (address type must be number)"
          )
        );
      }
      if (start < 0) {
        reject(
          new Error(
            "clinet error : invalid start (address type must be 0 or greater)"
          )
        );
      }
      if (!Array.isArray(values)) {
        Promise.reject(
          new Error(
            "clinet error : invalid argument values must be an arry containing only numbers"
          )
        );
      }
      if (Array.isArray(values)) {
        if (
          values.reduce((pre, acc) => {
            return typeof acc !== "number" ? true : pre;
          }, false)
        ) {
          Promise.reject(
            new Error(
              "clinet error : invalid argument values must be an arry containing only numbers"
            )
          );
        }
      }
      const isConnected = this._privateMethods.getIsConnected();
      const tid = this._privateMethods.getTid();
      const unitId = this._privateMethods.getUnitId();
      const client = this._privateMethods.getClient();
      if (isConnected) {
        const count = calculateCount(
          supportedFunctionCodes.writeMultipleRegisters,
          values.length
        );
        const functionName = supportedFunctionCodes.writeMultipleRegisters;
        const length = 7 + count;
        const buffer = ADUMaker(
          tid,
          length,
          unitId,
          functionName,
          start,
          values.length,
          count,
          values
        );

        client.write(buffer);

        responseInterpreter(
          await this._privateMethods.getResponse(),
          values.length,
          resolve,
          reject
        );

        this._privateMethods.incrementTid();
      } else {
        reject(
          new Error("client error : cannot read before connecting to server")
        );
      }
    });
  }
}

module.exports = ModbusTcpIpClient;
