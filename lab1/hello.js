"use strict";
(function () {
  window.addEventListener("load", init); // init == main

  
function greet(){
    alert("It works");
}

  function init() {
    id("hi").addEventListener("click",greet);
  }
  function greet(){
    let myprenom = id("prenom").value;
     let mynom = id("nom").value;
    alert("hello " +myprenom +" "+mynom);
  }

  function id(id) {
    return document.getElementById(id);
  }

  function qs(selector) {
    return document.querySelector(selector);
  }
})();
