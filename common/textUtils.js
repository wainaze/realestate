/**
 * Created by Sergey on 12/01/2016.
 */

RegExp.escape= function(s) {
    s = s.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&')
    return s.replace('*', '.+');
};

function fullTextSearch(list, searchString){
    try {
        var tokens = searchString.split(' ');
        var arrFiltered = list;
        tokens.forEach(function(token){
            var regex = new RegExp('\:"(:?[^"]*)' + RegExp.escape(token) + '(:?[^"]*)"','i');
            arrFiltered =  arrFiltered.filter(function(obj) {
                return JSON.stringify(obj).match(regex);
            });
        });
        return arrFiltered;
    } catch(e){
        console.error(e);
        return list;
    }

}

exports.fullTextSearch = fullTextSearch;