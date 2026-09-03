import React, {
  useEffect,
  useState,
} from "react";

import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  IndianRupee,
  MapPin,
  XCircle,
  Bell,
  Power,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL;

export default function ProviderDashboard({
  user,
}) {
  const [jobs, setJobs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [availability, setAvailability] =
    useState(true);

  const [error, setError] =
    useState("");

  const token =
    localStorage.getItem(
      "cgs_token"
    );

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/bookings/provider`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load jobs"
        );
      }

      setJobs(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Unable to load jobs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchJobs();
    } else {
      setLoading(false);
      setError(
        "Please login first."
      );
    }
  }, []);

  const updateJob = async (
    id,
    action
  ) => {
    try {
      setError("");

     const statusMap = {
  accept: "CONFIRMED",
  reject: "CANCELLED",
  complete: "WORK_COMPLETED",
};

      const status =
        statusMap[action];

      const response =
        await fetch(
          `${API_URL}/bookings/provider/${id}/status`,
          {
            method: "PATCH",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              status,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update booking"
        );
      }

      setJobs(
        (current) =>
          current.map((job) =>
            job._id === id
              ? data
              : job
          )
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to update booking"
      );
    }
  };

  const pendingJobs =
    jobs.filter(
      (job) =>
        job.status === "PENDING"
    );

  const activeJobs =
    jobs.filter(
      (job) =>
        job.status === "CONFIRMED"
    );

  const completedJobs =
    jobs.filter(
      (job) =>
        job.status === "COMPLETED"
    );

  const earnings =
    completedJobs.reduce(
      (total, job) =>
        total +
        Number(
          job.amount || 0
        ),
      0
    );

  return (
    <section className="provider-dashboard page-section">

      <div className="dashboard-header">
        <div>
          <span className="eyebrow">
            PROVIDER DASHBOARD
          </span>

          <h1>
            Welcome,{" "}
            {user?.name ||
              "Provider"}{" "}
            👋
          </h1>

          <p>
            Manage your jobs,
            bookings and
            availability.
          </p>
        </div>

        <button
          className={`availability-btn ${
            availability
              ? "available"
              : "unavailable"
          }`}
          onClick={() =>
            setAvailability(
              !availability
            )
          }
        >
          <Power size={17} />

          {availability
            ? "Available"
            : "Unavailable"}
        </button>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="provider-stats">

        <div className="provider-stat-card">
          <div className="stat-icon">
            <Bell />
          </div>

          <div>
            <span>
              New Requests
            </span>

            <strong>
              {pendingJobs.length}
            </strong>
          </div>
        </div>

        <div className="provider-stat-card">
          <div className="stat-icon">
            <BriefcaseBusiness />
          </div>

          <div>
            <span>
              Active Jobs
            </span>

            <strong>
              {activeJobs.length}
            </strong>
          </div>
        </div>

        <div className="provider-stat-card">
          <div className="stat-icon">
            <CheckCircle2 />
          </div>

          <div>
            <span>
              Completed
            </span>

            <strong>
              {completedJobs.length}
            </strong>
          </div>
        </div>

        <div className="provider-stat-card">
          <div className="stat-icon">
            <IndianRupee />
          </div>

          <div>
            <span>
              Earnings
            </span>

            <strong>
              ₹{earnings}
            </strong>
          </div>
        </div>

      </div>

      <div className="provider-jobs-section">

        <div className="section-heading">
          <div>
            <span className="eyebrow">
              JOB REQUESTS
            </span>

            <h2>
              Incoming Jobs
            </h2>
          </div>

          <button
            className="outline-btn"
            onClick={fetchJobs}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="empty-bookings">
            <Clock3 size={35} />
            <h3>
              Loading jobs...
            </h3>
          </div>
        ) : pendingJobs.length === 0 ? (
          <div className="empty-bookings">
            <div className="empty-icon">
              📭
            </div>

            <h3>
              No new job requests
            </h3>

            <p>
              New customer bookings
              will appear here.
            </p>
          </div>
        ) : (
          <div className="provider-job-list">
            {pendingJobs.map(
              (job) => (
                <article
                  className="provider-job-card"
                  key={job._id}
                >
                  <div className="job-card-top">
                    <div className="job-icon">
                      <BriefcaseBusiness
                        size={24}
                      />
                    </div>

                    <div>
                      <h3>
                        {job.serviceId?.name ||
                          "Service Booking"}
                      </h3>

                      <span className="pending-badge">
                        New Request
                      </span>
                    </div>
                  </div>

                  <div className="job-details">
                    <div>
                      <Clock3 size={16} />

                      <span>
                        {job.date
                          ? new Date(
                              job.date
                            ).toLocaleDateString()
                          : "Date not specified"}

                        {job.time
                          ? ` • ${job.time}`
                          : ""}
                      </span>
                    </div>

                    <div>
                      <MapPin size={16} />

                      <span>
                        {typeof job.location ===
                        "string"
                          ? job.location
                          : job.location?.address ||
                            job.location?.city ||
                            "Customer location"}
                      </span>
                    </div>

                    <div>
                      <IndianRupee
                        size={16}
                      />

                      <span>
                        ₹
                        {job.amount ||
                          0}
                      </span>
                    </div>
                  </div>

                  <div className="job-actions">
                    <button
                      className="danger-btn"
                      onClick={() =>
                        updateJob(
                          job._id,
                          "reject"
                        )
                      }
                    >
                      <XCircle size={17} />
                      Reject
                    </button>

                    <button
                      className="primary-btn"
                      onClick={() =>
                        updateJob(
                          job._id,
                          "accept"
                        )
                      }
                    >
                      <CheckCircle2
                        size={17}
                      />
                      Accept Job
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </div>

      <div className="provider-jobs-section">

        <div className="section-heading">
          <div>
            <span className="eyebrow">
              CURRENT WORK
            </span>

            <h2>
              Active Jobs
            </h2>
          </div>
        </div>

        {activeJobs.length === 0 ? (
          <div className="empty-bookings">
            <h3>
              No active jobs
            </h3>

            <p>
              Accepted jobs will
              appear here.
            </p>
          </div>
        ) : (
          <div className="provider-job-list">
            {activeJobs.map(
              (job) => (
                <article
                  className="provider-job-card"
                  key={job._id}
                >
                  <div className="job-card-top">
                    <div className="job-icon">
                      <CheckCircle2
                        size={24}
                      />
                    </div>

                    <div>
                      <h3>
                        {job.serviceId?.name ||
                          "Confirmed Service"}
                      </h3>

                      <span className="confirmed-badge">
                        CONFIRMED
                      </span>
                    </div>
                  </div>

                  <div className="job-details">
                    <div>
                      <Clock3 size={16} />

                      <span>
                        {job.date
                          ? new Date(
                              job.date
                            ).toLocaleDateString()
                          : "Date not specified"}

                        {job.time
                          ? ` • ${job.time}`
                          : ""}
                      </span>
                    </div>

                    <div>
                      <MapPin size={16} />

                      <span>
                        {typeof job.location ===
                        "string"
                          ? job.location
                          : job.location?.address ||
                            job.location?.city ||
                            "Customer location"}
                      </span>
                    </div>

                    <div>
                      <IndianRupee
                        size={16}
                      />

                      <span>
                        ₹
                        {job.amount ||
                          0}
                      </span>
                    </div>
                  </div>

                  <button
                    className="primary-btn"
                    onClick={() =>
                      updateJob(
                        job._id,
                        "complete"
                      )
                    }
                  >
                    <CheckCircle2
                      size={17}
                    />

                    Mark Job Completed
                  </button>
                </article>
              )
            )}
          </div>
        )}
      </div>

      <div className="provider-jobs-section">

        <div className="section-heading">
          <div>
            <span className="eyebrow">
              HISTORY
            </span>

            <h2>
              Completed Jobs
            </h2>
          </div>
        </div>

        {completedJobs.length === 0 ? (
          <div className="empty-bookings">
            <h3>
              No completed jobs yet
            </h3>
          </div>
        ) : (
          <div className="provider-job-list">
            {completedJobs.map(
              (job) => (
                <article
                  className="provider-job-card completed-job"
                  key={job._id}
                >
                  <div className="job-card-top">
                    <div className="job-icon">
                      <CheckCircle2
                        size={24}
                      />
                    </div>

                    <div>
                      <h3>
                        {job.serviceId?.name ||
                          "Completed Service"}
                      </h3>

                      <span className="confirmed-badge">
                        COMPLETED
                      </span>
                    </div>
                  </div>

                  <div className="job-details">
                    <div>
                      <Clock3 size={16} />

                      <span>
                        {job.date
                          ? new Date(
                              job.date
                            ).toLocaleDateString()
                          : "Date not specified"}
                      </span>
                    </div>

                    <div>
                      <MapPin size={16} />

                      <span>
                        {typeof job.location ===
                        "string"
                          ? job.location
                          : job.location?.address ||
                            job.location?.city ||
                            "Customer location"}
                      </span>
                    </div>

                    <div>
                      <IndianRupee
                        size={16}
                      />

                      <span>
                        ₹
                        {job.amount ||
                          0}
                      </span>
                    </div>

                    <div>
                      <span>
                        Payment:{" "}
                        {job.paymentStatus ||
                          "PENDING"}
                      </span>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}