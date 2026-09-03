import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Notifications({ onToast }) {
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [processing, setProcessing] = useState(null);

  const [paymentBooking, setPaymentBooking] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Razorpay script
  |--------------------------------------------------------------------------
  */

  function loadRazorpayScript() {
    if (document.getElementById("razorpay-script")) {
      return;
    }

    const script = document.createElement("script");

    script.id = "razorpay-script";

    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    document.body.appendChild(script);
  }

  /*
  |--------------------------------------------------------------------------
  | Load notifications
  |--------------------------------------------------------------------------
  */

  async function loadNotifications() {
    const token = localStorage.getItem("cgs_token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load notifications");
      }

      const list = Array.isArray(data) ? data : data.notifications || [];

      // console.log("NOTIFICATIONS:", list);
      // console.log(
      //   "PHONE:",
      //   list.find((n) => n.type === "BOOKING_CONFIRMED")?.bookingId?.providerId
      //     ?.phone,
      // );

      setNotifications(list);
    } catch (error) {
      console.error("Notifications error:", error);
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Completion notification?
  |--------------------------------------------------------------------------
  */

  function isCompletion(notification) {
    return (
      notification.type === "WORK_COMPLETED" ||
      notification.type === "work-completed" ||
      notification.type === "completion" ||
      notification.type === "BOOKING_COMPLETED"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Booking ID
  |--------------------------------------------------------------------------
  */

  function getBookingId(notification) {
    return notification.bookingId?._id || notification.bookingId;
  }

  /*
  |--------------------------------------------------------------------------
  | CUSTOMER CONFIRMS WORK
  |--------------------------------------------------------------------------
  */

  async function confirmCompletion(notification) {
    const token = localStorage.getItem("cgs_token");

    const bookingId = getBookingId(notification);

    if (!token) {
      onToast?.("Please login again.");
      return;
    }

    if (!bookingId) {
      onToast?.("Booking information is missing.");
      return;
    }

    const notificationId = notification._id || notification.id;

    setProcessing(notificationId);

    try {
      const response = await fetch(
        `${API_URL}/bookings/${bookingId}/completion`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            completed: true,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to confirm work");
      }

      /*
       * Update notification UI.
       */

      setNotifications((previous) =>
        previous.map((item) => {
          const id = item._id || item.id;

          if (id !== notificationId) {
            return item;
          }

          return {
            ...item,

            read: true,

            completionResponded: true,

            completionConfirmed: true,
          };
        }),
      );

      /*
       * Open payment window.
       */

      setPaymentBooking({
        bookingId,

        amount:
          data?.amount ??
          data?.booking?.amount ??
          notification.bookingId?.amount ??
          0,
      });
    } catch (error) {
      console.error("Completion error:", error);

      onToast?.(error.message || "Unable to confirm work.");
    } finally {
      setProcessing(null);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CASH PAYMENT
  |--------------------------------------------------------------------------
  */

  async function selectCash() {
    if (!paymentBooking) {
      return;
    }

    const token = localStorage.getItem("cgs_token");

    if (!token) {
      onToast?.("Please login again.");
      return;
    }

    try {
      setProcessing("cash");

      const response = await fetch(`${API_URL}/payments/cash`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          bookingId: paymentBooking.bookingId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to record cash payment");
      }

      setPaymentBooking(null);

      onToast?.("Cash payment recorded. Payment status: PAID.");

      /*
       * Reload notifications so
       * payment notification appears.
       */

      await loadNotifications();
    } catch (error) {
      console.error("Cash payment error:", error);

      onToast?.(error.message || "Unable to record cash payment.");
    } finally {
      setProcessing(null);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | ONLINE PAYMENT
  |--------------------------------------------------------------------------
  */

  async function payOnline() {
    if (!paymentBooking) {
      return;
    }

    const token = localStorage.getItem("cgs_token");

    if (!token) {
      onToast?.("Please login again.");
      return;
    }

    try {
      setProcessing("online");

      /*
       * Create Razorpay order
       */

      const response = await fetch(`${API_URL}/payments/create-order`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          bookingId: paymentBooking.bookingId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create payment order");
      }

      /*
       * Razorpay script check
       */

      if (!window.Razorpay) {
        throw new Error("Razorpay is still loading. Please try again.");
      }

      const options = {
        key: data.keyId,

        amount: data.amount,

        currency: data.currency || "INR",

        name: "KaushalSetu",

        description: "KaushalSetu service payment",

        order_id: data.orderId,

        handler: async function (payment) {
          await verifyPayment(payment);
        },

        modal: {
          ondismiss: function () {
            setProcessing(null);
          },
        },

        theme: {
          color: "#4d9460",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Payment failed:", response);

        setProcessing(null);

        onToast?.("Payment failed. Please try again.");
      });

      razorpay.open();
    } catch (error) {
      console.error("Online payment error:", error);

      setProcessing(null);

      onToast?.(error.message || "Unable to open payment.");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | VERIFY ONLINE PAYMENT
  |--------------------------------------------------------------------------
  */

  async function verifyPayment(payment) {
    const token = localStorage.getItem("cgs_token");

    if (!paymentBooking) {
      setProcessing(null);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/payments/verify`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          bookingId: paymentBooking.bookingId,

          razorpay_order_id: payment.razorpay_order_id,

          razorpay_payment_id: payment.razorpay_payment_id,

          razorpay_signature: payment.razorpay_signature,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment verification failed");
      }

      /*
       * Server has now verified
       * the Razorpay signature.
       */

      setPaymentBooking(null);

      setProcessing(null);

      onToast?.("Payment successful! Payment status: PAID.");

      await loadNotifications();
    } catch (error) {
      console.error("Payment verification error:", error);

      setProcessing(null);

      onToast?.(error.message || "Payment verification failed.");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | MARK ONE NOTIFICATION READ
  |--------------------------------------------------------------------------
  */

  async function markRead(notification) {
    const token = localStorage.getItem("cgs_token");

    const id = notification._id || notification.id;

    try {
      const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to mark notification as read");
      }

      setNotifications((previous) =>
        previous.map((item) =>
          (item._id || item.id) === id
            ? {
                ...item,
                read: true,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Mark read error:", error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | MARK ALL READ
  |--------------------------------------------------------------------------
  */

  async function markAllRead() {
    const token = localStorage.getItem("cgs_token");

    try {
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to mark notifications as read");
      }

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          read: true,
        })),
      );
    } catch (error) {
      console.error("Mark all read error:", error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <section className="notifications-page">
        <div className="section-heading">
          <div>
            <span className="eyebrow">UPDATES</span>

            <h2>Notifications</h2>
          </div>
        </div>

        <div className="notification-loading">Loading notifications...</div>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <section className="notifications-page">
        <div className="section-heading">
          <div>
            <span className="eyebrow">UPDATES</span>

            <h2>Notifications</h2>
          </div>

          {notifications.length > 0 && (
            <button className="outline-btn" onClick={markAllRead}>
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="empty-bookings">
            <div className="empty-icon">🔔</div>

            <h3>No notifications</h3>

            <p>Your important updates will appear here.</p>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => {
              const completion = isCompletion(notification);

              const responded = notification.completionResponded === true;

              const id = notification._id || notification.id;

              const busy = processing === id;

              return (
                <div
                  className={`notification-card ${
                    notification.read ? "read" : "unread"
                  }`}
                  key={id}
                >
                  <div className="notification-icon">
                    {completion ? "🛠️" : "🔔"}
                  </div>

                  <div className="notification-content">
                    <b>{notification.title || "Notification"}</b>

                    <div>
                      <span>{notification.message}</span>

                      {notification.type === "BOOKING_CONFIRMED" && (
                        <div className="provider-contact">
                          <strong>Provider Contact:</strong>
                          <span>
                            {notification.bookingId?.providerId?.phone}
                          </span>
                        </div>
                      )}
                    </div>

                    <small>
                      {notification.createdAt
                        ? new Date(notification.createdAt).toLocaleString()
                        : ""}
                    </small>

                    {completion && !responded && (
                      <div className="completion-actions">
                        <button
                          className="completion-yes"
                          disabled={busy}
                          onClick={() => confirmCompletion(notification)}
                        >
                          {busy ? "Please wait..." : "Yes, work is completed"}
                        </button>

                        <button
                          className="completion-no"
                          disabled={busy}
                          onClick={() =>
                            onToast?.(
                              "Please contact the provider if the work was not completed.",
                            )
                          }
                        >
                          No, not completed
                        </button>
                      </div>
                    )}

                    {completion && responded && (
                      <div className="completion-response confirmed">
                        ✓ You confirmed that the work was completed.
                      </div>
                    )}

                    {!notification.read && !completion && (
                      <button
                        className="notification-read-btn"
                        onClick={() => markRead(notification)}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================================================
          PAYMENT CHOICE MODAL
      ========================================================= */}

      {paymentBooking && (
        <div
          className="payment-modal-backdrop"
          onClick={() => (processing ? null : setPaymentBooking(null))}
        >
          <div
            className="payment-choice-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="payment-modal-close"
              disabled={!!processing}
              onClick={() => setPaymentBooking(null)}
            >
              ×
            </button>

            <div className="payment-choice-icon">₹</div>

            <span className="eyebrow">PAYMENT</span>

            <h2>How would you like to pay?</h2>

            <p>
              Work completion has been confirmed. Choose your payment method.
            </p>

            <div className="payment-amount">
              ₹{Number(paymentBooking.amount || 0).toLocaleString("en-IN")}
            </div>

            <div className="payment-choice-buttons">
              <button
                className="cash-payment-btn"
                disabled={!!processing}
                onClick={selectCash}
              >
                <span className="payment-button-icon">💵</span>

                <span>
                  {processing === "cash" ? "Saving..." : "Pay by Cash"}
                </span>
              </button>

              <button
                className="online-payment-btn"
                disabled={!!processing}
                onClick={payOnline}
              >
                <span className="payment-button-icon">💳</span>

                <span>
                  {processing === "online"
                    ? "Opening Razorpay..."
                    : "Pay Online"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
