import { CULTURE_BY_KEY, type Container, type Culture, type Product } from "@/lib/catalog";

/**
 * Параметрическая иллюстрация товара — решение D-13.
 * Рисуется, пока у сорта нет фотографии; картинка собирается из модели товара,
 * поэтому она физически не может разойтись с данными: раздел задаёт форму и цвет ягоды,
 * фасовка — тару, хэш слага — небольшие вариации формы.
 */

function seedOf(slug: string): number {
  let h = 7;
  for (let i = 0; i < slug.length; i++) h = (h * 33 + slug.charCodeAt(i)) % 9973;
  return h;
}

function Pot({ container, hex }: { container: Container; hex: string }) {
  if (container === "cassette") {
    return (
      <g>
        <rect x="34" y="176" width="132" height="40" rx="8" fill="#b98b5e" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={42 + i * 42} y="182" width="34" height="28" rx="6" fill="#8b5e3c" opacity="0.45" />
        ))}
        <rect x="34" y="172" width="132" height="10" rx="5" fill="#6f4a2f" opacity="0.3" />
      </g>
    );
  }
  if (container === "okc") {
    return (
      <g>
        <ellipse cx="100" cy="196" rx="38" ry="24" fill="#7c5334" />
        <ellipse cx="100" cy="192" rx="38" ry="20" fill="#8b5e3c" />
        {[-18, -6, 6, 18].map((dx, i) => (
          <path
            key={i}
            d={`M${100 + dx} 206 q${dx / 2} 14 ${dx} 20`}
            stroke="#c9a227"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />
        ))}
        <ellipse cx="100" cy="176" rx="30" ry="8" fill={hex} opacity="0.12" />
      </g>
    );
  }
  const w = container === "pot1l" ? 84 : 66;
  const x = 100 - w / 2;
  return (
    <g>
      <path d={`M${x} 172 h${w} l-8 46 h-${w - 16} Z`} fill="#c98a5c" />
      <path d={`M${x} 172 h${w} l-3 14 h-${w - 6} Z`} fill="#a96f45" />
      <ellipse cx="100" cy="174" rx={w / 2 - 4} ry="6" fill="#5d4023" opacity="0.55" />
    </g>
  );
}

function Berry({ x, y, r, hex, kind }: { x: number; y: number; r: number; hex: string; kind: Culture }) {
  if (kind.startsWith("strawberry")) {
    // Круглая «щека» сверху и остриё снизу — иначе ягода читается как перец
    return (
      <g>
        <path
          d={`M${x - r} ${y} a${r} ${r} 0 0 1 ${2 * r} 0 q0 ${r * 1.1} -${r} ${r * 1.7} q-${r} -${r * 0.6} -${r} -${r * 1.7} z`}
          fill={hex}
        />
        <path
          d={`M${x - r * 0.85} ${y - r * 0.45} q${r * 0.85} -${r * 0.5} ${r * 1.7} 0 q-${r * 0.85} ${r * 0.35} -${r * 1.7} 0 z`}
          fill="#3f8f4a"
        />
        <path d={`M${x} ${y - r * 0.6} v-${r * 0.5}`} stroke="#3f8f4a" strokeWidth={Math.max(1, r * 0.22)} strokeLinecap="round" />
      </g>
    );
  }
  if (kind.startsWith("raspberry")) {
    return (
      <g fill={hex}>
        {[[0, 0], [-r * 0.7, r * 0.5], [r * 0.7, r * 0.5], [0, r]].map(([dx, dy], i) => (
          <circle key={i} cx={x + dx} cy={y + dy} r={r * 0.6} />
        ))}
      </g>
    );
  }
  if (kind === "blackberry") {
    // Та же костянка, что у малины, но вытянутая: ежевичная ягода длиннее и уже
    return (
      <g fill={hex}>
        {[[0, 0], [-r * 0.6, r * 0.55], [r * 0.6, r * 0.55], [0, r * 1.1], [0, r * 1.65]].map(
          ([dx, dy], i) => (
            <circle key={i} cx={x + dx} cy={y + dy} r={r * 0.55} />
          ),
        )}
      </g>
    );
  }
  if (kind === "blueberry") {
    // Голубика: шарик с «короной» из чашелистиков сверху — по ней её и узнают
    return (
      <g fill={hex}>
        <circle cx={x} cy={y} r={r} />
        <path
          d={`M${x - r * 0.45} ${y - r * 0.75} l${r * 0.45} ${r * 0.3} l${r * 0.45} -${r * 0.3} l-${r * 0.2} ${r * 0.55} h-${r * 0.5} z`}
          fill="#2b3d63"
          opacity="0.7"
        />
      </g>
    );
  }
  return <circle cx={x} cy={y} r={r} fill={hex} />;
}

function Leaf({ x, y, angle, size, hex }: { x: number; y: number; angle: number; size: number; hex: string }) {
  return (
    <path
      d={`M0 0 C ${size * 0.6} -${size * 0.6}, ${size * 1.2} -${size * 0.3}, ${size * 1.5} 0 C ${size * 1.2} ${size * 0.3}, ${size * 0.6} ${size * 0.6}, 0 0 Z`}
      fill={hex}
      transform={`translate(${x} ${y}) rotate(${angle})`}
    />
  );
}

export function PlantArt({
  product,
  className = "",
  decorative = false,
}: {
  product: Product;
  className?: string;
  /** В карточке и плитке подпись дублирует ссылку — иллюстрация должна быть немой для скринридера */
  decorative?: boolean;
}) {
  const meta = CULTURE_BY_KEY.get(product.culture)!;
  const seed = seedOf(product.slug);
  const tilt = (seed % 9) - 4;
  const leaf = meta.leafHex;
  const fruit = meta.fruitHex;

  return (
    <svg
      viewBox="0 0 200 230"
      className={className}
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": `${meta.name} «${product.name}» — иллюстрация` })}
    >
      <g transform={`rotate(${tilt} 100 180)`}>
        <g>
          <path d="M100 176 V96" stroke={leaf} strokeWidth="5" strokeLinecap="round" />
          <path d="M100 140 q-26 -10 -34 -34" stroke={leaf} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M100 128 q26 -12 34 -36" stroke={leaf} strokeWidth="4" fill="none" strokeLinecap="round" />
          <Leaf x={64} y={104} angle={210} size={26} hex={leaf} />
          <Leaf x={136} y={90} angle={-30} size={26} hex={leaf} />
          <Leaf x={100} y={150} angle={200} size={24} hex={leaf} />
          <Leaf x={100} y={158} angle={-20} size={22} hex={leaf} />
          <Leaf x={100} y={96} angle={-90} size={22} hex={leaf} />
          {[
            [76, 132, 9],
            [124, 120, 10],
            [104, 152, 8],
            [88, 112, 7],
          ]
            .slice(0, 2 + (seed % 3))
            .map(([x, y, r], i) => (
              <Berry key={i} x={x} y={y} r={r} hex={fruit} kind={product.culture} />
            ))}
        </g>
        <Pot container={product.container} hex={fruit} />
      </g>
    </svg>
  );
}

/** Декоративный лист для баннеров и пустых состояний */
export function LeafMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M40 8C22 8 10 16 10 30c0 4 1 7 3 10 6-14 15-20 24-23-8 5-15 12-19 25 3 1 6 1 8 1 14 0 22-12 22-30 0-2 0-4-8-5Z"
        fill="currentColor"
      />
    </svg>
  );
}
