var groupsR = {}; // Create namespace

// Defines group R of real numbers for groups.js.

// GENERAL FUNCTIONS
groupsR.information = {
    parseName: function(string) {
        // Match R
        let nameRegExp = /^[Rr]/;

        if (string.match(nameRegExp) != null) {
            return {};
        }
        else return null;
    }
};

groupsR.createGroup = function() {
    return {
        // GROUP DATA
        // No data for R
        
        // GROUP PROPERTIES
        name: "R",

        // GROUP FUNCTIONS
        exponentInfo: function() {
            return {
                groupName: "R",
                groupData: {},
                mode: "ring"
            };
        },

        getLatex: function() {
            return "\\mathbb{R}";
        },

        // EVALUATION FUNCTIONS
        evaluateConstant: function(constant) {
            return constant;
        },

        evaluateVector(components) {
            return components[0];
        },

        evaluateInverse: function(base) {
            return 1 / base;
        },

        evaluatePositive: function(value) {
            return value;
        },

        evaluateNegative: function(value) {
            return -1 * value;
        },

        evaluateEquality(leftSide, rightSide) {
            if (leftSide == rightSide) {
                return 1;
            }
            else return 0;
        },

        evaluateSum: function(summand1, summand2) {
            return summand1 + summand2;
        },

        evaluateDifference: function(minuend, subtrahend) {
            return minuend - subtrahend;
        },

        evaluateProduct: function(multiplier, multiplicand) {
            return multiplier * multiplicand;
        },

        evaluateQuotient: function(dividend, divisor) {
            return dividend / divisor;
        },

        evaluatePower: function(base, exponent) {
            return base ** exponent;
        }
    };
};
