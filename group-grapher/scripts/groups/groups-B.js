var groupsB = {}; // Create namespace

// Defines Boolean semifield B for groups.js.

// GENERAL FUNCTIONS
groupsB.information = {
    parseName: function(string) {
        // Match R
        let nameRegExp = /^[Bb]/;
        
        if (string.match(nameRegExp) != null) {
            return {};
        }
        else return null;
    }
};

groupsB.createGroup = function() {
    return {
        // GROUP DATA
        // No data for B

        // GROUP PROPERTIES
        name: "B",
        sizeData: {
            groupSize: 2,
            ringSize: 2
        },

        // GROUP FUNCTIONS
        getLatex: function() {
            return `\\mathcal{B}`;
        },

        getElement: function(index) {
            return index;
        },

        getIndex: function(element) {
            return element;
        },

        toString: function(element) {
            if (element == 0) {
                return "false";
            }
            else return "true";
        },

        // EVALUATION FUNCTIONS
        evaluateConstant: function(constant) {
            if (constant == 0) {
                return 0;
            }
            else return 1;
        },

        evaluateVector(components) {
            return components[0];
        },

        // NOT
        evaluateInverse: function(base) {
            return 1 - base;
        },

        evaluatePositive: function(value) {
            return value;
        },

        // Also NOT
        evaluateNegative: function(value) {
            return 1 - value;
        },

        evaluateEquality(leftSide, rightSide) {
            if (leftSide == rightSide) {
                return 1;
            }
            else return 0;
        },

        // OR
        evaluateSum: function(summand1, summand2) {
            return Math.max(summand1, summand2);
        },

        // AND
        evaluateProduct: function(multiplier, multiplicand) {
            return multiplier * multiplicand;
        }
    };
};
