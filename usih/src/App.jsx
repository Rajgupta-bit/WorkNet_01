import React, { useEffect, useState } from "react";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Services from "./pages/Services";
import HowItWorks from "./pages/HowItWorks";
import Provider from "./pages/Provider";
import ProviderDashboard from "./pages/ProviderDashboard";
import Community from "./pages/Community";
import About from "./pages/About";
import Login from "./pages/Login";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export default function App() {
  const [page, setPage] = useState(() => {
    return localStorage.getItem("cgs_current_page") || "home";
  });

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cgs_current_user")) || null;
    } catch {
      return null;
    }
  });

  const [booking, setBooking] = useState(null);
  const [cancelBooking, setCancelBooking] = useState(null);

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const [toast, setToast] = useState("");

  // Payment state
  const [paymentBooking, setPaymentBooking] = useState(null);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedService, setSelectedService] = useState("");

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page]);

  useEffect(() => {
    localStorage.setItem("cgs_current_page", page);
  }, [page]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast]);

  /*
  |--------------------------------------------------------------------------
  | Load Razorpay checkout script
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (window.Razorpay) return;

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existingScript) return;

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    document.body.appendChild(script);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | User data
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!user) {
      setBookings([]);
      setNotifications([]);
      return;
    }

    loadBookings();
    loadNotifications();

    /*
     * Don't refresh every 3 seconds.
     * This was causing the bookings section
     * to constantly refresh.
     *
     * Notifications are checked every 10 seconds.
     */

    const interval = setInterval(() => {
      loadNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  async function loadBookings() {
    const token = localStorage.getItem("cgs_token");

    if (!token) {
      setBookings([]);
      return;
    }

    try {
      setLoadingBookings(true);

      const response = await fetch(`${API_URL}/bookings/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load bookings");
      }

      const list = Array.isArray(data) ? data : data.bookings || [];

      setBookings(list);
    } catch (error) {
      console.error("Bookings error:", error);
    } finally {
      setLoadingBookings(false);
    }
  }

  async function loadNotifications() {
    const token = localStorage.getItem("cgs_token");

    if (!token) {
      setNotifications([]);
      return;
    }

    try {
      setLoadingNotifications(true);

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

      setNotifications(list);
    } catch (error) {
      console.error("Notifications error:", error);
    } finally {
      setLoadingNotifications(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Login / Logout
  |--------------------------------------------------------------------------
  */

  const login = (u) => {
    setUser(u);
    setPage("home");

    setTimeout(() => {
      loadNotifications();
      loadBookings();
    }, 300);
  };

  const logout = () => {
    localStorage.removeItem("cgs_current_user");

    localStorage.removeItem("cgs_token");

    setUser(null);
    setBookings([]);
    setNotifications([]);
    setPage("home");
  };

  const protectedNavigation = (next, serviceName = "") => {
    const protectedPages = [
      "provider",
      "provider-dashboard",
      "profile",
      "notifications",
    ];

    if (protectedPages.includes(next) && !user) {
      setPage("login");
      return;
    }

    if (next === "services") {
      setSelectedService(serviceName);
    }

    setPage(next);
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE BOOKING
  |--------------------------------------------------------------------------
  */

  const confirmBooking = async (details) => {
    const token = localStorage.getItem("cgs_token");

    if (!token) {
      throw new Error("Please login again.");
    }

    const providerId = details.providerId || details._id;

    const serviceId = details.serviceId || details.service?._id;

    if (!providerId) {
      throw new Error("Provider information is missing.");
    }

    if (!serviceId) {
      throw new Error("Service information is missing.");
    }

    const payload = {
      providerId,
      serviceId,
      date: details.date,
      time: details.time || "10:00",
      location: details.location,
      amount: Number(details.amount || 0),

      paymentStatus: "PENDING",
      paymentMethod: "CASH",
      orderId: null,
      paymentId: null,
    };

    const response = await fetch(`${API_URL}/bookings`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to create booking");
    }

    /*
     * Close booking form.
     */

    setBooking(null);

    /*
     * Update local bookings immediately.
     */

    setBookings((previous) => {
      const exists = previous.some((item) => item._id === data._id);

      if (exists) {
        return previous.map((item) => (item._id === data._id ? data : item));
      }

      return [data, ...previous];
    });

    await loadNotifications();
  };

  /*
  |--------------------------------------------------------------------------
  | CASH PAYMENT
  |--------------------------------------------------------------------------
  */

  const payCash = async (bookingOverride = null) => {
    const targetBooking = bookingOverride || paymentBooking;

    if (!targetBooking?._id) {
      return;
    }

    const token = localStorage.getItem("cgs_token");

    if (!token) {
      setToast("Please login again.");
      return;
    }

    try {
      setPaymentLoading(true);

      const response = await fetch(`${API_URL}/payments/cash`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          bookingId: paymentBooking._id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to record cash payment");
      }

      /*
       * Update booking immediately.
       */

      setBookings((previous) =>
        previous.map((item) =>
          item._id === data.booking?._id ? data.booking : item,
        ),
      );

      setPaymentBooking(null);

      await loadBookings();
      await loadNotifications();

      setToast("Cash payment selected successfully.");
    } catch (error) {
      console.error("Cash payment error:", error);

      setToast(error.message || "Unable to record cash payment.");
    } finally {
      setPaymentLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RAZORPAY PAYMENT
  |--------------------------------------------------------------------------
  */

  const payOnline = async (bookingOverride = null) => {
    const targetBooking = bookingOverride || paymentBooking;

    if (!targetBooking?._id) {
      return;
    }

    const token = localStorage.getItem("cgs_token");

    if (!token) {
      setToast("Please login again.");
      return;
    }

    try {
      setPaymentLoading(true);

      /*
       * Wait for Razorpay script if it
       * has not loaded yet.
       */

      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          let attempts = 0;

          const check = setInterval(() => {
            attempts++;

            if (window.Razorpay) {
              clearInterval(check);

              resolve();
            }

            if (attempts > 50) {
              clearInterval(check);

              reject(new Error("Razorpay failed to load."));
            }
          }, 100);
        });
      }

      /*
       * Create Razorpay order.
       */

      const orderResponse = await fetch(`${API_URL}/payments/create-order`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          bookingId: targetBooking._id,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Unable to create payment order");
      }

      /*
       * Razorpay checkout options.
       */

      const options = {
        key: orderData.keyId,

        amount: orderData.amount,

        currency: orderData.currency || "INR",

        name: "KaushalSetu",

        description: `Payment for ${
          targetBooking.serviceId?.name ||
          targetBooking.service?.name ||
          "Service"
        }`,

        order_id: orderData.orderId,

        prefill: {
          name: user?.name || "",

          email: user?.email || "",
        },

        theme: {
          color: "#8b5e58",
        },

        handler: async function (paymentResponse) {
          try {
            /*
             * Verify payment on backend.
             */

            const verifyResponse = await fetch(`${API_URL}/payments/verify`, {
              method: "POST",

              headers: {
                "Content-Type": "application/json",

                Authorization: `Bearer ${token}`,
              },

              body: JSON.stringify({
                bookingId: targetBooking._id,

                razorpay_order_id: paymentResponse.razorpay_order_id,

                razorpay_payment_id: paymentResponse.razorpay_payment_id,

                razorpay_signature: paymentResponse.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.message || "Payment verification failed",
              );
            }

            /*
             * Update UI immediately.
             */

            if (verifyData.booking) {
              setBookings((previous) =>
                previous.map((item) =>
                  item._id === verifyData.booking._id
                    ? verifyData.booking
                    : item,
                ),
              );
            }

            setPaymentBooking(null);

            await loadBookings();
            await loadNotifications();

            setToast("Payment successful! Booking payment status is now PAID.");
          } catch (error) {
            console.error("Payment verification error:", error);

            setToast(error.message || "Payment verification failed.");
          } finally {
            setPaymentLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response);

        setPaymentLoading(false);

        setToast("Payment failed. Your booking is still pending payment.");
      });

      razorpay.open();
    } catch (error) {
      console.error("Online payment error:", error);

      setPaymentLoading(false);

      setToast(error.message || "Unable to open payment window.");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CANCEL BOOKING
  |--------------------------------------------------------------------------
  */

  const confirmCancellation = async (bookingToCancel) => {
    const token = localStorage.getItem("cgs_token");

    if (!token) {
      setToast("Please login again.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/bookings/${bookingToCancel._id}/cancel`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to cancel booking");
      }

      setBookings((previous) =>
        previous.map((b) => (b._id === bookingToCancel._id ? data : b)),
      );

      setCancelBooking(null);

      await loadNotifications();

      setToast("Booking cancelled successfully.");
    } catch (error) {
      console.error("Cancellation error:", error);

      setToast(error.message || "Unable to cancel booking");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | WORK COMPLETION
  |--------------------------------------------------------------------------
  */

  const getBookingFromNotification = (notification) => {
    const booking = notification?.bookingId;

    if (booking && typeof booking === "object") {
      return booking;
    }

    return bookings.find((item) => item._id === booking);
  };

  const confirmWorkCompletion = async (notification, completed) => {
    const token = localStorage.getItem("cgs_token");

    if (!token) {
      setToast("Please login again.");
      return;
    }

    const bookingId = notification.bookingId?._id || notification.bookingId;

    if (!bookingId) {
      setToast("Booking information is missing.");
      return;
    }

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
            completed: completed === true,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to confirm completion");
      }

      setBookings((previous) =>
        previous.map((b) => (b._id === data._id ? data : b)),
      );

      await loadNotifications();
      await loadBookings();

      setToast(
        completed
          ? "Work confirmed successfully."
          : "Work completion rejected.",
      );
    } catch (error) {
      console.error("Completion error:", error);

      setToast(error.message || "Unable to confirm work completion.");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | NOTIFICATIONS
  |--------------------------------------------------------------------------
  */

  const markAllNotificationsRead = async () => {
    const token = localStorage.getItem("cgs_token");

    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to mark notifications");
      }

      await loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const markNotificationRead = async (id) => {
    const token = localStorage.getItem("cgs_token");

    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to mark notification");
      }

      await loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | NAVIGATION
  |--------------------------------------------------------------------------
  */

  let content = null;

  if (page === "home") {
    content = <Home onNavigate={protectedNavigation} />;
  }

  if (page === "services") {
    content = (
      <Services onBook={setBooking} selectedService={selectedService} />
    );
  }

  if (page === "how") {
    content = <HowItWorks />;
  }

  if (page === "community") {
    content = <Community />;
  }

  if (page === "about") {
    content = <About />;
  }

  if (page === "login") {
    content = <Login onAuth={login} />;
  }

  if (page === "provider") {
    content = (
      <Provider user={user} onAuth={login} onNavigate={protectedNavigation} />
    );
  }

  if (page === "provider-dashboard") {
    content = <ProviderDashboard user={user} />;
  }

  if (page === "location") {
    content = <Home onNavigate={protectedNavigation} />;
  }

  if (page === "messages") {
    content = (
      <div className="placeholder-page">
        <h1>Messages</h1>
        <p>Your conversations with service providers will appear here.</p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | NOTIFICATIONS PAGE
  |--------------------------------------------------------------------------
  */

  if (page === "notifications") {
    content = (
      <section className="notifications-page">
        <div className="section-heading">
          <div>
            <span className="eyebrow">UPDATES</span>

            <h2>Notifications</h2>
          </div>

          {notifications.length > 0 && (
            <button className="outline-btn" onClick={markAllNotificationsRead}>
              Mark all as read
            </button>
          )}
        </div>

        {loadingNotifications && notifications.length === 0 ? (
          <div className="empty-bookings">
            <h3>Loading notifications...</h3>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-bookings">
            <div className="empty-icon">🔔</div>

            <h3>No notifications</h3>

            <p>Your booking updates will appear here.</p>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map((n) => {
              const isCompletion = n.type === "WORK_COMPLETED";

              const responded = n.completionResponded === true;

              return (
                <div
                  className={`notification-card ${n.read ? "read" : "unread"}`}
                  key={n._id}
                >
                  <div className="notification-icon">🔔</div>

                  <div className="notification-content">
                    <b>{n.title}</b>

                    <span>{n.message}</span>

                    {n.type === "BOOKING_CONFIRMED" &&
                      n.bookingId?.providerId?.phone && (
                        <div className="provider-contact">
                          <strong>Provider Contact:</strong>

                          <a href={`tel:${n.bookingId.providerId.phone}`}>
                            📞 {n.bookingId.providerId.phone}
                          </a>
                        </div>
                      )}

                    <small>
                      {n.createdAt
                        ? new Date(n.createdAt).toLocaleString()
                        : ""}
                    </small>

                    {isCompletion && !responded && (
                      <div className="completion-actions">
                        <button
                          className="primary-btn"
                          onClick={() => confirmWorkCompletion(n, true)}
                        >
                          Yes, work is completed
                        </button>

                        <button
                          className="danger-btn"
                          onClick={() => confirmWorkCompletion(n, false)}
                        >
                          No, not completed
                        </button>
                      </div>
                    )}

                    {isCompletion && responded && (
                      <div className="completion-response">
                        {n.completionConfirmed ? (
                          <>
                            <span>
                              ✓ You confirmed that the work was completed.
                            </span>

                            {(() => {
                              const completionBooking =
                                getBookingFromNotification(n);
                              const paymentStatus =
                                completionBooking?.paymentStatus || "PENDING";

                              if (paymentStatus === "PAID") {
                                return (
                                  <div className="completion-payment-paid">
                                    ✓ Payment completed
                                  </div>
                                );
                              }

                              if (!completionBooking?._id) {
                                return null;
                              }

                              return (
                                <div className="completion-payment">
                                  <strong>Complete payment</strong>

                                  <span>
                                    Amount: ₹{completionBooking.amount || 0}
                                  </span>

                                  <div className="completion-payment-actions">
                                    <button
                                      className="payment-option"
                                      disabled={paymentLoading}
                                      onClick={() => payCash(completionBooking)}
                                    >
                                      <div className="payment-option-icon">
                                        💵
                                      </div>

                                      <div>
                                        <b>Cash</b>
                                        <span>Pay in cash</span>
                                      </div>
                                    </button>

                                    <button
                                      className="payment-option"
                                      disabled={paymentLoading}
                                      onClick={() =>
                                        payOnline(completionBooking)
                                      }
                                    >
                                      <div className="payment-option-icon">
                                        💳
                                      </div>

                                      <div>
                                        <b>Online Payment</b>
                                        <span>Pay securely with Razorpay</span>
                                      </div>
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}
                          </>
                        ) : (
                          <span>
                            ✕ You reported that the work was not completed.
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {!n.read && !isCompletion && (
                    <button
                      className="notification-mark-read"
                      onClick={() => markNotificationRead(n._id)}
                    >
                      ✓
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PROFILE / BOOKINGS
  |--------------------------------------------------------------------------
  */

  if (page === "profile") {
    content = (
      <section className="profile-page">
        <div className="profile-head">
          <div className="profile-avatar-large">
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>

          <div>
            <span className="eyebrow">MY ACCOUNT</span>

            <h1>{user?.name}</h1>

            <p>{user?.email}</p>
          </div>

          <button className="outline-btn profile-logout" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="bookings-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR ACTIVITY</span>

              <h2>My Bookings</h2>
            </div>

            <span className="booking-count">
              {bookings.length} booking
              {bookings.length === 1 ? "" : "s"}
            </span>
          </div>

          {loadingBookings ? (
            <div className="empty-bookings">
              <div className="empty-icon">⏳</div>

              <h3>Loading bookings...</h3>
            </div>
          ) : bookings.length === 0 ? (
            <div className="empty-bookings">
              <div className="empty-icon">📅</div>

              <h3>No bookings yet</h3>

              <button
                className="primary-btn"
                onClick={() => setPage("services")}
              >
                Explore Services
              </button>
            </div>
          ) : (
            <div className="booking-list">
              {bookings.map((b) => {
                const serviceName =
                  b.serviceId?.name || b.service?.name || b.title || "Service";

                const providerName =
                  b.providerId?.userId?.name ||
                  b.providerId?.name ||
                  "Verified Provider";

                const address =
                  typeof b.location === "string"
                    ? b.location
                    : b.location?.address || "Selected location";

                const cancelled = b.status === "CANCELLED";

                const completed = b.status === "COMPLETED";

                return (
                  <div className="booking-card" key={b._id}>
                    <div className="booking-icon">{cancelled ? "×" : "✓"}</div>

                    <div className="booking-main">
                      <div className="booking-title-row">
                        <h3>{serviceName}</h3>

                        <span className="confirmed-badge">{b.status}</span>
                      </div>

                      <p>
                        Provider: <b>{providerName}</b>
                      </p>

                      <div className="booking-meta">
                        <span>
                          📅{" "}
                          {b.date ? new Date(b.date).toLocaleDateString() : ""}
                        </span>

                        <span>📍 {address}</span>
                      </div>

                      {b.time && (
                        <div className="booking-meta">
                          <span>🕒 {b.time}</span>
                        </div>
                      )}

                      <div className="booking-meta">
                        <span>💰 ₹{b.amount}</span>

                        <span>💳 {b.paymentStatus || "PENDING"}</span>
                      </div>

                      {!cancelled &&
                        !completed &&
                        b.status !== "WORK_COMPLETED" && (
                          <button
                            className="cancel-booking-btn"
                            onClick={() => setCancelBooking(b)}
                          >
                            Cancel booking
                          </button>
                        )}

                      
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="app">
      <Header
        user={user}
        onNavigate={protectedNavigation}
        onLogout={logout}
        notifications={notifications}
        onReadNotifications={markAllNotificationsRead}
      />

      <main>{content}</main>

      <Footer onNavigate={protectedNavigation} />

      {/* =====================================================
          CANCEL MODAL
      ===================================================== */}

      {cancelBooking && (
        <div className="modal-backdrop" onClick={() => setCancelBooking(null)}>
          <div
            className="modal cancel-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setCancelBooking(null)}
            >
              ×
            </button>

            <span className="eyebrow">CANCEL BOOKING</span>

            <h2>Are you sure you want to cancel?</h2>

            <p>This will cancel your booking.</p>

            <div className="cancel-actions">
              <button
                className="outline-btn"
                onClick={() => setCancelBooking(null)}
              >
                No, keep booking
              </button>

              <button
                className="danger-btn"
                onClick={() => confirmCancellation(cancelBooking)}
              >
                Yes, cancel booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          BOOKING MODAL
      ===================================================== */}

      {booking && (
        <div className="modal-backdrop" onClick={() => setBooking(null)}>
          <div
            className="modal booking-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setBooking(null)}>
              ×
            </button>

            <span className="eyebrow">BOOK SERVICE</span>

            <h2>
              {booking.title || booking.role || booking.name || "Service"}
            </h2>

            <p>Choose your preferred date and location.</p>

            {!user ? (
              <>
                <div className="notice-box">
                  Please login before confirming a booking.
                </div>

                <button
                  className="primary-btn"
                  onClick={() => {
                    setBooking(null);

                    setPage("login");
                  }}
                >
                  Login to continue
                </button>
              </>
            ) : (
              <BookingForm booking={booking} onConfirm={confirmBooking} />
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          PAYMENT MODAL
      ===================================================== */}

      {paymentBooking && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!paymentLoading) {
              setPaymentBooking(null);
            }
          }}
        >
          <div
            className="modal payment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {!paymentLoading && (
              <button
                className="modal-close"
                onClick={() => setPaymentBooking(null)}
              >
                ×
              </button>
            )}

            <span className="eyebrow">PAYMENT</span>

            <h2>How would you like to pay?</h2>

            <p>Complete payment for your booking.</p>

            <div className="payment-summary">
              <div>
                <span>Service</span>

                <b>
                  {paymentBooking.serviceId?.name ||
                    paymentBooking.service?.name ||
                    "Service"}
                </b>
              </div>

              <div>
                <span>Amount</span>

                <strong>₹{paymentBooking.amount}</strong>
              </div>
            </div>

            <div className="payment-options">
              <button
                className="payment-option"
                disabled={paymentLoading}
                onClick={payCash}
              >
                <div className="payment-option-icon">💵</div>

                <div>
                  <b>Cash</b>

                  <span>Pay in cash</span>
                </div>
              </button>

              <button
                className="payment-option"
                disabled={paymentLoading}
                onClick={payOnline}
              >
                <div className="payment-option-icon">💳</div>

                <div>
                  <b>Online Payment</b>

                  <span>Pay securely with Razorpay</span>
                </div>
              </button>
            </div>

            {paymentLoading && (
              <div className="payment-loading">Opening secure payment...</div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (
        <div className="booking-toast" role="status">
          <div className="toast-check">✓</div>

          <div>
            <b>Update</b>

            <span>{toast}</span>
          </div>

          <button
            onClick={() => {
              setToast("");
              setPage("profile");
            }}
          >
            View bookings
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   BOOKING FORM
========================================================= */

function BookingForm({ booking, onConfirm }) {
  const [date, setDate] = useState("");

  const [location, setLocation] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setError("");

    if (!date || !location.trim()) {
      setError("Please select a date and enter your service location.");

      return;
    }

    setLoading(true);

    try {
      await onConfirm({
        ...booking,
        date,
        location: location.trim(),
      });
    } catch (err) {
      console.error("Booking error:", err);

      setError(err.message || "Unable to confirm booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <label className="modal-label">
        Preferred date
        <input
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>

      <label className="modal-label">
        Service location
        <textarea
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="House no., street, area, city"
        />
      </label>

      {error && <div className="form-error">{error}</div>}

      <button className="primary-btn" type="submit" disabled={loading}>
        {loading ? "Creating booking..." : "Confirm Booking"}
      </button>
    </form>
  );
}
