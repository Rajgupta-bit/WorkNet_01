import React, { useEffect, useState } from "react";
import {
  UserRound,
  BriefcaseBusiness,
  MapPin,
  IndianRupee,
  Phone,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Provider({ user, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

const skillOptions = [
  "Cleaner",
  "Plumber",
  "Electrician",
  "Carpenter",
  "Appliance Repair",
  "Gardener",
  "Painter",
  "Laundry",
  "Mover",
  "Cook",
];

  const [form, setForm] = useState({
    name: user?.name || "",
    skills: "",
    experience: "",
    hourlyRate: "",
    phone: "",
    city: "",
    about: "",
  });

  /* =========================================================
     CHECK IF PROVIDER ALREADY EXISTS
  ========================================================= */

  useEffect(() => {
    checkProvider();
  }, []);

  async function checkProvider() {
    const token = localStorage.getItem("cgs_token");

    if (!token) {
      setError("Please login first.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/providers/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const provider = await response.json();

        localStorage.setItem("cgs_provider", JSON.stringify(provider));

        /* Already provider → dashboard */
        onNavigate("provider-dashboard");

        return;
      }

      if (response.status !== 404) {
        const data = await response.json();

        throw new Error(data.message || "Unable to check provider profile");
      }
    } catch (err) {
      console.error("Provider check error:", err);

      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     INPUT
  ========================================================= */

  const change = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const submit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Provider name is required.");
      return;
    }

    const token = localStorage.getItem("cgs_token");

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: form.name.trim(),

        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),

        experience: Number(form.experience) || 0,

        hourlyRate: Number(form.hourlyRate) || 0,

        phone: form.phone.trim(),

        city: form.city.trim(),

        about: form.about.trim(),

        availability: true,
      };

      const response = await fetch(`${API_URL}/providers`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create provider");
      }

      const provider = data.provider || data;

      localStorage.setItem("cgs_provider", JSON.stringify(provider));

      /* ALWAYS go dashboard */
      onNavigate("provider-dashboard");
    } catch (err) {
      console.error("Provider creation error:", err);

      setError(err.message || "Failed to create provider profile");
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <section className="provider-page page-section">
        <div className="empty-bookings">
          <div className="empty-icon">⏳</div>

          <h3>Checking provider profile...</h3>
        </div>
      </section>
    );
  }

  /* =========================================================
     FORM
  ========================================================= */

  return (
    <section className="provider-page page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">BECOME A PROVIDER</span>

          <h1>Offer your services</h1>

          <p>Create your provider profile and start receiving local jobs.</p>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}
  <div className="form-box">
          <form className="provider-form" onSubmit={submit}>
        {/* NAME */}

        <label className="modal-label">
          <span>Your name</span>

          <div className="input-icon">
            <UserRound size={17} />

            <input
              name="name"
              value={form.name}
              onChange={change}
              placeholder="Your full name"
            />
          </div>
        </label>

        {/* SKILLS */}

        <label className="modal-label">
          <span>Skills</span>

          <div className="input-icon">
            <BriefcaseBusiness size={17} />

            <select name="skills" value={form.skills} onChange={change}>
              <option value="">Select your skill</option>

              {skillOptions.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>

          <small>Select the skill you provide.</small>
        </label>

        {/* EXPERIENCE */}

        <label className="modal-label">
          <span>Experience (years)</span>

          <input
            type="number"
            min="0"
            name="experience"
            value={form.experience}
            onChange={change}
            placeholder="2"
          />
        </label>

        {/* RATE */}

        <label className="modal-label">
          <span>Hourly rate</span>

          <div className="input-icon">
            <IndianRupee size={17} />

            <input
              type="number"
              min="0"
              name="hourlyRate"
              value={form.hourlyRate}
              onChange={change}
              placeholder="500"
            />
          </div>
        </label>

        {/* PHONE */}

        <label className="modal-label">
          <span>Phone</span>

          <div className="input-icon">
            <Phone size={17} />

            <input
              name="phone"
              value={form.phone}
              onChange={change}
              placeholder="9876543210"
            />
          </div>
        </label>

        {/* CITY */}

        <label className="modal-label">
          <span>City</span>

          <div className="input-icon">
            <MapPin size={17} />

            <input
              name="city"
              value={form.city}
              onChange={change}
              placeholder="Gorakhpur"
            />
          </div>
        </label>

        {/* ABOUT */}

        <label className="modal-label">
          <span>About you</span>

          <textarea
            name="about"
            value={form.about}
            onChange={change}
            placeholder="Tell customers about your experience..."
            rows="5"
          />
        </label>

        <button className="primary-btn" type="submit" disabled={submitting}>
          {submitting ? "Creating profile..." : "Create Provider Profile"}
        </button>
      </form>
    </div>  
    </section>
  );
}
