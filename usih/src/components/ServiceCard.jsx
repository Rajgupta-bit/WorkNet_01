import React, { useState } from "react";
import {
  CalendarCheck,
  Clock3,
  Heart,
  MapPin,
  Star,
} from "lucide-react";

export default function ServiceCard({
  service,
  onBook,
}) {
  const [liked, setLiked] =
    useState(false);

  const title =
    service.title ||
    service.name ||
    "Service";

  return (
    <article className="service-card">

      <div className="service-image">

        <img
          src={service.image}
          alt={title}
        />

        <button
          className={
            liked
              ? "heart liked"
              : "heart"
          }
          onClick={() =>
            setLiked(!liked)
          }
        >
          <Heart
            size={19}
            fill={
              liked
                ? "currentColor"
                : "none"
            }
          />
        </button>

      </div>

      <div className="service-content">

        <div className="service-title-row">

          <h3>
            {title}
          </h3>

          <span className="rating">

            <Star
              size={13}
              fill="currentColor"
            />

            {service.rating ?? "4.8"}

          </span>

        </div>

        <p>
          {service.description ||
            `Trusted local workers for ${title.toLowerCase()}.`}
        </p>

        <div className="service-meta">

          <span>
            <Clock3 size={14} />

            {service.time ||
              "30-60 min"}
          </span>

          <span>
            <MapPin size={14} />

            Near you
          </span>

        </div>

        <div className="service-bottom">

          <strong>
            From ₹{service.price}
          </strong>

          <button
            onClick={() =>
              onBook(service)
            }
          >
            <CalendarCheck
              size={15}
            />

            Book
          </button>

        </div>

      </div>

    </article>
  );
}