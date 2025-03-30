// Cart Functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update Cart Count
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('#cart-count').forEach(el => {
        el.textContent = count;
    });
}

// Add to Cart
function addToCart(productId, productName, price, quantity = 1) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: quantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Animate cart icon
    const cartIcon = document.querySelector('.fa-shopping-cart');
    cartIcon.classList.add('cart-animate');
    setTimeout(() => {
        cartIcon.classList.remove('cart-animate');
    }, 500);
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
}

// Update Quantity
function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, newQuantity);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
    }
}

// Render Cart Items
function renderCartItems() {
    const cartItemsEl = document.getElementById('cart-items');
    const orderItemsEl = document.getElementById('order-items');
    
    if (!cartItemsEl && !orderItemsEl) return;
    
    if (cart.length === 0) {
        if (cartItemsEl) {
            cartItemsEl.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-shopping-cart text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">Seu carrinho está vazio</p>
                </div>
            `;
        }
        if (orderItemsEl) {
            orderItemsEl.innerHTML = '<p class="text-gray-500">Nenhum item no carrinho</p>';
        }
        updateTotals();
        return;
    }
    
    let cartItemsHTML = '';
    let orderItemsHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        cartItemsHTML += `
            <div class="py-4 flex items-center" data-id="${item.id}">
                <img src="https://images.pexels.com/photos/6605313/pexels-photo-6605313.jpeg" 
                     alt="${item.name}" 
                     class="w-16 h-16 object-cover rounded">
                <div class="ml-4 flex-1">
                    <h3 class="font-medium">${item.name}</h3>
                    <p class="text-gray-600">R$ ${item.price.toFixed(2)}</p>
                </div>
                <div class="flex items-center">
                    <button class="quantity-btn" data-action="decrease" data-id="${item.id}">
                        <i class="fas fa-minus text-gray-500"></i>
                    </button>
                    <input type="number" value="${item.quantity}" min="1" 
                           class="w-12 text-center mx-2 border rounded quantity-input" 
                           data-id="${item.id}">
                    <button class="quantity-btn" data-action="increase" data-id="${item.id}">
                        <i class="fas fa-plus text-gray-500"></i>
                    </button>
                </div>
                <span class="ml-4 font-medium">R$ ${itemTotal.toFixed(2)}</span>
                <button class="ml-4 text-red-500 remove-btn" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        orderItemsHTML += `
            <div class="py-2 flex justify-between">
                <span>${item.name} x${item.quantity}</span>
                <span>R$ ${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });
    
    if (cartItemsEl) cartItemsEl.innerHTML = cartItemsHTML;
    if (orderItemsEl) orderItemsEl.innerHTML = orderItemsHTML;
    
    // Add event listeners
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').dataset.id;
            const action = e.target.closest('button').dataset.action;
            const input = document.querySelector(`.quantity-input[data-id="${id}"]`);
            let quantity = parseInt(input.value);
            
            if (action === 'increase') {
                quantity++;
            } else {
                quantity = Math.max(1, quantity - 1);
            }
            
            input.value = quantity;
            updateQuantity(id, quantity);
        });
    });
    
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const id = e.target.dataset.id;
            const quantity = parseInt(e.target.value) || 1;
            updateQuantity(id, quantity);
        });
    });
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').dataset.id;
            removeFromCart(id);
        });
    });
    
    updateTotals();
}

// Update Totals
function updateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 100 ? 0 : 15;
    const total = subtotal + shipping;
    
    // Update in cart page
    if (document.getElementById('subtotal')) {
        document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
        document.getElementById('shipping').textContent = `R$ ${shipping.toFixed(2)}`;
        document.getElementById('total').textContent = `R$ ${total.toFixed(2)}`;
    }
    
    // Update in checkout page
    if (document.getElementById('order-subtotal')) {
        document.getElementById('order-subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
        document.getElementById('order-shipping').textContent = `R$ ${shipping.toFixed(2)}`;
        document.getElementById('order-total').textContent = `R$ ${total.toFixed(2)}`;
    }
}

// Payment Method Toggle
function setupPaymentMethods() {
    const paymentMethods = document.querySelectorAll('input[name="payment"]');
    const creditCardFields = document.getElementById('credit-card-fields');
    
    if (!paymentMethods.length || !creditCardFields) return;
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', (e) => {
            if (e.target.value === 'credit-card') {
                creditCardFields.style.display = 'block';
            } else {
                creditCardFields.style.display = 'none';
            }
        });
    });
}

// Form Validation
function setupFormValidation() {
    const form = document.getElementById('checkout-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validate form
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('border-red-500');
                isValid = false;
            } else {
                field.classList.remove('border-red-500');
            }
        });
        
        if (isValid) {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner"></span> Processando...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                // Clear cart
                cart = [];
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
                
                // Show success message
                alert('Compra realizada com sucesso! Obrigado por comprar na Cacau Show.');
                
                // Redirect to home
                window.location.href = 'index.html';
            }, 1500);
        }
    });
}

// Product Page Setup
function setupProductPage() {
    const addToCartBtn = document.getElementById('add-to-cart');
    if (!addToCartBtn) return;
    
    addToCartBtn.addEventListener('click', () => {
        const productId = '1003535';
        const productName = 'Ovo de Páscoa ao Leite Bytes Fone Azul 200g';
        const price = 49.90;
        const quantity = parseInt(document.getElementById('quantity').value) || 1;
        
        addToCart(productId, productName, price, quantity);
        alert('Produto adicionado ao carrinho!');
    });
}

// Tabbed Content
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (!tabs.length || !tabContents.length) return;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const target = tab.dataset.target;
            document.getElementById(target).classList.add('active');
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCartItems();
    setupPaymentMethods();
    setupFormValidation();
    setupProductPage();
    setupTabs();
    
    // Set default active tab if exists
    const defaultTab = document.querySelector('.tab-btn.active');
    if (defaultTab) {
        const target = defaultTab.dataset.target;
        document.getElementById(target).classList.add('active');
    }
});