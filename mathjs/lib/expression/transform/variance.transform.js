"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createVarianceTransform = void 0;

var _factory = require("../../utils/factory");

var _is = require("../../utils/is");

var _errorTransform = require("./utils/errorTransform");

var _variance = require("../../function/statistics/variance");

var name = 'variance';
var dependencies = ['typed', 'add', 'subtract', 'multiply', 'divide', 'apply', 'isNaN'];
/**
 * Attach a transform function to math.var
 * Adds a property transform containing the transform function.
 *
 * This transform changed the `dim` parameter of function var
 * from one-based to zero based
 */

var createVarianceTransform = /* #__PURE__ */(0, _factory.factory)(name, dependencies, function (_ref) {
  var typed = _ref.typed,
      add = _ref.add,
      subtract = _ref.subtract,
      multiply = _ref.multiply,
      divide = _ref.divide,
      apply = _ref.apply,
      isNaN = _ref.isNaN;
  var variance = (0, _variance.createVariance)({
    typed: typed,
    add: add,
    subtract: subtract,
    multiply: multiply,
    divide: divide,
    apply: apply,
    isNaN: isNaN
  });
  return typed(name, {
    '...any': function any(args) {
      // change last argument dim from one-based to zero-based
      if (args.length >= 2 && (0, _is.isCollection)(args[0])) {
        var dim = args[1];

        if ((0, _is.isNumber)(dim)) {
          args[1] = dim - 1;
        } else if ((0, _is.isBigNumber)(dim)) {
          args[1] = dim.minus(1);
        }
      }

      try {
        return variance.apply(null, args);
      } catch (err) {
        throw (0, _errorTransform.errorTransform)(err);
      }
    }
  });
}, {
  isTransformFunction: true
});
exports.createVarianceTransform = createVarianceTransform;