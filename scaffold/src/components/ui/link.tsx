import { Button } from "./button";
import { cn } from "@/lib/utils";

type BaseButtonProps = Parameters<typeof Button>[0];
type ButtonProps = Omit<BaseButtonProps, "asChild">; // it wouldn't make sense to pass asChild to Link

interface ButtonLinkProps extends ButtonProps {
	href: string;
	children: React.ReactNode;
}

export default function ButtonLink({ href, children, className, ...props }: ButtonLinkProps) {
	return (
		<Button
			asChild
			className={cn("bg-gradient-cta text-brand-accent-foreground", className)}
			{...props}
		>
			<a href={href}>{children}</a>
		</Button>
	);
}
