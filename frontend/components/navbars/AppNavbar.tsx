import { cn } from "@/lib/utils";
import { SignoutButton } from "../buttons/SignoutButton";

export const AppNavbar = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "w-full flex items-center justify-between border-b border",
        className
      )}
    >
      <p className="text-2xl font-krona">Uni</p>

      <SignoutButton />
    </div>
  );
};
