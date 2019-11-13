class Utils {
    static getFill(event_type) {
        switch (event_type) {
            case 'init':
                return 'grey';
            case 'collision':
                return 'red';
            case 'beta = 0':
                return 'purple';
            case 'theta = 0':
                return 'blue';
            case 'pr = 0':
                return 'orange';
            case 'phi = 0':
                return 'green';
            case 'pphi = 0':
                return 'brown';
            default:
                return 'black';
        }
    }

}