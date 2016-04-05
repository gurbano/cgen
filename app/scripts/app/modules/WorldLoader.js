var WorldLoader = function(parent){
	this.parent = parent; //parent app
}
WorldLoader.prototype.init = function(center) {
	//TODO: LOAD WORLD
	return new World(this.parent);
};


var World = function (app) {
	this.id = 'world0';
	this.interceptor = {
		raycaster : new THREE.Raycaster(),
		mouse : new THREE.Vector2(),
		renderer : app.S.renderer,
		camera : app.S.camera,
	}	
	var root = new THREE.Object3D();
	this.map = {};
	this.getRoot = function () {
		return root;
	}
	this.add('axisHelper', new THREE.AxisHelper( 500 ) );	
	this.add('terrain',this.getTerrain());
	this.add('helper', getHelper());
	document.addEventListener( 'mousemove', onMouseMove.bind(this), false);
}
World.prototype.add = function(id, obj) {
	this.map[id] = obj;
	this.getRoot().add(obj);
};
World.prototype.get = function(name) {
	return this.map[name];
};

World.prototype.dig2 = function(inter) {
	var face = inter.face;
    var geo = this.geometry;

    //vertex 1
    var i1 = face.a *3;
    var v1 = {
    	x: geo.attributes.position.array[i1],
    	y: geo.attributes.position.array[i1+1],
    	z: geo.attributes.position.array[i1+2]
    }
    var i2 = face.b *3;
    var v2 = {
    	x: geo.attributes.position.array[i2],
    	y: geo.attributes.position.array[i2+1],
    	z: geo.attributes.position.array[i2+2]
    }
    var i3 = face.c *3;
    var v3 = {
    	x: geo.attributes.position.array[i3],
    	y: geo.attributes.position.array[i3+1],
    	z: geo.attributes.position.array[i3+2]
    }
    console.info(v1, v2, v3);
    geo.attributes.position.array[i1+1] += 1;
    geo.attributes.position.array[i2+1] += 1;
    geo.attributes.position.array[i3+1] += 1;

    
	
	//geo.attributes.position.array[face.a ] += 50;
	geo.verticesNeedUpdate = true;
	geo.normalsNeedUpdate = true;
	geo.elementsNeedUpdate = true;

	geo.computeVertexNormals();
	geo.computeFaceNormals();

};
World.prototype.dig = function(inter) {
	var face = inter.face;
    var geo = this.geometry;
	
    //vertex 1
    var v1 = geo.vertices[face.a];
    var v2 = geo.vertices[face.b];
    var v3 = geo.vertices[face.c];
    //console.info(v1, v2, v3);
    v1.y +=1;
    
    
	
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

var worldWidth = 1024;
var worldDepth = 1024;
World.prototype.getTerrainGeometry = function() {
	if (!this.geometry){
		var data = generateHeight( worldWidth, worldDepth );
		var geometry = new THREE.PlaneGeometry( 1000, 1000, worldWidth - 1, worldDepth - 1 );
		geometry.rotateX( - Math.PI / 2 );
		/*var vertices = geometry.attributes.position.array;	
		for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
			vertices[ j + 1 ] = 0//data[ i ] ;
		}
		*/
		geometry.computeFaceNormals();
		geometry.dynamic = true;
		this.geometry = geometry;
	}
	return this.geometry;
}

World.prototype.getTerrain = function() {
	var mesh = new THREE.Mesh( this.getTerrainGeometry(), new THREE.MeshBasicMaterial( { wireframe: true } ) );
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

module.exports = WorldLoader;