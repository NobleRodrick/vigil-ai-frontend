import { describe, it, expect } from "vitest";
import axios, { AxiosError } from "axios";
import { getErrorMessage } from "@/lib/api";

describe("getErrorMessage", () => {
  it("extracts the detail field from an Axios error response", () => {
    const error = new AxiosError("Request failed");
    error.response = {
      data: { detail: "Invalid email or password", code: "INVALID_CREDENTIALS" },
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      // @ts-expect-error -- minimal mock, config not needed for this assertion
      config: {},
    };
    expect(getErrorMessage(error)).toBe("Invalid email or password");
  });

  it("falls back to the Axios error message when there is no detail field", () => {
    const error = new AxiosError("Network Error");
    expect(getErrorMessage(error)).toBe("Network Error");
  });

  it("falls back to a generic Error's message", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("uses the provided fallback for unknown error shapes", () => {
    expect(getErrorMessage("not an error", "Default message")).toBe("Default message");
  });

  it("recognizes axios errors via axios.isAxiosError", () => {
    const error = new AxiosError("oops");
    expect(axios.isAxiosError(error)).toBe(true);
  });
});
