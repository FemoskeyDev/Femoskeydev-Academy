import { ChatBubbleIcon, FileTextIcon, Pencil2Icon } from '@radix-ui/react-icons'

/** The three steps of "How we work", shared by the stacking-card and expanding-panel layouts. */
export const processSteps = [
  {
    id: 'brief', label: 'Brief', Icon: ChatBubbleIcon, number: '01', background: '#ffd5bf',
    title: 'First things first, let’s get to know your idea.',
    line: 'We meet you and the team, then gather everything we need to understand your vision and goals.',
    art: '/images/process/brief.svg', alt: 'Chat bubbles beside a project questionnaire clipboard',
  },
  {
    id: 'proposal', label: 'Proposal', Icon: FileTextIcon, number: '02', background: '#fffacf',
    title: 'Let’s put a plan together.',
    line: 'Scope, budget, timeline and deliverables, in one clear proposal.',
    art: '/images/process/proposal.svg', alt: 'A project timeline, a budget chart and a deliverables checklist',
  },
  {
    id: 'contract', label: 'Contract', Icon: Pencil2Icon, number: '03', background: '#ffcff7',
    title: 'Let’s make it official!',
    line: 'We agree the terms, sort the paperwork and kick off your project.',
    art: '/images/process/contract.svg', alt: 'A signed contract, an invoice and a kickoff date on a calendar',
  },
]
