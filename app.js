/*
let serialportgsm = require('serialport-gsm')

serialportgsm.list((err, result) => {
    console.log(result)
})


modem.open('COM1', options, (data) => { console.log(data) });
modem.on('open', () => {
    modem.initializeModem(msg => console.log('initialize msg:', msg));
    modem.setModemMode(msg => console.log('set pdu msg:', msg), 'PDU');
    modem.sendSMS('+573246641125', `Hello there zab!`, false, function (response) {
        console.log('message status', response)
    })
});

const serialportgsm = require('serialport-gsm');

var gsmModem = serialportgsm.Modem()
let options = {
    baudRate: 115200,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    xon: false,
    rtscts: false,
    xoff: false,
    xany: false,
    autoDeleteOnReceive: true,
    enableConcatenation: true,
    incomingCallIndication: true
}


let phone = {
    name: "Paul",
    number: "+573246641125",
    mode: "PDU"
}

var message = `Hello ${phone.name}, Try again....This message was sent from Paul\'s Raspberry Pi NodeJs web server! - please do not respond back`;	    

gsmModem.open('COM4', options, (data) => {console.log(`Modem Opened ${data}`)});
gsmModem.on('open', () => {
    gsmModem.initializeModem((msg) => console.log(`Modem initialize msg: ${msg}`));
    gsmModem.setModemMode(msg => {
	console.log(`Set Mode to ${phone.mode}`);
	console.log(`Who ${phone.name} number ${phone.number}`);
	console.log(`Return Message =  ${msg}`);
    }, phone.mode);
    gsmModem.getNetworkSignal(result => {
	console.log(`Signal Strength = ${result}`);
    });
});

gsmModem.on('error', (err) => {
    console.log(`Modem threw error: ${err}`);
    gsmModem.getNetworkSignal((result) => {
	console.log(`Signal Strength = ${result}`);
    });
});

*/
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


async function sendMessageAll(body = {path: 'COM13', phone: '+573246641125', sms: 'Ha!'}){
	var list = [];
	var phone = '', phones = body.phone.trim().split(',').map(e=>e.trim()).filter(e=> e != null && e != '');
	while(phone = phones.shift()){
		var result = await sendMessage(Object.assign(body, {phone}));
		list.push(result);
	}
	return list;
};

async function sendMessage(body = {path: 'COM13', phone: '+573246641125', sms: 'Ha!'}){
	return await new Promise(function(callback){
		var phone = body.phone;
		var result = null;
		var status = null;
		var modem1 = serialportgsm.Modem();
		modem1.open(body.path, options, (data) => {
			//console.log('connect:', data);
		});
		modem1.on('open', (data) => {
			console.log('onconnect-data:', body.phone, data);
			modem1.setModemMode(msg => {
				console.log('set pdu msg:', body.phone, msg);
			}, 'PDU');
			modem1.sendSMS(body.phone, body.sms, false, function (response) {
				console.log('message status:', body.phone, response);
				status = response;
				if(status.status == 'success'){
					modem1.initializeModem(msg => {
						result = msg;
						console.log('initialize msg:', body.phone, msg);
						modem1.close();
					});
				}else{
					modem1.close();
				}
			});
		});
		modem1.on('close', msg => {
			callback({'close': msg, phone, result, status});
		});
		modem1.on('error', msg => {
			callback({'error': msg, phone, result, status});
		});
	});
};
/*
sendMessage().then(result => {
	console.log('result:', result);
	console.log('\r\r');
	sendMessage().then(result => {
		console.log('result:', result);
	});
});*/


/*
modem.open('COM3', options, (data)=>{console.log(data)});
modem.on('open', () => {
    modem.initializeModem(msg => console.log('initialize msg:', msg));
    modem.setModemMode(msg => console.log('set pdu msg:', msg), 'PDU');
    modem.sendSMS('+573223177720', `Hello there zabadasdasdasddwddb sfsifuidiufu9f9ufusdfusdhfu9ha9hew9fh ashfisuadfiushusha h fhsuhfiaHello there zabadasdasdasddwddb sfsifuidiufu9f9ufusdfusdhfu9ha9hew9fh ashfisuadfiushusha h fhsuhfiasuh!suh!`, false, function (response) {
        console.log('message status', response)
    })
});
modem.on('close', msg => console.log('on close msg:' , msg));

modem.on('error',  msg => console.log('on error msg:' , msg));
*/

/*
serialportgsm.list((err, result) => {
    console.log('result:', result);
});
*/

const express = require('express'); //Line 1
const app = express(); //Line 2
const port = process.env.PORT || 5000; //Line 3

const path = require('path');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`)); //Line 6
app.use(express.static(path.join(__dirname, 'client/build')));

async function getPorts(){
	var list = [];
	console.log('get list.\r');
	//////////////////////
	list = await new Promise(function(callback){
		serialportgsm.list(async function(err, result){
			var all = [].slice.call(result);
			var temp = [];
			while(obj = all.shift()){
				//console.log('obj:', obj);
				await new Promise(R => {
					var modem1 = serialportgsm.Modem();
					modem1.open(obj.path, options, () => {
						modem1.checkModem((data, error) => {
							if(error != undefined){
								console.log('checkModem:', obj.path, 'No se puese enviar SMS en este puerto.');
							}else{
								console.log('checkModem:', obj.path, data);
								temp.push(obj);
							}
							modem1.close();
							R();
						}, null, 1000);
					});
					modem1.on('close', msg => {
						try{ R(); }catch(ex){}
					});
					modem1.on('error', msg => {
						try{ R(); }catch(ex){}
					});
				});
			};
			callback(temp);
		});
	});
	//////////////////////
	return list;
};

//getPorts().then(list => console.log('list:', list));

app.get('/get_ports', async (req, res) => {
	var list = await getPorts();
	res.status(200).send(JSON.stringify(list));
});

app.post('/send_sms', async (req, res) => {
	const {body = null} = req;
	console.log('body:', body);
	//var result = {ok: false, error: 'klk mm verga'};
	// result = await otraFunction(body);
	var result = await sendMessageAll(body);
	res.status(200).send(result);
});

// GET session
app.get('/', async (req, res) => {
	//res.status(200).send(``);
	var file = path.resolve(process.cwd(), 'index.html');
	res.status(200).sendFile(file);
});