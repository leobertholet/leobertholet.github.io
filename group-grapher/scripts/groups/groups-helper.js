/* Scripts used by this file:
 *   - math.js (library)
 */

var groupsHelper = {}; // Create namespace

// Math functions for groups.js and related files.

// Fixes mod function to return nonnegative values.
groupsHelper.mod = function(n, m) {
    return ((n % m) + m) % m;
}

// Applies mod to components of an array.
groupsHelper.modComponents = function(arr, m) {
    return arr.map(elt => groupsHelper.mod(elt, m));
};

// Adds elements of two arrays, possibly with different lengths.
groupsHelper.addArrays = function(arr1, arr2) {
    let len1 = arr1.length;
    let len2 = arr2.length;

    let sum = new Array(Math.max(len1, len2)).fill(0);

    for (let i = 0; i < len1; i++) {
        sum[i] += arr1[i];
    }
    for (let i = 0; i < len2; i++) {
        sum[i] += arr2[i];
    }

    return sum;
};

// Returns zeros array of size n with 1 at index i.
groupsHelper.basisArr = function(n, i) {
    let arr = new Array(n).fill(0);
    arr[i] = 1;

    return arr;
}

// Strips leading zeros (at higher indices) from an array.
groupsHelper.stripLeadingZeros = function(arr) {
    // Remove all leading 0 coefficients from q
    while (arr.length >= 1 && arr[arr.length - 1] == 0) {
        arr.pop();
    }

    if (arr.length == 0) {
        return [0];
    }
    else return arr;
}

// Multiplies two polynomials represented as arrays.
groupsHelper.polyProduct = function(arr1, arr2) {
    let deg1 = arr1.length - 1;
    let deg2 = arr2.length - 1;

    let sum = new Array(deg1 + deg2 + 1).fill(0);

    for (let i = 0; i <= deg1; i++) {
        for (let j = 0; j <= deg2; j++) {
            sum[i + j] += arr1[i] * arr2[j];
        }
    }

    return groupsHelper.stripLeadingZeros(sum);
}

/* Divides poly1 by poly2, where coefficients are integers mod p. Returns object
 * with quotient and remainder. */
groupsHelper.polyDivide = function(poly1, poly2, p) {
    poly1 = poly1.map(x => groupsHelper.mod(x, p));
    poly2 = poly2.map(x => groupsHelper.mod(x, p));

    poly1 = groupsHelper.stripLeadingZeros(poly1);
    poly2 = groupsHelper.stripLeadingZeros(poly2);

    if (poly2.length == 1 && poly2[0] == 0) {
        return NaN;
    }
    
    let quotient = new Array(poly1.length).fill(0);

    while ((poly1.length >= poly2.length && poly1.length > 1)
            || (poly1.length == 1 && poly2.length == 1 && poly1[0] != 0)) {
        let lcf1 = poly1[poly1.length - 1];
        let lcf2 = poly2[poly2.length - 1];

        let q = lcf1 * math.invmod(lcf2, p);
        quotient[poly1.length - poly2.length] = q;

        poly2.forEach(function(x, i) {
            poly1[i + poly1.length - poly2.length] -= q * x
        });

        poly1 = poly1.map(x => groupsHelper.mod(x, p));
        poly1 = groupsHelper.stripLeadingZeros(poly1);
    }

    quotient = quotient.map(x => groupsHelper.mod(x, p));
    quotient = groupsHelper.stripLeadingZeros(quotient);

    return {
        quotient: quotient,
        remainder: poly1
    };
}

// Euler's phi function.
groupsHelper.eulerPhi = function(n) {
    relPrimeCount = 0;

    for (let i = 1; i <= n; i++) {
        if (math.gcd(i, n) == 1) {
            relPrimeCount++;
        }
    }

    return relPrimeCount;
}
