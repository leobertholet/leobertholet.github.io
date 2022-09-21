/* Scripts used by this file:
 *   - groups-helper.js
 */

var groupsDn = {}; // Create namespace

/* Defines dihedral group Dn of the symmetry group of a regular n-gon in the
 * plane. Positive numbers are forward rotations, while negative numbers are a
 * flip followed by a forward rotation. */

// GENERAL FUNCTIONS
groupsDn.information = {
    parseName: function(string) {
        // Match Dn, D_n, D(n)
        let nameRegExp = /^[Dd]_?\(?([0-9]+)\)?/;
        let match = string.match(nameRegExp);

        if (match != null) {
            let n = parseInt(match[1], 10);

            if (n >= 3) {
                return {
                    n: n
                };
            }
        }

        return null;
    }
};

groupsDn.createGroup = function(data) {
    let n = data.n;

    return {
        // GROUP DATA
        n: n,

        // GROUP PROPERTIES
        name: "Dn",
        sizeData: {
            groupSize: 2 * n,
            ringSize: 2 * n // Note only has group operations
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
            return `D_{${n}}`;
        },

        /* The elements are ordered as 0, ..., n - 1, -1, ..., -n. */
        getElement: function(index) {
            index = groupsHelper.mod(index, 2 * n);

            if (index < n) {
                return index;
            }
            else return -(index - (n - 1));
        },

        getIndex: function(element) {
            if (element >= 0) {
                return element;
            }
            else return n - 1 - element;
        },

        // H meaning flip about horizontal axis
        toString: function(element) {
            if (element >= 0) {
                return `${element}`;
            }
            else return `${-element - 1}H`;
        },

        // EVALUATION FUNCTIONS
        evaluateConstant: function(constant) {
            if (!Number.isInteger(constant)) {
                return NaN;
            }
            if (constant >= 0) {
                return groupsHelper.mod(constant, n);
            }
            else return -groupsHelper.mod(-constant - 1, n) - 1;
        },

        evaluateVector(components) {
            return components[0];
        },

        evaluateInverse: function(base) {
            if (!Number.isInteger(base)) {
                return NaN;
            }

            if (base >= 0) {
                return groupsHelper.mod(n - base, n);
            }
            else return base;
        },

        evaluatePositive: function(value) {
            if (!Number.isInteger(value)) {
                return NaN;
            }

            return groupsHelper.mod(value, n);
        },

        // Note - not the inverse
        evaluateNegative: function(value) {
            if (!Number.isInteger(value)) {
                return NaN;
            }
            /* In case expression was negative with multiple of n, which gets
             * converted to 0. */
            if (value == 0) {
                return -n;
            }

            return this.evaluateConstant(-value);
        },

        evaluateEquality(leftSide, rightSide) {
            if (!Number.isInteger(leftSide) || !Number.isInteger(rightSide)) {
                return NaN;
            }

            if (this.evaluateConstant(leftSide)
                    == this.evaluateConstant(rightSide)) {
                return 1;
            }
            else return 0;
        },

        // Not the group operation - just a regular sum
        evaluateSum: function(summand1, summand2) {
            if (!Number.isInteger(summand1) || !Number.isInteger(summand2)) {
                return NaN;
            }

            return this.evaluateConstant(summand1 + summand2);
        },

        // Also not the group operation
        evaluateDifference: function(minuend, subtrahend) {
            if (!Number.isInteger(minuend) || !Number.isInteger(subtrahend)) {
                return NaN;
            }

            return this.evaluateConstant(minuend - subtrahend);
        },

        // The group operation
        evaluateProduct: function(multiplier, multiplicand) {
            if (!Number.isInteger(multiplier)
                    || !Number.isInteger(multiplicand)) {
                return NaN;
            }

            if (multiplier >= 0 && multiplicand >= 0) {
                return this.evaluateConstant(multiplier + multiplicand);
            }
            else if (multiplier >= 0 && multiplicand < 0) {
                return this.evaluateConstant(multiplicand - multiplier);
            }
            else if (multiplier < 0 && multiplicand >= 0) {
                return this.evaluateConstant(multiplier + multiplicand - n);
            }
            else if (multiplier < 0 && multiplicand < 0) {
                let i = -(multiplier + 1);
                let j = -(multiplicand + 1);

                return this.evaluateConstant(i - j + n);
            }
        },

        evaluatePower: function(base, exponent) {
            if (!Number.isInteger(base)) {
                return NaN;
            }

            result = 0;
            for (let i = 0; i < Math.abs(exponent); i++) {
                result = this.evaluateProduct(result, base);
            }
            if (exponent < 0) {
                result = this.evaluateInverse(result);
            }

            return result;
        }
    };
};
