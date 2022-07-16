var mathParser = {}; // Define namespace

/* Tokenizes and parses math expressions. Equality is the most general type of
 * expression and allows one equal sign only. Provides function to convert
 * expressions to LaTeX.
 * 
 * ===== PARSE TREE ============================================================
 *      expression  ->  equality
 *        equality  ->  sum = sum  |  sum
 *             sum  ->  sum + difference  |  difference
 *      difference  ->  difference - unary  |  unary
 *           unary  ->  [+-]unary  |  product
 *         product  ->  product * implicitProduct  |  implicitProduct
 * implicitProduct  ->  implicitProduct quotient  |  quotient
 *        quotient  ->  quotient / power  |  power
 *           power  ->  inverse ^ power  |  inverse
 *         inverse  ->  inverse'  |  parentheses  |  vector
 *     parentheses  ->  (expression)  |  terminal
 *          vector  ->  [expression, ..., expression]  |  terminal
 *        terminal  ->  variable  |  number
 */

/* Tokenizes string for parsing. Tokens are symbols, variables, or numbers.
 * Returns array of tokens, or null if invalid string. */
mathParser.tokenize = function(string) {
    // If empty string, return no tokens
    if (string == "") {
        return [];
    }
    
    let firstChar = string[0]; // First character
    let nextChars = string.slice(1); // Rest of string

    // Acceptable math symbols
    let symbols = ["=", "+", "-", "*", "/", "^", "(", ")", "'", "[", "]", ","];

    // Remove spaces
    if (firstChar == " ") {
        return mathParser.tokenize(nextChars);
    }
    // Interpret any letter as variable
    else if (firstChar.match(/[a-zA-Z]/)) {
        let tokens = mathParser.tokenize(nextChars);

        if (tokens != null) {
            return [["variable", firstChar]].concat(tokens);
        }
        else return null;
    }
    // Check if character is acceptable symbol
    else if (symbols.includes(firstChar)) {
        let tokens = mathParser.tokenize(nextChars);

        if (tokens != null) {
            return [["symbol", firstChar]].concat(tokens);
        }
        else return null;
    }

    // Otherwise check if first characters match number
    let match = string.match(/^(([0-9]+\.?[0-9]*)|([0-9]*\.?[0-9]+))/);
    if (match != null) {
        let numberString = match[0];
        let tokens = mathParser.tokenize(string.slice(numberString.length));

        if (tokens != null) {
            return [["number", Number(numberString)]].concat(tokens);
        }
        else return null;
    }
    else return null; // Invalid string
};

/* Parse expression. Return array with parsed expression as first component and
 * set of variable names as second component. */
mathParser.parseExpression = function(tokens) {
    return mathParser.parseEquality(tokens); // Parse as sum
};

// Parse equality.
mathParser.parseEquality = function(tokens) {
    let len = tokens.length;

    // Go from right to left
    for (let i = len - 1; i >= 0; i--) {
        let token = tokens[i];

        // Check if current token is "="
        if (token[0] == "symbol" && token[1] == "=") {
            // Parse operands
            let leftSide = mathParser.parseSum(tokens.slice(0, i));
            let rightSide = mathParser.parseSum(tokens.slice(
                i + 1, len));

            // If valid operands, return expression
            if (leftSide != null && rightSide != null) {
                return [
                    {
                        type: "equality",
                        leftSide: leftSide[0],
                        rightSide: rightSide[0]
                    },
                    new Set([...leftSide[1], ...rightSide[1]])
                ];
            }
        }
    }

    return mathParser.parseSum(tokens); // Otherwise parse as expression
};

/* Parse sum. Note "+" in front of an expression (positive) will be parsed
 * later. */
mathParser.parseSum = function(tokens) {
    let len = tokens.length;

    // Go from right to left
    for (let i = len - 1; i >= 0; i--) {
        let token = tokens[i];

        // Check if current token is "+"
        if (token[0] == "symbol" && token[1] == "+") {
            // Parse operands
            let summand1 = mathParser.parseSum(tokens.slice(0, i));
            let summand2 = mathParser.parseDifference(tokens.slice(i + 1, len));

            // If valid operands, return expression
            if (summand1 != null && summand2 != null) {
                return [
                    {
                        type: "sum",
                        summand1: summand1[0],
                        summand2: summand2[0]
                    },
                    new Set([...summand1[1], ...summand2[1]])
                ];
            }
        }
    }

    return mathParser.parseDifference(tokens); // Otherwise parse as difference
};

/* Parse difference. Note "-" in front of an expression (negative) will be
 * parsed later. */
mathParser.parseDifference = function(tokens) {
    let len = tokens.length;

    // Go from right to left
    for (let i = len - 1; i >= 0; i--) {
        let token = tokens[i];

        // Check if current symbol is "-"
        if (token[0] == "symbol" && token[1] == "-") {
            // Parse operands
            let minuend = mathParser.parseDifference(tokens.slice(0, i));
            let subtrahend = mathParser.parseUnary(tokens.slice(i + 1, len));

            // If valid operands, return expression
            if (minuend != null && subtrahend != null) {
                return [
                    {
                        type: "difference",
                        minuend: minuend[0],
                        subtrahend: subtrahend[0]
                    },
                    new Set([...minuend[1], ...subtrahend[1]])
                ];
            }
        }
    }

    return mathParser.parseUnary(tokens); // Otherwise parse as unary
};

// Parse unary operations - positive and negative signs.
mathParser.parseUnary = function(tokens) {
    let len = tokens.length;

    if (len > 1) {
        let token = tokens[0];

        // Check leftmost symbol
        if (token[0] == "symbol" && (token[1] == "-" || token[1] == "+")) {
            // Parse operand
            let value = mathParser.parseUnary(tokens.slice(1, len));

            // If operand valid, return correct expression
            if (value != null) {
                if (token[1] == "-") {
                    return [
                        {
                            type: "negative",
                            value: value[0]
                        },
                        value[1]
                    ];
                }
                else if (token[1] == "+") {
                    return [
                        {
                            type: "positive",
                            value: value[0]
                        },
                        value[1]
                    ];
                }
            }
        }
    }

    return mathParser.parseProduct(tokens); // Otherwise parse as product
};

// Parse product expressions with "*" symbol.
mathParser.parseProduct = function(tokens) {
    let len = tokens.length;

    // Go from right to left
    for (let i = len - 1; i >= 0; i--) {
        let token = tokens[i];

        // Check if current symbol is "*"
        if (token[0] == "symbol" && token[1] == "*") {
            // Parse operands
            let multiplier = mathParser.parseProduct(tokens.slice(0, i));
            let multiplicand = mathParser.parseImplicitProduct(
                tokens.slice(i + 1, len));

            // If valid operands, return expression
            if (multiplier != null && multiplicand != null) {
                return [
                    {
                        type: "product",
                        multiplier: multiplier[0],
                        multiplicand: multiplicand[0],
                    },
                    new Set([...multiplier[1], ...multiplicand[1]])
                ];
            }
        }
    }

    // Otherwise parse as implicitProduct
    return mathParser.parseImplicitProduct(tokens);
};

// Parse product expressions with no multiplication symbol.
mathParser.parseImplicitProduct = function(tokens) {
    let len = tokens.length;

    // Go from right to left
    for (let i = len - 1; i > 0; i--) {
        let left_token = tokens[i - 1];
        let right_token = tokens[i];

        // Check if symbol combinations are valid for implicit multiplication.
        if ((left_token[0] == "number" || left_token[0] == "variable"
                    || (left_token[0] == "symbol" && left_token[1] == ")")
                    || (left_token[0] == "symbol" && left_token[1] == "'")
                    || (left_token[0] == "symbol" && left_token[1] == "]"))
                && (right_token[0] == "number" || right_token[0] == "variable"
                    || (right_token[0] == "symbol" && right_token[1] == "(")
                    || (right_token[0] == "symbol" && right_token[1] == "["))) {
            // Parse operands
            let multiplier = mathParser.parseImplicitProduct(
                tokens.slice(0, i));
            let multiplicand = mathParser.parseQuotient(tokens.slice(i, len));

            // If valid operands, return expression
            if (multiplier != null && multiplicand != null) {
                return [
                    {
                        type: "product",
                        multiplier: multiplier[0],
                        multiplicand: multiplicand[0],
                        // Include additional info for LaTeX display
                        productType: "implicit"
                    },
                    new Set([...multiplier[1], ...multiplicand[1]])
                ];
            }
        }
    }

    return mathParser.parseQuotient(tokens); // Otherwise parse as quotient
};

// Parse division.
mathParser.parseQuotient = function(tokens) {
    let len = tokens.length;

    // Go from right to left
    for (let i = len - 1; i >= 0; i--) {
        let token = tokens[i];

        // Check if current symbol is "/"
        if (token[0] == "symbol" && token[1] == "/") {
            // Parse operands
            let dividend = mathParser.parseQuotient(tokens.slice(0, i));
            let divisor = mathParser.parsePower(tokens.slice(i + 1, len));

            // If valid operands, return expression
            if (dividend != null && divisor != null) {
                return [
                    {
                        type: "quotient",
                        dividend: dividend[0],
                        divisor: divisor[0]
                    },
                    new Set([...dividend[1], ...divisor[1]])
                ];
            }
        }
    }

    return mathParser.parsePower(tokens); // Otherwise parse as power
};

// Parse exponents.
mathParser.parsePower = function(tokens) {
    let len = tokens.length;

    // Go from left to right
    for (let i = 0; i < len; i++) {
        let token = tokens[i];

        // Check if current symbol is "^"
        if (token[0] == "symbol" && token[1] == "^") {
            // Parse operands
            let base = mathParser.parseInverse(tokens.slice(0, i));
            let exponent = mathParser.parsePower(tokens.slice(i + 1, len));

            // If valid operands, return expression
            if (base != null && exponent != null) {
                return [
                    {
                        type: "power",
                        base: base[0],
                        exponent: exponent[0]
                    },
                    new Set([...base[1], ...exponent[1]])
                ];
            }
        }
    }
    
    return mathParser.parseInverse(tokens); // Otherwise parse as inverse
};

// Parse modular inverse ("'" symbol).
mathParser.parseInverse = function(tokens) {
    let len = tokens.length;

    // Go from right to left
    if (len > 1) {
        let token = tokens[len - 1];

        // Check if current symbol is "'"
        if (token[0] == "symbol" && token[1] == "'") {
            // Parse operand
            let base = mathParser.parseInverse(tokens.slice(0, len - 1));

            // If valid operand, return expression
            if (base != null) {
                return [
                    {
                        type: "inverse",
                        base: base[0]
                    },
                    base[1]
                ];
            }
        }
    }
    
    // Otherwise parse as parentheses or vector
    if (len > 0 && tokens[0][0] == "symbol" && tokens[0][1] == "(") {
        return mathParser.parseParentheses(tokens);
    }
    else return mathParser.parseVector(tokens);
};

// Parse parentheses expression.
mathParser.parseParentheses = function(tokens) {
    let len = tokens.length;

    if (len >= 2) {
        let firstToken = tokens[0];
        let lastToken = tokens[len - 1];

        // Check leftmost and rightmost symbols are "(", ")"
        if (firstToken[0] == "symbol" && firstToken[1] == "("
                && lastToken[0] == "symbol" && lastToken[1] == ")") {
            // Parse operand
            let innerExpression = mathParser.parseExpression(
                tokens.slice(1, len - 1));

            // If valid operand, return expression
            if (innerExpression != null) {
                // Add info to innerExpression for LaTeX display
                innerExpression[0].delimiters = "parentheses";
                return innerExpression;
            }
        }
    }
    
    return mathParser.parseTerminal(tokens); // Otherwise parse as terminal
};

// Parses vectors of form "[_, _, ...]".
mathParser.parseVector = function(tokens) {
    let len = tokens.length;

    if (len >= 2) {
        let firstToken = tokens[0];
        let lastToken = tokens[len - 1];

        // Check leftmost and rightmost symbols are "[", "]"
        if (firstToken[0] == "symbol" && firstToken[1] == "["
                && lastToken[0] == "symbol" && lastToken[1] == "]") {
            // List of comma, bracket positions around elements
            let commaPositions = [0]; // Opening bracket

            // Look for commas in tokens
            for (let i = 1; i < len - 1; i++) {
                if (tokens[i][0] == "symbol" && tokens[i][1] == ",") {
                    commaPositions.push(i);
                }
            }
            commaPositions.push(len - 1); // Closing bracket

            // Parse vector components between commas
            let components = [];
            let variables = new Set();
            let componentsValid = true; // Check all components can be parsed
            for (let i = 0; i < commaPositions.length - 1; i++) {
                let startCommaPos = commaPositions[i];
                let endCommaPos = commaPositions[i + 1];

                if (endCommaPos - startCommaPos > 1) {
                    let componentTokens = tokens.slice(startCommaPos + 1,
                        endCommaPos);
                    let newComp = mathParser.parseExpression(componentTokens);
                    if (newComp != null) {
                        components.push(newComp[0]);
                        variables = new Set([...variables, ...newComp[1]]);
                    }
                    else componentsValid = false;
                }
                else componentsValid = false;
            }

            if (componentsValid) {
                return [
                    {
                        type: "vector",
                        components: components
                    },
                    variables
                ];
            }
        }
    }
    
    return mathParser.parseTerminal(tokens); // Otherwise parse as terminal
};

// Parse terminals - variables or numbers.
mathParser.parseTerminal = function(tokens) {
    // Check only one token left
    if (tokens.length == 1) {
        let token = tokens[0];

        // Return expression corresponding to token type
        if (token[0] == "number") {
            return [
                {
                    type: "constant",
                    constant: token[1]
                },
                new Set()
            ];
        }
        else if (token[0] == "variable") {
            return [
                {
                    type: "variable",
                    variable: token[1]
                },
                new Set([token[1]])
            ];
        }
    }

    return null; // If could not be parsed, return null
};

// Combines tokenizing and parsing steps.
mathParser.read = function(string) {
    let tokens = mathParser.tokenize(string);

    if (tokens != null) {
        return mathParser.parseEquality(tokens);
    }
    else return null;
};

/* Outputs LaTeX for parsed expression. Second argument is Boolean which
 * controls whether string is enclosed in delimiters for LaTeX string. */
mathParser.getLatex = function(expression, enclose) {
    let latexString = ""; // LaTeX string to be built up
    let type = expression.type; // Type of expression

    // Construct string recursively for each expression type
    // Encode variable
    if (type == "variable") {
        let variable = expression.variable; // Get variable
        latexString = variable; // Set string to it
    }
    // Encode constant
    else if (type == "constant") {
        let constant = expression.constant; // Get constant
        latexString = constant.toString(); // Set string to it
    }
    // Encode inverse
    else if (type == "inverse") {
        // Get base
        let baseString = mathParser.getLatex(expression.base, false);
        latexString = `${baseString}'`; // String is base'
    }
    // Encode positive
    else if (type == "positive") {
        // Get value
        let valueString = mathParser.getLatex(expression.value, false);
        latexString = `+${valueString}`; // String is +value
    }
    // Encode negative
    else if (type == "negative") {
        // Get value
        let valueString = mathParser.getLatex(expression.value, false);
        latexString = `-${valueString}`; // String is -value
    }
    // Encode equality
    else if (type == "equality") {
        // Get sides
        let leftSideString = mathParser.getLatex(expression.leftSide, false);
        let rightSideString = mathParser.getLatex(expression.rightSide, false);

        // String is summand1 = summand2
        latexString = `${leftSideString} = ${rightSideString}`;
    }
    // Encode sum
    else if (type == "sum") {
        // Get summands
        let summand1String = mathParser.getLatex(expression.summand1, false);
        let summand2String = mathParser.getLatex(expression.summand2, false);

        // String is summand1 + summand2
        latexString = `${summand1String} + ${summand2String}`;
    }
    // Encode difference
    else if (type == "difference") {
        // Get operands
        let minuendString = mathParser.getLatex(expression.minuend, false);
        let subtrahendString = mathParser.getLatex(expression.subtrahend,
            false);

        // String is minuend - subtrahend
        latexString = `${minuendString} - ${subtrahendString}`;
    }
    // Encode product
    else if (type == "product") {
        // Get operands
        let multiplierString = mathParser.getLatex(expression.multiplier,
            false);
        let multiplicandString = mathParser.getLatex(expression.multiplicand,
            false);

        // Check whether to display as implicit or explicit multiplication
        if ("productType" in expression
                && expression.productType == "implicit") {
            // String is multiplier multiplicand
            latexString = `${multiplierString} ${multiplicandString}`;
        }
        else {
            // String is multiplier \times multiplicand
            latexString = `${multiplierString} \\times ${multiplicandString}`;
        }
    }
    // Encode quotient
    else if (type =="quotient") {
        // Get operands
        let dividendString = mathParser.getLatex(expression.dividend, false);
        let divisorString = mathParser.getLatex(expression.divisor, false);

        // String is dividend / divisor
        latexString = `${dividendString} / ${divisorString}`;
    }
    // Encode power
    else if (type == "power") {
        // Get operands
        let baseString = mathParser.getLatex(expression.base, false);
        let exponentString = mathParser.getLatex(expression.exponent, false);

        // String is {base}^{exponent}
        latexString = `{${baseString}}^{${exponentString}}`;
    }
    // Encode vector
    else if (type == "vector") {
        let components = expression.components;
        for (let i = 0; i < components.length; i++) {
            latexString += mathParser.getLatex(components[i], false);

            // Add ", " between vector components
            if (i < components.length - 1) {
                latexString += ", "
            }
        }

        // Surround with brackets
        latexString = "\\left[" + latexString + "\\right]";
    }

    // Check if expression should have parentheses
    if ("delimiters" in expression && expression.delimiters == "parentheses") {
        // String is (latexString)
        latexString = "\\left(" + latexString + "\\right)";
    }

    // Enclose with LaTeX delimiters based on argument
    if (enclose) {
        latexString = "\\(" + latexString + "\\)"
    }

    return latexString; // Return final string
};
