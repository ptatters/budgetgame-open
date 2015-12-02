var sankey_startnode = function (node, color, id) {
	var self = this;
	sankey_node.call(self, node, color ,id);

	return self;
};
sankey_startnode.prototype = Object.create(sankey_node.prototype);

sankey_startnode.prototype.eval = function (nodes) {
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
sankey_startnode.prototype.overflow_value = function () { return 0; };

sankey_startnode.prototype.draw_icon = function (dx,dy,scale, icon_x) {
	if (!this.editable) return this;
	var self = this;

	var size = 28;
	var x = icon_x[0] - size/2;
	var y = (self.pos.y+self.value()*self.scale/2)*scale + dy-size/2;
	
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
