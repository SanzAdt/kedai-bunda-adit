document.addEventListener('alpine:init', () => {
    Alpine.data('products', () => ({
        items: [
            { id: 1, name: 'Pizza', img: '1.jpg', price: 50000 },
            { id: 2, name: 'Hotdog', img: '2.jpg', price: 10000 },
            { id: 3, name: 'Risoles Sosis Mayo', img: '3.jpg', price: 2500  },
            { id: 4, name: 'Risoles Sayuran', img: '4.png', price: 1500 },
        ],
    }));

    Alpine.store('cart', {
        items: [],
        total: 0,
        quantity: 0,
        add(newItem) {
            const cartItem = this.items.find((item) => item.id === newItem.id);
            if (!cartItem) {
                this.items.push({ ...newItem, quantity: 1, total: newItem.price });
                this.quantity++;
                this.total += newItem.price;
            } else {
                this.items = this.items.map((item) => {
                    if (item.id !== newItem.id) {
                        return item;
                    } else {
                        item.quantity++;
                        item.total = item.price * item.quantity;
                        this.quantity++;
                        this.total += item.price;
                        return item;
                    }
                });
            }
        },
        remove(id) {
            const cartItem = this.items.find((item) => item.id === id);
            if (cartItem.quantity > 1) {
                this.items = this.items.map((item) => {
                    if (item.id !== id) {
                        return item;
                    } else {
                        item.quantity--;
                        item.total = item.price * item.quantity;
                        this.quantity--;
                        this.total -= item.price;
                        return item;
                    }
                });
            } else if (cartItem.quantity === 1) {
                this.items = this.items.filter((item) => item.id != id);
                this.quantity--;
                this.total -= cartItem.price;
            }
        }
    });
});

const checkoutButton = document.querySelector('.checkout-button');
checkoutButton.disabled = true;

const form = document.querySelector('#checkoutForm');

form.addEventListener('keyup', function() {
    let allFilled = true;
    for (let i = 0; i < form.elements.length; i++) {
        if (form.elements[i].type !== "hidden" && form.elements[i].value.length === 0) {
            allFilled = false;
            break;
        }
    }
    checkoutButton.disabled = !allFilled;
    if (allFilled) {
        checkoutButton.classList.remove('disabled');
    } else {
        checkoutButton.classList.add('disabled');
    }
});

checkoutButton.addEventListener('click', async function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const data = new URLSearchParams(formData);
    const objData = Object.fromEntries(data);
    const message = formatMessage(objData);
    const apiUrl = 'https://api.whatsapp.com/send';
    const params = {
        phone: '62852-8074-2361',
        text: message
    };
    const queryString = new URLSearchParams(params).toString();
    const url = `${apiUrl}?${queryString}`;
    window.location.href = url;

    // // Minta transaction token menggunakan AJAX / Fetch
    // try {
    //     const response = await fetch('php/placeOrder.php', {
    //         method: 'POST',
    //         body: data,
    //     });

    //     const textResponse = await response.text();
    //     console.log('Response:', textResponse);
        
    //     const result = JSON.parse(textResponse);

    //     if (result.token) {
    //         console.log(`Order ID: ${result.order_id}`);
    //         window.snap.pay(result.token);
    //     } else {
    //         console.error('Error:', result.error);
    //     }
    // } catch(err) {
    //     console.log(err.message);
    // }
});

const formatMessage = (obj) => {
    return `Data Customer
    Nama: ${obj.name}
    No HP: ${obj.phone}
    Data Pesanan
    ${JSON.parse(obj.items).map((item) => `${item.name} (${item.quantity} x ${rupiah(item.price)})`).join('\n')}
    Total: ${rupiah(obj.total)}
    Terima Kasih.`;
}

const rupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
}