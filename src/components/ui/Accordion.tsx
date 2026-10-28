import { useState } from 'react'
export function Accordion({ items }: { items: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<number | null>(null)
  return <div className="faq-list">{items.map((item, i) => <div className="faq-item" key={item.question}>
    <h3><button className="accordion-trigger" aria-expanded={open === i} aria-controls={`faq-${i}`} onClick={() => setOpen(open === i ? null : i)}><span>{String(i + 1).padStart(2, '0')}</span><b>{item.question}</b><i aria-hidden="true">{open === i ? '−' : '+'}</i></button></h3>
    {open === i && <p id={`faq-${i}`}>{item.answer}</p>}
  </div>)}</div>
}
