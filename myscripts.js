var Config={
    //wsBroker : "192.168.1.123",
    //wsPort : 1884,
    wsBroker : "test.mosca.io",
    wsPort : 80,
	
	qos : 2,
	wsClientID : "ClientID_01",
	//wsClientID : "ClientID_" + parseInt(Math.random() * 100, 10),	
	wsTopic : "kitchen/light"
}

//execute this function once a web page has completely loaded
function autorun() {
	showSettings();
}

function showSettings() {
	document.getElementById("wsBroker").value = Config.wsBroker;
	document.getElementById("wsPort").value = Config.wsPort;
	document.getElementById("qos").value = Config.qos;
	document.getElementById("wsClientID").value = Config.wsClientID;
	document.getElementById("wsTopic").value = Config.wsTopic;	
}

function loadSettings() {
	Config.wsBroker = document.getElementById("wsBroker").value;
	Config.wsPort = parseInt(document.getElementById("wsPort").value);
	Config.qos = parseInt(document.getElementById("qos").value);
	Config.wsClientID = document.getElementById("wsClientID").value;
	Config.wsTopic = document.getElementById("wsTopic").value;	
}

function showStatus(log) {
	var mylog = document.getElementById('logs');
	mylog.value += log + "\n";
	mylog.scrollTop = mylog.scrollHeight; //move to bottom
	//console.log(log);
}

//creates a new Messaging client
function doConnect() {
	loadSettings();
	client = new Paho.MQTT.Client(Config.wsBroker, Config.wsPort, Config.wsClientID);
	//client.onConnected = onConnected;            // Callback when connected
	//client.disconnectedPublishing = true;        // Enable disconnected publishing
	//client.disconnectedBufferSize = 100;         //  Buffer size : 100
	client.onConnectionLost = onConnectionLost; // Callback when lost connection
	client.onMessageArrived = onMessageArrived;
	client.connect(
	{
		timeout: 5,
		cleanSession : true, 
		onSuccess : onConnectSuccess, 
		onFailure : onFailure, 
		keepAliveInterval: 30, 
	});
}

function disconnect() {
	client.disconnect();
	//document.getElementById("wsBroker").value = Config.wsBroker;
	showStatus("MQTT disconnected.");
}

//subscribe to a topic
function subscribe() {
	loadSettings();
	client.subscribe(Config.wsTopic, {qos: Config.qos});
	showStatus("Subscribed to topic " + Config.wsTopic);	
}

//unsubscribe from a topic
function unsubscribe() {
	client.unsubscribe(Config.wsTopic);
	showStatus("UnSubscribe from topic " + Config.wsTopic);	
}

//publish message to a topic
function publish() {
	loadSettings();	
	var msg = document.getElementById("msgSend").value;
	msg = Config.wsClientID + "," + msg;
	message = new Paho.MQTT.Message(msg);
	message.destinationName = Config.wsTopic;
	message.qos = Config.qos;
	message.retained = true;
	client.send(message);
	showStatus("Send: " + msg);
}

//called when connection successful
function onConnectSuccess(){
	showStatus(Config.wsBroker + " connected.");
}

//called when the connection is failed
function onFailure(message){
	showStatus("Connection failed: " + message.errorMessage);
}

//called when the client loses its connection
function onConnectionLost(responseObject) {
	if (responseObject.errorCode !== 0) {
		showStatus("onConnectionLost:" + responseObject.errorMessage);
	}
}

//called when a message arrives
var msgReceived = "";
function onMessageArrived(message) {
	msgReceived = message.payloadString;
	msgReceived = msgReceived.replace(/\n$/, ''); //remove new line	
	
	var myMsg = document.getElementById('msgReceived');
	myMsg.value += msgReceived + "\n";
	myMsg.scrollTop = myMsg.scrollHeight; //move to bottom
	
	//document.getElementById("msgReceived").value += msgReceived + "\n";
	if (countInstances(msgReceived) == 1) {
		var message_arr = extract_string(msgReceived); //split a string into an array		
		showStatus("Received from " + message_arr[0] + " value=" + message_arr[1]);	
		} else {	
		showStatus("Invalid payload");
	}	
}	

////////////////////////////////////////////////////
//split a string into an array of substrings
function extract_string(message_str) {
	var message_arr = message_str.split(","); //convert to array	
	return message_arr;
}	

//count number of delimiters in a string
var delimiter = ",";
function countInstances(message_str) {
	var substrings = message_str.split(delimiter);
	return substrings.length - 1;
}