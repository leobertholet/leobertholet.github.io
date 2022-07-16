/* Scripts used by this file:
 *   - math.js (library)
 *   - groups-helper.js
 */

var groupsZn = {}; // Create namespace

// Defines group Z/n of integers modulo n for groups.js.

// GENERAL FUNCTIONS
groupsZn.information = {
    parseName: function(string) {
        // Match Zn, Z_n, Z/n, Z/nZ, or Z/(n)
        let nameRegExp = /^[Zz][_\/]?\(?([0-9]+)[Zz]?\)?/;
        let match = string.match(nameRegExp);

        if (match != null) {
            let n = parseInt(match[1], 10);

            if (n >= 1) {
                return {
                    n: n
                };
            }
        }

        return null;
    }
};

groupsZn.createGroup = function(data) {
    let n = data.n;

    return {
        // GROUP DATA
        n: n,

        // GROUP PROPERTIES
        name: "Zn",
        sizeData: {
            groupSize: n,
            ringSize: n
        },

        // GROUP FUNCTIONS
        exponentInfo: function() {
            return {
                groupName: "R",
                groupData: {},
                mode: "ring"
            };
        },

        getLatex: function() {
            return `\\mathbb{Z}_{${n}}`;
        },

        getElement: function(index) {
            return groupsHelper.mod(index, n);
        },

        getIndex: function(element) {
            return element;
        },

        toString: function(element) {
            return element.toString().substring(0, 5);
        },

        // EVALUATION FUNCTIONS
        evaluateConstant: function(constant) {
            return groupsHelper.mod(constant, n);
        },

        evaluateVector(components) {
            return components[0];
        },

        evaluateInverse: function(base, mode) {
            if (mode == "group") {
                return groupsHelper.mod(-1 * base, n);
            }
            else {
                if (Number.isInteger(base)) {
                    return math.invmod(base, n);
                }
                else return NaN;
            }
        },

        evaluatePositive: function(value) {
            return groupsHelper.mod(value, n);
        },

        evaluateNegative: function(value) {
            return groupsHelper.mod(-1 * value, n);
        },

        evaluateEquality(leftSide, rightSide) {
            if (groupsHelper.mod(leftSide, n)
                    == groupsHelper.mod(rightSide, n)) {
                return 1;
            }
            else return 0;
        },

        evaluateSum: function(summand1, summand2) {
            return groupsHelper.mod(summand1 + summand2, n);
        },

        evaluateDifference: function(minuend, subtrahend) {
            return groupsHelper.mod(minuend - subtrahend, n);
        },

        evaluateProduct: function(multiplier, multiplicand, mode) {
            if (mode == "group") {
                return groupsHelper.mod(multiplier + multiplicand, n);
            }
            else return groupsHelper.mod(multiplier * multiplicand, n);
        },

        evaluateQuotient: function(dividend, divisor) {
            return groupsHelper.mod(dividend / divisor, n);
        },

        evaluatePower: function(base, exponent, mode) {
            if (mode == "group") {
                return groupsHelper.mod(base * exponent, n);
            }
            else return groupsHelper.mod(base ** exponent, n);
        }
    };
};
