'use client';

interface AppTemplateProps {
  children: React.ReactNode;
}

/**
 * Wraps route content with a lightweight mount animation so page changes feel less abrupt.
 */
export default function AppTemplate({ children }: AppTemplateProps): JSX.Element {
  return <div className="page-transition-enter">{children}</div>;
}
