using System;
using System.Numerics;
using HilbertTransformation;
using System.Collections.Generic;
using Microsoft.VisualBasic.FileIO;


namespace Main
{
    class Program
    {
        static void Main(string[] args)
        {
            string[][] parsedData = readFile();
            int bpd = FindBitsPerDimension(800);

            /*
            TODO: dynamically create this number!!
            */
            float SCALAR = (float)Math.Pow(10,6);



            // for each line in data file
            for (int i=1; i<parsedData.Length; i++){
                var coords = parsedData[i][2..(parsedData[i].Length)];
                int[] scaledIntCoordinates = new int[coords.Length];

                // for each coordinate in line, cast to float and scale so everything is an integer (hilbert point requires integers)
                for (int j=0; j<coords.Length; j++){
                    float floatCoordinate = (float)Double.Parse(coords[j], System.Globalization.NumberStyles.Float);
                    float scaledCoordinate = floatCoordinate * SCALAR;
                    int coordinate = (int)scaledCoordinate;
                    scaledIntCoordinates[j] = coordinate;
                }
                //    foreach(int coord in scaledIntCoordinates){
                //        Console.Write(coord + " : ");
                //    }
                //    Console.WriteLine(" ");

                // get hilbert index from ith line of data
                HilbertPoint hilbertPoint = new HilbertPoint(scaledIntCoordinates, bpd);
                Console.WriteLine(hilbertPoint.HilbertIndex);

                // create new list, fill indices with original line and append hilbert index
                string[] coordinatesWithAppendedHilbertIndex = new string[parsedData[i].Length + 1];
                for (int j=0; j<parsedData[i].Length; j++){
                    coordinatesWithAppendedHilbertIndex[j] = parsedData[i][j];
                    Console.WriteLine(parsedData[i][j]);
                }
                // coordinatesWithAppendedHilbertIndex[coordinatesWithAppendedHilbertIndex.Length - 1] = hilbertPoint.HilbertIndex.toString();
                




            }       

 

        }
        public static string[][] readFile(){
            string[][] lines;
            string[] lines1 = System.IO.File.ReadAllLines(@"C:\Users\Jaxon\Desktop\Research\magPhyxVis\magPhyxVis\data\data1\events\events100.csv");
            using (TextFieldParser parser = new TextFieldParser(@"C:\Users\Jaxon\Desktop\Research\magPhyxVis\magPhyxVis\data\data1\events\events100.csv")){
            lines = new string[lines1.Length][];
            parser.Delimiters = new string[] { "," };
            int index = 0;
            while (true)
            {
                string[] parts = parser.ReadFields();
                if (parts == null)
                {
                    break;
                }
                lines[index] = parts;
                index++;
            }
        }
        return lines;
        }
        public void writeData(string[][] lines){
            foreach (string[] line in lines){
                foreach(string column in line){
                    Console.Write(column + " : ");
                }
                Console.WriteLine(" ");

            }
        }

        public static int FindBitsPerDimension(int max)
		{
			// Add one, because if the range is 0 to N, we need to represent N+1 different values.
			return (max + 1).SmallestPowerOfTwo();
		}

        public static void test(){
            
        


            

            var coords1 = new uint[2]{2,2};
            var coords2 = new uint[2]{2,7};
            var coords3 = new uint[2]{7,7};
            var coords4 = new uint[2]{7,2};
            var bpd = FindBitsPerDimension(7);

            var hPoint1 = new HilbertPoint(coords1, bpd);
            var hPoint2 = new HilbertPoint(coords2, bpd);
            var hPoint3 = new HilbertPoint(coords3, bpd);
            var hPoint4 = new HilbertPoint(coords4, bpd);

            Console.WriteLine("point1: " + hPoint1.HilbertIndex);
            Console.WriteLine("point2: " + hPoint2.HilbertIndex);
            Console.WriteLine("point3: " + hPoint3.HilbertIndex);
            Console.WriteLine("point4: " + hPoint4.HilbertIndex);


            var bpd1 = FindBitsPerDimension(5);
            for (uint i=0; i<5; i++){
                for (uint j=0; j<5; j++){
                    var coords = new uint[2]{i , j};
                    var hPoint = new HilbertPoint(coords, bpd1);

                    Console.WriteLine($"[{coords[0]}, {coords[1]}] HIndex: {hPoint.HilbertIndex}");
                }
            }
        }

    }
}
