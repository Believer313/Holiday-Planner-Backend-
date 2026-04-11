export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      console.log("Razorpay already loaded");
      resolve(true);
      return;
    }
    
    console.log("Loading Razorpay script...");
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
      resolve(true);
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const initiatePayment = async (amount, bookingId, userDetails) => {
  console.log("=== INITIATING PAYMENT ===");
  console.log("Amount:", amount);
  console.log("Booking ID:", bookingId);
  console.log("User:", userDetails);
  
  try {
    const isLoaded = await loadRazorpayScript();
    
    if (!isLoaded) {
      alert('Payment gateway failed to load. Please refresh and try again.');
      return false;
    }

    if (typeof window.Razorpay === 'undefined') {
      alert('Razorpay not initialized. Please refresh the page.');
      return false;
    }

    const options = {
      key: "rzp_test_SZGNEW7c9AVyLl",  // ← YOUR NEW TEST KEY
      amount: amount * 100,
      currency: "INR",
      name: "Holiday Planner Tours and Travels",
      description: `Booking ID: ${bookingId}`,
      image: "/favicon.ico",
      handler: function(response) {
        console.log("Payment Success:", response);
        alert(`✅ Payment Successful!\nPayment ID: ${response.razorpay_payment_id}`);
        return true;
      },
      prefill: {
        name: userDetails?.name || "Test User",
        email: userDetails?.email || "test@example.com",
        contact: userDetails?.phone || "9999999999"
      },
      notes: {
        bookingId: bookingId,
        destination: userDetails?.destination || ""
      },
      theme: {
        color: "#064e3b"
      },
      modal: {
        ondismiss: function() {
          console.log("Payment modal closed");
          alert("Payment cancelled");
          return false;
        }
      }
    };
    
    console.log("Opening Razorpay with options:", options);
    const razorpay = new window.Razorpay(options);
    razorpay.open();
    return true;
  } catch (error) {
    console.error("Payment error:", error);
    alert("Payment failed: " + error.message);
    return false;
  }
};