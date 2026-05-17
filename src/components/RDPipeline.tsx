/**
 * R&D Pipeline diagram — the canonical PL R&D 5-stage funnel rendered as a
 * hexagonal mosaic that grows + shifts hue from blue (Research) to green
 * (Scaling). The hex cloud SVG is the exact asset the broader PL family
 * uses; we anchor the stage labels with `position:absolute` at percentages
 * matched to each cluster's visual centroid in the source artwork so they
 * track the clusters precisely at any width.
 *
 * Interaction: there is no ambient animation. Hovering a pipeline region
 * keeps that group in color, softens the rest of the mosaic, and expands
 * the matching group label with a short description. The transitions are
 * deliberately small so the diagram stays readable.
 *
 * Implementation: the source SVG ships two COMPOUND <path> elements (the
 * gradient cluster covering Development + Productionizing, and the teal
 * cluster covering Production) with multiple `M…Z` hex segments
 * concatenated into a single `d` string. We split those compounds into
 * individual hex paths at module load via `splitCompound` so each hex can
 * be assigned to one of the four hover groups. Each hex's first `M x y`
 * is exactly the top-center of the hexagon (verified by reading the source
 * paths), so `pathX(d)` gives us a reliable horizontal centroid for the
 * group boundary split.
 */

// All blue "Research" cluster hexes from the source SVG, individual paths.
const BLUE_HEXES: string[] = [
  "M17.7921 349.847V360.109L8.89603 365.235L0 360.109V349.847L8.89603 344.721L17.7921 349.847Z",
  "M34.3528 344.721L25.4668 349.847V360.109L34.3528 365.234L43.2489 360.109V349.847L34.3528 344.721Z",
  "M72.0581 344.721L63.1621 349.847V360.109L72.0581 365.234L80.9542 360.109V349.847L72.0581 344.721Z",
  "M98.1675 344.721L89.2715 349.847V360.109L98.1675 365.234L107.054 360.109V349.847L98.1675 344.721Z",
  "M45.4703 321.59L36.5742 326.716V336.968L45.4703 342.103L54.3663 336.968V326.716L45.4703 321.59Z",
  "M57.5581 287.637L48.6621 292.763V303.015L57.5581 308.151L66.4542 303.015V292.763L57.5581 287.637Z",
  "M89.941 282.491L81.0449 287.617V297.879L89.941 303.005L98.837 297.879V287.617L89.941 282.491Z",
  "M79.314 260.289L70.418 265.415V275.677L79.314 280.803L88.21 275.677V265.415L79.314 260.289Z",
  "M73.0289 204.305L64.1328 209.431V219.692L73.0289 224.818L81.9249 219.692V209.431L73.0289 204.305Z",
  "M61.9117 175.348L53.0156 180.474V190.726L61.9117 195.862L70.8077 190.726V180.474L61.9117 175.348Z",
  "M30.9703 171.002L22.0742 176.128V186.389L30.9703 191.515L39.8663 186.389V176.128L30.9703 171.002Z",
  "M103.48 301.796L94.584 306.922V317.183L103.48 322.309L112.376 317.183V306.922L103.48 301.796Z",
  "M159.068 303.245L150.172 308.37V318.632L159.068 323.758L167.964 318.632V308.37L159.068 303.245Z",
  "M156.166 344.721L147.27 349.847V360.109L156.166 365.234L165.062 360.109V349.847L156.166 344.721Z",
  "M9.89671 153.946L0 159.651V171.072L9.89671 176.777L19.7934 171.072V159.651L9.89671 153.946Z",
  "M9.89671 194.493L0 200.198V211.609L9.89671 217.314L19.7934 211.609V200.198L9.89671 194.493Z",
  "M19.0529 285.719L0 296.7V318.662L19.0529 329.643L38.0958 318.662V296.7L19.0529 285.719Z",
  "M74.4698 303.984L60 312.337V329.024L74.4698 337.377L88.9496 329.024V312.337L74.4698 303.984Z",
  "M188.769 323.029L174.289 331.382V348.068L188.769 356.422L203.249 348.068V331.382L188.769 323.029Z",
  "M102.03 223.619L84.4082 233.781V254.104L102.03 264.256L119.652 254.104V233.781L102.03 223.619Z",
  "M130.038 259.42L108.424 271.88V296.8L130.038 309.26L151.653 296.8V271.88L130.038 259.42Z",
  "M63.803 228.146L53.9062 233.851V245.272L63.803 250.977L73.6997 245.272V233.851L63.803 228.146Z",
  "M14.69 228.545L0 237.018V253.945L14.69 262.418L29.3699 253.945V237.018L14.69 228.545Z",
  "M43.0693 195.652L27.4688 204.644V222.63L43.0693 231.613L58.6599 222.63V204.644L43.0693 195.652Z",
  "M46.9912 251.597L31.3906 260.589V278.575L46.9912 287.557L62.5818 278.575V260.589L46.9912 251.597Z",
  "M130.129 316.264L113.277 325.986V345.421L130.129 355.133L146.98 345.421V325.986L130.129 316.264Z",
]

// All green "Scaling" cluster hexes, individual paths.
const GREEN_HEXES: string[] = [
  "M953.678 230.354L941.77 237.218V250.947L953.678 257.811L965.586 250.947V237.218L953.678 230.354Z",
  "M1133.72 146.641L1121.8 153.506V167.235L1133.72 174.099L1145.63 167.235V153.506L1133.72 146.641Z",
  "M1122.88 179.805L1110.97 186.669V200.398L1122.88 207.272L1134.79 200.398V186.669L1122.88 179.805Z",
  "M1135.96 342.963L1126.3 348.528V359.669L1135.96 365.235L1145.63 359.669V348.528L1135.96 342.963Z",
  "M976.303 337.777L964.395 344.641V358.37L976.303 365.235L988.211 358.37V344.641L976.303 337.777Z",
  "M908.437 117.405L896.529 124.269V137.998L908.437 144.863L920.345 137.998V124.269L908.437 117.405Z",
  "M964.035 74.8595L952.127 81.7239V95.4528L964.035 102.327L975.943 95.4528V81.7239L964.035 74.8595Z",
  "M928.65 81.1344L921.555 85.2211V93.4045L928.65 97.4912L935.744 93.4045V85.2211L928.65 81.1344Z",
  "M923.398 103.446L916.303 107.533V115.716L923.398 119.803L930.492 115.716V107.533L923.398 103.446Z",
  "M942.759 93.7742L935.664 97.8709V106.054L942.759 110.141L949.854 106.054V97.8709L942.759 93.7742Z",
  "M985.679 63.1589L978.584 67.2556V75.429L985.679 79.5257L992.774 75.429V67.2556L985.679 63.1589Z",
  "M1049.15 24.1904L1042.06 28.2771V36.4605L1049.15 40.5472L1056.25 36.4605V28.2771L1049.15 24.1904Z",
  "M984.067 124.389L976.973 128.486V136.669L984.067 140.756L991.162 136.669V128.486L984.067 124.389Z",
  "M1011.18 119.883L1004.08 123.97V132.153L1011.18 136.24L1018.27 132.153V123.97L1011.18 119.883Z",
  "M919.845 222.36L912.75 226.457V234.63L919.845 238.727L926.94 234.63V226.457L919.845 222.36Z",
  "M984.778 204.065L977.684 208.162V216.335L984.778 220.432L991.873 216.335V208.162L984.778 204.065Z",
  "M1049.4 162.519L1042.31 166.605V174.789L1049.4 178.875L1056.5 174.789V166.605L1049.4 162.519Z",
  "M1069.61 162.299L1062.51 166.385V174.569L1069.61 178.655L1076.7 174.569V166.385L1069.61 162.299Z",
  "M1094.13 178.416L1087.04 182.502V190.686L1094.13 194.772L1101.23 190.686V182.502L1094.13 178.416Z",
  "M1105.1 158.432L1098.01 162.519V170.702L1105.1 174.789L1112.21 170.702V162.519L1105.1 158.432Z",
  "M1138.53 35.3214L1131.43 39.4181V47.5915L1138.53 51.6882L1145.63 47.5915V39.4181L1138.53 35.3214Z",
  "M1115.45 0L1108.35 4.08669V12.2701L1115.45 16.3568L1122.54 12.2701V4.08669L1115.45 0Z",
  "M1138.53 14.0486L1131.43 18.1353V26.3187L1138.53 30.4054L1145.63 26.3187V18.1353L1138.53 14.0486Z",
  "M1111.7 21.6827L1104.61 25.7694V33.9528L1111.7 38.0495L1118.8 33.9528V25.7694L1111.7 21.6827Z",
  "M1008.37 348.878L1001.28 352.964V361.148L1008.37 365.234L1015.47 361.148V352.964L1008.37 348.878Z",
  "M1110.67 348.878L1103.58 352.964V361.148L1110.67 365.235L1117.77 361.148V352.964L1110.67 348.878Z",
  "M940.929 163.598L914.682 178.725V208.991L940.929 224.119L967.167 208.991V178.725L940.929 163.598Z",
  "M1008.15 144.313L981.906 159.441V189.697L1008.15 204.834L1034.39 189.697V159.441L1008.15 144.313Z",
  "M998.067 79.8054L979.484 90.5168V111.949L998.067 122.671L1016.66 111.949V90.5168L998.067 79.8054Z",
  "M948.974 113.368L929.48 124.609V147.081L948.974 158.322L968.467 147.081V124.609L948.974 113.368Z",
  "M1018.96 18.2053L1000.19 29.0266V50.6691L1018.96 61.4803L1037.73 50.6691V29.0266L1018.96 18.2053Z",
  "M1068.31 186.969L991.012 231.533V320.671L1068.31 365.235L1145.63 320.671V231.533L1068.31 186.969Z",
  "M1089.09 31.7941L1032.56 64.3877V129.565L1089.09 162.159L1145.63 129.565V64.3877L1089.09 31.7941Z",
]

// Compound paths from the source SVG that bundle multiple hexes into one
// `d` string. We split these at module load (see `splitCompound`) so each
// hexagon can be animated with its own delay.
const COMPOUND_GRADIENT =
  "M448.043 286.278L429.871 296.76V317.713L448.043 328.195L466.216 317.713V296.76L448.043 286.278ZM296.791 302.925L286.894 308.63V320.041L296.791 325.747L306.688 320.041V308.63L296.791 302.925ZM406.445 288.866L396.549 294.572V305.983L406.445 311.688L416.342 305.983V294.572L406.445 288.866ZM419.444 327.075L409.547 332.781V344.192L419.444 349.897L429.341 344.192V332.781L419.444 327.075ZM338.839 293.752L328.943 299.458V310.869L338.839 316.574L348.736 310.869V299.458L338.839 293.752ZM468.547 261.469L458.651 267.174V278.585L468.547 284.29L478.444 278.585V267.174L468.547 261.469ZM531.36 256.423L521.463 262.128V273.539L531.36 279.244L541.257 273.539V262.128L531.36 256.423ZM573.959 248.489L564.062 254.194V265.605L573.959 271.311L583.856 265.605V254.194L573.959 248.489ZM597.795 262.188L587.898 267.893V279.304L597.795 285.009L607.692 279.304V267.893L597.795 262.188ZM621.621 318.422L611.725 324.128V335.539L621.621 341.244L631.518 335.539V324.128L621.621 318.422ZM508.254 277.016L479.945 293.333V325.966L508.254 342.283L536.564 325.966V293.333L508.254 277.016ZM561.33 270.951L543.848 281.033V301.186L561.33 311.268L578.812 301.186V281.033L561.33 270.951ZM650.151 248.019L625.914 261.998V289.945L650.151 303.924L674.387 289.945V261.998L650.151 248.019ZM634 224.159L624.213 229.804V241.095L634 246.74L643.786 241.095V229.804L634 224.159ZM672.996 215.516L663.21 221.161V232.452L672.996 238.097L682.783 232.452V221.161L672.996 215.516ZM713.424 187.269L698.523 195.862V213.048L713.424 221.641L728.324 213.048V195.862L713.424 187.269ZM703.927 238.008L686.265 248.189V268.553L703.927 278.735L721.589 268.553V248.189L703.927 238.008ZM261.987 314.506L252.091 320.211V331.622L261.987 337.327L271.884 331.622V320.211L261.987 314.506ZM320.247 331.852L305.767 340.195V356.891L320.247 365.235L334.727 356.891V340.195L320.247 331.852ZM225.983 334.18L212.514 341.943V357.471L225.983 365.235L239.452 357.471V341.943L225.983 334.18ZM375.955 306.352L350.417 321.07V350.516L375.955 365.235L401.492 350.516V321.07L375.955 306.352ZM471.429 342.413L461.533 348.118V359.529L471.429 365.235L481.326 359.529V348.118L471.429 342.413ZM541.367 342.413L531.47 348.118V359.529L541.367 365.235L551.264 359.529V348.118L541.367 342.413ZM584.436 324.917L566.954 334.999V355.153L584.436 365.235L601.918 355.153V334.999L584.436 324.917ZM660.978 324.917L643.496 334.999V355.153L660.978 365.235L678.46 355.153V334.999L660.978 324.917ZM283.732 342.413L273.835 348.118V359.529L283.732 365.235L293.629 359.529V348.118L283.732 342.413Z"

const COMPOUND_TEAL =
  "M709.762 306.102L697.854 312.967V326.696L709.762 333.56L721.67 326.696V312.967L709.762 306.102ZM758.244 302.066L746.336 308.93V322.659L758.244 329.523L770.153 322.659V308.93L758.244 302.066ZM826.121 231.513L806.177 243.013V266.015L826.121 277.516L846.064 266.015V243.013L826.121 231.513ZM765.369 229.275L739.372 244.262V274.238L765.369 289.226L791.367 274.238V244.262L765.369 229.275ZM775.196 158.732L749.198 173.719V203.695L775.196 218.683L801.194 203.695V173.719L775.196 158.732ZM856.791 141.935L816.224 165.316V212.088L856.791 235.47L897.359 212.088V165.316L856.791 141.935ZM814.192 285.549L780.62 304.903V343.612L814.192 362.966L847.765 343.612V304.903L814.192 285.549ZM906.985 248.589L856.401 277.755V336.078L906.985 365.245L957.57 336.078V277.755L906.985 248.589Z"

/**
 * Split a compound `d` string into individual hex `d` strings. Each hex
 * segment starts with `M x y` and ends with `Z`, and there are no other
 * `M` commands within a single hex (verified by reading the source SVG),
 * so `/M[^M]+/g` cleanly separates them.
 */
function splitCompound(d: string): string[] {
  return d.match(/M[^M]+/g) ?? []
}

/**
 * Extract the x-coordinate of the first `M` point in a hex path. By
 * convention the source SVG starts each hex path at its top-center
 * vertex, so this returns the hexagon's horizontal centroid for grouping.
 */
function pathX(d: string): number {
  const m = d.match(/M\s*([\d.]+)/)
  return m ? parseFloat(m[1]) : 0
}

type PipelineGroup = "basic" | "fros" | "startups" | "companies"

type PipelineHex = {
  d: string
  fill: string
  x: number
  group: PipelineGroup
}

const gradientGroup = (x: number): PipelineGroup => (x < 560 ? "fros" : "startups")

// Flat list of every hexagon in the diagram, each annotated with its fill,
// horizontal centroid, and interaction group. Built once at module load.
const HEXAGONS: PipelineHex[] = [
  ...BLUE_HEXES.map((d) => ({ d, fill: "#3D78EC", x: pathX(d), group: "basic" as const })),
  ...splitCompound(COMPOUND_GRADIENT).map((d) => {
    const x = pathX(d)
    return {
      d,
      fill: "url(#rdpipeline_gradient)",
      x,
      group: gradientGroup(x),
    }
  }),
  ...splitCompound(COMPOUND_TEAL).map((d) => ({
    d,
    fill: "#63BCB6",
    x: pathX(d),
    group: "startups" as const,
  })),
  ...GREEN_HEXES.map((d) => ({ d, fill: "#75DA9E", x: pathX(d), group: "companies" as const })),
]

// Invisible SVG hit areas make each pipeline region easier to hover without
// changing the artwork. Bounds are non-overlapping so adjacent labels / bars
// never fight for hover state.
const HIT_AREAS: { group: PipelineGroup; x: number; y: number; width: number; height: number }[] = [
  { group: "basic", x: 0, y: 145, width: 210, height: 221 },
  { group: "fros", x: 210, y: 215, width: 350, height: 151 },
  { group: "startups", x: 560, y: 120, width: 340, height: 246 },
  { group: "companies", x: 900, y: 0, width: 246, height: 366 },
]

export default function RDPipeline() {
  // Stage labels — `leftPct` is the left-edge of the label as a percentage
  // of the SVG width, derived from each cluster's leftmost dense hex in
  // the source artwork.
  const stages: { name: string; color: string; leftPct: number; group: PipelineGroup }[] = [
    { name: "Research", color: "#3D78EC", leftPct: 4, group: "basic" },
    { name: "Development", color: "#4E8AD3", leftPct: 24, group: "fros" },
    { name: "Productionizing", color: "#59ABC3", leftPct: 43, group: "startups" },
    { name: "Production", color: "#63BCB6", leftPct: 63, group: "startups" },
    { name: "Scaling", color: "#75DA9E", leftPct: 82, group: "companies" },
  ]

  const groupLabels: {
    group: PipelineGroup
    name: string
    description: string
    color: string
    leftPct: number
    topPct: number
    widthPct: number
  }[] = [
    {
      group: "basic",
      name: "Basic research groups",
      description: "Open scientific work that creates new principles, primitives, and proof points.",
      color: "#3D78EC",
      leftPct: 0.2,
      topPct: 44,
      widthPct: 21,
    },
    {
      group: "fros",
      name: "FROs, R&D teams, side projects",
      description: "Focused teams turn promising ideas into prototypes, tools, and early ecosystems.",
      color: "#4E8AD3",
      leftPct: 22,
      topPct: 59,
      widthPct: 25.5,
    },
    {
      group: "startups",
      name: "Tech startups",
      description: "New ventures productize validated breakthroughs for real users and markets.",
      color: "#59ABC3",
      leftPct: 49,
      topPct: 35,
      widthPct: 28,
    },
    {
      group: "companies",
      name: "Tech companies",
      description: "Mature companies deploy, operate, and scale systems globally.",
      color: "#75DA9E",
      leftPct: 78.5,
      topPct: 11,
      widthPct: 21,
    },
  ]

  return (
    <figure className="rdpipeline-figure w-full group">
      {/*
        Scoped hover styles. Kept inline (rather than in globals.css) so
        the component is self-contained. `transform-box: fill-box` +
        `transform-origin: center` make each hex scale around its own
        center rather than the SVG origin (otherwise large hexes would
        translate visibly when scaled).
      */}
      <style>{`
        .rdpipeline-figure .rdpipeline-hex {
          transform-box: fill-box;
          transform-origin: center;
          transition: opacity 360ms ease, filter 360ms ease, transform 360ms ease;
        }
        .rdpipeline-figure .rdpipeline-hitarea {
          cursor: default;
          pointer-events: all;
        }
        .rdpipeline-figure .rdpipeline-group-label,
        .rdpipeline-figure .rdpipeline-stage-label {
          transition: opacity 320ms ease, filter 320ms ease, transform 320ms ease;
        }
        .rdpipeline-figure .rdpipeline-group-label {
          border-radius: 14px;
          padding: 8px 10px 10px;
          margin: -8px -10px -10px;
          pointer-events: auto;
        }
        .rdpipeline-figure .rdpipeline-group-rule {
          transform-origin: left center;
          transition: opacity 320ms ease, filter 320ms ease, transform 320ms ease;
        }
        .rdpipeline-figure .rdpipeline-description {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transform: translateY(-4px);
          transition: max-height 360ms ease, opacity 260ms ease, transform 360ms ease, margin-top 360ms ease;
        }
        .rdpipeline-figure:has(.rdpipeline-interactive:hover) .rdpipeline-hex,
        .rdpipeline-figure:has(.rdpipeline-interactive:hover) .rdpipeline-group-label,
        .rdpipeline-figure:has(.rdpipeline-interactive:hover) .rdpipeline-stage-label {
          opacity: .22;
          filter: grayscale(1) saturate(.25);
        }
        .rdpipeline-figure:has(.rdpipeline-basic:hover) .rdpipeline-basic,
        .rdpipeline-figure:has(.rdpipeline-fros:hover) .rdpipeline-fros,
        .rdpipeline-figure:has(.rdpipeline-startups:hover) .rdpipeline-startups,
        .rdpipeline-figure:has(.rdpipeline-companies:hover) .rdpipeline-companies {
          opacity: 1;
          filter: none;
        }
        .rdpipeline-figure:has(.rdpipeline-basic:hover) .rdpipeline-basic.rdpipeline-hex,
        .rdpipeline-figure:has(.rdpipeline-fros:hover) .rdpipeline-fros.rdpipeline-hex,
        .rdpipeline-figure:has(.rdpipeline-startups:hover) .rdpipeline-startups.rdpipeline-hex,
        .rdpipeline-figure:has(.rdpipeline-companies:hover) .rdpipeline-companies.rdpipeline-hex {
          transform: translateY(-1px) scale(1.015);
          filter: brightness(1.04) saturate(1.04);
        }
        .rdpipeline-figure:has(.rdpipeline-basic:hover) .rdpipeline-group-label.rdpipeline-basic,
        .rdpipeline-figure:has(.rdpipeline-fros:hover) .rdpipeline-group-label.rdpipeline-fros,
        .rdpipeline-figure:has(.rdpipeline-startups:hover) .rdpipeline-group-label.rdpipeline-startups,
        .rdpipeline-figure:has(.rdpipeline-companies:hover) .rdpipeline-group-label.rdpipeline-companies {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, .88);
          box-shadow: 0 14px 35px rgba(19, 19, 22, .06);
        }
        .rdpipeline-figure:has(.rdpipeline-basic:hover) .rdpipeline-group-label.rdpipeline-basic .rdpipeline-description,
        .rdpipeline-figure:has(.rdpipeline-fros:hover) .rdpipeline-group-label.rdpipeline-fros .rdpipeline-description,
        .rdpipeline-figure:has(.rdpipeline-startups:hover) .rdpipeline-group-label.rdpipeline-startups .rdpipeline-description,
        .rdpipeline-figure:has(.rdpipeline-companies:hover) .rdpipeline-group-label.rdpipeline-companies .rdpipeline-description {
          max-height: 90px;
          opacity: 1;
          transform: translateY(0);
          margin-top: 8px;
        }
        .rdpipeline-figure:has(.rdpipeline-basic:hover) .rdpipeline-group-label.rdpipeline-basic .rdpipeline-group-rule,
        .rdpipeline-figure:has(.rdpipeline-fros:hover) .rdpipeline-group-label.rdpipeline-fros .rdpipeline-group-rule,
        .rdpipeline-figure:has(.rdpipeline-startups:hover) .rdpipeline-group-label.rdpipeline-startups .rdpipeline-group-rule,
        .rdpipeline-figure:has(.rdpipeline-companies:hover) .rdpipeline-group-label.rdpipeline-companies .rdpipeline-group-rule {
          opacity: 1;
          transform: scaleX(1.03);
          filter: brightness(1.08);
        }
      `}</style>

      <div className="relative aspect-[1146/366] md:aspect-[1146/450]">
        <div className="absolute inset-0 z-10 hidden md:block pointer-events-none" aria-hidden="true">
          {groupLabels.map((label) => (
            <div
              key={label.name}
              className={`rdpipeline-group-label rdpipeline-interactive rdpipeline-${label.group} absolute`}
              style={{
                left: `${label.leftPct}%`,
                top: `${label.topPct}%`,
                width: `${label.widthPct}%`,
              }}
            >
              <span className="block text-[13px] lg:text-sm font-medium tracking-tight text-gray-800 whitespace-nowrap">
                {label.name}
              </span>
              <span
                className="rdpipeline-group-rule mt-2 block h-px w-full opacity-70"
                style={{ backgroundColor: label.color }}
              />
              <span className="rdpipeline-description block text-xs leading-snug text-gray-500">
                {label.description}
              </span>
            </div>
          ))}
        </div>

        <svg
          viewBox="0 0 1146 366"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-x-0 bottom-0 z-0 w-full h-auto block"
          aria-label="PL R&D pipeline: Research → Development → Productionizing → Production → Scaling"
          role="img"
        >
          <g clipPath="url(#rdpipeline_clip)">
            {HEXAGONS.map((hex, i) => (
              <path
                key={i}
                d={hex.d}
                fill={hex.fill}
                className={`rdpipeline-hex rdpipeline-interactive rdpipeline-${hex.group}`}
              />
            ))}
          </g>
          {HIT_AREAS.map((area) => (
            <rect
              key={area.group}
              x={area.x}
              y={area.y}
              width={area.width}
              height={area.height}
              fill="transparent"
              className={`rdpipeline-hitarea rdpipeline-interactive rdpipeline-${area.group}`}
              aria-hidden="true"
            />
          ))}
          <defs>
            <linearGradient
              id="rdpipeline_gradient"
              x1="212.514"
              y1="276.247"
              x2="728.334"
              y2="276.247"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#4E8AD3" />
              <stop offset="1" stopColor="#59ABC3" />
            </linearGradient>
            <clipPath id="rdpipeline_clip">
              <rect width="1145.63" height="365.235" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>

      {/*
        Desktop labels (≥ sm): absolutely-positioned in a relative wrapper
        so each label can sit at its own non-uniform `leftPct` along the
        SVG's width.
      */}
      <div className="hidden sm:block relative h-6 mt-4 pointer-events-none">
        {stages.map((stage) => (
          <span
            key={stage.name}
            className={`rdpipeline-stage-label rdpipeline-interactive rdpipeline-${stage.group} absolute top-0 text-sm font-medium tracking-tight whitespace-nowrap pointer-events-auto`}
            style={{ left: `${stage.leftPct}%`, color: stage.color }}
          >
            {stage.name}
          </span>
        ))}
      </div>

      {/*
        Mobile legend (< sm): the diagram is too narrow for inline labels
        ("Productionizing" alone is ~85px wide), so we show a wrapping
        legend with diamond-shaped color chips underneath — same
        information, mobile-friendly layout.
      */}
      <ol className="sm:hidden mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium list-none p-0">
        {stages.map((stage, i) => (
          <li key={stage.name} className="flex items-center gap-1.5" style={{ color: stage.color }}>
            <span
              className="inline-block w-2 h-2 rounded-sm rotate-45"
              style={{ background: stage.color }}
              aria-hidden="true"
            />
            <span className="text-gray-500 mr-0.5">{i + 1}.</span>
            {stage.name}
          </li>
        ))}
      </ol>
    </figure>
  )
}
