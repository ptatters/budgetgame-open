var sankey_input = function (link, color, id) {
	/** @this self */
	var self = this;
	sankey_link.call(self, link, color, id);
	
	self.cssclass = 'sinput';
	self.nopath = link.nopath;
	
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
sankey_input.prototype = Object.create(sankey_link.prototype);

// used as static attributes
sankey_input.prototype.linktype = 'input';


sankey_input.prototype.eval = function () {
	
	if (!this.name && this.text) {
		this.text.remove();
		this.text = undefined;
	} else if (this.name && !this.text) {
		this.text = new sankey_link_text(this);
		this.text.padding *= 2;
	} else if (this.text) {
		this.text.update_text();
	}
	
	return this;
};

/**
 * Draw icon
 * @param source
 * @param target
 * @param dx
 * @param dy
 * @param s 
 */
sankey_input.prototype.draw_icon = function (source, target, dx,dy,scale) {
	var self = this;
	if (!self.editable) return self;
	
	var size = 28;
	var target_y = target.pos.y + target.source_linkoffset(this)*target.scale,
		x1 = (target.pos.x - target.lvlwidth) * scale + dx + size/2,
		y1 = (target_y + self.svalue()/2) * scale + dy - size/2;

	if (self.text) {
		x1 = self.text.pos.x * scale + dx;
		x1 +=  self.text.box[2] * (self.text.direction ?  1: -1);
		x1 += self.direction ? 5 : -size;
	}

		
	var icon = self.icon_elem.selectAll('#sicon'+self.linktype+self.id).data([1]);
	icon.enter().append('image').attr({
		'class': 'sicon '+self.linktype, 
		'id': 'sicon'+self.linktype+self.id,
		'width': size,
		'height': size,
		'xlink:href': 'res/icons/button_question.png',
		'transform': 'translate('+x1+','+y1+')'
	});
	icon.transition().delay(400).duration(this.trans_duration).attr({
		'transform': 'translate('+x1+','+y1+')'
	})
	.node().addEventListener('click', function () { 
		icon.attr('xlink:href', 'res/icons/button_question_noshadow.png');
		self.trigger('click', target.id, 'input'); 
	});
	
	return self;
};

sankey_input.prototype.draw_text = function (dx,dy,scale, nodes, offy) {
	if (!this.name) return this;
	
	this.text.draw(dx,dy+offy,scale,nodes);
	
	return this;
};

/**
 * Create straight svg path coordinates
 * @param target
 * @param dy
 * @param scale
 */
sankey_input.prototype.svg_path = function (source,target, dx,dy,scale, nodes, offy) {
	if (this.nopath) return 'M0,0';

	var target_y = target.pos.y + target.source_linkoffset(this)*target.scale;
	var source_y = target_y + offy;
	var value = this.svalue();

	var x0 = (target.pos.x - target.lvlwidth) * scale + dx,
		x1 = target.pos.x *scale + dx,
		xi = d3.interpolateNumber(x0, x1)
		x2 = xi(this.curvature)
		x3 = xi(1 - this.curvature)
		y0 = (source_y + value/2) * scale + dy,
		y1 = (target_y + value/2) * scale + dy;
		
	var d = "M" + x0 + "," + y0
            + "C" + x2 + "," + y0
            + " " + x3 + "," + y1
            + " " + x1 + "," + y1;
	return d;
};
