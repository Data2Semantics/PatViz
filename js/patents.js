var map;
var oms;


var nodes = [];
var edges = [];
var zoomsizer = 10000;
var initialzoom = 2;

var firstyear = 1974;
var lastyear = 2008;
var initialyear = 1974;

var years = [];

var colors = {};


$(function () {
	
	$("#datasetSelector").on("change", function(){
		$("#datasetSelector option:selected").each(function(){
			var type = $(this).attr("value");
			stop();
			
			if(type!="none"){
				initialize(type);
			}
		});	
	});
	
	$("#slider").slider();
	
	$("#play").on("click", function(){
		play();
	});
	
	$("#stop").on("click", function(){
		stop();
	});
	
	console.log("Initializing...");
	
});

$(document).ready(function(){
	$("#results").tablesorter(); 
});

function initialize(type) {
	// Reset the nodes and edges arrays
	nodes = [];
	edges = [];
	years = [];
	colors = {};
	$("#play").addClass("disabled");
	$("#stop").addClass("disabled");
	
	var mapOptions = {
		center: new google.maps.LatLng(10, 0),
		zoom: initialzoom,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	
	map = new google.maps.Map(document.getElementById("map-canvas"),
	    mapOptions);
	

	$("#slider").slider({
		value: initialyear,
		min: firstyear,
		max: lastyear,
		step: 1,
		slide : function(event, ui) {
			$("#year").html(ui.value);

			// Show the map for the selected period
			show_map(ui.value);
		}
	});
	

	
	$("#year").html("Loading...");
	for (i=firstyear;i<lastyear+1;i++){
		initialize_nodes(type, i);
	}
	
	$("#play").toggleClass("disabled");

}

function show_map(year) {
	for (var n in nodes) {
		var node = nodes[n];
		
		if (node.year == year) {
			node.setVisible(true);
		} else {
			node.setVisible(false);
		}
	}
	
	for (var e in edges) {
		var edge = edges[e];
		
		if(edge.year == year) {
			edge.setVisible(true);
		} else {
			edge.setVisible(false);
		}
	}
}

function initialize_nodes(type, year){
	
	var filename = type +year+'.TXT';
	$.get(filename, function(data){
		$("#year").append(" "+year+" ");
		var csv = $.csv.toArrays(data);
		
		var from;
		var fromlatlong;
		var tolatlong;
		
		years.push(year);
		
		for(var row in csv) {
			if (row == 0) {
				continue;
			}
			
			if (csv[row][0] == 'W') {
				var latlong = new google.maps.LatLng(csv[row][1],csv[row][2]);

				
				var color = csv[row][5].toLowerCase();
				var title = csv[row][3]; 
				var descriptionarray = csv[row][4].split(";")
				var description = descriptionarray.join("<br/>");
				
				
				var n;
				var N = parseFloat(csv[row][6]);
				
				n = N*10;
				
				var circle = {
					path: google.maps.SymbolPath.CIRCLE,
					scale: n,
					fillColor: color,
					fillOpacity: 0.9,
					strokeColor: 'black',
					strokeOpacity: 0.8,
					strokeWeight: .5
				};
				
				var patentOptions = {
					map: map,
					position: latlong,
					icon: circle,
					radius: n,
					year: year,
					N: N,
					clickable: true,
					visible: false,
					draggable: false,
					title: title,
					description: description
				};
				
				var marker = new google.maps.Marker(patentOptions);

				
                google.maps.event.addListener(marker, 'mouseover', function(){
                    showDetails(this);
					this.icon.setOptions({strokeWeight: 2});
                });
				
                google.maps.event.addListener(marker, 'mouseout', function(){
					this.icon.setOptions({strokeWeight: .5});
                });
				
				
				// Append the marker to the nodes
				nodes.push(marker);
				
				// var tr = $("<tr></tr>");
				// 
				// tr.append("<td>" + year + "</td>");
				// tr.append("<td>" + title + "</td>");
				// tr.append("<td>" + descriptionarray[0] + "</td>");
				// tr.append("<td>" + descriptionarray[descriptionarray.length - 1]+ "</td>");
				// tr.append("<td>" + color + "</td>");
				// 
				// $("#resultsbody").append(tr);
				
				
				if (!(color in colors)){
					var valarray = description.split(" ");
					var val = valarray[valarray.length-1];
					
					colors[color] = val;
				}
				
			} else if (csv[row][0] == "") {
				from = "";
			} else {
				
				if (from == "") {
					fromlatlong = new google.maps.LatLng(csv[row][1],csv[row][2]);
					from = "checked";
				} else {
					tolatlong = new google.maps.LatLng(csv[row][1],csv[row][2]);
					var weight = parseFloat(csv[row][8]);
					var weight_hum = csv[row][4].split('=')[1];
					
					var path = [fromlatlong, tolatlong];
					
					var polyOptions = {
						path: path,
					    strokeColor: '#f44',
					    strokeOpacity: .9,
					    strokeWeight: weight,
						year: year,
						weight: weight_hum,
						label: csv[row][3],
						visible: false,
					};
					
					
					
					var poly = new google.maps.Polyline(polyOptions);
					poly.setMap(map);
					
	                google.maps.event.addListener(poly, 'mouseover', function(){
						this.setOptions({strokeWeight: this.strokeWeight * 5});
	                    showEdgeDetails(this);
	                });
					
	                google.maps.event.addListener(poly, 'mouseout', function(){
	                    this.setOptions({strokeWeight: this.strokeWeight / 5});
	                });
					
					edges.push(poly);
					
				}
			}
		}
		
		if (year == lastyear) {
			
			showLegend();
			
			show_map(initialyear);
			years.sort();
			$("#year").html(initialyear);
			
		}
		
	});
	
}

function getRadius(size,zoom){
	var val = zoom/22.0
	
	var x = 1.0/(Math.pow(val,2)) * 1.0/zoom;
	
	return x * zoomsizer * size ;
}

function showDetails(node) {
	var table = $('<table></table>');
	table.addClass('table');
	table.addClass('table-striped');
	
	table.append('<tr><th>Name</th><td>'+node.title.split(";").join("<br/>")+'</td></tr>');
	table.append('<tr><th>Description</th><td>'+node.description+'</td></tr>');
	$('#infopane').html(table);
}

function showEdgeDetails(edge) {
	var table = $('<table></table>');
	table.addClass('table');
	table.addClass('table-striped');
	
	table.append('<tr><th>Edge</th><td>'+edge.label+'</td></tr>');
	table.append('<tr><th>Weight</th><td>'+edge.weight+'</td></tr>');
	
	$('#infopane').html(table);
}

function showLegend() {
	
	var table = $('<table></table>');
	table.addClass('table');
	table.addClass('table-striped');
	
	for (var c in colors){
		table.append('<tr><th style="background-color: '+c+'; ">' + c + '</th><td>'+ colors[c] +'</td></tr>');
	}
	
	$('#legendpane').html(table);
	
}


var playyear = 0;
var playtimer;
function play(){
	$("#play").toggleClass("disabled");
	$("#stop").toggleClass("disabled");
	
	playtimer = window.setInterval(function(){
		console.log(playyear); 
		if (playyear > years.length-1){
			playyear = 1;
		}
		y = years[playyear];
		$("#year").html(y);
		$("#slider").slider('value', y);
		show_map(y);
		playyear += 1;
	},2000);
}

function stop(){
	$("#play").toggleClass("disabled");
	$("#stop").toggleClass("disabled");
	window.clearInterval(playtimer);
}
