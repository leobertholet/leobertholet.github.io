/* Scripts used by this file:
 *   - math.js (library)
 *   - groups-helper.js
 */

var groupsFpn = {}; // Create namespace

// Defines finite field F_p[x]/(q) of order p^n for groups.js.

// GENERAL FUNCTIONS
groupsFpn.information = {
    parseName: function(string) {
        // Match F_p(t)/([#, ..., #]) and variations
        let nameRegExp = new RegExp(/^[Ff]_?(\-?[0-9]+)\[?\(?t?\)?\]?\/?/.source
            + /\(?\[([\-0-9,]+)\]\)?/.source);
        let match = string.match(nameRegExp);

        if (match != null) {
            let p = parseInt(match[1], 10);
            let qData = match[2].split(",");
            let q = [];

            for (let i = 0; i < qData.length; i++) {
                let coeff = parseInt(qData[i], 10);
                if (!isNaN(coeff)) {
                    q.push(groupsHelper.mod(coeff, p));
                }
                else return null;
            }

            q = groupsHelper.stripLeadingZeros(q);

            if (p >= 2 && math.isPrime(p) && q.length >= 3) {
                return {
                    p: p,
                    q: q
                };
            }
        }

        return null;
    }
};

groupsFpn.createGroup = function(data) {
    let p = data.p;
    let q = data.q; // Quotient polynomial
    let n = q.length - 1; // Largest exponent in polynomial

    return {
        // GROUP DATA
        p: p,
        q: q,
        n: n,

        // GROUP PROPERTIES
        name: "Fpn",
        sizeData: {
            groupSize: p ** n,
            ringSize: p ** n
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
            let qStrings = [];
            q.forEach(function(coeff, i) {
                if (coeff != 0) {
                    qStrings.push([coeff.toString(), i]);
                }
            });

            let qString = "";
            qStrings.forEach(function(str, i) {
                if (i > 0) {
                    qString = "+" + qString;
                }

                let exp = str[1];
                let exponentTerm = `t^{${exp}}`;
                if (exp == 1) {
                    exponentTerm = "t";
                }
                else if (exp == 0) {
                    exponentTerm = "";
                }

                let coeff = str[0];
                if (exp > 0 && coeff == "1") {
                    coeff = "";
                }

                qString = coeff + exponentTerm + qString;
            });

            return `\\mathbb{F}_{${p}}[t]/(${qString})`;
        },

        getElement: function(index) {
            let element = [];

            for (let i = 0; i < n; i++) {
                element.push(groupsHelper.mod(Math.floor(
                    index / (p ** (n - 1 - i))), p));
            }
            return element;
        },

        getIndex: function(element) {
            let index = 0;

            for (let i = 0; i < element.length; i++) {
                index += element[i] * (p ** (n - 1 - i));
            }
            return index;
        },

        toString: function(element) {
            let returnString = "";

            for (let i = 0; i < n; i++) {
                if (i < element.length) {
                    returnString += element[i].toString().substring(0, 5);
                }
                else returnString += "0";

                if (i < n - 1) {
                    returnString += ", ";
                }
            }

            return "[" + returnString + "]";
        },

        // EVALUATION FUNCTIONS
        evaluateConstant: function(constant) {
            let elt = [groupsHelper.mod(constant, p)];
            for (let i = 0; i < n - 1; i++) {
                elt.push(0);
            }

            return elt;
        },

        /* Note - members of components are themselves group elements, i.e.,
         * they are arrays. */
        evaluateVector(components) {
            let sum = new Array(n).fill(0);
            let currGp = this;

            components.forEach(function(elt, i) {
                let term = currGp.evaluateProduct(elt,
                    groupsHelper.basisArr(components.length, i));
                sum = currGp.evaluateSum(sum, term);
            });

            return sum;
        },

        evaluatePositive: function(value) {
            return value;
        },

        evaluateNegative: function(value) {
            return groupsHelper.modComponents(value.map(x => -x), p);
        },

        /* Note - assumes left and right side have been evaluated to vectors of
         * length at most n. */
        evaluateEquality(leftSide, rightSide) {
            let leftLen = leftSide.length;
            let rightLen = rightSide.length;

            let equal = true;

            for (let i = 0; i < n; i++) {
                let leftValue = 0;
                if (i < leftLen) {
                    leftValue = groupsHelper.mod(leftSide[i], p);
                }
                let rightValue = 0;
                if (i < rightLen) {
                    rightValue = groupsHelper.mod(rightSide[i], p);
                }

                equal = equal && (leftValue == rightValue);
            }

            if (equal == true) {
                return 1;
            }
            else return 0;
        },

        evaluateSum: function(summand1, summand2) {
            return groupsHelper.modComponents(groupsHelper.addArrays(summand1,
                summand2), p);
        },

        evaluateDifference: function(minuend, subtrahend) {
            let negSubtrahend = this.evaluateNegative(subtrahend);
            return this.evaluateSum(minuend, negSubtrahend);
        },
    
        evaluateProduct: function(multiplier, multiplicand) {
            let product = groupsHelper.polyProduct(multiplier, multiplicand);
            product = product.map(x => groupsHelper.mod(x, p));
            
            return groupsHelper.polyDivide(product, q, p).remainder;
        },

        evaluatePower: function(base, exponent) {
            let result = groupsHelper.basisArr(1, 0);

            if (exponent >= 0) {
                for (let i = 0; i < exponent; i++) {
                    result = this.evaluateProduct(result, base);
                }
            }
            else if (exponent < 0) {
                result = NaN; // Not computing this
            }

            return result;
        }
    };
};
