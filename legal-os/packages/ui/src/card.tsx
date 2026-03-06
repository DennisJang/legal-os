import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  pad?:   "none" | "sm" | "md" | "lg";
  dark?:  boolean;
  press?: boolean;
  glass?: boolean;
}

const PAD = { none: "0", sm: "16px", md: "20px", lg: "24px" };

const pressHandlers = {
  onMouseDown:  (e: React.MouseEvent<HTMLDivElement>)  => { e.currentTarget.style.transform = "scale(0.97)"; e.currentTarget.style.opacity = "0.85"; },
  onMouseUp:    (e: React.MouseEvent<HTMLDivElement>)  => { e.currentTarget.style.transform = ""; e.currentTarget.style.opacity = ""; },
  onMouseLeave: (e: React.MouseEvent<HTMLDivElement>)  => { e.currentTarget.style.transform = ""; e.currentTarget.style.opacity = ""; },
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>)  => { e.currentTarget.style.transform = "scale(0.97)"; e.currentTarget.style.opacity = "0.85"; },
  onTouchEnd:   (e: React.TouchEvent<HTMLDivElement>)  => { e.currentTarget.style.transform = ""; e.currentTarget.style.opacity = ""; },
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ pad = "none", dark = false, press = false, glass = false, children, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        borderRadius: "18px", overflow: "hidden",
        background: dark ? "#000" : glass ? "rgba(255,255,255,0.72)" : "#FFFFFF",
        backdropFilter:       glass ? "blur(20px) saturate(180%)" : undefined,
        WebkitBackdropFilter: glass ? "blur(20px) saturate(180%)" : undefined,
        padding: PAD[pad],
        transition: press ? "transform 100ms linear, opacity 100ms linear" : undefined,
        ...style,
      }}
      {...(press ? pressHandlers : {})}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";

export const CardHeader = ({ children, style, ...p }: HTMLAttributes<HTMLDivElement>) =>
  <div style={{ padding: "16px 20px 0", ...style }} {...p}>{children}</div>;

export const CardBody = ({ children, style, ...p }: HTMLAttributes<HTMLDivElement>) =>
  <div style={{ padding: "16px 20px", ...style }} {...p}>{children}</div>;

export const CardFooter = ({ children, style, ...p }: HTMLAttributes<HTMLDivElement>) =>
  <div style={{ padding: "0 20px 20px", ...style }} {...p}>{children}</div>;

export default Card;