/**
 * Create a svg with an area graph
 * @param {_screen} screen
 * @param {Object) json - json formatted object
 */
var AREA = function (screen, json) {
	/** @this self */
	var self = this;

	/**
	 * chart data
	 * @member {Array} data
	 */
	var data = [];

	/**
	 * Svg elements
	 * @member {Object} svg
	 * @member {d3} areaGroup
	 * @member {d3} axisGroup
	 * @member {d3axis} yaxis
	 * @member {d3axis} xaxis
	 */
	var svg = {
		'height': 0,
		'width': 0,
		'svg': undefined,
		'cont': undefined
	};
	var yaxis = d3.svg.axis().orient('left').tickFormat(d3.format("d"));
	var xaxis = d3.svg.axis().orient('bottom');

	/**
	 * Navigation and position data
	 * @member {Array} box
	 * @member {Array} translate
	 * @member {Float} scale
	 * @member {d3scale} xs
	 * @member {d3scale} ys
	 * @member {Array} margin
	 */
	var box = [0,0,0,0];
	var translate = [0,0];
	var scale = .9;
	var xs = d3.scale.linear();
	var ys = d3.scale.linear();
	var margin = [10,15,0,10];

	var on = {};

	/** @constructor */
	function constructor () {

		parse_data();

		// !!hard coded domains!!
		xs.domain([-5, 90]);
		ys.domain([8000, -8000]);
		xaxis.ticks(18);
		yaxis.ticks(8);

		// create svg and cont
		svg.cont = screen.screen.append('div').attr('id', 'area_chart');
		svg.svg = svg.cont.append('svg').attr('id', 'area_svg');

		size();
		evalscale();
		draw();

		// add event listeners
		screen.on('resize', self.resize);
		return self;
	}

	/** Draw svg elements */
	function draw () {

		// remove previous rendered elements
		svg.svg.selectAll('g').remove();

		var line = d3.svg.line()
	//	    .interpolate("basis")
		    .x(function(d,i) { return xs(d.i); })
		    .y(function(d,i) { return ys(d.v); });

		var lines = [
			// Year 2013 numbers
			{ 	source : 'year-2013'
			, 	style : 'stroke-dasharray: none;stroke-width:3px'
			,   color : '#9d9d9d'
			},

			// Current year's numbers, WITHOUT question and percentage tweak effects
			{ 	source : 'current-year-without-effects'
			, 	style : 'stroke-dasharray: 8px 6px;stroke-width:3px'
			,   color : '#606060'
			},

			// Current year's numbers, WITH question and percentage tweak effects
			{ 	source : 'current-year'
			, 	style : 'stroke-dasharray:none;stroke-width:3px'
			,   color : '#0778b7'
			}
		];


		for (var i = 0; i < lines.length; ++i) {
			var ln = lines[i];
			var dt = data[ln.source];
			svg.svg.append('g').attr('class', 'line_group')
				.append('path')
				.datum(dt)
				.attr({
					'class': 'line',
					'd': line,
					'style': 'stroke:' + ln.color + ';' + ln.style
				});

			evalscale();
			svg.svg.selectAll('circle' + i)
				.data(dt)
				.enter()
				.append("circle")
				.style("fill", ln.color)
				.attr("cx", function(d,i) { return xs(d.i); })
				.attr("cy", function(d,i) { return ys(d.v); })
				.attr("r", 4);
		}

		// draw axises
		svg.svg.append('g').attr({
			'class': 'x axis',
			'transform': 'translate('+0+','+ys(0)+')',
		}).call(xaxis);

		// remove 0 from x axis
		//svg.svg.select('.x.axis').select('.tick').select('text').remove();
		//d3.select(svg.svg.select('.x.axis').selectAll('.tick')[0].slice(-1)[0]).select('text').text('90+');

		svg.svg.append('g').attr({
			'class': 'y axis',
			'transform': 'translate('+(box[0])+','+0+')',
		}).call(yaxis);

		// y axis ticks
		svg.svg.select('.y.axis').selectAll('.tick').select('text')
			.text(function (d) {
				return (d).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ""; });
		// x axis ticks
		svg.svg.select('.x.axis').selectAll('.tick').select('text')
			.each(function (d,i) {
				var node = d3.select(this);
				var x = parseFloat(node.attr('x')) + 10;
				var y = parseFloat(node.attr('y')) - 50;

				node.attr('transform', 'rotate('+y+' '+x+', 30)');
			})
			.text(function (d,i) {
				if (i==0) return '';
				else if (i == 19) return '90+';
				else return d + '-' + (d+4)
			});

		svg.cont.append('div').attr({
			'class': 'age-graph-end-label'
		}).text('IKÄRYHMÄT');
	}

	/** Evaluate scale */
	function evalscale () {

		// center chart in svg
		var dx = (svg.width - svg.width*scale) / 2;
		var dy = (svg.height - svg.height*scale) / 2;

		// box for coordinates of chart in svg
		box = [
			margin[0] + translate[0] + dx,
			margin[1] + translate[1] + dy,
			svg.width * scale - margin[2] + translate[0] + dx,
			svg.height * scale - margin[3] + translate[1] + dy
		];

		// scales
		xs.range([box[0], box[2]]);
		ys.range([box[1], box[3]]);

		// set scales for axises
		xaxis.scale(xs);
		yaxis.scale(ys);
	}

	/** define size for svg */
	function size () {

		svg.height = screen.height;
		svg.width = screen.width;

		svg.cont.style({'width': svg.width+'px', 'height': svg.height+'px'});
		svg.svg.attr({
			'width': svg.width + 'px',
			'height': svg.height + 'px',
			'viewBox': [0,0,svg.width,svg.height]
		});
	}

	/**
	 * Setter and getter function for translate member
	 * @param {Float} x
	 * @param {Float} y
	 */
	self.translate = function (x,y) {
		if (!arguments.length) return translate.concat([]);
		translate = [x,y];
		evalscale();
		draw();
		return self;
	};

	/**
	 * Setter and getter function for ds member
	 * @param {Float} value
	 */
	self.scale = function (v) {
		if (!arguments.length) return scale;
		scale = v;
		evalscale();
		draw();
		return self;
	};

	/** resize chart */
	self.resize = function () {

		size();
		evalscale();
		draw();

		return self;
	};

	/** Parse json data */
	function parse_data () {
		for (var key in json) {
			data[key] = [];
			for (var i in json[key]) {

				// match keys with multiples of 5, rounded down.
				var age = parseInt(i);
				age -= age%5;

				data[key].push({
					'i': age,
					'v': json[key][i]
				});
			}
		}
	}

	return constructor();
};
