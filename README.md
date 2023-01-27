const ModbusTcpIpClient = require('modbus-tcp-ip-client')

const address = '10.0.x.x'
const port = 502
const unitId = 1
const timeout = 800


// timeout is optional with  default value of 200 . 
//if timeout is reached client will throw an error .

const client = new ModbusTcpIpClient(address,port,unitId,timeout)

// to establish a connection
// you can overright the timeout value


read(1,600) // read range of address


async function leer( ini, fin) {
    const r =await client.connect(timeout)
    for (let i = ini; i <= fin; i++) {
   
 const r = await client.readHoldingRegisters(i, 5); // read 5 register of 16bit
 if(r[0]!=0 ||  r[1]!=0 || r[2]!=0 ||  r[3]!=0 ||  r[4]!=0 ){
    console.log('Address:'+i+'->'+r)
 }

    }
}


