export function Eyebrow({ children, light = false }: { children: string; light?: boolean }) { return <div className={`eyebrow${light ? ' eyebrow-light' : ''}`}>{children}</div> }
