import React, { useEffect, useState } from "react";

interface CustomScrollbarProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  numberOfBoxes?: number;
  dayParts?: string[];
  height?: number;
}

export default function CustomScrollbar({
  scrollContainerRef,
  numberOfBoxes = 5,
  dayParts = ["Breakfast", "Lunch", "Afternoon", "Dinner", "Late Night"],
  height,
}: CustomScrollbarProps) {
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(numberOfBoxes);
  const boxHeight = height ?? 35;

  useEffect(() => {
    setTotalPages(numberOfBoxes);
  }, [numberOfBoxes]);

  const handleScrollToIndex = (index: number) => {
    if (!scrollContainerRef.current || totalPages <= 1) return;
    console.log(index, "index", currentScrollIndex);

    const container = scrollContainerRef.current;
    const dayPartName = dayParts[index];

    // Find the element with the specific day part
    const targetElement = container.querySelector(
      `[data-day-part="${dayPartName}"]`
    ) as HTMLElement;

    console.log(dayPartName, targetElement, "oooooo");

    if (targetElement) {
      // Scroll to the specific day part element
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      // Fallback to percentage-based scrolling
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const maxScrollTop = scrollHeight - clientHeight;
      const scrollPercentage = index / Math.max(totalPages - 1, 1);
      const targetScrollTop = scrollPercentage * maxScrollTop;

      container.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });
    }

    setCurrentScrollIndex(index);
  };

  const handleScrollUp = () => {
    if (currentScrollIndex > 0) {
      handleScrollToIndex(currentScrollIndex - 1);
    }
  };

  const handleScrollDown = () => {
    if (currentScrollIndex < totalPages - 1) {
      handleScrollToIndex(currentScrollIndex + 1);
    }
  };

  // Listen to scroll events to update current index
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const maxScrollTop = scrollHeight - clientHeight;

      if (maxScrollTop > 0) {
        const scrollPercentage = scrollTop / maxScrollTop;
        Math.round(scrollPercentage * (totalPages - 1));
        // setCurrentScrollIndex(Math.min(newIndex, totalPages - 1));
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [scrollContainerRef, totalPages]);

  if (totalPages <= 0) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Up Arrow */}
      <button
        onClick={handleScrollUp}
        disabled={currentScrollIndex === 0}
        className={`w-6 h-6 flex items-center justify-center transition-colors ${
          currentScrollIndex === 0
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-600 hover:text-gray-800 cursor-pointer"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 6l6 12H6z" />
        </svg>
      </button>

      {/* Scroll Boxes */}
      <div className="flex flex-col gap-1">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handleScrollToIndex(index)}
            style={{ height: boxHeight }}
            className={`w-10 rounded-sm border transition-colors ${
              index === currentScrollIndex
                ? "bg-[#1e3778] border-[#1e3778]"
                : "bg-gray-200 border-gray-300 hover:bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Down Arrow */}
      <button
        onClick={handleScrollDown}
        disabled={currentScrollIndex === totalPages - 1}
        className={`w-6 h-6 flex items-center justify-center transition-colors ${
          currentScrollIndex === totalPages - 1
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-600 hover:text-gray-800 cursor-pointer"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 18l-6-12h12z" />
        </svg>
      </button>
    </div>
  );
}
