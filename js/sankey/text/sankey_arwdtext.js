var sankey_arwdtext = function (node) {
	var self = this;
	sankey_text.call(this, node);
	
	self.arrow;
	self.dot;
	
	self.dotpos = {'x': 0, 'y': 0};
	
	self.constr();
	return self;
};
sankey_arwdtext.prototype = Object.create(sankey_text.prototype);

/**
 * Pre-define text
 * @constructor
 */
sankey_arwdtext.prototype.constr = function () {
	
	this.textpadding = 0;
	this.fontsize = 16;
	this.direction = this.define_dir();

	this.define_text();
	return this;
};

sankey_arwdtext.prototype.define_dir = function () {

	var direction = false;
	if (this.node.arrowed == 'mid') direction = false;
	else direction = this.node.overflow_value() > 0;
	return direction;
};


/**Draw defined text element */
sankey_arwdtext.prototype.draw = function (dx,dy, scale) {
	var self = this;
	
	self.position(dx,dy,scale)
		.arw_position(dx,dy,scale);
		
	self.use_elem = self.elem.selectAll('#susetext'+self.node.id).data([1]);
	self.use_elem.enter().append('use').attr({
		'class': 'stext' + (self.node.editable ? ' sedit' : ''), 
		'id': 'susetext'+self.node.id,
		'transform': 'translate('+self.pos.x+','+self.pos.y+')'
	});
	self.use_elem.attr('xlink:href', '#sdeftext'+self.node.id)
	.transition().duration(this.trans_duration)
	.attr('transform', 'translate('+self.pos.x+','+self.pos.y+')');
	
	self.dot = self.elem.selectAll('#sarw_dot'+self.node.id).data([1]);
	self.dot.enter().append('circle').attr({'class': 'sarw_dot', 'id': 'sarw_dot'+self.node.id});
	self.dot.transition().duration(this.trans_duration)
	.attr({
		'cx': self.dotpos[0],
		'cy': self.dotpos[1],
		'r': 5
	});
	
	self.arrow = self.elem.selectAll('#sarw_line'+self.node.id).data([1]);
	self.arrow.enter().append('polyline').attr({'class': 'sarw_line', 'id': 'sarw_line'+self.node.id});
	self.arrow.transition().duration(this.trans_duration)
	.attr({
		'points': self.dotpos[0]+','+self.dotpos[1]+' '+self.dotpos[2]+','+self.dotpos[3]
	});
	
	return self;
};

sankey_arwdtext.prototype.remove = function () {
	
	this.defs.selectAll('#sdeftext'+this.node.id).remove();
	this.elem.selectAll('#susetext'+this.node.id).remove();
	this.elem.selectAll('#sarw_dot'+this.node.id).remove();
	this.elem.selectAll('#sarw_line'+this.node.id).remove();
	
	return this;
};

/** Define arrow position */
sankey_arwdtext.prototype.arw_position = function (dx,dy, scale) {
	var self = this;
	
	var center = (self.node.svalue()*scale - self.box[3])/2;
	var x1 = dotx = self.node.pos.x * scale + dx + self.node.width/2;
	var y1 = doty = self.node.pos.y * scale + dy;
	var x2 = x1;
	var y2;
	
	switch (self.node.arrowed) {
		case 'top': 
			y2 = y1 - self.node.width;
			y1 += self.node.svalue()*scale*.2;
			break;
		case 'bot':
			y2 = y1 + self.node.svalue()*scale + self.node.width;
			y1 += self.node.svalue()*scale * .8;
			break;
		default:
			x2 -= self.node.width * 1.5 - 5;
			y1 += self.node.svalue()*scale/2;
			y2 = y1;
	}
	
	self.dotpos = [x1,y1,x2,y2];
	return self;
};

/** Define text position */
sankey_arwdtext.prototype.position = function (dx, dy, scale) {
	var self = this;
	
	var center = (self.node.svalue()*scale - self.box[3])/2;
	var x = self.node.pos.x * scale + dx + self.node.width/2;
	var y = self.node.pos.y * scale + dy + this.fontsize;
	
	switch (self.node.arrowed) {
		case 'top': 
			y -= self.node.width + self.box[3];
			break;
		case 'bot':
			y += self.node.svalue()*scale + self.node.width;
			break;
		default:
			x -= self.node.width * 1.5;
			y += center;
	}
	
	self.pos.x = x;
	self.pos.y = y;
	return self;
};

sankey_arwdtext.prototype.coords = function (dx,dy,s) {
	var self = this;
	dx = dx || 0;
	dy = dy || 0;
	s = s || 1;
	
	var node = self.node,
		x1 = node.pos.x*s + dx + node.width/2,
		y1 = node.pos.y*s + dy,
		x2 = x1,
		y2 = y1 + node.svalue()*s,
		center = (self.node.svalue()*s - self.box[3])/2;
	
	switch (self.node.arrowed) {
		case 'top':
			y2 = y1;
			y1 -= node.width + self.box[3];
			if (self.direction) x2 += self.box[2];
			else x1 -= self.box[2];
			break;
		case 'bot':
			y1 = y2;
			y2 += node.width + self.box[3];
			if (self.direction) x2 += self.box[2];
			else x1 -= self.box[2];
			break;
		default:
			if (self.direction) x2 += self.box[2] + node.width*1.5;
			else x1 -= self.box[2] + node.width * 1.5;
			y1 += Math.min(0, center);
			y2 += Math.min(0, center);
	}
	
	return [x1,y1,x2,y2];
};

