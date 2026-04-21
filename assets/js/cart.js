/**
 * Carrito de Compras - Pika Snacks
 * Módulo separado en: Lógica (Cart) y Renderizado (CartUI)
 * Persistencia con localStorage, checkout por WhatsApp.
 */

// ==========================================
// LÓGICA DEL CARRITO (Datos y localStorage)
// ==========================================

const Cart = {
    items: [],
    STORAGE_KEY: 'pikasnacks_cart',
    WHATSAPP_NUMBER: '573009090774',

    init() {
        this.load();
    },

    load() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            this.items = data ? JSON.parse(data) : [];
        } catch {
            this.items = [];
        }
    },

    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
    },

    addItem(id, nombre, precio) {
        const existing = this.items.find(item => item.id === id);
        if (existing) {
            existing.cantidad += 1;
        } else {
            this.items.push({ id, nombre, precio: Number(precio), cantidad: 1 });
        }
        this.save();
    },

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.save();
    },

    updateQuantity(id, delta) {
        const item = this.items.find(i => i.id === id);
        if (!item) return;
        item.cantidad += delta;
        if (item.cantidad <= 0) {
            this.removeItem(id);
            return;
        }
        this.save();
    },

    getTotal() {
        return this.items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    },

    getItemCount() {
        return this.items.reduce((sum, item) => sum + item.cantidad, 0);
    },

    clear() {
        this.items = [];
        this.save();
    }
};


// ==========================================
// RENDERIZADO DEL CARRITO (Manipulación DOM)
// ==========================================

const CartUI = {

    init() {
        this.injectCartIcon();
        this.injectOffcanvas();
        this.bindProductButtons();
        this.updateBadge();
    },

    // Formatea un número como moneda colombiana ($XX.XXX)
    formatPrice(value) {
        return '$' + value.toLocaleString('es-CO');
    },

    // Inyecta el ícono flotante del carrito en la esquina inferior izquierda
    injectCartIcon() {
        const btn = document.createElement('button');
        btn.id = 'cart-floating-btn';
        btn.setAttribute('aria-label', 'Abrir carrito de compras');
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
            </svg>
            <span id="cart-badge" class="cart-badge hidden">0</span>
        `;
        btn.addEventListener('click', () => this.open());
        document.body.appendChild(btn);
    },

    // Inyecta el panel offcanvas del carrito
    injectOffcanvas() {
        const overlay = document.createElement('div');
        overlay.id = 'cart-overlay';
        overlay.className = 'cart-overlay hidden';
        overlay.addEventListener('click', () => this.close());

        const panel = document.createElement('div');
        panel.id = 'cart-panel';
        panel.className = 'cart-panel cart-panel-closed';
        panel.innerHTML = `
            <div class="cart-header">
                <h2 class="cart-title">Tu Pedido</h2>
                <button id="cart-close-btn" aria-label="Cerrar carrito" class="cart-close-btn">&times;</button>
            </div>
            <div id="cart-items" class="cart-items"></div>
            <div id="cart-footer" class="cart-footer hidden">
                <div class="cart-total">
                    <span>Total:</span>
                    <span id="cart-total-value" class="cart-total-value"></span>
                </div>
                <button id="cart-whatsapp-btn" class="cart-whatsapp-btn">
                    <svg class="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Enviar Pedido por WhatsApp
                </button>
                <button id="cart-clear-btn" class="cart-clear-btn">Vaciar carrito</button>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(panel);

        document.getElementById('cart-close-btn').addEventListener('click', () => this.close());
        document.getElementById('cart-whatsapp-btn').addEventListener('click', () => this.sendWhatsApp());
        document.getElementById('cart-clear-btn').addEventListener('click', () => {
            Cart.clear();
            this.render();
            this.updateBadge();
        });
    },

    // Vincula los botones "Agregar al carrito" que existan en la página
    bindProductButtons() {
        document.querySelectorAll('.btn-agregar-carrito').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = btn.closest('[data-id]');
                if (!card) return;

                let id = card.dataset.id;
                let nombre = card.dataset.nombre;
                let precio = card.dataset.precio;

                // Para muffins/brownies con selector de presentación
                const select = card.querySelector('.presentacion-select');
                if (select) {
                    const option = select.selectedOptions[0];
                    id = card.dataset.id + '-x' + option.dataset.cantidad;
                    nombre = card.dataset.nombre + ' x' + option.dataset.cantidad;
                    precio = option.value;
                }

                Cart.addItem(id, nombre, Number(precio));
                this.updateBadge();
                this.showAddedFeedback(btn);
            });
        });
    },

    // Feedback visual al agregar un producto
    showAddedFeedback(btn) {
        const original = btn.textContent;
        btn.textContent = '  Agregado';
        btn.classList.add('btn-added-feedback');
        setTimeout(() => {
            btn.textContent = original;
            btn.classList.remove('btn-added-feedback');
        }, 1200);
    },

    open() {
        this.render();
        document.getElementById('cart-overlay').classList.remove('hidden');
        document.getElementById('cart-panel').classList.remove('cart-panel-closed');
        document.body.style.overflow = 'hidden';
    },

    close() {
        document.getElementById('cart-overlay').classList.add('hidden');
        document.getElementById('cart-panel').classList.add('cart-panel-closed');
        document.body.style.overflow = '';
    },

    // Renderiza la lista de ítems dentro del offcanvas
    render() {
        const container = document.getElementById('cart-items');
        const footer = document.getElementById('cart-footer');

        if (Cart.items.length === 0) {
            container.innerHTML = `
                <div class="cart-empty">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
                    </svg>
                    <p>Tu carrito está vacío</p>
                    <p class="text-sm text-gray-400 mt-1">Agrega productos para comenzar tu pedido</p>
                </div>`;
            footer.classList.add('hidden');
            return;
        }

        footer.classList.remove('hidden');

        container.innerHTML = Cart.items.map(item => `
            <div class="cart-item" data-cart-id="${item.id}">
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.nombre}</span>
                    <span class="cart-item-price">${this.formatPrice(item.precio)}</span>
                </div>
                <div class="cart-item-actions">
                    <button class="cart-qty-btn" data-action="minus" data-id="${item.id}">−</button>
                    <span class="cart-qty-value">${item.cantidad}</span>
                    <button class="cart-qty-btn" data-action="plus" data-id="${item.id}">+</button>
                    <button class="cart-remove-btn" data-id="${item.id}" aria-label="Eliminar">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                </div>
                <div class="cart-item-subtotal">
                    Subtotal: ${this.formatPrice(item.precio * item.cantidad)}
                </div>
            </div>
        `).join('');

        document.getElementById('cart-total-value').textContent = this.formatPrice(Cart.getTotal());

        // Bind acciones de cantidad y eliminar
        container.querySelectorAll('.cart-qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const delta = btn.dataset.action === 'plus' ? 1 : -1;
                Cart.updateQuantity(id, delta);
                this.render();
                this.updateBadge();
            });
        });

        container.querySelectorAll('.cart-remove-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                Cart.removeItem(btn.dataset.id);
                this.render();
                this.updateBadge();
            });
        });
    },

    updateBadge() {
        const badge = document.getElementById('cart-badge');
        const count = Cart.getItemCount();
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    },

    // Construye el mensaje y redirige a WhatsApp
    sendWhatsApp() {
        if (Cart.items.length === 0) return;

        let lines = ['¡Hola! Quiero hacer el siguiente pedido:'];
        Cart.items.forEach(item => {
            lines.push(`- ${item.cantidad}x ${item.nombre} (${this.formatPrice(item.precio * item.cantidad)})`);
        });
        lines.push(`\nTotal: ${this.formatPrice(Cart.getTotal())}`);

        const message = encodeURIComponent(lines.join('\n'));
        const url = `https://wa.me/${Cart.WHATSAPP_NUMBER}?text=${message}`;
        window.open(url, '_blank');
    }
};


// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
    CartUI.init();
});
