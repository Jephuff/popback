var queryString = require('querystring');

if (!Promise) {
  console.warn('no Promise on window, you must polyfill for this browser');
}

module.exports = function(options) {
  options = options || {};
  var url = options.url;
  var id = options.id || 'popback';
  var width = options.width || 100;
  var height = options.height || 100;
  var hasRedirected =
    options.hasRedirected ||
    function() {
      return true;
    };

  if (!url) {
    throw new Error('must provide url for popup');
  }

  return new Promise(function(resolve, reject) {
    var popup = window.open(url, id, 'width=' + width + ',height=' + height);
    var intervalId = null;

    function clearInterval() {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    }

    intervalId = window.setInterval(function() {
      try {
        if (popup.closed || !popup) {
          clearInterval();
          reject(new Error('The popup was closed'));
        } else if (
          popup.document.URL.includes(location.origin) &&
          hasRedirected(popup.document.URL)
        ) {
          var params = queryString.parse(
            popup.location.search.replace(/^\?/, '')
          );
          clearInterval();
          popup.close();
          resolve(params);
        }
      } catch (error) {}
    }, 100);
  });
};
