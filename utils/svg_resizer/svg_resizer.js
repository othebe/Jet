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
                        //return;
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
        var bbox = s.getBBox();
        
        var width = bbox.width;
        var height = bbox.height;
        
        svg_elt.setAttribute('width', width);
        svg_elt.setAttribute('height', height);
        svg_elt.setAttribute('viewBox', [-0.5 * width, -0.5 * height, width, height].join(' '));
        
        post_svg_data(container, svg_fname);
    };
    
    // Send SVG data to server.
    var post_svg_data = function(container, svg_fname) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', POST_URL, true);

        var params = "svgName=" + svg_fname + "&svgXml=" + container.innerHTML;
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