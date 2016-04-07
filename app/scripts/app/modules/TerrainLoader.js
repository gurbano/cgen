var ImprovedNoise = require('../dep/ImprovedNoise');



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
	var light = new THREE.DirectionalLight(0xffffff, 1.0);
	light.position.set(3200, 39000, 70000);
	this.add('light', light);
	this.add('axisHelper', new THREE.AxisHelper( 500 ) );	
	this.add('terrain',this.getTerrain());
	this.add('helper', getHelper());




	document.addEventListener( 'mousemove', onMouseMove.bind(this), false);
}


var FAR = 100000000;
World.prototype.getHeight = function(x,z) {
	this.raycaster.raycaster = new THREE.Raycaster(
									new THREE.Vector3( x, FAR, z ),//origin
									new THREE.Vector3( 0, -1, 0 ),
									);
	var intersects = this.raycaster.raycaster.intersectObject(  this.get('terrain') );
	if ( intersects.length > 0 ) {
		return intersects[0].point.y;
	}else{
		return undefined;
	}
};

World.prototype.add = function(id, obj) {
	this.entities[id] = obj;
	this.getRoot().add(obj);
};
World.prototype.get = function(name) {
	return this.entities[name];
};

World.prototype.dig = function(inter) {
	var face = inter.face;
    var geo = this.geometry;
	
    //vertex 1
    var v1 = geo.vertices[face.a];
    var v2 = geo.vertices[face.b];
    var v3 = geo.vertices[face.c];
    //console.info(v1, v2, v3);
    v1.y +=100;
    
    
	
	//geo.attributes.position.array[face.a ] += 50;
	geo.verticesNeedUpdate = true;
	geo.normalsNeedUpdate = true;
	geo.elementsNeedUpdate = true;

	geo.computeVertexNormals();
	geo.computeFaceNormals();

};




var onMouseMove = function(event) {
	this.interceptor.mouse.x = ( event.clientX / this.interceptor.renderer.domElement.clientWidth ) * 2 - 1;
	this.interceptor.mouse.y = - ( event.clientY / this.interceptor.renderer.domElement.clientHeight ) * 2 + 1;
	this.interceptor.raycaster.setFromCamera( this.interceptor.mouse, this.interceptor.camera );
	// See if the ray from the camera into the world hits one of our meshes
	var intersects = this.interceptor.raycaster.intersectObject(  this.get('terrain') );
	// Toggle rotation bool for meshes that we clicked
	if ( intersects.length > 0 ) {
		//console.info(intersects[0]);
		this.intersect = {x: intersects[0].point.x, y: intersects[0].point.y, z: intersects[0].point.z , obj: intersects[0]};
	}else{
		this.intersect = undefined;
	}


};

var worldWidth = 256;
var worldDepth = 256;
World.prototype.getTerrainGeometry = function(data) {
	if (!this.geometry){		
		var geometry = new THREE.PlaneGeometry( 256000, 256000, worldWidth - 1, worldDepth - 1 );
		geometry.rotateX( - Math.PI / 2 );
		var vertices = geometry.attributes ? geometry.attributes.position.array : geometry.vertices;	
		if (geometry.attributes ){ //NOT THIS ONE
			for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
				vertices[ j + 1 ] = data[ i ] ;
			}
		}else{//THIS ONE
			for (var i = 0; i < vertices.length; i++) {
				vertices[i].y=(data[i]*160) -10000 ;
			};
		}
		/**/		
		geometry.computeFaceNormals();
		geometry.dynamic = true;
		this.geometry = geometry;
	}
	return this.geometry;
}



function createShaderMaterial(id, light) {
	var shader = THREE.ShaderTypes[id];
	var u = THREE.UniformsUtils.clone(shader.uniforms);
	var vs = shader.vertexShader;
	var fs = shader.fragmentShader;
	var material = new THREE.ShaderMaterial({ uniforms: u, vertexShader: vs, fragmentShader: fs });
	material.uniforms.uDirLightPos.value = light.position;
	material.uniforms.uDirLightColor.value = light.color;
	return material;
}
World.prototype.getTerrainMaterial = function(data) {
	// MATERIALS
	var materialColor = new THREE.Color();
	materialColor.setRGB(1.0, 0.8, 0.6);
	var phongMaterial = createShaderMaterial("phongDiffuse", this.get('light'));
	phongMaterial.uniforms.uMaterialColor.value.copy(materialColor);
	phongMaterial.side = THREE.DoubleSide;

	return phongMaterial;
}

World.prototype.getTerrain = function() {
	var data = generateHeight( worldWidth, worldDepth );
	var mesh = new THREE.Mesh( this.getTerrainGeometry(data), this.getTerrainMaterial(data));
	this.terrainData = data;
	return mesh;
};

World.prototype.updateTerrain = function(data) {
	this.geometry.verticesNeedUpdate = true;
};

function getHelper () {
	var geometry = new THREE.CylinderGeometry( 0, 20, 100, 3 );
	geometry.translate( 0, 50, 0 );
	geometry.rotateX( Math.PI / 2 );
	return new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );
}


function generateHeight( width, height ) {
	var size = width * height, data = new Uint8Array( size ),
	perlin = new ImprovedNoise(), quality = 1, z = Math.random() * 100;
	for ( var j = 0; j < 4; j ++ ) {
		for ( var i = 0; i < size; i ++ ) {
			var x = i % width, y = ~~ ( i / width );
			data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );
		}
		quality *= 5;
	}
	return data;
}
function generateTexture( data, width, height ) {
	var canvas, canvasScaled, context, image, imageData,
	level, diff, vector3, sun, shade;
	vector3 = new THREE.Vector3( 0, 0, 0 );
	sun = new THREE.Vector3( 1, 1, 1 );
	sun.normalize();
	canvas = document.createElement( 'canvas' );
	canvas.width = width;
	canvas.height = height;
	context = canvas.getContext( '2d' );
	context.fillStyle = '#000';
	context.fillRect( 0, 0, width, height );
	image = context.getImageData( 0, 0, canvas.width, canvas.height );
	imageData = image.data;
	for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {
		vector3.x = data[ j - 2 ] - data[ j + 2 ];
		vector3.y = 2;
		vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
		vector3.normalize();
		shade = vector3.dot( sun );
		imageData[ i ] = ( 128 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
		imageData[ i + 1 ] = ( 45 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
		imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
	}
	context.putImageData( image, 0, 0 );
	// Scaled 4x
	canvasScaled = document.createElement( 'canvas' );
	canvasScaled.width = width * 4;
	canvasScaled.height = height * 4;
	context = canvasScaled.getContext( '2d' );
	context.scale( 4, 4 );
	context.drawImage( canvas, 0, 0 );
	image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
	imageData = image.data;
	for ( var i = 0, l = imageData.length; i < l; i += 4 ) {
		var v = ~~ ( Math.random() * 5 );
		imageData[ i ] += v;
		imageData[ i + 1 ] += v;
		imageData[ i + 2 ] += v;
	}
	context.putImageData( image, 0, 0 );
	return canvasScaled;
}

module.exports = WorldLoader;















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