export type LearningPath = { slug: string; number: string; name: string; focus: string; description: string; mark: string; tone: string }
export const learningPaths: LearningPath[] = [
  { slug: 'interfaces', number: '01', name: 'FDA Interfaces', focus: 'UI/UX & product design', description: 'Understand people, solve product problems, structure experiences, and design intuitive digital interfaces.', mark: '◎', tone: 'blue' },
  { slug: 'pixels', number: '02', name: 'FDA Pixels', focus: 'Graphic design & visual communication', description: 'Explore visual storytelling, layout, typography, composition, and the principles behind compelling graphic design.', mark: '✳', tone: 'lime' },
  { slug: 'codes', number: '03', name: 'FDA Codes', focus: 'Development & coding', description: 'Develop your technical skills and learn how to turn ideas into working digital experiences.', mark: '</>', tone: 'peach' },
  { slug: 'no-code', number: '04', name: 'No-code design', focus: 'Visual building tools', description: 'Create websites and digital experiences with accessible visual-building tools.', mark: '↗', tone: 'lavender' },
]
