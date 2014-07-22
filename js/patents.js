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



var data_cache;



var colors = {};

var filedict = {};

$(function () {
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
    
    
    if (window['exported'] != undefined){
        console.log("Exported");
        
        initialize_exported();
        
    } else {
        console.log("Original");
        
        initialize_original();
        
    }
});

function initialize_exported(){
    console.log('Initializing exported page...');
    
    data_cache = data_export;
    
    get_from_data_cache();
}


function initialize_original(){
    data_cache = {'data': {},'years': []};
	
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
	
	
    $("#save-button").on("click",function(){
        save();
    })
	
	for (s in demos){
		console.log(s);
		var demoset = demos[s];
		
		var demoset_header = $('<li></li>');
		
		$('#demos').append(demoset_header);
		
		for (d in demoset){
			console.log(d);
			demo = demoset[d];
		
			var demo_button = $('<div class="btn btn-default navbar-btn">Demo '+demo.description+'</div>');
		
			demo_button.on('click', {demo: demo}, function(e){
				var demo = e.data.demo;
				// Reset the years array
				years = [];
				// Reset the file dictionary
				filedict = {};
			
				get_from_server(demo,demo.start);
			});
		
			demoset_header.append(demo_button);
		}
	}
}

function get_from_data_cache(){
    console.log('Just use the data cache directly!');
    
    initialize(data_cache);
}


function get_from_server(demo, y){
	var url = demo.url + demo.prefix + y + ".txt";
	
	$.get(url, function(data){
		data_cache['data'][y] = $.csv.toArrays(data);
		years.push(y)
		
		if (y <= demo.end){
			get_from_server(demo, y+1);
		} else {
			years.sort();
            data_cache['years'] = years;
			initialize(data_cache);
		}
	
	}).fail(function(){
		if (y <= demo.end){
			get_from_server(demo, y+1);
		} else {
			years.sort();
            data_cache['years'] = years;
			initialize(data_cache);
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
  console.log("Added file to data_cache");
  data_cache['data'][year] = $.csv.toArrays(e.target.result);
  
  console.log(year);
  console.log(data_cache['data'][year]);
  
  if (i < files.length -1) {
	  console.log("Reading next file...");
	  setup_reader(files, i+1)
  } else {
	  console.log("done loading");
	  years.sort();
      data_cache['years'] = years;
	  initialize(data_cache);
  }
}


function initialize(data_cache) {
	console.log("Initializing")
	
	// Reset the nodes and edges arrays
	nodes = [];
	edges = [];
	colors = {};
	$("#play").addClass("disabled");
	$("#stop").addClass("disabled");
	
    years = data_cache['years'];
    console.log(years);
	
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
	


	
	$("#play").show();
	$("#stop").show();
	$("#yearcontrol").show();
	
	$("#year").html("Loading...");
	for (var i in years){
		initialize_nodes(years[i], data_cache['data'][years[i]] );
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
	
	

    
	var from;
	var fromlatlong;
	var tolatlong;
	
	for(var row in data) {
		if (row == 0) {
			continue;
		}
		
		if (data[row][0] == 'W') {
			var latlong = new google.maps.LatLng(data[row][1],data[row][2]);

			
			var color = data[row][5].toLowerCase();
			var title = data[row][3]; 
			
			var description = data[row][4];
			
			var n;
			var N = parseFloat(data[row][6]);
			
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
			
			
			if (!(color in colors)){
				var valarray = description.split(" ");
				var val = valarray[valarray.length-1];
				
				colors[color] = val;
			}
			
		} else if (data[row][0] == "") {
			from = "";
		} else {
			
			if (from == "") {
				fromlatlong = new google.maps.LatLng(data[row][1],data[row][2]);
				from = "checked";
			} else {
				tolatlong = new google.maps.LatLng(data[row][1],data[row][2]);
				var weight = parseFloat(data[row][8]);
				var weight_hum = data[row][4].split('=')[1];
				
				var path = [fromlatlong, tolatlong];
				
				var polyOptions = {
					path: path,
				    strokeColor: '#f44',
				    strokeOpacity: .9,
				    strokeWeight: weight,
					year: year,
					weight: weight_hum,
					label: data[row][3],
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

function save(){
    console.log('save clicked...');
    $('#downloadlink').empty();
    $.get('http://data2semantics.github.io/PatViz/scaffold.template',function(data){
        
       var save_page = $('<html></html>');
       
       var $scaffold = $(data);

       
       var data_text = JSON.stringify(data_cache);
       
       var exported_text = "var exported = true ;\n";
       var data_export_text = "var data_export = " + data_text + ";\n";
       
       
       $scaffold.filter('#scaffoldjs').text(exported_text + data_export_text);
       
       
       
       var api_key = $('#apikey').val();
       console.log(api_key);
       var api_uri = "https://maps.googleapis.com/maps/api/js?key="+api_key+"&sensor=false"
       $scaffold.filter('#googleapi').attr('src',api_uri);

      
       
       save_page.append($scaffold);
       
       $.base64.utf8encode = true;
    
       var datauri = "data:text/html;charset=utf-8;base64," + $.base64.btoa(save_page.html());
       $("#downloadlink").append("<div class='alert alert-success'><a href='" + datauri + "'>Download HTML-page</a></div>");
       $("#downloadlink").append("<div class='alert alert-info'>Right click the link above, and select 'Save link as...' from the context menu</div>")
       
    });

    
    
    
}
