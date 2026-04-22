// ============================================================
// challenge 1
// Obiettivo: usare un ciclo for classico con indice numerico
// per generare div colorati e aggiungerli al DOM
// ============================================================

const colori = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c"];
const containerColori = document.getElementById("container-colori");

for (let i = 0; i < colori.length; i++) {
  const div = document.createElement("div");
  div.classList.add("color-box"); // classe css color-box che imposta width, height e margin.
  div.style.backgroundColor = colori[i]; // prende elemento array della posizione i
  containerColori.appendChild(div); // inserisco il div in html
}


// ============================================================
// challenge 2
// Obiettivo: iterare sulle proprietà di un oggetto con for...in
// e visualizzarle nel DOM con classi CSS diverse
// ============================================================

const persona = {
  nome: "Mario",
  cognome: "Rossi",
  età: 30
};

const containerPersona = document.getElementById("container-persona"); // recupero div dell'html dove inserire valori

for (const chiave in persona) { // chiave assume valore di proptietà nome cognome età
  const p = document.createElement("p"); // creo p e poi gli assegno la chiave (nome cognome ecc) e il valore
  p.innerHTML = `<span class="chiave">${chiave}:</span> <span class="valore">${persona[chiave]}</span>`;
  containerPersona.appendChild(p);
}


// ============================================================
// challenge 3
// Obiettivo: iterare su un array con for...of (senza gestire
// l'indice) e aggiungere interattività al click
// ============================================================

const nomi = ["Alice", "Bruno", "Carla", "Davide", "Elena"];
const listaNomi = document.getElementById("lista-nomi");

for (const nome of nomi) {
  const li = document.createElement("li");
  li.textContent = nome;

  li.addEventListener("click", function () {
    // Rimuove la classe da tutti gli elementi
    document.querySelectorAll("#lista-nomi li").forEach(el => el.classList.remove("selezionato"));
    // Aggiunge la classe all'elemento cliccato
    li.classList.add("selezionato");
  });

  listaNomi.appendChild(li);
}


// ============================================================
// challenge 4
// Obiettivo: usare il ciclo while con un contatore
// per generare pulsanti numerati; al click mostra il numero
// ============================================================

const containerPulsanti = document.getElementById("container-pulsanti");
const risultatoNumero = document.getElementById("risultato-numero");

let contatore = 1;

while (contatore <= 5) {
  const btn = document.createElement("button");
  btn.classList.add("btn-numero");
  btn.textContent = contatore;

  const numeroCorrente = contatore; // Necessario per catturare il valore corretto nella closure
  btn.addEventListener("click", function () {
    risultatoNumero.textContent = numeroCorrente;
  });

  containerPulsanti.appendChild(btn);
  contatore++; // perchè con while non c'è i++
}


// ============================================================
// challenge 5
// Obiettivo: usare do...while per eseguire il ciclo almeno
// una volta; chiede un numero finché non è maggiore di 10
// ============================================================

let numero;

do {
  const input = prompt("Inserisci un numero maggiore di 10:");
  numero = Number(input);
} while (numero <= 10 || isNaN(numero));

const containerSuccesso = document.getElementById("container-successo");
const p = document.createElement("p");
p.classList.add("successo");
p.textContent = `✅ Numero accettato: ${numero}`;
containerSuccesso.appendChild(p);
