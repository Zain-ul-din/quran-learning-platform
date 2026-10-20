import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const elevatedButtonVariants = cva(
  "button-elevated group/button relative inline-flex shrink-0 items-center justify-center gap-2 rounded-md border px-5 font-semibold whitespace-nowrap touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "border-primary bg-primary text-primary-foreground button-elevation-primary",
        secondary:
          "border-border bg-secondary text-secondary-foreground button-elevation-secondary",
        destructive:
          "border-destructive bg-destructive text-primary-foreground button-elevation-destructive",
        play: "border-play bg-play text-play-foreground button-elevation-play",
      },
      size: {
        default: "h-12 px-5",
        wide: "h-12 min-w-52 px-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ElevatedButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof elevatedButtonVariants>;

type ElevatedButtonVariant = NonNullable<
  VariantProps<typeof elevatedButtonVariants>["variant"]
>;

function ElevatedButton({
  className,
  variant = "primary",
  size = "default",
  ...props
}: ElevatedButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="elevated-button"
      className={cn(elevatedButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export {
  ElevatedButton,
  elevatedButtonVariants,
  type ElevatedButtonProps,
  type ElevatedButtonVariant,
};
