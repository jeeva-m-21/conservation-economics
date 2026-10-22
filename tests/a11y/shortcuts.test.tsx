import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizTimer } from "@/components/quiz/QuizTimer";
import { Modal } from "@/components/ui/Modal";
import { QuizQuestion } from "@/lib/engine/quiz";

describe("Accessibility & Keyboard Shortcuts (WCAG AA)", () => {
  const mockQuestion: QuizQuestion = {
    id: "w01-q001",
    question: "The regular, seasonal movement of animals is called",
    options: ["translocation", "migration", "dispersal", "drifting"],
    originalOptionIndices: [0, 1, 2, 3],
    answer: [1],
    userSelected: [],
    flagged: false,
    timeSpentMs: 0,
    topic: "Ecology",
  };

  it("renders radiogroup and radio items with proper aria-checked", () => {
    const onSelect = vi.fn();
    const onFlag = vi.fn();

    render(
      <QuestionCard
        question={mockQuestion}
        currentIndex={0}
        totalQuestions={10}
        onSelectOption={onSelect}
        onToggleFlag={onFlag}
      />
    );

    const radiogroup = screen.getByRole("radiogroup", { name: /question options/i });
    expect(radiogroup).toBeDefined();

    const radios = screen.getAllByRole("radio");
    expect(radios.length).toBe(4);
    expect(radios[0].getAttribute("aria-checked")).toBe("false");
  });

  it("triggers option selection on number key press (1-4)", () => {
    const onSelect = vi.fn();
    const onFlag = vi.fn();

    render(
      <QuestionCard
        question={mockQuestion}
        currentIndex={0}
        totalQuestions={10}
        onSelectOption={onSelect}
        onToggleFlag={onFlag}
      />
    );

    fireEvent.keyDown(window, { key: "2" });
    expect(onSelect).toHaveBeenCalledWith(1); // 2nd option index is 1

    fireEvent.keyDown(window, { key: "4" });
    expect(onSelect).toHaveBeenCalledWith(3); // 4th option index is 3
  });

  it("triggers flag toggle on 'f' key press", () => {
    const onSelect = vi.fn();
    const onFlag = vi.fn();

    render(
      <QuestionCard
        question={mockQuestion}
        currentIndex={0}
        totalQuestions={10}
        onSelectOption={onSelect}
        onToggleFlag={onFlag}
      />
    );

    fireEvent.keyDown(window, { key: "f" });
    expect(onFlag).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: "F" });
    expect(onFlag).toHaveBeenCalledTimes(2);
  });

  it("triggers bookmark toggle on 'b' key press", () => {
    const onSelect = vi.fn();
    const onFlag = vi.fn();
    const onBookmark = vi.fn();

    render(
      <QuestionCard
        question={mockQuestion}
        currentIndex={0}
        totalQuestions={10}
        onSelectOption={onSelect}
        onToggleFlag={onFlag}
        onToggleBookmark={onBookmark}
      />
    );

    fireEvent.keyDown(window, { key: "b" });
    expect(onBookmark).toHaveBeenCalledTimes(1);
  });

  it("renders QuizTimer with role='timer' and accessible label", () => {
    const futureTime = Date.now() + 600000; // 10 minutes
    render(<QuizTimer targetEndAt={futureTime} />);

    const timer = screen.getByRole("timer");
    expect(timer).toBeDefined();
    expect(timer.getAttribute("aria-label")).toMatch(/time remaining/i);
  });

  it("renders centered accessible Modal and closes on Escape", () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <Modal isOpen={true} onClose={onClose} title="Navigation Guide">
        <p>Shortcuts content</p>
      </Modal>
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-modal")).toBe("true");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
    unmount();
  });
});
