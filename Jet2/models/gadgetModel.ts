
module Jet.Model {

    export class GadgetModel {
        // This is the component dictionary
        // You can use this to iterate over if you have too
        components: { [index: string]: ComponentInstance; } = {};
		
		// This is how you can access the board outline
		// For now it will get degraded to a bounding box when the gspec is exported
		corners: Vertex[] = [];
	
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
            var component = new ComponentInstance(name, keyname, placed_parts);

            // Set a parent reference in all placed parts. Remember to update
            // this when updating the name.
            for (var key in component.placed_parts) {
                component.placed_parts[key].componentInstanceName = name;
            }

            this.components[name] = component;
        }
		
		// Set the corners of the board
		set_corners (corners: Vertex[]) {
			// for now we only support square boards
			if (corners.length != 4) {
				throw new Error("Board must have 4 corners.")
			}
			
			this.corners = corners;
		}
		
		bounding_box (): BoardSize {
			var corners: Vertex[] = this.corners;
			var min_x: number = corners[0].x;
			var max_x: number = corners[0].x;
			var min_y: number = corners[0].y;
			var max_y: number = corners[0].y;
			
			for (var i = 0; i < corners.length; i += 1) {
				if (corners[i].x < min_x) {
					min_x = corners[i].x;
				}
				if (corners[i].x > max_x) {
					max_x = corners[i].x;
				}
				if (corners[i].y < min_y) {
					min_y = corners[i].y;
				}
				if (corners[i].y > max_y) {
					max_y = corners[i].y;
				}
			}
			
			return {min_x: min_x, min_y: min_y, max_x: max_x, max_y: max_y};
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
		
		get_gspec (): string {
			var XML = document.createElement("div");
			var Node = document.createElement("gadgetlayout");
            Node.setAttribute("version", "1.1");
            
            var name = document.createElement("name")
            name.innerText = "Gadget Name"
			Node.appendChild( name );
			
			var board = document.createElement("board")
			this.set_corners(this.corners);
			var bounding_box: BoardSize = this.bounding_box();
			
			board.setAttribute("x", (bounding_box.min_x).toString());
			board.setAttribute("y", (bounding_box.min_y).toString());
			board.setAttribute("w", (bounding_box.max_x - bounding_box.min_x).toString());
			board.setAttribute("h", (bounding_box.max_y - bounding_box.min_y).toString());
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
			
			return XML.innerHTML;
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

        // Determines if this component instance has a placed part.
        // TODO(othebe): Replace placed_parts with array, or hash by placedpart.
        public hasPlacedPart(placedPart: PlacedPart): boolean {
            for (var key in this.placed_parts) {
                if (this.placed_parts[key] == placedPart) {
                    return true;
                }
            }
            return false;
        }
	}
    
    // Placed part class
    export class PlacedPart implements Jet.Application.ISelectable {
        ref: string;
        xpos: number;
        ypos: number;
        rot: number;
        componentInstanceName: string;
        
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
	
	export class BoardSize {
		min_x: number;
		min_y: number;
		max_x: number;
		max_y: number;
	}
	
	export class Vertex {
		x: number
		y: number
		
		constructor (
			x: number,
			y:number
		) {
			this.x = x;
			this.y = y;
		}
	}
}



//var test = new Jet.Model.GadgetModel();
//test.add_component("name1", "RGB_LED", 10, -10, 90);
//test.get_gspec();
