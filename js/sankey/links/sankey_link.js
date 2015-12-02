var sankey_link = function (link, color, id) {
	/** @this self */
	var self = this;
	
	/**
	 * link data
	 * @member id
	 * @member source
	 * @member target
	 * @member value
	 * @member straight
	 * @member color
	 * @member pathcolor
	 * @member name
	 * @member editable
	 */
	self.id = ++sankey_link.prototype.lid;
	self.source = link.source;
	self.target = link.target;
	self.value = link.value || 0;
	self.straight = link.straight || false;
	self.color = link.color || color || 'grey';
	self.pathcolor = link.pathcolor;
	self.name = link.name || '';
	self.editable = link.editable;

	self.gradient = link.gradient;
	self.grads = undefined;
	
	/** 
	 * link drawing data
	 * @member {String} curvatire
	 * @member elem
	 * @member icon
	 */
	self.curvature = .5;
	this.editable = link.editable;
	self.elem;
	self.icon;
	self.text;
	
	// Event handler
	var on = [];
	self.trigger = function (ev) {
		if (typeof on[ev] !== 'function') return;
		on[ev].apply(null, Array.prototype.slice.call(arguments,1));
		return self;
	};
	self.on = function (ev, callback) {
		if (typeof callback !== 'function') return self;
		on[ev] = callback;
		return self;
	};
	
	return self;
};
// Used as static attributes
sankey_link.prototype.scale = 1;
sankey_link.prototype.linktype = 'link';
sankey_link.prototype.link_elem;
sankey_link.prototype.icon_elem;
sankey_link.prototype.lid = 0;
sankey_link.prototype.trans_duration = 800;


/** Get scaled value of link */
sankey_link.prototype.svalue = function () {
	return this.value * this.scale;
};

/** Printable version of link value */
sankey_link.prototype.pvalue = function () {
	return this.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' M€';
};

sankey_link.prototype.eval = function () {

	if (!this.name && this.text) {
		this.text.remove();
		this.text = undefined;
	} else if (this.name && !this.text) {
		this.text = new sankey_link_text(this);
	} else if (this.text) {
		this.text.update_text();
	}

	// create gradients / store in def and access through url(#..) in css
	if (this.gradient) {

		self.grads = this.defs.selectAll('#link-gradient'+this.id).data([this.id])
		// create gradient object
		self.grads.enter()
			.append('linearGradient')
			.attr('id', 'link-gradient'+this.id)
			.attr('gradientUnits', 'objectBoundingBox');
		// create start colour
		self.grads.html("")
			.append('stop')
			.attr('offset', '0%')
			.attr('stop-color', this.gradient[0]);
		// create end colour
		self.grads.append('stop')
			.attr('offset', '100%')
			.attr('stop-color', this.gradient[1]);
	} else {
		// remove any unecessary def gradient elements
		this.defs.selectAll('#link-gradient'+this.id).data([this]).remove();
	}


	return this;
};

sankey_link.prototype.remove = function () {
	
	if (this.text) this.text.remove();
	this.text = undefined;
	this.link_elem.selectAll('#spath'+this.linktype+this.id).remove();
	this.icon_elem.selectAll('#sicon'+this.linktype+this.id).remove();
	
	return this;
};

/** 
 * Draw svg path and icon for link
 * @param nodes
 * @param {Number} dx
 * @param {Number} dy
 * @param {Number} scale 
 */
sankey_link.prototype.draw = function (nodes, dx,dy,scale, offy) {
	var self = this;
	
	var source = nodes[self.source], target = nodes[self.target];
	
	self.draw_path(nodes, dx,dy,scale, offy)
		.draw_icon(source, target, dx,dy,scale)
		.draw_text(dx,dy,scale, nodes, offy);
	
	return self;
};

sankey_link.prototype.draw_path = function (nodes, dx, dy, scale, offy) {
	if (this.nopath) return this;
	var self = this;

	var dvalue = self.svalue()*scale;
	var width = dvalue <= 0 ? 0 : Math.max(1, dvalue);
	
	var color = self.gradient ? 'url(#link-gradient'+self.id+')' : self.pathcolor || self.color;
	var source = nodes[self.source], target = nodes[self.target];
	
	var path = self.link_elem.selectAll('#spath'+self.linktype+self.id).data([1]);
	path.enter().append('path').attr({'class': 'spath '+self.linktype, 'id': 'spath'+self.linktype+self.id});
	path.attr({
		'stroke': color,
	}).transition().delay(400).duration(this.trans_duration).attr({
		'd': self.svg_path(source, target, dx,dy,scale,nodes, offy),
		'stroke-width': width
	});
	
	return self;
};

sankey_link.prototype.draw_text = function (dx,dy,scale, nodes) {
	if (!this.name) return this;
	var self = this;
	
	self.text.draw(dx,dy,scale, nodes);
	
	return self;
};

/**
 * Draw icon
 * @param source
 * @param target
 * @param dx
 * @param dy
 * @param s 
 */
sankey_link.prototype.draw_icon = function (source, target, dx,dy,s) {
	var self = this;
	if (!self.editable) return self;
	
	var size = 28;
	var x1 = source.pos.x*s+dx + source.width,
		y1 = source.pos.y*s+dy + (source.target_linkoffset(self)+self.value/2)*source.scale*s,
		x2 = target.pos.x*s+dx,
		y2 = target.pos.y*s+dy + (target.source_linkoffset(self)+self.value/2)*target.scale*s;
	
	var xm1 = x1 + (x2-x1)/2 - size/2;
	var ym1 = y1 + (y2-y1)/2 - size/2;

	
	if (self.text) {

		//xm1 = (self.text.pos.x  + (self.direction ? self.text.box[2] : -(self.text.box[2]+30))) * s + dx;
		ym1 = (self.text.pos.y + self.text.box[3]/2) * s + dy + 10;
	}
	
	
	var icon = self.icon_elem.selectAll('#sicon'+self.linktype+self.id).data([1]);
	icon.enter().append('image').attr({
		'class': 'sicon '+self.linktype, 
		'id': 'sicon'+self.linktype+self.id,
		'width': size,
		'height': size,
		'xlink:href': 'res/icons/button_question.png',
		'transform': 'translate('+xm1+','+ym1+')'
	});
	
	icon.transition().delay(400).duration(this.trans_duration).attr({
		'transform': 'translate('+xm1+','+ym1+')'
	})
	.node().addEventListener('click', function () { 
		icon.attr('xlink:href', 'res/icons/button_question_noshadow.png');
		self.trigger('click', source.id, 'link'); 
	});
	
	return self;
};

/** 
 * Create curveta svg path coordianates 
 * @param source
 * @param target
 * @param dy
 * @param scale
 */
sankey_link.prototype.svg_path = function (source,target, dx,dy,scale) {
	var self = this;
	
	var value = self.svalue();
	
	var source_y = source.pos.y + source.target_linkoffset(this)*source.scale;
	var target_y = target.pos.y + target.source_linkoffset(this)*target.scale;
	
	var x0 = source.pos.x * scale + source.width + dx,
		x1 = target.pos.x * scale + dx,
		xi = d3.interpolateNumber(x0, x1),
		x2 = xi(this.curvature),
		x3 = xi(1 - this.curvature),
		// y-axis
		y0 = (source_y + value/2) * scale + dy,
		y1 = (target_y + value/2) * scale + dy;
		
	var d = "M" + x0 + "," + y0
            + "C" + x2 + "," + y0
            + " " + x3 + "," + y1
            + " " + x1 + "," + y1;
     return d;
};




