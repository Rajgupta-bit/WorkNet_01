import React, { useState } from "react";

import {
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  IndianRupee,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL;

export default function WorkCompletionModal({
  booking,
  onClose,
  onConfirmed,
  onRejected,
}) {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  if (!booking) {
    return null;
  }

  const token =
    localStorage.getItem(
      "cgs_token"
    );

  const serviceName =
    booking.serviceId?.name ||
    booking.serviceId?.title ||
    "Service";

  const providerName =
    booking.providerId?.name ||
    booking.providerId?.userId?.name ||
    "Provider";

  const location =
    typeof booking.location ===
    "string"
      ? booking.location
      : booking.location?.address ||
        booking.location?.city ||
        "Customer location";

  const date =
    booking.date
      ? new Date(
          booking.date
        ).toLocaleDateString()
      : "Date not available";

  const handleResponse =
    async (confirmed) => {
      try {
        setLoading(true);

        setError("");

        if (!token) {
          throw new Error(
            "Please login again."
          );
        }

        const response =
          await fetch(
            `${API_URL}/bookings/${booking._id}/completion`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  confirmed,
                }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to update completion status."
          );
        }

        if (confirmed) {
          onConfirmed?.(
            data.booking
          );
        } else {
          onRejected?.(
            data.booking
          );
        }

        onClose?.();

      } catch (err) {
        console.error(
          "Completion confirmation error:",
          err
        );

        setError(
          err.message ||
            "Something went wrong."
        );

      } finally {
        setLoading(false);
      }
    };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
    >
      <div
        className="modal completion-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <button
          className="modal-close"
          onClick={onClose}
          disabled={loading}
        >
          ×
        </button>

        <div className="completion-icon">
          <CheckCircle2 size={32} />
        </div>

        <span className="eyebrow">
          WORK COMPLETED
        </span>

        <h2>
          Did the provider complete
          the work?
        </h2>

        <p>
          <b>
            {providerName}
          </b>{" "}
          has marked your{" "}
          <b>
            {serviceName}
          </b>{" "}
          booking as completed.
        </p>

        <div className="completion-details">

          <div>
            <Calendar size={17} />

            <span>
              {date}
            </span>
          </div>

          <div>
            <MapPin size={17} />

            <span>
              {location}
            </span>
          </div>

          <div>
            <IndianRupee size={17} />

            <span>
              ₹
              {booking.amount ||
                0}
            </span>
          </div>

        </div>

        <div className="completion-warning">

          <strong>
            Payment will be released
            only after you confirm.
          </strong>

          <span>
            If the work has not been
            completed, select No.
          </span>

        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <div className="completion-actions">

          <button
            className="danger-btn"
            disabled={loading}
            onClick={() =>
              handleResponse(
                false
              )
            }
          >
            <XCircle size={18} />

            No, not completed
          </button>

          <button
            className="primary-btn"
            disabled={loading}
            onClick={() =>
              handleResponse(
                true
              )
            }
          >
            <CheckCircle2 size={18} />

            Yes, completed
          </button>

        </div>

        {loading && (
          <p className="completion-loading">
            Updating booking...
          </p>
        )}

      </div>
    </div>
  );
}