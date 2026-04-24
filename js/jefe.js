import { auth, db } from "./firebase-init.js";
import { protegerRuta } from "./guard.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const jefeInfo = document.getElementById("jefeInfo");
const tablaPersonal = document.getElementById("tablaPersonal");
const resumenGeneral = document.getElementById("resumenGeneral");
const mesFiltro = document.getElementById("mesFiltro");
const btnFiltrar = document.getElementById("btnFiltrar");
const btnSalir = document.getElementById("btnSalir");

function getMesActual() {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function pintarResumen(datos) {
  const total = datos.reduce((acc, p) => acc + p.total, 0);
  const delitos = datos.reduce((acc, p) => acc + p.delito, 0);
  const infracciones = datos.reduce((acc, p) => acc + p.infraccion, 0);
  const prevenciones = datos.reduce((acc, p) => acc + p.prevencion, 0);

  resumenGeneral.innerHTML = `
    <article class="card stat-card"><span class="label">Total resultados</span><strong>${total}</strong></article>
    <article class="card stat-card"><span class="label">Delitos</span><strong>${delitos}</strong></article>
    <article class="card stat-card"><span class="label">Infracciones</span><strong>${infracciones}</strong></article>
    <article class="card stat-card"><span class="label">Prevenciones</span><strong>${prevenciones}</strong></article>
  `;
}

async function cargarTablero(perfil, mes) {
  tablaPersonal.innerHTML = `<tr><td colspan="7">Cargando información...</td></tr>`;

  try {
    const q = query(
      collection(db, "resultadosOperativos"),
      where("seccion", "==", perfil.seccion || "Gualeguay"),
      where("mes", "==", mes)
    );

    const snap = await getDocs(q);
    const resumen = {};

    snap.forEach((docu) => {
      const item = docu.data();
      if (!resumen[item.uid]) {
        resumen[item.uid] = {
          nombre: item.nombre || "Sin nombre",
          dni: item.dni || "Sin DNI",
          total: 0,
          puntos: 0,
          delito: 0,
          infraccion: 0,
          prevencion: 0
        };
      }

      resumen[item.uid].total += 1;
      resumen[item.uid].puntos += Number(item.puntos || 1);
      if (item.categoria === "delito") resumen[item.uid].delito += 1;
      if (item.categoria === "infraccion") resumen[item.uid].infraccion += 1;
      if (item.categoria === "prevencion") resumen[item.uid].prevencion += 1;
    });

    const datos = Object.values(resumen).sort((a, b) => b.puntos - a.puntos);
    pintarResumen(datos);

    tablaPersonal.innerHTML = datos.length
      ? datos.map((p, index) => `
        <tr>
          <td><strong>${index + 1}</strong></td>
          <td>${p.nombre}</td>
          <td>${p.dni}</td>
          <td><strong>${p.total}</strong></td>
          <td>${p.puntos}</td>
          <td>${p.delito}</td>
          <td>${p.infraccion}</td>
          <td>${p.prevencion}</td>
        </tr>
      `).join("")
      : `<tr><td colspan="8">Sin resultados cargados para el mes seleccionado.</td></tr>`;
  } catch (error) {
    console.error("Error al cargar tablero:", error);
    tablaPersonal.innerHTML = `<tr><td colspan="8">No se pudo cargar el tablero. Revisá reglas o índices de Firestore.</td></tr>`;
  }
}

protegerRuta("jefe", async (_user, perfil) => {
  const mes = getMesActual();
  mesFiltro.value = mes;
  jefeInfo.textContent = `${perfil.nombre || "Jefe de Sección"} | ${perfil.seccion || "Gualeguay"}`;

  await cargarTablero(perfil, mes);

  btnFiltrar?.addEventListener("click", () => {
    cargarTablero(perfil, mesFiltro.value || getMesActual());
  });

  btnSalir?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "./index.html";
  });
});
