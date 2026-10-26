
'use strict';

const ordersContainer = document.querySelector('#vendor-orders');
const message = document.querySelector('#vendor-message');
const vendorIdInput = document.querySelector('#vendor-id');
const loadButton = document.querySelector('#load-orders');
const activeButton = document.querySelector('#active-view');
const historyButton = document.querySelector('#history-view');

let currentView = 'active';
let requestNumber = 0;

// Escape text before inserting API values into HTML.
function escapeText(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function formatMoney(value) {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(Number.isFinite(amount) ? amount : 0);
}

function showMessage(text, isError = false) {
    message.textContent = text;
    message.classList.toggle('error', isError);
}

function setView(view) {
    if (view !== 'active' && view !== 'history') {
        return;
    }

    currentView = view;

    activeButton.setAttribute(
        'aria-pressed',
        String(currentView === 'active')
    );

    historyButton.setAttribute(
        'aria-pressed',
        String(currentView === 'history')
    );

    loadOrders();
}

function renderOrder(order) {
    const orderId = Number(order.vendorOrderId);
    const status = String(order.status ?? '').toUpperCase();
    const isHistory = currentView === 'history';
    const isDelivery =
        String(order.orderType ?? '').toUpperCase() === 'DELIVERY';

    const items = Array.isArray(order.items) ? order.items : [];

    const itemsHtml = items.length
        ? items.map(item => {
            const quantity = Number(item.quantity ?? 0);

            return `
                <li>
                    ${escapeText(item.name)}
                    &times; ${Number.isFinite(quantity) ? quantity : 0}
                    &mdash; ${formatMoney(item.lineTotal)}
                </li>
            `;
        }).join('')
        : '<li>No item details available.</li>';

    const customerName = escapeText(order.customerName || 'Guest');
    const customerPhone = escapeText(order.customerPhone || 'Not provided');

    const locationHtml = isDelivery
        ? `<p><strong>Delivery address:</strong>
               ${escapeText(order.deliveryAddress || 'Not provided')}
           </p>`
        : `<p><strong>Table number:</strong>
               ${escapeText(order.tableNumber ?? 'Not assigned')}
           </p>`;

    const statusClass = status.toLowerCase() === 'completed'
        ? 'completed'
        : status.toLowerCase() === 'cancelled'
            ? 'cancelled'
            : '';

    const actionsHtml = isHistory ? '' : `
        <div class="order-actions">
            <label for="status-${orderId}">
                Update order status

                <select id="status-${orderId}"
                        data-status-for="${orderId}">
                    ${[
                        'PLACED',
                        'ACCEPTED',
                        'PREPARING',
                        'READY',
                        'COMPLETED',
                        'CANCELLED'
                    ].map(option => `
                        <option
                            value="${option}"
                            ${option === status ? 'selected' : ''}
                        >
                            ${option}
                        </option>
                    `).join('')}
                </select>
            </label>

            <button
                type="button"
                data-update="${orderId}"
                ${Number.isSafeInteger(orderId) && orderId > 0 ? '' : 'disabled'}
            >
                Save Status
            </button>
        </div>
    `;

    return `
        <article class="vendor-order">
            <h2>${escapeText(order.orderNumber || 'Order')}</h2>

            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Phone:</strong> ${customerPhone}</p>
            <p><strong>Order type:</strong>
                ${escapeText(order.orderType || 'DINE_IN')}
            </p>

            ${locationHtml}

            <p><strong>Items:</strong></p>
            <ul>${itemsHtml}</ul>

            <p><strong>Vendor subtotal:</strong>
                ${formatMoney(order.subtotal)}
            </p>

            <p>
                <strong>Status:</strong>
                <span class="order-status ${statusClass}">
                    ${escapeText(status || 'UNKNOWN')}
                </span>
            </p>

            ${actionsHtml}
        </article>
    `;
}

async function loadOrders() {
    const thisRequest = ++requestNumber;
    const vendorId = Number(vendorIdInput.value);

    if (!Number.isSafeInteger(vendorId) || vendorId < 1) {
        ordersContainer.replaceChildren();
        showMessage('Please enter a valid vendor ID.', true);
        return;
    }

    showMessage(
        currentView === 'active'
            ? 'Loading active orders...'
            : 'Loading order history...'
    );

    ordersContainer.replaceChildren();
    loadButton.disabled = true;

    try {
        const url =
            `/api/vendor/orders?vendorId=${encodeURIComponent(vendorId)}` +
            `&view=${encodeURIComponent(currentView)}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            cache: 'no-store'
        });

        const responseText = await response.text();

        let data;

        try {
            data = responseText ? JSON.parse(responseText) : [];
        } catch {
            throw new Error('The server returned an invalid response.');
        }

        if (!response.ok) {
            throw new Error(
                data.message ||
                data.detail ||
                `Could not load orders (HTTP ${response.status}).`
            );
        }

        if (!Array.isArray(data)) {
            throw new Error('Unexpected response format from the server.');
        }

        // Ignore an older response if the user switched tabs while loading.
        if (thisRequest !== requestNumber) {
            return;
        }

        // Extra frontend filtering keeps each tab correct.
        const visibleOrders = data.filter(order => {
            const status = String(order.status ?? '').toUpperCase();

            if (currentView === 'history') {
                return status === 'COMPLETED' || status === 'CANCELLED';
            }

            return [
                'PLACED',
                'ACCEPTED',
                'PREPARING',
                'READY'
            ].includes(status);
        });

        if (visibleOrders.length === 0) {
            showMessage(
                currentView === 'active'
                    ? 'No active orders found.'
                    : 'No completed or cancelled orders in history.'
            );

            ordersContainer.innerHTML = `
                <div class="empty-state">
                    <h2>${currentView === 'active'
                        ? 'No Active Orders'
                        : 'Order History Is Empty'}</h2>
                    <p>${currentView === 'active'
                        ? 'New orders will appear here.'
                        : 'Completed and cancelled orders will appear here.'}</p>
                </div>
            `;

            return;
        }

        ordersContainer.innerHTML = visibleOrders
            .map(renderOrder)
            .join('');

        showMessage(
            `${visibleOrders.length} ${
                currentView === 'active' ? 'active' : 'history'
            } order(s) loaded.`
        );

    } catch (error) {
        if (thisRequest !== requestNumber) {
            return;
        }

        console.error('Failed to load vendor orders:', error);

        ordersContainer.replaceChildren();
        showMessage(
            error.message || 'Something went wrong while loading orders.',
            true
        );
    } finally {
        if (thisRequest === requestNumber) {
            loadButton.disabled = false;
        }
    }
}

// Event delegation: handles Save Status buttons on all rendered orders.
ordersContainer.addEventListener('click', async event => {
    const button = event.target.closest('[data-update]');

    if (!button || !ordersContainer.contains(button)) {
        return;
    }

    const vendorOrderId = Number(button.dataset.update);
    const vendorId = Number(vendorIdInput.value);

    const select = ordersContainer.querySelector(
        `[data-status-for="${vendorOrderId}"]`
    );

    if (
        !Number.isSafeInteger(vendorOrderId) ||
        vendorOrderId < 1 ||
        !Number.isSafeInteger(vendorId) ||
        vendorId < 1 ||
        !select
    ) {
        showMessage('Invalid order or vendor ID.', true);
        return;
    }

    button.disabled = true;
    showMessage('Updating order status...');

    try {
        const response = await fetch(
            `/api/vendor/orders/${vendorOrderId}/status` +
            `?vendorId=${encodeURIComponent(vendorId)}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    status: select.value
                })
            }
        );

        const responseText = await response.text();
        let result;

        try {
            result = responseText ? JSON.parse(responseText) : {};
        } catch {
            throw new Error('The server returned an invalid response.');
        }

        if (!response.ok) {
            throw new Error(
                result.message ||
                result.detail ||
                `Could not update status (HTTP ${response.status}).`
            );
        }

        showMessage(
            `Order status updated to ${result.status || select.value}.`
        );

        // Reload the currently selected view. A completed order will
        // disappear from Active Orders and appear in Order History.
        await loadOrders();

    } catch (error) {
        console.error('Failed to update order status:', error);
        showMessage(
            error.message || 'Could not update order status.',
            true
        );
        button.disabled = false;
    }
});

loadButton.addEventListener('click', loadOrders);

activeButton.addEventListener('click', () => {
    setView('active');
});

historyButton.addEventListener('click', () => {
    setView('history');
});

// Initial view.
loadOrders();
