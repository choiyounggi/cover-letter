import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

const domainInput = () => screen.getByLabelText("이메일 도메인") as HTMLInputElement;
const domainSelect = () => screen.getByLabelText("이메일 도메인 선택") as HTMLSelectElement;
const contentInput = () => screen.getByLabelText("내용") as HTMLTextAreaElement;

function fillAndSubmit({ local, preset, domain }: { local: string; preset?: string; domain?: string }) {
  fireEvent.change(screen.getByLabelText("이름"), { target: { value: "최영기" } });
  fireEvent.change(screen.getByLabelText("이메일"), { target: { value: local } });
  if (preset) fireEvent.change(domainSelect(), { target: { value: preset } });
  if (domain !== undefined) fireEvent.change(domainInput(), { target: { value: domain } });
  fireEvent.change(contentInput(), { target: { value: "안녕하세요" } });
  fireEvent.submit(contentInput().closest("form")!);
}

describe("ContactForm", () => {
  it("sends id@template-domain and clears every field on success (normal)", async () => {
    submitContactMock.mockResolvedValue({ status: "ok" });
    render(<ContactForm />);

    fillAndSubmit({ local: "younggi", preset: "gmail.com" });

    const status = await screen.findByText("메시지를 보냈어요. 곧 답장드릴게요.");
    expect(status.getAttribute("role")).toBe("status");
    const submitted = submitContactMock.mock.calls[0][1];
    expect(submitted.get("name")).toBe("최영기");
    expect(submitted.get("email")).toBe("younggi@gmail.com");
    expect(submitted.get("content")).toBe("안녕하세요");
    expect((screen.getByLabelText("이름") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("이메일") as HTMLInputElement).value).toBe("");
    expect(domainInput().value).toBe("");
    expect(domainSelect().value).toBe("");
    expect(contentInput().value).toBe("");
  });

  it("fills a template domain read-only and frees it again for 직접 입력 (normal)", () => {
    render(<ContactForm />);
    expect(domainInput().readOnly).toBe(false);

    fireEvent.change(domainSelect(), { target: { value: "naver.com" } });
    expect(domainInput().value).toBe("naver.com");
    expect(domainInput().readOnly).toBe(true);

    fireEvent.change(domainSelect(), { target: { value: "" } });
    expect(domainInput().value).toBe("");
    expect(domainInput().readOnly).toBe(false);
  });

  it("splits a full address pasted into the id field (boundary)", () => {
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "me@kakao.com" } });
    expect((screen.getByLabelText("이메일") as HTMLInputElement).value).toBe("me");
    expect(domainInput().value).toBe("kakao.com");
    expect(domainSelect().value).toBe("kakao.com");

    fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "me@company.co.kr" } });
    expect(domainInput().value).toBe("company.co.kr");
    expect(domainSelect().value).toBe("");
  });

  it("blocks submit and shows a format error for a malformed custom domain (error)", () => {
    render(<ContactForm />);
    fillAndSubmit({ local: "younggi", domain: "not-a-domain" });

    expect(submitContactMock).not.toHaveBeenCalled();
    const error = screen.getByText("올바른 이메일 형식이 아니에요.");
    const emailInput = screen.getByLabelText("이메일");
    expect(emailInput.getAttribute("aria-invalid")).toBe("true");
    expect(emailInput.getAttribute("aria-describedby")).toBe(error.id);
    // typed input is kept so the visitor only fixes the domain
    expect(contentInput().value).toBe("안녕하세요");
  });

  it("blocks submit when the domain is empty (error/boundary: empty input)", () => {
    render(<ContactForm />);
    fillAndSubmit({ local: "younggi" });

    expect(submitContactMock).not.toHaveBeenCalled();
    expect(screen.getByText("이메일 아이디와 도메인을 모두 입력해 주세요.")).toBeInTheDocument();
  });

  it("keeps typed input and links a server field error via aria-describedby (error)", async () => {
    submitContactMock.mockResolvedValue({
      status: "error",
      fieldErrors: { content: ["내용은 300자 이내로 입력해 주세요."] },
    });
    render(<ContactForm />);
    fillAndSubmit({ local: "younggi", preset: "naver.com" });

    const error = await screen.findByText("내용은 300자 이내로 입력해 주세요.");
    expect(contentInput().getAttribute("aria-invalid")).toBe("true");
    expect(contentInput().getAttribute("aria-describedby")).toContain(error.id);
    await waitFor(() => expect(contentInput().value).toBe("안녕하세요"));
    expect((screen.getByLabelText("이름") as HTMLInputElement).value).toBe("최영기");
    expect(domainInput().value).toBe("naver.com");
  });

  it("caps content at 300 chars and shows the live count (boundary: max length)", () => {
    render(<ContactForm />);
    expect(contentInput().maxLength).toBe(300);
    expect(screen.getByText("0/300")).toBeInTheDocument();

    fireEvent.change(contentInput(), { target: { value: "a".repeat(300) } });
    expect(screen.getByText("300/300")).toBeInTheDocument();

    // a scripted/autofilled value bypasses maxLength — the handler still cuts it to 300
    fireEvent.change(contentInput(), { target: { value: "b".repeat(320) } });
    expect(contentInput().value).toBe("b".repeat(300));
    expect(screen.getByText("300/300")).toBeInTheDocument();
  });

  it("has real labels for every visible field and hides the honeypot from assistive tech and tab order (boundary/a11y)", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText("이름")).toBeInTheDocument();
    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    expect(screen.getByLabelText("내용")).toBeInTheDocument();
    expect(screen.queryByLabelText("website")).toBeNull();

    // aria-hidden removes it from the a11y tree — name, email id, email domain, content.
    expect(screen.getAllByRole("textbox")).toHaveLength(4);
    expect(screen.getByRole("combobox", { name: "이메일 도메인 선택" })).toBeInTheDocument();

    const honeypot = document.querySelector('input[name="website"]') as HTMLInputElement;
    expect(honeypot).not.toBeNull();
    expect(honeypot.getAttribute("aria-hidden")).toBe("true");
    expect(honeypot.tabIndex).toBe(-1);
  });
});
