import { useState, useEffect } from "react";

const sectionIds = ["off-cycle", "batch", "24-hours"];

const DynamicScrollbar = () => {
  const [activeSection, setActiveSection] = useState(sectionIds[0]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      let currentSection = "";

      for (let i = 0; i < sectionIds.length; i++) {
        const section = document.getElementById(sectionIds[i]);
        if (section && section.offsetTop <= scrollPosition) {
          currentSection = sectionIds[i];
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed top-1/2 right-0 -translate-y-1/2 p-2 z-50">
      <div className="bg-gray-200 rounded-full flex flex-col items-center p-1 space-y-2">
        {sectionIds.map((id) => (
          <button
            key={id}
            onClick={() => handleClick(id)}
            className={`w-6 h-6 rounded-full transition-colors duration-300 ease-in-out ${
              activeSection === id ? "bg-blue-600" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default DynamicScrollbar;
