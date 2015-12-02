var sankey_big_text = function (node) {
	var self = this;
	sankey_text.call(self, node);

	return self;
};
sankey_big_text.prototype = Object.create(sankey_text.prototype);

sankey_big_text.prototype.constr = function () {

	this.direction = this.define_dir();
	this.padding = this.onode ? 10 : 5;
	
	this.define_text();
	return this;
};

sankey_big_text.prototype.define_dir = function () {
	return this.node.targets.length;
}

sankey_big_text.prototype.position = function (dx, dy, scale) {
	var self = this;
	
	var center = (self.node.svalue()*scale - self.box[3])/2;
	var x = self.node.pos.x * scale + dx;
	var y = self.node.pos.y * scale + dy + center + self.fontsize;
	x += self.direction ? self.node.width/2 : 0;
	
	self.pos.x = x;
	self.pos.y = y;
	return self.pos;
};

sankey_big_text.prototype.define_text = function () {
	var self = this;

	self.printed_text.title = self.text.split('\n');
	self.printed_text.amount = self.node.pvalue();
	
	var defid = self.link ? self.link.linktype+self.link.id : self.node.id;
	self.def_elem = self.defs.selectAll('#sdeftext'+defid).data([1]);
	self.def_elem.enter().append('text').attr({'class': 'stext sbigtext', 'id': 'sdeftext'+defid});
	
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
	var height = (title.length-.5)*self.fontsize + 4;
	
	self.box = [0,0,width+self.padding,height];

	return self;
};

sankey_big_text.prototype.add_title = function (target) {
	var self = this;

	var title = self.printed_text.title;
	var newline = title.length > 1 && title.slice(-1)[0] == '';
	var titlewidth = 0;

	var spans = target.selectAll('.stext_title').data(title);
	spans.enter().append('tspan').attr('class', 'stext_title');
	spans.exit().remove();
	spans.attr({
		'dy': function (d,i) { return i == 0 ? 0 : self.fontsize*1.1; },
		'x': 0
	})
	.text(function (d,i) { return title[i] + ((i == title.length-1 && !newline) ? ' ' : ''); })
	.each(function (d,i) { 
		if (i==0) d3.select(this).classed('shead', true);
		titlewidth = Math.max(titlewidth, this.getComputedTextLength()); 
	});

	return titlewidth;
};

sankey_big_text.prototype.add_amount = function (target) {
	var self = this;

	var amount = self.printed_text.amount;
	var title = self.printed_text.title;
	var newline = title.length > 1 && title.slice(-1)[0] == '';

	var amountwidth = 0;

	var spans = target.selectAll('.stext_amount').data([amount]);
	spans.enter().append('tspan').attr('class', 'stext_amount');
	spans.exit().remove();
	spans.attr({
		'dy': newline ? self.fontsize*1.1 : null,
		'x': newline ? 0 : null
	})
	.text(self.printed_text.amount)
	.each(function (d,i) { amountwidth = Math.max(amountwidth, this.getComputedTextLength()); });

	return amountwidth;
};

/**Draw defined text element */
sankey_big_text.prototype.draw = function (dx,dy, scale) {
	var self = this;
	
	self.position(dx,dy,scale);

	var underflow = self.node.underflow && self.node.underflow.value > 0;
	
	self.use_elem = self.elem.selectAll('#susetext'+self.node.id).data([1]);
	self.use_elem.enter().append('text').attr({
		'class': 'stext sedit', 
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