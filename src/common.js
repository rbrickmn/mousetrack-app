//
// Copyright (c) 2014-2018 Duckware 
//

var g_path="";
function getPath() {
  return g_path;
  }
(function(){
  var ORIGIN="https://www.dk9.us";
  var SEP="\x07";
  function isValidOrigin(s) {
    return s==ORIGIN;
    }
  function haveMessage(e) {
    if (isValidOrigin(e.origin)) {
      var lines = e.data.split(SEP);
      if (lines[0]=="dk9ready") {
        e.source.postMessage(document.referrer+SEP+document.location.href, e.origin);
        }
      else if (lines[0]=="dk9path") {
        g_path = lines[1];
        }
      }
    }
  function getSI() {
    var s = window.screen;
    var r = window.devicePixelRatio||((s.deviceXDPI||96)/(s.logicalXDPI||96));
    return s.width+"x"+s.height+"x"+r;
    }
  function addFrame() {
    window.addEventListener("message", haveMessage);
    var f = document.createElement("iframe");
    f.style.display = "none";
    f.setAttribute("src", ORIGIN+"/dk9.html");
    document.body.appendChild(f);
    new Image().src = ORIGIN+"/dk9.gif?t="+(new Date().getTime())+"&si="+getSI();
    }
  function unFrame() {
    if (self!=top) {
      top.location.href = self.location.href;
      }
    }
  function onReady( fnCallback ) {
    if (document.readyState==="interactive"||document.readyState==="complete") {
      fnCallback();
      }
    else {
      document.addEventListener("DOMContentLoaded",fnCallback)
      }
    }
  if (window.addEventListener && document.addEventListener) {
    onReady( addFrame );
    onReady( unFrame );
    }
  })();
