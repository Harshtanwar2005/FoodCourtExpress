
const money = value =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(value);

const CART_STORAGE_KEY = 'foodCourtExpressCart';

let menuItems = [];
let selectedCategory = 'All';
let cart = loadSavedCart();

const grid = document.querySelector('#menu-grid');
const filters = document.querySelector('#filters');

// Restore the cart from localStorage.
function loadSavedCart() {
    try {
        const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{}');

        if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
            return {};
        }

        return Object.fromEntries(
            Object.entries(saved).filter(([id, quantity]) =>
                /^\d+$/.test(id) &&
                Number.isInteger(quantity) &&
                quantity > 0
            )
        );
    } catch (error) {
        console.warn('Could not restore saved cart:', error);
        return {};
    }
}

function saveCart() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.warn('Could not save cart:', error);
    }
}

async function loadMenu() {
    try {
        const response = await fetch('/api/menu');

        if (!response.ok) {
            throw new Error('Could not load menu');
        }

        menuItems = await response.json();

        // Remove saved items that are no longer available.
        const availableIds = new Set(
            menuItems.map(item => String(item.id))
        );

        cart = Object.fromEntries(
            Object.entries(cart).filter(([id]) => availableIds.has(id))
        );

        saveCart();
        renderFilters();
        renderMenu();
        renderCart();
    } catch (error) {
        console.error('Menu loading failed:', error);

        grid.innerHTML =
            '<p class="error">We could not load the menu. ' +
            'Make sure the database is running and refresh.</p>';
    }
}

function renderFilters() {
    const categories = [
        'All',
        ...new Set(menuItems.map(item => item.category))
    ];

    filters.innerHTML = categories.map(category => `
        <button
            class="filter ${category === selectedCategory ? 'active' : ''}"
            data-category="${escapeHtml(category)}">
            ${escapeHtml(category === 'All' ? 'All items' : category)}
        </button>
    `).join('');

    filters.querySelectorAll('[data-category]').forEach(button => {
        button.addEventListener('click', () => {
            selectedCategory = button.dataset.category;
            renderFilters();
            renderMenu();
        });
    });
}

function renderMenu() {
    const items = menuItems.filter(item =>
        selectedCategory === 'All' || item.category === selectedCategory
    );

    grid.innerHTML = items.map(item => `
        <article class="food-card">
            <div class="food-image">
                <img
                    src="${escapeHtml(item.imageUrl || '')}"
                    alt="${escapeHtml(item.name)}"
                    loading="lazy"
                    onerror="this.style.display='none'">

                <span class="food-category">
                    ${escapeHtml(item.category)}
                </span>
            </div>

            <div class="food-info">
                <h3>${escapeHtml(item.name)}</h3>

                <p>${escapeHtml(
                    item.description || 'Made fresh, just for you.'
                )}</p>

                <p class="vendor-name">
                    ${escapeHtml(item.vendorName || 'Food Court Vendor')}
                </p>

                <div class="food-bottom">
                    <strong>${money(item.price)}</strong>

                    <button
                        class="add-button"
                        data-add="${item.id}"
                        aria-label="Add ${escapeHtml(item.name)} to basket">
                        +
                    </button>
                </div>
            </div>
        </article>
    `).join('') || '<p>No items in this category yet.</p>';

    grid.querySelectorAll('[data-add]').forEach(button => {
        button.addEventListener('click', () => {
            const id = Number(button.dataset.add);

            cart[id] = (cart[id] || 0) + 1;

            saveCart();
            renderCart();

            button.textContent = '✓';
            setTimeout(() => {
                button.textContent = '+';
            }, 700);
        });
    });
}

function renderCart() {
    const count = Object.values(cart).reduce(
        (total, quantity) => total + quantity, 0
    );

    document.querySelector('#cart-count').textContent = count;

    const lines = Object.entries(cart)
        .map(([id, quantity]) => ({
            item: menuItems.find(item => item.id === Number(id)),
            quantity
        }))
        .filter(line => line.item);

    document.querySelector('#cart-items').innerHTML = lines.length
        ? lines.map(({ item, quantity }) => `
            <div class="cart-row">
                <div>
                    <h3>${escapeHtml(item.name)}</h3>

                    <p>${escapeHtml(
                        item.vendorName || 'Food Court Vendor'
                    )}</p>

                    <p>${money(item.price)} each</p>

                    <div class="quantity">
                        <button
                            data-change="${item.id}"
                            data-delta="-1"
                            aria-label="Decrease ${escapeHtml(item.name)}">
                            −
                        </button>

                        <span>${quantity}</span>

                        <button
                            data-change="${item.id}"
                            data-delta="1"
                            aria-label="Increase ${escapeHtml(item.name)}">
                            +
                        </button>
                    </div>
                </div>

                <strong>${money(Number(item.price) * quantity)}</strong>
            </div>
        `).join('')
        : '<p class="empty-cart">Your basket is looking a little empty.</p>';

    const total = lines.reduce(
        (sum, { item, quantity }) =>
            sum + Number(item.price) * quantity,
        0
    );

    document.querySelector('#cart-total').textContent = money(total);

    document.querySelectorAll('[data-change]').forEach(button => {
        button.addEventListener('click', () => {
            const id = Number(button.dataset.change);
            const delta = Number(button.dataset.delta);

            cart[id] = (cart[id] || 0) + delta;

            if (cart[id] <= 0) {
                delete cart[id];
            }

            saveCart();
            renderCart();
        });
    });
}

function openCart() {
    document.querySelector('#cart-drawer').classList.add('open');
    document.querySelector('#drawer-backdrop').classList.add('show');
}

function closeCart() {
    document.querySelector('#cart-drawer').classList.remove('open');
    document.querySelector('#drawer-backdrop').classList.remove('show');
}

document.querySelector('#cart-toggle').addEventListener('click', openCart);
document.querySelector('#close-cart').addEventListener('click', closeCart);
document.querySelector('#drawer-backdrop').addEventListener('click', closeCart);

// Existing checkout integration retained.
document.querySelector('#checkout-form').addEventListener('submit', async event => {
    event.preventDefault();

    const form = event.currentTarget;
    const message = document.querySelector('#checkout-message');

    const lines = Object.entries(cart).map(([id, quantity]) => ({
        menuItemId: Number(id),
        quantity
    }));

    if (!lines.length) {
        message.textContent = 'Add something tasty to your basket first.';
        return;
    }

    const data = Object.fromEntries(new FormData(form));
    data.items = lines;

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    message.textContent = 'Placing your order…';

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || 'Please check your details and try again.'
            );
        }

        message.textContent =
            `Order #${result.orderId} placed! ` +
            `Total: ${money(result.total)}. Thank you!`;

        cart = {};
        saveCart();
        renderCart();
        form.reset();
    } catch (error) {
        message.textContent =
            error.message || 'Something went wrong.';
    } finally {
        button.disabled = false;
    }
});

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

loadMenu();
