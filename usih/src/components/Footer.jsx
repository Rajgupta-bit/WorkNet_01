import React from "react";
import { Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";

export default function Footer({ onNavigate }) {
  const whatsapp = "https://wa.me/919335468985?text=Hello%20Cooperative%20Gig%20Services%2C%20I%20need%20help%20with%20a%20service.";

  return <footer className="footer">
    <div className="footer-main">
      <div><div className="footer-brand">🌱 Cooperative Gig Services</div><p>Stronger Together, Better Community.</p><div className="footer-trust"><ShieldCheck size={17}/> Built for trusted local work.</div></div>
      <div><h4>Explore</h4><button onClick={() => onNavigate("services")}>Services</button><button onClick={() => onNavigate("how")}>How It Works</button><button onClick={() => onNavigate("community")}>Community</button></div>
      <div><h4>For workers</h4><button onClick={() => onNavigate("provider")}>Become a Provider</button><button onClick={() => onNavigate("about")}>About Us</button></div>
      <div><h4>Contact us</h4><a href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={17}/> WhatsApp</a><a href="tel:+919335468985"><Phone size={17}/> +91 93354 68985</a><a href="mailto:hello@cooperativegig.example"><Mail size={17}/> Email us</a></div>
    </div>
    <div className="footer-bottom">© 2026 Cooperative Gig Services · Community-powered marketplace</div>
  </footer>;
}
