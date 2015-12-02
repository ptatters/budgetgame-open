window.onload = function () { window.main = new MAIN(); };

/**
 * Main function of application 
 */
var MAIN = function () {
	/** @this self */
	var self = this;
	
	/**
	 * @public
	 * @member {Object} svg
	 * @member {Object} sankey 
	 */
	self.svg;
	self.sankey;
	self.screens;
	self.lastresize;
	
	/** @member {Object} on - event handler */
	var on = {};
	
	/** @constructor */
	function constructor () {
		
		// create different screens
		var sankey_screen = new _screen('sankey_screen').resize();
		var area_screen = new _screen('area_screen').resize();
		
		// create new sankey diagram
		self.sankey = new _sankey('#sankey_screen', sankey_data3);
		// create new area chart
		self.areachart = new AREA(area_screen, area_data);
		
		// add event listeners
		window.addEventListener('resize', winresize, false);
		window.addEventListener('orientationchange', function () {
			window.scrollTo(0,0); 
			winresize();
		}, false);
		
		self.on('resize', sankey_screen.resize)
			.on('resize', area_screen.resize)
			.on('resize', self.sankey.resize);
			
		return self;
	}
	
	function winresize () {
		
		var lastresize = Date.now();
		self.lastresize = lastresize;
		setTimeout(function () {
			if (lastresize == self.lastresize) {
				trigger('resize');
			}
		}, 200);
	}
	
	
	function trigger (ev) {
		if (!on[ev]) return self;
		var args = Array.prototype.slice.call(arguments, 1);
		for (var i = 0; i < on[ev].length; i++) {
			if(typeof on[ev][i] == 'function') {
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
	
	return constructor();
};

