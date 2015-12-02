var sankey_link_arwdtext = function (link) {
	var self = this;
	self.link = link;
	sankey_arwdtext.call(self, link);
	
	self.x_space = 60;
	self.y_space = MIN_SPACE*2;
	
	self.use_elem;
	self.dot;
	self.arrow;
	
	return self;
};
sankey_link_arwdtext.prototype = Object.create(sankey_arwdtext.prototype);

/**
 * Pre-define text
 * @constructor
 */
sankey_link_arwdtext.prototype.constr = function () {
	
	this.textpadding = 0;
	this.direction = this.define_dir();
	this.fontsize = 12;
	
	this.define_text();
	return this;
};

sankey_link_arwdtext.prototype.define_dir = function () {

	var direction = this.link.target == 4;
	return direction;
};

/**Draw defined text element */
sankey_link_arwdtext.prototype.draw = function (dx,dy, scale, nodes) {
	var self = this;
	
	var source = nodes[self.link.source], target = nodes[self.link.target];
	self.position(source, target, dx,dy,scale)
		.arw_position(source, target, dx,dy,scale);
		
	var ty = self.pos.y + self.fontsize - self.box[3] + 5;
	var tx = self.pos.x + (self.direction ? 4 : -4);
	
	self.use_elem = self.elem.selectAll('#susetext'+self.link.linktype+self.link.id).data([1]);
	self.use_elem.enter().append('use').attr({
		'class': 'stext' + (self.node.editable ? ' sedit' : ''), 
		'id': 'susetext'+self.link.linktype+self.link.id,
		'transform': 'translate('+tx+','+(ty)+')'
	});
	
	self.use_elem
	.attr('xlink:href', '#sdeftext'+self.link.linktype+self.link.id)
	.transition().duration(this.trans_duration)
	.attr('transform', 'translate('+tx+','+(ty)+')');
	
	if (self.link instanceof sankey_overflow == false) {
		
		self.dot = self.elem.selectAll('#sarw_dot'+self.link.linktype+self.link.id).data([1]);
		self.dot.enter().append('circle').attr({'class': 'sarw_dot', 'id': 'sarw_dot'+self.link.linktype+self.link.id});
		self.dot.transition().duration(this.trans_duration).attr({
			'cx': self.dotpos[0],
			'cy': self.dotpos[1],
			'r': 5
		});
	}
	
	self.arrow = self.elem.selectAll('#sarw_line'+self.link.linktype+self.link.id).data([1]);
	self.arrow.enter().append('polyline').attr({'class': 'sarw_line', 'id': 'sarw_line'+self.link.linktype+self.link.id});
	self.arrow.transition().duration(this.trans_duration)
	.attr( 'points', self.dotpos[0]+','+self.dotpos[1]+' '+self.pos.x+','+self.dotpos[1] );
	
	return self;
};

sankey_link_arwdtext.prototype.remove = function () {
	
	this.defs.selectAll('#sdeftext'+this.link.linktype+this.link.id).remove();
	this.elem.selectAll('#susetext'+this.link.linktype+this.link.id).remove();
	this.elem.selectAll('#sarw_dot'+this.link.linktype+this.link.id).remove();
	this.elem.selectAll('#sarw_line'+this.link.linktype+this.link.id).remove();
	
	return this;
};

/** Define arrow position */
sankey_link_arwdtext.prototype.arw_position = function (source, target, dx,dy, s) {
	var self = this;
	
	var x1 = source.pos.x*s+dx + source.width,
		y1 = source.pos.y*s+dy + (source.target_linkoffset(self.link)+self.value/2)*source.scale*s,
		x2 = target.pos.x*s+dx,
		y2 = target.pos.y*s+dy + (target.source_linkoffset(self.link)+self.value/2)*target.scale*s;
	
	var oy = y1 > y2 ? -12 : 12;
	var xm1 = x1 + (x2-x1)/2 + 5;
	var ym1 = y1 + (y2-y1)/2 + oy;
	
	self.dotpos = [xm1, ym1];
	return self;
};

/** Define text position */
sankey_link_arwdtext.prototype.position = function (source, target, dx,dy,s) {
	var self = this;
	
	var x1 = source.pos.x*s+dx + source.width,
		y1 = source.pos.y*s+dy + (source.target_linkoffset(self.link)+self.value/2)*source.scale*s,
		x2 = target.pos.x*s+dx,
		y2 = target.pos.y*s+dy + (target.source_linkoffset(self.link)+self.value/2)*target.scale*s,
		x,y;
		
	if (self.direction) {
		
		x = x2 + target.width + self.x_space;
		if (y2 < (target.pos.y+target.svalue()/2)*s+dy) y = target.pos.y*s+dy - self.y_space;
		else y = (target.pos.y + target.svalue())*s+dy + self.y_space; 
		
	} else {
		
		x = x1 - source.width - self.x_space;
		if (y1 < (source.pos.y+source.svalue()/2)*s+dy) y = source.pos.y*s+dy - self.y_space;
		else y = (source.pos.y+source.svalue())*s+dy + self.y_space;
	}
	
	self.pos.x = x;
	self.pos.y = y;
	return self;
};

sankey_link_arwdtext.prototype.coords = function (nodes, dx,dy,s) {
	var self = this;
	dx = dx || 0;
	dy = dy || 0;
	s = s || 1;
	
	var source = nodes[this.link.source], target = nodes[this.link.target];
	self.position(source, target ,dx,dy,s);
	
	var x = self.pos.x,
		y = self.pos.y,
		x2 = self.pos.x,
		y2 = self.pos.y;
	
	if (self.direction) {
		x2 += self.box[2];
	} else x -= self.box[2];
	y2 += self.box[3];
	
	return [x,y, x2, y2];
};









