export const academyPaths = ['/academy', '/learning-paths', '/mentorship', '/community', '/about']

export function isAcademyPath(pathname: string) {
  return academyPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))
}
