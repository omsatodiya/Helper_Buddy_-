"use client";
import { useEffect, useRef, FC , useState} from "react";
import { gsap } from "gsap";

interface GridMotionProps {
  items?: string[];
  gradientColor?: string;
}

const GridMotion: FC<GridMotionProps> = ({
  items = [],
  gradientColor = "black",
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const mouseXRef = useRef<number>(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);

  // Responsive grid configuration
  const getGridConfig = () => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024; // Default to desktop
    if (width < 640) { // Mobile
      return {
        rows: 7,
        columns: 2,
        totalItems: 14
      };
    } else if (width < 1024) { // Tablet
      return {
        rows: 5,
        columns: 3,
        totalItems: 15
      };
    } else { // Desktop
      return {
        rows: 4,
        columns: 7,
        totalItems: 28
      };
    }
  };

  const [gridConfig, setGridConfig] = useState(getGridConfig());

  // Update grid configuration on window resize
  useEffect(() => {
    const handleResize = () => {
      setGridConfig(getGridConfig());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate default items based on current grid configuration
  const defaultItems = Array.from(
    { length: gridConfig.totalItems },
    (_, index) => `Item ${index + 1}`
  );
  
  const combinedItems =
    items.length > 0 ? items.slice(0, gridConfig.totalItems) : defaultItems;

  useEffect(() => {
    gsap.ticker.lagSmoothing(0);

    const handleMouseMove = (e: MouseEvent): void => {
      mouseXRef.current = e.clientX;
    };

    const updateMotion = (): void => {
      const maxMoveAmount = window.innerWidth < 640 ? 100 : 300; // Reduced movement for mobile
      const baseDuration = 0.8;
      const inertiaFactors = Array(gridConfig.rows).fill(0).map((_, i) => 
        0.6 - (i * 0.1)
      );

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1;
          const moveAmount =
            ((mouseXRef.current / window.innerWidth) * maxMoveAmount -
              maxMoveAmount / 2) *
            direction;

          gsap.to(row, {
            x: moveAmount,
            duration:
              baseDuration + inertiaFactors[index % inertiaFactors.length],
            ease: "power3.out",
            overwrite: "auto",
          });
        }
      });
    };

    const removeAnimationLoop = gsap.ticker.add(updateMotion);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      removeAnimationLoop();
    };
  }, [gridConfig.rows]);

  return (
    <div ref={gridRef} className="h-full w-full overflow-hidden">
      <section
        className="w-full h-screen overflow-hidden relative flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`,
        }}
      >
        <div className="gap-4 flex-none relative w-[150vw] h-[150vh] grid grid-cols-1 rotate-[-15deg] origin-center z-[2]"
             style={{
               gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`
             }}>
          {Array.from({ length: gridConfig.rows }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-4"
              style={{ 
                gridTemplateColumns: `repeat(${gridConfig.columns}, 1fr)`,
                willChange: "transform, filter"
              }}
              ref={(el) => {
                rowRefs.current[rowIndex] = el;
              }}
            >
              {Array.from({ length: gridConfig.columns }, (_, itemIndex) => {
                const content = combinedItems[rowIndex * gridConfig.columns + itemIndex];
                return (
                  <div key={itemIndex} className="relative">
                    <div className="relative w-full overflow-hidden rounded-[10px] bg-[#111] flex items-center justify-center text-white text-[1.5rem] aspect-square">
                      {typeof content === "string" &&
                      content.startsWith("http") ? (
                        <div
                          className="w-full h-full bg-cover bg-center absolute top-0 left-0"
                          style={{ backgroundImage: `url(${content})` }}
                        ></div>
                      ) : (
                        <div className="p-4 text-center z-[1]">{content}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default GridMotion;