/**
 * ParamVis: Class to encapsulate the code for the 
 * parameter visualization.
 */
class ParamsVis {
	constructor() {
		// size for each dot in the vis
		this.circleSize = 5;
		this.highlightScale = 2;

		// define the size of the svg for the param vis and
		// the padding around the vis
		this.config = {
			width: 500,
			height: 400,
			padding: {
				left: 200,
				top: 100,
				bottom: 30,
				right: 15
			}
		};
	}

	highlightSimulation(simulation) {
		d3.select(`.group${simulation}`)
			.attr('r', () => { return this.circleSize * this.highlightScale; })
		;
	}

	unhighlightSimulation(simulation) {
		d3.select(`.group${simulation}`)
			.attr('r', () => { return this.circleSize; })
		;
	}

	setScatter(scatter) {
		this.scatter = scatter;
	}

	setEventVis(eventVis) {
		this.eventVis = eventVis;
	}

	/**
   * Init function - initialize the vis, linking the simulations in order
   * @param data - an array containing the data in order 
   * @param boundaries - the boundaries of the k tree to display in the vis
   */
	init(data, boundaries) {
		try {
			let myConfig = this.config;
			console.log('Param data', data);

			// create a derived data set that gives each point a reference to the id
			// of the point before it
			for (let i = 0; i < data.simulations.length; i++) {
				let oneSim = data.simulations[i];
				// TODO find a more elegant way of dealing with lack of parameters
				// than just returning out of this whole method
				if (null == oneSim.params)
					return;
				oneSim.meta['id'] = i;
				oneSim.meta['parent'] = i - 1;
			}

			// set up the x axis
			let xscale = d3.scaleLinear()
				.domain([
					d3.min(data.simulations, (sim) => {
						return sim.params.theta;
					}),
					d3.max(data.simulations, (sim) => {
						return sim.params.theta;
					})
				])
				.range([this.config.padding.left, this.config.width + this.config.padding.left])
        ;

			// set up the y axis
			let yscale = d3.scaleLinear()
				.domain([
					d3.min(data.simulations, (sim) => {
						return sim.params.beta;
					}),
					d3.max(data.simulations, (sim) => {
						return sim.params.beta;
					})
				])
				.range([this.config.padding.top, this.config.height + this.config.padding.top])
        ;

			d3.select('#param-vis').selectAll('svg').remove();
			// add a svg for the vis
			let displaySvg = d3.select('#param-vis')
				.append('svg')
				.attr('width', myConfig.width + myConfig.padding.left + myConfig.padding.right)
				.attr('height', myConfig.height + myConfig.padding.top + myConfig.padding.bottom)
        ;


			// add a rectangle around each boundary
			if (boundaries != undefined) {
				console.log('Boundaries', boundaries);
				displaySvg.selectAll('.boundaries')
					.data(boundaries)
					.enter()
					.append('rect')
					.attr('x', d => {
						return xscale(d.dimensionMins[0]);
					})
					.attr('y', d => {
						return yscale(d.dimensionMins[1]);
					})
					.attr('width', d => {
						return xscale(d.dimensionMaxs[0]) - xscale(d.dimensionMins[0]);
					})
					.attr('height', d => {
						return yscale(d.dimensionMaxs[1]) - yscale(d.dimensionMins[1]);
					})
					.style('fill', 'white')
					.style('stroke-width', 3)
					.style('stroke', 'lightgrey')
					.attr('class', 'boundaries')
				;
			}

			// draw a line from each point to its parent
			let links = displaySvg.selectAll('.link')
				.data(data.simulations)
				.enter()
				.append('path')
				.attr('d', function (d) {
					let p = data.simulations.filter(dd => {
						return dd.meta.id == d.meta.parent;
					})[0];
					if (undefined == p) {
						return `M ${xscale(d.params.theta)} ${yscale(d.params.beta)} L ${xscale(d.params.theta)} ${yscale(d.params.beta)}`;
					}
					return `M ${xscale(d.params.theta)} ${yscale(d.params.beta)} L ${xscale(p.params.theta)} ${yscale(p.params.beta)}`;
				})
				.style('fill', 'red')
				.style('stroke', 'orange')
				.style('stroke-width', '2')
				.attr('id', d => { return d.meta.id; })
				.attr('parent', d => { return d.meta.parent; })
				.attr('class', 'link')
        ;

			let paramVis = this;

			// add circles for every param combo
			let params = displaySvg.selectAll('circle')
				.data(data.simulations)
				.enter()
				.append('circle')
				.attr('cx', d => { return xscale(d.params.theta); })
				.attr('cy', d => { return yscale(d.params.beta); })
				.attr('r', () => { return paramVis.circleSize; })
				.attr('class', d => { return `group${d.index}`; })
				.style('fill', 'blue')
				.attr('id', d => { return d.meta.id; })
				.attr('parent', d => { return d.meta.parent; })
				.on('mouseover', function (d) {
					d3.select(this)
						.attr('r', () => {
							return paramVis.circleSize * 1.3;
						})
					;
					if (null != paramVis.scatter) {
						paramVis.scatter.highlightSimulation(d.index);
						paramVis.eventVis.highlightSimulation(d.index);
					}
				})
				.on('mouseout', function (d) {
					d3.select(this)
						.attr('r', () => {
							return paramVis.circleSize;
						})
					;
					if (null != paramVis.scatter) {
						paramVis.scatter.unhighlightSimulation(d.index);
						paramVis.eventVis.unhighlightSimulation(d.index);
					}
				})
				.on('click', d => {
					// open the magPhyx simulation
					window.open(d.meta.url);
				})
				.append('svg:title')
				.text((d) => d.id)
        ;

			let xaxis = displaySvg.append('g')
				.attr('transform', `translate(0 ${myConfig.padding.top * (3 / 4)})`)
        ;
			let yaxis = displaySvg.append('g')
				.attr('transform', `translate(${myConfig.padding.left * (3 / 4)} 0)`)
        ;

			let topAxis = d3.axisTop()
				.scale(xscale);
			let leftAxis = d3.axisLeft()
				.scale(yscale)
        ;

			xaxis.call(topAxis);
			yaxis.call(leftAxis);

			displaySvg.append('text')
			// .attr('x', xscale(0.0))
				.attr('x', xscale(0))
				.attr('y', myConfig.padding.top / 2)
				.text('Theta')
			;

			displaySvg.append('g')
				.attr('transform', 'rotate(-90)')
				.append('text')
				.attr('y', myConfig.padding.left / 2)
				.attr('x', -1 * yscale(0))
				.text('Beta')
			;

		} catch (error) {
			console.log('Error in Param Vis: ', error);
		}
	}
}
