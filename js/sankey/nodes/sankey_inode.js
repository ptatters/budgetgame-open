var sankey_inode = function (node, id, lvl) {
	sankey_node.call(this, node, id, lvl);
	return this;
};
sankey_inode.prototype = Object.create(sankey_node.prototype);

sankey_inode.prototype.eval = function (nodes) {
	var self = this;
	
	if (!this.name && this.text) {
		this.text.remove();
		this.text = undefined;
	} else if (this.name && !this.text) {
		
		this.text = new sankey_big_itext(this);
	} else if (this.text) {
		this.text.update_text();
	}
	return self;
};

sankey_inode.prototype.overflow_value = function () { return 0; };
sankey_inode.prototype.svalue = function () {
	return 16000 * this.scale;
};
sankey_inode.prototype.pvalue = function () { return ''; };