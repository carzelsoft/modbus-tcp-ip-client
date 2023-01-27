
# Modify of Modbus TCP/Ip  Client
## by Carlos Zelaya
a simple Modbus library for communicating with remote Modbus devices via TCP/IP.


## Examples

```javascript
 
const ModbusTcpIpClient = require('modbus-tcp-ip-client')

const address = 'x.x.x.x'
const port = 502
const unitId = 1
const timeout = 800

const client = new ModbusTcpIpClient(address,port,unitId,timeout)

    read32bit(423,1)  
    read16bit(423,1)  

    async function read16bit(address) { 
        await client.connect(timeout) 
        
        
        const r = await client.readHoldingRegisters(address, 5); // read 5 register of 16bit
                        
        console.log('Address:'+address+'->'+r)
    }
        
        
        

async function read32bit( address,inicialposicion) {

    const quantity=5; 
   await client.connect(timeout)
   
    const r = await client.readHoldingRegisters(address, quantity);

 var z1 =  r[inicialposicion]; // choose your order by assigning a proper value

 var z2 =r[inicialposicion+1]; // choose your order by assigning a proper value

 var value = z2<<16 | z1;

 var b=value & 0x7fffff;

 var e=((value>>23) & 0xff)-127;

 var m=1+b*Math.pow(2, -23);

 var result=m*Math.pow(2, e);

 if (value & 0x80000000) {

result=-result;

 }
console.log('result:'+result)

    
}
```
## Important Notes
* This module was tested for Node.js 
* It was only tested on a HARDWARE PLC 
* DONT FORGET REPLACE MY src\index.js with correction to connect remote server


