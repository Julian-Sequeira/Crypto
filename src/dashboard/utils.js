function shorten(string, n){
  if (string == null) {
    return '';
  }
  if (string.length <= 2*n+143+70) {
    return string.substring(0,n);
  }
  return string.substring(143,n+143) + '...' + string.substring(string.length-70-n,string.length-70);
}

module.exports = { shorten };