import React from "react";
import { HeartHandshake, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

export default function About() {
  return <section className="page-section">
    <div className="about-hero"><span className="eyebrow">OUR MISSION</span><h1>A marketplace that grows with the community.</h1><p>Cooperative Gig Services connects people who need everyday services with skilled local workers who want flexible opportunities.</p></div>
    <div className="values-grid">
      <div><HeartHandshake/><h3>Community first</h3><p>We create opportunities for local skills and local needs to meet.</p></div>
      <div><ShieldCheck/><h3>Trust matters</h3><p>Ratings, profiles and transparent service information help customers choose confidently.</p></div>
      <div><UsersRound/><h3>Inclusive work</h3><p>Anyone with a useful skill can build a reputation and find meaningful work.</p></div>
      <div><Sparkles/><h3>Better everyday life</h3><p>Simple access to reliable services saves time and strengthens neighborhoods.</p></div>
    </div>
  </section>;
}
