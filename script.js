const legendItems = document.querySelectorAll('.legend-item');
let activeLegend = document.getElementById('legend-1'); // Default active
let activeCard = document.getElementById('card-1'); // Default active card

legendItems.forEach((item) => {
    item.addEventListener('click', () => {
        const targetCardId = item.getAttribute('data-target'); // Get the target card ID
        const targetCard = document.getElementById(targetCardId); // Get the corresponding card

        // Reset previous active legend and card to gray
        activeLegend.classList.remove('yellow');
        activeLegend.classList.add('gray');
        activeLegend.querySelector('.legend-box').classList.remove('yellow');
        activeLegend.querySelector('.legend-box').classList.add('gray');
        activeCard.classList.remove('yellow-bg');

        // Set new active legend and card to yellow
        item.classList.remove('gray');
        item.classList.add('yellow');
        item.querySelector('.legend-box').classList.remove('gray');
        item.querySelector('.legend-box').classList.add('yellow');
        targetCard.classList.add('yellow-bg');

        // Update active legend and card
        activeLegend = item;
        activeCard = targetCard;
    });
});



const MIN_AMOUNT = 15; // Minimum allowed price


function handlePriceInput(editableSpan) {
  // Find related elements within the span's card
  const terminalCard = editableSpan.closest('.terminal');
  const warningElement = terminalCard ? terminalCard.querySelector('.min-amount-warning') : null;

  // Exit if essential elements are not found
  if (!terminalCard || !warningElement) {
      console.error("Editable Price Error: Could not find parent .terminal or .min-amount-warning for:", editableSpan);
      // Optionally reset span text if needed: editableSpan.textContent = '0';
      return;
  }

  // --- 1. Sanitize Input ---
  let currentText = editableSpan.textContent;
  let sanitizedValue = currentText.replace(/\D/g, ''); // Remove all non-digit characters

  // Prevent multiple leading zeros (e.g., "007" -> "7"), but allow a single "0"
  if (sanitizedValue.length > 1 && sanitizedValue.startsWith('0')) {
      sanitizedValue = sanitizedValue.substring(1);
  }
  // If input becomes empty after sanitizing, treat as 0 for validation/data-price
  if (sanitizedValue === '') {
      sanitizedValue = '0';
  }

  // --- 2. Update Span Text (if needed) ---
  // Avoid resetting textContent unnecessarily to prevent cursor jumps
  if (editableSpan.textContent !== sanitizedValue) {
      // Note: Simple update. Perfect cursor preservation in contenteditable is complex.
      editableSpan.textContent = sanitizedValue;
      // After setting textContent, cursor might jump to the end.
      // Advanced cursor positioning logic could be added here if required.
  }

  // --- 3. Convert to Number ---
  const numericValue = parseInt(sanitizedValue, 10) || 0; // Use base 10, fallback to 0

  // --- 4. Update data-price Attribute (The Core Dynamic Update) ---
  // This directly modifies the attribute on the parent card element
  terminalCard.dataset.price = numericValue; // Using dataset for cleaner access
  // console.log(`✏️ data-price for "${terminalCard.querySelector('h3').textContent}" dynamically updated to: ${terminalCard.dataset.price}`);

  // --- 5. Validate & Apply Visual Feedback ---
  if (numericValue < MIN_AMOUNT) {
      editableSpan.classList.add('invalid-price'); // Make text red (via CSS)
      warningElement.classList.add('visible');    // Show warning message (via CSS)
      warningElement.textContent = `min amount = $${MIN_AMOUNT}`; // Ensure message text is correct
  } else {
      editableSpan.classList.remove('invalid-price'); // Remove red text style
      warningElement.classList.remove('visible');     // Hide warning message
  }

  // --- 6. Update Global State IF the Edited Card is ACTIVE ---
  // Check if the card being edited is the currently selected one
  if (terminalCard.classList.contains('active')) {
      // If yes, update the global `selectedPrice` variable used by the buy button logic
      // (Ensure `selectedPrice` is declared globally in your existing script)
      selectedPrice = numericValue;
      // Also update the total price display if you have one
      const totalPriceElement = document.getElementById('total-price');
      if (totalPriceElement) {
           totalPriceElement.innerText = `$${selectedPrice}`;
      }
      // console.log(`🔄 Active card price edited. Global selectedPrice updated to: $${selectedPrice}`);
  }
}

const allPriceSpans = document.querySelectorAll('.price-value');

allPriceSpans.forEach(span => {
  // Find the parent terminal for initial setup
  const parentTerminal = span.closest('.terminal');
  if (!parentTerminal) {
      console.error("Setup Error: Could not find parent .terminal for span:", span);
      return; // Skip this span if it's not inside a terminal
  }

  // --- Initialize Display & Validation on Page Load ---
  const initialPrice = Number(parentTerminal.dataset.price) || MIN_AMOUNT; // Read from data-price, default if invalid/missing
  span.textContent = initialPrice;   // Set initial text in the span
  handlePriceInput(span);            // Run validation logic immediately on load

  // --- Add Event Listeners for User Interaction ---

  // 'input': Fires immediately whenever the content changes (typing, pasting, deleting)
  span.addEventListener('input', (event) => {
      handlePriceInput(event.target); // Pass the span element to the handler
  });

  // 'blur': Fires when the element loses focus (e.g., user clicks away)
  // Good for final cleanup/validation if the input event missed something
  span.addEventListener('blur', (event) => {
      // Re-run handler on blur to catch cases like pasting invalid chars and clicking away
      handlePriceInput(event.target);
      // Optional: If empty on blur, maybe reset to minimum?
      // if (event.target.textContent === '0') {
      //     event.target.textContent = MIN_AMOUNT;
      //     handlePriceInput(event.target);
      // }
  });

  // 'keydown': Prevent Enter key from creating new lines in the span
  span.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
          event.preventDefault(); // Stop Enter from adding a <br> or <div>
          event.target.blur();    // Trigger the 'blur' event / remove focus
      }
      // Optional: Add more key filtering here if needed (e.g., allow only numbers, backspace, etc.)
  });
});






// Package Selection Logic
const terminals = document.querySelectorAll('.terminal');


terminals.forEach((terminal) => {
    terminal.addEventListener('click', () => {
        document.querySelectorAll('.terminal').forEach(t => t.classList.remove('active'));
        terminal.classList.add('active');
        
        // Convert selected price to number to avoid string issues
        selectedPrice = Number(terminal.getAttribute('data-price'));
        document.getElementById('total-price').innerText = `$${selectedPrice}`;
        console.log(`💰 Selected price updated to: $${selectedPrice}`);
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
                console.log("🟢 Sending request to server...");
                
                // Request backend to create a payment session
                const API_URL = "https://scriptscholars-66e2b211ae7d.herokuapp.com";  // ✅ Replace with your backend URL

                const response = await fetch(`${API_URL}/create-payment-intent`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: selectedPrice })
                });
                
                if (!response.ok) {
                    throw new Error(`Server responded with status ${response.status}`);
                }

                const result = await response.json();
                
                if (result.success) {
                    console.log("✅ Payment intent created. Redirecting...");
                    // Redirect user to AmoPay checkout page
                    window.location.href = result.redirectUrl;
                } else {
                    console.error("❌ Payment Error:", result.message);
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

// Function to Close Modal
function closeModal() {
    overlay.classList.remove('active');
}

// Close modal when clicking outside
overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
        closeModal();
    }
});






// FAQs Section Logic
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



