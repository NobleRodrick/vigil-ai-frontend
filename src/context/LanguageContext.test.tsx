import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";

function Probe() {
  const { lang, t, toggleLang } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="title">{t.dashboard.title}</span>
      <button onClick={toggleLang}>toggle</button>
    </div>
  );
}

describe("LanguageContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to French", () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>
    );
    expect(screen.getByTestId("lang")).toHaveTextContent("fr");
    expect(screen.getByTestId("title")).toHaveTextContent("Tableau de bord");
  });

  it("toggles to English and updates translated strings", async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>
    );
    await user.click(screen.getByText("toggle"));
    expect(screen.getByTestId("lang")).toHaveTextContent("en");
    expect(screen.getByTestId("title")).toHaveTextContent("Dashboard");
  });

  it("persists the chosen language to localStorage", async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>
    );
    await user.click(screen.getByText("toggle"));
    expect(localStorage.getItem("vigilai_lang")).toBe("en");
  });
});
