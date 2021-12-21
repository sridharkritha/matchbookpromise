(function () { // namespace
	// https://developers.matchbook.com/reference
	const myLoginDetails = require("../../GitHubOutside/myLoginDetails/secret.json");
	const fs = require('fs').promises; // promise version of require('fs');

	const UTILS = require('./misc/utils');

	const express = require("express");
	const app = express();
	const httpServer = require("http").createServer(app); // explicitly create a 'http' server instead of using express() server

	app.use(express.json());               // for body parsing
	app.use(express.static('clientSide')); // path to public folder

	const { MongoClient } = require('mongodb');

	const PORT = process.env.PORT || 3456; // 3000;

	/////////////////////////////////// GOT HTTP request module ////////////////////////////////////////////////////////
	// npm i got@11.8.2  
	const got = require('got'); // like Fetch api but it is for server side to give the HTTP request to another server

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Login : Login to Matchbook and create a new session.
	// POST: https://api.matchbook.com/bpapi/rest/security/session

	// POST(REST API): Login to Matchbook and Create & Get a new session token.
	let g_sessionToken =  null;
	loginAndGetSessionToken = async function (usernamePasswordObject) {
		try {
				const { body } = await got.post('https://api.matchbook.com/bpapi/rest/security/session', {
														json:{
																username: usernamePasswordObject.username,
																password: usernamePasswordObject.password
															},
														responseType: 'json'
											});

				console.log(body); // msg from Server
				g_sessionToken = body['session-token'];
				g_lastLoginTime = body['last-login'];
				UTILS.storeCookie(g_sessionToken, g_lastLoginTime);

				// MAIN FUNCTION STARTS HERE !!!
				main(); // After Login Flow;
		}
		catch(e) {
			console.log(e);
		}
	}(myLoginDetails); // self executing - startup function

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Get Events: Get a list of events available on Matchbook ordered by start time.
	// GET: https://api.matchbook.com/edge/rest/events

	// GET(REST API) request
	async function getEvents() {
		try {
				//'https://api.matchbook.com/edge/rest/events?offset=0&per-page=20&states=open%2Csuspended%2Cclosed%2Cgraded&exchange-type=back-lay&odds-type=DECIMAL&include-prices=false&price-depth=3&price-mode=expanded&include-event-participants=false&exclude-mirrored-prices=false'

				const queryObject = {
					'offset': '0',
					'per-page': '20',
					'states': 'open%2Csuspended%2Cclosed%2Cgraded',
					'exchange-type': 'back-lay',
					'odds-type': 'DECIMAL',
					'include-prices': 'false',
					'price-depth': '3',
					'price-mode': 'expanded',
					'include-event-participants': 'false',
					'exclude-mirrored-prices': 'false'
				};

				const { body } = await got('https://api.matchbook.com/edge/rest/events'+ '?'+ UTILS.objectToUrlQueryString(queryObject));

				console.log(body); // msg from Server
				// await fs.writeFile('db/popularSports.json', body, 'utf8');
				await fs.writeFile('db/events.json', JSON.stringify(JSON.parse(body), null, 4), 'utf8');
		}
		catch(e) {
			console.log(e);
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Get Popular Sports
	// GET :https://api.matchbook.com/edge/rest/popular/sports

	// GET(REST API) request
	async function getPopularSports(maxSports) {
		maxSports = maxSports > 9 ? 8 : maxSports; // 1-8 sports only allowed
		try {
				// Use HTTP GET method (NOT POST) otherwise you will get below error
				// HTTPError: Response code 405 (Method Not Allowed)

				// URL string has Typo error then you will get below error
				// HTTPError: Response code 400 (Bad Request)
				const { body } = await got(`https://api.matchbook.com/edge/rest/popular/sports?num-sports=${maxSports}`);

				console.log(body); // msg from Server
				// await fs.writeFile('db/popularSports.json', body, 'utf8');
				await fs.writeFile('db/popularSports.json', JSON.stringify(JSON.parse(body), null, 4), 'utf8');
		}
		catch(e) {
			console.log(e);
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Get Get Event
	// GET: https://api.matchbook.com/edge/rest/events/{event_id}

	// GET(REST API) request
	async function getEventById(event_id) {
		try {
				const { body } = await got(`https://api.matchbook.com/edge/rest/events/${event_id}`);

				console.log(body); // msg from Server

				await fs.writeFile('db/eventHorseRacing.json', JSON.stringify(JSON.parse(body), null, 4), 'utf8');
		}
		catch(e) {
			console.log(e);
		}
	}

	// getEventById('24735152712200');



	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// main function - After Login Flow;
	function main()
	{
		getEvents();
		// getPopularSports(8);
		// getEventById('24735152712200'); // 24735152712200
	}


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



	//////////////////////////////////////// SOCKET.IO SETUP ///////////////////////////////////////////////////////////
	const io = require("socket.io")(httpServer);

	// [Server => Client(S)] Notify all the connected clients
	function notifyAllUser(event, data) {
		io.emit(event, data);
	}

	notifyAllUser('SERVER_TO_CLIENT_EVENT', JSON.stringify({ name:'Jay', age: 7 }));


	// Client request for a new connection
	io.on('connection', async (socket) => {
		console.log('Server: A new client connected to me !');

		// when client(browser) closed/disconnect from the server
		socket.on('disconnect', function() {
			console.log('A Client has closed / disconnected from the Server !');
		});

		// [Client => Server] Receive data from client to server
		socket.on('CLIENT_TO_SERVER_EVENT', async (data) => {
			const obj = JSON.parse(data);
			console.log(obj);

			notifyAllUser('SERVER_TO_CLIENT_EVENT', JSON.stringify({ name:'Jay', age: 7 }));
		});
	});

	//////////////////////////////////////// REST API SETUP ////////////////////////////////////////////////////////////
	// Lookup is performed in the following order:
	// 	1. req.params
	// 	2. req.body
	// 	3. req.query

	// // https://expressjs.com/en/guide/routing.html
	// 1. param => "/cars/honda"  => returns a list of Honda car models
	// 3. query => "/car/honda?color=blue" => returns a list of Honda car models, but filter by blue Color.
	// 			NOT => "/car/honda/color/blue"

	// Passing parameters by 'body'
	app.post('/api/login', (req, res) => {
		const { username, password } = req.body; // Max.body size allowed is 100kb
		// send the data response to client 
		return res.json({ data: `Server: ${username} got your Post msg - ${password} from Client` });
	});

	// Passing parameters by query [key-value] (req.query):   ?name="sridhar"
	app.get('/api/getUserByQuery', (req, res) => {
		const { query } = req;		 // 'query': It is an in-build property from 'HTTP get' 
		const username = query.name; // http://localhost:3000/api/getUserByQuery?name=Sridhar
		// send the data response to client 
		return res.json({ data: `Server: ${username} got your GET msg from Client` });
	});

	// Passing parameters by "named route"(req.params):    /5ec3c7c
	app.get('/api/getUserIdValue/:someIdValue', (req, res) => {
		// params is an object NOT a string. Bcos Express() by default converts the string to object by decodeUriComponent().
		const { params } = req;				 // 'params': It is an in-build property from 'HTTP get' 
		const username = params.someIdValue; // http://localhost:3000/api/getUserIdValue/5ec3c7c
		// send the data response to client 
		return res.json({ data: `Server: ${username} got your GET msg from Client` });
	});

	app.put('/api/replaceData', (req, res) => {
	//app.put('/api/replaceData/:someIdValue', (req, res) => {
		const { params } = req;				 // 'params': It is an in-build property from 'HTTP get' 
		const username = params.someIdValue; // http://localhost:3000/api/replaceData/3456
		// send the data response to client 
		return res.json({ data: `Server: ${username} got your GET msg from Client` });
	});

	// GET method route
	app.get('/', function (req, res) {
		res.send('GET request to the homepage');
	});


	//////////////////////////////////////// FILE API SETUP ////////////////////////////////////////////////////////////
	// Read json file by 'fs' module(WITH promise)
	async function readLocalFile() {
		try{
			const data = await fs.readFile('db/sportsDB.json', 'utf8');
			console.log("Read the local json successfully");
			const jsonObject = JSON.parse(data);
			console.log(jsonObject);
		}
		catch(e) {
			console.error("ERROR: Unable to read the json file");
			console.log(e);
		}
		
	}
	readLocalFile();
	//////////////////////////////////////// MONGODB CONNECTION SETUP //////////////////////////////////////////////////
	// 1. Mongo: Local database
	// const database = 'mongodb://localhost:27017/';
	// 2. Mongo: Atlas database
	// Connection URI <username>, <password>, and <your-cluster-url>.
	const databaseURI = 'mongodb+srv://sridharkritha:2244@cluster0.02kdt.mongodb.net/';
	const MONGO_DATABASE_NAME = 'mongodbplayground';
	const MONGO_COLLECTION_NAME = 'mycollection';       // collection to store all chats
	let g_collection = null;
	let g_mongoClient = null;
	//////////////////////////// SERVER IS LISTENING ////////////////////////////////////////////////////////////
	// Server listen at the given port number
	httpServer.listen(PORT, async () => {
		console.log("Server is running on the port : " + httpServer.address().port);

		// The Mongo Client you will use to interact with your database
		g_mongoClient = new MongoClient(databaseURI, { useNewUrlParser: true, useUnifiedTopology: true });

		try {
				await g_mongoClient.connect();
				console.log("Cluster connection                                      : Success");

				const DB = g_mongoClient.db(MONGO_DATABASE_NAME);
				if(!DB) {
					console.log(`Database - ${MONGO_DATABASE_NAME} - connection error`);
					return console.error(DB);
				}
				console.log(`Database(${MONGO_DATABASE_NAME}) connection        : Success`);

				g_collection = DB.collection(MONGO_COLLECTION_NAME);
				if(!g_collection) {
					console.log(`Collection - ${MONGO_COLLECTION_NAME} - connection error`);
					return console.error(g_collection);
				}
				console.log(`Collection(${MONGO_COLLECTION_NAME}) connection          : Success`);

				// Drop/Delete all the documents inside the collection and upload data from the json	
				// let result = await client.db(dataBaseName).collection(collectionName).drop();
		} catch(e) {
			console.error(e);
		}
	});

}()); // namespace



	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
	// npm i got@11.8.2  
	const got = require('got'); // like Fetch api but it is for server side to give the HTTP request to another server

	// const fs = require('fs');
	// import * as fs from 'fs';


	// const {got} = require('got'); // require() of ES modules is not supported.
	import got from 'got'; // "type": "module",   <=== Add inside package.json

*/







