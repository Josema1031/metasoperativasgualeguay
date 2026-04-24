import { auth, db } from "./firebase-init.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");
const loginMsg = document.getElementById("loginMsg");

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  loginMsg.textContent = "Ingresando...";

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    const usuarioRef = doc(db, "usuarios", uid);
    const usuarioSnap = await getDoc(usuarioRef);

    if (!usuarioSnap.exists()) {
      loginMsg.textContent = "El usuario no tiene perfil cargado en Firestore.";
      return;
    }

    const usuario = usuarioSnap.data();

    if (usuario.rol === "jefe") {
      window.location.href = "./dashboard-jefe.html";
      return;
    }

    if (usuario.rol === "personal") {
      window.location.href = "./dashboard-personal.html";
      return;
    }

    loginMsg.textContent = "Rol no reconocido.";
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    loginMsg.textContent = "Correo o contraseña incorrectos.";
  }
});