function shorten(string, n){
  if (string == null) {
    return '';
  }
  if (string.length <= 2*n-24) {
    return string.substring(0,n);
  }
  return string.substring(10,n+10) + '...' + string.substring(string.length-12-n,string.length-12);
}

module.exports = { shorten };