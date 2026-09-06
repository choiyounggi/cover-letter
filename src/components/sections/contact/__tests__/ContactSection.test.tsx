import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ContactSection } from "@/components/sections/contact/ContactSection";
import { submitContact } from "@/app/actions/contact";

vi.mock("@/components/motion", () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Magnetic: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/app/actions/contact", () => ({
  submitContact: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ContactSection", () => {
  it("renders the section heading with the contact-heading id and 연락하기 title (normal)", () => {
    render(<ContactSection />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveAttribute("id", "contact-heading");
    expect(heading).toHaveTextContent("연락하기");
    expect(screen.getByText(/contact/i)).toBeInTheDocument();
  });

  it("labels the section via aria-labelledby pointing at the heading (a11y)", () => {
    const { container } = render(<ContactSection />);
    const section = container.querySelector("#contact");
    expect(section).toHaveAttribute("aria-labelledby", "contact-heading");
  });

  it("still renders the three form fields inside the section (boundary)", () => {
    render(<ContactSection />);
    expect(screen.getByLabelText("이름")).toBeInTheDocument();
    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    expect(screen.getByLabelText("내용")).toBeInTheDocument();
    expect(submitContact).not.toHaveBeenCalled();
  });
});
