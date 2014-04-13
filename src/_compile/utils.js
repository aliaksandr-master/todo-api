'use strict';

module.exports = {

    json2phpArray: function(data, compress) {
		compress = compress == null ? true : !!compress;
        var son2php;

        son2php = function(obj) {
            var i, result;
            switch (Object.prototype.toString.call(obj)) {
                case '[object Boolean]':
                    result = obj ? 'true' : 'false';
                    break;
                case '[object Null]':
                    result = 'null';
                    break;
                case '[object Undefined]':
                    result = 'null';
                    break;
                case '[object String]':
                    result = "'" + obj.replace(/\\/g, '\\\\').replace(/\'/g, "\\'") + "'";
                    break;
                case '[object Number]':
                    result = obj.toString();
                    break;
                case '[object Array]':
                    result = 'array(' + obj.map(son2php).join(compress ? ',': ", ") + ')';
                    break;
                case '[object Object]':
                    result = [];
                    for (i in obj) {
                        if (obj.hasOwnProperty(i)) {
                            result.push(son2php(i) + (compress ? "=>": " => ") + son2php(obj[i]));
                        }
                    }
                    result = "array(" + result.join(compress ? ',': ", ") + ")";
                    break;
                default:
                    result = 'null';
            }
            return result;
        };
        return son2php(data);
    }
};
