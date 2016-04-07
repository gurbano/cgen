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
}

var PlanetFactory = function(){
		
};


PlanetFactory.prototype.getPlanetGeometry = function(conf) {
	return new THREE.SphereGeometry(conf.RADIUS, 32, 32);
};
PlanetFactory.prototype.getPlanetMaterial = function(conf, quality) {
	var material = new THREE.MeshPhongMaterial();
	material.map    = THREE.ImageUtils.loadTexture(conf.BASE_FOLDER + (quality || '1k')  + '/texture.jpg');
	material.bumpMap = THREE.ImageUtils.loadTexture(conf.BASE_FOLDER + (quality || '1k')  + '/bump.jpg');
	material.bumpScale = conf.BUMP_SCALE;

	material.specularMap  = THREE.ImageUtils.loadTexture(conf.BASE_FOLDER + (quality || '1k')  + '/specular.jpg');
	material.specular  = new THREE.Color('grey')
	return material;
};
PlanetFactory.prototype.getPlanetMesh = function(geometry, material) {
	var mainMesh =  new THREE.Mesh(geometry, material);
	return mainMesh;
};
PlanetFactory.prototype.getEarth = function() {
	return this.getPlanet('EARTH');
};
PlanetFactory.prototype.getPlanet = function(name) {
	var geometry = this.getPlanetGeometry(conf[name]);
	var material = this.getPlanetMaterial(conf[name], "4k");
	var planetMesh = this.getPlanetMesh(geometry, material);
	planetMesh.castShadow = true;
    planetMesh.receiveShadow = true;
	if (conf[name].CLOUDS){
		var cloudsGeometry = new THREE.SphereGeometry(conf[name].RADIUS + 180, 32, 32);
		var cloudsMaterial = MaterialFactory.getCloudsMaterial(THREE.ImageUtils.loadTexture(conf[name].BASE_FOLDER + 'clouds/clouds_t.jpg'));
		planetMesh.cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
		planetMesh.add(planetMesh.cloudsMesh);}
		//planetMesh.cloudsMesh.castShadow = true;
        //planetMesh.cloudsMesh.receiveShadow = true;

	return planetMesh;
};

module.exports = new PlanetFactory();