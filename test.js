const serialportgsm = require('serialport-gsm');
const modem = serialportgsm.Modem();
const options = {
    baudRate: 115200,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    xon: false,
    rtscts: false,
    xoff: false,
    xany: false,
    buffersize: 0,
    autoDeleteOnReceive: true,
    enableConcatenation: true
};

modem.open('COM9', options, (data)=>{console.log(data)});
modem.on('open', () => {
    modem.initializeModem(msg => console.log('initialize msg:', msg));
    modem.setModemMode(msg => console.log('set pdu msg:', msg), 'PDU');
    modem.sendSMS('+573206775767', `Hello there zabadasdasdasddwddb sfsifuidiufu9f9ufusdfusdhfu9ha9hew9fh ashfisuadfiushusha h fhsuhfiaHello there zabadasdasdasddwddb sfsifuidiufu9f9ufusdfusdhfu9ha9hew9fh ashfisuadfiushusha h fhsuhfiasuh!suh!`, false, function (response) {
        console.log('message status', response)
    })
});
modem.on('close', msg => console.log('on close msg:' , msg));

modem.on('error',  msg => console.log('on error msg:' , msg));