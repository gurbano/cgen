var WorldLoader = require('./modules/WorldLoader');
var UserStore = require('./modules/UserStore');


var keyMap =['left', 'right', 'up', 'down'];
var configuration = {
	VIEW_ANGLE : 45,
  	NEAR : 0.1,
  	FAR : 10000
}

var UP = THREE.Vector3( 1, 0, 0 );
var ZERO = THREE.Vector3( 0, 0, 0 );



var updateControlMap = function(delta, now){//UPDATE CONTROL MAP
	var self = this;
	keyMap.forEach(function (key) { //update keyboard
		self.S.keys[key] = self.keyboard.pressed(key);
	});	
	//TODO: update mouse

};
var updatePlayer = function(delta, now){
	var self = this;		
	if ( this.PG.entity){this.PG.entity.update(this.S.keys);}
};
var updateInterception = function(delta, now){
	var self = this;		
	if ( this.world && this.world.intersect ){
		//console.info(this.world.intersect);
		var helper = this.world.get('axisHelper');
		helper.position.x = this.world.intersect.x;
		helper.position.y = this.world.intersect.y;
		helper.position.z = this.world.intersect.z;
		this.world.dig(this.world.intersect.obj);
	}
};
var updateCamera = function(delta, now){
	var self = this;		
	//console.info(this.S.controls.getObject().position);
	if (this.S.camera && this.PG.entity)
	{	
		this.S.camera.position.x = this.PG.entity.position.x;
		this.S.camera.position.y = this.PG.entity.position.y;
		this.S.camera.position.z = this.PG.entity.position.z;
		this.S.camera.lookAt(this.world.get('helper').position);
	}
};


var CgenApp = function (opts) {
	var self = this;
	this.targetId = opts.target; //$three canvas
	this.target =$('#'+opts.target); //$three canvas
	//PG RELATED STUFF
	this.PG = {};
	this.PG.store = new UserStore(opts.userId);
	this.PG.entity = this.PG.store.get();

	


	//UPDATERS
	this.updateFcts = [];		
	this.updateFcts.push(updateControlMap);
	this.updateFcts.push(updatePlayer);
	this.updateFcts.push(updateCamera);
	this.updateFcts.push(updateInterception);


	//Three related stuff
	this.S = {}; 
	this.S.keys = {};
	this.S.scene = undefined;
	this.S.renderer = undefined;
	
  	//controls.addEventListener( 'change', render );
	

}
CgenApp.prototype.hello = function(name) {
	console.info("Hello " + this.PG.entity.userName);
	return this;
};
CgenApp.prototype.initHardware = function (opts) {	
	var self = this;
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

	//INIT CONTROLS
	/*var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
	if ( havePointerLock ) {
		this.S.controls =  new THREE.PointerLockControls( this.S.camera );		
		//this.S.scene.add(this.S.controls.getObject());
		this.plContext = new PlContext(this.S.controls);
		this.target.click(function () {
			self.plContext.start();
		});		
	}*/



	
	this.S.scene.add(this.S.camera);

	this.S.renderer = new THREE.WebGLRenderer();
	this.S.renderer.setSize(configuration.WIDTH, configuration.HEIGHT);
	this.target.append(this.S.renderer.domElement);
	return this;
}
CgenApp.prototype.initWorld = function(opts) {
	//WORLD	
	this.world = new WorldLoader(this).init();
	this.S.scene.add( this.world.getRoot());	
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
				controls.enabled = false;
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

