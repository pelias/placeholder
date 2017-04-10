
/**
  merge two sorted arrays
**/
function sortedMerge(arr1, arr2) {
    var arr = [];
    var arr1_el = arr1[0];
    var arr2_el = arr2[0];
    var i = 1;
    var j = 1;

    while (arr1_el || arr2_el) {
        if (arr1_el<arr2_el || (arr1_el && !arr2_el) ) {
            arr.push(arr1_el);
            arr1_el = arr1[i++];
        } else {
            arr.push(arr2_el);
            arr2_el = arr2[j++];
        }
    }

    return arr;
}

module.exports.merge = sortedMerge;
