// ==========================================================
// FlexiDrive | Portal de Arquitectura Empresarial
// Lógica de la interfaz. Los datos están en datos.js.
// ==========================================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const crear = (etiqueta, clase, html) => {
  const e = document.createElement(etiqueta);
  if (clase) e.className = clase;
  if (html != null) e.innerHTML = html;
  return e;
};
const SVG = "http://www.w3.org/2000/svg";
const svg = (etiqueta, atributos = {}) => {
  const e = document.createElementNS(SVG, etiqueta);
  for (const [k, v] of Object.entries(atributos)) e.setAttribute(k, v);
  return e;
};
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------- Navegación
const SECCIONES = [
  ["inicio", "Inicio"], ["estrategia", "Estrategia"], ["negocio", "Negocio"],
  ["informacion", "Información"], ["aplicaciones", "Aplicaciones"], ["tecnologia", "Tecnología"],
  ["transformacion", "Transformación"], ["explorador", "Explorador"],
];
const visitadas = new Set();

SECCIONES.forEach(([id, nombre]) => {
  const a = crear("a", "", nombre);
  a.href = "#" + id;
  $("#nav").appendChild(a);
});

function mostrar(id) {
  if (!SECCIONES.some(([s]) => s === id)) id = "inicio";
  visitadas.add(id);
  $$(".vista").forEach((v) => v.classList.toggle("activa", v.id === id));
  $$("#nav a").forEach((a) => {
    const suya = a.getAttribute("href") === "#" + id;
    if (suya) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    a.classList.toggle("hecha", !suya && visitadas.has(a.getAttribute("href").slice(1)));
  });
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", () => mostrar(location.hash.slice(1)));

// ---------------------------------------------------------- Inicio
[
  ["estrategia", "Estrategia", "Objetivos, capacidades y reglas de negocio, conectados entre sí."],
  ["negocio", "Negocio", "Simula un alquiler y decide en cada compuerta del proceso."],
  ["informacion", "Información", "Explora el modelo de datos entidad por entidad."],
  ["aplicaciones", "Aplicaciones", "Navega las capas y dispara los eventos de integración."],
  ["tecnologia", "Tecnología", "La nube, las redes y la seguridad que lo sostienen."],
  ["transformacion", "Transformación", "As-Is, To-Be, brechas y roadmap hasta 2031."],
].forEach(([id, titulo, texto]) => {
  const a = crear("a", "", `<h3>${titulo}</h3><p>${texto}</p>`);
  a.href = "#" + id;
  $("#accesos").appendChild(a);
});

// Trayecto de la portada: el carro recorre las paradas de un alquiler.
(function trayecto() {
  const via = $("#via"), carro = $("#carro"), grupo = $("#paradas");
  const nombres = ["Buscar", "Reservar", "Verificar", "Pagar", "Entregar", "Usar", "Devolver", "Cerrar"];
  const largo = via.getTotalLength();
  const paradas = nombres.map((nombre, i) => {
    const d = (largo * i) / (nombres.length - 1);
    const p = via.getPointAtLength(d);
    const g = svg("g", { class: "parada" });
    g.appendChild(svg("circle", { cx: p.x, cy: p.y, r: 7 }));
    const t = svg("text", { x: p.x, y: p.y - 16, "text-anchor": i === 0 ? "start" : i === nombres.length - 1 ? "start" : "middle" });
    t.textContent = nombre;
    g.appendChild(t);
    grupo.appendChild(g);
    return { d, g };
  });
  const poner = (d) => {
    const p = via.getPointAtLength(d), q = via.getPointAtLength(Math.min(d + 1, largo));
    const ang = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
    carro.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${ang})`);
    paradas.forEach((s) => s.g.classList.toggle("pasada", s.d <= d + 1));
  };
  if (sinMovimiento) { poner(largo); return; }
  const DUR = 9000;
  let t0 = null;
  const paso = (t) => {
    if (t0 === null) t0 = t;
    const k = Math.min((t - t0) / DUR, 1);
    poner(largo * (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2));
    if (k < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
})();

// ---------------------------------------------------------- Estrategia
let objetivoElegido = null;
function dibujarEstrategia() {
  const zonaObj = $("#objetivos"), zonaCap = $("#capacidades");
  zonaObj.innerHTML = ""; zonaCap.innerHTML = "";
  Object.entries(OBJETIVOS).forEach(([cod, [nombre, texto]]) => {
    const b = crear("button", "tarjeta" + (objetivoElegido === cod ? " elegida" : ""), `<span class="sello">${cod}</span><h3>${nombre}</h3><p>${texto}</p>`);
    b.type = "button";
    b.setAttribute("aria-pressed", objetivoElegido === cod);
    b.onclick = () => { objetivoElegido = objetivoElegido === cod ? null : cod; dibujarEstrategia(); };
    zonaObj.appendChild(b);
  });
  CAPACIDADES.forEach((c) => {
    const suya = objetivoElegido && c[3] === objetivoElegido;
    const b = crear("button", "tarjeta" + (c[0] === 4 ? " estrategica" : "") + (suya ? " elegida" : "") + (objetivoElegido && !suya ? " apagada" : ""),
      `<span class="sello">${c[0]}</span>${c[0] === 4 ? '<span class="sello lleno">Estratégica</span>' : ""}<h3>${c[1]}</h3><p>Objetivo ${c[3]}</p>`);
    b.type = "button";
    b.onclick = () => {
      const d = $("#detalle-capacidad");
      d.hidden = false;
      d.innerHTML = `<h3>Capacidad ${c[0]}: gestión de ${c[1].toLowerCase()}</h3><dl>
        <dt>Por qué es necesaria</dt><dd>${c[2]}</dd>
        <dt>Objetivo que soporta</dt><dd>${c[3]}. ${OBJETIVOS[c[3]][1]}</dd>
        <dt>Área responsable</dt><dd>${c[4]}</dd>
        <dt>Aplicaciones</dt><dd>${c[5]}</dd></dl>`;
    };
    zonaCap.appendChild(b);
  });
}
dibujarEstrategia();
Object.entries(REGLAS).forEach(([cod, texto]) => $("#reglas").appendChild(crear("li", "", `<b>${cod}</b><span>${texto}</span>`)));

// ---------------------------------------------------------- Simulador del proceso
const ORDEN = Object.keys(PASOS);
let actual = "a1", recorrido = [];
const COL = 50, FILA = 52, X0 = 215, Y0 = 34;
const posicion = (id) => ({ x: X0 + ORDEN.indexOf(id) * COL, y: Y0 + PASOS[id].l * FILA });

function dibujarTablero() {
  const t = $("#tablero");
  const ancho = X0 + ORDEN.length * COL, alto = Y0 * 2 + (CARRILES.length - 1) * FILA;
  t.setAttribute("viewBox", `0 0 ${ancho} ${alto}`);
  t.innerHTML = "";
  const carrilActual = PASOS[actual].l;
  CARRILES.forEach((nombre, i) => {
    t.appendChild(svg("rect", { class: "carril" + (i === carrilActual ? " activo" : ""), x: 6, y: Y0 + i * FILA - 21, width: ancho - 12, height: 42, rx: 10 }));
    const txt = svg("text", { class: "carril-nombre" + (i === carrilActual ? " activo" : ""), x: 18, y: Y0 + i * FILA + 4 });
    txt.textContent = nombre;
    t.appendChild(txt);
  });
  const camino = [...recorrido, actual].map((id) => { const p = posicion(id); return `${p.x},${p.y}`; }).join(" ");
  t.appendChild(svg("polyline", { class: "recorrido", points: camino }));
  ORDEN.forEach((id) => {
    const s = PASOS[id], p = posicion(id);
    const estado = id === actual ? " actual" : recorrido.includes(id) ? " visto" : "";
    let nodo;
    if (s.q) nodo = svg("rect", { class: "nodo" + estado, x: p.x - 8, y: p.y - 8, width: 16, height: 16, rx: 2, transform: `rotate(45 ${p.x} ${p.y})` });
    else nodo = svg("circle", { class: "nodo" + estado, cx: p.x, cy: p.y, r: s.end ? 10 : 8, "stroke-width": s.end ? 4 : 2 });
    const titulo = svg("title"); titulo.textContent = s.t || s.q || s.end; nodo.appendChild(titulo);
    if (id === actual) t.appendChild(svg("circle", { class: "halo", cx: p.x, cy: p.y, r: 12 }));
    t.appendChild(nodo);
  });
  // Mantener el paso actual a la vista en pantallas angostas
  const marco = t.parentElement, x = (posicion(actual).x / ancho) * t.getBoundingClientRect().width;
  if (marco.scrollWidth > marco.clientWidth) marco.scrollTo({ left: x - marco.clientWidth / 2, behavior: sinMovimiento ? "auto" : "smooth" });
}

function dibujarPaso() {
  const s = PASOS[actual], caja = $("#paso");
  const hechos = recorrido.filter((id) => !PASOS[id].q).length;
  let h = `<span class="sello lleno">${CARRILES[s.l]}</span>`;
  if (s.r) h += `<span class="sello">${s.r}</span>`;
  caja.className = "paso";
  if (s.end) {
    caja.classList.add(actual === "x1" ? "fin-no" : "fin-ok");
    h += `<h3>${s.end}</h3><p>${s.d}</p>
      <div class="acciones"><button type="button" class="boton" data-ir="reiniciar">Simular de nuevo</button>
      <span class="cuenta">${hechos} actividades recorridas</span></div>`;
  } else if (s.q) {
    caja.classList.add("decision");
    h += `<span class="sello ambar">Decisión</span><h3>${s.q}</h3><p>${s.d}</p>
      <div class="acciones"><button type="button" class="boton ambar" data-ir="${s.y}">Sí</button>
      <button type="button" class="boton borde" data-ir="${s.no}">No</button></div>`;
  } else {
    h += `<h3>${s.t}</h3><p>${s.d}</p><dl>
      ${s.r ? `<dt>Regla de negocio</dt><dd><b>${s.r}.</b> ${REGLAS[s.r]}</dd>` : ""}
      <dt>Datos</dt><dd>${s.dat}</dd>
      <dt>Aplicaciones</dt><dd>${s.app}</dd>
      ${s.ev ? `<dt>Evento publicado</dt><dd><span class="sello lleno">${s.ev}</span></dd>` : ""}</dl>
      <div class="acciones"><button type="button" class="boton" data-ir="${s.n}">Siguiente paso</button>
      ${recorrido.length ? '<button type="button" class="boton borde" data-ir="atras">Paso anterior</button>' : ""}
      <span class="cuenta">Actividad ${hechos + 1}</span></div>`;
  }
  caja.innerHTML = h;
}

function avanzar(destino) {
  if (destino === "reiniciar") { actual = "a1"; recorrido = []; }
  else if (destino === "atras") { actual = recorrido.pop(); }
  else { recorrido.push(actual); actual = destino; }
  dibujarTablero(); dibujarPaso();
}
$("#paso").addEventListener("click", (e) => { const b = e.target.closest("[data-ir]"); if (b) avanzar(b.dataset.ir); });
dibujarTablero(); dibujarPaso();

$("#procesos").innerHTML = "<tr><th>Tipo</th><th>Proceso</th><th>Qué hace</th><th>Responsable</th></tr>" +
  PROCESOS.map((r) => `<tr><td><span class="sello ${r[0] === "Principal" ? "lleno" : ""}">${r[0]}</span></td><td><b>${r[1]}</b></td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join("");

// ---------------------------------------------------------- MER interactivo
let entidadElegida = "RESERVA";
function dibujarMer() {
  const caja = $("#mer");
  caja.querySelectorAll(".entidad").forEach((e) => e.remove());
  const vecinas = new Set([entidadElegida]);
  RELACIONES.forEach((r) => { if (r[0] === entidadElegida) vecinas.add(r[1]); if (r[1] === entidadElegida) vecinas.add(r[0]); });
  $("#mer-lineas").innerHTML = RELACIONES.map((r) => {
    const a = ENTIDADES[r[0]], b = ENTIDADES[r[1]], suya = r[0] === entidadElegida || r[1] === entidadElegida;
    return `<line x1="${a[0]}%" y1="${a[1]}%" x2="${b[0]}%" y2="${b[1]}%" stroke="${suya ? "#6147D9" : "#D5D0EE"}" stroke-width="${suya ? 2.5 : 1.2}"/>`;
  }).join("");
  Object.entries(ENTIDADES).forEach(([nombre, v]) => {
    const b = crear("button", "entidad" + (nombre === entidadElegida ? " elegida" : "") + (vecinas.has(nombre) ? "" : " apagada"), nombre);
    b.type = "button";
    b.style.left = v[0] + "%"; b.style.top = v[1] + "%";
    b.onclick = () => { entidadElegida = nombre; dibujarMer(); };
    caja.appendChild(b);
  });
  const v = ENTIDADES[entidadElegida];
  $("#detalle-entidad").innerHTML = `<h3>${entidadElegida}</h3><dl>
    <dt>Qué representa</dt><dd>${v[2]}</dd>
    <dt>Servicio dueño</dt><dd><span class="sello lleno">${v[3]}</span><br>Es el único que la escribe; los demás la leen por API o eventos.</dd>
    <dt>Relaciones</dt><dd>${RELACIONES.filter((r) => r[0] === entidadElegida || r[1] === entidadElegida).map((r) => `<span class="sello">${r[0]} ${r[2]} ${r[1]} (${r[3]})</span>`).join("")}</dd></dl>`;
}
dibujarMer();

// ---------------------------------------------------------- Aplicaciones
let appElegida = "Reservas y Disponibilidad";
function dibujarApps() {
  const caja = $("#capas");
  caja.innerHTML = "";
  ["Canales", "Acceso", "Servicios de negocio", "Integración", "Servicios externos"].forEach((capa) => {
    const fila = crear("div", "capa", `<b>${capa}</b>`), fichas = crear("div", "fichas");
    Object.entries(APLICACIONES).filter(([, v]) => v[0] === capa).forEach(([nombre, v]) => {
      const b = crear("button", "ficha" + (v[5] ? " critica" : "") + (capa === "Servicios externos" ? " externa" : "") + (nombre === appElegida ? " elegida" : ""), nombre);
      b.type = "button";
      b.onclick = () => { appElegida = nombre; dibujarApps(); };
      fichas.appendChild(b);
    });
    fila.appendChild(fichas); caja.appendChild(fila);
  });
  const v = APLICACIONES[appElegida];
  $("#detalle-app").innerHTML = `<h3>${appElegida}</h3>${v[5] ? '<span class="sello lleno">Confianza y seguridad</span>' : ""}<dl>
    <dt>Propósito</dt><dd>${v[1]}</dd><dt>Capa</dt><dd>${v[0]}</dd>
    <dt>Datos que maneja</dt><dd>${v[2]}</dd><dt>Procesos que soporta</dt><dd>${v[3]}</dd>
    <dt>Criticidad</dt><dd>${v[4]}</dd></dl>`;
}
dibujarApps();

let eventoElegido = "PagoAprobado";
function dibujarEventos() {
  const caja = $("#eventos");
  caja.innerHTML = "";
  Object.keys(EVENTOS).forEach((nombre) => {
    const b = crear("button", "ficha" + (nombre === eventoElegido ? " elegida" : ""), nombre);
    b.type = "button";
    b.onclick = () => { eventoElegido = nombre; dibujarEventos(); };
    caja.appendChild(b);
  });
  const [origen, reacciones] = EVENTOS[eventoElegido];
  $("#detalle-evento").innerHTML = `<div class="origen">${origen}<br><small style="font-weight:400;color:var(--tenue)">lo publica</small></div>
    <div class="evento">${eventoElegido}</div><ul>${reacciones.map((x) => `<li>${x}</li>`).join("")}</ul>`;
}
dibujarEventos();

// ---------------------------------------------------------- Tecnología
TECNOLOGIA.forEach(([titulo, texto]) => $("#tecnologias").appendChild(crear("div", "tarjeta", `<h3>${titulo}</h3><p>${texto}</p>`)));
INDICADORES.forEach(([cifra, texto]) => $("#indicadores").appendChild(crear("div", "", `<strong>${cifra}</strong><span>${texto}</span>`)));

// ---------------------------------------------------------- Transformación
let modo = "tobe";
function dibujarEstados() {
  $("#estados").innerHTML = "";
  ESTADOS.forEach((s) => $("#estados").appendChild(crear("div", "tarjeta estado-" + modo, `<h3>${s[0]}</h3><p>${modo === "asis" ? s[1] : s[2]}</p>`)));
  $$("#conmutador button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.modo === modo));
}
$$("#conmutador button").forEach((b) => (b.onclick = () => { modo = b.dataset.modo; dibujarEstados(); }));
dibujarEstados();

$("#brechas").innerHTML = "<tr><th>N.º</th><th>Brecha</th><th>Impacto</th><th>Prioridad</th><th>Fase</th></tr>" +
  BRECHAS.map((r) => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td><span class="sello ${r[3] === "Alta" ? "rojo" : r[3] === "Media" ? "ambar" : "verde"}">${r[3]}</span></td><td>${r[4]}</td></tr>`).join("");

let faseElegida = 0;
function dibujarFases() {
  $("#fases").innerHTML = "";
  FASES.forEach((f, i) => {
    const b = crear("button", "fase" + (i === faseElegida ? " elegida" : ""), `<b>${f[0]}</b><span>${f[1]}</span>`);
    b.type = "button";
    b.onclick = () => { faseElegida = i; dibujarFases(); };
    $("#fases").appendChild(b);
  });
  const f = FASES[faseElegida];
  $("#detalle-fase").innerHTML = `<h3>${f[0]} (${f[1].toLowerCase()})</h3><dl>
    <dt>Actividades</dt><dd>${f[2]}</dd><dt>Responsables</dt><dd>${f[3]}</dd>
    <dt>Hitos</dt><dd>${f[4]}</dd><dt>Brechas que cierra</dt><dd>${f[5]}</dd></dl>`;
}
dibujarFases();

// ---------------------------------------------------------- Explorador
let cadenaElegida = "4.2";
function dibujarCadena() {
  $("#objetivos-cadena").innerHTML = "";
  Object.keys(CADENA).forEach((cod) => {
    const b = crear("button", "ficha" + (cod === cadenaElegida ? " elegida" : ""), `${cod} ${OBJETIVOS[cod][0]}`);
    b.type = "button";
    b.onclick = () => { cadenaElegida = cod; dibujarCadena(); };
    $("#objetivos-cadena").appendChild(b);
  });
  const c = CADENA[cadenaElegida];
  $("#cadena").innerHTML = [["Objetivo", OBJETIVOS[cadenaElegida][1]], ["Capacidad", c[0]], ["Proceso", c[1]], ["Datos", c[2]], ["Aplicaciones", c[3]], ["Tecnología", c[4]]]
    .map(([a, b]) => `<li><b>${a}</b><p>${b}</p></li>`).join("");
}
dibujarCadena();

$("#adm").innerHTML = "<tr><th>Fase TOGAF ADM</th><th>Qué se hizo en FlexiDrive</th><th>Dónde verlo</th></tr>" +
  ADM.map((r) => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("");

// ---------------------------------------------------------- Visor de diagramas
const visor = $("#visor");
$$("img.diagrama").forEach((img) => img.addEventListener("click", () => {
  visor.querySelector("img").src = img.src;
  visor.querySelector("img").alt = img.alt;
  visor.hidden = false;
  $("#visor-cerrar").focus();
}));
const cerrarVisor = () => { visor.hidden = true; };
$("#visor-cerrar").addEventListener("click", cerrarVisor);
visor.addEventListener("click", (e) => { if (e.target === visor || e.target.classList.contains("visor-lienzo")) cerrarVisor(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarVisor(); });

// ---------------------------------------------------------- Arranque
mostrar(location.hash.slice(1) || "inicio");
window.addEventListener("load", () => window.scrollTo(0, 0));
