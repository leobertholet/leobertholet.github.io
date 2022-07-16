/* Scripts used by this file:
 *   - groups-helper.js
 *   - groups-R.js
 *   - groups-B.js
 *   - groups-Zn.js
 *   - groups-Un.js
 *   - groups-Fpn.js
 *   - groups-Dn.js
 */

var groups = {}; // Define namespace

/* Provides utilities for creating and working with groups (and rings). Each
 * group's behavior is created in a separate file. The group names and object
 * names for available groups are listed below. */
groups.groupsList = [
    { name: "R", object: groupsR },
    { name: "B", object: groupsB },
    { name: "Zn", object: groupsZn },
    { name: "Un", object: groupsUn },
    { name: "Fpn", object: groupsFpn },
    { name: "Dn", object: groupsDn }
];

/* Groups (or fields, or rings) are returned by the createGroup() function,
 * which takes in the name of the group and data, a key-value pair with
 * information necessary to instantiate the group. Groups may implement the
 * following attributes and functions, based on which are valid in the
 * particular algebraic setting.
 * 
 * ===== GENERAL FUNCTIONS =====================================================
 * parseName()
 *   > Parses a string representing a group of that type and returns either the
 *     data object necessary to create that group instance, or null if the
 *     string could not be parsed successfully.
 * 
 * ===== GROUP DATA ============================================================
 * Data specific to the group type.
 * 
 * ===== GROUP PROPERTIES ======================================================
 * name
 *   > The name of the type of group. This must be included.
 * sizeData
 *   > A key-value pair {groupSize: _, ringSize: _} with the integer size of the
 *     algebraic setting considered as a group/ring. It is possible that only
 *     one key is included.
 * 
 * ===== GROUP FUNCTIONS =======================================================
 * exponentInfo(mode)
 *   > Returns information about the setting in which exponent operations should
 *     be performed. A key-value pair is returned with the groupName and
 *     groupData to create the group, and the mode to use.
 * getLatex(data)
 *   > Returns a LaTeX string representing that group based on the passed in
 *     data, excluding the outer delimiters.
 * getElement(index)
 *   > Maps index (an integer from 0 to size - 1) to an element of the group.
 * getIndex(element)
 *   > Maps group element to an index from 0 to size - 1. Note getElement(i)
 *     should return the ith element in the group, but getIndex(elt) should
 *     return the index in the entire ring, which may have more elements.
 * toString(element)
 *   > Returns a string representation of element.
 * 
 * ===== EVALUATION FUNCTIONS ==================================================
 * evaluateConstant(constant, mode)
 *   > Evaluates a constant (number) to an element of the group.
 * evaluateVector(components, mode)
 *   > Evaluates array of group elements to an element of the group. The array
 *     components is guaranteed to have at least one element.
 * evaluateInverse(base, mode)
 *   > Evaluates the inverse of an element in the group.
 * evaluatePositive(value, mode)
 *   > Evaluates the positive unary operation (+) on an element of the group.
 * evaluateNegative(value, mode)
 *   > Evaluates the negative unary operation (-) on an element of the group.
 * evaluateEquality(leftSide, rightSide, mode)
 *   > Evaluates whether leftSide and rightSide are equal in the group and
 *     returns 0 or 1, treated as a Boolean.
 * evaluateSum(summand1, summand2, mode)
 *   > Evaluates a sum in the group.
 * evaluateDifference(minuend, subtrahend, mode)
 *   > Evaluates a difference in the group.
 * evaluateProduct(multiplier, multiplicand, mode)
 *   > Evaluates a product in the group.
 * evaluateQuotient(dividend, divisor, mode)
 *   > Evaluates a quotient in the group.
 * evaluatePower(base, exponent, mode)
 *   > Evaluates a power in the group.
 */

// Creates group in list based on passed in name and data.
groups.createGroup = function(name, data) {
    // Iterate through list, look for matching name
    for (let i = 0; i < groups.groupsList.length; i++) {
        if (name == groups.groupsList[i].name) {
            // Call that group's createGroup() function
            return groups.groupsList[i].object.createGroup(data);
        }
    }

    return null; // Return null if group was not found
};

// Reads individual group name and outputs corresponding group.
groups.readGroup = function(string) {
    for (let i = 0; i < groups.groupsList.length; i++) {
        let gpInfo = groups.groupsList[i].object.information;
        if ("parseName" in gpInfo) {
            let gpData = gpInfo.parseName(string); // Extract data from string

            if (gpData != null) {
                // Create and return the group
                return groups.createGroup(groups.groupsList[i].name, gpData);
            }
        }
    }

    return null; // Return null if name could not be read
};

/* Parses string representing product group and returns array of component
 * groups. */
groups.parseGroup = function(string) {
    let substrings = string.split("x"); // Treat "x" as product symbol
    let groupsArr = [];

    // Get array of groups
    for (let i = 0; i < substrings.length; i++) {
        let gpString = substrings[i].replace(/\s+/g, "") // Strip whitespace
        let gp = groups.readGroup(gpString); // Try reading name

        if (gp != null) {
            groupsArr.push(gp); // Add group to array
        }
    }

    return groupsArr;
};

/* Gets LaTeX for product of groups passed in as an array of groups. Return null
 * if some group name cannot be represented. */
groups.getLatex = function(groupsArr) {
    latexString = "";

    for (let i = 0; i < groupsArr.length; i++) {
        let gp = groupsArr[i];

        // Return null if some group does not have LaTeX function
        if (!("getLatex" in gp)) {
            return null;
        }

        // Include product symbol in between names
        if (i > 0) {
            latexString += " \\times ";
        }
        latexString += gp.getLatex(); // Add current group name
    }

    return "\\(" + latexString + "\\)"; // Return with delimiters added
};

/* Returns a multiplication table for a group. Takes in an array of groups
 * groupsArr, treated as the Cartesian product of the groups, along with an
 * expression of variables x, y to be evaluated, an array of key-value pairs of
 * additional inputs to be used, and a mode argument for evaluation.
 * 
 * Each group must have all of the following (otherwise null is returned):
 *   - sizeData.groupSize
 *       > This determines the number of rows/columns in that group's
 *         multiplication (expression) table.
 *   - sizeData.ringSize
 *       > This determines the output size for evaluation results, i.e., the
 *         number of elements that can be reached with ring operations.
 *   - getElement()
 *       > getElement() is called on 0, 1, ..., groupSize - 1 to get the
 *         groupSize elements that are used to compute the expression in each
 *         table cell.
 *   - getIndex()
 *       > getIndex() is called on evaluation results in each cell to get the
 *         result index in the ring with ringSize elements.
 * 
 * The following are returned as keys in an object:
 *   - inputRingSizes
 *       > An array listing the ringSize of each group in groupsArr.
 *   - outputRingSizes
 *       > An array listing the ringSize of each group in the output for each
 *         table cell.
 *   - labelRow
 *       > An array containing a label row/column for the expression table,
 *         i.e., listing the operands used to compute the table. Each cell
 *         is an array of objects listing the element, its index, and its string
 *         representation, one for each member of groupsArr, where the element
 *         is the group element corresponding to the index for that group, and
 *         the index is its index within the ring (the result of calling
 *         getIndex() on it).
 *   - multTable
 *       > Returns a 2D array of cells representing evaluation results. Each
 *         cell is an array of objects as above, one for each member of
 *         groupsArr, with the element (the evaluation result) along with its
 *         index and string representation, computed for the output group. The
 *         cell at multTable[i][j] is the result of evaluating the expression
 *         with x = i and y = j, where the indices range over the possible group
 *         indices for each member of groupsArr, and indices for groups
 *         appearing earlier in the array are treated as more significant.
 */
groups.multiplicationTable = function(groupsArr, expression, inputs, mode) {
    let numGroups = groupsArr.length; // Number of groups in product
    let inputRingSizes = []; // Array of ring sizes to be returned
    let outputRingSizes = []; // Array of ring sizes to be returned
    let groupSizes = []; // Sizes of groups
    let partialProductSizes = [1]; // Sizes of partial products of first groups

    for (let i = 0; i < numGroups; i++) {
        let gp = groupsArr[i];

        // Check gp has all needed properties
        if ("sizeData" in gp && "groupSize" in gp.sizeData
            && "ringSize" in gp.sizeData && "getElement" in gp
            && "getIndex" in gp) {
            inputRingSizes.push(gp.sizeData.ringSize); // Record ring size
            groupSizes.push(gp.sizeData.groupSize); // Record group size

            // Record partial product size
            partialProductSizes.push(groupSizes[i] * partialProductSizes[i]);
        }
        else return null; // Return null if some group lacks properties
    }
    partialProductSizes.shift(); // Remove original 1 from array
    // Total size of product group
    let productSize = partialProductSizes[numGroups - 1];

    // Use partial product sizes to get period sizes
    let periodSizes = [];
    for (let i = 0; i < numGroups; i++) {
        periodSizes.push(productSize / partialProductSizes[i]);
    }

    let indicesArr = []; // Array to store index for each group in product

    // Calculate indices for each group in product
    for (let i = 0; i < productSize; i++) {
        let indices = []; // Indices to store in ith entry of indicesArr

        // Figure out index in each group
        for (j = 0; j < numGroups; j++) {
            let index = groupsHelper.mod(Math.floor(i / periodSizes[j]),
                groupSizes[j]);
            indices.push(index);
        }

        indicesArr.push(indices);
    }

    // Use indices to compute labelRow
    let labelRow = [];
    for (let i = 0; i < productSize; i++) {
        labelRowElt = [];

        for (j = 0; j < numGroups; j++) {
            let gp = groupsArr[j];
            let index = indicesArr[i][j]; // Index for group in this cell
            let elt = gp.getElement(index);
            labelRowElt.push([
                elt,
                gp.getIndex(elt),
                gp.toString(elt)
            ]);
        }

        labelRow.push(labelRowElt);
    }

    let resultType = "element"; // Declare here so can be examined later

    // Now compute the matrix of results
    let multTable = []; // Table to be returned
    let B = groupsB.createGroup(); // Create in case results are Boolean

    for (let i = 0; i < productSize; i++) {
        let row = []; // Row to be added to table

        for (let j = 0; j < productSize; j++) {
            let cell = []; // Cell of outputs for each group

            for (k = 0; k < numGroups; k++) {
                let gp = groupsArr[k];

                // Get indices for x and y
                let iIndex = indicesArr[i][k];
                let jIndex = indicesArr[j][k];

                // Get x, y elements for expression evaluation inputs
                let xElt = gp.getElement(iIndex);
                let yElt = gp.getElement(jIndex);
                // Add to passed in inputs
                inputs[k].x = xElt;
                inputs[k].y = yElt;
                
                // Evaluate result. Return null if could not be evaluated
                let result = groups.evaluate(gp, expression, inputs[k], mode);
                if (result == null) {
                    return null;
                }
                resultType = result.type; // Declared earlier
                let resultValue = result.value;

                // Add result and corresponding index to cell
                if (resultType == "boolean") {
                    cell.push([
                        resultValue,
                        B.getIndex(resultValue),
                        B.toString(resultValue)
                    ]);
                }
                else {
                    cell.push([
                        resultValue,
                        gp.getIndex(resultValue),
                        gp.toString(resultValue)
                    ]);
                }
            }

            row.push(cell); // Add cell to row
        }

        multTable.push(row); // Add row to table
    }

    // Determine outputRingSizes based on output type
    if (resultType == "boolean") {
        let sizeB = B.sizeData.ringSize;
        outputRingSizes = new Array(numGroups).fill(sizeB);
    }
    else outputRingSizes = inputRingSizes;

    return {
        inputRingSizes: inputRingSizes,
        outputRingSizes: outputRingSizes,
        labelRow: labelRow,
        multTable: multTable
    };
};

/* Evaluates the expression (as returned by the parser in math-parser.js) in gp
 * with given mode "group" or "ring", which may be ignored for some groups.
 * Inputs are key-value pairs like {"x": 1, "y": 2, ...} assigning character
 * strings to elements of the group. Performs partial evaluation, so expressions
 * are returned evaluated as far as they can be. Fully evaluated expressions are
 * returned as expressions of type "element" with "value" being the evaluation
 * output, or as type "boolean" for the results of Boolean operations like
 * equality checks. */
groups.partialEvaluate = function(gp, expression, inputs, mode) {
    let type = expression.type; // Expression type
    let B = groupsB.createGroup(); // Create for Boolean operations

    // Evaluate constant (a number) to group element
    if (type == "constant") {
        let constant = expression.constant;
        if ("evaluateConstant" in gp) {
            return {
                type: "element",
                value: gp.evaluateConstant(constant, mode)
            }
        }
    }
    // Evaluate variable
    else if (type == "variable") {
        let variable = expression.variable;

        if (variable in inputs) {
            return {
                type: "element",
                value: inputs[variable]
            }
        }
    }
    // Evaluate vector
    else if (type == "vector") {
        // First evaluate components
        let initComponents = expression.components;
        let components = []; // Evaluated components
        // Whether all components could be evaluated to elements
        let allEvaluated = true;

        for (let i = 0; i < initComponents.length; i++) {
            let component = groups.partialEvaluate(gp, initComponents[i],
                inputs, mode);
            components.push(component);

            if (component.type != "element") {
                allEvaluated = false;
            }
        }

        // Then evaluate vector to group element, or return partially evaluated
        if (allEvaluated && "evaluateVector" in gp && components.length >= 1) {
            // Array of component element values
            let componentValues = [];

            for (i = 0; i < components.length; i++) {
                componentValues.push(components[i].value);
            }

            return {
                type: "element",
                value: gp.evaluateVector(componentValues, mode)
            };
        }
        else {
            return {
                type: "vector",
                value: components
            }
        }
    }
    // Evaluate inverse
    else if (type == "inverse") {
        let base = groups.partialEvaluate(gp, expression.base, inputs, mode);

        if (base.type == "element" && "evaluateInverse" in gp) {
            return {
                type: "element",
                value: gp.evaluateInverse(base.value, mode)
            };
        }
        else if (base.type == "boolean") {
            return {
                type: "boolean",
                value: B.evaluateInverse(base.value)
            };
        }
        else {
            return {
                type: "inverse",
                base: base
            };
        }
    }
    // Evaluate positive operation
    else if (type == "positive") {
        let value = groups.partialEvaluate(gp, expression.value, inputs, mode);

        if (value.type == "element" && "evaluatePositive" in gp) {
            return {
                type: "element",
                value: gp.evaluatePositive(value.value, mode)
            };
        }
        else if (value.type == "boolean") {
            return {
                type: "boolean",
                value: B.evaluatePositive(value.value)
            };
        }
        else {
            return {
                type: "positive",
                value: value
            };
        }
    }
    // Evaluate negative operation
    else if (type == "negative") {
        let value = groups.partialEvaluate(gp, expression.value, inputs, mode);

        if (value.type == "element" && "evaluateNegative" in gp) {
            return {
                type: "element",
                value: gp.evaluateNegative(value.value, mode)
            };
        }
        else if (value.type == "boolean") {
            return {
                type: "boolean",
                value: B.evaluateNegative(value.value)
            };
        }
        else {
            return {
                type: "negative",
                value: value
            };
        }
    }
    // Evaluate equality
    else if (type == "equality") {
        let leftSide = groups.partialEvaluate(gp, expression.leftSide, inputs,
            mode);
        let rightSide = groups.partialEvaluate(gp, expression.rightSide, inputs,
            mode);

        if (leftSide.type == "element" && rightSide.type == "element"
            && "evaluateEquality" in gp) {
            return {
                type: "boolean",
                value: gp.evaluateEquality(leftSide.value, rightSide.value,
                    mode)
            };
        }
        else if (leftSide.type == "boolean" && rightSide.type == "boolean") {
            return {
                type: "boolean",
                value: B.evaluateEquality(leftSide.value, rightSide.value)
            };
        }
        else {
            return {
                type: "equality",
                leftSide: leftSide,
                rightSide: rightSide
            };
        }
    }
    // Evaluate sum
    else if (type == "sum") {
        let summand1 = groups.partialEvaluate(gp, expression.summand1, inputs,
            mode);
        let summand2 = groups.partialEvaluate(gp, expression.summand2, inputs,
            mode);

        if (summand1.type == "element" && summand2.type == "element"
            && "evaluateSum" in gp) {
            return {
                type: "element",
                value: gp.evaluateSum(summand1.value, summand2.value, mode)
            };
        }
        else if (summand1.type == "boolean" && summand2.type == "boolean") {
            return {
                type: "boolean",
                value: B.evaluateSum(summand1.value, summand2.value)
            };
        }
        else {
            return {
                type: "sum",
                summand1: summand1,
                summand2: summand2
            };
        }
    }
    // Evaluate difference
    else if (type == "difference") {
        let minuend = groups.partialEvaluate(gp, expression.minuend, inputs,
            mode);
        let subtrahend = groups.partialEvaluate(gp, expression.subtrahend,
            inputs, mode);

        if (minuend.type == "element" && subtrahend.type == "element"
            && "evaluateDifference" in gp) {
            return {
                type: "element",
                value: gp.evaluateDifference(minuend.value, subtrahend.value,
                    mode)
            };
        }
        else {
            return {
                type: "difference",
                minuend: minuend,
                subtrahend: subtrahend
            };
        }
    }
    // Evaluate product
    else if (type == "product") {
        let multiplier = groups.partialEvaluate(gp, expression.multiplier,
            inputs, mode);
        let multiplicand = groups.partialEvaluate(gp, expression.multiplicand,
            inputs, mode);

        if (multiplier.type == "element" && multiplicand.type == "element"
            && "evaluateProduct" in gp) {
            return {
                type: "element",
                value: gp.evaluateProduct(multiplier.value, multiplicand.value,
                    mode)
            };
        }
        else if (multiplier.type == "boolean"
                && multiplicand.type == "boolean") {
            return {
                type: "boolean",
                value: B.evaluateProduct(multiplier.value, multiplicand.value)
            };
        }
        else {
            return {
                type: "product",
                multiplier: multiplier,
                multiplicand: multiplicand
            };
        }
    }
    // Evaluate quotient
    else if (type == "quotient") {
        let dividend = groups.partialEvaluate(gp, expression.dividend, inputs,
            mode);
        let divisor = groups.partialEvaluate(gp, expression.divisor, inputs,
            mode);

        if (dividend.type == "element" && divisor.type == "element"
            && "evaluateQuotient" in gp) {
            return {
                type: "element",
                value: gp.evaluateQuotient(dividend.value, divisor.value, mode)
            };
        }
        else {
            return {
                type: "quotient",
                dividend: dividend,
                divisor: divisor
            };
        }
    }
    // Evaluate power
    else if (type == "power") {
        let base = groups.partialEvaluate(gp, expression.base, inputs, mode);
        /* Note exponent may not be evaluated in the same group, so we call a
         * separate function for this purpose. */
        let exponent = groups.partialEvaluateExponent(gp, expression.exponent,
            inputs, mode);

        if (base.type == "element" && exponent.type == "element"
            && "evaluatePower" in gp) {
            return {
                type: "element",
                value: gp.evaluatePower(base.value, exponent.value, mode)
            };
        }
        else {
            return {
                type: "power",
                base: base,
                exponent: exponent
            };
        }
    }

    /* Otherwise just return the expression. This catches the case where type is
     * "element". */
    return expression;
};

/* Partially evaluates exponents for a group, which may take place in a
 * different setting than gp. */
groups.partialEvaluateExponent = function(gp, exponent, inputs, mode) {
    if ("exponentInfo" in gp) {
        /* If the group provides exponentInfo, use it to instantiate the group
         * setting for the exponent and partially evaluate there */
        let exponentInfo = gp.exponentInfo(mode);
        let exponentGroup = groups.createGroup(exponentInfo.groupName,
            exponentInfo.groupData);
        return groups.partialEvaluate(exponentGroup, exponent, inputs,
            exponentInfo.mode);
    }
    else return exponent; // Otherwise just return the original expression
};

/* Calls partialEvaluate() to evaluate an expression and returns either the
 * fully evaluated result along with its type or null. */
groups.evaluate = function(gp, expression, inputs, mode) {
    let partialEval = groups.partialEvaluate(gp, expression, inputs, mode);
    if (partialEval.type == "element" || partialEval.type == "boolean") {
        return partialEval;
    }
    else return null;
};
