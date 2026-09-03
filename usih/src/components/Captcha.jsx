import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

function makeCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const operators = ["+", "-", "×"];
  const op = operators[Math.floor(Math.random() * operators.length)];
  const answer = op === "+" ? a + b : op === "-" ? a - b : a * b;
  return { question: `${a} ${op} ${b} = ?`, answer };
}

export default function Captcha({ onValidChange }) {
  const [captcha, setCaptcha] = useState(makeCaptcha);
  const [answer, setAnswer] = useState("");

  const valid = Number(answer) === captcha.answer;

  useEffect(() => {
    onValidChange(valid);
  }, [valid, onValidChange]);

  const refresh = () => {
    setCaptcha(makeCaptcha());
    setAnswer("");
  };

  return (
    <div className="captcha">
      <div className="captcha-title">Security check</div>
      <div className="captcha-row">
        <span className="captcha-question">{captcha.question}</span>
        <button type="button" onClick={refresh} title="New CAPTCHA"><RefreshCw size={17}/></button>
        <input value={answer} onChange={e => setAnswer(e.target.value.replace(/\D/g, ""))} placeholder="Answer" />
      </div>
      {answer && <small className={valid ? "captcha-ok" : "captcha-error"}>{valid ? "CAPTCHA verified" : "Incorrect CAPTCHA"}</small>}
    </div>
  );
}
