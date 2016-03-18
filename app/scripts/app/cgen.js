var keyMap =['left', 'right', 'up', 'down'];
var configuration = {
	VIEW_ANGLE : 45,
  	NEAR : 0.1,
  	FAR : 10000
}

var CgenApp = function (opts) {
	var self = this;
	this.target =$(opts.target);
	this.updateFcts = [];	
	var updateControls = function(delta, now){
		var self = this;
		keyMap.forEach(function (key) {
			self.S.keys[key] = self.keyboard.pressed(key);
		});	
		//console.debug(self.S.keys);
	};
	this.updateFcts.push(updateControls);
	this.S = {};
	this.S.keys = {};
	this.S.scene = undefined;
	this.S.renderer = undefined;

}
CgenApp.prototype.hello = function(name) {
	console.info("Hello master");
	return this;
};
CgenApp.prototype.initHardware = function (opts) {	
	configuration.WIDTH = this.target.width();
	configuration.HEIGHT = this.target.height();
	configuration.ASPECT = configuration.WIDTH / configuration.HEIGHT ;
	
	console.info("Application initialized", configuration.WIDTH, configuration.HEIGHT);
	this.keyboard = new THREEx.KeyboardState();
	this.S.scene = new THREE.Scene();
	this.S.camera = new THREE.PerspectiveCamera(
								    configuration.VIEW_ANGLE,
								    configuration.ASPECT,
								    configuration.NEAR,
								    configuration.FAR);
	this.S.camera.position.z = 300;
	this.S.scene.add(this.S.camera);
	this.S.renderer = new THREE.WebGLRenderer();
	this.S.renderer.setSize(configuration.WIDTH, configuration.HEIGHT);
	this.target.append(this.S.renderer.domElement);
	return this;
}
CgenApp.prototype.initWorld = function(opts) {
	var radius = 50,
	    segments = 16,
	    rings = 16;
	var sphereMaterial = new THREE.MeshLambertMaterial(
		{
		    color: 0xCC0000
		});
	var sphere = new THREE.Mesh(
		new THREE.SphereGeometry(
	    	radius,
	    	segments,
	    	rings),
		sphereMaterial);

	// add the sphere to the scene
	this.S.scene.add(sphere);

	var pointLight =
	  new THREE.PointLight(0xFFFFFF);

	// set its position
	pointLight.position.x = 10;
	pointLight.position.y = 50;
	pointLight.position.z = 130;

	// add to the scene
	this.S.scene.add(pointLight);


	return this;
};
CgenApp.prototype.start = function () {
	console.info("Application started");
	this.loop();
	return this;
};

CgenApp.prototype.queryControls = function(key){
	return this.S.keys[key];
};
CgenApp.prototype.loop = function() {
	var self = this;
	var lastTimeMsec= null
	function animate(nowMsec){
		//nowMsec = nowMsec.toFixed(0);
		//console.info('looping ' + nowMsec);		
		requestAnimationFrame( animate.bind(self) );
		// measure time
		lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
		var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
		lastTimeMsec	= nowMsec
		// call each update function
		self.updateFcts.forEach(function(updateFn){
			updateFn.bind(self)(deltaMsec/1000, nowMsec/1000)
		});
		this.S.renderer.render(this.S.scene, this.S.camera);
	}
	requestAnimationFrame(animate.bind(self));
};
module.exports = CgenApp;

