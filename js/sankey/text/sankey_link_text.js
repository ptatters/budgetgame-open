var sankey_link_text = function (link) {
	var self = this;
	self.link = link;
	sankey_text.call(self, link);
	
	return self;
};
sankey_link_text.prototype = Object.create(sankey_text.prototype);

/**
 * Pre-define text
 * @constructor
 */
sankey_link_text.prototype.constr = function () {

	this.direction = this.define_dir();
	this.define_text();
	return this;
};

sankey_link_text.prototype.define_dir = function () {

	var direction = this.link.source != undefined;
	return direction;
}

sankey_link_text.prototype.text_anchor = function () {
	return this.link.linktype == 'overflow' ? 'middle' : 'end';
}

/**Draw defined text element */
sankey_link_text.prototype.draw = function (dx,dy, scale, nodes) {
	var self = this;
	
	var source = nodes[self.link.source], target = nodes[self.link.target];
	self.position(source, target, dx,dy,scale);

	var y = self.link.linktype == 'overflow' ? self.pos.y : self.pos.y - 3;

	self.use_elem = self.elem.selectAll('#susetext'+self.link.linktype+self.link.id).data([1]);
	self.use_elem.enter().append('text').attr({
		'class': 'stext' + (self.link.editable? ' sedit' : '') + (self.link.linktype == 'overflow' ? ' sovfl' : ''),  
		'id': 'susetext'+self.link.linktype+self.link.id,
		'transform': 'translate('+self.pos.x+','+y+')',
		'font-size': self.fontsize+'px',
		'text-anchor': self.text_anchor()
	})
	.each(function (d,i) {

		self.add_title(d3.select(this));
		self.add_amount(d3.select(this));
	});
	
	self.use_elem
		//.attr('xlink:href', '#sdeftext'+self.link.linktype+self.link.id)
		.transition().delay(400).duration(this.trans_duration)
		.attr('transform', 'translate('+self.pos.x+','+y+')');
		
	return self;
};

sankey_link_text.prototype.remove = function () {
	var self = this;
	
	self.defs.selectAll('#sdeftext'+self.link.linktype+self.link.id).remove();
	self.elem.selectAll('#susetext'+self.link.linktype+self.link.id).remove();
	
	return self;
};

/** Define text position */
sankey_link_text.prototype.position = function (source, target, dx, dy, scale) {
	var self = this;
	
	var x=0,y=0;
	var source_x = 0, 
		target_x = 0,
		source_y = 0,
		target_y = 0;
	
	if (!source) {
		target_y = target.pos.y + target.source_linkoffset(this.link)*target.scale;
		x = (target.pos.x - target.lvlwidth) * scale + dx - self.padding;
		y = (target_y + self.link.svalue()/2) * scale + dy - self.box[3]/2;
		
	} else if (!target) {
		source_y = source.pos.y + source.target_linkoffset(this.link)*source.scale;
		x = (source.pos.x + source.lvlwidth) * scale + dx + self.padding;
		y = (source_y + self.link.svalue()/2) * scale + dy - self.box[3]/2;

	} else {

		if (source.onode) {

			target_x = target.pos.x;
			source_x = source.pos.x + source.width;
			target_y = target.pos.y + target.source_linkoffset(this.link)*target.scale;
			source_y = source.pos.y + source.svalue() - this.link.svalue() - this.fontsize*2;

			if (source.pos.y > target.pos.y) source_y = source.pos.y + this.fontsize*2;

		} else if (target.onode) {

			target_x = target.pos.x;
			source_x = source.pos.x + source.width;
			target_y = target.pos.y + target.svalue() - this.link.svalue() - this.fontsize*2;
			source_y = source.pos.y + source.target_linkoffset(this.link)*source.scale;

			if (target.pos.y > source.pos.y) target_y = target.pos.y + this.fontsize*2;
		} else {

			target_x = target.pos.x;
			source_x = source.pos.x + source.width + (target.pos.x - (source.pos.x + source.width))/2;
			target_y = target.pos.y + target.source_linkoffset(this.link)*target.scale;
			source_y = source.pos.y + source.target_linkoffset(this.link)*source.scale;

		}

		var x1 = source_x;
		var x2 = target_x;
		x =( x1 + (x2 - x1)/2) * scale + dx;
		y = (source_y + (target_y - source_y)/2) * scale + dy - self.box[3]/2;
	}
	
	
	self.pos.x = x;
	self.pos.y = y+self.fontsize;
	return self.pos;
};

sankey_link_text.prototype.coords = function (nodes,dx,dy,s) {
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







