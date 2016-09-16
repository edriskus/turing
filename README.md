#Tiuringo mašina
Pagrindinis Tiuringo mašinos failas, be naudotojo sąsajos ir atvaizdavimo
metodų.

##Failo sandara:
- Foninės užduoties paleidiklis, kuris sukuria ir paleidžia mašinos objektą
- Klasė 'Masina' - čia vyksta kodo vykdymas
- Klasė 'Kodas' - čia interpretuojamas ir paruošiamas darbui kodas
- Klasė 'Taisykle' - jos pagalba kiekviena taisyklė perduodama objektu

##Naudojimas:
turing.js naudojamas su HTML5 Web Workers. Programa onMessage ir sendMessage metodais gauna ir išveda tokius duomenis:

#Gaunami duomenys:
    data[0] - programos kodas
    data[1] - vykdymo greitis
    data[2] - [nebūtinas] tęsimo identifikatorius
    data[3] - [nebūtinas] esamo simbolio nr
    data[4] - [nebūtinas] esama būsena
    data[5] - [nebūtinas] esama juosta
    
#Išsiunčiami duomenys:
    data[0] - esama juosta
    data[1] - esama būsena
    data[2] - esamo simbolio nr
    
