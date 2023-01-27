const ModbusTcpIpClient = require('modbus-tcp-ip-client')

const address = 'x.x.x.x'
const port = 502
const unitId = 1
const timeout = 800


// timeout is optional with  default value of 200 . 
//if timeout is reached client will throw an error .

const client = new ModbusTcpIpClient(address,port,unitId,timeout)

// to establish a connection
// you can overright the timeout value



    read32bit(423,1)  // read address 432 





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
 console.log(r)
console.log('result:'+result)

    
}

