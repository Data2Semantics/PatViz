var map;
var oms;


var nodes = [];
var edges = [];
var zoomsizer = 10000;
var initialzoom = 2;

var firstyear;
var lastyear;
var initialyear;
var currentyear;

var years = [];

var demos = {'CPC is Y02E10/541: CuInSe2 material PV cells': [
				{description: 'USPTO', start: 1974, end: 2008, url: 'http://semweb.cs.vu.nl/patents2/ztest/', prefix: 'z' },
				{description: 'PatStat', start: 1974, end: 2008, url:'http://semweb.cs.vu.nl/patents2/patstat/', prefix: 'pat'}
				]
			};




var colors = {};

var filedict = {};

$(function () {
	
	// $("#datasetSelector").on("change", function(){
	// 	$("#datasetSelector option:selected").each(function(){
	// 		var type = $(this).attr("value");
	// 		stop();
	// 		
	// 		if(type!="none"){
	// 			initialize(type);
	// 		}
	// 	});	
	// });
	
	
	$("#fileinput").on('change', function(e){
		console.log("Selected files!");
		var files = $("#fileinput")[0].files;
		console.log(files);
		
		// Reset the years array
		years = [];
		// Reset the file dictionary
		filedict = {};

		setup_reader(files, 0);
	});
	
	
	
	// $("#slider").slider();
	
	$("#play").hide();
	$("#stop").hide();
	$("#yearcontrol").hide();
	
	$("#play").on("click", function(){
		play();
	});
	
	$("#stop").on("click", function(){
		stop();
	});
	
	$("#decrease").on("click", function(){
		decrease();
	});
	
	$("#increase").on("click", function(){
		increase();
	});
	
	
	for (s in demos){
		console.log(s);
		var demoset = demos[s];
		
		var demoset_header = $('<li role="presentation" class="dropdown-header">'+ s +'</li>');
		
		$('#demos').append(demoset_header);
		
		for (d in demoset){
			console.log(d);
			demo = demoset[d];
		
			// <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Action</a></li>
			var demo_button = $('<a role="menuitem" tabindex="-1" href="#">'+demo.description+'</a>');
		
			demo_button.on('click', function(e){
				// Reset the years array
				years = [];
				// Reset the file dictionary
				filedict = {};
			
				get_from_server(demo,demo.start);
			});
		
			var demo_li = $('<li role="presentation"></li>');
			demo_li.append(demo_button);
		
			$('#demos').append(demo_li);
		}
		
	}
	
	console.log("Initializing...");
});

// $(document).ready(function(){
// 	$("#results").tablesorter(); 
// });


function get_from_server(demo, y){
	var url = demo.url + demo.prefix + y + ".txt";
	
	$.get(url, function(data){
		filedict[y] = data;
		years.push(y)
		
		if (y <= demo.end){
			get_from_server(demo, y+1);
		} else {
			years.sort();
			initialize(years, filedict);
		}
	
	}).fail(function(){
		if (y <= demo.end){
			get_from_server(demo, y+1);
		} else {
			years.sort();
			initialize(years, filedict);
		}
		
	});
	
	
}


function setup_reader(files, i) {
	// Get the file details
	var file = files[i];
	
	console.log("Reading file "+file.name);
	
	// Regex for matching the type of the file
	var textType = /text.*/;
	
	// If the file is of type text
	if (file.type) {
		// This will extract the year (the first occurring 4-digit number) from the filename
	  	var year = file.name.match(/\d\d\d\d/)[0];
  
	  	// Add the year extracted from the filename to the list of years
	  	years.push(year);
		
		console.log("Found year " + year);
		
		if (file.type.match(textType)) {
		  var reader = new FileReader();

		  reader.onload = function(e) {
			  readerLoaded(e, files, i, year)
		  }
		  console.log("Reading "+file.name);
		  reader.readAsText(file);  
		  console.log("CheckDone");
	  
		} else {
		  console.log("File not supported!");
		}
	} else {
		console.log("This is not a file");
	}	
}

function readerLoaded(e, files, i, year){
  // We'll do something interesting with the result later
  
  console.log("Added file to filedict");
  filedict[year] = e.target.result;
  
  console.log(year);
  console.log(filedict[year]);
  
  if (i < files.length -1) {
	  console.log("Reading next file...");
	  setup_reader(files, i+1)
  } else {
	  console.log("done loading");
	  years.sort();
	  initialize(years, filedict);
  }
}


function initialize(years, filedict) {
	console.log("Initializing")
	
	// Reset the nodes and edges arrays
	nodes = [];
	edges = [];
	colors = {};
	$("#play").addClass("disabled");
	$("#stop").addClass("disabled");
	
	
	initialyear = years[0];
	firstyear = initialyear;
	lastyear = years[years.length-1];
	currentyear = 0;
	
	var mapOptions = {
		center: new google.maps.LatLng(10, 0),
		zoom: initialzoom,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	
	map = new google.maps.Map(document.getElementById("map-canvas"),
	    mapOptions);
	

	// $("#slider").slider({
	// 	value: initialyear,
	// 	min: firstyear,
	// 	max: lastyear,
	// 	step: 1,
	// 	slide : function(event, ui) {
	// 		console.log(event);
	// 		console.log(ui);
	// 		console.log("Slider changed!");
	// 		$("#year").html(ui.value);
	// 
	// 		if (ui.value in years) {
	// 			// Show the map for the selected period
	// 			show_map(ui.value);
	// 		} else {
	// 			console.log("Year does not contain data");
	// 		}
	// 	}
	// });
	
	$("#play").show();
	$("#stop").show();
	$("#yearcontrol").show();
	
	$("#year").html("Loading...");
	for (var i in years){
		initialize_nodes(years[i], filedict[years[i]]);
	}
	
	showLegend();
	
	show_map(initialyear);

	$("#year").html(initialyear);
	
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

function initialize_nodes(year, data){
	$("#year").append(" "+year+" ");
	
	console.log("Initializing nodes for "+year);
	var csv = $.csv.toArrays(data);
	
	var from;
	var fromlatlong;
	var tolatlong;
	
	for(var row in csv) {
		if (row == 0) {
			continue;
		}
		
		if (csv[row][0] == 'W') {
			var latlong = new google.maps.LatLng(csv[row][1],csv[row][2]);

			
			var color = csv[row][5].toLowerCase();
			var title = csv[row][3]; 
			// var descriptionarray = csv[row][4].split(";")
// 			var description = descriptionarray.join("<br/>");
			
			var description = csv[row][4];
			
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

	
}

function getRadius(size,zoom){
	var val = zoom/22.0
	
	var x = 1.0/(Math.pow(val,2)) * 1.0/zoom;
	
	return x * zoomsizer * size ;
}

function showDetails(node) {
	var name = $('<span><strong>Name</strong>: '+node.title.split(";").join(",")+"</span>");
	var description = $('<span>&nbsp; <strong>Description</strong>: '+node.description.split(";").join(',')+"</span>");
	$('#infopane').html(name);
	$('#infopane').append(description);
}

function showEdgeDetails(edge) {
	var name = $('<span><strong>Name</strong>: '+edge.label+"</span>");
	var description = $('<span>&nbsp; <strong>Weight</strong>: '+edge.weight+"</span>");
	$('#infopane').html(name);
	$('#infopane').append(description);
	
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
			$("#play").toggleClass("disabled");
			$("#stop").toggleClass("disabled");
			window.clearInterval(playtimer);
			// Reset the play year
			playyear = 0;
			return;
		}
		y = years[playyear];
		$("#year").html(y);
		show_map(y);
		playyear += 1;
		currentyear = playyear;
	},2000);
}

function stop(){
	$("#play").toggleClass("disabled");
	$("#stop").toggleClass("disabled");
	window.clearInterval(playtimer);
}

function decrease(){
	if (currentyear > 0){
		currentyear = currentyear - 1;
		y = years[currentyear];
		$("#year").html(y);
		show_map(y);
		
	}
}

function increase(){
	if (currentyear < years.length-1){
		currentyear = currentyear + 1;
		y = years[currentyear];
		$("#year").html(y);
		show_map(y);
		
	}
}
