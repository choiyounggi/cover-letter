import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ContactForm } from "@/components/sections/contact/ContactForm";
import { submitContact } from "@/app/actions/contact";

vi.mock("@/components/motion", () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Magnetic: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/app/actions/contact", () => ({
  submitContact: vi.fn(),
}));

const submitContactMock = vi.mocked(submitContact);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ContactForm", () => {
  it("shows the success status and clears the fields when the action resolves ok (normal)", async () => {
    submitContactMock.mockResolvedValue({ status: "ok" });
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText("이름"), { target: { value: "최영기" } });
    fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("내용"), { target: { value: "안녕하세요" } });
    fireEvent.submit(screen.getByLabelText("내용").closest("form")!);

    const status = await screen.findByText("메시지를 보냈어요. 곧 답장드릴게요.");
    expect(status.getAttribute("role")).toBe("status");
    expect((screen.getByLabelText("이름") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("내용") as HTMLTextAreaElement).value).toBe("");
  });

  it("marks the errored field invalid and links the error text via aria-describedby (error)", async () => {
    submitContactMock.mockResolvedValue({
      status: "error",
      fieldErrors: { email: ["올바른 이메일 주소를 입력해 주세요."] },
    });
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText("이름"), { target: { value: "최영기" } });
    fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "not-an-email" } });
    fireEvent.change(screen.getByLabelText("내용"), { target: { value: "안녕하세요" } });
    fireEvent.submit(screen.getByLabelText("내용").closest("form")!);

    await screen.findByText("올바른 이메일 주소를 입력해 주세요.");
    const emailInput = screen.getByLabelText("이메일");
    expect(emailInput.getAttribute("aria-invalid")).toBe("true");
    const describedBy = emailInput.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)?.textContent).toBe("올바른 이메일 주소를 입력해 주세요.");

    // React resets an uncontrolled `<form action>` after every completed action,
    // success or error — the visitor's typed name/content must survive an error.
    expect((screen.getByLabelText("이름") as HTMLInputElement).value).toBe("최영기");
    expect((screen.getByLabelText("내용") as HTMLTextAreaElement).value).toBe("안녕하세요");

    const submittedFormData = submitContactMock.mock.calls[0][1];
    expect(submittedFormData.get("name")).toBe("최영기");
    expect(submittedFormData.get("email")).toBe("not-an-email");
    expect(submittedFormData.get("content")).toBe("안녕하세요");
  });

  it("has real labels for every visible field and hides the honeypot from assistive tech and tab order (boundary/a11y)", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText("이름")).toBeInTheDocument();
    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    expect(screen.getByLabelText("내용")).toBeInTheDocument();
    expect(screen.queryByLabelText("website")).toBeNull();

    // aria-hidden removes it from the a11y tree — only 3 textboxes reachable by role.
    expect(screen.getAllByRole("textbox")).toHaveLength(3);

    const honeypot = document.querySelector('input[name="website"]') as HTMLInputElement;
    expect(honeypot).not.toBeNull();
    expect(honeypot.getAttribute("aria-hidden")).toBe("true");
    expect(honeypot.tabIndex).toBe(-1);
  });
});
