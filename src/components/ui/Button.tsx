import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { classNames } from "../../lib/classNames";
type Props = {
  children: ReactNode;
  variant?: "primary" | "lime" | "outline";
  to?: string;
  href?: string;
  className?: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>;
export function Button({
  children,
  variant = "primary",
  to,
  href,
  className,
  ...props
}: Props) {
  const classes = classNames(
    "button",
    variant === "primary" && "button-dark",
    variant === "lime" && "button-lime",
    variant === "outline" && "button-outline",
    className,
  );
  if (to)
    return (
      <Link className={classes} to={to} {...props}>
        {children}
        <span aria-hidden="true">↗</span>
      </Link>
    );
  if (href)
    return (
      <a className={classes} href={href} {...props}>
        {children}
        <span aria-hidden="true">↗</span>
      </a>
    );
  return (
    <button
      className={classes}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
      <span aria-hidden="true">↗</span>
    </button>
  );
}
