
const legendItems = document.querySelectorAll('.legend-item');
let activeLegend = document.getElementById('legend-1'); // Default active
let activeCard = document.getElementById('card-1'); // Default active card

legendItems.forEach((item) => {
    item.addEventListener('click', () => {
        const targetCardId = item.getAttribute('data-target'); // Get the target card ID
        const targetCard = document.getElementById(targetCardId); // Get the corresponding card

        // Reset the previous active legend and card to gray
        activeLegend.classList.remove('yellow');
        activeLegend.classList.add('gray');
        activeLegend.querySelector('.legend-box').classList.remove('yellow');
        activeLegend.querySelector('.legend-box').classList.add('gray');
        activeCard.classList.remove('yellow-bg');

        // Set the new active legend and card to yellow
        item.classList.remove('gray');
        item.classList.add('yellow');
        item.querySelector('.legend-box').classList.remove('gray');
        item.querySelector('.legend-box').classList.add('yellow');
        targetCard.classList.add('yellow-bg');

        // Update the active legend and card
        activeLegend = item;
        activeCard = targetCard;
    });
});

// Package Selection Logic
const terminals = document.querySelectorAll('.terminal');
let selectedPrice = 0;

terminals.forEach((terminal) => {
    terminal.addEventListener('click', () => {
        document.querySelectorAll('.terminal').forEach(t => t.classList.remove('active'));
        terminal.classList.add('active');
        
        // Convert selected price to number to avoid string issues
        selectedPrice = Number(terminal.getAttribute('data-price'));
        document.getElementById('total-price').innerText = `$${selectedPrice}`;
    });
});

// Payment Modal Logic
const buyButtons = document.querySelectorAll('.buy-button');
const overlay = document.getElementById('overlay');
const modal = document.getElementById('payment-modal');

buyButtons.forEach((button) => {
    button.addEventListener('click', async () => {
        if (selectedPrice > 0) {
            try {
                // Request backend to create a payment session

// !1!!
                // const response = await fetch('/create-payment-intent', {
                const response = await fetch('https://git.heroku.com/scriptscholars.git/create-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: selectedPrice })
                });

                const result = await response.json();
                
                if (result.success) {
                    // ✅ Redirect user to AmoPay checkout page
                    window.location.href = result.redirectUrl;
                } else {
                    alert(`❌ Payment Error: ${result.message}`);
                }
            } catch (error) {
                console.error("❌ Payment processing error:", error);
                alert("⚠️ An error occurred. Please try again.");
            }
        } else {
            alert("⚠️ Please select a package before proceeding.");
        }
    });
});

// ✅ Function to Close Modal
function closeModal() {
    overlay.classList.remove('active');
}

// ✅ Close modal when clicking outside
overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
        closeModal();
    }
});

// ✅ FAQs Section Logic
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const toggleButton = item.querySelector('.faq-toggle');

    question.addEventListener('click', () => {
        // Close other FAQs
        faqItems.forEach((faq) => {
            if (faq !== item) {
                faq.classList.remove('active');
                faq.querySelector('.faq-toggle').innerText = '+';
                faq.querySelector('.faq-toggle').classList.remove('active');
            }
        });

        // Toggle current FAQ
        if (item.classList.contains('active')) {
            item.classList.remove('active');
            toggleButton.innerText = '+';
            toggleButton.classList.remove('active');
        } else {
            item.classList.add('active');
            toggleButton.innerText = '-';
            toggleButton.classList.add('active');
        }
    });
});
