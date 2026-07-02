console.log("Hello Word");
let a=2;
let b=5;
let s=a+b;
console.log(s+"="+a+"+"+b);
console.log(`${s} = ${a}+${b}`);
    //Declaration
function carre(x){
    returnx*x;
}
    //appel
const r = carre(3)
console.log(r);

//methode expression
const carre = function(x){
    returnx*x;
}
const r = carre(3)
console.log(r);
    //flechee (lamda)
const carre = (x) =>{
    returnx*x;
}
//reecriture
const carre = x => x*x;



