import type { FrameShape } from "@/lib/catalog";

/** Осветление цвета к белому — для верхнего стопа градиента линзы. */
function lighten(hex: string, amount: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/**
 * Иллюстрация оправы. Форма, цвет оправы и цвет линзы приходят из модели товара,
 * поэтому один компонент обслуживает и карточку, и галерею PDP, и пиктограммы фильтров.
 */

function Lens({ shape }: { shape: FrameShape }) {
  switch (shape) {
    case "round":
      return <circle cx={50} cy={45} r={31} />;
    case "oval":
      return <ellipse cx={50} cy={45} rx={34} ry={23} />;
    case "rectangle":
      return <rect x={16} y={30} width={68} height={30} rx={2} />;
    case "oversize":
      return <rect x={12} y={18} width={74} height={55} rx={18} />;
    case "wayfarer":
      return (
        <path d="M12 27C12 22 15 20 20 20L82 23C87 23 89 26 88 31L82 55C80 66 73 71 63 71L39 71C27 71 21 65 19 54L13 32C12 30 12 28 12 27Z" />
      );
    case "aviator":
      return (
        <path d="M15 28C15 22 19 19 25 19L79 20C86 20 90 24 89 31C87 45 82 57 73 65C66 71 58 74 50 74C41 74 33 70 27 62C21 54 17 43 15 33C15 31 15 29 15 28Z" />
      );
    case "cat-eye":
      return (
        <path d="M7 21C22 19 44 21 83 27C88 28 90 31 89 36L85 52C83 64 75 70 63 70L39 70C24 70 16 62 13 47L8 27C7 24 7 22 7 21Z" />
      );
    case "sport":
      return (
        <path d="M9 25C9 21 12 18 17 18L84 24C89 24 91 27 90 32L87 50C85 59 79 64 70 64L41 71C26 74 15 66 12 50L9 29Z" />
      );
  }
}

export function Glasses({
  shape,
  frameHex,
  lensHex,
  className,
  strokeWidth = 5,
}: {
  shape: FrameShape;
  frameHex: string;
  lensHex: string;
  className?: string;
  strokeWidth?: number;
}) {
  const gid = `${shape}-${frameHex}-${lensHex}`.replace(/[^a-z0-9-]/gi, "");
  return (
    <svg
      viewBox="0 0 200 92"
      className={className}
      role="presentation"
      aria-hidden="true"
      fill="none"
    >
      <defs>
        {/* Градиент непрозрачен: через полупрозрачную линзу просвечивали концы дужки */}
        <linearGradient id={`lens-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lensHex} />
          <stop offset="100%" stopColor={lighten(lensHex, 0.32)} />
        </linearGradient>
      </defs>
      <g
        stroke={frameHex}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* заушники: пологие — задранные вверх читались как «стрелка» кошачьего глаза */}
        <path d="M13 30 L1 27" />
        <path d="M187 30 L199 27" />
        {/* переносица */}
        <path d="M84 33q16-8 32 0" />
        {/* линзы */}
        <g fill={`url(#lens-${gid})`}>
          <Lens shape={shape} />
          <g transform="translate(200,0) scale(-1,1)">
            <Lens shape={shape} />
          </g>
        </g>
      </g>
    </svg>
  );
}

/** Монохромная пиктограмма формы — для фильтров и меню. */
export function ShapeIcon({ shape, className }: { shape: FrameShape; className?: string }) {
  return (
    <svg viewBox="0 0 200 92" className={className} aria-hidden="true" fill="none">
      <g stroke="currentColor" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 30 L1 27" />
        <path d="M187 30 L199 27" />
        <path d="M84 33q16-8 32 0" />
        <Lens shape={shape} />
        <g transform="translate(200,0) scale(-1,1)">
          <Lens shape={shape} />
        </g>
      </g>
    </svg>
  );
}
