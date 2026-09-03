import React from "react";
import { ArrowRight, CheckCircle2, MapPinned,  ShieldCheck, UsersRound } from "lucide-react";
import MapSection from "../components/MapSection";
import { workers } from "../data";
import logo from "../assets/worknet-main-dark.png";
// import logo from "../assets/logo.png";

export default function Home({ onNavigate }) {
  return (
    <>
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="eyebrow">COMMUNITY POWERED SERVICES</span>
          <h1>Local skills.<br/><em>Stronger community.</em></h1>
          <p>Find trusted workers around you, book services easily, and help local people earn through their skills.</p>

          <div className="home-actions">
            <button className="primary-btn" onClick={() => onNavigate("services")}>Find a Service <ArrowRight size={17}/></button>
            <button className="secondary-btn" onClick={() => onNavigate("provider")}>Become a Provider</button>
          </div>

          <div className="hero-trust">
            <span><CheckCircle2 size={17}/> Verified workers</span>
            <span><ShieldCheck size={17}/> Secure booking</span>
            <span><UsersRound size={17}/> Community first</span>
          </div>
        </div>

        <div className="hero-card">
         <img
        src={logo}
        alt="WorkNet"
         className="hero-logo"
         />
          {/* <div className="floating-card top"><MapPinned size={19}/><span><b>Find nearby</b><small>Workers around your location</small></span></div> */}
          {/* <div className="hero-illustration"><Wrench size={75}/><UsersRound size={70}/></div> */}
          {/* <div className="floating-card bottom"><span className="mini-avatar">✓</span><span><b>Trusted providers</b><small>4.8 average rating</small></span></div>*/}
        </div> 
      </section>

      <section className="stats-strip">
        <div><b>10K+</b><span>Community Workers</span></div>
        <div><b>25K+</b><span>Services Completed</span></div>
        <div><b>4.8★</b><span>Average Rating</span></div>
        <div><b>50+</b><span>Cities Covered</span></div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><span className="eyebrow">DISCOVER</span><h2>Services near you</h2><p>From everyday household work to skilled repairs, find help when you need it.</p></div>
          <button className="text-btn" onClick={() => onNavigate("services")}>View all <ArrowRight size={16}/></button>
        </div>
        <div className="quick-service-grid">
          {["Cleaning","Plumbing","Electrical","Carpentry"].map((x, i) => (
            <button key={x} onClick={() => onNavigate("services",x)} className="quick-service">
              <span>{["🧹","🔧","⚡","🪚"][i]}</span><b>{x}</b><small>Find trusted providers</small>
            </button>
          ))}
        </div>
      </section>

      <section className="section map-section">
        <div className="section-heading">
          <div><span className="eyebrow">LIVE DISCOVERY</span><h2>Find workers around you</h2><p>Explore provider locations across the region.</p></div>
          <button className="secondary-btn" onClick={() => document.querySelector(".map-location-btn")?.click()}>
  <MapPinned size={16}/> Use my location
</button>
        </div>
        <MapSection />
      </section>

      <section className="section green-section">
        <div>
          <span className="eyebrow">FOR WORKERS</span>
          <h2>Turn your skill into an opportunity.</h2>
          <p>Join a community where local skills meet people who need them. Set your availability, get bookings and build your reputation.</p>
          <button className="primary-btn" onClick={() => onNavigate("provider")}>Become a Provider <ArrowRight size={17}/></button>
        </div>
        <div className="worker-stack">
          {workers.slice(0, 4).map(w => <div className="stack-worker" key={w.id}><span>{w.name.slice(0,1)}</span><div><b>{w.name}</b><small>{w.role} · ⭐ {w.rating}</small></div></div>)}
        </div>
      </section>
    </>
  );
}
