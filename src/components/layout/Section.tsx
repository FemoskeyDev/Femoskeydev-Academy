import type { HTMLAttributes, ReactNode } from 'react'
export function Section({ children, className = '', ...props }: HTMLAttributes<HTMLElement> & { children: ReactNode }) { return <section className={`section ${className}`} {...props}>{children}</section> }
