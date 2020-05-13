import numpy

import talib
# followed roughly https://blog.quantinsti.com/install-ta-lib-python/
# installed ta-lib by downloading the cp38 win_amd64.whl file from
# https://www.lfd.uci.edu/~gohlke/pythonlibs/#ta-lib 
# and running pip install <path to .whl file>

print("Trying out talib")

numDataPoints = 100
headings = ['n', 'event_type', 't', 'price']

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


# helper function to print events
def addEvent(n, event_type, t, price, file):
    #print(f"n={n}, event_type={event_type}, t={t}, price={price}")
    pass


def trader2(inputs, params, outputFile):
    results = []
    mom = talib.MOM(inputs["close"], timeperiod=10)
    std_devs = talib.STDDEV(inputs['close'], timeperiod=10, nbdev=1)

    # iterate through all time periods, deciding to buy, sell, or stay
    i = 1
    for (momentum, std_dev) in zip(mom, std_devs):
        if momentum > params["mom_trigger_buy"] and std_dev < params['std_dev']:
            results.append("buy")
            addEvent(i, "buy", i, inputs["close"][i], outputFile)
        elif momentum < params["mom_trigger_sell"] and std_dev < params['std_dev']:
            results.append("sell")
            addEvent(i, "sell", i, inputs["close"][i], outputFile)
        else:
            results.append("stay")
            addEvent(i, "stay", i, inputs["close"][i], outputFile)
    return results

for i in range(8):
    for j in range(8):
        outputFile = (f"trading_events{i*j}{j}.csv")
        trader2Params = {
            'mom_trigger_buy': 0.1 * i,
            'mom_trigger_sell': -0.1 * i,
            'std_dev': 0.1 * j 
        }
        print("*** Running another trading simulation with params %s***" % str(trader2Params))
        buySells = trader2(stockData, trader2Params, outputFile)
        print(buySells)

print("Experiment success")



