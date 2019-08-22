import {jst} from "jayesstee";

export class JstTable extends jst.Object {
	constructor(opts) {
		super();

		this.opts = Object.assign({}, opts);
        this.sortDirection = {};
		this.reRefreshWorkaround = false; //JstRefresh: Remove
		// Set up some defaults
		this.opts.color = this.opts.color || {};
		this.opts.color.primary = this.opts.color.primary || "#1C6EA4";
		this.opts.color.secondary = this.opts.color.secondary || "#D0E4F5";
		this.opts.color.font = this.opts.color.font || "black";
		this.opts.tetherNonValues = this.opts.tetherNonValues || -1;
		this.opts.debugSort = this.opts.debugSort || false;
		this.opts.headerDefaults = this.opts.headerDefaults || {
			type: undefined,
			text: undefined,
			sortByElement: []
		};
		this.opts.sortFunctions = this.recursiveMerge(this.opts.sortFunctions, {
				text: (firstElm, secondElm) => {
					return firstElm.localeCompare(secondElm);
				},
				num: (firstElm, secondElm) => {
					return firstElm - secondElm;
				}
			});
		if (opts.css) {
			this.cssInstance = () => this.opts.css;
		}
	}

	cssLocal() {
		return [{
				sortingenabled$c: {
					cursor: "pointer"
				},
				title$c: {
					fontSize: "110%",
					fontWeight: "bold",
					color: this.opts.color.font,
					marginBottom$px: 15
				},
				table$c: {
					border$px: [1, "solid", this.opts.primaryColor],
					textAlign: "left",
					borderCollapse: "collapse",
					color: this.opts.color.font
				},
				td$c: {
					verticalAlign: "top",
					border$px: [1, "solid", "#AAAAAA"],
					padding$px: [3, 6],
				},
				th$c: {
					border$px: [1, "solid", "#AAAAAA"],
					padding$px: [3, 6],
				},
				'tbody$c td$c': {
					fontSize$px: 13
				},
				'.tr:nth-child(even)': {
					background: this.opts.color.secondary
				},
				thead$c: {
					background: this.opts.color.primary,
					color: "white"
				},
				'thead$c th$c': {
					fontSize$px: 15,
					fontWeight: "bold",
					color: "#FFFFFF",
				},
				'thead$c th$c$first-child': {
					borderLeft: "none"
				},

			},
			this.opts.cssDefault
		];
	}
	//Merges two objects, with preference to keys/vals of obj1.
	//Obj2 is used only for keys not existing in obj1. Great for setting defaults.
	//Arrays will not be merged. They will come from either 1 or 2, conditional on 1's existance.
	//Returns the merged array
	recursiveMerge(obj1, obj2) {
		if (!obj1) {
			return obj2
		}
		for (let key of Object.keys(obj1)) {
			if (typeof obj1[key] == "object" && !Array.isArray(obj1[key]))
				this.recursiveMerge(obj1[key], obj2[key]);
			else
				if (obj1[key] == undefined)
					obj1[key] = obj2[key];
		}
		for (let key of Object.keys(obj2)) {
			if (obj1[key] == undefined)
				obj1[key] = obj2[key];
		}
		return obj1;

	}
	render() {
		if (this.reRefreshWorkaround){//JstRefresh: Remove
			return undefined;//JstRefresh: Remove
			this.reRefreshWorkaround = false;//JstRefresh: Remove
		}//JstRefresh: Remove
		return jst.$div({
			cn: "-tableContainer --tableContainer"
		},
			jst.$div({
				cn: "-title --title"
			},
				this.opts.title),
			jst.$table({
				id: this.opts.id,
				cn: "--table -table"
			},
				this.renderTHead(),
				this.renderTBody(),
				this.renderTFoot()));
	}
	renderTHead() {
		return jst.$thead({
			cn: "-thead --thead"
		},
			jst.$tr({
				cn: "-tr --tr"
			},
				this.opts.headings.map(
					(heading, i) => {
					var headingObj = this.recursiveMerge(heading.text ? heading : {
							text: heading
						}, this.opts.headerDefaults)
						return jst.$th({
							cn: "-th --th" + (headingObj.type !== undefined ? " -sortingenabled" : ""),
							events: headingObj.type ? {
								click: e => this.sortData(i, headingObj, this.opts.data)
							}: {}
						}, headingObj.text)
				})));
	}

	safeDescend(obj, location) {
		let tmp = obj
			for (let key of location) {
				if (obj[key]) {
					tmp = obj[key]
				} else {
					return undefined
				}
			}
			return tmp
	}

	sortData(column, heading, data) {

		if (this.opts.sortFunctions[heading.type]) {
			let dataArr = []
			if (this.opts.debugSort)
				console.log("Sorting " + heading.text + " as " + heading.type)
			
			dataArr = [[], data];

			if (this.opts.tetherNonValues)
				dataArr = this.splitNonValues(data, column, heading)
			if (this.opts.debugSort) {
				console.log("Pre sorted data", dataArr[1])
			}	
	dataArr[1] = dataArr[1].sort(
				(val1, val2) => {
					return this.opts.sortFunctions[heading.type](
						this.safeDescend(val1[column], heading.sortByElement), 
						this.safeDescend(val2[column], heading.sortByElement)
					)
				}
			);
		
			this.sortDirection[heading.text] = this.sortDirection[heading.text] ? false : true;
			
			if (!this.sortDirection[heading.text])
				dataArr[1].reverse();
			
			this.sortedData = dataArr[1].concat(dataArr[0]);

			if (this.opts.debugSort) {
				console.log("Sorted data", this.sortedData)
			}
			this.reRefreshWorkaround = true;
			this.refresh();
			setTimeout(()=>{this.reRefreshWorkaround = false;this.refresh()}, 20) //JstRefresh: Remove
			
			
			
		} else if (heading.type == undefined) {
			if (this.opts.debugSort) {
				console.warn("Clicked on header with no header type defined")
			}
			
		} else {
			if (this.opts.debugSort) {
				console.warn("Sort hander " + heading.type + " (opts.heading[" + column + "].type) must have a matching, defined opts.sortFunction.")
			}
		}
	}
	/*Returns array
	*First Element is null, blank or undefined data
	*Second is everything else
	*/
	splitNonValues(data, column, heading) {
		let values = [
			data.filter(val => {
				val = this.safeDescend(val[column], heading.sortByElement);
				return ((val == undefined || val == null || val == "") ? true : false);
			}),
			data.filter(val => {
				val = this.safeDescend(val[column], heading.sortByElement);
				return ((val == undefined || val == null || val == "") ? false : true);
			})
		];
		return values;
	}

	renderTBody() {

		var dataToUse = [];
		if (this.sortedData)
				dataToUse = this.sortedData;
		else
			   dataToUse = this.opts.data
		let rowSpan = false;
		
		if (this.opts.colOpts) {
			rowSpan = this.opts.colOpts.reduce((acc, opt) => acc || opt.rowSpan, false);
		}
		if (rowSpan) {
			let lastCell = [];
			let lastVal = [];

			return jst.$tbody({
				cn: "-tbody --tbody"
			},
				dataToUse.map(
					row => {
					return jst.$tr({
						cn: "-tr --tr"
					},
						row.map((cell, i) => {
							if (this.opts.colOpts[i] && this.opts.colOpts[i].rowSpan) {
								if (typeof(cell) !== "undefined" && lastVal[i] === cell) {
									lastCell[i].attrs.rowSpan++;
									return undefined;
								} else {
									lastCell[i] = jst.$td({
											cn: "-td --td",
											rowSpan: 1
										}, cell);
									lastVal[i] = cell;
									return lastCell[i];
								}
							} else {

								return jst.$td({
									cn: "-td --td"
								}, cell);
							}
						}))
				}));
		} else {
			return jst.$tbody({
				cn: "-tbody --tbody"
			},
				dataToUse.map(
					row => jst.$tr({
						cn: "-tr --tr"
					},
						row.map(
							(cell) => {
							return jst.$td({
								cn: "-td --td"
							}, cell)
						}))));
		}
	}

	renderTFoot() {
		if (this.opts.footers) {
			return jst.$tfoot({
				cn: "-tfoot --tfoot"
			},
				jst.$tr({
					cn: "-tr --tr"
				},
					this.opts.footers.map(footer => jst.$td({
							cn: "-td --td"
						}, footer))));
		}
		return undefined;
	}

}
