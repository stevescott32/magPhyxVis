"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.concatDependencies = void 0;

var _dependenciesIsInteger = require("./dependenciesIsInteger.generated");

var _dependenciesMatrix = require("./dependenciesMatrix.generated");

var _dependenciesTyped = require("./dependenciesTyped.generated");

var _factoriesAny = require("../../factoriesAny.js");

/**
 * THIS FILE IS AUTO-GENERATED
 * DON'T MAKE CHANGES HERE
 */
var concatDependencies = {
  isIntegerDependencies: _dependenciesIsInteger.isIntegerDependencies,
  matrixDependencies: _dependenciesMatrix.matrixDependencies,
  typedDependencies: _dependenciesTyped.typedDependencies,
  createConcat: _factoriesAny.createConcat
};
exports.concatDependencies = concatDependencies;