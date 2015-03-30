window.onload = function() {
    var CATALOG_URL = '/catalog/components.xml';
    var POST_URL = '/write_svg';
    var SVG_BASE = '/catalog/catalog/';
    var SVG_CONTAINER = 'svg-container';

    // Read catalog XML.
    var read_catalog_xml = function(catalog_url) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", catalog_url, true);
        xhr.onreadystatechange = function(e) {
            if (e.target.readyState == 4) {
                var xml = xhr.responseXML;
                var components = xml.getElementsByTagName('component');
                for (var i = 0; i < components.length; i++) {
                    var component = components[i];
                    var placedParts = component.getElementsByTagName('placedparts');
                    if (placedParts.length == 0) continue;

                    placedParts = placedParts[0].getElementsByTagName('placedpart');
                    for (var j = 0; j < placedParts.length; j++) {
                        var placedPart = placedParts[j];
                        
                        // SVG Url.
                        var modelPath = placedPart.getAttribute('model2D').split('/');
                        var svgUrl = SVG_BASE + modelPath[modelPath.length - 1];
                        
                        insert_svg(svgUrl);
                    }
                }
            }
        };
        xhr.send();
    };

    // Add SVG to DOM.
    var insert_svg = function(svg_url) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", svg_url, true);
        xhr.onreadystatechange = function(e) {
            if (e.target.readyState == 4) {
                var container = document.createElement('div');
                
                // Wrap the SVG within innerHTML to prevent any namespacing conflict
                // when reading it as XML.
                container.innerHTML = xhr.responseText;

                // SVG filename.
                svg_fname = svg_url.split('/');
                svg_fname = svg_fname[svg_fname.length - 1];
                
                document.body.appendChild(container);
                
                adjust_bbox(container, svg_fname);
            }
        };
        xhr.send();
    };

    // Adjust bounding box.
    // Uses Snap.svg: http://snapsvg.io/docs/#Element.getBBox
    var adjust_bbox = function(container, svg_fname) {
        var svg_elt = container.children[0];
        
        var s = Snap(svg_elt);

        if (false) {
            // Board layer bounding box. Consider a union of the largest bbox.
            var board_layer_above_board = s.select('g.gtron-above-board');
            var board_layer_above_fplate = s.select('g.gtron-above-faceplate');
            var board_bbox = {
		x:      Math.min(   board_layer_above_board.getBBox().x,
                                    board_layer_above_fplate.getBBox().x),
		y:      Math.min(   board_layer_above_board.getBBox().y,
                                    board_layer_above_fplate.getBBox().y),
		width:  Math.max(   board_layer_above_board.getBBox().width,
                                    board_layer_above_fplate.getBBox().width),
		height: Math.max(   board_layer_above_board.getBBox().height,
                                    board_layer_above_fplate.getBBox().height)
            };
            
            // Origin layer bounding box.
            var orig_layer = s.select('g.gtron-origin-layer');
            var orig_bbox = orig_layer.getBBox();
            
            // Fixed dimensions should equal the board layer.
            var width = board_bbox.width;
            var height = board_bbox.height;

            // The viewbox origins should include the entire board layer.
            var orig_x = board_bbox.x - orig_bbox.cx;
            var orig_y = board_bbox.y - orig_bbox.cy;
	}
	
	bb = s.getBBox();//select("g.gtron-component");
        svg_elt.setAttribute('width', bb.width + "mm");
        svg_elt.setAttribute('height', bb.height + "mm");
        svg_elt.setAttribute('viewBox', [bb.x, bb.y, bb.width, bb.height].join(' '));
        
        post_svg_data(container, svg_fname);
    };
    
    // Fix source XML.
    var fix = function(data) {
        /* *********************************************
         * Fix for incorrect inkscape XML with 4 newlines
         * followed by incorrect nodes.
         * TODO (othebe): Remove once source XML is fixed.
         */
        var err_str = "\n\n\n\n";
        var error_ndx = data.indexOf(err_str);
        if (error_ndx >= 0) {
            // Find closing tags </g>.
            var rest = data.substr(error_ndx);
            rest = rest.substr(rest.indexOf("</g>"));
            data = data.substr(0, error_ndx) + rest;
        }
        
        return data;
    };
    
    // Send SVG data to server.
    var post_svg_data = function(container, svg_fname) {
        var data = container.innerHTML;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', POST_URL, true);
        
        // TODO (othebe): Remove once source XML is fixed.
        data = fix(data);
        
        var params = "svgName=" + svg_fname + "&svgXml=" + data;
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        
        xhr.onreadystatechange = function(e) {
            if (e.target.readyState == 4) {
                console.log("DONE");
            }
        };
        xhr.send(params);
    };
    
    read_catalog_xml(CATALOG_URL);
};
