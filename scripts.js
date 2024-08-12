const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', function() {
    navLinks.classList.toggle('active');
});


// Banner Slider

let currentSlide = 0;

function showSlide(index) {
    const slides = document.querySelectorAll('.slide');
    if (index >= slides.length) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = slides.length - 1;
    } else {
        currentSlide = index;
    }
    const offset = -currentSlide * 100;
    document.querySelector('.slider').style.transform = `translateX(${offset}%)`;
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function prevSlide() {
    showSlide(currentSlide - 1);
}

document.addEventListener('DOMContentLoaded', () => {
    showSlide(currentSlide);
    setInterval(nextSlide, 3000); // Cambia cada 3 segundos
});

// seccion de pedidos

document.addEventListener('DOMContentLoaded', function () {
    // Selecciona todos los <a> con la clase 'elegirPedido'
    const elegirPedidoLinks = document.querySelectorAll('a.elegirPedido');

    // Carga el archivo de sonido
    const clickSound = new Audio('/sound/sound-elegirPedido.mp3'); // Asegúrate de que la ruta sea correcta

    // Agrega el event listener a cada enlace
    elegirPedidoLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            clickSound.play();
        });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    fetch('productos.json')
        .then(response => {
            if (!response.ok) {
                console.error('La respuesta de la red no fue exitosa', response.statusText);
                throw new Error('La respuesta de la red no fue exitosa: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const categoria = 'comida-rapida'; // Filtrar por categoría de comida rápida
            const productosFiltrados = data.productos.filter(producto => producto.categoria === categoria);
            populateMenu(productosFiltrados);
        })
        .catch(error => {
            console.error('Hubo un problema con la operación de fetch:', error);
            document.getElementById('menu').innerHTML = '<p>Lo siento, no pudimos cargar los artículos del menú en este momento.</p>';
        });
});

function populateMenu(data) {
    const menu = document.getElementById('menu');
    menu.innerHTML = '';

    data.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" id="${item.id}" value="${item.name}">
            <label for="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                ${item.name} <span class="price">$${item.price}</span>
                <div class="quantity">
                    <button class="minus">-</button>
                    <input type="number" value="0" min="0">
                    <button class="plus">+</button>
                </div>
            </label>
        `;
        menu.appendChild(li);
    });

    // Llama a la función para agregar los controles de cantidad después de que todos los elementos han sido añadidos al DOM.
    addQuantityControls();
}


function addQuantityControls() {
    const quantityControls = document.querySelectorAll('.quantity button');
    const sound = new Audio('./sound/button-click.mp3'); // Cambia la ruta al archivo de sonido según corresponda

    quantityControls.forEach(button => {
        button.addEventListener('click', function () {
            // Reproduce el sonido cada vez que se hace clic en un botón
            sound.play();

            // Obtiene el input y el checkbox asociado al control de cantidad.
            const input = this.parentNode.querySelector('input');
            const checkbox = this.parentNode.parentNode.previousElementSibling;
            let value = parseInt(input.value);

            if (this.classList.contains('plus')) {
                // Incrementa la cantidad en 1 y marca el checkbox.
                input.value = value + 1;
                checkbox.checked = true;
                Toastify({
                    text: "Cantidad incrementada",
                    duration: 3000
                }).showToast();
            } else if (this.classList.contains('minus') && value > 0) {
                // Decrementa la cantidad en 1 si es mayor a 0 y desmarca el checkbox si la cantidad llega a 0.
                input.value = value - 1;
                if (input.value == 0) {
                    checkbox.checked = false;
                }
                Toastify({
                    text: "Cantidad decrementada",
                    duration: 3000
                }).showToast();
            }
        });
    });

    document.getElementById('sendOrder').addEventListener('click', function () {
        // Cargar el archivo de sonido
        const sendOrderSound = new Audio('/sound/sound-sendOrder.mp3'); // Asegúrate de que la ruta sea correcta
    
        // Reproduce el sonido al hacer clic en 'sendOrder'
        sendOrderSound.play();
    
        const checkedBoxes = document.querySelectorAll('#menu input[type="checkbox"]:checked');
        
        // Crea un array de objetos con el nombre del ítem, cantidad y precio usando lodash.
        let order = _.map(checkedBoxes, checkbox => {
            const label = checkbox.nextElementSibling;
            const quantity = parseInt(label.querySelector('.quantity input').value);
            const price = parseFloat(label.querySelector('.price').textContent.replace('$', ''));
            return { foodItem: checkbox.value, quantity, price };
        });
    
        // Validación: verifica si alguna cantidad es menor o igual a 0.
        const invalidSelection = _.some(order, item => item.quantity <= 0);
        if (invalidSelection) {
            // Si hay una selección inválida, muestra una notificación de error.
            Toastify({
                text: "Por favor, asegúrate de que todas las cantidades sean mayores a 0.",
                duration: 3000,
                backgroundColor: "#FF0000"
            }).showToast();
            return;
        }
    
        // Calcula el precio total del pedido usando lodash.
        const totalPrice = _.sumBy(order, item => item.price * item.quantity);
    
        if (order.length > 0) {
            // Si hay un pedido válido, muestra el resumen en un modal.
            const message = `Hola, me gustaría pedir:\n${_.map(order, item => `${item.quantity} x ${item.foodItem} ($${(item.price * item.quantity).toFixed(2)})`).join('\n')}\nTotal: $${totalPrice.toFixed(2)}`;
            showModal(message);
        } else {
            // Si no se seleccionó ningún ítem, muestra una notificación de error.
            Toastify({
                text: "Por favor, selecciona al menos una comida y especifica la cantidad.",
                duration: 3000,
                backgroundColor: "#FF0000"
            }).showToast();
        }
    });
    

    // Escucha el evento para cerrar el modal de confirmación.
    document.getElementById('close-modal').addEventListener('click', function () {
        hideModal();
    });

// Escucha el evento para confirmar el pedido y abrir WhatsApp con el mensaje preformateado.
document.getElementById('confirm-order').addEventListener('click', function () {
    const message = document.getElementById('modal-message').textContent;
    const phoneNumber = '543704058731';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    hideModal();

    // Reproduce el sonido al confirmar el pedido
    let sound = new Audio('./sound/sound-enviar-pedido.mp3');
    sound.play();
});
}


function showModal(message) {
    // Muestra el modal con el mensaje de confirmación del pedido.
    const modal = document.getElementById('modal-confirmation');
    const modalMessage = document.getElementById('modal-message');
    modalMessage.textContent = message;
    modal.style.display = 'block';
}


function hideModal() {
    // Oculta el modal de confirmación.
    const modal = document.getElementById('modal-confirmation');
    modal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
    // Selecciona todos los <a> con la clase 'elegirPedido'
    const elegirPedidoLinks = document.querySelectorAll('a.elegirPedido');

    // Carga el archivo de sonido
    const clickSound = new Audio('/sound/sound-elegirPedido.mp3'); // Asegúrate de que la ruta sea correcta

    // Agrega el event listener a cada enlace
    elegirPedidoLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            clickSound.play();
        });
    });
});

// Funcionalidad del botón de WhatsApp para abrir una ventana emergente y enviar mensajes.
popupWhatsApp = () => {
    let btnClosePopup = document.querySelector('.closePopup');
    let btnOpenPopup = document.querySelector('.whatsapp-button');
    let popup = document.querySelector('.popup-whatsapp');
    let sendBtn = document.getElementById('send-btn');
  
    // Escucha el evento para cerrar la ventana emergente de WhatsApp.
    btnClosePopup.addEventListener("click",  () => {
        popup.classList.toggle('is-active-whatsapp-popup');
    });
    
    // Escucha el evento para abrir la ventana emergente de WhatsApp.
    btnOpenPopup.addEventListener("click",  () => {
        popup.classList.toggle('is-active-whatsapp-popup');
        popup.style.animation = "fadeIn .6s 0.0s both";
    });
    
    // Escucha el evento para enviar el mensaje de WhatsApp.
    sendBtn.addEventListener("click", () => {
        let msg = document.getElementById('whats-in').value;
        let relmsg = msg.replace(/ /g, "%20");
        window.open('https://wa.me/+543704058731?text=' + relmsg, '_blank'); 
    });
  
    // Lo tengo comentado porque ahora no quiero mostrar el popup automáticamente después de 3 segundos.

    // setTimeout(() => {
    //     popup.classList.toggle('is-active-whatsapp-popup');
    // }, 3000);
}
  
popupWhatsApp();
