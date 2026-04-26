import type { ReactNode } from "react";

export function ProviderLayout(props: {
  title?: string;
  subtitle?: string;
  rightContent?: ReactNode;
  children?: ReactNode;
}): ReactNode;
