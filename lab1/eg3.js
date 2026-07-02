"use strict";
(function () {
  window.addEventListener("load", init);

  function init() {
    id("b1").addEventListener("click", addClass);
  }

  function addClass() {
    id("actor").classList.toggle("mystery");
  }

  function id(id) {
    return document.getElementById(id);
  }
})();