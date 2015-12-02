var _screen = function (id) {
	/** @this self */
	var self = this;
	
	self.id = id;
	// assume body.width css rule is 100%
	self.height = window.innerHeight;
	self.width = d3.select('body').node().offsetWidth;
	
	self.screen = d3.select('body').append('div').attr({
		'id': id,
		'class': 'ui_screen'
	}).style({
		'width': self.width + 'px',
		'height': self.height + 'px'
	});
	
	var on = {};
	
	self.resize = function () {
		
		// assume body.width css rule is 100%
		self.height = window.innerHeight;
		self.width = d3.select('body').node().offsetWidth;
		
		self.screen.style({
			'width': self.width + 'px',
			'height': self.height + 'px'
		});
		
		trigger('resize');
		return self;
	};
	
	
	function trigger (ev) {
		if (!on[ev]) return self;
		var args = Array.prototype.slice.call(arguments, 1);
		for (var i = 0; i < on[ev].length; i++) {
			if (typeof on[ev][i] == 'function') {
				on[ev][i].apply(null, args);
			}
		}
		return self;
	}
	
	self.on = function (ev, callback) {
		if (!arguments.length) return self;
		on[ev] = on[ev] || [];
		on[ev].push(callback);
		return self;
	};
	
	
	return self;
};
