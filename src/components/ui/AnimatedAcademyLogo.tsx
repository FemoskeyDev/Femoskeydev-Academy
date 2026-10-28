import { useId, type CSSProperties } from 'react'
import styles from './AnimatedAcademyLogo.module.css'

const backgroundPath = 'M102.677 19H35.3226C26.3226 19 19 26.3226 19 35.3226V119H41.9677L96.5832 119.032L96.6129 119.032H119V35.3226C119 26.2903 111.677 19 102.677 19Z'
const starPath = 'M69.0001 35.9668C69.0001 53.8761 54.7539 68.4644 36.978 69.0152C54.7539 69.566 69.0001 84.1543 69.0001 102.064C69.0001 84.1543 83.2463 69.566 101.022 69.0152C83.2463 68.4644 69.0001 53.8761 69.0001 35.9668Z'
const joiningPath = 'M100.783 69.0039C101.208 69.0201 101.635 69.0312 102.064 69.0312C91.8065 69.0313 82.6778 73.7088 76.6133 81.0635C73.5166 84.8053 71.9679 89.5472 71.9678 94.3857C71.9678 107.568 82.3131 118.33 95.3291 118.998C77.9867 118.99 46.1227 118.981 42.3242 118.996C55.45 118.805 66.0322 108.106 66.0322 94.9346C66.0322 89.7411 64.4192 84.5478 61.0322 80.6123C54.9677 73.5155 45.9678 69.0313 35.9355 69.0312C36.3643 69.0312 36.791 69.0201 37.2158 69.0039C37.1366 69.0069 37.0569 69.0122 36.9775 69.0146C54.7534 69.5654 69 84.1532 69 102.062C69 84.1532 83.2466 69.5654 101.022 69.0146C100.943 69.0122 100.863 69.0069 100.783 69.0039Z'

type AnimatedAcademyLogoProps = {
  size?: number | string
  className?: string
  onIntroComplete?: () => void
  reducedMotion?: boolean
}

export function AnimatedAcademyLogo({ size = 'clamp(150px, 32vw, 280px)', className, onIntroComplete, reducedMotion = false }: AnimatedAcademyLogoProps) {
  const clipId = `academy-logo-clip-${useId().replace(/:/g, '')}`
  const style = { width: size, height: size } as CSSProperties

  return (
    <svg
      className={`${styles.logo} ${reducedMotion ? styles.reducedMotion : ''} ${className ?? ''}`}
      style={style}
      viewBox="0 0 138 138"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Femoskeydev Academy"
      onAnimationEnd={event => {
        if (event.target === event.currentTarget.querySelector(`.${styles.joining}`)) onIntroComplete?.()
      }}
    >
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <path d={backgroundPath}/>
        </clipPath>
      </defs>
      <path className={styles.background} d={backgroundPath} fill="#C8FDCE"/>
      <g clipPath={`url(#${clipId})`} fill="#000000">
        <path className={styles.star} d={starPath}/>
        <path className={styles.joining} d={joiningPath}/>
      </g>
    </svg>
  )
}
