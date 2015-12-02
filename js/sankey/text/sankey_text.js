var FONT_SIZE = 12;

var sankey_text = function (node) {
	/** @this self */
	var self = this;

	/**
	 * Node data
	 * @member node
	 * @member text
	 * @member id
	 * @member direction
	 */
	self.node = node;
	self.text = node.name;
	self.value = typeof node.value == 'function' ? node.value() : node.value;

	/**
	 * Render attributes
	 * @member fontsize
	 * @member padding
	 * @member pos
	 * @member box
	 * @member def_elem
	 * @member use_elem
	 */
	self.fontsize = 12;
	self.padding = 5;
	self.pos = {'x': 0, 'y': 0};
	self.box = [0,0,0,0];
	self.direction = node.direction;
	self.def_elem;
	self.use_elem;

	self.printed_text = {'title': [], 'amount': ''};

	self.constr();
	return self;
};

// used as static members
sankey_text.prototype.defs = undefined;
sankey_text.prototype.elem = undefined;
sankey_text.prototype.trans_duration = 800;

/**
 * Pre-define text
 * @constructor
 */
sankey_text.prototype.constr = function () {

	this.direction = this.define_dir();
	this.padding = this.onode ? 10 : 5;

	this.define_text();
	return this;
};

sankey_text.prototype.text_anchor = function () {
	return this.direction ? 'start' : 'end';
}

/** Define text element for later use */
sankey_text.prototype.define_text = function () {
	var self = this;

	self.printed_text.title = self.text.split('\n');
	self.printed_text.amount = self.node.pvalue();

	var defid = self.link ? self.link.linktype+self.link.id : self.node.id;
	self.def_elem = self.defs.selectAll('#sdeftext'+defid).data([1]);
	self.def_elem.enter().append('text').attr({'class': 'stext', 'id': 'sdeftext'+defid});

	// create def element for later use.
	self.def_elem.attr({
		'font-size': self.fontsize+'px',
		'text-anchor': self.text_anchor()
	});

	var title = self.printed_text.title;
	var newline = title.length > 1 && title.slice(-1)[0] == '';

	var titlewidth = self.add_title(self.def_elem);
	var amountwidth = self.add_amount(self.def_elem);

	var width = (newline ? Math.max(amountwidth, titlewidth) : titlewidth + amountwidth) + 4;
	var height = title.length*self.fontsize + 4;

	self.box = [0,0,width+self.padding,height];

	return self;
};

sankey_text.prototype.add_title = function (target) {
	var self = this;

	var title = self.printed_text.title;
	var newline = title.length > 1 && title.slice(-1)[0] == '';
	var titlewidth = 0;

	var spans = target.selectAll('.stext_title').data(title);
	spans.enter().append('tspan').attr('class', 'stext_title');
	spans.exit().remove();
	spans.attr({
		'dy': function (d,i) { return i == 0 ? 0 : self.fontsize; },
		'x': 0
	})
	.text(function (d,i) { return title[i] + ((i == title.length-1 && !newline) ? ' ' : ''); })
	.each(function (d,i) { titlewidth = Math.max(titlewidth, this.getComputedTextLength()); });


	return titlewidth;
};

sankey_text.prototype.add_amount = function (target) {
	var self = this;

	var amount = self.printed_text.amount;
	var title = self.printed_text.title;
	var newline = title.length > 1 && title.slice(-1)[0] == '';

	var amountwidth = 0;

	var spans = target.selectAll('.stext_amount').data([amount]);
	spans.enter().append('tspan').attr('class', 'stext_amount');
	spans.exit().remove();
	spans.attr({
		'dy': newline ? self.fontsize : null,
		'x': newline ? 0 : null
	})
	.text(self.printed_text.amount)
	.each(function (d,i) { amountwidth = Math.max(amountwidth, this.getComputedTextLength()); });

	return amountwidth;
};

sankey_text.prototype.update_text = function () {
	var self = this;

	var obj = this.link || this.node;

	var direction = this.define_dir();
	if (direction != this.direction) {

		this.direction = direction;
		this.define_text()
		this.use_elem && this.use_elem.attr('text-anchor', this.text_anchor());
	}

	// update text
	if (this.printed_text.title.join('\n') != obj.name) {

		self.text = obj.name;
		self.printed_text.title = self.text.split('\n');
		self.add_title(self.def_elem);
		self.add_title(self.use_elem);
	}

	// update value
	if (this.printed_text.amount != obj.pvalue()) {

		self.printed_text.amount = self.node.pvalue();
		self.add_amount(self.def_elem);
		self.add_amount(self.use_elem);
	}

	return self;
};

sankey_text.prototype.define_dir = function () {

	var direction = !this.node.targets.length && this.node.id != 9 || this.node.id == 7;
	return direction;
};

/**Draw defined text element */
sankey_text.prototype.draw = function (dx,dy, scale) {
	var self = this;

	self.position(dx,dy,scale);

	var underflow = self.node.underflow && self.node.underflow.value > 0;

	var editable = self.node.editable && self.node.id != 10;

	self.use_elem = self.elem.selectAll('#susetext'+self.node.id).data([1]);
	self.use_elem.enter().append('text').attr({
		'class': 'stext' + (editable ? ' sedit' : ''),
		'id': 'susetext'+self.node.id,
		'transform': 'translate('+self.pos.x+','+self.pos.y+')',
		'font-size': self.fontsize+'px',
		'text-anchor': self.text_anchor()
		//'xlink:href': '#sdeftext'+self.node.id
	})
	.classed('.suf', underflow)
	.each(function (d,i) {

		self.add_title(d3.select(this));
		self.add_amount(d3.select(this));
	});

	self.use_elem
		.classed('suf', underflow)
		//.attr('xlink:href', '#sdeftext'+self.node.id)
		.transition().delay(400).duration(this.trans_duration)
		.attr('transform', 'translate('+self.pos.x+','+self.pos.y+')');

	return self;
};

sankey_text.prototype.remove = function () {
	var self = this;

	var defid = self.link ? self.link.linktype+self.link.id : self.node.id;
	self.defs.selectAll('#sdeftext'+defid).remove();
	self.elem.selectAll('#susetext'+self.node.id).remove();

	return self;
};

/** Define text position */
sankey_text.prototype.position = function (dx, dy, scale) {
	var self = this;

	var center = (self.node.svalue()*scale - self.box[3])/2;
	var x = self.node.pos.x * scale + dx;
	var y = self.node.pos.y * scale + dy + center + self.fontsize;
	x += self.direction ? self.node.width + self.padding : self.padding*-1;

	if (self.node.inode) y = self.node.pos.y * scale + dy + self.fontsize*.8;

	self.pos.x = x;
	self.pos.y = y;
	return self.pos;
};

sankey_text.prototype.coords = function (dx,dy,s) {
	var self = this;
	dx = dx || 0;
	dy = dy || 0;
	s = s || 1;

	var node = self.node,
		x1 = node.pos.x*s + dx,
		y1 = node.pos.y*s + dy,
		x2 = x1 + node.width,
		y2 = y1 + node.svalue();

	if (self.direction) x2 += self.box[2];
	else x1 -= self.box[2];

	var tbo = self.node.svalue()*s - self.box[3];
	if (tbo < 0) {
		y1 -= tbo/2;
		y2 += tbo/2;
	}

	return [x1,y1,x2,y2];
};