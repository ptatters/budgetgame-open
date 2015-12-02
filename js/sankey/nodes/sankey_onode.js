var sankey_onode = function (node, id, lvl) {
	var self = this;
	sankey_node.call(self, node, id, lvl);

	return self;
};
sankey_onode.prototype = Object.create(sankey_node.prototype);

sankey_onode.prototype.eval = function (nodes) {
	var self = this;

	if (!this.name && this.text) {
		this.text.remove();
		this.text = undefined;
	} else if (this.name && !this.text) {
		// normal text
		this.text = new sankey_text(this);
		self.text.padding *= 2;
	} else if (this.text) {
		this.text.update_text();
	}

	// set node space
	if (this.editable) this.min_space = 30;
	return self;
};

sankey_node.prototype.remove = function () {

	if (this.text) this.text.remove();
	this.text = undefined;
	this.rect_elem.selectAll('#snode'+this.id).remove();
	this.icon_elem.selectAll('#sicon'+this.id).remove();
	this.icon_elem.selectAll('#sline'+this.id).remove();

	return this;
};
sankey_onode.prototype.draw = function (dx,dy, scale, nodes, icon_x) {
	var self = this;

	self.draw_rects( dx,dy,scale, nodes, icon_x)
		.draw_line(dx,dy,scale)
		.draw_links(dx,dy,scale, nodes)
		.draw_icon(dx,dy,scale)
		.draw_text(dx,dy,scale);

	return self;
};

sankey_onode.prototype.overflow_value = function () { return 0; };
sankey_onode.prototype.svalue = function () {
	if (this.cap && this.value() < this.cap) return this.value() * this.scale;
	return 80000 * this.scale;
};
sankey_onode.prototype.value = function () {
	return this.source_value() + this.input_value();
};

sankey_onode.prototype.draw_line = function (dx,dy,scale) {
	var self = this;
	// remove line
	if (self.cap && self.value() < self.cap){
		self.icon_elem.selectAll('#sline'+self.id).data([1]).remove();
		return self;
	}

	var x = self.pos.x * scale + self.width/2 + dx - 25;
	var y = (self.pos.y+self.svalue()/2) * scale + dy - 15;

	var line = self.icon_elem.selectAll('#sline'+self.id).data([1]);
	line.enter().append('image').attr({
		'class': 'sline',
		'id': 'sline'+self.id,
		'transform': 'translate('+x+','+y+')'
	});

	line.attr({
		'xlink:href': 'res/icons/purplenode_overlayimage.svg'
	}).transition().delay(400).duration(this.trans_duration).attr({
		'width': 50,
		'height': 30,
		'transform': 'translate('+x+','+y+')'
	});

	return self;
};

/**
 * Draw icons
 * @member dx
 * @member dy
 * @member scale
 */
sankey_onode.prototype.draw_icon = function (dx,dy,scale) {
	if (!this.editable) return this;
	var self = this;

	var size = 28;
	var x = self.pos.x*scale + dx-size/2;
	x += self.text.direction
		? self.width + self.text.box[2] + (5 + size/2)
		: -self.text.box[2] - (5 + size/2);
	var y = (self.pos.y + self.svalue()/2)*scale + dy -size/2;

	var icon = self.icon_elem.selectAll('#sicon'+self.id).data([1]);
	icon.enter().append('image').attr({
		'class': 'sicon',
		'id': 'sicon'+self.id,
		'width': size,
		'height': size,
		'xlink:href': 'res/icons/button_question.png',
		'transform': 'translate('+x+','+y+')'
	});

	icon.transition().delay(400).duration(this.trans_duration).attr({
		'transform': 'translate('+x+','+y+')'
	})
	.node().addEventListener('click', function () {
		icon.attr('xlink:href', 'res/icons/button_question_noshadow.png');
		self.trigger('click', self.id, 'node');
	});

	return self;
};
