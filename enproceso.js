// Configuración inicial
let selectedProduct = null;
let selectedPrice = null;
let paypalButtonsRendered = false;

// Crear partículas animadas en el fondo
function createParticles() {
    const container = document.getElementById('particles');
    const particleCount = 60;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Tamaño aleatorio
        const size = Math.random() * 6 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Posición aleatoria
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Color verde con variación
        const greenValue = Math.floor(Math.random() * 100 + 100);
        const colorType = Math.random();
        
        if (colorType < 0.33) {
            particle.style.backgroundColor = `rgba(0, ${greenValue}, 80, ${Math.random() * 0.4 + 0.1})`;
        } else if (colorType < 0.66) {
            particle.style.backgroundColor = `rgba(255, ${Math.floor(greenValue * 0.8)}, 0, ${Math.random() * 0.3 + 0.1})`;
        } else {
            particle.style.backgroundColor = `rgba(0, ${Math.floor(greenValue * 1.2)}, 255, ${Math.random() * 0.3 + 0.1})`;
        }
        
        // Animación
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
        
        container.appendChild(particle);
    }
}

// Filtrar productos por categoría
function filterProducts() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const products = document.querySelectorAll('.product-card');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover clase active de todos los botones
            categoryBtns.forEach(b => b.classList.remove('active'));
            // Agregar clase active al botón clickeado
            this.classList.add('active');
            
            const category = this.dataset.category;
            
            products.forEach(product => {
                if (category === 'all' || product.dataset.category === category) {
                    product.style.display = 'block';
                    setTimeout(() => {
                        product.style.opacity = '1';
                        product.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    product.style.opacity = '0';
                    product.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        product.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Manejar compra de productos
function setupPurchaseButtons() {
    const buyButtons = document.querySelectorAll('.btn-buy');
    
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            selectedProduct = this.dataset.product;
            selectedPrice = this.dataset.price;
            
            // Actualizar modal con información del producto
            document.getElementById('modalProductName').textContent = selectedProduct;
            document.getElementById('modalProductPrice').textContent = `$${selectedPrice}`;
            
            // Mostrar modal de compra
            document.getElementById('purchaseModal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });
}

// Configurar PayPal
function setupPayPal() {
    // Reemplazar 'TU_CLIENT_ID_AQUI' con tu Client ID real de PayPal
    paypal.Buttons({
        style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'pill',
            label: 'paypal'
        },
        createOrder: function(data, actions) {
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            
            return actions.order.create({
                purchase_units: [{
                    description: `${selectedProduct} - ${username}`,
                    amount: {
                        value: selectedPrice,
                        currency_code: 'USD'
                    }
                }],
                application_context: {
                    shipping_preference: 'NO_SHIPPING'
                }
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                // Enviar notificación al staff
                sendOrderToStaff(details);
                
                // Mostrar modal de éxito
                showSuccessModal(details);
                
                // Enviar correo de confirmación al usuario
                sendConfirmationEmail(details);
            });
        },
        onError: function(err) {
            console.error('Error en PayPal:', err);
            alert('Ocurrió un error al procesar el pago. Por favor, intenta de nuevo.');
        }
    }).render('#paypal-button-container');
}

// Enviar pedido al staff (simulación)
function sendOrderToStaff(orderDetails) {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const transactionId = orderDetails.id;
    
    // Aquí normalmente enviarías esto a un servidor
    // Para este ejemplo, simularemos el envío
    
    const orderData = {
        product: selectedProduct,
        price: selectedPrice,
        username: username,
        email: email,
        transactionId: transactionId,
        date: new Date().toISOString(),
        status: 'pending'
    };
    
    // Guardar en localStorage para simulación
    const orders = JSON.parse(localStorage.getItem('nivorxy_orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('nivorxy_orders', JSON.stringify(orders));
    
    console.log('Pedido enviado al staff:', orderData);
    
    // Aquí podrías hacer una petición HTTP a tu servidor
    // fetch('/api/orders', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(orderData)
    // });
}

// Mostrar modal de éxito
function showSuccessModal(orderDetails) {
    const transactionId = orderDetails.id;
    const username = document.getElementById('username').value;
    
    // Actualizar información en el modal
    document.getElementById('transactionId').textContent = transactionId;
    document.getElementById('successProduct').textContent = selectedProduct;
    document.getElementById('successPrice').textContent = `$${selectedPrice}`;
    document.getElementById('successMessage').textContent = 
        `¡Gracias por tu compra, ${username}! Tu pedido ha sido procesado correctamente.`;
    
    // Ocultar modal de compra
    document.getElementById('purchaseModal').style.display = 'none';
    
    // Mostrar modal de éxito
    document.getElementById('successModal').style.display = 'flex';
    
    // Limpiar formulario
    document.getElementById('purchaseForm').reset();
}

// Enviar correo de confirmación (simulación)
function sendConfirmationEmail(orderDetails) {
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    
    // Aquí normalmente enviarías un correo real
    console.log(`Correo enviado a ${email} - Confirmación de compra para ${username}`);
}

// Configurar modales
function setupModals() {
    // Modal de compra
    const purchaseModal = document.getElementById('purchaseModal');
    const closeModalBtn = purchaseModal.querySelector('.modal-close');
    const cancelBtn = purchaseModal.querySelector('.btn-cancel');
    
    // Cerrar modal con botón X
    closeModalBtn.addEventListener('click', () => {
        purchaseModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    // Cerrar modal con botón Cancelar
    cancelBtn.addEventListener('click', () => {
        purchaseModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    // Cerrar modal haciendo click fuera
    purchaseModal.addEventListener('click', (e) => {
        if (e.target === purchaseModal) {
            purchaseModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Modal de éxito
    const successModal = document.getElementById('successModal');
    const closeSuccessBtn = successModal.querySelector('.btn-close-success');
    
    closeSuccessBtn.addEventListener('click', () => {
        successModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Manejar envío del formulario
    const purchaseForm = document.getElementById('purchaseForm');
    purchaseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar formulario
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const paymentMethod = document.getElementById('paymentMethod').value;
        const terms = document.getElementById('terms').checked;
        
        if (!username || !email || !paymentMethod || !terms) {
            alert('Por favor, completa todos los campos y acepta los términos.');
            return;
        }
        
        // Aquí se procesaría el pago con PayPal
        // Por ahora, simularemos un pago exitoso
        if (paymentMethod === 'paypal') {
            // Mostrar botón de PayPal si no se ha mostrado
            const paypalContainer = document.createElement('div');
            paypalContainer.id = 'paypal-button-container';
            purchaseForm.appendChild(paypalContainer);
            
            if (!paypalButtonsRendered) {
                setupPayPal();
                paypalButtonsRendered = true;
            }
        } else {
            // Simular pago con tarjeta
            setTimeout(() => {
                const mockOrderDetails = {
                    id: 'NIV-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    status: 'COMPLETED'
                };
                
                sendOrderToStaff(mockOrderDetails);
                showSuccessModal(mockOrderDetails);
            }, 2000);
        }
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    filterProducts();
    setupPurchaseButtons();
    setupModals();
    
    // Efecto de escritura en títulos
    const title = document.querySelector('.section-title');
    const originalText = title.textContent;
    title.textContent = '';
    
    let i = 0;
    function typeWriter() {
        if (i < originalText.length) {
            title.textContent += originalText.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    }
    
    setTimeout(typeWriter, 300);
    
    // Agregar efecto 3D a las tarjetas
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateY = ((x - centerX) / centerX) * 5;
            const rotateX = ((centerY - y) / centerY) * 5;
            
            card.style.transform = `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(-10px) rotateX(0) rotateY(0)';
        });
    });
    
    // Panel de administración para el staff (solo visible con contraseña)
    // Esto es opcional y se puede activar desde la consola
    window.showStaffPanel = function() {
        const password = prompt('Ingresa la contraseña del staff:');
        if (password === 'nivorxy2025') { // Cambia esta contraseña
            const orders = JSON.parse(localStorage.getItem('nivorxy_orders') || '[]');
            alert(`Pedidos pendientes: ${orders.length}\n\n${JSON.stringify(orders, null, 2)}`);
        } else {
            alert('Contraseña incorrecta');
        }
    };
});

// Función para exportar pedidos (para el staff)
function exportOrders() {
    const orders = JSON.parse(localStorage.getItem('nivorxy_orders') || '[]');
    const dataStr = JSON.stringify(orders, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `nivorxy_orders_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
