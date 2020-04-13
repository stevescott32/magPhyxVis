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


            // createNewFileOfArrangedEventCoordinates(address);

            string[] command_line = readCommandFile(@"C:\Users\Jaxon\Desktop\Research\magPhyxVis\magPhyxVis\data\data1\commands\commands00.csv");
    
            var command_line_and_HIndex = command_line_HIndex(command_line);

            List<Tuple<string,BigInteger>> all_command_lines = new List<Tuple<string, BigInteger>>();
            for (int i=0; i<100; i++){
                string index;
                if (i<=9){
                    index = String.Format("0{0}", i);
                }else{index = i.ToString();}
                string address_i = String.Format(@"C:\Users\Jaxon\Desktop\Research\magPhyxVis\magPhyxVis\data\data1\commands\commands{0}.csv", index);
                string[] command_line_i = readCommandFile(address_i);
                all_command_lines.Add(command_line_HIndex(command_line_i));
                
            }
            all_command_lines.Sort((a, b) => a.Item2.CompareTo(b.Item2));
            foreach(var tuple in all_command_lines){
                Console.WriteLine(tuple);
            }



            




        }
        public static Tuple<string, BigInteger> command_line_HIndex(string[] command_line){
            int bpd = FindBitsPerDimension(6);
            float SCALAR = (float)Math.Pow(10,3);
            var coords = parseCommandLine(command_line);
            int[] scaledIntCoordinates = new int[command_line.Length];

            for(int i=0; i<coords.Length; i++){
                float floatCoordinate = (float)Double.Parse(coords[i], System.Globalization.NumberStyles.Float);
                float scaledCoordinate = floatCoordinate * SCALAR;
                int coordinate = (int)scaledCoordinate;
                scaledIntCoordinates[i] = coordinate;
            }

            string[] coordinatesWithAppendedHilbertIndex = new string[command_line.Length + 1];
            for(int i=0; i<command_line.Length; i++){
                coordinatesWithAppendedHilbertIndex[i]=command_line[i];
            }
            HilbertPoint hilbertPoint = new HilbertPoint(scaledIntCoordinates, bpd);





            Tuple<string, BigInteger> lineAndHI = new Tuple<string, BigInteger>(lineToString(command_line), hilbertPoint.HilbertIndex);
            return lineAndHI;
        }


        public static string[] parseCommandLine(string[] line){
            string[] coords = new string[6];
            for (int i=6; i<line.Length - 1; i++){
                coords[i-6] = line[i];
            }
            return coords;

        }

        public static string[] readCommandFile(string address){
            string[] returnLine;
            string[] inputLine = System.IO.File.ReadAllLines(address);
            using (TextFieldParser parser = new TextFieldParser(address)){
                parser.Delimiters = new string[] { " " };
                returnLine = parser.ReadFields();
            }
            return returnLine;

        }

        public static void createNewFileOfArrangedEventCoordinates(string address){
            List<Tuple<string, BigInteger>> coordsAndHindex = linesAndHI(address);

            coordsAndHindex.Sort((a, b) => a.Item2.CompareTo(b.Item2));

            string[] arrangedCoordinates = arrangedEventCoordinateString(coordsAndHindex);

            System.IO.File.WriteAllLines(address, arrangedCoordinates);


        }

        public static string[] arrangedEventCoordinateString(List<Tuple<string, BigInteger>> coordsAndHindex){
            string[] arrangedCoords = new string[coordsAndHindex.Count];
            for (int i=0; i<coordsAndHindex.Count; i++){
                arrangedCoords[i] = coordsAndHindex[i].Item1;
            }
            

            return arrangedCoords;
        }

        public static List<Tuple<string, BigInteger>> linesAndHI(string address){
            string[][] parsedData = readEventsFile(address);
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

        public static string[][] readEventsFile(string address){
            string[][] lines;
            string[] lines1 = System.IO.File.ReadAllLines(address);
            using (TextFieldParser parser = new TextFieldParser(address)){
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
    }
}
