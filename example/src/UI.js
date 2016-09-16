var status = 0;   // Mašinos stadija - skirta mygtukams atvaizduoti
var busena;       // Galvutės būsena - perduodama mašinai pratęsiant darbą
var kuris;        // Galvutės padėtis juostoje - atvaizduojama šviesesne spalva
var kodas;        // Programos kodas tekstiniu pavidalu išsaugomas prieš įjungiant mašiną
var juosta;       // Programos juosta išdaugoma pratęsiant darbą

/* Failo įkėlimas į serverį.
Paspaudus įkėlimo mygtuką paleidžiama foninė užduotis, kuri
perduoda failą į 'failas.php' vietą serveryje, serveris grąžina
failo turinį ir jis įdedamas į kodo lauką. Tai reikalinga,
nes saugumo sumetimais JavaScript neleidžiama pasiekti naudotojo
kompiuteryje esančių failų.

Funkcija paimta ir adaptuota iš oficialios bibliotekos dokumentacijos
*/

var uploader = new ss.SimpleUpload({
      button: 'file_btn', // file upload button
      url: 'src/failas.php', // server side handler
      name: 'uploadfile',
      onComplete: function(filename, response) {
          if (!response) {
              alert('Įkėlimas nesėkmingas!');
              return false;
          }
          $('#kodas').val(response);
        }
});

/* Mygtukų funkcijos */

/* Pradžia
Tikrinama, ar egzistuoja mašinos foninis procesas. Jei ne - jis
sukuriamas ir kreipiamasi į mašiną, nurodant kodą ir vykdymo laiką
kaip parametrus. Kintamasis 'status' parodo, ar mašina buvo pristabdyta,
ar pradedama nuo pradžių. Jei ji buvo sustabdyta - mašinai
taip pat perduodama buvusi galvutės padėtis, būsena ir juosta. */

function btnStart() {
  if (typeof(w) == "undefined") {
    w = new Worker("../turing.js");             // Sukuriama mašina
    w.onmessage = function(e) { message(e); }   // Pridedamas bendravimo modulis
  }
  if(status == 0) {
    kodas = $('#kodas').val()
    w.postMessage([kodas, $('#laikas').val()]); // Paleidžiama mašina
  }
  else if(status == 2) testi();
  status = 1;
  if($('#laikas').val() > 0)
  toggleStart(1);
  else toggleStart(2);
}

function testi() {
  w = new Worker("turing.js");
  w.onmessage = function(e) { message(e); }
  w.postMessage([kodas, $('#laikas').val(), 'testi', kuris, busena, juosta]);
}

/* Pristabdymas
Tikrinama, ar mašina veikia. Jei taip - mašinos foninis procesas
sunaikinamas, išsaugant galvutės padėtį, būseną ir juostą. */

function btnStop() {
  if (status == 1) {
    status = 2;
    w.terminate();
    toggleStart(0);
    $('#statusas').html("Sustabdyta: " + busena);
  }
}

/* Nustatymas iš naujo
Mašinos foninis procesas sunaikinamas, kintamieji paruošiami naujos
mašinos paruošimui ir vykdymui */

function btnReset() {
  status = 0;
  w.terminate();
  w = new Worker("turing.js");
  w.onmessage = function(e) { message(e); }
  $('#terminalas').html('ALAN TURING');
  $('#statusas').html('Išjungta');
  toggleStart(0);
}

/* Pagalbinės funkcijos */

/* Paspaudus paleidimo mygtuką, jis pakeičiamas į sustavdymo mygtuką */

function toggleStart(which) {
  if(which == 0) {
    $('#play_btn').show();
    $('#play_btn').removeClass('btn-warning');
    $('#play_btn').addClass('btn-success');
    $('#play_btn').attr('onClick', 'btnStart()');
    $('#play_btn .glyphicon').removeClass('glyphicon-pause');
    $('#play_btn .glyphicon').addClass('glyphicon-start');
  } else if(which == 1) {
    $('#play_btn').show();
    $('#play_btn').removeClass('btn-success');
    $('#play_btn').addClass('btn-warning');
    $('#play_btn').attr('onClick', 'btnStop()');
    $('#play_btn .glyphicon').removeClass('glyphicon-start');
    $('#play_btn .glyphicon').addClass('glyphicon-pause');
  } else if(which == 2) {
    $('#play_btn').hide();
  }
}

/* Bendravimo su mašinos foniniu procesu funkcija */

function message(event) {
  juosta = event.data[0];
  busena = event.data[1];
  kuris = event.data[2];

  var out = "";
  for(i = 0; i < juosta.length; i++) {
    if(i == kuris) {
      out = out + '<span class="point">' + juosta[i] + '</span>';
    } else {
      out = out + juosta[i];
    }
  }

  $('#terminalas').html(out);
  $('#statusas').html(busena);

  if(busena == 'Nebėra veiksmų.' || busena == 'Sintaksės klaida!')
  {
    w.terminate();
    toggleStart(0);
    status = 0;
    w = new Worker("turing.js");
    w.onmessage = function(e) { message(e); }
    return;
  }
};

/* Išeities kodo parodymas */

function showSource() {
  if($('#cont_machine').css('display') == 'none') {
    $('#cont_machine').slideDown();
    $('#source_btn').removeClass('white');
  } else {
    $('#cont_machine').slideUp();
    $('#source_btn').addClass('white');
  }
}

/* Išeities kodo srities paryškinimo bibliotekos inicializavimas */

$(document).ready(function() {
  $.get('turing.js', function( printContent ){
    $('#source_highl').html( printContent );
    $('#source_highl').each(function(i, block) {
      hljs.highlightBlock(block);
    });
  }, 'text');

});
