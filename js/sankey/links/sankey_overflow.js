var sankey_overflow = function (value) {
	/** @this self */
	var self = this;
	sankey_link.call(self, {'value': value}, 'red');
	
	self.color = '#747473';
	self.cssclass = 'soverflow';
	self.rectcss = 'soverflow_rect';
	self.name = this.value < 0 ? 'Alijäämä' : 'Ylijäämä';
	self.direction = false;
	self.nopath = false;

	
	return self;
};
sankey_overflow.prototype = Object.create(sankey_link.prototype);

// used as static attributes
sankey_overflow.prototype.linktype = 'overflow';


sankey_overflow.prototype.eval = function () {
	var self = this;
	
	if (!self.name && self.text) {
		self.text.remove();
		self.text = undefined;
	} else if (self.value > 0 && self.name && !self.text) {
		// normal "leaf" text
		self.text = new sankey_link_text(self);
	} else if (this.text) {
		this.text.update_text();
	}
	
	return self;
};

sankey_overflow.prototype.draw_text = function (dx,dy,scale, nodes) {
	if (!this.value || this.nopath) return this;
	var self = this;
	
	self.text.draw(dx,dy,scale, nodes);
	 return this;
};

/**
 * Create svg path coordinates
 * @param source
 * @param target
 * @param dy
 * @param scale
 */
sankey_overflow.prototype.svg_path = function (source,target, dx,dy,scale, nodes) {
	if (this.nopath) return 'M0,0';
	var self = this;
	
	var value = this.svalue();
	var source_y, source_x, target_x, target_y;
	
	if (!source) {
		target_x = target.pos.x;
		source_x = target_x - target.lvlwidth/2;
		target_y = target.pos.y + target.source_linkoffset(this)*target.scale;
		source_y = target_y + (target.source_links[1] == this ? MIN_SPACE*-1 : MIN_SPACE);
	} else if (!target) {
		source_x = source.pos.x;
		source_y = source.pos.y + source.target_linkoffset(this)*source.scale;
		
		if (source.target_links[0] == this) {
			var sibn = source.target_links.slice(1,2)[0];
			if (sibn != undefined) {
				
				var sib = nodes[sibn.target];
				var midy = (source_y - sib.pos.y) + sibn.svalue();
				target_y = source_y - midy/2 - sib.min_space;
				target_x = source_x + (sib.pos.x - source.pos.x)/2;
				
			} else 	target_y = source_y;
		} else {
			var sibn = source.target_links.slice(-2,-1)[0];
			if (sibn != undefined) {
				
				var sib = nodes[sibn.target];
				var midy = (sib.pos.y - source_y) + sibn.svalue();
				target_y = source_y + midy/2 + sib.min_space;
				target_x = source_x + (sib.pos.x - source.pos.x)/2;
				
			} else target_y = source_y;
		}
		
	} else {

		if (source.onode) {

			target_x = target.pos.x;
			source_x = source.pos.x;
			target_y = target.pos.y + target.source_linkoffset(this)*target.scale;
			source_y = source.pos.y + source.svalue() - this.svalue();

			if (source.pos.y > target.pos.y) source_y = source.pos.y;

		} else if (target.onode) {

			target_x = target.pos.x;
			source_x = source.pos.x;
			source_y = source.pos.y + source.target_linkoffset(this)*source.scale;
			target_y = target.pos.y + target.svalue() - this.svalue();

			if (target.pos.y > source.pos.y) target_y = target.pos.y;
		}
	}
	
	var width = source && source.width || 0;
	
	var x0 = source_x * scale + width + dx,
		x1 = target_x * scale + dx,
		xi = d3.interpolateNumber(x0, x1),
		x2 = xi(this.curvature),
		x3 = xi(1 - this.curvature),
		// y-axis
		y0 = (source_y + value/2) * scale + dy,
		y1 = (target_y + value/2) * scale + dy;
		
	var d;
	if(source_y > target_y){ // construct path so that direction is always from higher to lower (for smoother animation)
		d = "M" + x1 + "," + y1
            + "C" + x3 + "," + y1
            + " " + x2 + "," + y0
            + " " + x0 + "," + y0;
	}else{
		d = "M" + x0 + "," + y0
            + "C" + x2 + "," + y0
            + " " + x3 + "," + y1
            + " " + x1 + "," + y1;
	}
     return d;
};