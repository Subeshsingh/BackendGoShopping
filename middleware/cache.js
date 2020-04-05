const NodeCache = require('node-cache')

// stdTTL: time to live in seconds for every generated cache element.
const cache = new NodeCache({ stdTTL: 60*60 })
function getUrlFromRequest(request) {
  const url = request.protocol + '://' + request.headers.host + request.originalUrl
  return url;
}
function set(request,data) {
  const url=getUrlFromRequest(request);
  if(cache.set(url,data)){
    return true;
  }else{
    return false;
  }
}

function get(request) {
  const url=getUrlFromRequest(request);
  console.log(url);
  const content = cache.get(url)
  if (content) {
    return content;
  }
  return null;
}

module.exports = { get, set };