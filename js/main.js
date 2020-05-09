var width = window.visualViewport.width - 20,
	height = window.visualViewport.height - 20;

var color = d3.scale.category20();

var cola = cola.d3adaptor().size([
	width,
	height
]);

var svg = d3.select('body').append('svg').attr('id', 'svgContainer').attr('width', width).attr('height', height);

let dataSetJson = './data/teams.json';
var filter = getParameterByName('filter');
//let dataSetJson = 'https://script.google.com/macros/s/AKfycbyoOE7lYVrSgj2-9hzzrE939bJQRNqxjHrlropmGDcCrcHnu9rd/exec';

if (filter.length > 0) {
	dataSetJson += '?filter=' + filter;
}

d3.json(dataSetJson, function(error, graph) {
	var pageBounds = { x: 0, y: 0, width: width, height: height };
	var page = svg.append('rect').attr('id', 'page').attr(pageBounds);
	var realGraphNodes = graph.nodes.slice(0);
	console.log(graph);

	var fixedNode = { fixed: true, fixedWeight: 100 };
	var topLeft = { ...fixedNode, x: pageBounds.x, y: pageBounds.y };
	var tlIndex = graph.nodes.push(topLeft) - 1;
	var bottomRight = { ...fixedNode, x: pageBounds.x + pageBounds.width, y: pageBounds.y + pageBounds.height };
	var brIndex = graph.nodes.push(bottomRight) - 1;
	var constraints = [];

	cola
		.nodes(graph.nodes)
		.links(graph.links)
		/*.jaccardLinkLengths(40, 0.2)*/
		/*.symmetricDiffLinkLengths(30)*/
		.linkDistance(80)
		/*.handleDisconnected(true)*/
		.start(30);

	var link = svg
		.selectAll('.link')
		.data(graph.links)
		.enter()
		.append('line')
		.attr('class', 'link')
		.style('stroke-width', function(d) {
			return Math.sqrt(d.value);
		});

	var node = svg
		.selectAll('.node')
		.data(realGraphNodes)
		.enter()
		.append('circle')
		.attr('class', 'node')
		.attr('r', function(d) {
			return d.radius;
		})
		.attr('cx', 200)
		.attr('style', "filter=url('#dropshadow')")
		.style('fill', function(d) {
			return color(d.group);
		})
		.call(cola.drag)
		/*.on("mouseover", overCircle)
        .on("mouseout", outCircle)
        */
		.on('click', clickCircle);

	var label = svg
		.selectAll('.label')
		.data(realGraphNodes)
		.enter()
		.append('text')
		.attr('class', 'label')
		/*.text(function (d) { return d.name; })*/
		/*.style("fill", "#F00")*/
		.style('fill', function(d) {
			return color(d.group);
		})
		.call(cola.drag);

	cola.on('tick', function() {
		node
			.attr('cx', function(d) {
				return d.x;
			})
			.attr('cy', function(d) {
				return d.y;
			});

		link
			.attr('x1', function(d) {
				return d.source.x;
			})
			.attr('y1', function(d) {
				return d.source.y;
			})
			.attr('x2', function(d) {
				return d.target.x;
			})
			.attr('y2', function(d) {
				return d.target.y;
			});

		label
			.attr('x', function(d) {
				let nameLeng = d.name.length;
				return d.x - nameLeng * 3;
			})
			.attr('y', function(d) {
				var h = this.getBBox().height;
				return d.y + h / 4 + 25;
			});

		page.attr(
			(pageBounds = {
				x: topLeft.x,
				y: topLeft.y,
				width: bottomRight.x - topLeft.x,
				height: bottomRight.y - topLeft.y
			})
		);
	});
});

var elem = document.documentElement;
function openFullscreen() {
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	}
	else if (elem.mozRequestFullScreen) {
		/* Firefox */
		elem.mozRequestFullScreen();
	}
	else if (elem.webkitRequestFullscreen) {
		/* Chrome, Safari & Opera */
		elem.webkitRequestFullscreen();
	}
	else if (elem.msRequestFullscreen) {
		/* IE/Edge */
		elem.msRequestFullscreen();
	}
}

/**
   * @param String name
   * @return String
   */
function getParameterByName(name) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
		results = regex.exec(location.search);
	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function overCircle() {
	console.log('over', this);
}
function outCircle() {
	console.log('out', this);
}
function clickCircle(d) {
	if (d.group != 1) {
		var detalles = document.getElementById('detalles');
		show(detalles);
	}
}

// Show an element
var show = function(elem) {
	elem.style.display = 'block';
};

// Hide an element
var hide = function(elem) {
	elem.style.display = 'none';
};

document.body.addEventListener(
	'click',
	function(event) {
		if (event.target.id == 'page') {
			var detalles = document.getElementById('detalles');
			hide(detalles);
		}
	},
	false
);
