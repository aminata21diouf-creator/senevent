"use strict";
(function () {
  window.addEventListener("load", init); // init = main

  function init() {
    id("hi").addEventListener("click", sayHi);
  }

  function sayHi() {
    let name = id("name").value;
    let p = qs("p");
    p.innerHTML = "Bonjour " + name; // <p>Bonjour + name</p>
    // p.textContent = ...
  }

  function id(id) {
    return document.getElementById(id);
  }

  function qs(selector) {
    return document.querySelector(selector);
  }
})();