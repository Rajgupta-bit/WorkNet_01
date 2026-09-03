import React from "react";
import { CalendarCheck, CheckCircle2, Search, ShieldCheck, UserRound } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    ["1", Search, "Search", "Choose a service and tell us what you need."],
    ["2", UserRound, "Choose a worker", "Compare ratings, experience and distance."],
    ["3", CalendarCheck, "Book", "Select a convenient time and confirm."],
    ["4", CheckCircle2, "Get it done", "Your provider completes the job and you rate the experience."]
  ];

  return <section className="page-section">
    <div className="page-title centered"><span className="eyebrow">SIMPLE & TRANSPARENT</span><h1>How it works</h1><p>Getting reliable help should never be complicated.</p></div>
    <div className="steps-grid">
      {steps.map(([n,Icon,title,text]) => <article className="step-card" key={n}><span className="step-number">{n}</span><div className="step-icon"><Icon/></div><h3>{title}</h3><p>{text}</p></article>)}
    </div>
    <div className="safety-banner"><ShieldCheck size={38}/><div><h3>Built around trust</h3><p>Provider profiles, ratings, transparent pricing and secure booking help create a safer community marketplace.</p></div></div>
  </section>;
}
