import { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
};

const SIZE_STYLES: Record<NonNullable<ContainerProps["size"]>, string> = {
  default: "max-w-7xl",
  wide: "max-w-[90rem]",
  narrow: "max-w-5xl",
};

export default function Container({
  children,
  className = "",
  size = "default",
}: ContainerProps) {
  return (
    <div className={`mx-auto w-full ${SIZE_STYLES[size]} px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}