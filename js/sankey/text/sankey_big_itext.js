var sankey_big_itext = function (node) {
	var self = this;
	sankey_big_text.call(self, node);

	return self;
}
sankey_big_itext.prototype = Object.create(sankey_big_text.prototype);

sankey_big_itext.prototype.constr = function () {

	this.direction = this.define_dir();
	this.padding = 5;
	
	this.define_text();
	return this;
};

sankey_big_itext.prototype.define_dir = function () {
	return true;
}

sankey_big_itext.prototype.position = function (dx, dy, scale) {
	var self = this;
	
	var center = (self.node.svalue()*scale - self.box[3])/2;
	var x = self.node.pos.x * scale + dx + self.node.width + self.padding;
	var y = self.node.pos.y * scale + dy + self.fontsize*.6;
	
	self.pos.x = x;
	self.pos.y = y;
	return self.pos;
};

sankey_big_itext.prototype.add_title = function (target) {
	var self = this;

	var title = self.printed_text.title;
	var newline = title.length > 1 && title.slice(-1)[0] == '';
	var titlewidth = 0;

	var spans = target.selectAll('.stext_title').data(title);
	spans.enter().append('tspan').attr('class', 'stext_title itext');
	spans.exit().remove();
	spans.attr({
		'dy': function (d,i) { return i == 0 ? 0 : self.fontsize*1.1; },
		'x': function (d,i) { return i == 0 ? 0 : 8}
	})
	.text(function (d,i) { return title[i] + ((i == title.length-1 && !newline) ? ' ' : ''); })
	.each(function (d,i) { 
		if (i==0) d3.select(this).classed('shead', true);
		titlewidth = Math.max(titlewidth, this.getComputedTextLength()); 
	});

	return titlewidth;
};