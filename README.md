
# Modbus TCP/Ip  Client

a simple Modbus library for communicating with remote Modbus devices via TCP/IP.

## Install

```bash
 npm i modbus-tcp-ip-client
```
## Establishing Connection

```javascript
 const ModbusTcpIpClient = require('modbus-tcp-ip-client')

 const address = "<your device's ip address>"
 const port = "<your device's port>"
 const unitId = "<your device's unit id>"
 const timeout = "<desired communication timemout>"

 // timeout is optional with  default value of 200 . 
 //if timeout is reached client will throw an error .

 const client = new ModbusTcpIpClient(address,port,unitId,timeout)

 // to establish a connection
 // you can overright the timeout value

await client.connect("<optional timeout value>")
```
## Supported Function Codes

supported function codes are :

* 0x01 : read coils 
* 0x02 : read inputs
* 0x03 : read holding registers 
* 0x04 : read input registers 
* 0x05 : write single coil 
* 0x06 : write single register 
* 0x0f : write multiple coils 
* 0x10 : write multiple registers 

## Exceptions
exceptions have 2 types :

* modbus server exceptions
* modbus client exceptions

modbus server exceptions :

  * 0x01 : invalide functioncode
  * 0x02 : invalide data  address
  * 0x03 : invalide data  value
  * 0x04 : execution error

modbus client exeption :

these are  exeptions related to this npm module, thrown in case of communication timeout and/or error, and for invalid arguments provided by the user.


## Examples

```javascript
 await client.writeSingleCoil(0, true);
 // first argument is address and the second is a value 
 // address is a number, and value can be 1,0,true, or false

 await client.writeMultiplecoils(1, [1, true, 1, 0, false]);
  // first argument is address and the second is an array of values
 // address is a number, and values can only contain values such  1,0,true, or false.
 // element with the lowest index is mapped to the LSB
 
 await client.writeSingleRegister(0x00, 5625);
  // first argument is address and the second is a value both are numbers

 await client.writeMultipleRegisters(0x00, [11, 68, 0, 84, 69]);
   // first argument is address and the second is an array of values all of which are numbers
   // element with the lowest index is mapped to the LSB



 // all reading functions have two arguments address, and number
 // based on the examples above 

 const res1 = await client.readCoils(0x00, 1);
 // this returns [true]
   
 const res2 = await client.readInputs(0,3)
 // this returns [true/false,true/false,true/false]

 const res3 = await client.readHoldingRegisters(0, 5);
 // this returns  [11, 68, 0, 84, 69]

 const res4 = await client.readInputRegisters(0,2)
  // this returns [a number, another number]

```
## Important Notes
* This module was tested for Node.js version 12.0.0 and above
* It was only tested on a PLC simulator software 



