import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SegmentedControl from "../components/SegmentedControl";

describe("SegmentedControl", () => {
  const mockOptions = [
    { key: "conservative", label: "Conservative" },
    { key: "balanced", label: "Balanced" },
    { key: "aggressive", label: "Aggressive" },
  ];

  it("renders all options", () => {
    const mockOnChange = jest.fn();
    render(
      <SegmentedControl
        options={mockOptions}
        value="balanced"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("Conservative")).toBeInTheDocument();
    expect(screen.getByText("Balanced")).toBeInTheDocument();
    expect(screen.getByText("Aggressive")).toBeInTheDocument();
  });

  it("highlights the active option", () => {
    const mockOnChange = jest.fn();
    render(
      <SegmentedControl
        options={mockOptions}
        value="balanced"
        onChange={mockOnChange}
      />
    );

    const balancedButton = screen.getByText("Balanced");
    expect(balancedButton).toHaveClass("bg-orange-500");
  });

  it("calls onChange when option is clicked", () => {
    const mockOnChange = jest.fn();
    render(
      <SegmentedControl
        options={mockOptions}
        value="balanced"
        onChange={mockOnChange}
      />
    );

    const aggressiveButton = screen.getByText("Aggressive");
    fireEvent.click(aggressiveButton);

    expect(mockOnChange).toHaveBeenCalledWith("aggressive");
  });

  it("handles null value", () => {
    const mockOnChange = jest.fn();
    render(
      <SegmentedControl
        options={mockOptions}
        value={null}
        onChange={mockOnChange}
      />
    );

    // No option should have active styling
    mockOptions.forEach((option) => {
      const button = screen.getByText(option.label);
      expect(button).not.toHaveClass("bg-orange-500");
    });
  });
});
