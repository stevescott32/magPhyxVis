using System;
using System.Numerics;
using HilbertTransformation;
using System.Collections.Generic;
using Microsoft.VisualBasic.FileIO;
using System.IO;


namespace Main
{
    class Program
    {
        static void Main(string[] args)
        {

            List<Tuple<string,BigInteger,int>> commandLines_HI_index = new List<Tuple<string, BigInteger,int>>();
            for (int i=0; i<100; i++){
                string index;
                if (i<=9){
                    index = String.Format("0{0}", i);
                }else{index = i.ToString();}
                string address_i = String.Format(@"..\data\data1\commands\commands{0}.csv", index);
                string[] command_line_i = readCommandFile(address_i);
                commandLines_HI_index.Add(commandLine_HI_initIndex(command_line_i, i));
                
            }
            commandLines_HI_index.Sort((a, b) => a.Item2.CompareTo(b.Item2));
  
            makeNewCommandFiles(commandLines_HI_index);



        }

        public static void makeNewCommandFiles(List<Tuple<string, BigInteger, int>> tuples){
            for (int i=0; i<tuples.Count; i++){
                string index;
                if (i<=9){
                    index = String.Format("0{0}", i);
                }else{index = i.ToString();}
                string address = String.Format(@"..\data\data1\commands\hilbert_sorted_commands{0}.csv", index);               
                string[] data = new string[1];
                data[0] = tuples[i].Item1;
                System.IO.File.WriteAllLines(address, data);
            }
            correlateEventsAndCommands(tuples);
        }

        public static void correlateEventsAndCommands(List<Tuple<string, BigInteger, int>> tuples){
            for (int i=0; i<tuples.Count; i++){
                string index;
                string tuplesIndex;
                if (i<=9){
                    index = String.Format("0{0}", i);
                }else{index = i.ToString();}
                if (tuples[i].Item3 <= 9){
                    tuplesIndex = String.Format("0{0}", tuples[i].Item3);
                }else{tuplesIndex = tuples[i].Item3.ToString();}
            string eventAddress = String.Format(@"..\data\data1\events\events{0}.csv", index);
            string newEventAddress = String.Format(@"..\data\data1\events\hilbert_sorted_events{0}.csv", tuplesIndex); 
            string[] data = System.IO.File.ReadAllLines(eventAddress);
            System.IO.File.WriteAllLines(newEventAddress, data);
            }
        }
        
        public static Tuple<string, BigInteger, int> commandLine_HI_initIndex(string[] command_line, int index){
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





            Tuple<string, BigInteger, int> line_HI_index = new Tuple<string, BigInteger, int>(lineToString(command_line), hilbertPoint.HilbertIndex, index);
            return line_HI_index;
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
        public static string lineToString(string[] line){
            string toReturn = "";
            for (int i=0; i<line.Length; i++){
                toReturn += line[i]+" ";
            }
            return toReturn;
        }

        public static int FindBitsPerDimension(int max)
		{
			// Add one, because if the range is 0 to N, we need to represent N+1 different values.
			return (max + 1).SmallestPowerOfTwo();
		}
    }
}
