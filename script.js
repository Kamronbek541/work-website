const legendItems = document.querySelectorAll('.legend-item');
        let activeLegend = document.getElementById('legend-1'); // Default active
        let activeCard = document.getElementById('card-1');     // Default active card

        legendItems.forEach(item => {
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

        const terminals = document.querySelectorAll('.terminal');
        let activeTerminal = null;
        let selectedPrice = 0;
        
        // Terminal click logic
        terminals.forEach(terminal => {
            terminal.addEventListener('click', () => {
                if (activeTerminal) {
                    activeTerminal.classList.remove('active');
                }
                terminal.classList.add('active');
                activeTerminal = terminal;
                selectedPrice = terminal.getAttribute('data-price');
                document.getElementById('total-price').innerText = `$${selectedPrice}`;
            });
        });
        
        // Payment modal
        const buyButtons = document.querySelectorAll('.buy-button');
        const overlay = document.getElementById('overlay');
        const modal = document.getElementById('payment-modal');
        
        buyButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (selectedPrice > 0) {
                    overlay.classList.add('active');
                } else {
                    alert('Please select a package!');
                }
            });
        });
        
        function closeModal() {
            overlay.classList.remove('active');
        }
        
        // Close modal when clicking outside the modal
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                closeModal();
            }
        });
        
        // Stripe Payment Integration
        const stripe = Stripe('your-publishable-key-here');
        const elements = stripe.elements();
        const cardElement = elements.create('card');
        cardElement.mount('#card-element');
        
        const submitButton = document.getElementById('submit-button');
        submitButton.addEventListener('click', async () => {
            const response = await fetch('http://localhost:3000/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: selectedPrice }),
            });
            const { clientSecret } = await response.json();
        
            const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: 'User Name',
                    },
                },
            });
        
            if (error) {
                alert(`Payment failed: ${error.message}`);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                alert('Payment successful!');
                closeModal();
            }
        });
        



            // FAQS

            const faqItems = document.querySelectorAll('.faq-item');

            faqItems.forEach((item) => {
                const question = item.querySelector('.faq-question');
                const toggleButton = item.querySelector('.faq-toggle');
                const answer = item.querySelector('.faq-answer');
    
                question.addEventListener('click', () => {
                    // Close any open FAQ
                    faqItems.forEach((faq) => {
                        if (faq !== item) {
                            faq.classList.remove('active');
                            faq.querySelector('.faq-toggle').innerText = '+';
                            faq.querySelector('.faq-toggle').classList.remove('active');
                        }
                    });
    
                    // Toggle the current FAQ
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