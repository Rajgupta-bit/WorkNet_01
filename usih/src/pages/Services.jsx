import React, { useEffect, useMemo, useState } from "react";

import { Search, SlidersHorizontal } from "lucide-react";

import ServiceCard from "../components/ServiceCard";
import WorkerCard from "../components/WorkerCard";

import { categories } from "../data";

const API_URL = import.meta.env.VITE_API_URL;

const categoryToSkill = {
  Cleaning: "Cleaner",
  Plumbing: "Plumber",
  Electrical: "Electrician",
  Carpentry: "Carpenter",
  "Appliance Repair": "Appliance Repair",
  Gardening: "Gardener",
  Painting: "Painter",
  Laundry: "Laundry",
  "Moving & Delivery": "Mover",
  Cooking: "Cook",
};

export default function Services({ onBook, selectedService = "" }) {
  const [category, setCategory] = useState(selectedService || "All Services");

  useEffect(() => {
    setCategory(selectedService || "All Services");
  }, [selectedService]);

  const [query, setQuery] = useState("");

  const [showWorkers, setShowWorkers] = useState(false);

  const [minRating, setMinRating] = useState(4);

  const [services, setServices] = useState([]);

  const [workers, setWorkers] = useState([]);

  const [loadingServices, setLoadingServices] = useState(true);

  const [loadingWorkers, setLoadingWorkers] = useState(false);

  const [serviceError, setServiceError] = useState("");

  const [workerError, setWorkerError] = useState("");

  /* =====================================================
     LOAD SERVICES
  ===================================================== */

  useEffect(() => {
    async function loadServices() {
      try {
        setLoadingServices(true);
        setServiceError("");

        const response = await fetch(`${API_URL}/services`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load services");
        }

        console.log("SERVICES FROM BACKEND:", data);

        setServices(Array.isArray(data) ? data : data.services || []);
      } catch (error) {
        console.error("Services error:", error);

        setServiceError("Unable to load services.");
      } finally {
        setLoadingServices(false);
      }
    }

    loadServices();
  }, []);

  /* =====================================================
     LOAD PROVIDERS
  ===================================================== */

  useEffect(() => {
    async function loadWorkers() {
      try {
        setLoadingWorkers(true);
        setWorkerError("");

        const skill = categoryToSkill[category];

        const url =
          category === "All Services"
            ? `${API_URL}/providers`
            : `${API_URL}/providers?skill=${encodeURIComponent(
                skill || category,
              )}`;
        const response = await fetch(url);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load providers");
        }

        console.log("WORKERS FROM BACKEND:", data);

        setWorkers(Array.isArray(data) ? data : data.providers || []);
      } catch (error) {
        console.error("Providers error:", error);

        setWorkerError("Unable to load workers.");
      } finally {
        setLoadingWorkers(false);
      }
    }

    loadWorkers();
  }, [category]);

  /* =====================================================
     FILTER SERVICES
  ===================================================== */

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        category === "All Services" || service.category === category;

      const matchesSearch =
        !query ||
        `${service.name || ""} ${service.category || ""} ${
          service.description || ""
        }`
          .toLowerCase()
          .includes(query.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [services, category, query]);

  /* =====================================================
     FILTER WORKERS
  ===================================================== */

  const handleServiceBook = (service) => {
    // Is service ki category select karo
    setCategory(service.category || "All Services");

    // Workers section dikhao
    setShowWorkers(true);

    // Search clear karo
    setQuery("");
  };

 const filteredWorkers = useMemo(() => {
  return workers.filter((worker) => {
    const name =
      worker.userId?.name ||
      "Verified Provider";

    const skills =
      worker.skills?.join(" ") || "";

    const rating =
      Number(worker.rating ?? 5);

    const matchesSearch =
      !query ||
      `${name} ${skills}`
        .toLowerCase()
        .includes(query.toLowerCase());

    const matchesRating =
      rating >= minRating;

    return matchesSearch && matchesRating;
  });
}, [
  workers,
  query,
  minRating,
]);

  /* =====================================================
     UI
  ===================================================== */

  return (
    <section className="page-section">
      {/* HEADER */}

      <div className="page-title">
        <span className="eyebrow">DISCOVER</span>

        <h1>Find a service</h1>

        <p>Search trusted local providers and book the help you need.</p>
      </div>

      {/* SEARCH */}

      <div className="big-search">
        <Search size={21} />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cleaning, plumbing, electrician..."
        />
      </div>

      {/* CATEGORY */}

      <div className="category-pills">
        {categories.map((c) => (
          <button
            key={c}
            className={category === c ? "pill active" : "pill"}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* TOOLBAR */}

      <div className="toolbar">
        <button
          className={showWorkers ? "toggle active" : "toggle"}
          onClick={() => setShowWorkers((prev) => !prev)}
        >
          {showWorkers ? "Showing workers" : "Showing services"}
        </button>

        <label>
          Minimum rating{" "}
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
          >
            <option value="4">4.0+</option>

            <option value="4.5">4.5+</option>

            <option value="4.7">4.7+</option>
          </select>
        </label>

        <span>
          <SlidersHorizontal size={16} />
          {showWorkers ? filteredWorkers.length : filteredServices.length}{" "}
          results
        </span>
      </div>

      {/* =================================================
          SERVICES
      ================================================= */}

      {!showWorkers && (
        <>
          {loadingServices && (
            <div className="empty-bookings">
              <h3>Loading services...</h3>

              <p>Finding services for you.</p>
            </div>
          )}

          {serviceError && (
            <div className="empty-bookings">
              <h3>Something went wrong</h3>

              <p>{serviceError}</p>
            </div>
          )}

          {!loadingServices &&
            !serviceError &&
            filteredServices.length === 0 && (
              <div className="empty-bookings">
                <div className="empty-icon">🔍</div>

                <h3>No services found</h3>

                <p>Try another search or category.</p>
              </div>
            )}

          {!loadingServices && !serviceError && filteredServices.length > 0 && (
            <div className="service-grid">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={{
                    ...service,

                    title: service.name,

                    rating: service.rating ?? 4.8,

                    time: service.time ?? "30-60 min",
                  }}
                  onBook={handleServiceBook}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* =================================================
          WORKERS
      ================================================= */}

      {showWorkers && (
        <>
          {loadingWorkers && (
            <div className="empty-bookings">
              <h3>Finding workers...</h3>

              <p>Looking for available providers.</p>
            </div>
          )}

          {workerError && (
            <div className="empty-bookings">
              <h3>Something went wrong</h3>

              <p>{workerError}</p>
            </div>
          )}

          {!loadingWorkers && !workerError && filteredWorkers.length === 0 && (
            <div className="empty-bookings">
              <div className="empty-icon">👷</div>

              <h3>No workers found</h3>

              <p>No available providers match your search or rating.</p>
            </div>
          )}

          {!loadingWorkers && !workerError && filteredWorkers.length > 0 && (
            <div className="worker-list">
              {filteredWorkers.map((worker) => (
                <WorkerCard
                  key={worker._id}
                  worker={worker}
                  /*
                        IMPORTANT:
                        WorkerCard needs
                        services to find
                        the MongoDB
                        serviceId.
                      */

                  services={services}
                  onBook={onBook}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
