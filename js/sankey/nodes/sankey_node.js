var FONT_SIZE = 12;
var MIN_SPACE = FONT_SIZE;


var sankey_node = function (node, id, lvl) {
	/** @this self */
	var self = this;

	/**
	 * node meta
	 * @member {String} name
	 * @member {Int} id
	 * @member {Int} level
	 * @member {Int} onode
	 * @member {Boolean} editable
	 * @member {String} arrowed
	 * @member {Number} required
	 * @member {Int} olink
	 */
	self.name = node.name;
	self.id = id;
	self.level = lvl;
	self.onode = node.onode;
	self.inode = node.inode;
	self.startnode = node.startnode;
	self.editable = node.editable;
	self.arrowed = node.arrowed || false;
	self.required = node.required || 0;
	self.olink = node.olink;
	self.color = node.color;
	self.cap = node.cap;

	/**
	 * node value sources
	 * @member {Array} sources
	 * @member {Array} targets
	 * @member {Array} source_links
	 * @member {Array} inputs
	 * @member {Array} overflows
	 * @member {Array} underflows
	 */
	self.sources = [];
	self.targets = [];
	self.source_links = [];
	self.target_links = [];
	self.inputs = [];
	self.overflow;
	self.olink;
	self.underflow;

	/**
	 * node data for drawing
	 * @member {Object} pos
	 * @member text
	 * @member rects
	 */
	self.pos = {'x': 0, 'y': 0};
	self.text;

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

sankey_node.prototype.font_size = 12;
sankey_node.prototype.min_space = 6;
sankey_node.prototype.width = 30;
sankey_node.prototype.rect_elem = undefined;
sankey_node.prototype.link_elem = undefined;
sankey_node.prototype.trans_duration = 800;

/** Sum of source links */
sankey_node.prototype.source_value = function () {
	for (var i = 0, sum = 0; i < this.sources.length; i++) {
		sum += this.sources[i].value;
	}
	return sum;
};

/** Sum of target links */
sankey_node.prototype.target_value = function () {
	for (var i = 0, sum = 0; i < this.targets.length; i++) {
		sum += this.targets[i].value;
	}
	return sum;
};

/** Sum of input links */
sankey_node.prototype.input_value = function () {
	for (var i = 0, sum=0; i < this.inputs.length; i++) {
		sum += this.inputs[i].value;
	}
	return sum;
};

/** Overflow value */
sankey_node.prototype.overflow_value = function () {

	return this.target_value() - (this.source_value() + this.input_value());
};

/** Get total node value */
sankey_node.prototype.value = function () {

	// input and output values of node
	var input = (this.underflow && this.underflow.value || 0) + this.source_value() + this.input_value();
	var output = this.target_value();
	// total value of node
	return Math.max(input, output);
};

/** Get scaled node value */
sankey_node.prototype.svalue = function () {
	return this.value()*this.scale;
};

/** Printable version of node value */
sankey_node.prototype.pvalue = function () {
	return this.value().toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' M€';
};

/**
 * Position node on x and y axis
 * @param x
 * @param y
 */
sankey_node.prototype.position = function (x,y) {
	if (!arguments.length) return this.pos;
	this.pos.x = x;
	this.pos.y = y;
	return this;
};

/**
 * Evaluate values, overflows etc..
 */
sankey_node.prototype.eval = function (nodes) {

	// overflow value; amount of difference between input and output
	var overflow = this.overflow_value();
	if (!this.targets.length || this.target_value() == 0) overflow = 0;

	this.overflow = this.overflow || new sankey_overflow(Math.abs(overflow));
	this.overflow.value = Math.abs(overflow);
	this.overflow.name = overflow > 0 ? 'Alijäämä\n' : 'Ylijäämä\n';

	// Set source and target for overflow link
	if (overflow > 0) {
		this.overflow.source = this.olink;
		this.overflow.target = this.id;
		this.overflow.direction = false;
		if (this.olink !== undefined) {
			nodes[this.olink].targets = [this.overflow];
			// check for overflow in targets
			var key = nodes[this.olink].sources.indexOf(this.overflow);
			if (key > -1) nodes[this.olink].sources.splice(key,1);
		}
	} else {
		this.overflow.source = this.id;
		this.overflow.target = this.olink;
		this.overflow.direction = true;
		if (this.olink !== undefined) {
			nodes[this.olink].sources = [this.overflow];
			// check for overflow in sources
			var key = nodes[this.olink].targets.indexOf(this.overflow);
			if (key > -1) nodes[this.olink].targets.splice(key, 1);
		}
	}

	this.overflow.eval();
	for (var i = 0; i < this.inputs.length; i++) {
		this.inputs[i].eval();
	}

	// overflow value; amount of difference between input and output
	var underflow = Math.max(0, this.required - (this.source_value()+this.input_value()));
	this.underflow = this.underflow || new sankey_underflow(underflow);
	this.underflow.value = underflow;

	if (!this.name && this.text) {
		this.text.remove();
		this.text = undefined;
	} else if (this.name && !this.text) {
		// normal text
		this.text = new sankey_big_text(this);
	} else if (this.text) {
		this.text.update_text();
	}

	// set node space
	if (this.editable) this.min_space = 15;

	return this;
};

/**
 * Get value of sources before given source link
 * @param {Object} link
 */
sankey_node.prototype.source_linkoffset = function (link) {

	if (this.source_links && this.source_links.length) {
		for (var s = 0,yoff=0; s < this.source_links.length; s++) {
			if (this.source_links[s] == link) break;
			yoff += this.source_links[s].value;
		}
		return yoff;
	}
	else {
		var sources = this.sources.concat(this.inputs);
		for (var i = 0, sum=0; i < sources.length; i++) {
			if (link == sources[i]) break;
			sum += sources[i].value;
		}
		sum += this.underflow && this.underflow.value || 0;
		return sum;
	}
};

/**
 * Get value of targets before given target link
 * @param {Object} link
 */
sankey_node.prototype.target_linkoffset = function (link) {

	if (this.target_links && this.target_links.length) {
		for (var t = 0, yoff=0; t < this.target_links.length; t++) {
			if (this.target_links[t] == link) break;
			yoff += this.target_links[t].value;
		}
		return yoff;
	} else {
		for (var t = 0, sum=0; t < this.targets.length; t++) {
			if (link == this.targets[t]) break;
			sum += this.targets[t].value;
		}
		return sum;
	}
};

/**
 * Sort source links by target y positon and
 * define the order of the different types of sources
 * @param {Object} nodes
 */
sankey_node.prototype.sort_sources = function (nodes, otop) {
	var self = this;
	otop = otop || self.id == 8;

	// sort source links
	self.sources.sort(function (a,b) {
		return nodes[a.source].pos.y - nodes[b.source].pos.y;
	});

	// define order of sources, inpus, underflows and overflow
	for (var s = 0, top=[],bot=[],last=top,yoff=0; s < self.sources.length; s++) {
		var s2 = self.sources[s], source = nodes[s2.source];
		var sy = source.pos.y + source.target_linkoffset(s2)*source.scale;

		if (source.pos.y == undefined) last = last;
		else if (sy <= self.pos.y+yoff) last = top;
		else last = bot;
		last.push(s2);

		yoff += source.svalue();
	}

	var sources = self.underflow ? [self.underflow] : [];
	for (var t=0;t<top.length;t++) sources.push(top[t]);
	for (var i=0;i<self.inputs.length;i++) sources.push(self.inputs[i]);
	for (var b=0;b<bot.length;b++) sources.push(bot[b]);

	if (self.overflow && self.overflow_value() > 0) {
		sources.splice((otop ? 1 : sources.length),0,self.overflow);
	}

	self.source_links = sources;

	return self;
};

/**
 * Sort target links by target y positon and
 * define the order of the different types of targets
 * @param {Object} nodes
 */
sankey_node.prototype.sort_targets = function (nodes, otop) {
	var self = this;
	otop = otop || self.id == 8;

	// sort targets by source y position
	self.targets.sort(function (a,b) {
		return nodes[a.target].pos.y - nodes[b.target].pos.y;
	});


	var targets = [];
	for (var t=0;t<self.targets.length;t++) targets.push(self.targets[t]);

	if (self.overflow && self.overflow_value() < 0) {
		targets.splice((otop ? 0 : targets.length), 0, self.overflow);
	}
	self.target_links = targets;

	return self;
};

sankey_node.prototype.get_box = function (dx,dy,s) {
	var self = this;
	dx = dx || 0;
	dy = dy || 0;
	s = s || 1;

	var x1 = self.pos.x*s + dx,
		y1 = self.pos.y*s + dy,
		x2 = x1 + self.width,
		y2 = y1 + self.svalue();

	self.box = [x1,y1,x2,y2];

	if (self.text) {
		var textbox = self.text.coords(dx,dy,s);
		self.box = [
			Math.min(self.box[0], textbox[0]),
			Math.min(self.box[1], textbox[1]),
			Math.max(self.box[2], textbox[2]),
			Math.max(self.box[3], textbox[3]),
		];
	}

	return self.box;
};

sankey_node.prototype.remove = function () {

	if (this.text) this.text.remove();
	this.text = undefined;
	this.rect_elem.selectAll('#snode'+this.id).remove();
	this.icon_elem.selectAll('#sicon'+this.id).remove();
	this.overflow.remove();
	this.underflow.remove();

	return this;
};
sankey_node.prototype.draw = function (dx,dy, scale, nodes, icon_x) {
	var self = this;

	self.draw_rects(dx,dy,scale, nodes, icon_x)
		.draw_links(dx,dy,scale, nodes)
		.draw_icon(dx,dy,scale, icon_x)
		.draw_text(dx,dy,scale);

	return self;
};
sankey_node.prototype.draw_text = function (dx,dy, scale) {
	if (!this.name || !this.text) return this;

	this.text.draw(dx,dy, scale);
	return this;

};

/**
 * Draw paths for sources and overflow links
 * @param dx
 * @param dy
 * @param s
 * @param {Object} nodes
 */
sankey_node.prototype.draw_links = function (dx,dy,s, nodes) {
	var self = this;

	// total spacing between
	var offy = (((this.inputs.length || 1)-1) * MIN_SPACE)*-.5;

	var links = self.source_links;
	links.forEach(function (link) {

		link.draw(nodes, dx,dy,s, offy);
		link.on('click', function (id,type) { self.trigger('click', id, type); });
		if (link.linktype == 'input') offy += MIN_SPACE;
	});

	return this;
};

/**
 * Draw rectangles for all different values of
 * the nodes.
 * Underflows, sources, inputs & overflows.
 * @param dx
 * @param dy
 * @param scale
 * @param {Object} nodes
 */
sankey_node.prototype.draw_rects = function (dx,dy, scale, nodes) {

	var self = this,
		sources = self.source_links,
		x = self.pos.x * scale + dx,
		y = self.pos.y * scale + dy;

	// group container for rects
	var rectgroup = self.rect_elem.selectAll('#snode'+self.id).data([1]);
	rectgroup.enter().append('g').attr({'class': 'snode', 'id': 'snode'+self.id});

	// value rects
	var rects = rectgroup.selectAll('rect').data([1]);
	rects.enter().append('rect').attr({
		'x': x,
		'y': y,
		'width': self.width,
		'height': self.svalue()*scale
	});

	rects.attr({
		'class': 'snode_rect',
		'fill': self.color
	})
	.transition().delay(400).duration(this.trans_duration)
	.attr({
		'x': x,
		'y': y,
		'width': self.width,
		'height': self.svalue() * scale
	});

	return self;
};

/**
 * Draw icons
 * @member dx
 * @member dy
 * @member scale
 */
sankey_node.prototype.draw_icon = function (dx,dy,scale, icon_x) {
	if (!this.editable) return this;
	var self = this;

	var size = 28;
	var x = icon_x[1] - size/2;
	var y = (self.pos.y+self.value()*self.scale/2)*scale + dy-size/2;

	// HACK: Move icons to the left!
	x -= 25;

	if (self.id == 10) {
		// HACK: move "Yleinen julkishallinto" node icon down to be centered
		// to the 4 first branches.
		y += 32;

		// add bracket to "Yleinen julkishallinto" icon
		var bracket = self.icon_elem.selectAll('.qicon-bracket').data([1]);
		bracket.exit().remove();
		bracket.enter().append('image').attr({
			class : 'qicon-bracket',
			width : 12,
			height : 84,
			'xlink:href' : 'images/bracket_svg.svg',
			transform : 'translate('+(x - 16)+','+(y-28)+')'
		});

		bracket.transition().delay(400).duration(this.trans_duration).attr({
			transform : 'translate('+(x-16)+','+(y-28)+')'
		});
	}


	var icon = self.icon_elem.selectAll('#sicon'+self.id).data([1]);
	icon.enter().append('image').attr({
		'class': 'sicon',
		'id': 'sicon'+self.id,
		'width': size,
		'height': size,
		'xlink:href': 'res/icons/button_question.png',
		'transform': 'translate('+x+','+y+')'
	});

	// draw symbol
	icon.transition().delay(400).duration(this.trans_duration).attr({
		'transform': 'translate('+x+','+y+')'
	})
	.node().addEventListener('click', function () {
		icon.attr('xlink:href', 'res/icons/button_question_noshadow.png');
		self.trigger('click', self.id, 'node');
	});

	return self;
};
