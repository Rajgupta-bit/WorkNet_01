import React from "react";
import {
  BriefcaseBusiness,
  MapPin,
  Star,
} from "lucide-react";

export default function WorkerCard({
  worker,
  onBook,
}) {
  const name =
    worker.userId?.name ||
    "Verified Provider";

  const skills =
    worker.skills?.length
      ? worker.skills.join(" · ")
      : "Service Provider";

  const rating =
    Number(worker.rating ?? 5);

  const jobs =
    worker.completedJobs ?? 0;

  return (
    <article className="worker-card">

      {/* AVATAR */}

      <div className="worker-avatar">
        {name
          .slice(0, 1)
          .toUpperCase()}
      </div>

      {/* INFO */}

      <div className="worker-info">

        <div className="worker-name-row">

          <h3>{name}</h3>

          {worker.verified && (
            <span className="verified">
              ✓ Verified
            </span>
          )}

        </div>

        <p>{skills}</p>

        <div className="worker-stats">

          <span>
            <Star
              size={14}
              fill="currentColor"
            />
            {rating.toFixed(1)}
          </span>

          <span>
            <BriefcaseBusiness
              size={14}
            />
            {jobs} jobs
          </span>

          <span>
            <MapPin size={14} />
            Available nearby
          </span>

        </div>

      </div>

      {/* BOOK */}

      <button
        className="outline-btn"
        onClick={() =>
          onBook({
            ...worker,

            name,

            role: skills,

            // MongoDB Service ID
            serviceId:
              "6a955ca7262a3f949cc3ea44",

            // Home Cleaning price
            amount: 299,
          })
        }
      >
        View & Book
      </button>

    </article>
  );
}