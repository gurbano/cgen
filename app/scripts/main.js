var cgenApp = require('./app/cgen');


/*MAIN ENTRY POINT FOR THE APP*/
$(document).ready(function () {
	var mainApp = new cgenApp({
		target: 'three-canvas',
		userId: 'oath01',
		userName: 'gurbano'
	});
	mainApp
		.hello()
		.initHardware({

		})
		.initWorld({

		})
		.start();
});
