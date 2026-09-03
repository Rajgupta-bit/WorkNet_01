import React, { useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  UserRound,
  X,
} from "lucide-react";
import logo from "../assets/worknet-main-dark.png";
// import logo from "../assets/logo.png";

export default function Header({
  user,
  onNavigate,
  onLogout,
  notifications = [],
  onReadNotifications,
}) {
  const [mobile, setMobile] = useState(false);
  const [profile, setProfile] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const go = (page) => {
    onNavigate(page);
    setMobile(false);
  };

  return (
    <header className="header">
      {/* Main WorkNet logo */}
      <button
        className="brand"
        onClick={() => go("home")}
        aria-label="Go to WorkNet home"
      >
        <img className="brand-logo" src={logo} alt="WorkNet" />
      </button>

      <nav className={mobile ? "nav open" : "nav"}>
        <button onClick={() => go("home")}>Home</button>
        <button onClick={() => go("services")}>Services</button>
        <button onClick={() => go("how")}>How It Works</button>
        <button onClick={() => go("about")}>About Us</button>
        <button onClick={() => go("provider")}>Become a Provider</button>
        <button onClick={() => go("community")}>Community</button>
      </nav>

      <div className="header-actions">
        <button className="location-chip" onClick={() => go("location")}>
          <MapPin size={17} /> Find near me
        </button>

        <button className="icon-btn" onClick={() => go("messages")} aria-label="Messages">
          <MessageSquare size={19} />
        </button>

        <button
          className="icon-btn notification-button"
          aria-label="Notifications"
          onClick={() => {
            go("notifications");
            onReadNotifications?.();
          }}
        >
          <Bell size={19} />
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <div className="profile-wrap">
          <button
            className="profile-btn"
            onClick={() => setProfile(!profile)}
            aria-expanded={profile}
          >
            <span className="avatar">
              {user ? user.name.slice(0, 2).toUpperCase() : "CU"}
            </span>
            <span className="profile-text">
              <b>{user ? user.name : "Customer"}</b>
              <small>Customer</small>
            </span>
            <ChevronDown size={14} />
          </button>

          {profile && (
            <div className="profile-menu">
              {user ? (
                <>
                  <div className="profile-menu-user">
                    <UserRound size={17} />
                    <span>{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      onNavigate("profile");
                      setProfile(false);
                    }}
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setProfile(false);
                    }}
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onNavigate("login");
                    setProfile(false);
                  }}
                >
                  Login / Sign Up
                </button>
              )}
            </div>
          )}
        </div>

        <button
          className="mobile-menu"
          onClick={() => setMobile(!mobile)}
          aria-label={mobile ? "Close menu" : "Open menu"}
        >
          {mobile ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
