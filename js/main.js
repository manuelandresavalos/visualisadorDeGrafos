var width = window.visualViewport.width - 20;
var height = window.visualViewport.height - 20;
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
var data;

d3.json(dataSetJson, function(error, graph) {
	var pageBounds = { x: 0, y: 0, width: width, height: height };
	var page = svg.append('rect').attr('id', 'page').attr(pageBounds);
	var realGraphNodes = graph.nodes.slice(0);
	console.log(graph);
	data = graph;

	var fixedNode = { fixed: false, fixedWeight: 100 };
	var topLeft = { ...fixedNode, x: pageBounds.x, y: pageBounds.y };
	var bottomRight = { ...fixedNode, x: pageBounds.x + pageBounds.width, y: pageBounds.y + pageBounds.height };

	cola.nodes(graph.nodes).links(graph.links).linkDistance(80).start(30);

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
		.style('fill', function(d) {
			return color(d.group);
		})
		.call(cola.drag)
		// .on('mouseover', overCircle)
		// .on('mouseout', outCircle)
		.on('click', clickCircle);

	var label = svg
		.selectAll('.label')
		.data(realGraphNodes)
		.enter()
		.append('text')
		.attr('class', 'label')
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

function overCircle() {
	console.log('over', this);
}
function outCircle() {
	console.log('out', this);
}
function clickCircle(d) {
	if (d.group != 1) {
		let tagId = d.id;
		let dependence = d.name;

		//Busco entre los links, los equipos relacionados al tag/dependencia a la que le hice click.
		let teamsFiltered = [];
		cola
			.links()
			.filter(function(link) {
				if (link.source.id == tagId) {
					return true;
				}
			})
			.forEach(function(element) {
				let el = cola.nodes()[element.target.id];
				teamsFiltered.push(el);
			});

		//Busco los tickets de Jira de cada equipo, relacionados con la dependencia a la que le hice click.
		let jiraTickets = [];
		let html = document.getElementById('detalles');
		let newHTML = '';
		newHTML += '<h2 class="title">' + dependence + '</h2>';
		teamsFiltered.map(function(team) {
			newHTML += '<div class="equipo">';
			newHTML += '  <div class="titleTeam">' + team.name + '</div>';
			newHTML += '  <ul>';
			team.tickets.map(function(objTicket) {
				if (objTicket.dim == tagId) {
					// console.log(team.name);
					// console.log(objTicket);
					jiraTickets.push(objTicket);
					newHTML += '    <li><a href="' + objTicket.idJira + '">' + objTicket.idJira + '</a></li>';
				}
			});
			newHTML += '  </ul>';
			newHTML += '</div>';
		});

		var detalles = document.getElementById('detalles');
		html.innerHTML = newHTML;
		show(detalles);
	}
}

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
