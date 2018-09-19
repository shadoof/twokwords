$(document).ready(function() {


var nombrea = [
"El manual",
"El propietario del agua",
"El pr&aacute;ctico",
"La parte",
"La pelvis",
"La regi&oacute;n lumbar",
"El inferior",
"El esqueleto",
"La articulaci&oacute;n de la pelvis",
"La parte blanda que cubre",
"El hueso",
"El cintur&oacute;n pelviano",
"El sacro",
"El hueso sacro",
"La comprendida entre dos planos horizontales", 
"La regi&oacute;n frente a las caderas", 
"El situado por detr&aacute;s y en la l&iacute;nea media",
"El hueso formado de cinco v&eacute;rtebras soldadas", 
"El borde superior", 
"La faceta articular",
]




var nombreb = [
"del manual",
"del propietario del agua",
"del pr&aacute;ctico",
"de la parte",
"de la pelvis",
"de la regi&oacute;n lumbar",
"del inferior",
"del esqueleto",
"de la articulaci&oacute;n de la pelvis",
"de la parte blanda que cubre",
"del hueso",
"del cintur&oacute;n pelviano",
"del sacro",
"del hueso sacro",

]



var nombrec = [
"manual,",
"propietario del agua,",
"pr&aacute;ctico,",
"parte,",
"pelvis,",
"regi&oacute;n lumbar,",
"inferior,",
"esqueleto,",
"articulaci&oacute;n de la pelvis,",
"parte blanda que cubre,",
"hueso,",
"cintur&oacute;n pelviano,",
"sacro,",
"hueso sacro,",

]


var subj = [
"acoger",
"esperar",
"interesar principalmente",
"deber estudiar",
"concurrir",
"formar",
"situar",
"reunir",
"formar",
"adoptar", 
"pasar", 
]



var ncancer = [
"El C&aacute;ncer",
"Un or&iacute;gen psicosom&aacute;tico",
"Una profunda aflicci&oacute;n",
"La presi&oacute;n de la vida cotidiana",
"El desamparo",
"La angustia",
"Un C&aacute;ncer", 
"Alg&uacute;n m&eacute;dico de la antig&uumlidad",
"El galeno",
"La respuesta afirmativa", 
"El autor del libro",
"El insigne m&eacute;dico griego",
"La mujer melanc&oacute;lica",
"La frecuencia", 
"La mujer optimista",
"El siglo XIX",
]

var scancer = [
"poder", 
"desencadenar",
"inclinar en su tiempo", 
"prevenir",
"observar"

]



var pronombre = [
"su",
"tu",
"mi"
]





var cuerpoElement = document.getElementById("cuerpoDIV");

$(".paredes").draggable(); 
$(".selectas").draggable(); 



$(".selectas").click(function(){

var randomnombrea = nombrea[Math.floor(Math.random()*nombrea.length)];
var randomnombreb = nombreb[Math.floor(Math.random()*nombreb.length)];
var randomsubja = subj[Math.floor(Math.random()*subj.length)];
var randompronombre = pronombre[Math.floor(Math.random()*pronombre.length)];
var randomnombrec = nombrec[Math.floor(Math.random()*nombrec.length)];
var randompronombreb = pronombre[Math.floor(Math.random()*pronombre.length)];
var randomsubjb = subj[Math.floor(Math.random()*subj.length)];
var randomsubjc = subj[Math.floor(Math.random()*subj.length)];

console.log(".cuerpo", $(".cuerpo"));
console.log("cuerpoElement", cuerpoElement.childNodes);

while (cuerpoElement.hasChildNodes()) {
    cuerpoElement.removeChild(cuerpoElement.lastChild);
}

$(".cuerpo" ).append( randomnombrea + " dentro " + randomnombreb + " va a " + randomsubja + " " + randompronombre + " " + randomnombrec + " va a " + randomsubja + " " + randompronombreb + " " + randomsubjb + ", una vez, dos veces. " + randomnombrea + " va a " + randomsubjb + " su propio " + randomsubja + ", y all&iacute;, va a " + randomsubjc + ". All&iacute; va a " + randomsubjc + " entre " );
});


// document.body.innerHTML = randomnombrea + " dentro " + randomnombreb + " va a " + randomsubja + " " + randompronombre + " " + randomnombrec + " va a " + randomsubja + " " + randompronombreb + " " + randomsubjb + ", una vez, dos veces. " + randomnombrea + " va a " + randomsubjb + " su propio " + randomsubja + ", y all&iacute;, va a " + randomsubjc + ". All&iacute; va a " + randomsubjc + " entre "  ;




});