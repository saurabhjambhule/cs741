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
      window.open("popup.html", "extension_popup", "width=300,height=400,status=no,scrollbars=no,resizable=no");
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
  ["responseHeaders"]);
