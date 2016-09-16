/* Tiuringo mašina

Pagrindinis Tiuringo mašinos failas, be naudotojo sąsajos ir atvaizdavimo
metodų.

Failo sandara:
- Foninės užduoties paleidiklis, kuris sukuria ir paleidžia mašinos objektą
- Klasė 'Masina' - čia vyksta kodo vykdymas
- Klasė 'Kodas' - čia interpretuojamas ir paruošiamas darbui kodas
- Klasė 'Taisykle' - jos pagalba kiekviena taisyklė perduodama objektu

*/

var masina;   // Mašinos objektas

// Foninės užduoties paleidiklis
onmessage = function(e) {
  /* Gaunami duomenys:
    data[0] - programos kodas
    data[1] - vykdymo greitis
    data[2] - [nebūtinas] tęsimo identifikatorius
    data[3] - [nebūtinas] esamo simbolio nr
    data[4] - [nebūtinas] esama būsena
    data[5] - [nebūtinas] esama juosta
  */
  masina = new Masina(e.data[0], e.data[1]);  // Sukuriamas objektas
  if(e.data[1] != 'undefined' && e.data[2] == 'testi') masina.testi(e.data);
  else masina.inicijuoti();
};

// Duomenų išsiuntimas į pagrindinį puslapio procesą
function atnaujintiTerminala(kuris, juosta, busena) {
  /* Išsiunčiami duomenys:
    data[0] - esama juosta
    data[1] - esama būsena
    data[2] - esamo simbolio nr
  */
  postMessage([juosta, busena, kuris]);
}

// Pagalbinė funkcija, sustabdanti kodą tam tikram skaičiui ms
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

/* Tiuringo mašinos klasė */

var Masina = function(ivestis, laikas) {
  this.kodas = new Kodas(ivestis);  // Įkeliamas apdorotas kodas
  this.juosta = this.kodas.juosta;  // Įkeliama nuskaityta juosta
  this.vaizdus = parseInt(laikas);  // Nuskaitoma, kiek ms praleisti po kiekvieno žingsnio
};

// Duomenų paruošimo funkcijos

Masina.prototype.inicijuoti = function() {
  // Paruošiami darbui duomenys
  this.kuris = this.kodas.esamas;
  atnaujintiTerminala(this.kuris, this.juosta, '0');
  if(this.kodas.pirmas() == 'ERROR'){
    atnaujintiTerminala(this.kuris, this.juosta, 'Sintaksės klaida!');
    return;
  } else this.dabar = this.kodas.pirmas();
  this.pradetiVeiksma(); // Pradedamas vykdymas
}

Masina.prototype.testi = function(input) {
  // Paruošiami darbui duomenys
  this.kuris = input[3];
  this.juosta = input[5];
  if(this.kodas.paieska(input[4], this.juosta[this.kuris]) == 'ERROR') {
    atnaujintiTerminala(this.kuris, this.juosta, 'Nebėra veiksmų.');
    return false;
  } else this.dabar = this.kodas.paieska(input[4], this.juosta[this.kuris]);
  this.pradetiVeiksma(); // Pradedamas vykdymas
}

// Kodo vykdymo pradžios funkcija

Masina.prototype.pradetiVeiksma = function() {
  if(this.vaizdus == 0) {
    atnaujintiTerminala(this.kuris, this.juosta, 'Vykdoma...');
    while(this.naujasSimbolis()) continue;
    atnaujintiTerminala(this.kuris, this.juosta, this.dabar.busena);
  } else while(this.naujasSimbolis()) sleep(this.vaizdus);
  atnaujintiTerminala(this.kuris, this.juosta, 'Nebėra veiksmų.');
}

// Pagrindinės vykdymo funkcijos

Masina.prototype.naujasSimbolis = function() {
  if(this.vaizdus)
    atnaujintiTerminala(this.kuris, this.juosta, this.dabar.busena);
  if(this.dabar.naujas != '*')
    this.juosta[this.kuris] = this.dabar.naujas;
  return this.einamKryptis();
};

Masina.prototype.einamKryptis = function() {
  if((this.dabar.kryptis == 'L' || this.dabar.kryptis == 'l') && this.kuris > 0) this.kuris -= 1;
  else if(this.dabar.kryptis == 'R' || this.dabar.kryptis == 'r') this.kuris += 1;
  else if(this.dabar.kryptis != '*') return false;
  return this.naujaBusena();
};

Masina.prototype.naujaBusena = function() {
  if(this.kodas.paieska(this.dabar.nuoroda, this.juosta[this.kuris]) == 'ERROR') {
    atnaujintiTerminala(this.kuris, this.juosta, 'Nebėra veiksmų.');
    return false;
  } else this.dabar = this.kodas.paieska(this.dabar.nuoroda, this.juosta[this.kuris]);
  return true;
};

/* Taisyklės aprašymo klasė */

var Taisykle = function(busena, esamas, naujas, kryptis, nuoroda) {
  this.busena = busena;
  this.esamas = esamas;
  this.naujas = naujas;
  this.kryptis = kryptis;
  this.nuoroda = nuoroda;
};

/* Kodo interpretvimo klasė */

var Kodas = function(input) {
  this.taisykles = [];
  var eil = input.split(/\n/);  // Kodas suskaidomas į eilutes
  this.esamas = parseInt(eil[0]) - 1; // Nuskaitoma 1 eilutė
  this.juosta = eil[1].split('');     // Nuskaitoma 2 eilutė ir suskaidoma į atskirus simbolius
  this.simbolis = this.juosta[this.esamas];
  for(i = 2; i < eil.length; i++) {
    var cha = eil[i].split(' ');    // Eilutė skaidoma į masyvą pagal tarpus
    if(cha.length > 4) {            // Tikrinama, ar eilutė atitinka taisyklės formą
      this.taisykles.push([cha[0], cha[1], cha[2], cha[3], cha[4]]);
    }
  }
  this.rikiavimas();      // Taisyklės, kuriose esamas simbolis '*', nukeliamos į galą
};

/* Visos taisyklės, kuriose esamas simbolis nurodytas kaip '*', nukeliamos į
taisyklių masyvo pabaigą, kad pirmiausia būtų nuskaityti visi kiti simboliai
ir tik tada skaitoma taisyklė, ignoruojanti esamą simbolį */

Kodas.prototype.rikiavimas = function() {
  for(i = 0; i < this.taisykles.length; i++) {
    if(this.taisykles[i][1] == '*') {
      this.taisykles.push(this.taisykles.splice(i, 1)[0]);
    }
  }
}

/* Taisyklės paieška.
Funkcija pagal dabartinę būseną ir esamą simbolį iš taisyklių masyvo
grąžina atitinkamą taisyklę, pagal kurią vėliau bus vykdomi veiksmai.
*/

Kodas.prototype.paieska = function(busena, esamas) {
  for(i = 0; i < this.taisykles.length; i++) {
    if(this.taisykles[i][0] == busena &&
      (this.taisykles[i][1] == '*' || this.taisykles[i][1] == esamas) )
      return new Taisykle(this.taisykles[i][0], this.taisykles[i][1], this.taisykles[i][2], this.taisykles[i][3], this.taisykles[i][4]);
  }
  return 'ERROR';   // Jei taisyklė nerasta, automatiškai grąžinama klaida
};

/* Grąžinama pirma taisyklė, nuo kurios pradedamas vykdymas */

Kodas.prototype.pirmas = function() {
  return this.paieska('0', this.simbolis);
};
