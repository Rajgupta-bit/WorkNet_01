import React from "react";
import Auth from "../components/Auth";

export default function Login({ onAuth }) {
  return (
    <Auth
      mode="login"
      onAuth={onAuth}
    />
  );
}