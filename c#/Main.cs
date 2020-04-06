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



            string address = @"C:\Users\Jaxon\Desktop\research\magPhyxVis\magPhyxVis\data\data1\events\arranged_events00.csv";


            createNewFileOfArrangedCoordinates(address);



        }

        public static void createNewFileOfArrangedCoordinates(string address){
            List<Tuple<string, BigInteger>> coordsAndHindex = linesAndHI();

            coordsAndHindex.Sort((a, b) => a.Item2.CompareTo(b.Item2));

            string[] arrangedCoordinates = arrangedCoordinateString(coordsAndHindex);

            System.IO.File.WriteAllLines(address, arrangedCoordinates);


        }

        public static string[] arrangedCoordinateString(List<Tuple<string, BigInteger>> coordsAndHindex){
            string[] arrangedCoords = new string[coordsAndHindex.Count];
            for (int i=0; i<coordsAndHindex.Count; i++){
                arrangedCoords[i] = coordsAndHindex[i].Item1;
            }
            

            return arrangedCoords;
        }

        public static List<Tuple<string, BigInteger>> linesAndHI(){
                        string[][] parsedData = readFile();
            /*
            TODO: find out how bits per dimension works!"
            */
            int bpd = FindBitsPerDimension(800);

            /*
            TODO: dynamically create this number!!
            */
            float SCALAR = (float)Math.Pow(10,6);
    
           List<Tuple<string, BigInteger>> linesAndHIndex = new List<Tuple<string, BigInteger>>();
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
                // create new list, fill indices with original line and append hilbert index
                string[] coordinatesWithAppendedHilbertIndex = new string[parsedData[i].Length + 1];
                for (int j=0; j<parsedData[i].Length; j++){
                    coordinatesWithAppendedHilbertIndex[j] = parsedData[i][j];
                }
                HilbertPoint hilbertPoint = new HilbertPoint(scaledIntCoordinates, bpd);

                var tuple = new Tuple<string, BigInteger>(  lineToString(parsedData[i])  , hilbertPoint.HilbertIndex );  

                linesAndHIndex.Add(tuple);   
            }   
            return linesAndHIndex;
        }
        public static string lineToString(string[] line){
            string toReturn = "";
            for (int i=0; i<line.Length; i++){
                toReturn += line[i]+" ";
            }
            return toReturn;
        }





        public static string[][] readFile(){
            string[][] lines;
            string[] lines1 = System.IO.File.ReadAllLines(@"C:\Users\Jaxon\Desktop\Research\magPhyxVis\magPhyxVis\data\data1\events\events00.csv");
            using (TextFieldParser parser = new TextFieldParser(@"C:\Users\Jaxon\Desktop\Research\magPhyxVis\magPhyxVis\data\data1\events\events00.csv")){
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
