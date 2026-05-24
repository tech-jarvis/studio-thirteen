import Link from "next/link";

interface LogoProps {
  className?: string;
  textClassName?: string;
  href?: string;
}

export default function Logo({
  className = "",
  textClassName = "text-xl",
  href = "/",
}: LogoProps) {
  return (
    <Link
      href={href}
      className={`font-semibold tracking-[0.15em] uppercase ${textClassName} ${className}`}
    >
      Studio <span className="text-red-600">XIII</span>
    </Link>
  );
}
