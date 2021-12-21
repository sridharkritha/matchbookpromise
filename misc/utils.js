
// Namespace using Module Pattern 
var UTILS = (function() {
	const fs = require('fs').promises; // promise version of require('fs');
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Private Members
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var pri;

	return {
	
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Public Members
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		objectToUrlQueryString: function(obj)
		{
			// const obj = {foo: "hi there", bar: "100%" };    // "foo=hi%20there&bar=100%25"
			const encodedUrlString = Object.entries(obj).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
			console.log(encodedUrlString); 
			return encodedUrlString;
		},

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		storeCookie: async function(sessionToken, lastLoginTIme)
		{
			try
			{
				let obj = {};
				obj["login" + '.sessionToken']  = sessionToken;
				obj["login" + '.lastLoginTIme'] = lastLoginTIme;
				await fs.writeFile('../../GitHubOutside/myLoginDetails/mySessionToken.json', JSON.stringify(obj, null, 4), 'utf8');
				console.log('Success: A new mySessionToken.json file has been created');
			}
			catch(e)
			{
				console.error(e);
			}
		},

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		randomIntFromInterval: function (min, max) { // min and max included 
			return Math.floor(Math.random() * (max - min + 1) + min);
		}
	};
})();


// exports the variables and functions above so that other modules can use them
module.exports.objectToUrlQueryString = UTILS.objectToUrlQueryString;
module.exports.storeCookie = UTILS.storeCookie;
module.exports.randomIntFromInterval = UTILS.randomIntFromInterval;
