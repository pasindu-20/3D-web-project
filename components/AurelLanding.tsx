"use client";

import { useEffect, useState } from "react";
import CarScene from "@/components/CarScene";

const experienceCards = [
  {
    number: "01",
    title: "DESIGN",
    text: "A sculpted silhouette engineered to create presence before the engine is even heard.",
  },
  {
    number: "02",
    title: "PERFORMANCE",
    text: "A focused balance of power, response and control designed around the driver.",
  },
  {
    number: "03",
    title: "TECHNOLOGY",
    text: "Intelligent engineering integrated beneath an uncompromising mechanical character.",
  },
];

const specifications = [
  { value: "571", unit: "HP", label: "POWER" },
  { value: "317", unit: "KM/H", label: "TOP SPEED" },
  { value: "3.8", unit: "SEC", label: "0–100 KM/H" },
  { value: "6.2", unit: "L", label: "V8 ENGINE" },
];

export default function AurelLanding() {
  const [activeSection, setActiveSection] = useState("MACHINE");

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-section]");

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveSection(visible.target.getAttribute("data-section") || "MACHINE");
        }
      },
      {
        threshold: [0.25, 0.5, 0.75],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <main className="aurel-page">
      <header className="aurel-nav">
        <button
          className="aurel-logo"
          onClick={() => scrollToSection("machine")}
          aria-label="AUREL home"
        >
          AUREL
        </button>

        <div className="nav-center">
          <span className="nav-index">00</span>
          <span className="nav-line" />
          <span>{activeSection}</span>
        </div>

        <button className="nav-explore" onClick={() => scrollToSection("experience")}>
          EXPLORE
          <span>↓</span>
        </button>
      </header>

      <aside className="section-progress">
        <button
          className={activeSection === "MACHINE" ? "active" : ""}
          onClick={() => scrollToSection("machine")}
        >
          <span>01</span>
          <i />
          <strong>MACHINE</strong>
        </button>

        <button
          className={activeSection === "EXPERIENCE" ? "active" : ""}
          onClick={() => scrollToSection("experience")}
        >
          <span>02</span>
          <i />
          <strong>EXPERIENCE</strong>
        </button>

        <button
          className={activeSection === "PERFORMANCE" ? "active" : ""}
          onClick={() => scrollToSection("performance")}
        >
          <span>03</span>
          <i />
          <strong>PERFORMANCE</strong>
        </button>

        <button
          className={activeSection === "PHILOSOPHY" ? "active" : ""}
          onClick={() => scrollToSection("philosophy")}
        >
          <span>04</span>
          <i />
          <strong>PHILOSOPHY</strong>
        </button>
      </aside>

      <section id="machine" data-section="MACHINE" className="machine-section">
        <div className="machine-scene">
          <CarScene />
        </div>

        <div className="machine-vignette" />

        <div className="machine-content">
          <div className="machine-eyebrow">
            <span className="status-dot" />
            AUREL AUTOMOTIVE / 001
          </div>

          <h1>
            THE
            <br />
            <em>MACHINE.</em>
          </h1>

          <p className="machine-description">
            Where architecture meets velocity.
            <br />
            Designed without compromise.
          </p>

          <div className="machine-meta">
            <div>
              <span>MODEL</span>
              <strong>SLR // AUREL</strong>
            </div>

            <div>
              <span>ENGINE</span>
              <strong>V8 / 6.2L</strong>
            </div>

            <div>
              <span>STATUS</span>
              <strong>READY</strong>
            </div>
          </div>
        </div>

        <div className="machine-bottom">
          <div className="scroll-prompt">
            <span>SCROLL TO EXPLORE</span>
            <div className="scroll-arrow">↓</div>
          </div>

          <div className="machine-hint">
            <span className="hint-circle">↻</span>
            DRAG TO ROTATE
          </div>
        </div>

        <div className="machine-number">01</div>
      </section>

      <section id="experience" data-section="EXPERIENCE" className="experience-section">
        <div className="section-background-number">02</div>

        <div className="experience-inner">
          <div className="section-heading">
            <div className="section-eyebrow">
              <span>02</span>
              THE EXPERIENCE
            </div>

            <h2>
              BUILT TO BE
              <br />
              <em>EXPERIENCED.</em>
            </h2>

            <p>
              Every surface, response and mechanical movement exists for a reason. AUREL is not simply about transportation. It is about creating a machine that demands attention.
            </p>
          </div>

          <div className="experience-grid">
            {experienceCards.map((card) => (
              <article className="experience-card" key={card.number}>
                <div className="card-top">
                  <span>{card.number}</span>
                  <span className="card-arrow">↗</span>
                </div>

                <div className="card-content">
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>

                <div className="card-line" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="performance" data-section="PERFORMANCE" className="performance-section">
        <div className="performance-glow" />

        <div className="performance-inner">
          <div className="performance-header">
            <div className="section-eyebrow">
              <span>03</span>
              PERFORMANCE
            </div>

            <div className="performance-title">
              <span>NUMBERS</span>
              <em>MATTER.</em>
            </div>

            <p>
              Raw mechanical capability, translated into an experience that feels immediate, precise and deliberate.
            </p>
          </div>

          <div className="spec-grid">
            {specifications.map((spec, index) => (
              <article className="spec-item" key={spec.label}>
                <div className="spec-index">0{index + 1}</div>

                <div className="spec-value">
                  <strong>{spec.value}</strong>
                  <span>{spec.unit}</span>
                </div>

                <div className="spec-label">{spec.label}</div>
              </article>
            ))}
          </div>

          <div className="performance-footer">
            <span>ENGINEERED FOR THE MOMENT</span>
            <span>THE ROAD IS THE TEST</span>
          </div>
        </div>
      </section>

      <section id="philosophy" data-section="PHILOSOPHY" className="philosophy-section">
        <div className="philosophy-orbit orbit-one" />
        <div className="philosophy-orbit orbit-two" />

        <div className="philosophy-inner">
          <div className="section-eyebrow">
            <span>04</span>
            AUREL PHILOSOPHY
          </div>

          <div className="philosophy-main">
            <span className="quote-mark">“</span>

            <h2>
              BEAUTY
              <br />
              WITHOUT
              <br />
              <em>PERMISSION.</em>
            </h2>

            <p>
              We believe a machine should have a point of view. It should communicate through proportion, material, sound and movement.
            </p>
          </div>

          <div className="philosophy-bottom">
            <div>
              <span>DESIGN LANGUAGE</span>
              <strong>RAW / PRECISE / TIMELESS</strong>
            </div>

            <div>
              <span>PROJECT</span>
              <strong>AUREL / 001</strong>
            </div>

            <div>
              <span>YEAR</span>
              <strong>2026</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="final-section">
        <div className="final-grid" />

        <div className="final-inner">
          <span className="final-eyebrow">AUREL AUTOMOTIVE</span>

          <h2>
            THE NEXT
            <br />
            <em>MOVE.</em>
          </h2>

          <p>This is only the beginning.</p>

          <button className="final-button" onClick={() => scrollToSection("machine")}>
            RETURN TO MACHINE
            <span>↗</span>
          </button>
        </div>

        <div className="final-footer">
          <span>© 2026 AUREL</span>
          <span>ENGINEERED / DESIGNED / EXPERIENCED</span>
          <span>001 — 001</span>
        </div>
      </section>
    </main>
  );
}
