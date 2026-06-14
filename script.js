/* =========================
   VARIABLES Y CONFIGURACIÓN
========================= */
let productos = []; 
let carrito = [];

const contenedor = document.getElementById("productos");
const itemsCarrito = document.getElementById("itemsCarrito");
const total = document.getElementById("total");
const contador = document.getElementById("contador");


/* =========================
   VARIABLES DE SECCIÓN (Agregar al inicio de tu JS)
========================= */
let seccionActual = "pasteleria"; // Por defecto arranca mostrando lo dulce

/* =========================
   CARGAR PRODUCTOS DESDE JSON
========================= */
function renderizarProductos(listaProductos) {
  if (!contenedor) return;
  contenedor.innerHTML = ""; 

  for (let i = 0; i < listaProductos.length; i++) {
    let p = listaProductos[i];

    if (p._nota || !p.visible) continue; 

    // FILTRO DE CATEGORÍA: Si el producto no pertenece a la sección activa, lo salteamos
    if (p.categoria !== seccionActual) continue;

    let card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-nombre", p.nombre); 

    let precioHTML = "";
    let botonesHTML = "";

    if (p.opciones && p.opciones.length > 0) {
      precioHTML = '<p class="precio">' + p.precio_rango + '</p>';
      
      for (let j = 0; j < p.opciones.length; j++) {
        let opcion = p.opciones[j];
        botonesHTML += 
          '<button class="agregar" style="margin-bottom:5px;" onclick="agregarProducto(\'' + p.nombre + ' (x' + opcion.cantidad + ')\', ' + opcion.precio + ')">' + 
          opcion.texto + 
          '</button>';
      }
    } else {
      precioHTML = '<p class="precio">$' + p.precio + '</p>';
      botonesHTML = '<button class="agregar" onclick="agregarProducto(\'' + p.nombre + '\', ' + p.precio + ')">Agregar</button>';
    }

    card.innerHTML =
      '<img src="' + p.imagen + '" class="imagen-producto">' +
      '<div class="info" style="display:flex; flex-direction:column; align-items:center; width:100%;">' +
      precioHTML +
      '<div class="contenedor-botones" style="display:flex; flex-direction:column; width:100%; padding:0 10px;">' +
        botonesHTML +
      '</div>' +
      '</div>';

    contenedor.appendChild(card);
  }
}

fetch("productos.json")
  .then(response => {
    if (!response.ok) throw new Error("No se pudo cargar el archivo JSON");
    return response.json();
  })
  .then(data => {
    productos = data; 
    renderizarProductos(productos); 
  })
  .catch(error => {
    console.error("Error al cargar los productos:", error);
    if (contenedor) {
      contenedor.innerHTML = "<p>Hubo un error al cargar el menú. Inténtalo más tarde.</p>";
    }
  });

/* =========================
   CONTROL DE SECCIONES Y VALIDACIÓN +18
========================= */

// Cambia de sección de manera limpia restableciendo el renderizado
function cambiarSeccion(nuevaSeccion) {
  seccionActual = nuevaSeccion;
  renderizarProductos(productos);
}

// Al presionar el botón de Bebidas en tu tienda
function intentarVerBebidas() {
  // Ahora revisa la sesión actual de la pestaña abierta
  if (sessionStorage.getItem("esMayorDeEdad") === "true") {
    cambiarSeccion("bebidas");
  } else {
    // Si no ha confirmado, disparamos el pop-up flotante en pantalla
    const cartel = document.getElementById("cartel-verificacion");
    if (cartel) cartel.style.display = "flex";
  }
}

// Si hace click en "Sí, continuar"
function confirmarMayorDeEdad() {
  sessionStorage.setItem("esMayorDeEdad", "true"); // Registra la confirmación solo por esta sesión
  const cartel = document.getElementById("cartel-verificacion");
  if (cartel) cartel.style.display = "none";
  cambiarSeccion("bebidas"); // Muestra las bebidas
}

// Si hace click en "No, volver al menú principal"
function volverAlMenuPrincipal() {
  const cartel = document.getElementById("cartel-verificacion");
  if (cartel) cartel.style.display = "none";
  cambiarSeccion("pasteleria"); // Asegura que permanezca en la sección base
}


/* =========================
   CARRITO
========================= */
function agregarProducto(nombreFinal, precioSeleccionado) {
  let productoParaCarrito = {
    nombre: nombreFinal,
    precio: precioSeleccionado
  };

  carrito.push(productoParaCarrito);
  actualizarCarrito();
}

function eliminarProducto(index) {
  carrito.splice(index, 1);
  actualizarCarrito();
}

function vaciarCarrito() {
  const confirmar = confirm("¿Estás seguro de que quieres vaciar todo el carrito?");
  if (confirmar) {
    carrito.length = 0; 
    actualizarCarrito();
  }
}

/* ====================================================
   ACTUALIZAR INTERFAZ (Tu original + control de visibilidad)
==================================================== */
function actualizarCarrito() {
  const itemsCarritoElem = document.getElementById("itemsCarrito");
  if (!itemsCarritoElem) return; 

  itemsCarritoElem.innerHTML = "";
  
  let sumaTradicionales = 0;
  let sumaDonitas = 0;
  let cantidadTradicionales = 0;

  for (let i = 0; i < carrito.length; i++) {
    let p = carrito[i];

    itemsCarritoElem.innerHTML +=
      '<div class="item">' +
      '<div><strong>' + p.nombre + '</strong><br>$' + p.precio + '</div>' +
      '<button onclick="eliminarProducto(' + i + ')">✖</button>' +
      '</div>';

    if (p.nombre.toUpperCase().includes("DONITAS") || 
    p.nombre.toUpperCase().includes("PONCHE") || 
    p.nombre.toUpperCase().includes("MICHE") || 
    p.nombre.toUpperCase().includes("BAILEYS") ||
    p.nombre.includes("(x")) {
      
      sumaDonitas += p.precio;
      
    } else {
      sumaTradicionales += p.precio;
      cantidadTradicionales++; 
    }
  }

  let totalFinal = sumaTradicionales + sumaDonitas;

  // Lógica de cálculo y visualización del descuento
  if (cantidadTradicionales >= 3) {
    let descuento = sumaTradicionales * 0.05; 
    let subtotalTradicionalesConDesc = sumaTradicionales - descuento;
    totalFinal = subtotalTradicionalesConDesc + sumaDonitas;
    
    // Aquí agregamos el resumen visual del ahorro
    itemsCarritoElem.innerHTML +=
      '<div class="item" style="border-top: 1px solid #ddd; padding-top: 10px;">' +
      '<div><strong style="color: green;">Descuento Postres 5% OFF</strong></div>' +
      '<div style="text-align: right;">' +
        '<span style="text-decoration: line-through; color: #888; font-size: 13px; margin-right: 5px;">$' + sumaTradicionales.toFixed(2) + '</span>' +
        '<strong>$' + subtotalTradicionalesConDesc.toFixed(2) + '</strong>' +
      '</div>' +
      '</div>';
  }

  if (total) total.textContent = totalFinal.toFixed(2);
  if (contador) contador.textContent = carrito.length;

  // CONTROL DE VISIBILIDAD (Ocultar si está vacío)
  const bloqueEnvio = document.getElementById("bloqueEnvio");
  if (bloqueEnvio) {
    bloqueEnvio.style.display = carrito.length === 0 ? "none" : "";
  }

  const btnVaciar = document.getElementById("vaciarCarritoBtn");
  if (btnVaciar) {
    btnVaciar.style.display = carrito.length === 0 ? "none" : "block";
  }
}


/* =========================
   ABRIR / CERRAR PANEL CARRITO
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const carritoPanel = document.getElementById("carrito");
  const abrirBtn = document.getElementById("abrirCarrito");
  const cerrarBtn = document.getElementById("cerrarCarrito");

  if (abrirBtn && carritoPanel) {
    abrirBtn.addEventListener("click", () => {
      carritoPanel.classList.toggle("abierto");
    });
  }

  if (cerrarBtn && carritoPanel) {
    cerrarBtn.addEventListener("click", () => {
      carritoPanel.classList.remove("abierto");
    });
  }
});

/* ====================================================
BOTÓN DE ENVIAR PEDIDO POR WHATSAPP (Tu original + Cantidad total)
==================================================== */
const btnWhatsApp = document.getElementById("enviarWhatsapp");

if (btnWhatsApp) {
  btnWhatsApp.onclick = function () {
    if (carrito.length === 0) {
      alert("Agrega productos al carrito");
      return;
    }

    const calle = document.getElementById("envioCalle") ? document.getElementById("envioCalle").value.trim() : "";
    const numero = document.getElementById("envioNumero") ? document.getElementById("envioNumero").value.trim() : "";
    const localidad = document.getElementById("envioLocalidad") ? document.getElementById("envioLocalidad").value.trim() : "";

    if (!calle || !numero || !localidad) {
      alert("Por favor, completa Calle, Número y Localidad para poder realizar el envío.");
      return;
    }

    let mensaje = "🧁 *NUEVO PEDIDO - SWEET SPOT* 🧁\n";
    mensaje += "----------------------------------------\n\n";
    mensaje += "Hola! Me gustaría realizar el siguiente pedido:\n\n";

    let sumaTradicionales = 0;
    let sumaDonitas = 0;
    let cantidadTradicionales = 0;
    let resumen = {};
    let totalItemsPedidos = carrito.length; // AGREGADO: Cantidad de productos para tu control

    for (let i = 0; i < carrito.length; i++) {
      let n = carrito[i].nombre;
      let p = carrito[i].precio;

      if (resumen[n]) {
        resumen[n].cantidad++;
      } else {
        resumen[n] = { cantidad: 1, precio: p };
      }

      if (n.toUpperCase().includes("DONITAS") || n.includes("(x")) {
        sumaDonitas += p;
      } else {
        sumaTradicionales += p;
        cantidadTradicionales++;
      }
    }

    for (let p in resumen) {
      let subtotalItem = resumen[p].cantidad * resumen[p].precio;
      mensaje += "▪️ *" + resumen[p].cantidad + "x* " + p + " _($" + subtotalItem + ")_\n";
    }

    // AGREGADO: Muestra la cantidad total abajo de la lista de productos
    mensaje += "🛍️ *CANTIDAD DE PRODUCTOS:* [" + totalItemsPedidos + "] \n";


    mensaje += "\n----------------------------------------\n";
    mensaje += "📍 *DATOS DE ENTREGA:*\n";
    mensaje += "Dirección: " + calle + " " + numero + "\n";
    mensaje += "Localidad: " + localidad + "\n";
    mensaje += "----------------------------------------\n";

    let cuentaFinalPedido = sumaTradicionales + sumaDonitas;

    if (cantidadTradicionales >= 3) {
      let d = sumaTradicionales * 0.05; 
      cuentaFinalPedido = (sumaTradicionales - d) + sumaDonitas;

      mensaje += "Subtotal: $" + (sumaTradicionales + sumaDonitas) + "\n";
      mensaje += "🎁 *Descuento (5% OFF aplicado):* -$" + d.toFixed(2) + "\n";
    }

    mensaje += "💰 *TOTAL A PAGAR: $" + cuentaFinalPedido.toFixed(2) + "*\n\n";
    mensaje += "----------------------------------------\n";
    mensaje += "Quedo a la espera de la confirmación y los datos para el pago. ¡Muchas gracias! ✨";

    window.location.href = "https://wa.me/5491160261554?text=" + encodeURIComponent(mensaje);
  };
}

/* ====================================================
   MODAL INTELIGENTE 
==================================================== */
const modal = document.getElementById("modalImagen");
const imagenGrande = document.getElementById("imagenGrande");
const cerrarModal = document.getElementById("cerrarModal");
const btnModal = document.getElementById("agregarModal");
const contenedorVariantes = document.getElementById("contenedorVariantes");

let productoModal = null;
let opcionSeleccionada = null; 

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("imagen-producto")) {
    if (!imagenGrande || !modal) return;
    
    imagenGrande.src = e.target.src;
    
    if (contenedorVariantes) {
      contenedorVariantes.innerHTML = "";
    }
    opcionSeleccionada = null;

    const cardContenedora = e.target.closest(".card");
    if (!cardContenedora) return;

    const nombreProducto = cardContenedora.getAttribute("data-nombre");
    productoModal = productos.find(p => p.nombre === nombreProducto);

    if (productoModal) {
      if (productoModal.opciones && productoModal.opciones.length > 0) {
        opcionSeleccionada = productoModal.opciones[0]; 

        let botonesHTML = "";
        productoModal.opciones.forEach((opc, index) => {
          const claseActivo = index === 0 ? "btn-variante activo" : "btn-variante";
          botonesHTML += `
            <button type="button" class="${claseActivo}" data-index="${index}">
              Cantidad: ${opc.cantidad === 6 ? 'x6' : 'x12'}
            </button>
          `;
        });
        
        if (contenedorVariantes) {
          contenedorVariantes.innerHTML = botonesHTML;
        }
      }
    }

    modal.classList.add("activo");
  }
});

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-variante")) {
    document.querySelectorAll(".btn-variante").forEach(btn => btn.classList.remove("activo"));
    e.target.classList.add("activo");
    
    const index = parseInt(e.target.dataset.index);
    if (productoModal && productoModal.opciones) {
      opcionSeleccionada = productoModal.opciones[index];
    }
  }
});

if (cerrarModal) {
  cerrarModal.onclick = () => {
    if (modal) modal.classList.remove("activo");
  };
}

if (btnModal) {
  btnModal.onclick = function () {
    if (productoModal) {
      let nombreFinal;
      let precioFinal;

      if (opcionSeleccionada) {
        nombreFinal = `${productoModal.nombre} (x${opcionSeleccionada.cantidad})`;
        precioFinal = opcionSeleccionada.precio;
      } else {
        nombreFinal = productoModal.nombre;
        precioFinal = productoModal.precio;
      }

      agregarProducto(nombreFinal, precioFinal);
      if (modal) modal.classList.remove("activo");
    }
  };
}
