import numpy
import talib
import math
from numbers import Number

# followed roughly https://blog.quantinsti.com/install-ta-lib-python/
# installed ta-lib by downloading the cp38 win_amd64.whl file from
# https://www.lfd.uci.edu/~gohlke/pythonlibs/#ta-lib 
# and running pip install <path to .whl file>

# see https://mrjbq7.github.io/ta-lib/ for information about indicators

print("##################################")
print("Starting Trading Experiment")
print("##################################")

numDataPoints = 100
headings = ['n', 'event_type', ' t', 'close-price', 'indicator-category']

global trace 
trace = False
global debug
debug = False

def log(msg):
    if trace:
        print(msg)

def logDebug(msg):
    if debug:
        print(msg)

stockData = {
    'open': numpy.random.random(numDataPoints),
    'high': numpy.random.random(numDataPoints),
    'low': numpy.random.random(numDataPoints),
    'close': numpy.random.random(numDataPoints),
    'volume': numpy.random.random(numDataPoints)
}

def getAllIndicators(marketData):
    indicators = []
    categories = []
    all_categories = talib.get_function_groups()
    last_count = 0
    for category in all_categories:
        category_misses = 0
        for indicator in all_categories[category]:
            added = False
            possible_result = 0
            try:
                indicator_method = getattr(talib, indicator)
                possible_result = indicator_method(open=marketData["open"], high=marketData["high"], low=marketData["low"], close=marketData["close"])
                added = True
            except Exception:
                pass
            if not added:
                try:
                    possible_result = indicator_method(high=marketData["high"], low=marketData["low"], close=marketData["close"])
                    added = True
                except Exception:
                    pass
            if not added:
                try:
                    possible_result = indicator_method(high=marketData["high"], low=marketData["low"])
                    added = True
                except Exception:
                    pass
            # end named parameters. Double check that these are correct, as
            # position parameters may not be correct
            if not added:
                try:
                    possible_result = indicator_method(marketData["close"])
                    added = True
                except Exception:
                    pass
            if not added:
                try:
                    # TODO: this is incorrect for OBV
                    possible_result = indicator_method(marketData["high"], marketData["low"])
                    added = True
                except Exception as e:
                    pass
            if not added:
                try:
                    possible_result = indicator_method(marketData["high"], marketData["low"], marketData["close"], marketData["volume"])
                    added = True
                except Exception as e:
                    logDebug(e)
                    pass
            if not added:
                category_misses = category_misses + 1
            else:
                isValid = False
                for val in possible_result:
                    if isinstance(val, Number):
                        isValid |= True
                if isValid:
                    indicators.append(possible_result)
                    categories.append(category)

        log(f"Category '{category}' added {str(len(indicators) - last_count)} indicators")
        log(f"- Category '{category}' missed {category_misses} indicators")
        last_count = len(indicators)

    return (indicators, categories)


# coefficients - an array of 23 coefficients corresponding to the 23 included momentum indicators
def momentumTrader(marketData, indicators, categories, coefficients, stdDevParam, file):

    lower_thresholds = []
    upper_thresholds = []
    for indicator in indicators:
        filtered = []
        for val in indicator:
            if not math.isnan(val):
                filtered.append(val)
        stdDev = numpy.std(filtered)
        mean = numpy.mean(filtered)
        lower_thresholds.append(mean - (stdDevParam * stdDev))
        upper_thresholds.append(mean + (stdDevParam * stdDev))

    category = categories[0]
    for (cat, coeff) in zip(categories, coefficients):
        if coeff == 1:
            category = cat
            logDebug(category)
    # iterate through all time periods, deciding to buy, sell, or stay
    #i = 1
    log("#########################")
    for i in range(len(indicators[0])):
        score = calculateMomentumScore(indicators, coefficients, i)
        if score > calculateThreshold(upper_thresholds, coefficients):
            addEvent(i, "buy", i, marketData["close"][i], category, file)
            log("buy")
        elif score < calculateThreshold(lower_thresholds, coefficients):
            addEvent(i, "sell", i, marketData["close"][i], category, file)
            log("sell")
        else:
            addEvent(i, "stay", i, marketData["close"][i], category, file)
            log("stay")

def calculateThreshold(thresholds, coefficients):
    result = 0
    for (threshold, coefficient) in zip(thresholds, coefficients):
        result += threshold * coefficient
    return result

def calculateMomentumScore(indicators, coefficients, timeindex):
    score = 0
    for (indicator, coefficient) in zip(indicators, coefficients):
        if not numpy.isnan(indicator[timeindex]):
            score += indicator[timeindex] * coefficient
    return score

def printHeadings(headings, file):
    for h in headings:
        file.write(h)
        file.write(',')
    file.write('\n')

# helper function to print events
def addEvent(n, event_type, t, price, category, file):
    file.write(f"{n},{event_type},{t},{price},{category}\n")


(all_indicators, categories) = getAllIndicators(stockData)
numIndicators = len(all_indicators)
print(f"Processing {numIndicators} indicators")
for j in range(1):
    for i in range(numIndicators):
        filenum = j * numIndicators + i
        logDebug(filenum)
        filename = './../../data/momentumTradingData/events/events' + f'{filenum:02}' + '.csv'
        f = open(filename, 'w')
        printHeadings(headings, f)

        coeffs = numpy.zeros(numIndicators)
        coeffs[i] = 1
        momentumTrader(stockData, all_indicators, categories, coeffs, 0.01 * (j + 1), f)
        print('.', end='', flush=True)
        f.close()

print("!")
print("Experiment success")
