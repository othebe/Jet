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
        var component  = s.select('g.gtron-component');
        
        var bb = component.getBBox();//select("g.gtron-component");
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
    
    // Clean up source XML.
    var clean = function(container) {
        var layers = [];
        
        // Remove origin layer.
        layers = container.getElementsByClassName('gtron-origin-layer');
        for (var i = 0; i < layers.length; i++) {
            layers[i].remove();
        }
        
        // Remove name layer.
        layers = container.getElementsByClassName('gtron-name-layer');
        for (var i = 0; i < layers.length; i++) {
            layers[i].remove();
        }
        
        return container;
    };
    
    // Send SVG data to server.
    var post_svg_data = function(container, svg_fname) {
        // Clean up source XML.
        container = clean(container);
        
        var data = container.innerHTML;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', POST_URL, true);
        
        // TODO (othebe): Remove once source XML is fixed.
        data = fix(data);
        
        var params = "svgName=" + svg_fname + "&svgXml=" + data;
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        
        xhr.onreadystatechange = function(e) {
            if (e.target.readyState == 4) {
                console.log("DONE - " + svg_fname);
            }
        };
        xhr.send(params);
    };
    
    read_catalog_xml(CATALOG_URL);
};
