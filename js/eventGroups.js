class EventGroups {
    constructor() {
        this.data = null;
        this.initialized = false;
        this.svg = d3.select('#event-groups')
        .append('svg')
        .attr('height', 500)
        .attr('width', 500)
        ;
    }

    init(data) {
        this.data = data;
        this.initialized = true;
    }

    handleEventGroupClick() {
        if(!this.initialized) { return; }
        console.log('handling event group click', data);
    }
}
