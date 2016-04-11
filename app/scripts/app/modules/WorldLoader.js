var ImprovedNoise = require('../dep/ImprovedNoise');
var PlanetFactory = require('./factories/PlanetFactory');
var helper = require('../helper');


var WorldLoader = function(parent){
	this.parent = parent; //parent app
}
WorldLoader.prototype.init = function(center) {
	//TODO: LOAD WORLD
	return new World(this.parent);
};


var World = function (app) {
	var root = new THREE.Object3D();
	this.getRoot = function () {
		return root;
	}

	this.id = 'world0';
	this.interceptor = { //intercept with the mouse
		raycaster : new THREE.Raycaster(),
		mouse : new THREE.Vector2(),
		renderer : app.S.renderer,
		camera : app.S.camera,
	}	
	this.raycaster = { //intercept with the player
		raycaster : new THREE.Raycaster(),
		start : new THREE.Vector2(),
		renderer : app.S.renderer,
		camera : app.S.camera,
	}	
	
	this.entities = {};	
	this.add('light', getLight());
	this.add('helper', getHelper());
	this.add('axisHelper', new THREE.AxisHelper( 5000 ) );	
	this.add('earth', getEarth());
	//this.add('rome', getCity(41.890251, 12.492373));


	document.addEventListener( 'mousemove', onMouseMove.bind(this), false);
}

World.prototype.add = function(id, obj) {
	this.entities[id] = obj;
	this.getRoot().add(obj);
};
World.prototype.get = function(name) {
	return this.entities[name];
};

World.prototype.setSunPosition = function(__date) {
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
	            tilt = helper.interpolate(dayOfTheYear + (date.getHours() / 24), limit[0], limit[1], angle[0], angle[1]);
	            console.info(seasons[i].id, d, dayOfTheYear, tilt.toFixed(0));
	            break;
	        }
	    };



	    var rev_degree = -(((__date / (1000 * 60 * 60)) + 6) % 24) * (360 / 24)
	    var tilt_deg = tilt;


	    this.get('light').position.set(Math.sin(rev_degree * Math.PI / 180) * 5000, tilt_deg, 5000 * Math.cos(rev_degree * Math.PI / 180));
	    this.get('light').lookAt(0, 0, 0);
	}
}
module.exports = WorldLoader;
var onMouseMove = function(event) {
	this.interceptor.mouse.x = ( event.clientX / this.interceptor.renderer.domElement.clientWidth ) * 2 - 1;
	this.interceptor.mouse.y = - ( event.clientY / this.interceptor.renderer.domElement.clientHeight ) * 2 + 1;
	this.interceptor.raycaster.setFromCamera( this.interceptor.mouse, this.interceptor.camera );
	// See if the ray from the camera into the world hits one of our meshes
	var intersects = this.interceptor.raycaster.intersectObject(  this.get('earth') );
	// Toggle rotation bool for meshes that we clicked
	if ( intersects.length > 0 ) {
		//console.info(intersects[0]);
		this.intersect = {x: intersects[0].point.x, y: intersects[0].point.y, z: intersects[0].point.z , obj: intersects[0]};
	}else{
		this.intersect = undefined;
	}
};

function getHelper () {
	var geometry = new THREE.CylinderGeometry( 0, 20, 100, 3 );
	geometry.translate( 0, 50, 0 );
	geometry.rotateX( Math.PI / 2 );
	return new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );
}
function getLight () {
	var light = new THREE.DirectionalLight(0xffffff, 1.0);
	light.position.set(5000, 0, 5000);
	return light;
}


World.prototype.getCity = function(lat,lng){
	var geometry = new THREE.SphereGeometry(100, 32, 32);

	var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial());
	

	var v3 = getCoords(lat,lng);
	mesh.position.set(v3.x,v3.y,v3.z);
	return mesh;
}



function getEarth () {
	return PlanetFactory.getEarth();
}


function getCoords (lat, lon) {
	var radius = 5000;
	var phi   = (90-lat)*(Math.PI/180);
	var theta = (lon+180)*(Math.PI/180);

	var x = -((radius) * Math.sin(phi)*Math.cos(theta));
	var z = ((radius) * Math.sin(phi)*Math.sin(theta));
	var y = ((radius) * Math.cos(phi));

	return new THREE.Vector3(x,y,z);
}







THREE.ShaderTypes = {
	'phongDiffuse' : {
		uniforms: {
			"uDirLightPos":	{ type: "v3", value: new THREE.Vector3() },
			"uDirLightColor": { type: "c", value: new THREE.Color( 0xffffff ) },
			"uMaterialColor":  { type: "c", value: new THREE.Color( 0xffffff ) },
			uKd: {
				type: "f",
				value: 0.7
			},
			uBorder: {
				type: "f",
				value: 0.4
			}
		},
		vertexShader: [
			"varying vec3 vNormal;",
			"varying vec3 vViewPosition;",
			"void main() {",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
				"vNormal = normalize( normalMatrix * normal );",
				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				"vViewPosition = -mvPosition.xyz;",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform vec3 uMaterialColor;",

			"uniform vec3 uDirLightPos;",
			"uniform vec3 uDirLightColor;",

			"uniform float uKd;",
			"uniform float uBorder;",

			"varying vec3 vNormal;",
			"varying vec3 vViewPosition;",

			"void main() {",

				// compute direction to light
				"vec4 lDirection = viewMatrix * vec4( uDirLightPos, 0.0 );",
				"vec3 lVector = normalize( lDirection.xyz );",

				// diffuse: N * L. Normal must be normalized, since it's interpolated.
				"vec3 normal = normalize( vNormal );",
				//was: "float diffuse = max( dot( normal, lVector ), 0.0);",
				// solution
				"float diffuse = dot( normal, lVector );",
				"if ( diffuse > 0.6 ) { diffuse = 1.0; }",
				"else if ( diffuse > -0.2 ) { diffuse = 0.7; }",
				"else { diffuse = 0.3; }",

				"gl_FragColor = vec4( uKd * uMaterialColor * uDirLightColor * diffuse, 1.0 );",

			"}"

		].join("\n")

	}

};