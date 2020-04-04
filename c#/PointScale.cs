using System;
public class PointScale{
    int MAX_NUMBER = (int)Math.Pow(2,31);
    float[][] points;
    int[][] scaledPoints;
    int dimensions;
    float[] dimensionMins;
    float[] dimensionMaxs;
    public PointScale(float[][] points, int dimensions){
        this.points = points;
        this.dimensions = dimensions;
        this.dimensionMins = getPointMins();
        this.dimensionMaxs = getPointMaxs();
        this.scaledPoints = scale();

    }

    float[] getPointMins(){
        float[] mins = new float[this.dimensions];
        for (int i=0; i<this.dimensions; i++){
            mins[i] = float.PositiveInfinity;
            foreach (float[] point in this.points){
                if (point[i] < mins[i]){
                    mins[i] = point[i];
                }
            }
            
        }
        return mins;

    }

    float[] getPointMaxs(){
        float[] maxs = new float[this.dimensions];
        for (int i=0; i<this.dimensions; i++){
            maxs[i] = float.NegativeInfinity;
            foreach (float[] point in this.points){
                if (point[i] > maxs[i]){
                    maxs[i] = point[i];
                }
            }
        }

        

        return maxs;
    }

    int[][] scale(){
        int[][] scaledPoints = new int[this.points.Length][];
        for(int p=0; p<this.points.Length; p++){
            for (int i=0; i<this.dimensions; i++){
                Console.Write("this.points[p][i]: " + this.points[p][i] + " this.dimensionMins[i]: " + this.dimensionMins[i] + " this.dimensionMaxs[i]: " + this.dimensionMaxs[i]);
                float numerator = this.points[p][i] - this.dimensionMins[i];
                float denominator = this.dimensionMaxs[i] - this.dimensionMins[i];
                float multiplier = numerator / denominator;
                int intMultiplier = (int)multiplier;
                // scaledPoints[p][i] = this.MAX_NUMBER * multiplier;
                // Console.WriteLine(this.MAX_NUMBER);
                Console.WriteLine(" numberator: " + numerator + " denominator: " + denominator + " intMultiplier: " + intMultiplier + " multiplier: " + multiplier );

            }
        }
        return scaledPoints;
    }



}