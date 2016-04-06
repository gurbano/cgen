var BaseEntity = function (opts) {
	if (!(this instanceof BaseEntity)) return new BaseEntity(opts);	
	init.bind(this)(opts);
	function init (opts) {
		this.id = opts.id || randomUUID();
		this.name = opts.name;	
	}
	this.position = this.opts.position ||{
		x: this.opts.x || 0,
		y: this.opts.y || 0,
		z: this.opts.z || 0
	};
	
}
BaseEntity.prototype.getObject = function() {
	console.warn('getObject not implemented');
	return new THREE.Object3D();
};
BaseEntity.prototype.this.setPosition = function (x,y,z) {
	this.position.x = x;
	this.position.y = y;
	this.position.z = z;
}

var randomUUID = function () {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});
}
module.exports = BaseEntity;