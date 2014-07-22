var scaffold_template = "<head>" +
 "	<title>Patents Visualizer</title>" +
 "<meta name='viewport' content='width=device-width, initial-scale=1'>" +
 "" +
 "<link href='http://netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css' rel='stylesheet'>" +
 "<link rel='stylesheet' href='http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css' />" +
 "" +
 "<style type='text/css'> " +
 "  html { height: 100% }" +
 "  body { height: 100%; margin: 0px; padding: 0px }" +
 "  " +
 "  #map-canvas { " +
 "      width: 100%; " +
 "      height: 500px;" +
 "  }" +
 "" +
 "  .btn-file {" +
 "      position: relative;" +
 "      overflow: hidden;" +
 "  }" +
 "  .btn-file input[type=file] {" +
 "      position: absolute;" +
 "      top: 0;" +
 "      right: 0;" +
 "      min-width: 100%;" +
 "      min-height: 100%;" +
 "      font-size: 999px;" +
 "      text-align: right;" +
 "      filter: alpha(opacity=0);" +
 "      opacity: 0;" +
 "      background: red;" +
 "      cursor: inherit;" +
 "      display: block;" +
 "  }" +
 "  " +
 "  #year { font-size: 32px; font-weight: bolder; font-family: 'Open Sans', helvetica; vertical-align: bottom;}" +
 "" +
 "" +
 "  /* Media height for map */" +
 "  @media (min-height: 900px) {" +
 "      #map-canvas {" +
 "          height: 600px;" +
 "      }" +
 "  }" +
 "" +
 "  @media (min-height: 1000px) {" +
 "      #map-canvas {" +
 "          height: 700px;" +
 "      }" +
 "  }" +
 "" +
 "  @media (min-height: 1100px) {" +
 "      #map-canvas {" +
 "          height: 800px;" +
 "      }" +
 "  }" +
 "  " +
 "  @media (min-height: 1200px) {" +
 "      #map-canvas {" +
 "          height: 900px;" +
 "      }" +
 "  }" +
 "" +
 "" +
 "  /* Media widths for container */" +
 "  @media (min-width: 1300px) {" +
 "      .container{" +
 "          max-width: 1170px;" +
 "          min-width: 1170px;" +
 "      }" +
 "  }" +
 "" +
 "  @media (min-width: 1400px) {" +
 "      .container{" +
 "          max-width: 1270px;" +
 "          min-width: 1270px;" +
 "      }" +
 "  }" +
 "" +
 "  @media (min-width: 1500px) {" +
 "      .container{" +
 "          max-width: 1370px;" +
 "          min-width: 1370px;" +
 "      }" +
 "  }" +
 "" +
 "  @media (min-width: 1600px) {" +
 "      .container{" +
 "          max-width: 1470px;" +
 "          min-width: 1470px;" +
 "      }" +
 "  }" +
 "" +
 "  @media (min-width: 1700px) {" +
 "      .container{" +
 "          max-width: 1570px;" +
 "          min-width: 1570px;" +
 "      }" +
 "  }" +
 "" +
 "  @media (min-width: 1800px) {" +
 "      .container{" +
 "          max-width: 1670px;" +
 "          min-width: 1670px;" +
 "      }" +
 "  }" +
 "" +
 "  @media (min-width: 1900px) {" +
 "      .container{" +
 "          max-width: 1770px;" +
 "          min-width: 1770px;" +
 "      }" +
 "  }" +
 "" +
 "  @media (min-width: 2000px) {" +
 "      .container{" +
 "          max-width: 1870px;" +
 "          min-width: 1870px;" +
 "      }" +
 "  }" +
 "  " +
 "  " +
 "" +
 "  " +
 "</style>" +
 "" +
 "" +
 "" +
 "<script src='http://code.jquery.com/jquery-1.11.1.min.js'></script>" +
 "<script src='https://jquery-csv.googlecode.com/files/jquery.csv-0.71.js'></script>" +
 "<script src='http://code.jquery.com/ui/1.11.0/jquery-ui.min.js'></script>" +
 "<script src='http://data2semantics.github.io/PatViz/js/jquery.base64.js'></script>" +
 "" +
 "" +
 "" +
 "" +
 "" +
 "<script id='googleapi' type='text/javascript'>" +
 "" +
 "// Nothing here ..." +
 "" +
 "</script>" +
 "" +
 "<script id='scaffoldjs' type='text/javascript'>" +
 "" +
 "// Nothing here..." +
 "" +
 "</script>" +
 "" +
 "<script src='http://data2semantics.github.io/PatViz/js/patents.js'></script>" +
 "" +
 "" +
 "" +
 "</head>" +
 "<body>" +
 "	<nav class='navbar navbar-default' role='navigation'>" +
 "	  <!-- Brand and toggle get grouped for better mobile display -->" +
 "	  <div class='navbar-header'>" +
 "	    <button type='button' class='navbar-toggle' data-toggle='collapse' data-target='#bs-example-navbar-collapse-1'>" +
 "	      <span class='sr-only'>Toggle navigation</span>" +
 "	      <span class='icon-bar'></span>" +
 "	    </button>" +
 "	    <a class='navbar-brand' href='#'>PatViz</a>" +
 "	  </div>" +
 "" +
 "	  <!-- Collect the nav links, forms, and other content for toggling -->" +
 "	  <div class='collapse navbar-collapse' id='bs-example-navbar-collapse-1'>" +
 "	    <ul class='nav navbar-nav navbar-right' id='yearcontrol'>" +
 "			<li>" +
 "			<span id='decrease' class='btn btn-default navbar-btn'><span class='glyphicon glyphicon-chevron-left'></span></span>" +
 "			</li>" +
 "			<li><span id='year'></span></li>" +
 "			<li><span id='increase' class='btn btn-default navbar-btn'><span class='glyphicon glyphicon-chevron-right'></span></span></li>" +
 "			<li><div class='btn btn-success disabled navbar-btn' id='play'>Play</div></li>" +
 "			<li><div class='btn btn-danger disabled navbar-btn' id='stop'>Stop</div></li>" +
 "            <li class='divider'>&nbsp;</li>" +
 "            <li><div class='btn btn-default navbar-btn' data-toggle='modal' data-target='#legend-modal' id='legend'>Legend</div></li>" +
 "	    </ul>" +
 "	  </div><!-- /.navbar-collapse -->" +
 "	</nav>" +
 "	" +
 "	" +
 "	<div class='container'>" +
 "		<div class='row'>" +
 "			<div class='col-md-12'>" +
 "				<div class='panel panel-default'>" +
 "					<div id='infopane' class='panel-body'>" +
 "					<p>Hover over a circle, and information will be shown here...</p>" +
 "					</div>" +
 "				</div>" +
 "			</div>" +
 "		</div>" +
 "		<div class='row'>" +
 "			<div class='col-md-12'>" +
 "				<div id='map-canvas'></div>" +
 "			</div>" +
 "		</div>" +
 "" +
 "	" +
 "		<div class='row'>" +
 "			<div class='col-md-12'>" +
 "				<hr/>" +
 "				<img style='height: 50px; float: left;' src='http://data2semantics.github.io/PatViz/img/logo-no-subtitle-150dpi-small.png'/>" +
 "				<img style='height: 50px; float: left;' src='http://data2semantics.github.io/PatViz/img/COMMIT_logo_RGB.jpg'/>" +
 "				<div style='float:left;'>" +
 "					<small><strong>PatViz</strong> - Patent Collaboration Visualizer, Copyright (c) 2013, Rinke Hoekstra and Loet Leydesdorff<br/>" +
 "						For more information, please visit the <a href='http://www.leydesdorff.net/software/patstat/'>companion website</a> (on PatStat only), or if you would like to run this tool locally, visit our <a href='http://github.com/Data2Semantics/PatViz' target='_new'>GitHub</a> pages.</small>" +
 "				</div>" +
 "				<img style='height: 50px; float: right;' src='http://data2semantics.github.io/PatViz/img/uva.png'/>" +
 "				<img style='height: 50px; float: right;' src='http://data2semantics.github.io/PatViz/img/VUlogo_EN_Wit_FC_tcm9-201388.png'/>" +
 "			</div>" +
 "		</div>" +
 "	</div>" +
 "	" +
 "" +
 "	<!-- Modal -->" +
 "	<div class='modal fade' id='legend-modal' tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'>" +
 "	  <div class='modal-dialog'>" +
 "	    <div class='modal-content'>" +
 "	      <div class='modal-header'>" +
 "	        <button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>" +
 "	        <h4 class='modal-title' id='myModalLabel'>Legend</h4>" +
 "	      </div>" +
 "	      <div class='modal-body' id='legendpane'>" +
 "	      </div>" +
 "	      <div class='modal-footer'>" +
 "	        <button type='button' class='btn btn-primary' data-dismiss='modal'>Close</button>" +
 "	      </div>" +
 "	    </div><!-- /.modal-content -->" +
 "	  </div><!-- /.modal-dialog -->" +
 "	</div><!-- /.modal -->" +
 "" +
 "" +
 "<script src='http://netdna.bootstrapcdn.com/bootstrap/3.0.0/js/bootstrap.min.js'></script>	" +
 "</body>";
 