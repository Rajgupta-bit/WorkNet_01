import React, {
  useState,
} from "react";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import Captcha from "./Captcha";

const API_URL =
  import.meta.env.VITE_API_URL;

export default function Auth({
  mode = "login",
  onAuth,
}) {
  const [type, setType] =
    useState(mode);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [captchaValid, setCaptchaValid] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function submit(e) {
    e.preventDefault();

    setError("");

    if (
      !email ||
      !password ||
      (type === "signup" &&
        !name)
    ) {
      setError(
        "Please fill all required fields."
      );

      return;
    }

    if (!captchaValid) {
      setError(
        "Please complete the CAPTCHA."
      );

      return;
    }

    try {
      setLoading(true);

      const endpoint =
        type === "signup"
          ? `${API_URL}/auth/register`
          : `${API_URL}/auth/login`;

      const body =
        type === "signup"
          ? {
              name:
                name.trim(),

              email:
                email.trim(),

              password,

              role: "customer",
            }
          : {
              email:
                email.trim(),

              password,
            };

      const response =
        await fetch(
          endpoint,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(body),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Authentication failed."
        );
      }

      localStorage.setItem(
        "cgs_token",
        data.token
      );

      localStorage.setItem(
        "cgs_current_user",
        JSON.stringify(
          data.user
        )
      );

      onAuth(data.user);

    } catch (err) {
      setError(
        err.message ||
          "Something went wrong."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-icon">
          <UserRound size={26} />
        </div>

        <h1>
          {type === "login"
            ? "Welcome back"
            : "Create your account"}
        </h1>

        <p>
          {type === "login"
            ? "Login to book trusted local services."
            : "Join the community and find reliable workers."}
        </p>

        <form
          onSubmit={submit}
        >

          {type ===
            "signup" && (
            <label>
              <span>
                Name
              </span>

              <div className="input-icon">

                <UserRound
                  size={17}
                />

                <input
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="Your full name"
                />

              </div>
            </label>
          )}

          <label>

            <span>
              Email
            </span>

            <div className="input-icon">

              <Mail size={17} />

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                placeholder="you@example.com"
              />

            </div>

          </label>

          <label>

            <span>
              Password
            </span>

            <div className="input-icon">

              <LockKeyhole
                size={17}
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="••••••••"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>

            </div>

          </label>

          <Captcha
            onValidChange={
              setCaptchaValid
            }
          />

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button
            className="primary-btn"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : type === "login"
              ? "Login"
              : "Create Account"}
          </button>

        </form>

        <div className="auth-switch">

          {type === "login"
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={() => {
              setType(
                type === "login"
                  ? "signup"
                  : "login"
              );

              setError("");
              setCaptchaValid(false);
            }}
          >
            {type === "login"
              ? "Sign up"
              : "Login"}
          </button>

        </div>

      </div>

    </div>
  );
}