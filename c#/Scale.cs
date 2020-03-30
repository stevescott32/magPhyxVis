class PointScaler{
    int MAX_NUMBER = 2 ** 31;
    float[] points;
    float[] encodedPoints;
    int dimensions;
    int dimensionMins;
    int dimensionMaxs;
    constructor(float[] points, int dimensions){
        Object.freeze(this.MAX_NUMBER);
        this.points = points;
        this.dimensions = dimensions;
        this.dimensionMins = this.getPointsMins();
        this.dimensionMaxs = this.getPointMaxs();
        this.encodedPoints = this.encode(this.points);
    }
    getPointsMins(){
        let mins = new int[this.dimensions];

        for (let i = 0; i<this.dimensions; i++){
            mins[i] = Infinity;
            foreach (float point in this.points){
                if (point[i] < mins[i]) {
                    mins[i] = point[i];
                }
            }
        }
        return mins;
    }

    getPointMaxs(){
        let maxs = new int[this.dimensions];

        for (let i = 0; i<this.dimensions; i++){
            maxs[i] = Number.NEGATIVE_INFINITY;
            foreach (float point in this.points){
                if (point[i] > maxs[i]) {
                    maxs[i] = point[i];
                }
            }
        }
        return maxs;
    }




    scale(float point){
        float[] scaledPoints = new float[][];


        foreach (float point in this.points){
            scaledPoints[point] = new float[];
            for (int i = 0; i<this.dimensions; i++){
                int multiplier = parseInt((this.points[point][i] - this.dimensionMins[i]) / (this.dimensionMaxs[i] - this.dimensionMins[i]));
                scaledPoints[point][i] = this.MAX_NUMBER*multiplier;
                console.log(multiplier);
            }
        }

        return scaledPoints;
    }
}


class Point{
    float coordinates;
    constructor(float[] coordinates, int dimensions){
        this.coordinates = coordinates;
    }

    toString(){
        string openingBracket = "[";
        foreach (float coordinate in this.coordinates){
            if (coordinate < this.coordinates.length - 1) {
                openingBracket += this.coordinates[coordinate] + ", ";
            }
            else{
                openingBracket += this.coordinates[coordinate] + "]";
            }
        }
        return openingBracket;
    }
}

