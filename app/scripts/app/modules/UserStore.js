var _position = {
		x:0, 
		y:2000, 
		z:2000
};

var UserStore = function(userId){
	this.userId = userId;
}

UserStore.prototype.get = function() {
	return {
		position: _position,
		userId: this.userId,
		userName: 'gurbano',
		update: function (controls) {
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