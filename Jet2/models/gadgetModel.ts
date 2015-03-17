
module Jet.Model {

    export class GadgetModel {
        // This is the component dictionary
        // You can use this to iterate over if you have too
        components: { [index: string]: ComponentInstance; } = {};
	
        // Testing constructor. It adds three of the first kind of part in the catalog.
        //constructor(catalog: any) {
        //    this.catalog = catalog;
        //    var kind = Object.keys(this.catalog.components())[0];

        //    this.add_component("part1", kind, 5, 5);
        //    this.add_component("part2", kind, 10, 10);
        //    this.add_component("part3", kind, 10, 20);
        //}

        constructor() {}
	
        // Add component. This adds a component of the keyname type. The name must be a unique ID.
        add_component(
			name: string,
            keyname: string,
			placed_parts: { [index: string]: PlacedPart; } = {}
			
		) {
            if (Object.keys(this.components).indexOf(name) > -1) {
                throw new Error("Adding component with duplicate name: " + name);
            }

            Object.keys(this.components).push(name);
            this.components[name] = new ComponentInstance(name, keyname, placed_parts);
        }
	
        // Gets the info of a component by name.
        component(name: string) {
            // Is there really no good way to copy an object by value?
            return JSON.parse(JSON.stringify(this.components[name]));
        }
	
        // Move a component.
        move_placed_part(name: string, ref: string, xpos: number, ypos: number, rot?: number) {
            this.components[name].placed_parts[ref].xpos = xpos;
            this.components[name].placed_parts[ref].ypos = ypos;
            if (rot) {
                this.components[name].placed_parts[ref].rot = rot;
            }
        }
	
        // Returns list of component names
        component_names(): string[] {
            return Object.keys(this.components);
        }
		
		get_gspec () {
			var XML = document.createElement("div");
			var Node = document.createElement("gadgetlayout");
            Node.setAttribute("version", "1.1");
            
            var name = document.createElement("name")
            name.innerText = "Gadget Name"
			Node.appendChild( name );
			
			var board = document.createElement("board")
            //name.innerText = "Gadget Name"
			board.setAttribute("x", "-50");
			board.setAttribute("y", "-50");
			board.setAttribute("h", "100");
			board.setAttribute("w", "100");
			Node.appendChild( board );
            
            for (var key in this.components) {
                if (this.components.hasOwnProperty(key)) {
                    var comp = document.createElement("component");
					comp.setAttribute("name", this.components[key].name);
					comp.setAttribute("type", this.components[key].keyname);
                	Node.appendChild(comp);
				}
            }
            
			XML.appendChild(Node);
			
			alert(XML.innerHTML);
		}
    }
	
	// Basic component info class
    export class ComponentInstance implements Jet.Application.ISelectable {
		name: string;
		keyname: string;
        placed_parts: { [index: string]: PlacedPart; } = {};
		
		// Basic constructor
		constructor (
            name: string, 
			keyname: string,
            placed_parts: { [index: string]: PlacedPart; } 
        ) {
			this.name = name;
			this.keyname = keyname;
			this.placed_parts = placed_parts;
        }

        // Returns an array of placed parts.
        public getPlacedParts(): Array<PlacedPart> {
            var placedParts = [];

            for (var key in this.placed_parts) {
                placedParts.push(this.placed_parts[key]);
            }

            return placedParts;
        }
	}
    
    // Placed part class
    export class PlacedPart implements Jet.Application.ISelectable {
        ref: string;
        xpos: number;
        ypos: number;
        rot: number;
        
        constructor (
            ref: string,
            xpos: number,
            ypos: number,
            rot: number
        ) {
			this.ref = ref;
			this.xpos = xpos;
			this.ypos = ypos;
			this.rot = rot;
		}
    }
}



//var test = new Jet.Model.GadgetModel();
//test.add_component("name1", "RGB_LED", 10, -10, 90);
//test.get_gspec();