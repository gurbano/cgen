var MaterialFactory = function(){

}
MaterialFactory.prototype.getTestMaterial = function() {
	return new THREE.MeshPhongMaterial({wireframe:true});
};

MaterialFactory.prototype.getCloudsMaterial = function(texture) {
	var material  = new THREE.MeshPhongMaterial({
	  map     : texture,
	  side        : THREE.DoubleSide,
	  opacity     : 0.4,
	  transparent : true,
	  depthWrite  : false,
	});
	return material;
};

module.exports = new MaterialFactory();