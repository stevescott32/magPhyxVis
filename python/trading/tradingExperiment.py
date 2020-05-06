import numpy

import talib
# followed roughly https://blog.quantinsti.com/install-ta-lib-python/
# installed ta-lib by downloading the cp38 win_amd64.whl file from
# https://www.lfd.uci.edu/~gohlke/pythonlibs/#ta-lib 
# and running pip install <path to .whl file>

print("Trying out talib")

numDataPoints = 100

close = numpy.random.random(numDataPoints)
output = talib.SMA(close)

stockData = {
    'open': numpy.random.random(numDataPoints),
    'high': numpy.random.random(numDataPoints),
    'low': numpy.random.random(numDataPoints),
    'close': numpy.random.random(numDataPoints),
    'volume': numpy.random.random(numDataPoints)
}

def myFirstTradingAlgo(inputs):
    results = []
    for openPrice in inputs["open"]:
        if openPrice > 0.5:
            results.append("buy")
        else:
            results.append("sell")
    return results



def trader2(inputs, params):
    results = []
    mom = talib.MOM(inputs["close"], timeperiod=10)
    for momentum in mom:
        if momentum > params["trigger_buy"]:
            results.append("buy")
        elif momentum < params["trigger_sell"]:
            results.append("sell")
        else:
            results.append("stay")
    return results

for i in range(8):
    print("*** Running another trading simulation ***")
    trader2Params = {
        'trigger_buy': 0.1 * i,
        'trigger_sell': -0.1 * i 
    }
    buySells = trader2(stockData, trader2Params)
    print(buySells)

print("Experiment success")
