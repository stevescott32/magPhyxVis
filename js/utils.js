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

    // Find the standard deviation
    // values: an array of dictionaries
    // key: the entry in each dictionary to use
    // adapted from https://derickbailey.com/2014/09/21/calculating-standard-deviation-with-array-map-and-array-reduce-in-javascript/
    static standardDeviation(values, key) {
        let avg = this.dictionaryAverage(values, key);

        let squareDiffs = values.map(function (value) {
            let diff = value[key] - avg;
            let sqrDiff = diff * diff;
            return sqrDiff;
        });

        let avgSquareDiff = this.arrayAverage(squareDiffs);

        let stdDev = Math.sqrt(avgSquareDiff);
        return stdDev;
    }

    static dictionaryAverage(data, key) {
        // console.log('Calculating the average', data, key);
        let sum = data.reduce(function (sum, value) {
            return sum + value[key];
        }, 0);

        let avg = sum / data.length;
        return avg;
    }
    
    static arrayAverage(data){
        let sum = data.reduce(function(sum, value){
          return sum + value;
        }, 0);
      
        let avg = sum / data.length;
        return avg;
      }
}
