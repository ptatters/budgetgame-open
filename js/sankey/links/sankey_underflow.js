var sankey_underflow = function (value) {
	/** @this self */
	var self = this;
	sankey_input.call(self, {'value': value}, 'none');
	
	self.cssclass = 'sunderflow';
	self.rectcss = 'sunderflow_rect';
	self.name = '';
	self.color = 'none';
	this.nopath = true;
	
	return self;
};
sankey_underflow.prototype = Object.create(sankey_input.prototype);

// used as static attributes
sankey_underflow.prototype.linktype = 'underflow';

/** Draw svg path */
sankey_underflow.prototype.svg_path = function (source, target, dx,dy,scale) {
	return 'M0,0';
};
