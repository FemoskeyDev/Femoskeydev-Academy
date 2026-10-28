import { useId } from 'react'
import styles from './InteractiveRobotPortrait.module.css'

export function WireframeTreatment() {
  const clipId = useId().replaceAll(':', '')
  return <svg className={styles.wireframe} viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <clipPath id={clipId}>
        <path d="M292 335 C279 260 306 177 366 127 C428 76 572 72 638 119 C699 162 720 248 692 336 C674 395 681 458 660 538 C639 622 588 696 500 741 C412 696 361 622 340 538 C319 458 326 395 292 335Z"/>
      </clipPath>
    </defs>
    <g className={styles.wireShell}>
      <path d="M292 335 C279 260 306 177 366 127 C428 76 572 72 638 119 C699 162 720 248 692 336"/>
      <path d="M303 283 C365 302 432 308 500 306 C568 308 635 302 681 283"/>
    </g>
    <g clipPath={`url(#${clipId})`} className={styles.wireMesh}>
      <path d="M343 214 C410 251 459 269 500 270 C548 267 597 245 658 211"/>
      <path d="M331 258 C395 286 451 296 500 295 C552 296 610 282 670 255"/>
      <path d="M329 310 C380 334 424 346 463 350 M537 350 C577 346 620 334 671 310"/>
      <path d="M330 373 C366 387 395 395 421 398 M579 398 C605 395 634 387 670 373"/>
      <path d="M337 450 C367 461 389 468 408 470 M592 470 C611 468 633 461 663 450"/>
      <path d="M349 526 C378 535 399 541 415 542 M585 542 C601 541 622 535 651 526"/>
      <path d="M371 596 C407 609 443 616 466 617 M534 617 C557 616 593 609 629 596"/>
      <path d="M407 661 C443 679 471 689 500 692 C529 689 557 679 593 661"/>
      <path d="M365 177 C378 273 378 359 376 435 C375 518 395 609 449 682"/>
      <path d="M426 120 C440 224 440 310 435 373 M436 475 C437 558 455 635 483 710"/>
      <path d="M500 94 C500 183 500 263 500 330 M500 524 C500 608 500 677 500 738"/>
      <path d="M574 120 C560 224 560 310 565 373 M564 475 C563 558 545 635 517 710"/>
      <path d="M635 177 C622 273 622 359 624 435 C625 518 605 609 551 682"/>
      <path d="M339 407 C370 414 392 417 415 418 M585 418 C608 417 630 414 661 407"/>
      <path d="M355 486 C385 493 403 496 421 496 M579 496 C597 496 615 493 645 486"/>
      <path d="M382 563 C416 570 440 573 460 573 M540 573 C560 573 584 570 618 563"/>
    </g>
    <g className={styles.wireAccents}>
      <path d="M314 337 C326 382 331 414 335 451"/>
      <path d="M686 337 C674 382 669 414 665 451"/>
      <circle cx="333" cy="452" r="4"/><circle cx="667" cy="452" r="4"/>
      <circle cx="500" cy="307" r="3"/><circle cx="500" cy="692" r="3"/>
    </g>
  </svg>
}
