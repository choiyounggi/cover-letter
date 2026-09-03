import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { Field } from "../Field";
import { TextInput } from "../inputs";
import { SubmitButton } from "../SubmitButton";
import { FormMessage } from "../FormMessage";

describe("Field", () => {
  it("wires label, aria-invalid and aria-describedby when there is an error (normal)", () => {
    render(
      <Field label="이름" name="name" error={["필수"]}>
        {(props) => <input {...props} />}
      </Field>,
    );
    const input = screen.getByLabelText("이름");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby");
    const describedBy = input.getAttribute("aria-describedby")!;
    expect(document.getElementById(describedBy)).toHaveTextContent("필수");
  });

  it("omits aria-invalid when there is no error (boundary)", () => {
    render(
      <Field label="이름" name="name">
        {(props) => <input {...props} />}
      </Field>,
    );
    const input = screen.getByLabelText("이름");
    expect(input).not.toHaveAttribute("aria-invalid");
  });
});

describe("TextInput", () => {
  it("forwards props to the native input (normal)", () => {
    render(<TextInput name="name" placeholder="이름 입력" />);
    expect(screen.getByPlaceholderText("이름 입력")).toBeInTheDocument();
  });
});

vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom")>();
  return { ...actual, useFormStatus: () => ({ pending: true, data: null, method: null, action: null }) };
});

describe("SubmitButton", () => {
  it("disables and shows pendingText while pending (normal)", () => {
    render(<SubmitButton pendingText="저장 중...">저장</SubmitButton>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("저장 중...");
  });
});

describe("FormMessage", () => {
  it("renders role=status text for an ok state (normal)", () => {
    render(<FormMessage state={{ status: "ok", message: "저장했어요" }} />);
    expect(screen.getByRole("status")).toHaveTextContent("저장했어요");
  });

  it("renders nothing for an idle state (boundary)", () => {
    const { container } = render(<FormMessage state={{ status: "idle" }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
