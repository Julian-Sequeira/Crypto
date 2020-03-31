function shorten(string, n){
  if (string == null) {
    return '';
  }
  if (string.length <= 2*n) {
    return string;
  }
  return string.substring(0,n) + '...' + string.substring(string.length-n);
}

module.exports = { shorten }