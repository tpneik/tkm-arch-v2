"use client";
import { useState, useRef, useEffect } from "react";
import { motion, useAnimationFrame, useMotionValue } from "motion/react";
import { useT } from "next-i18next/client";

const serviceImages = [
  "/service1.jpg",
  "/service2.jpg",
  "/service3.jpg",
  "/service4.png",
];

export default function Services() {
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [baseWidth, setBaseWidth] = useState(0);
  const { t } = useT("common");

  const rawItems = t("services.items", { returnObjects: true });
  const serviceItems: string[] = Array.isArray(rawItems) ? rawItems : [];

  const services = serviceItems.map((title, i) => ({
    title,
    image: serviceImages[i % serviceImages.length],
  }));

  // 5x duplication to ensure smooth infinite scroll even with few items
  const duplicatedServices = [...services, ...services, ...services, ...services, ...services];

  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Constant speed in pixels per frame (at 60fps)
  const speed = 0.8;

  useEffect(() => {
    const calculateWidth = () => {
      if (contentRef.current) {
        const width = contentRef.current.scrollWidth / 5;
        setBaseWidth(width);
        // Start at the 2nd set (middle zone)
        x.set(-width * 2);
      }
    };

    calculateWidth();
    window.addEventListener('resize', calculateWidth);
    return () => window.removeEventListener('resize', calculateWidth);
  }, [x]);

  useAnimationFrame((t, delta) => {
    // Don't auto-scroll if paused, dragging, or in the 0.5s resume delay
    if (isPaused || isDragging || isResuming || !baseWidth) return;

    // Normalize speed based on frame delta (assuming 16.67ms for 60fps)
    const moveBy = speed * (delta / 16.67);
    let currentX = x.get() - moveBy;

    // Seamless wrapping: keep within the middle 3 sets
    if (currentX <= -baseWidth * 3) {
      currentX += baseWidth;
    } else if (currentX >= -baseWidth) {
      currentX -= baseWidth;
    }

    x.set(currentX);
  });

  const handleDragStart = () => {
    setIsDragging(true);
    setIsResuming(false);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
  };

  const handleDrag = () => {
    if (!baseWidth) return;
    let currentX = x.get();

    // Real-time wrapping during drag to prevent running out of cards
    if (currentX <= -baseWidth * 3) {
      x.set(currentX + baseWidth);
    } else if (currentX >= -baseWidth) {
      x.set(currentX - baseWidth);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsResuming(true);

    // Post-interaction logic: pause for 0.5s before resuming auto-scroll
    resumeTimeoutRef.current = setTimeout(() => {
      setIsResuming(false);
    }, 500);
  };

  return (
    <section id="services" className="section-padding bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto mb-12">
        <span className="text-brand-blue uppercase tracking-[0.3em] text-xs font-bold mb-4 block">
          {t("services.label")}
        </span>
        <h2 className="text-4xl md:text-5xl font-serif">{t("services.title")}</h2>
      </div>

      <div
        ref={containerRef}
        className="relative cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          ref={contentRef}
          drag="x"
          dragConstraints={containerRef}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          style={{ x, width: "fit-content" }}
          className="flex gap-6"
        >
          {duplicatedServices.map((service, index) => (
            <div
              key={`${service.title}-${index}`}
              className="w-[300px] md:w-[350px] lg:w-[400px] shrink-0 group select-none"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none"
                  referrerPolicy="no-referrer"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-brand-dark/40 group-hover:bg-brand-dark/60 transition-all duration-500"></div>

                {/* Index Number */}
                <div className="absolute top-6 right-6">
                  <span className="text-white/30 font-serif text-5xl group-hover:text-white/50 transition-colors duration-500">
                    {((index % services.length) + 1).toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Content Inside Card */}
                <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end">
                  <div className="w-12 h-[2px] bg-brand-blue mb-4 transform scale-x-100 group-hover:w-24 transition-all duration-500 origin-left"></div>
                  <h3 className="text-xl md:text-2xl text-white font-serif leading-tight transform group-hover:-translate-y-2 transition-transform duration-500">
                    {service.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
