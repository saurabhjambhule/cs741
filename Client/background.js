function find_name_value_in_arr(nameStr, valueStr, arr){
  for(i = 0; i < arr.length ; i++) if(arr[i].name == nameStr && arr[i].value == valueStr) return true;
  return false;
}

chrome.webRequest.onHeadersReceived.addListener(
  function(info) {
    if (typeof info.responseHeaders === 'undefined' || info.responseHeaders === null) {
      return;
    }
    if(info.responseHeaders && find_name_value_in_arr("Server","ZKP",info.responseHeaders)) {
      init_ZKP(info.url);
    }
  },
  // filters
  {
    urls: [
      "<all_urls>"
    ],
  },
  // extraInfoSpec
  ["responseHeaders"]
);
