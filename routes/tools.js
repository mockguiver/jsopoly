exports.str2slug = function (str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to   = "aaaaeeeeiiiioooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
}

exports.enc = function (str) {
  var encoded = "";
  for (var i=0; i<str.length;i++) {
    var a = str.charCodeAt(i);
    var b = a ^ 123;    // bitwise XOR with any number, e.g. 123
    encoded = encoded+String.fromCharCode(b);
  }
  return encoded;
}
