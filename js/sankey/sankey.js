var _sankey = function (elem, data) {
	var self = this;


	self.svg = {
		'height': 0,
		'width': 0,
		'svg': undefined,
		'cont': undefined,
		'nodeGroup': undefined,
		'linkGroup': undefined,
		'textGroup': undefined,
		'iconGroup': undefined,
		'defs': undefined
	};
	self.box = [0,0,0,0];
	self.nodebox = [0,0,0,0];
	self.translate = [0,0];
	self.scale = 1;
	self.valuescale = 1;
	self.ratio = 1.15;
	self.lxo = 1;
	self.icon_x = 0;
	self.margin = 30;

	self.elem;
	self.data = {};
	self.raw_data = data;
	self.components = [ sankey_node, sankey_link, sankey_input, sankey_overflow, sankey_underflow ];

	function constructor () {

		self.elem = d3.select(elem);
		if (!self.elem.node()) return false;

		self.parse_data(data)
			.createsvg()
			.build()
			.draw();

		return self;
	}

	self.resize = function () {

		// create svg
		self.svg.width = Math.min(1350, Math.max(self.elem.node().offsetWidth, 835));
		self.svg.height = 500; //self.elem.node().offsetHeight;
		self.svg.cont.style({
			'width': self.svg.width + 'px',
			'height': self.svg.height + 'px'
		});
		self.svg.svg.attr({
			'width': self.svg.width+'px',
			'height': self.svg.height + 'px',
			'viewBox': [0,0,self.svg.width, self.svg.height]
		});

		self.build().draw();
		return self;
	};

	self.redraw = function () {

		self.build().draw();
		return self;
	};

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

	return constructor();
};


_sankey.prototype.draw = function () {
	var self = this;

	var x = self.translate[0],
		y = self.translate[1],
		s = self.scale;

	// draw from nodes
	self.data.nodes.forEach(function (node) {
		node.draw(x,y,s, self.data.nodes, self.icon_x);
	});


	function position_label (d,i) {
		var node = self.data.nodes[ self.data.levels[i*(self.data.levels.length-1)][0] ];
		var x = node.pos.x + node.width*i+(i?5:-5) + self.translate[0];
		return 'translate('+x+',30)';
	}

	// draw menot and tulot labels
	var label_position = [self.nodebox[0], self.nodebox[2]];
	var labels = self.svg.ui.selectAll('.sankey_label').data(['TULOT', 'MENOT']);
	labels.enter().append('text').attr({
		'class': 'sankey_label',
		'transform': position_label,
		'text-anchor': function (d,i) { return i == 0 ? 'end' : 'start'; }
	}).text(function (d,i) { return d; });

	labels.transition().delay(400).duration(800).attr({
		'transform': position_label,
		'text-anchor': function (d,i) { return i == 0 ? 'end' : 'start'; }
	}).text(function (d,i) { return d; });

	return self;
};

_sankey.prototype.createsvg = function () {
	var self = this;

	// create svg
	self.svg.width = Math.min(1350, Math.max(self.elem.node().offsetWidth, 835));
	self.svg.height = 500; //self.elem.node().offsetHeight;
	self.svg.cont = self.elem.append('div').attr('id', 'diagram').style({
		'width': self.svg.width + 'px',
		'height': self.svg.height + 'px'
	});

	self.svg.svg = self.svg.cont.append('svg').attr({
		'id': 'sankey_svg',
		'width': self.svg.width + 'px',
		'height': self.svg.height + 'px',
		'viewBox': [0,0,self.svg.width,self.svg.height]
	});

	// sankey elements
	self.svg.nodeGroup = self.svg.svg.append('g').attr('class', 'sankey_nodes');
	self.svg.linkGroup = self.svg.svg.append('g').attr('class', 'sankey_links');
	self.svg.textGroup = self.svg.svg.append('g').attr('class', 'sankey_texts');
	self.svg.iconGroup = self.svg.svg.append('g').attr('class', 'sankey_icons');
	self.svg.defs = self.svg.svg.append('defs').attr('class', 'sankey_temp');
	// extra stuff
	self.svg.ui = self.svg.svg.append('g').attr('class', 'sankey_ui');

	return self;
};
_sankey.prototype.build = function () {
	var self = this;

	// Create box for diagram nodes;
	//var width = Math.min(self.svg.width, self.svg.height/self.ratio),
	//	height = Math.min(self.svg.height, self.svg.width*self.ratio);

	var width = self.svg.width*.5;
	var height = self.svg.height;

	self.box = [
		(self.svg.width - width) /2,
		(self.svg.height - height) /2,
		self.svg.width - (self.svg.width - width)/2,
		self.svg.height - (self.svg.height - height)/2
	];

	// set target elements for nodes,links,icons and texts
	sankey_text.prototype.defs = self.svg.defs;
	sankey_link.prototype.defs = self.svg.defs;
	sankey_text.prototype.elem = self.svg.textGroup;
	sankey_node.prototype.rect_elem = self.svg.nodeGroup;

	//sankey_node.prototype.link_elem = self.svg.linkGroup;
	sankey_node.prototype.icon_elem = self.svg.iconGroup;
	sankey_link.prototype.link_elem = self.svg.linkGroup;
	sankey_link.prototype.icon_elem = self.svg.iconGroup;


	// evaluate nodes
	self.data.nodes.forEach(function (node) {
		node.eval(self.data.nodes);
		node.on('click', function (nid, type) { self.trigger('click', nid, type);});
	});
	self.data.links.forEach(function (link) {
		link.eval();
	});

	// set scale for diagram components
	self.valuescale = 0.0008;
	self.components.forEach(function (comp) { comp.prototype.scale = self.valuescale; });

	// position nodes
	var len = self.data.levels.length,
		nodew = sankey_node.prototype.width,
		width = (self.box[2] - self.box[0]) -10,
		dx = (width-(len*nodew)) / (len-1),
		x = (len-1)*dx + len*nodew;

	self.components.forEach(function (comp) { comp.prototype.lvlwidth = dx; });

	for (var l = len-1; l > -1; l--) {
		var lvl = self.data.levels[l];

		// position nodes and sort sources
		self.nodespace_y(self.data.levels[l], 0, x);
		self.data.levels[l].forEach(function (nid, i) {
			var node = self.data.nodes[nid];

			// sort targets sources
			node.targets.forEach(function (tlink) {
				self.data.nodes[tlink.target]
					.sort_sources(self.data.nodes);
			});

			// position overflow node
			if (node.olink !== undefined && self.data.nodes[node.olink]) {

				node.sort_sources(self.data.nodes)
					.sort_targets(self.data.nodes);

				self.onodespace_y(self.data.nodes, node, l);

				self.data.nodes[node.olink]
					.sort_sources(self.data.nodes)
					.sort_targets(self.data.nodes, node.pos.y > self.data.nodes[node.olink].pos.y);
			}

			// sort nodes sources
			if (!node.sources.length) node.sort_sources(self.data.nodes);
		});

		if (l > 1 && l < len-1) x -= dx*.8;
		else x -= dx*1.1 + nodew;

	}

	// calculate scale so all text is visible
	var box = [
		self.margin,
		self.margin,
		self.svg.width-self.margin*2,
		self.svg.height-self.margin*2
	];
	var actualbox = [Infinity,Infinity,0,0];
	var nodebox = [Infinity, Infinity, 0,0];

	// get boxes of nodes
	self.data.nodes.forEach(function (node) {

		var box = node.get_box();
		// actual box, includes texts
		actualbox = [
			Math.min(actualbox[0], box[0]),
			Math.min(actualbox[1], box[1]),
			Math.max(actualbox[2], box[2]),
			Math.max(actualbox[3], box[3])
		];

		node.source_links.forEach(function (link) {

			if (link.text) {
				var box = link.text.coords(self.data.nodes);
				// actual box, includes texts
				actualbox = [
					Math.min(actualbox[0], box[0]),
					Math.min(actualbox[1], box[1]),
					Math.max(actualbox[2], box[2]),
					Math.max(actualbox[3], box[3])
				];
			}
		});

		// node box, includes overflow ndoes.
		nodebox = [
			Math.min(nodebox[0], node.pos.x),
			Math.min(nodebox[1], node.pos.y),
			Math.max(nodebox[2], node.pos.x + node.width),
			Math.max(nodebox[3], node.pos.y + node.svalue())
		];
	});

	var actw = actualbox[2] - actualbox[0];
	var acth = actualbox[3] - actualbox[1];
	var ofw = actw - (nodebox[2] - nodebox[0]);
	var ofh = acth - (nodebox[3] - nodebox[1]);

	self.translate = [
		(self.svg.width - actw)/2 - actualbox[0],
		Math.max((self.svg.height - acth)/2 - actualbox[1], 50)
	];
	self.icon_x = [
		self.translate[0] + actualbox[0] - 30,
		self.translate[0] + actw  + actualbox[0] + 45
	];
	self.nodebox = [
		self.translate[0] + nodebox[0],
		self.translate[1] + nodebox[1],
		self.translate[0] + nodebox[2],
		self.translate[1] + nodebox[3]
	];

	return self;
};

_sankey.prototype.onodespace_y = function (nodes, node, lvl) {

	var onode = nodes[node.olink];
	var olink = node.overflow;
	var direction = olink.source == node.id;
	var y = 0;
	var x = node.pos.x;

	if (direction) {
		var lvlw = node.lvlwidth; //lvl < this.data.levels.length-2 ? node.lvlwidth : node.lvlwidth * (1+this.lxo);
		x += lvlw;

		var first = node.target_links[0] == olink;
		if (first) {
			var sib = node.target_links[1];
			y = sib != undefined ? this.data.nodes[sib.target].pos.y : node.pos.y;
			y -= onode.svalue() + MIN_SPACE;
		} else {
			var sib = undefined;
			y = sib != undefined ? this.data.nodes[sib.target].pos.y+this.data.nodes[sib.target].svalue() : node.pos.y+node.svalue();
			y += MIN_SPACE*4;
		}
	} else {
		var lvlw = lvl < this.data.levels.length-1 ? node.lvlwidth : node.lvlwidth * 1+self.lxo;
		x += -lvlw;

		var first = node.source_links[1] == olink;
		if (first) {
			var sib = node.source_links[2];
			y = node.pos.y - onode.svalue() - MIN_SPACE*2;
		} else {
			var sib = node.source_links.slice(-2,-1)[0];
			y = node.pos.y + node.svalue();
			y += MIN_SPACE*4;
		}
	}

	onode.position(x,y);
	return this;
};

_sankey.prototype.nodespace_y = function (nodes, s,x) {
	var self = this;

	for (var i=s, min_y=self.box[1]; i< nodes.length; i++) {
		var nid = nodes[i],	node = self.data.nodes[nid];
		// sort targets (should already be positioned)
		node.sort_targets(self.data.nodes, i==0 && nodes.length > 1)
			.position(undefined, undefined); // reset position of node

		// center on targets
		if (node.targets.length > 1) {

			// get min/max positons on y axis of targets
			for (var t=0, ty1=Infinity,ty2=0; t < node.targets.length; t++) {
				var t2 = node.targets[t], target = self.data.nodes[t2.target];
				ty1 = Math.min(ty1, target.pos.y);
				ty2 = Math.max(ty2, target.pos.y + target.svalue());
			}
			var targCenterY = ty1 + (ty2 - ty1)/2 - node.svalue()/2;

			// try a y value
			node_y = targCenterY || minY;
			node_c = node_y + (node.svalue())/2;

			// do insert sort by y-position
			for (var p=i-1, m=i; p > -1; p--) {
				var p2 = nodes[p], pnode = self.data.nodes[p2];
				var pnode_y = pnode.pos.y, pnode_c = pnode_y + (pnode.svalue())/2;
				if (node_c < pnode_c) m = i; else break;
			}
			// reposition nodes after insertion
			if (m != i) {
				// insert node
				nodes.splice(m, 0, nodes.splice(i,1)[0]);
				// recurse from new key.
				self.nodespace_y(nodes, m, x);
			}

			// positon node
			var y = Math.max(min_y, node_y);
			if (node.id == 6) y = this.nodespace_y.lasty + node.min_space;
			// special position for info nodes
			node.position(x,y);
			min_y = y + node.svalue() + node.min_space;

		} else if (node.targets.length == 1) {

			// get siblings on this level
			var target = self.data.nodes[node.targets[0].target];
			var sibs = target.sources.filter(function (link) {
				return nodes.indexOf(link.source) != -1;
			});

			// get total value of siblings
			for (var s = 0, sy1=Infinity, sy2=0, tots=0, totv=0; s < sibs.length; s++) {
				var sib = self.data.nodes[sibs[s].source];
				sy1 = Math.min(sy1, target.source_linkoffset(sibs[s])*target.scale);
				sy2 = Math.max(sy2, target.source_linkoffset(sibs[s])*target.scale + sib.svalue());
				totv += sib.svalue();
				tots += s < sibs.length-1 ? sib.min_space : 0;
			}

			// center of target
			var targCenterY = target.pos.y + sy1 + (sy2 - sy1)/2;
			var startY = targCenterY - (totv + tots)/2;

			for (s = 0, node_y = startY; s < sibs.length; s++) {
				var sib = self.data.nodes[sibs[s].source];
				if (sib.id == node.id) break;
				node_y += sib.svalue() + sib.min_space;
			}

			var y = Math.max(min_y, node_y);
			node.position(x,y);
			min_y = y + node.svalue() + node.min_space;

		} else {

			// position normally?
			var y = min_y;
			if (node.inode) {
				y += MIN_SPACE;
				x += node.lvlwidth * .7;
			}
			node.position(x,y);
			min_y = y + node.svalue() + node.min_space;

		}
	}

	this.nodespace_y.lasty = min_y+MIN_SPACE;
	return self;
};

_sankey.prototype.parse_data = function (d) {

	this.data = {
		'nodes': [],
		'links': [],
		'inputs': [],
		'onodes': [],
		'levels': [],
		'lvlvalues': []
	};

	// add nodes
	for (var lvl = 0, nid = 0; lvl < d.nodes.length; lvl++) {
		for (var n = 0,level=[]; n < d.nodes[lvl].length; n++) {

			// Type of node object
			var node = d.nodes[lvl][n];

			if (node.inode) nodeobj = sankey_inode;
			else if (node.onode) nodeobj = sankey_onode;
			else if (node.startnode) nodeobj = sankey_startnode;
			else if (lvl == d.nodes.length-1) nodeobj = sankey_endnode;
			else nodeobj = sankey_node;

			this.data.nodes.push( new nodeobj(d.nodes[lvl][n], nid, lvl) );
			this.data.nodes[nid].min_space = node.startnode ? MIN_SPACE*1.5 : MIN_SPACE;

			if (this.data.nodes[nid].onode) this.data.onodes.push(nid);
			else level.push(nid);
			nid++;
		}
		this.data.levels.push(level);
	}

	// add links
	for (var l = 0; l < d.links.length; l++) {

		var color = this.data.nodes[d.links[l].source].color || 'grey';
		this.data.links.push( new sankey_link( d.links[l], color, l) );

		// add to nodes
		this.data.nodes[this.data.links[l].source].targets.push(this.data.links[l]);
		this.data.nodes[this.data.links[l].target].sources.push(this.data.links[l]);
	}

	// add inputs
	for (var i = 0; i < d.inputs.length; i++) {

		var color = this.data.nodes[d.inputs[i].target].color || 'grey';
		this.data.inputs.push( new sankey_input(d.inputs[i], color, l) );

		// add to nodes
		this.data.nodes[this.data.inputs[i].target].inputs.push(this.data.inputs[i]);
		l++;
	}

	return this;
};

/**
 * Update data object.
 * Updates values for links and inputs.
 * Adds links and inputs that does not exist in the data.
 * @param {Object} d - Optional data object to update from
 */
_sankey.prototype.reparse = function (d) {
	var self = this;
	d = d || self.raw_data || {};

	for (var lvl = 0, nid = 0; lvl < d.nodes.length; lvl++) {
		for (var n = 0,level=[]; n < d.nodes[lvl].length; n++) {

			// Type of node object
			var node = d.nodes[lvl][n];

			var e_node = self.data.nodes[nid];
			if (!e_node) continue;

			if (!isNaN(parseFloat(node.required)) && isFinite(node.required)) {
				e_node.required = node.required;
			}

			nid++;
		}
	}

	// Update links
	var links = d.links || [];
	links.forEach(function (link,i) {

		// Find corresponding link in data
		var e_link = self.find_link(link);
		if (e_link == null) return;

		// Create new link object
		if (e_link === false) {
			console.log('create new link');
		} else {
			// update value of existing link object
			e_link.value = link.value;
		}

	});

	// Update inputs
	var inputs = d.inputs || {};
	inputs.forEach(function (input, i) {

		// Find corresponding input in data
		var e_input = self.find_input(input);
		if (e_input == null) return;

		// Create new input
		if (e_input === false) {
			console.log('create new input');
		} else {
			// Update value of existing input object
			e_input.value = input.value;
		}
	});

	return self;
};

_sankey.prototype.find_link = function (link) {
	if (!link) return null;
	var self = this;
	var nodes = self.data.nodes;
	var source = nodes[link.source], target = nodes[link.target];
	if (!source || !target) return null;

	var insource = source.targets.filter(function (_lin) { return _lin.target == link.target; });
	var intarget = target.sources.filter(function (_lin) { return _lin.source == link.source; });
	if (!insource.length || !intarget.length) return false;

	return insource[0];
};

_sankey.prototype.find_input = function (input) {
	if (!input) return null;
	var self = this;
	var nodes = self.data.nodes;

	var target = nodes[input.target];
	if(!target) return null;

	if (target.inputs.length > 1) {
		var match = target.inputs.filter(function (_inp) { return _inp.name == input.name; });
		return match[0] || false;
	}

	return target.inputs[0];
};

