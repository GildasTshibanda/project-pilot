
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  FolderKanban,
  LockKeyhole,
  Mail,
  Moon,
  Sun,
} from "lucide-react";

export default function LoginPage() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("projectpilot-theme") === "dark";
  });
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);

    const theme = next ? "dark" : "light";
    localStorage.setItem("projectpilot-theme", theme);
    document.documentElement.dataset.theme = theme;
    window.dispatchEvent(new Event("projectpilot-theme-change"));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // L'API NestJS sera connectée dans la prochaine étape.
    setMessage(
      "L'interface fonctionne. La connexion sera activée après l'intégration de l'API."
    );
  }

  return (
    <main className="auth-page">
      <header className="auth-topbar">
        <Link href="/" className="auth-brand">
          <span className="auth-brand-mark">
            <FolderKanban size={19} />
          </span>
          <span>
            Project<span className="auth-brand-light">Pilot</span>
          </span>
        </Link>

        <button
          type="button"
          className="auth-theme-toggle"
          onClick={toggleTheme}
          aria-label="Changer de thème"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <section className="auth-layout">
        <div className="auth-intro">
          <span className="auth-kicker">VOTRE ESPACE DE TRAVAIL</span>
          <h1>Les bonnes idées méritent d’avancer.</h1>
          <p>
            Retrouvez vos projets, clarifiez vos priorités et avancez
            à votre rythme, une étape après l’autre.
          </p>

          <div className="auth-note">
            <LockKeyhole size={18} />
            <div>
              <strong>Votre espace, vos projets</strong>
              <p>Un environnement conçu pour rester concentré.</p>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-heading">
            <h2>Bon retour parmi nous</h2>
            <p>Connectez-vous à votre compte ProjectPilot.</p>
          </div>

          <button
            type="button"
            className="auth-google-button"
            onClick={() =>
              setMessage("La connexion Google sera intégrée ultérieurement.")
            }
          >
            Continuer avec Google
            <span className="auth-coming-soon">Bientôt</span>
          </button>

          <div className="auth-divider">
            <span />
            <small>ou avec votre email</small>
            <span />
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Adresse email</span>
              <span className="auth-input-wrap">
                <Mail size={17} />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </span>
            </label>

            <label className="auth-field">
              <span className="auth-label-row">
                <span>Mot de passe</span>
                <Link href="/forgot-password" className="auth-text-link">
                  Mot de passe oublié ?
                </Link>
              </span>

              <span className="auth-input-wrap">
                <LockKeyhole size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            <label className="auth-remember">
              <input type="checkbox" name="remember" />
              <span>Garder ma session ouverte</span>
            </label>

            <button className="auth-submit-button" type="submit">
              Se connecter
            </button>

            {message && (
              <p className="auth-feedback" role="status">
                {message}
              </p>
            )}
          </form>

          <p className="auth-signup-prompt">
            Vous n’avez pas encore de compte ?{" "}
            <Link href="/register" className="auth-text-link">
              Créer un compte
            </Link>
          </p>
        </div>
      </section>

      <footer className="auth-footer">
        <span>ProjectPilot</span>
        <span>Un espace clair pour faire avancer vos idées.</span>
      </footer>
    </main>
  );
}
