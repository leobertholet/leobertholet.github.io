/* Scripts used by this file:
 *   - math.js (library)
 *   - groups-helper.js
 */

var groupsUn = {}; // Create namespace

// Defines group U(n) of integers modulo n under multiplication for groups.js.

// GENERAL FUNCTIONS
groupsUn.information = {
    parseName: function(string) {
        // Match Un, U_n, U(n)
        let nameRegExp = /^[Uu]_?\(?([0-9]+)\)?/;
        let match = string.match(nameRegExp);

        if (match != null) {
            let n = parseInt(match[1], 10);

            if (n >= 2) {
                return {
                    n: n
                };
            }
        }

        return null;
    }
};

groupsUn.createGroup = function(data) {
    let n = data.n;

    return {
        // GROUP DATA
        n: n,

        // GROUP PROPERTIES
        name: "Un",
        sizeData: {
            groupSize: groupsHelper.eulerPhi(n),
            ringSize: n // Number of reachable elements with ring operations
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
            return `U(${n})`;
        },

        /* Note getElement(i) returns the ith element of the group, while
         * getIndex(elt) returns the index in the entire ring, which may have
         * more elements. */
        getElement: function(index) {
            let relPrimeCount = 0;
            let i = 0;

            while (relPrimeCount <= index) {
                i++;
                if (math.gcd(i, n) == 1) {
                    relPrimeCount++;
                }
            }

            return groupsHelper.mod(i, n);
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

        evaluateInverse: function(base) {
            if (Number.isInteger(base)) {
                return math.invmod(base, n);
            }
            else return NaN;
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

        evaluateProduct: function(multiplier, multiplicand) {
            return groupsHelper.mod(multiplier * multiplicand, n);
        },

        evaluateQuotient: function(dividend, divisor) {
            return groupsHelper.mod(dividend / divisor, n);
        },

        evaluatePower: function(base, exponent) {
            return groupsHelper.mod(base ** exponent, n);
        }
    };
};
