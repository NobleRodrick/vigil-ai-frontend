import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VerdictStamp, VerdictPill } from "@/components/ui/VerdictStamp";
import { LanguageProvider } from "@/context/LanguageContext";

function renderWithLang(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe("VerdictStamp", () => {
  it("renders a placeholder when no classification is available", () => {
    renderWithLang(<VerdictStamp classification={null} score={null} />);
    expect(screen.getByText("…")).toBeInTheDocument();
  });

  it("renders the risk score and French classification label by default", () => {
    renderWithLang(<VerdictStamp classification="malicious" score={87} />);
    expect(screen.getByText("87")).toBeInTheDocument();
    expect(screen.getByText("Malveillant")).toBeInTheDocument();
  });

  it("applies the safe stamp styling for a safe classification", () => {
    renderWithLang(<VerdictStamp classification="safe" score={12} />);
    const stamp = screen.getByRole("img", { name: /Sûr: 12\/100/ });
    expect(stamp).toHaveClass("stamp-safe");
  });

  it("applies the suspicious stamp styling for a suspicious classification", () => {
    renderWithLang(<VerdictStamp classification="suspicious" score={50} />);
    const stamp = screen.getByRole("img", { name: /Suspect: 50\/100/ });
    expect(stamp).toHaveClass("stamp-suspicious");
  });
});

describe("VerdictPill", () => {
  it("renders an em-dash when classification is null", () => {
    renderWithLang(<VerdictPill classification={null} score={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders score and classification together", () => {
    renderWithLang(<VerdictPill classification="malicious" score={91} />);
    expect(screen.getByText("91")).toBeInTheDocument();
    expect(screen.getByText("Malveillant")).toBeInTheDocument();
  });
});
