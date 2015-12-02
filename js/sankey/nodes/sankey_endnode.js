var sankey_endnode = function (node, color, id) {
	var self = this;
	sankey_node.call(self, node, color, id);
	
	return self;
};
sankey_endnode.prototype = Object.create(sankey_node.prototype);

sankey_endnode.prototype.pvalue = function () {

	var value = this.source_value() + this.input_value();
	return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' M€';
};

sankey_endnode.prototype.eval = function () {


	// overflow value; amount of difference between input and output
	var underflow = Math.max(0, this.required - (this.source_value()+this.input_value()));
	underflow = Math.max(0,Math.round(underflow/10)-1)*10;
	this.underflow = this.underflow || new sankey_underflow(underflow);
	this.underflow.value = underflow;
	
	if (!this.name && this.text) {
		this.text.remove();
		this.text = undefined;
	} else if (this.name && !this.text) {
		// normal text
		this.text = new sankey_text(this);
	} else if (this.text) {
		this.text.update_text();
	}
	
	// set node space
	if (this.editable) this.min_space = 15;
	
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
sankey_endnode.prototype.draw_rects = function (dx,dy, scale, nodes) {
	
	var self = this,
		sources = self.source_links,
		x = self.pos.x * scale + dx,
		y = self.pos.y * scale + dy;
		
	// group container for rects
	var rectgroup = self.rect_elem.selectAll('#snode'+self.id).data([1]);
	rectgroup.enter().append('g').attr({'class': 'snode', 'id': 'snode'+self.id});
	
	// value rects
	var rects = rectgroup.selectAll('rect').data(sources);
	rects.enter().append('rect');
	rects.exit().remove();
	
	rects.attr({
		'class': function (d,i) { return 'snode_rect ' + (d.rectcss || ''); },
		'fill': function (d,i) { return d.color; }
	})
	.transition().delay(400).duration(this.trans_duration)
	.attr({
		'x': x,
		'y': function (d,i) { var dy = y; y += d.svalue()*scale; return dy; },
		'width': self.width,
		'height': function (d,i) { return d.svalue() * scale; }
	});
	
	return self;
};