(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"C:\\workspaces\\github\\cgen\\app\\scripts\\app\\cgen.js":[function(require,module,exports){
'use strict';

var WorldLoader = require('./modules/WorldLoader');
var UserStore = require('./modules/UserStore');

var keyMap = ['left', 'right', 'up', 'down'];
var configuration = {
	VIEW_ANGLE: 45,
	NEAR: 0.1,
	FAR: 1000000
};

var UP = THREE.Vector3(1, 0, 0);
var ZERO = THREE.Vector3(0, 0, 0);

var updateControlMap = function updateControlMap(delta, now) {
	//UPDATE CONTROL MAP
	var self = this;
	keyMap.forEach(function (key) {
		//update keyboard
		self.S.keys[key] = self.keyboard.pressed(key);
	});
};

var updateInterception = function updateInterception(delta, now) {
	var self = this;
	if (this.world && this.world.intersect) {
		var helper = this.world.get('light');
		helper.position.x = this.world.intersect.x;
		helper.position.y = this.world.intersect.y;
		helper.position.z = this.world.intersect.z;
	}
};

var d = new Date();
function addDays(date, days) {
	var result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}
var updateEarth = function updateEarth(delta, now) {
	var self = this;
	if (this.world) {
		var earth = this.world.get('earth');
		earth.cloudsMesh.rotation.y += 1 / 80 * delta;
		//earth.rotation.y  += 1/20 * delta;
		d = addDays(d, 1);
		//this.world.setSunPosition( d);
	}
};

var CgenApp = function CgenApp(opts) {
	var self = this;
	this.targetId = opts.target; //$three canvas
	this.target = $('#' + opts.target); //$three canvas
	//PG RELATED STUFF
	this.PG = {};
	this.PG.store = new UserStore(opts.userId);
	this.PG.entity = this.PG.store.get();

	//UPDATERS
	this.updateFcts = [];
	this.updateFcts.push(updateInterception);
	this.updateFcts.push(updateControlMap);
	this.updateFcts.push(updateEarth);

	//Three related stuff
	this.S = {};
	this.S.keys = {};
	this.S.scene = undefined;
	this.S.renderer = undefined;

	//controls.addEventListener( 'change', render );
};
CgenApp.prototype.hello = function (name) {
	console.info("Hello " + this.PG.entity.userName);
	return this;
};
CgenApp.prototype.initHardware = function (opts) {
	var self = this;
	configuration.WIDTH = this.target.width();
	configuration.HEIGHT = this.target.height();
	configuration.ASPECT = configuration.WIDTH / configuration.HEIGHT;

	console.info("Application initialized", configuration.WIDTH, configuration.HEIGHT);
	this.keyboard = new THREEx.KeyboardState();
	this.S.scene = new THREE.Scene();
	//this.S.scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0025 );

	this.S.camera = new THREE.PerspectiveCamera(configuration.VIEW_ANGLE, configuration.ASPECT, configuration.NEAR, configuration.FAR);
	this.S.renderer = new THREE.WebGLRenderer();
	this.S.renderer.setSize(configuration.WIDTH, configuration.HEIGHT);
	this.S.renderer.gammaInput = true;
	this.S.renderer.gammaOutput = true;

	this.S.controls = new THREE.OrbitControls(this.S.camera, this.S.renderer.domElement);
	this.S.controls.minPolarAngle = 1; // radians
	this.S.controls.maxPolarAngle = 1.70; // radians
	this.S.controls.minDistance = 15000;
	this.S.controls.maxDistance = 25000;
	this.S.controls.addEventListener('change', function () {});
	this.S.scene.add(this.S.camera);
	this.target.append(this.S.renderer.domElement);
	return this;
};
CgenApp.prototype.initWorld = function (opts) {
	//WORLD	
	this.world = new WorldLoader(this).init();
	this.S.scene.add(this.world.getRoot());
	return this;
};
CgenApp.prototype.start = function () {
	console.info("Application started");

	this.S.camera.position.x = this.PG.entity.position.x;
	this.S.camera.position.y = this.PG.entity.position.y + 5000;
	this.S.camera.position.z = this.PG.entity.position.z;

	this.loop();
	return this;
};

CgenApp.prototype.queryControls = function (key) {
	return this.S.keys[key];
};
CgenApp.prototype.loop = function () {
	var self = this;
	var lastTimeMsec = null;

	function animate(nowMsec) {
		//nowMsec = nowMsec.toFixed(0);
		//console.info('looping ' + nowMsec);		
		requestAnimationFrame(animate.bind(self));
		// measure time
		lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
		var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
		lastTimeMsec = nowMsec;
		// call each update function
		self.S.controls.update(deltaMsec / 1000);
		self.updateFcts.forEach(function (updateFn) {
			updateFn.bind(self)(deltaMsec / 1000, nowMsec / 1000);
		});
		self.S.renderer.render(self.S.scene, self.S.camera);
	}
	requestAnimationFrame(animate.bind(self));
};
module.exports = CgenApp;

//INIT CONTROLS
/*
	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
	if ( havePointerLock ) {
		this.S.controls =  new THREE.PointerLockControls( this.S.camera );		
		//this.S.scene.add(this.S.controls.getObject());
		this.plContext = new PlContext(this.S.controls);
		this.target.click(function () {
			self.plContext.start();
		});		
	}

var PlContext = function(controls){
	var element = document.body;
	return {	
		listeners : function() {	
			var pl = this;
			document.addEventListener( 'pointerlockchange', pl.pointerlockchange, false );
			document.addEventListener( 'mozpointerlockchange', pl.pointerlockchange, false );
			document.addEventListener( 'webkitpointerlockchange', pl.pointerlockchange, false );

			document.addEventListener( 'pointerlockerror', pl.pointerlockerror, false );
			document.addEventListener( 'mozpointerlockerror', pl.pointerlockerror, false );
			document.addEventListener( 'webkitpointerlockerror', pl.pointerlockerror, false );
		},
		pointerlockchange : function ( event ) {
			if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
				//controlsEnabled = true;
				controls.enabled = true;			
			} else {
				//controls.enabled = false;
				console.warn('no pointerlock');	
			}

		},
		pointerlockerror : function ( event ) {
			console.error('pointerlock error');
		},
		start: function  () {
			this.listeners();
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
			if ( /Firefox/i.test( navigator.userAgent ) ) {
				var fullscreenchange = function ( event ) {
					if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
						document.removeEventListener( 'fullscreenchange', fullscreenchange );
						document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
						element.requestPointerLock();
					}
				};
				document.addEventListener( 'fullscreenchange', fullscreenchange, false );
				document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
				element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
				element.requestFullscreen();
			} else {
				element.requestPointerLock();
			}
			return this;
		}
	}
}
*/

},{"./modules/UserStore":"C:\\workspaces\\github\\cgen\\app\\scripts\\app\\modules\\UserStore.js","./modules/WorldLoader":"C:\\workspaces\\github\\cgen\\app\\scripts\\app\\modules\\WorldLoader.js"}],"C:\\workspaces\\github\\cgen\\app\\scripts\\app\\dep\\ImprovedNoise.js":[function(require,module,exports){
// http://mrl.nyu.edu/~perlin/noise/

"use strict";

var ImprovedNoise = function ImprovedNoise() {

	var p = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];

	for (var i = 0; i < 256; i++) {

		p[256 + i] = p[i];
	}

	function fade(t) {

		return t * t * t * (t * (t * 6 - 15) + 10);
	}

	function lerp(t, a, b) {

		return a + t * (b - a);
	}

	function grad(hash, x, y, z) {

		var h = hash & 15;
		var u = h < 8 ? x : y,
		    v = h < 4 ? y : h == 12 || h == 14 ? x : z;
		return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
	}

	return {

		noise: function noise(x, y, z) {

			var floorX = ~ ~x,
			    floorY = ~ ~y,
			    floorZ = ~ ~z;

			var X = floorX & 255,
			    Y = floorY & 255,
			    Z = floorZ & 255;

			x -= floorX;
			y -= floorY;
			z -= floorZ;

			var xMinus1 = x - 1,
			    yMinus1 = y - 1,
			    zMinus1 = z - 1;

			var u = fade(x),
			    v = fade(y),
			    w = fade(z);

			var A = p[X] + Y,
			    AA = p[A] + Z,
			    AB = p[A + 1] + Z,
			    B = p[X + 1] + Y,
			    BA = p[B] + Z,
			    BB = p[B + 1] + Z;

			return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z), grad(p[BA], xMinus1, y, z)), lerp(u, grad(p[AB], x, yMinus1, z), grad(p[BB], xMinus1, yMinus1, z))), lerp(v, lerp(u, grad(p[AA + 1], x, y, zMinus1), grad(p[BA + 1], xMinus1, y, z - 1)), lerp(u, grad(p[AB + 1], x, yMinus1, zMinus1), grad(p[BB + 1], xMinus1, yMinus1, zMinus1))));
		}
	};
};

module.exports = ImprovedNoise;

},{}],"C:\\workspaces\\github\\cgen\\app\\scripts\\app\\helper.js":[function(require,module,exports){
'use strict';

function Helper() {
    if (!(this instanceof Helper)) return new Helper();
    this.DATE_FORMAT = 'dd MM hh:ii';
    this.FB_DATE = 'dd/mm/yyyy hh:ii';
    return this;
}
Helper.prototype.dateToString = function (date) {
    return $.formatDateTime(this.DATE_FORMAT, date);
};
Helper.prototype.toFbDate = function (date) {
    return date.getTime();
};
Helper.prototype.msToString = function (date) {
    return $.formatDateTime(this.DATE_FORMAT, new Date(date));
};
Helper.prototype.stringToDate = function (s) {
    return new Date(s);
};
Helper.prototype.deepCopy = function (oldObject) {
    return $.extend(true, {}, oldObject);
};
Helper.prototype.shallowCopy = function (oldObject) {
    return $.extend({}, oldObject);
};
Helper.prototype.random = function (min, max) {
    return Math.random() * (max - min) + min;
};
Helper.prototype.randomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
Helper.prototype.extend = function (a, b) {
    for (var key in b) {
        if (b.hasOwnProperty(key)) {
            a[key] = b[key];
        }
    }

    return a;
};
Helper.prototype.distance = function (from, to) {
    try {
        return google.maps.geometry.spherical.computeDistanceBetween(from, to);
    } catch (e) {
        return 0;
    }
};
Helper.prototype.speedMS = function (from, to, ms) {
    var m = google.maps.geometry.spherical.computeDistanceBetween(from, to);
    var speed = m / (1000 * ms);
    return speed;
};
Helper.prototype.speedKmH = function (from, to, ms) {
    var speedKm = this.speedMS(from, to, ms) //m/s
     * 60 // m/min
     * 60 // m/h
     / 1000; //km/h
    return speedKm;
};
Helper.prototype.interpolate = function (val, min, max, new_min, new_max) {
    //         (b - a)(x - min)
    // f(x) = -- -- -- -- -- -- -- + a
    //             max - min
    //            

    var fx = new_min + (new_max - new_min) * (val - min) / (max - min);
    return fx;
};
Helper.prototype.dayOfTheYear = function (date) {
    var j1 = new Date(date);
    j1.setMonth(0, 0);
    return Math.round((date - j1) / 8.64e7);
};

Helper.prototype.getUID = function () {
    return '#' + new Date().getTime();
};

module.exports = new Helper();

},{}],"C:\\workspaces\\github\\cgen\\app\\scripts\\app\\modules\\UserStore.js":[function(require,module,exports){
'use strict';

var _position = {
	x: 100,
	y: 500,
	z: 100
};

var UserStore = function UserStore(userId) {
	this.userId = userId;
};

UserStore.prototype.get = function () {
	return {
		position: _position,
		userId: this.userId,
		userName: 'gurbano',
		update: function update(controls, delta, now) {
			//console.info(controls);
		}

	}; //load from DB // network
};

UserStore.prototype.set = function (data) {
	_position.x = data.position.x;
	_position.y = data.position.y;
	_position.z = data.position.z;
};

module.exports = UserStore;

},{}],"C:\\workspaces\\github\\cgen\\app\\scripts\\app\\modules\\WorldLoader.js":[function(require,module,exports){
'use strict';

var ImprovedNoise = require('../dep/ImprovedNoise');
var PlanetFactory = require('./factories/PlanetFactory');
var helper = require('../helper');

var WorldLoader = function WorldLoader(parent) {
	this.parent = parent; //parent app
};
WorldLoader.prototype.init = function (center) {
	//TODO: LOAD WORLD
	return new World(this.parent);
};

var World = function World(app) {
	var root = new THREE.Object3D();
	this.getRoot = function () {
		return root;
	};

	this.id = 'world0';
	this.interceptor = { //intercept with the mouse
		raycaster: new THREE.Raycaster(),
		mouse: new THREE.Vector2(),
		renderer: app.S.renderer,
		camera: app.S.camera
	};
	this.raycaster = { //intercept with the player
		raycaster: new THREE.Raycaster(),
		start: new THREE.Vector2(),
		renderer: app.S.renderer,
		camera: app.S.camera
	};

	this.entities = {};
	this.add('light', getLight());
	this.add('helper', getHelper());
	this.add('axisHelper', new THREE.AxisHelper(5000));
	this.add('earth', getEarth());
	this.add('rome', getCity(41.890251, 12.492373));

	document.addEventListener('mousemove', onMouseMove.bind(this), false);
};

World.prototype.add = function (id, obj) {
	this.entities[id] = obj;
	this.getRoot().add(obj);
};
World.prototype.get = function (name) {
	return this.entities[name];
};

World.prototype.setSunPosition = function (__date) {
	if (this.get('light')) {
		var date = new Date(__date);
		var d = helper.dayOfTheYear(date);
		var dayOfTheYear = (d - 91 + 365) % 365;
		var l = 1800;
		var seasons = [{
			limit: [0, 91],
			angle: [0, l],
			id: 'A'
		}, {
			limit: [92, 172],
			angle: [l, 0],
			id: 'B'
		}, {
			limit: [173, 266],
			angle: [0, -l],
			id: 'C'
		}, {
			limit: [266, 365],
			angle: [-l, 0],
			id: 'D'
		}];
		var tilt = 0;
		for (var i = 0; i < seasons.length; i++) {
			var limit = seasons[i].limit;
			var angle = seasons[i].angle;
			if (dayOfTheYear >= limit[0] && dayOfTheYear < limit[1]) {
				tilt = helper.interpolate(dayOfTheYear + date.getHours() / 24, limit[0], limit[1], angle[0], angle[1]);
				console.info(seasons[i].id, d, dayOfTheYear, tilt.toFixed(0));
				break;
			}
		};

		var rev_degree = -((__date / (1000 * 60 * 60) + 6) % 24) * (360 / 24);
		var tilt_deg = tilt;

		this.get('light').position.set(Math.sin(rev_degree * Math.PI / 180) * 5000, tilt_deg, 5000 * Math.cos(rev_degree * Math.PI / 180));
		this.get('light').lookAt(0, 0, 0);
	}
};

module.exports = WorldLoader;

var onMouseMove = function onMouseMove(event) {
	this.interceptor.mouse.x = event.clientX / this.interceptor.renderer.domElement.clientWidth * 2 - 1;
	this.interceptor.mouse.y = -(event.clientY / this.interceptor.renderer.domElement.clientHeight) * 2 + 1;
	this.interceptor.raycaster.setFromCamera(this.interceptor.mouse, this.interceptor.camera);
	// See if the ray from the camera into the world hits one of our meshes
	var intersects = this.interceptor.raycaster.intersectObject(this.get('earth'));
	// Toggle rotation bool for meshes that we clicked
	if (intersects.length > 0) {
		//console.info(intersects[0]);
		this.intersect = { x: intersects[0].point.x, y: intersects[0].point.y, z: intersects[0].point.z, obj: intersects[0] };
	} else {
		this.intersect = undefined;
	}
};

function getHelper() {
	var geometry = new THREE.CylinderGeometry(0, 20, 100, 3);
	geometry.translate(0, 50, 0);
	geometry.rotateX(Math.PI / 2);
	return new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
}
function getLight() {
	var light = new THREE.DirectionalLight(0xffffff, 1.0);
	light.position.set(5000, 0, 5000);
	return light;
}
function getCity(lat, lng) {
	//var geometry =  THREE.SphereGeometry(100, 32, 32);
	//var material = new THREE.MeshPhongMaterial({wireframe:true});
	var mesh = new THREE.AxisHelper(500);
	var v3 = getCoords(lat, lng);
	mesh.position.set(v3.x, v3.y, v3.z);
	return mesh;
}

function getEarth() {
	return PlanetFactory.getEarth();
}

function getCoords(lat, lon) {
	var radius = 5000;
	var phi = (90 - lat) * (Math.PI / 180);
	var theta = (lon + 180) * (Math.PI / 180);

	var x = -(radius * Math.sin(phi) * Math.cos(theta));
	var z = radius * Math.sin(phi) * Math.sin(theta);
	var y = radius * Math.cos(phi);

	return new THREE.Vector3(x, y, z);
}

THREE.ShaderTypes = {
	'phongDiffuse': {
		uniforms: {
			"uDirLightPos": { type: "v3", value: new THREE.Vector3() },
			"uDirLightColor": { type: "c", value: new THREE.Color(0xffffff) },
			"uMaterialColor": { type: "c", value: new THREE.Color(0xffffff) },
			uKd: {
				type: "f",
				value: 0.7
			},
			uBorder: {
				type: "f",
				value: 0.4
			}
		},
		vertexShader: ["varying vec3 vNormal;", "varying vec3 vViewPosition;", "void main() {", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "vNormal = normalize( normalMatrix * normal );", "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );", "vViewPosition = -mvPosition.xyz;", "}"].join("\n"),

		fragmentShader: ["uniform vec3 uMaterialColor;", "uniform vec3 uDirLightPos;", "uniform vec3 uDirLightColor;", "uniform float uKd;", "uniform float uBorder;", "varying vec3 vNormal;", "varying vec3 vViewPosition;", "void main() {",

		// compute direction to light
		"vec4 lDirection = viewMatrix * vec4( uDirLightPos, 0.0 );", "vec3 lVector = normalize( lDirection.xyz );",

		// diffuse: N * L. Normal must be normalized, since it's interpolated.
		"vec3 normal = normalize( vNormal );",
		//was: "float diffuse = max( dot( normal, lVector ), 0.0);",
		// solution
		"float diffuse = dot( normal, lVector );", "if ( diffuse > 0.6 ) { diffuse = 1.0; }", "else if ( diffuse > -0.2 ) { diffuse = 0.7; }", "else { diffuse = 0.3; }", "gl_FragColor = vec4( uKd * uMaterialColor * uDirLightColor * diffuse, 1.0 );", "}"].join("\n")

	}

};

},{"../dep/ImprovedNoise":"C:\\workspaces\\github\\cgen\\app\\scripts\\app\\dep\\ImprovedNoise.js","../helper":"C:\\workspaces\\github\\cgen\\app\\scripts\\app\\helper.js","./factories/PlanetFactory":"C:\\workspaces\\github\\cgen\\app\\scripts\\app\\modules\\factories\\PlanetFactory.js"}],"C:\\workspaces\\github\\cgen\\app\\scripts\\app\\modules\\factories\\MaterialFactory.js":[function(require,module,exports){
"use strict";

var MaterialFactory = function MaterialFactory() {};
MaterialFactory.prototype.getTestMaterial = function () {
	return new THREE.MeshPhongMaterial({ wireframe: true });
};

MaterialFactory.prototype.getCloudsMaterial = function (texture) {
	var material = new THREE.MeshPhongMaterial({
		map: texture,
		side: THREE.DoubleSide,
		opacity: 0.4,
		transparent: true,
		depthWrite: false
	});
	return material;
};

module.exports = new MaterialFactory();

},{}],"C:\\workspaces\\github\\cgen\\app\\scripts\\app\\modules\\factories\\PlanetFactory.js":[function(require,module,exports){
'use strict';

var MaterialFactory = require('./MaterialFactory');
var POS_X_L = 3000;
var POS_Y_L = 0;
var POS_Z_L = 3000;

var conf = {
	EARTH: {
		RADIUS: 5000,
		BASE_COLOR: 554433,
		BASE_FOLDER: 'images/EARTH/',
		BUMP_SCALE: 50,
		CLOUDS: true
	}
};

var PlanetFactory = function PlanetFactory() {};

PlanetFactory.prototype.getPlanetGeometry = function (conf) {
	return new THREE.SphereGeometry(conf.RADIUS, 32, 32);
};
PlanetFactory.prototype.getPlanetMaterial = function (conf, quality) {
	var material = new THREE.MeshPhongMaterial();
	material.map = THREE.ImageUtils.loadTexture(conf.BASE_FOLDER + (quality || '1k') + '/texture.jpg');
	material.bumpMap = THREE.ImageUtils.loadTexture(conf.BASE_FOLDER + (quality || '1k') + '/bump.jpg');
	material.bumpScale = conf.BUMP_SCALE;

	material.specularMap = THREE.ImageUtils.loadTexture(conf.BASE_FOLDER + (quality || '1k') + '/specular.jpg');
	material.specular = new THREE.Color('grey');
	return material;
};
PlanetFactory.prototype.getPlanetMesh = function (geometry, material) {
	var mainMesh = new THREE.Mesh(geometry, material);
	return mainMesh;
};
PlanetFactory.prototype.getEarth = function () {
	return this.getPlanet('EARTH');
};
PlanetFactory.prototype.getPlanet = function (name) {
	var geometry = this.getPlanetGeometry(conf[name]);
	var material = this.getPlanetMaterial(conf[name], "4k");
	var planetMesh = this.getPlanetMesh(geometry, material);
	planetMesh.castShadow = true;
	planetMesh.receiveShadow = true;
	if (conf[name].CLOUDS) {
		var cloudsGeometry = new THREE.SphereGeometry(conf[name].RADIUS + 180, 32, 32);
		var cloudsMaterial = MaterialFactory.getCloudsMaterial(THREE.ImageUtils.loadTexture(conf[name].BASE_FOLDER + 'clouds/clouds_t.jpg'));
		planetMesh.cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
		planetMesh.add(planetMesh.cloudsMesh);
	}
	//planetMesh.cloudsMesh.castShadow = true;
	//planetMesh.cloudsMesh.receiveShadow = true;

	return planetMesh;
};

module.exports = new PlanetFactory();

},{"./MaterialFactory":"C:\\workspaces\\github\\cgen\\app\\scripts\\app\\modules\\factories\\MaterialFactory.js"}],"C:\\workspaces\\github\\cgen\\app\\scripts\\main.js":[function(require,module,exports){
'use strict';

var cgenApp = require('./app/cgen');

/*MAIN ENTRY POINT FOR THE APP*/
$(document).ready(function () {
	var mainApp = new cgenApp({
		target: 'three-canvas',
		userId: 'oath01',
		userName: 'gurbano'
	});
	mainApp.hello().initHardware({}).initWorld({}).start();
});

},{"./app/cgen":"C:\\workspaces\\github\\cgen\\app\\scripts\\app\\cgen.js"}]},{},["C:\\workspaces\\github\\cgen\\app\\scripts\\main.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi93b3Jrc3BhY2VzL2dpdGh1Yi9jZ2VuL2FwcC9zY3JpcHRzL2FwcC9jZ2VuLmpzIiwiQzovd29ya3NwYWNlcy9naXRodWIvY2dlbi9hcHAvc2NyaXB0cy9hcHAvZGVwL0ltcHJvdmVkTm9pc2UuanMiLCJDOi93b3Jrc3BhY2VzL2dpdGh1Yi9jZ2VuL2FwcC9zY3JpcHRzL2FwcC9oZWxwZXIuanMiLCJDOi93b3Jrc3BhY2VzL2dpdGh1Yi9jZ2VuL2FwcC9zY3JpcHRzL2FwcC9tb2R1bGVzL1VzZXJTdG9yZS5qcyIsIkM6L3dvcmtzcGFjZXMvZ2l0aHViL2NnZW4vYXBwL3NjcmlwdHMvYXBwL21vZHVsZXMvV29ybGRMb2FkZXIuanMiLCJDOi93b3Jrc3BhY2VzL2dpdGh1Yi9jZ2VuL2FwcC9zY3JpcHRzL2FwcC9tb2R1bGVzL2ZhY3Rvcmllcy9NYXRlcmlhbEZhY3RvcnkuanMiLCJDOi93b3Jrc3BhY2VzL2dpdGh1Yi9jZ2VuL2FwcC9zY3JpcHRzL2FwcC9tb2R1bGVzL2ZhY3Rvcmllcy9QbGFuZXRGYWN0b3J5LmpzIiwiQzovd29ya3NwYWNlcy9naXRodWIvY2dlbi9hcHAvc2NyaXB0cy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUNuRCxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7QUFHL0MsSUFBSSxNQUFNLEdBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM1QyxJQUFJLGFBQWEsR0FBRztBQUNuQixXQUFVLEVBQUcsRUFBRTtBQUNiLEtBQUksRUFBRyxHQUFHO0FBQ1YsSUFBRyxFQUFHLE9BQU87Q0FDZixDQUFBOztBQUVELElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxPQUFP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QUMsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUUsUUFBUSxFQUFFLFlBQVksRUFFdkQsQ0FBRSxDQUFDO0FBQ0osS0FBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEMsS0FBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDL0MsUUFBTyxJQUFJLENBQUM7Q0FDWixDQUFBO0FBQ0QsT0FBTyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsVUFBUyxJQUFJLEVBQUU7O0FBRTVDLEtBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDMUMsS0FBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUN4QyxRQUFPLElBQUksQ0FBQztDQUNaLENBQUM7QUFDRixPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxZQUFZO0FBQ3JDLFFBQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7QUFHcEMsS0FBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQ3JELEtBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUM7QUFDMUQsS0FBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxD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LEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUM5RixHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFDN0YsRUFBRSxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLENBQUMsRUFDOUYsR0FBRyxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFDN0YsR0FBRyxFQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQy9GLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFDOUYsRUFBRSxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFDL0YsRUFBRSxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBRSxDQUFDOztBQUVoRSxNQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFHLENBQUMsRUFBRyxFQUFFOztBQUUvQixHQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUVsQjs7QUFFRCxVQUFTLElBQUksQ0FBQyxDQUFDLEVBQUU7O0FBRWhCLFNBQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBLEFBQUMsR0FBRyxFQUFFLENBQUEsQUFBQyxDQUFDO0VBRTNDOztBQUVELFVBQVMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFOztBQUV0QixTQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQSxBQUFDLENBQUM7RUFFdkI7O0FBRUQsVUFBUyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFOztBQUU1QixNQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLE1BQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7TUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEUsU0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxJQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUEsSUFBSyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUEsSUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQztFQUVyRDs7QUFFRCxRQUFPOztBQUVOLE9BQUssRUFBRSxlQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFOztBQUV6QixPQUFJLE1BQU0sR0FBRyxFQUFDLENBQUMsQ0FBQztPQUFFLE1BQU0sR0FBRyxFQUFDLENBQUMsQ0FBQztPQUFFLE1BQU0sR0FBRyxFQUFDLENBQUMsQ0FBQyxDQUFDOztBQUU3QyxPQUFJLENBQUMsR0FBRyxNQUFNLEdBQUcsR0FBRztPQUFFLENBQUMsR0FBRyxNQUFNLEdBQUcsR0FBRztPQUFFLENBQUMsR0FBRyxNQUFNLEdBQUcsR0FBRyxDQUFDOztBQUV6RCxJQUFDLElBQUksTUFBTSxDQUFDO0FBQ1osSUFBQyxJQUFJLE1BQU0sQ0FBQztBQUNaLElBQUMsSUFBSSxNQUFNLENBQUM7O0FBRVosT0FBSSxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUM7T0FBRSxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUM7T0FBRSxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFdEQsT0FBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztPQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO09BQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFMUMsT0FBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7T0FBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7T0FBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO09BQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQztPQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztPQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFdkcsVUFBTyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQy9DLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUM1QixJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFDakMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDcEMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLEVBQzVDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQ3BDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFDM0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUVsRDtFQUNELENBQUE7Q0FDRCxDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDOzs7OztBQ3hFL0IsU0FBUyxNQUFNLEdBQUc7QUFD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bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgV29ybGRMb2FkZXIgPSByZXF1aXJlKCcuL21vZHVsZXMvV29ybGRMb2FkZXInKTtcclxudmFyIFVzZXJTdG9yZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9Vc2VyU3RvcmUnKTtcclxuXHJcblxyXG52YXIga2V5TWFwID1bJ2xlZnQnLCAncmlnaHQnLCAndXAnLCAnZG93biddO1xyXG52YXIgY29uZmlndXJhdGlvbiA9IHtcclxuXHRWSUVXX0FOR0xFIDogNDUsXHJcbiAgXHRORUFSIDogMC4xLFxyXG4gIFx0RkFSIDogMTAwMDAwMFxyXG59XHJcblxyXG52YXIgVVAgPSBUSFJFRS5WZWN0b3IzKCAxLCAwLCAwICk7XHJcbnZhciBaRVJPID0gVEhSRUUuVmVjdG9yMyggMCwgMCwgMCApO1xyXG5cclxuXHJcblxyXG52YXIgdXBkYXRlQ29udHJvbE1hcCA9IGZ1bmN0aW9uKGRlbHRhLCBub3cpey8vVVBEQVRFIENPTlRST0wgTUFQXHJcblx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdGtleU1hcC5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgLy91cGRhdGUga2V5Ym9hcmRcclxuXHRcdHNlbGYuUy5rZXlzW2tleV0gPSBzZWxmLmtleWJvYXJkLnByZXNzZWQoa2V5KTtcclxuXHR9KTtcdFxyXG5cclxufTtcclxuXHJcblxyXG52YXIgdXBkYXRlSW50ZXJjZXB0aW9uID0gZnVuY3Rpb24oZGVsdGEsIG5vdyl7XHJcblx0dmFyIHNlbGYgPSB0aGlzO1x0XHRcclxuXHRpZiAoIHRoaXMud29ybGQgJiYgdGhpcy53b3JsZC5pbnRlcnNlY3QgKXtcclxuXHRcdHZhciBoZWxwZXIgPSB0aGlzLndvcmxkLmdldCgnbGlnaHQnKTtcclxuXHRcdGhlbHBlci5wb3NpdGlvbi54ID0gdGhpcy53b3JsZC5pbnRlcnNlY3QueDtcclxuXHRcdGhlbHBlci5wb3NpdGlvbi55ID0gdGhpcy53b3JsZC5pbnRlcnNlY3QueTtcclxuXHRcdGhlbHBlci5wb3NpdGlvbi56ID0gdGhpcy53b3JsZC5pbnRlcnNlY3QuejtcdFx0XHJcblx0fVxyXG59O1xyXG5cclxudmFyIGQgPSBuZXcgRGF0ZSgpO1xyXG5mdW5jdGlvbiBhZGREYXlzKGRhdGUsIGRheXMpIHtcclxuICAgIHZhciByZXN1bHQgPSBuZXcgRGF0ZShkYXRlKTtcclxuICAgIHJlc3VsdC5zZXREYXRlKHJlc3VsdC5nZXREYXRlKCkgKyBkYXlzKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxudmFyIHVwZGF0ZUVhcnRoID0gZnVuY3Rpb24oZGVsdGEsIG5vdyl7XHJcblx0dmFyIHNlbGYgPSB0aGlzO1x0XHRcclxuXHRpZiAoIHRoaXMud29ybGQpe1xyXG5cdFx0dmFyIGVhcnRoID0gdGhpcy53b3JsZC5nZXQoJ2VhcnRoJyk7XHJcblx0XHRlYXJ0aC5jbG91ZHNNZXNoLnJvdGF0aW9uLnkgICs9IDEvODAgKiBkZWx0YTtcclxuXHRcdC8vZWFydGgucm90YXRpb24ueSAgKz0gMS8yMCAqIGRlbHRhO1xyXG5cdFx0ZCA9IGFkZERheXMoZCwxKTtcclxuXHRcdC8vdGhpcy53b3JsZC5zZXRTdW5Qb3NpdGlvbiggZCk7XHJcblx0fVxyXG59O1xyXG5cclxuXHJcbnZhciBDZ2VuQXBwID0gZnVuY3Rpb24gKG9wdHMpIHtcclxuXHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0dGhpcy50YXJnZXRJZCA9IG9wdHMudGFyZ2V0OyAvLyR0aHJlZSBjYW52YXNcclxuXHR0aGlzLnRhcmdldCA9JCgnIycrb3B0cy50YXJnZXQpOyAvLyR0aHJlZSBjYW52YXNcclxuXHQvL1BHIFJFTEFURUQgU1RVRkZcclxuXHR0aGlzLlBHID0ge307XHJcblx0dGhpcy5QRy5zdG9yZSA9IG5ldyBVc2VyU3RvcmUob3B0cy51c2VySWQpO1xyXG5cdHRoaXMuUEcuZW50aXR5ID0gdGhpcy5QRy5zdG9yZS5nZXQoKTtcclxuXHJcblxyXG5cdC8vVVBEQVRFUlNcclxuXHR0aGlzLnVwZGF0ZUZjdHMgPSBbXTtcdFx0XHJcblx0dGhpcy51cGRhdGVGY3RzLnB1c2godXBkYXRlSW50ZXJjZXB0aW9uKTtcclxuXHR0aGlzLnVwZGF0ZUZjdHMucHVzaCh1cGRhdGVDb250cm9sTWFwKTtcclxuXHR0aGlzLnVwZGF0ZUZjdHMucHVzaCh1cGRhdGVFYXJ0aCk7XHJcblxyXG5cclxuXHQvL1RocmVlIHJlbGF0ZWQgc3R1ZmZcclxuXHR0aGlzLlMgPSB7fTsgXHJcblx0dGhpcy5TLmtleXMgPSB7fTtcclxuXHR0aGlzLlMuc2NlbmUgPSB1bmRlZmluZWQ7XHJcblx0dGhpcy5TLnJlbmRlcmVyID0gdW5kZWZpbmVkO1xyXG5cdFxyXG4gIFx0Ly9jb250cm9scy5hZGRFdmVudExpc3RlbmVyKCAnY2hhbmdlJywgcmVuZGVyICk7XHJcblx0XHJcblxyXG59XHJcbkNnZW5BcHAucHJvdG90eXBlLmhlbGxvID0gZnVuY3Rpb24obmFtZSkge1xyXG5cdGNvbnNvbGUuaW5mbyhcIkhlbGxvIFwiICsgdGhpcy5QRy5lbnRpdHkudXNlck5hbWUpO1xyXG5cdHJldHVybiB0aGlzO1xyXG59O1xyXG5DZ2VuQXBwLnByb3RvdHlwZS5pbml0SGFyZHdhcmUgPSBmdW5jdGlvbiAob3B0cykge1x0XHJcblx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdGNvbmZpZ3VyYXRpb24uV0lEVEggPSB0aGlzLnRhcmdldC53aWR0aCgpO1xyXG5cdGNvbmZpZ3VyYXRpb24uSEVJR0hUID0gdGhpcy50YXJnZXQuaGVpZ2h0KCk7XHJcblx0Y29uZmlndXJhdGlvbi5BU1BFQ1QgPSBjb25maWd1cmF0aW9uLldJRFRIIC8gY29uZmlndXJhdGlvbi5IRUlHSFQgO1xyXG5cdFxyXG5cdGNvbnNvbGUuaW5mbyhcIkFwcGxpY2F0aW9uIGluaXRpYWxpemVkXCIsIGNvbmZpZ3VyYXRpb24uV0lEVEgsIGNvbmZpZ3VyYXRpb24uSEVJR0hUKTtcclxuXHR0aGlzLmtleWJvYXJkID0gbmV3IFRIUkVFeC5LZXlib2FyZFN0YXRlKCk7XHJcblx0dGhpcy5TLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHRcclxuXHQvL3RoaXMuUy5zY2VuZS5mb2cgPSBuZXcgVEhSRUUuRm9nRXhwMiggMHhlZmQxYjUsIDAuMDAyNSApO1xyXG5cclxuXHJcblx0dGhpcy5TLmNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYShcclxuXHRcdFx0XHRcdFx0XHRcdCAgICBjb25maWd1cmF0aW9uLlZJRVdfQU5HTEUsXHJcblx0XHRcdFx0XHRcdFx0XHQgICAgY29uZmlndXJhdGlvbi5BU1BFQ1QsXHJcblx0XHRcdFx0XHRcdFx0XHQgICAgY29uZmlndXJhdGlvbi5ORUFSLFxyXG5cdFx0XHRcdFx0XHRcdFx0ICAgIGNvbmZpZ3VyYXRpb24uRkFSKTtcclxuXHR0aGlzLlMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpO1xyXG5cdHRoaXMuUy5yZW5kZXJlci5zZXRTaXplKGNvbmZpZ3VyYXRpb24uV0lEVEgsIGNvbmZpZ3VyYXRpb24uSEVJR0hUKTtcclxuXHR0aGlzLlMucmVuZGVyZXIuZ2FtbWFJbnB1dCA9IHRydWU7XHJcblx0dGhpcy5TLnJlbmRlcmVyLmdhbW1hT3V0cHV0ID0gdHJ1ZTtcclxuXHJcblx0dGhpcy5TLmNvbnRyb2xzID0gbmV3IFRIUkVFLk9yYml0Q29udHJvbHModGhpcy5TLmNhbWVyYSwgdGhpcy5TLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xyXG5cdHRoaXMuUy5jb250cm9scy5taW5Qb2xhckFuZ2xlID0gMTsgLy8gcmFkaWFuc1xyXG5cdHRoaXMuUy5jb250cm9scy5tYXhQb2xhckFuZ2xlID0gMS43MDsgLy8gcmFkaWFuc1xyXG5cdHRoaXMuUy5jb250cm9scy5taW5EaXN0YW5jZSA9IDE1MDAwO1xyXG5cdHRoaXMuUy5jb250cm9scy5tYXhEaXN0YW5jZSA9MjUwMDA7XHJcblx0dGhpcy5TLmNvbnRyb2xzLmFkZEV2ZW50TGlzdGVuZXIoICdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcclxuXHR9ICk7XHJcblx0dGhpcy5TLnNjZW5lLmFkZCh0aGlzLlMuY2FtZXJhKTtcclxuXHR0aGlzLnRhcmdldC5hcHBlbmQodGhpcy5TLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xyXG5cdHJldHVybiB0aGlzO1xyXG59XHJcbkNnZW5BcHAucHJvdG90eXBlLmluaXRXb3JsZCA9IGZ1bmN0aW9uKG9wdHMpIHtcclxuXHQvL1dPUkxEXHRcclxuXHR0aGlzLndvcmxkID0gbmV3IFdvcmxkTG9hZGVyKHRoaXMpLmluaXQoKTtcclxuXHR0aGlzLlMuc2NlbmUuYWRkKCB0aGlzLndvcmxkLmdldFJvb3QoKSk7XHRcclxuXHRyZXR1cm4gdGhpcztcclxufTtcclxuQ2dlbkFwcC5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XHJcblx0Y29uc29sZS5pbmZvKFwiQXBwbGljYXRpb24gc3RhcnRlZFwiKTtcclxuXHJcblxyXG5cdHRoaXMuUy5jYW1lcmEucG9zaXRpb24ueCA9IHRoaXMuUEcuZW50aXR5LnBvc2l0aW9uLng7XHJcblx0dGhpcy5TLmNhbWVyYS5wb3NpdGlvbi55ID0gdGhpcy5QRy5lbnRpdHkucG9zaXRpb24ueSs1MDAwO1xyXG5cdHRoaXMuUy5jYW1lcmEucG9zaXRpb24ueiA9IHRoaXMuUEcuZW50aXR5LnBvc2l0aW9uLno7XHJcblxyXG5cclxuXHJcblxyXG5cdHRoaXMubG9vcCgpO1xyXG5cdHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuQ2dlbkFwcC5wcm90b3R5cGUucXVlcnlDb250cm9scyA9IGZ1bmN0aW9uKGtleSl7XHJcblx0cmV0dXJuIHRoaXMuUy5rZXlzW2tleV07XHJcbn07XHJcbkNnZW5BcHAucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpIHtcclxuXHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0dmFyIGxhc3RUaW1lTXNlYz0gbnVsbFxyXG5cdFxyXG5cdGZ1bmN0aW9uIGFuaW1hdGUobm93TXNlYyl7XHJcblx0XHQvL25vd01zZWMgPSBub3dNc2VjLnRvRml4ZWQoMCk7XHJcblx0XHQvL2NvbnNvbGUuaW5mbygnbG9vcGluZyAnICsgbm93TXNlYyk7XHRcdFxyXG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKCBhbmltYXRlLmJpbmQoc2VsZikgKTtcclxuXHRcdC8vIG1lYXN1cmUgdGltZVxyXG5cdFx0bGFzdFRpbWVNc2VjXHQ9IGxhc3RUaW1lTXNlYyB8fCBub3dNc2VjLTEwMDAvNjBcclxuXHRcdHZhciBkZWx0YU1zZWNcdD0gTWF0aC5taW4oMjAwLCBub3dNc2VjIC0gbGFzdFRpbWVNc2VjKVxyXG5cdFx0bGFzdFRpbWVNc2VjXHQ9IG5vd01zZWNcclxuXHRcdC8vIGNhbGwgZWFjaCB1cGRhdGUgZnVuY3Rpb25cclxuXHRcdHNlbGYuUy5jb250cm9scy51cGRhdGUoZGVsdGFNc2VjLzEwMDApO1xyXG5cdFx0c2VsZi51cGRhdGVGY3RzLmZvckVhY2goZnVuY3Rpb24odXBkYXRlRm4pe1xyXG5cdFx0XHR1cGRhdGVGbi5iaW5kKHNlbGYpKGRlbHRhTXNlYy8xMDAwLCBub3dNc2VjLzEwMDApXHJcblx0XHR9KTtcclxuXHRcdHNlbGYuUy5yZW5kZXJlci5yZW5kZXIoc2VsZi5TLnNjZW5lLCBzZWxmLlMuY2FtZXJhKTtcclxuXHR9XHJcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUuYmluZChzZWxmKSk7XHJcbn07XHJcbm1vZHVsZS5leHBvcnRzID0gQ2dlbkFwcDtcclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuLy9JTklUIENPTlRST0xTXHJcbi8qXHJcblx0dmFyIGhhdmVQb2ludGVyTG9jayA9ICdwb2ludGVyTG9ja0VsZW1lbnQnIGluIGRvY3VtZW50IHx8ICdtb3pQb2ludGVyTG9ja0VsZW1lbnQnIGluIGRvY3VtZW50IHx8ICd3ZWJraXRQb2ludGVyTG9ja0VsZW1lbnQnIGluIGRvY3VtZW50O1xyXG5cdGlmICggaGF2ZVBvaW50ZXJMb2NrICkge1xyXG5cdFx0dGhpcy5TLmNvbnRyb2xzID0gIG5ldyBUSFJFRS5Qb2ludGVyTG9ja0NvbnRyb2xzKCB0aGlzLlMuY2FtZXJhICk7XHRcdFxyXG5cdFx0Ly90aGlzLlMuc2NlbmUuYWRkKHRoaXMuUy5jb250cm9scy5nZXRPYmplY3QoKSk7XHJcblx0XHR0aGlzLnBsQ29udGV4dCA9IG5ldyBQbENvbnRleHQodGhpcy5TLmNvbnRyb2xzKTtcclxuXHRcdHRoaXMudGFyZ2V0LmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0c2VsZi5wbENvbnRleHQuc3RhcnQoKTtcclxuXHRcdH0pO1x0XHRcclxuXHR9XHJcblxyXG52YXIgUGxDb250ZXh0ID0gZnVuY3Rpb24oY29udHJvbHMpe1xyXG5cdHZhciBlbGVtZW50ID0gZG9jdW1lbnQuYm9keTtcclxuXHRyZXR1cm4ge1x0XHJcblx0XHRsaXN0ZW5lcnMgOiBmdW5jdGlvbigpIHtcdFxyXG5cdFx0XHR2YXIgcGwgPSB0aGlzO1xyXG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcmxvY2tjaGFuZ2UnLCBwbC5wb2ludGVybG9ja2NoYW5nZSwgZmFsc2UgKTtcclxuXHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21venBvaW50ZXJsb2NrY2hhbmdlJywgcGwucG9pbnRlcmxvY2tjaGFuZ2UsIGZhbHNlICk7XHJcblx0XHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd3ZWJraXRwb2ludGVybG9ja2NoYW5nZScsIHBsLnBvaW50ZXJsb2NrY2hhbmdlLCBmYWxzZSApO1xyXG5cclxuXHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJsb2NrZXJyb3InLCBwbC5wb2ludGVybG9ja2Vycm9yLCBmYWxzZSApO1xyXG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW96cG9pbnRlcmxvY2tlcnJvcicsIHBsLnBvaW50ZXJsb2NrZXJyb3IsIGZhbHNlICk7XHJcblx0XHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd3ZWJraXRwb2ludGVybG9ja2Vycm9yJywgcGwucG9pbnRlcmxvY2tlcnJvciwgZmFsc2UgKTtcclxuXHRcdH0sXHJcblx0XHRwb2ludGVybG9ja2NoYW5nZSA6IGZ1bmN0aW9uICggZXZlbnQgKSB7XHJcblx0XHRcdGlmICggZG9jdW1lbnQucG9pbnRlckxvY2tFbGVtZW50ID09PSBlbGVtZW50IHx8IGRvY3VtZW50Lm1velBvaW50ZXJMb2NrRWxlbWVudCA9PT0gZWxlbWVudCB8fCBkb2N1bWVudC53ZWJraXRQb2ludGVyTG9ja0VsZW1lbnQgPT09IGVsZW1lbnQgKSB7XHJcblx0XHRcdFx0Ly9jb250cm9sc0VuYWJsZWQgPSB0cnVlO1xyXG5cdFx0XHRcdGNvbnRyb2xzLmVuYWJsZWQgPSB0cnVlO1x0XHRcdFxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vY29udHJvbHMuZW5hYmxlZCA9IGZhbHNlO1xyXG5cdFx0XHRcdGNvbnNvbGUud2Fybignbm8gcG9pbnRlcmxvY2snKTtcdFxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fSxcclxuXHRcdHBvaW50ZXJsb2NrZXJyb3IgOiBmdW5jdGlvbiAoIGV2ZW50ICkge1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKCdwb2ludGVybG9jayBlcnJvcicpO1xyXG5cdFx0fSxcclxuXHRcdHN0YXJ0OiBmdW5jdGlvbiAgKCkge1xyXG5cdFx0XHR0aGlzLmxpc3RlbmVycygpO1xyXG5cdFx0XHRlbGVtZW50LnJlcXVlc3RQb2ludGVyTG9jayA9IGVsZW1lbnQucmVxdWVzdFBvaW50ZXJMb2NrIHx8IGVsZW1lbnQubW96UmVxdWVzdFBvaW50ZXJMb2NrIHx8IGVsZW1lbnQud2Via2l0UmVxdWVzdFBvaW50ZXJMb2NrO1xyXG5cdFx0XHRpZiAoIC9GaXJlZm94L2kudGVzdCggbmF2aWdhdG9yLnVzZXJBZ2VudCApICkge1xyXG5cdFx0XHRcdHZhciBmdWxsc2NyZWVuY2hhbmdlID0gZnVuY3Rpb24gKCBldmVudCApIHtcclxuXHRcdFx0XHRcdGlmICggZG9jdW1lbnQuZnVsbHNjcmVlbkVsZW1lbnQgPT09IGVsZW1lbnQgfHwgZG9jdW1lbnQubW96RnVsbHNjcmVlbkVsZW1lbnQgPT09IGVsZW1lbnQgfHwgZG9jdW1lbnQubW96RnVsbFNjcmVlbkVsZW1lbnQgPT09IGVsZW1lbnQgKSB7XHJcblx0XHRcdFx0XHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdmdWxsc2NyZWVuY2hhbmdlJywgZnVsbHNjcmVlbmNoYW5nZSApO1xyXG5cdFx0XHRcdFx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW96ZnVsbHNjcmVlbmNoYW5nZScsIGZ1bGxzY3JlZW5jaGFuZ2UgKTtcclxuXHRcdFx0XHRcdFx0ZWxlbWVudC5yZXF1ZXN0UG9pbnRlckxvY2soKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdmdWxsc2NyZWVuY2hhbmdlJywgZnVsbHNjcmVlbmNoYW5nZSwgZmFsc2UgKTtcclxuXHRcdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW96ZnVsbHNjcmVlbmNoYW5nZScsIGZ1bGxzY3JlZW5jaGFuZ2UsIGZhbHNlICk7XHJcblx0XHRcdFx0ZWxlbWVudC5yZXF1ZXN0RnVsbHNjcmVlbiA9IGVsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4gfHwgZWxlbWVudC5tb3pSZXF1ZXN0RnVsbHNjcmVlbiB8fCBlbGVtZW50Lm1velJlcXVlc3RGdWxsU2NyZWVuIHx8IGVsZW1lbnQud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW47XHJcblx0XHRcdFx0ZWxlbWVudC5yZXF1ZXN0RnVsbHNjcmVlbigpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGVsZW1lbnQucmVxdWVzdFBvaW50ZXJMb2NrKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbiovXHJcbiIsIi8vIGh0dHA6Ly9tcmwubnl1LmVkdS9+cGVybGluL25vaXNlL1xyXG5cclxudmFyIEltcHJvdmVkTm9pc2UgPSBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdHZhciBwID0gWyAxNTEsMTYwLDEzNyw5MSw5MCwxNSwxMzEsMTMsMjAxLDk1LDk2LDUzLDE5NCwyMzMsNywyMjUsMTQwLDM2LDEwMywzMCw2OSwxNDIsOCw5OSwzNywyNDAsMjEsMTAsXHJcblx0XHQgMjMsMTkwLDYsMTQ4LDI0NywxMjAsMjM0LDc1LDAsMjYsMTk3LDYyLDk0LDI1MiwyMTksMjAzLDExNywzNSwxMSwzMiw1NywxNzcsMzMsODgsMjM3LDE0OSw1Niw4NyxcclxuXHRcdCAxNzQsMjAsMTI1LDEzNiwxNzEsMTY4LDY4LDE3NSw3NCwxNjUsNzEsMTM0LDEzOSw0OCwyNywxNjYsNzcsMTQ2LDE1OCwyMzEsODMsMTExLDIyOSwxMjIsNjAsMjExLFxyXG5cdFx0IDEzMywyMzAsMjIwLDEwNSw5Miw0MSw1NSw0NiwyNDUsNDAsMjQ0LDEwMiwxNDMsNTQsNjUsMjUsNjMsMTYxLDEsMjE2LDgwLDczLDIwOSw3NiwxMzIsMTg3LDIwOCxcclxuXHRcdCA4OSwxOCwxNjksMjAwLDE5NiwxMzUsMTMwLDExNiwxODgsMTU5LDg2LDE2NCwxMDAsMTA5LDE5OCwxNzMsMTg2LDMsNjQsNTIsMjE3LDIyNiwyNTAsMTI0LDEyMyw1LFxyXG5cdFx0IDIwMiwzOCwxNDcsMTE4LDEyNiwyNTUsODIsODUsMjEyLDIwNywyMDYsNTksMjI3LDQ3LDE2LDU4LDE3LDE4MiwxODksMjgsNDIsMjIzLDE4MywxNzAsMjEzLDExOSxcclxuXHRcdCAyNDgsMTUyLDIsNDQsMTU0LDE2Myw3MCwyMjEsMTUzLDEwMSwxNTUsMTY3LDQzLDE3Miw5LDEyOSwyMiwzOSwyNTMsMTksOTgsMTA4LDExMCw3OSwxMTMsMjI0LDIzMixcclxuXHRcdCAxNzgsMTg1LDExMiwxMDQsMjE4LDI0Niw5NywyMjgsMjUxLDM0LDI0MiwxOTMsMjM4LDIxMCwxNDQsMTIsMTkxLDE3OSwxNjIsMjQxLDgxLDUxLDE0NSwyMzUsMjQ5LFxyXG5cdFx0IDE0LDIzOSwxMDcsNDksMTkyLDIxNCwzMSwxODEsMTk5LDEwNiwxNTcsMTg0LDg0LDIwNCwxNzYsMTE1LDEyMSw1MCw0NSwxMjcsNCwxNTAsMjU0LDEzOCwyMzYsMjA1LFxyXG5cdFx0IDkzLDIyMiwxMTQsNjcsMjksMjQsNzIsMjQzLDE0MSwxMjgsMTk1LDc4LDY2LDIxNSw2MSwxNTYsMTgwIF07XHJcblxyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgMjU2IDsgaSArKykge1xyXG5cclxuXHRcdHBbMjU2ICsgaV0gPSBwW2ldO1xyXG5cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGZhZGUodCkge1xyXG5cclxuXHRcdHJldHVybiB0ICogdCAqIHQgKiAodCAqICh0ICogNiAtIDE1KSArIDEwKTtcclxuXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBsZXJwKHQsIGEsIGIpIHtcclxuXHJcblx0XHRyZXR1cm4gYSArIHQgKiAoYiAtIGEpO1xyXG5cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdyYWQoaGFzaCwgeCwgeSwgeikge1xyXG5cclxuXHRcdHZhciBoID0gaGFzaCAmIDE1O1xyXG5cdFx0dmFyIHUgPSBoIDwgOCA/IHggOiB5LCB2ID0gaCA8IDQgPyB5IDogaCA9PSAxMiB8fCBoID09IDE0ID8geCA6IHo7XHJcblx0XHRyZXR1cm4gKChoJjEpID09IDAgPyB1IDogLXUpICsgKChoJjIpID09IDAgPyB2IDogLXYpO1xyXG5cclxuXHR9XHJcblxyXG5cdHJldHVybiB7XHJcblxyXG5cdFx0bm9pc2U6IGZ1bmN0aW9uICh4LCB5LCB6KSB7XHJcblxyXG5cdFx0XHR2YXIgZmxvb3JYID0gfn54LCBmbG9vclkgPSB+fnksIGZsb29yWiA9IH5+ejtcclxuXHJcblx0XHRcdHZhciBYID0gZmxvb3JYICYgMjU1LCBZID0gZmxvb3JZICYgMjU1LCBaID0gZmxvb3JaICYgMjU1O1xyXG5cclxuXHRcdFx0eCAtPSBmbG9vclg7XHJcblx0XHRcdHkgLT0gZmxvb3JZO1xyXG5cdFx0XHR6IC09IGZsb29yWjtcclxuXHJcblx0XHRcdHZhciB4TWludXMxID0geCAtIDEsIHlNaW51czEgPSB5IC0gMSwgek1pbnVzMSA9IHogLSAxO1xyXG5cclxuXHRcdFx0dmFyIHUgPSBmYWRlKHgpLCB2ID0gZmFkZSh5KSwgdyA9IGZhZGUoeik7XHJcblxyXG5cdFx0XHR2YXIgQSA9IHBbWF0gKyBZLCBBQSA9IHBbQV0gKyBaLCBBQiA9IHBbQSArIDFdICsgWiwgQiA9IHBbWCArIDFdICsgWSwgQkEgPSBwW0JdICsgWiwgQkIgPSBwW0IgKyAxXSArIFo7XHJcblxyXG5cdFx0XHRyZXR1cm4gbGVycCh3LCBsZXJwKHYsIGxlcnAodSwgZ3JhZChwW0FBXSwgeCwgeSwgeiksIFxyXG5cdFx0XHRcdFx0XHRcdGdyYWQocFtCQV0sIHhNaW51czEsIHksIHopKSxcclxuXHRcdFx0XHRcdFx0bGVycCh1LCBncmFkKHBbQUJdLCB4LCB5TWludXMxLCB6KSxcclxuXHRcdFx0XHRcdFx0XHRncmFkKHBbQkJdLCB4TWludXMxLCB5TWludXMxLCB6KSkpLFxyXG5cdFx0XHRcdFx0bGVycCh2LCBsZXJwKHUsIGdyYWQocFtBQSArIDFdLCB4LCB5LCB6TWludXMxKSxcclxuXHRcdFx0XHRcdFx0XHRncmFkKHBbQkEgKyAxXSwgeE1pbnVzMSwgeSwgeiAtIDEpKSxcclxuXHRcdFx0XHRcdFx0bGVycCh1LCBncmFkKHBbQUIgKyAxXSwgeCwgeU1pbnVzMSwgek1pbnVzMSksXHJcblx0XHRcdFx0XHRcdFx0Z3JhZChwW0JCICsgMV0sIHhNaW51czEsIHlNaW51czEsIHpNaW51czEpKSkpO1xyXG5cclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEltcHJvdmVkTm9pc2U7ICAgICAgICAgICAgICAgICAgICAgICAgICAiLCJmdW5jdGlvbiBIZWxwZXIoKSB7XHJcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgSGVscGVyKSkgcmV0dXJuIG5ldyBIZWxwZXIoKTtcclxuICAgIHRoaXMuREFURV9GT1JNQVQgPSAnZGQgTU0gaGg6aWknO1xyXG4gICAgdGhpcy5GQl9EQVRFID0gJ2RkL21tL3l5eXkgaGg6aWknXHJcbiAgICByZXR1cm4gdGhpcztcclxufVxyXG5IZWxwZXIucHJvdG90eXBlLmRhdGVUb1N0cmluZyA9IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgIHJldHVybiAkLmZvcm1hdERhdGVUaW1lKHRoaXMuREFURV9GT1JNQVQsIGRhdGUpO1xyXG59O1xyXG5IZWxwZXIucHJvdG90eXBlLnRvRmJEYXRlID0gZnVuY3Rpb24oZGF0ZSkge1xyXG4gICAgcmV0dXJuIGRhdGUuZ2V0VGltZSgpO1xyXG59O1xyXG5IZWxwZXIucHJvdG90eXBlLm1zVG9TdHJpbmcgPSBmdW5jdGlvbihkYXRlKSB7XHJcbiAgICByZXR1cm4gJC5mb3JtYXREYXRlVGltZSh0aGlzLkRBVEVfRk9STUFULCBuZXcgRGF0ZShkYXRlKSk7XHJcbn07XHJcbkhlbHBlci5wcm90b3R5cGUuc3RyaW5nVG9EYXRlID0gZnVuY3Rpb24ocykge1xyXG4gICAgcmV0dXJuIG5ldyBEYXRlKHMpO1xyXG59O1xyXG5IZWxwZXIucHJvdG90eXBlLmRlZXBDb3B5ID0gZnVuY3Rpb24ob2xkT2JqZWN0KSB7XHJcbiAgICByZXR1cm4gJC5leHRlbmQodHJ1ZSwge30sIG9sZE9iamVjdCk7XHJcbn07XHJcbkhlbHBlci5wcm90b3R5cGUuc2hhbGxvd0NvcHkgPSBmdW5jdGlvbihvbGRPYmplY3QpIHtcclxuICAgIHJldHVybiAkLmV4dGVuZCh7fSwgb2xkT2JqZWN0KTtcclxufTtcclxuSGVscGVyLnByb3RvdHlwZS5yYW5kb20gPSBmdW5jdGlvbihtaW4sIG1heCkge1xyXG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbjtcclxufTtcclxuSGVscGVyLnByb3RvdHlwZS5yYW5kb21JbnQgPSBmdW5jdGlvbihtaW4sIG1heCkge1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XHJcbn07XHJcbkhlbHBlci5wcm90b3R5cGUuZXh0ZW5kID0gZnVuY3Rpb24oYSwgYikge1xyXG4gICAgZm9yICh2YXIga2V5IGluIGIpIHtcclxuICAgICAgICBpZiAoYi5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgIGFba2V5XSA9IGJba2V5XTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGE7XHJcbn07XHJcbkhlbHBlci5wcm90b3R5cGUuZGlzdGFuY2UgPSBmdW5jdGlvbihmcm9tLCB0bykge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICByZXR1cm4gZ29vZ2xlLm1hcHMuZ2VvbWV0cnkuc3BoZXJpY2FsLmNvbXB1dGVEaXN0YW5jZUJldHdlZW4oZnJvbSwgdG8pO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG59O1xyXG5IZWxwZXIucHJvdG90eXBlLnNwZWVkTVMgPSBmdW5jdGlvbihmcm9tLCB0bywgbXMpIHtcclxuICAgIHZhciBtID0gZ29vZ2xlLm1hcHMuZ2VvbWV0cnkuc3BoZXJpY2FsLmNvbXB1dGVEaXN0YW5jZUJldHdlZW4oZnJvbSwgdG8pO1xyXG4gICAgdmFyIHNwZWVkID0gbSAvICgxMDAwICogbXMpO1xyXG4gICAgcmV0dXJuIHNwZWVkO1xyXG59O1xyXG5IZWxwZXIucHJvdG90eXBlLnNwZWVkS21IID0gZnVuY3Rpb24oZnJvbSwgdG8sIG1zKSB7XHJcbiAgICB2YXIgc3BlZWRLbSA9ICh0aGlzLnNwZWVkTVMoZnJvbSwgdG8sIG1zKSAvL20vc1xyXG4gICAgICAgICogNjAgLy8gbS9taW5cclxuICAgICAgICAqIDYwIC8vIG0vaFxyXG4gICAgKSAvIDEwMDA7IC8va20vaFxyXG4gICAgcmV0dXJuIHNwZWVkS207XHJcbn07XHJcbkhlbHBlci5wcm90b3R5cGUuaW50ZXJwb2xhdGUgPSBmdW5jdGlvbih2YWwsIG1pbiwgbWF4LCBuZXdfbWluLCBuZXdfbWF4KSB7XHJcbiAgICAvLyAgICAgICAgIChiIC0gYSkoeCAtIG1pbilcclxuICAgIC8vIGYoeCkgPSAtLSAtLSAtLSAtLSAtLSAtLSAtLSArIGFcclxuICAgIC8vICAgICAgICAgICAgIG1heCAtIG1pblxyXG4gICAgLy8gICAgICAgICAgICAgXHJcblxyXG4gICAgdmFyIGZ4ID0gbmV3X21pbiArICgoKG5ld19tYXgtbmV3X21pbikqKHZhbCAtIG1pbikpLyhtYXggLSBtaW4pKVxyXG4gICAgcmV0dXJuIGZ4O1xyXG59O1xyXG5IZWxwZXIucHJvdG90eXBlLmRheU9mVGhlWWVhciA9IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgIHZhciBqMSA9IG5ldyBEYXRlKGRhdGUpO1xyXG4gICAgajEuc2V0TW9udGgoMCwgMCk7XHJcbiAgICByZXR1cm4gTWF0aC5yb3VuZCgoZGF0ZSAtIGoxKSAvIDguNjRlNyk7XHJcbn07XHJcblxyXG5IZWxwZXIucHJvdG90eXBlLmdldFVJRCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuICcjJyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBIZWxwZXIoKTsiLCJ2YXIgX3Bvc2l0aW9uID0ge1xyXG5cdFx0eDoxMDAsIFxyXG5cdFx0eTo1MDAsIFxyXG5cdFx0ejoxMDBcclxufTtcclxuXHJcbnZhciBVc2VyU3RvcmUgPSBmdW5jdGlvbih1c2VySWQpe1xyXG5cdHRoaXMudXNlcklkID0gdXNlcklkO1xyXG59XHJcblxyXG5Vc2VyU3RvcmUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiB7XHJcblx0XHRwb3NpdGlvbjogX3Bvc2l0aW9uLFxyXG5cdFx0dXNlcklkOiB0aGlzLnVzZXJJZCxcclxuXHRcdHVzZXJOYW1lOiAnZ3VyYmFubycsXHJcblx0XHR1cGRhdGU6IGZ1bmN0aW9uIChjb250cm9scywgZGVsdGEsIG5vdykge1xyXG5cdFx0XHQvL2NvbnNvbGUuaW5mbyhjb250cm9scyk7XHJcblx0XHR9XHJcblxyXG5cdH07IC8vbG9hZCBmcm9tIERCIC8vIG5ldHdvcmtcclxufTtcclxuXHJcblVzZXJTdG9yZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oZGF0YSkge1xyXG5cdF9wb3NpdGlvbi54ID0gZGF0YS5wb3NpdGlvbi54O1xyXG5cdF9wb3NpdGlvbi55ID0gZGF0YS5wb3NpdGlvbi55O1xyXG5cdF9wb3NpdGlvbi56ID0gZGF0YS5wb3NpdGlvbi56O1xyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVXNlclN0b3JlO1xyXG5cclxuXHJcbiIsInZhciBJbXByb3ZlZE5vaXNlID0gcmVxdWlyZSgnLi4vZGVwL0ltcHJvdmVkTm9pc2UnKTtcclxudmFyIFBsYW5ldEZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3Rvcmllcy9QbGFuZXRGYWN0b3J5Jyk7XHJcbnZhciBoZWxwZXIgPSByZXF1aXJlKCcuLi9oZWxwZXInKTtcclxuXHJcblxyXG52YXIgV29ybGRMb2FkZXIgPSBmdW5jdGlvbihwYXJlbnQpe1xyXG5cdHRoaXMucGFyZW50ID0gcGFyZW50OyAvL3BhcmVudCBhcHBcclxufVxyXG5Xb3JsZExvYWRlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGNlbnRlcikge1xyXG5cdC8vVE9ETzogTE9BRCBXT1JMRFxyXG5cdHJldHVybiBuZXcgV29ybGQodGhpcy5wYXJlbnQpO1xyXG59O1xyXG5cclxuXHJcbnZhciBXb3JsZCA9IGZ1bmN0aW9uIChhcHApIHtcclxuXHR2YXIgcm9vdCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG5cdHRoaXMuZ2V0Um9vdCA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiByb290O1xyXG5cdH1cclxuXHJcblx0dGhpcy5pZCA9ICd3b3JsZDAnO1xyXG5cdHRoaXMuaW50ZXJjZXB0b3IgPSB7IC8vaW50ZXJjZXB0IHdpdGggdGhlIG1vdXNlXHJcblx0XHRyYXljYXN0ZXIgOiBuZXcgVEhSRUUuUmF5Y2FzdGVyKCksXHJcblx0XHRtb3VzZSA6IG5ldyBUSFJFRS5WZWN0b3IyKCksXHJcblx0XHRyZW5kZXJlciA6IGFwcC5TLnJlbmRlcmVyLFxyXG5cdFx0Y2FtZXJhIDogYXBwLlMuY2FtZXJhLFxyXG5cdH1cdFxyXG5cdHRoaXMucmF5Y2FzdGVyID0geyAvL2ludGVyY2VwdCB3aXRoIHRoZSBwbGF5ZXJcclxuXHRcdHJheWNhc3RlciA6IG5ldyBUSFJFRS5SYXljYXN0ZXIoKSxcclxuXHRcdHN0YXJ0IDogbmV3IFRIUkVFLlZlY3RvcjIoKSxcclxuXHRcdHJlbmRlcmVyIDogYXBwLlMucmVuZGVyZXIsXHJcblx0XHRjYW1lcmEgOiBhcHAuUy5jYW1lcmEsXHJcblx0fVx0XHJcblx0XHJcblx0dGhpcy5lbnRpdGllcyA9IHt9O1x0XHJcblx0dGhpcy5hZGQoJ2xpZ2h0JywgZ2V0TGlnaHQoKSk7XHJcblx0dGhpcy5hZGQoJ2hlbHBlcicsIGdldEhlbHBlcigpKTtcclxuXHR0aGlzLmFkZCgnYXhpc0hlbHBlcicsIG5ldyBUSFJFRS5BeGlzSGVscGVyKCA1MDAwICkgKTtcdFxyXG5cdHRoaXMuYWRkKCdlYXJ0aCcsIGdldEVhcnRoKCkpO1xyXG5cdHRoaXMuYWRkKCdyb21lJywgZ2V0Q2l0eSg0MS44OTAyNTEsIDEyLjQ5MjM3MykpO1xyXG5cclxuXHJcblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlLmJpbmQodGhpcyksIGZhbHNlKTtcclxufVxyXG5cclxuV29ybGQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKGlkLCBvYmopIHtcclxuXHR0aGlzLmVudGl0aWVzW2lkXSA9IG9iajtcclxuXHR0aGlzLmdldFJvb3QoKS5hZGQob2JqKTtcclxufTtcclxuV29ybGQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcclxuXHRyZXR1cm4gdGhpcy5lbnRpdGllc1tuYW1lXTtcclxufTtcclxuXHJcbldvcmxkLnByb3RvdHlwZS5zZXRTdW5Qb3NpdGlvbiA9IGZ1bmN0aW9uKF9fZGF0ZSkge1xyXG5cdGlmICh0aGlzLmdldCgnbGlnaHQnKSkge1xyXG5cdCAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKF9fZGF0ZSk7XHJcblx0ICAgIHZhciBkID0gaGVscGVyLmRheU9mVGhlWWVhcihkYXRlKTtcclxuXHQgICAgdmFyIGRheU9mVGhlWWVhciA9IChkIC0gOTEgKyAzNjUpICUgMzY1O1xyXG5cdCAgICB2YXIgbCA9IDE4MDA7XHJcblx0ICAgIHZhciBzZWFzb25zID0gW3tcclxuXHQgICAgICAgIGxpbWl0OiBbMCwgOTFdLFxyXG5cdCAgICAgICAgYW5nbGU6IFswLCBsXSxcclxuXHQgICAgICAgIGlkOiAnQSdcclxuXHQgICAgfSwge1xyXG5cdCAgICAgICAgbGltaXQ6IFs5MiwgMTcyXSxcclxuXHQgICAgICAgIGFuZ2xlOiBbbCwgMF0sXHJcblx0ICAgICAgICBpZDogJ0InXHJcblx0ICAgIH0sIHtcclxuXHQgICAgICAgIGxpbWl0OiBbMTczLCAyNjZdLFxyXG5cdCAgICAgICAgYW5nbGU6IFswLCAtbF0sXHJcblx0ICAgICAgICBpZDogJ0MnXHJcblx0ICAgIH0sIHtcclxuXHQgICAgICAgIGxpbWl0OiBbMjY2LCAzNjVdLFxyXG5cdCAgICAgICAgYW5nbGU6IFstbCwgMF0sXHJcblx0ICAgICAgICBpZDogJ0QnXHJcblx0ICAgIH1dO1xyXG5cdCAgICB2YXIgdGlsdCA9IDA7XHJcblx0ICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2Vhc29ucy5sZW5ndGg7IGkrKykge1xyXG5cdCAgICAgICAgdmFyIGxpbWl0ID0gc2Vhc29uc1tpXS5saW1pdDtcclxuXHQgICAgICAgIHZhciBhbmdsZSA9IHNlYXNvbnNbaV0uYW5nbGU7XHJcblx0ICAgICAgICBpZiAoZGF5T2ZUaGVZZWFyID49IGxpbWl0WzBdICYmIGRheU9mVGhlWWVhciA8IGxpbWl0WzFdKSB7XHJcblx0ICAgICAgICAgICAgdGlsdCA9IGhlbHBlci5pbnRlcnBvbGF0ZShkYXlPZlRoZVllYXIgKyAoZGF0ZS5nZXRIb3VycygpIC8gMjQpLCBsaW1pdFswXSwgbGltaXRbMV0sIGFuZ2xlWzBdLCBhbmdsZVsxXSk7XHJcblx0ICAgICAgICAgICAgY29uc29sZS5pbmZvKHNlYXNvbnNbaV0uaWQsIGQsIGRheU9mVGhlWWVhciwgdGlsdC50b0ZpeGVkKDApKTtcclxuXHQgICAgICAgICAgICBicmVhaztcclxuXHQgICAgICAgIH1cclxuXHQgICAgfTtcclxuXHJcblxyXG5cclxuXHQgICAgdmFyIHJldl9kZWdyZWUgPSAtKCgoX19kYXRlIC8gKDEwMDAgKiA2MCAqIDYwKSkgKyA2KSAlIDI0KSAqICgzNjAgLyAyNClcclxuXHQgICAgdmFyIHRpbHRfZGVnID0gdGlsdDtcclxuXHJcblxyXG5cdCAgICB0aGlzLmdldCgnbGlnaHQnKS5wb3NpdGlvbi5zZXQoTWF0aC5zaW4ocmV2X2RlZ3JlZSAqIE1hdGguUEkgLyAxODApICogNTAwMCwgdGlsdF9kZWcsIDUwMDAgKiBNYXRoLmNvcyhyZXZfZGVncmVlICogTWF0aC5QSSAvIDE4MCkpO1xyXG5cdCAgICB0aGlzLmdldCgnbGlnaHQnKS5sb29rQXQoMCwgMCwgMCk7XHJcblx0fVxyXG59XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gV29ybGRMb2FkZXI7XHJcblxyXG5cclxudmFyIG9uTW91c2VNb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuXHR0aGlzLmludGVyY2VwdG9yLm1vdXNlLnggPSAoIGV2ZW50LmNsaWVudFggLyB0aGlzLmludGVyY2VwdG9yLnJlbmRlcmVyLmRvbUVsZW1lbnQuY2xpZW50V2lkdGggKSAqIDIgLSAxO1xyXG5cdHRoaXMuaW50ZXJjZXB0b3IubW91c2UueSA9IC0gKCBldmVudC5jbGllbnRZIC8gdGhpcy5pbnRlcmNlcHRvci5yZW5kZXJlci5kb21FbGVtZW50LmNsaWVudEhlaWdodCApICogMiArIDE7XHJcblx0dGhpcy5pbnRlcmNlcHRvci5yYXljYXN0ZXIuc2V0RnJvbUNhbWVyYSggdGhpcy5pbnRlcmNlcHRvci5tb3VzZSwgdGhpcy5pbnRlcmNlcHRvci5jYW1lcmEgKTtcclxuXHQvLyBTZWUgaWYgdGhlIHJheSBmcm9tIHRoZSBjYW1lcmEgaW50byB0aGUgd29ybGQgaGl0cyBvbmUgb2Ygb3VyIG1lc2hlc1xyXG5cdHZhciBpbnRlcnNlY3RzID0gdGhpcy5pbnRlcmNlcHRvci5yYXljYXN0ZXIuaW50ZXJzZWN0T2JqZWN0KCAgdGhpcy5nZXQoJ2VhcnRoJykgKTtcclxuXHQvLyBUb2dnbGUgcm90YXRpb24gYm9vbCBmb3IgbWVzaGVzIHRoYXQgd2UgY2xpY2tlZFxyXG5cdGlmICggaW50ZXJzZWN0cy5sZW5ndGggPiAwICkge1xyXG5cdFx0Ly9jb25zb2xlLmluZm8oaW50ZXJzZWN0c1swXSk7XHJcblx0XHR0aGlzLmludGVyc2VjdCA9IHt4OiBpbnRlcnNlY3RzWzBdLnBvaW50LngsIHk6IGludGVyc2VjdHNbMF0ucG9pbnQueSwgejogaW50ZXJzZWN0c1swXS5wb2ludC56ICwgb2JqOiBpbnRlcnNlY3RzWzBdfTtcclxuXHR9ZWxzZXtcclxuXHRcdHRoaXMuaW50ZXJzZWN0ID0gdW5kZWZpbmVkO1xyXG5cdH1cclxufTtcclxuXHJcbmZ1bmN0aW9uIGdldEhlbHBlciAoKSB7XHJcblx0dmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkN5bGluZGVyR2VvbWV0cnkoIDAsIDIwLCAxMDAsIDMgKTtcclxuXHRnZW9tZXRyeS50cmFuc2xhdGUoIDAsIDUwLCAwICk7XHJcblx0Z2VvbWV0cnkucm90YXRlWCggTWF0aC5QSSAvIDIgKTtcclxuXHRyZXR1cm4gbmV3IFRIUkVFLk1lc2goIGdlb21ldHJ5LCBuZXcgVEhSRUUuTWVzaE5vcm1hbE1hdGVyaWFsKCkgKTtcclxufVxyXG5mdW5jdGlvbiBnZXRMaWdodCAoKSB7XHJcblx0dmFyIGxpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhmZmZmZmYsIDEuMCk7XHJcblx0bGlnaHQucG9zaXRpb24uc2V0KDUwMDAsIDAsIDUwMDApO1xyXG5cdHJldHVybiBsaWdodDtcclxufVxyXG5mdW5jdGlvbiBnZXRDaXR5KGxhdCxsbmcpe1xyXG5cdC8vdmFyIGdlb21ldHJ5ID0gIFRIUkVFLlNwaGVyZUdlb21ldHJ5KDEwMCwgMzIsIDMyKTtcclxuXHQvL3ZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7d2lyZWZyYW1lOnRydWV9KTtcclxuXHR2YXIgbWVzaCA9IG5ldyBUSFJFRS5BeGlzSGVscGVyKDUwMCk7XHJcblx0dmFyIHYzID0gZ2V0Q29vcmRzKGxhdCxsbmcpO1xyXG5cdG1lc2gucG9zaXRpb24uc2V0KHYzLngsdjMueSx2My56KTtcclxuXHRyZXR1cm4gbWVzaDtcclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBnZXRFYXJ0aCAoKSB7XHJcblx0cmV0dXJuIFBsYW5ldEZhY3RvcnkuZ2V0RWFydGgoKTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGdldENvb3JkcyAobGF0LCBsb24pIHtcclxuXHR2YXIgcmFkaXVzID0gNTAwMDtcclxuXHR2YXIgcGhpICAgPSAoOTAtbGF0KSooTWF0aC5QSS8xODApO1xyXG5cdHZhciB0aGV0YSA9IChsb24rMTgwKSooTWF0aC5QSS8xODApO1xyXG5cclxuXHR2YXIgeCA9IC0oKHJhZGl1cykgKiBNYXRoLnNpbihwaGkpKk1hdGguY29zKHRoZXRhKSk7XHJcblx0dmFyIHogPSAoKHJhZGl1cykgKiBNYXRoLnNpbihwaGkpKk1hdGguc2luKHRoZXRhKSk7XHJcblx0dmFyIHkgPSAoKHJhZGl1cykgKiBNYXRoLmNvcyhwaGkpKTtcclxuXHJcblx0cmV0dXJuIG5ldyBUSFJFRS5WZWN0b3IzKHgseSx6KTtcclxufVxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuVEhSRUUuU2hhZGVyVHlwZXMgPSB7XHJcblx0J3Bob25nRGlmZnVzZScgOiB7XHJcblx0XHR1bmlmb3Jtczoge1xyXG5cdFx0XHRcInVEaXJMaWdodFBvc1wiOlx0eyB0eXBlOiBcInYzXCIsIHZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMygpIH0sXHJcblx0XHRcdFwidURpckxpZ2h0Q29sb3JcIjogeyB0eXBlOiBcImNcIiwgdmFsdWU6IG5ldyBUSFJFRS5Db2xvciggMHhmZmZmZmYgKSB9LFxyXG5cdFx0XHRcInVNYXRlcmlhbENvbG9yXCI6ICB7IHR5cGU6IFwiY1wiLCB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCAweGZmZmZmZiApIH0sXHJcblx0XHRcdHVLZDoge1xyXG5cdFx0XHRcdHR5cGU6IFwiZlwiLFxyXG5cdFx0XHRcdHZhbHVlOiAwLjdcclxuXHRcdFx0fSxcclxuXHRcdFx0dUJvcmRlcjoge1xyXG5cdFx0XHRcdHR5cGU6IFwiZlwiLFxyXG5cdFx0XHRcdHZhbHVlOiAwLjRcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHRcdHZlcnRleFNoYWRlcjogW1xyXG5cdFx0XHRcInZhcnlpbmcgdmVjMyB2Tm9ybWFsO1wiLFxyXG5cdFx0XHRcInZhcnlpbmcgdmVjMyB2Vmlld1Bvc2l0aW9uO1wiLFxyXG5cdFx0XHRcInZvaWQgbWFpbigpIHtcIixcclxuXHRcdFx0XHRcImdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTtcIixcclxuXHRcdFx0XHRcInZOb3JtYWwgPSBub3JtYWxpemUoIG5vcm1hbE1hdHJpeCAqIG5vcm1hbCApO1wiLFxyXG5cdFx0XHRcdFwidmVjNCBtdlBvc2l0aW9uID0gbW9kZWxWaWV3TWF0cml4ICogdmVjNCggcG9zaXRpb24sIDEuMCApO1wiLFxyXG5cdFx0XHRcdFwidlZpZXdQb3NpdGlvbiA9IC1tdlBvc2l0aW9uLnh5ejtcIixcclxuXHJcblx0XHRcdFwifVwiXHJcblxyXG5cdFx0XS5qb2luKFwiXFxuXCIpLFxyXG5cclxuXHRcdGZyYWdtZW50U2hhZGVyOiBbXHJcblxyXG5cdFx0XHRcInVuaWZvcm0gdmVjMyB1TWF0ZXJpYWxDb2xvcjtcIixcclxuXHJcblx0XHRcdFwidW5pZm9ybSB2ZWMzIHVEaXJMaWdodFBvcztcIixcclxuXHRcdFx0XCJ1bmlmb3JtIHZlYzMgdURpckxpZ2h0Q29sb3I7XCIsXHJcblxyXG5cdFx0XHRcInVuaWZvcm0gZmxvYXQgdUtkO1wiLFxyXG5cdFx0XHRcInVuaWZvcm0gZmxvYXQgdUJvcmRlcjtcIixcclxuXHJcblx0XHRcdFwidmFyeWluZyB2ZWMzIHZOb3JtYWw7XCIsXHJcblx0XHRcdFwidmFyeWluZyB2ZWMzIHZWaWV3UG9zaXRpb247XCIsXHJcblxyXG5cdFx0XHRcInZvaWQgbWFpbigpIHtcIixcclxuXHJcblx0XHRcdFx0Ly8gY29tcHV0ZSBkaXJlY3Rpb24gdG8gbGlnaHRcclxuXHRcdFx0XHRcInZlYzQgbERpcmVjdGlvbiA9IHZpZXdNYXRyaXggKiB2ZWM0KCB1RGlyTGlnaHRQb3MsIDAuMCApO1wiLFxyXG5cdFx0XHRcdFwidmVjMyBsVmVjdG9yID0gbm9ybWFsaXplKCBsRGlyZWN0aW9uLnh5eiApO1wiLFxyXG5cclxuXHRcdFx0XHQvLyBkaWZmdXNlOiBOICogTC4gTm9ybWFsIG11c3QgYmUgbm9ybWFsaXplZCwgc2luY2UgaXQncyBpbnRlcnBvbGF0ZWQuXHJcblx0XHRcdFx0XCJ2ZWMzIG5vcm1hbCA9IG5vcm1hbGl6ZSggdk5vcm1hbCApO1wiLFxyXG5cdFx0XHRcdC8vd2FzOiBcImZsb2F0IGRpZmZ1c2UgPSBtYXgoIGRvdCggbm9ybWFsLCBsVmVjdG9yICksIDAuMCk7XCIsXHJcblx0XHRcdFx0Ly8gc29sdXRpb25cclxuXHRcdFx0XHRcImZsb2F0IGRpZmZ1c2UgPSBkb3QoIG5vcm1hbCwgbFZlY3RvciApO1wiLFxyXG5cdFx0XHRcdFwiaWYgKCBkaWZmdXNlID4gMC42ICkgeyBkaWZmdXNlID0gMS4wOyB9XCIsXHJcblx0XHRcdFx0XCJlbHNlIGlmICggZGlmZnVzZSA+IC0wLjIgKSB7IGRpZmZ1c2UgPSAwLjc7IH1cIixcclxuXHRcdFx0XHRcImVsc2UgeyBkaWZmdXNlID0gMC4zOyB9XCIsXHJcblxyXG5cdFx0XHRcdFwiZ2xfRnJhZ0NvbG9yID0gdmVjNCggdUtkICogdU1hdGVyaWFsQ29sb3IgKiB1RGlyTGlnaHRDb2xvciAqIGRpZmZ1c2UsIDEuMCApO1wiLFxyXG5cclxuXHRcdFx0XCJ9XCJcclxuXHJcblx0XHRdLmpvaW4oXCJcXG5cIilcclxuXHJcblx0fVxyXG5cclxufTsiLCJ2YXIgTWF0ZXJpYWxGYWN0b3J5ID0gZnVuY3Rpb24oKXtcclxuXHJcbn1cclxuTWF0ZXJpYWxGYWN0b3J5LnByb3RvdHlwZS5nZXRUZXN0TWF0ZXJpYWwgPSBmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHt3aXJlZnJhbWU6dHJ1ZX0pO1xyXG59O1xyXG5cclxuTWF0ZXJpYWxGYWN0b3J5LnByb3RvdHlwZS5nZXRDbG91ZHNNYXRlcmlhbCA9IGZ1bmN0aW9uKHRleHR1cmUpIHtcclxuXHR2YXIgbWF0ZXJpYWwgID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcclxuXHQgIG1hcCAgICAgOiB0ZXh0dXJlLFxyXG5cdCAgc2lkZSAgICAgICAgOiBUSFJFRS5Eb3VibGVTaWRlLFxyXG5cdCAgb3BhY2l0eSAgICAgOiAwLjQsXHJcblx0ICB0cmFuc3BhcmVudCA6IHRydWUsXHJcblx0ICBkZXB0aFdyaXRlICA6IGZhbHNlLFxyXG5cdH0pO1xyXG5cdHJldHVybiBtYXRlcmlhbDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IE1hdGVyaWFsRmFjdG9yeSgpOyIsInZhciBNYXRlcmlhbEZhY3RvcnkgPSByZXF1aXJlKCcuL01hdGVyaWFsRmFjdG9yeScpO1xyXG52YXIgUE9TX1hfTCA9IDMwMDA7XHJcbnZhciBQT1NfWV9MID0gMDtcclxudmFyIFBPU19aX0wgPSAzMDAwO1xyXG5cclxudmFyIGNvbmYgPSB7XHJcblx0RUFSVEg6IHtcclxuXHRcdFJBRElVUzogNTAwMCxcclxuXHRcdEJBU0VfQ09MT1I6IDU1NDQzMyxcclxuXHRcdEJBU0VfRk9MREVSOiAnaW1hZ2VzL0VBUlRILycsXHJcblx0XHRCVU1QX1NDQUxFOiA1MCxcclxuXHRcdENMT1VEUzogdHJ1ZVxyXG5cdH1cclxufVxyXG5cclxudmFyIFBsYW5ldEZhY3RvcnkgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHJcbn07XHJcblxyXG5cclxuUGxhbmV0RmFjdG9yeS5wcm90b3R5cGUuZ2V0UGxhbmV0R2VvbWV0cnkgPSBmdW5jdGlvbihjb25mKSB7XHJcblx0cmV0dXJuIG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeShjb25mLlJBRElVUywgMzIsIDMyKTtcclxufTtcclxuUGxhbmV0RmFjdG9yeS5wcm90b3R5cGUuZ2V0UGxhbmV0TWF0ZXJpYWwgPSBmdW5jdGlvbihjb25mLCBxdWFsaXR5KSB7XHJcblx0dmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKCk7XHJcblx0bWF0ZXJpYWwubWFwICAgID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShjb25mLkJBU0VfRk9MREVSICsgKHF1YWxpdHkgfHwgJzFrJykgICsgJy90ZXh0dXJlLmpwZycpO1xyXG5cdG1hdGVyaWFsLmJ1bXBNYXAgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKGNvbmYuQkFTRV9GT0xERVIgKyAocXVhbGl0eSB8fCAnMWsnKSAgKyAnL2J1bXAuanBnJyk7XHJcblx0bWF0ZXJpYWwuYnVtcFNjYWxlID0gY29uZi5CVU1QX1NDQUxFO1xyXG5cclxuXHRtYXRlcmlhbC5zcGVjdWxhck1hcCAgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKGNvbmYuQkFTRV9GT0xERVIgKyAocXVhbGl0eSB8fCAnMWsnKSAgKyAnL3NwZWN1bGFyLmpwZycpO1xyXG5cdG1hdGVyaWFsLnNwZWN1bGFyICA9IG5ldyBUSFJFRS5Db2xvcignZ3JleScpXHJcblx0cmV0dXJuIG1hdGVyaWFsO1xyXG59O1xyXG5QbGFuZXRGYWN0b3J5LnByb3RvdHlwZS5nZXRQbGFuZXRNZXNoID0gZnVuY3Rpb24oZ2VvbWV0cnksIG1hdGVyaWFsKSB7XHJcblx0dmFyIG1haW5NZXNoID0gIG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblx0cmV0dXJuIG1haW5NZXNoO1xyXG59O1xyXG5QbGFuZXRGYWN0b3J5LnByb3RvdHlwZS5nZXRFYXJ0aCA9IGZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiB0aGlzLmdldFBsYW5ldCgnRUFSVEgnKTtcclxufTtcclxuUGxhbmV0RmFjdG9yeS5wcm90b3R5cGUuZ2V0UGxhbmV0ID0gZnVuY3Rpb24obmFtZSkge1xyXG5cdHZhciBnZW9tZXRyeSA9IHRoaXMuZ2V0UGxhbmV0R2VvbWV0cnkoY29uZltuYW1lXSk7XHJcblx0dmFyIG1hdGVyaWFsID0gdGhpcy5nZXRQbGFuZXRNYXRlcmlhbChjb25mW25hbWVdLCBcIjRrXCIpO1xyXG5cdHZhciBwbGFuZXRNZXNoID0gdGhpcy5nZXRQbGFuZXRNZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblx0cGxhbmV0TWVzaC5jYXN0U2hhZG93ID0gdHJ1ZTtcclxuICAgIHBsYW5ldE1lc2gucmVjZWl2ZVNoYWRvdyA9IHRydWU7XHJcblx0aWYgKGNvbmZbbmFtZV0uQ0xPVURTKXtcclxuXHRcdHZhciBjbG91ZHNHZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeShjb25mW25hbWVdLlJBRElVUyArIDE4MCwgMzIsIDMyKTtcclxuXHRcdHZhciBjbG91ZHNNYXRlcmlhbCA9IE1hdGVyaWFsRmFjdG9yeS5nZXRDbG91ZHNNYXRlcmlhbChUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKGNvbmZbbmFtZV0uQkFTRV9GT0xERVIgKyAnY2xvdWRzL2Nsb3Vkc190LmpwZycpKTtcclxuXHRcdHBsYW5ldE1lc2guY2xvdWRzTWVzaCA9IG5ldyBUSFJFRS5NZXNoKGNsb3Vkc0dlb21ldHJ5LCBjbG91ZHNNYXRlcmlhbCk7XHJcblx0XHRwbGFuZXRNZXNoLmFkZChwbGFuZXRNZXNoLmNsb3Vkc01lc2gpO31cclxuXHRcdC8vcGxhbmV0TWVzaC5jbG91ZHNNZXNoLmNhc3RTaGFkb3cgPSB0cnVlO1xyXG4gICAgICAgIC8vcGxhbmV0TWVzaC5jbG91ZHNNZXNoLnJlY2VpdmVTaGFkb3cgPSB0cnVlO1xyXG5cclxuXHRyZXR1cm4gcGxhbmV0TWVzaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IFBsYW5ldEZhY3RvcnkoKTsiLCJ2YXIgY2dlbkFwcCA9IHJlcXVpcmUoJy4vYXBwL2NnZW4nKTtcblxuXG4vKk1BSU4gRU5UUlkgUE9JTlQgRk9SIFRIRSBBUFAqL1xuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuXHR2YXIgbWFpbkFwcCA9IG5ldyBjZ2VuQXBwKHtcblx0XHR0YXJnZXQ6ICd0aHJlZS1jYW52YXMnLFxuXHRcdHVzZXJJZDogJ29hdGgwMScsXG5cdFx0dXNlck5hbWU6ICdndXJiYW5vJ1xuXHR9KTtcblx0bWFpbkFwcFxuXHRcdC5oZWxsbygpXG5cdFx0LmluaXRIYXJkd2FyZSh7XG5cblx0XHR9KVxuXHRcdC5pbml0V29ybGQoe1xuXG5cdFx0fSlcblx0XHQuc3RhcnQoKTtcbn0pO1xuIl19
