var _position = {
		x:5000, 
		y:5000, 
		z:5000
};

var UserStore = function(userId){
	this.userId = userId;
}

UserStore.prototype.get = function() {
	return {
		position: _position,
		userId: this.userId,
		userName: 'gurbano',
		update: function (controls, delta, now) {
			//console.info(controls);
		}

	}; //load from DB // network
};

UserStore.prototype.set = function(data) {
	_position.x = data.position.x;
	_position.y = data.position.y;
	_position.z = data.position.z;
};


module.exports = UserStore;


