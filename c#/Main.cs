using System;
using System.Numerics;
using HilbertTransformation;
using System.Collections.Generic;


namespace Main
{
    class Program
    {
        static void Main(string[] args)
        {
           

            // Console.WriteLine(bpd);
        
            // HilbertPoint hilbert = new HilbertPoint(coords, bpd);

        //    Console.WriteLine(hilbert.HilbertIndex);

            

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

        public static int FindBitsPerDimension(int max)
		{
			// Add one, because if the range is 0 to N, we need to represent N+1 different values.
			return (max + 1).SmallestPowerOfTwo();
		}

    }
}
