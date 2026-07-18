import Image from "next/image";

/**
 * Interior-page header. Consistent eyebrow + title + intro across pages, with an
 * optional wide photograph to keep pages from feeling flat.
 */
export function PageHeader({
  eyebrow,
  title,
  intro,
  image,
  imageAlt,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[40rem] w-[40rem] rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-sage), transparent 60%)" }}
      />
      <div className="container-x relative pt-16 pb-14 lg:pt-24 lg:pb-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display-xl mt-6 max-w-4xl text-ink">{title}</h1>
        {intro && <p className="lede mt-7 max-w-2xl">{intro}</p>}

        {image && (
          <div className="relative mt-12 aspect-[16/8] w-full overflow-hidden rounded-[2rem] border border-line">
            <Image
              src={image}
              alt={imageAlt ?? ""}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(12,36,27,0.3), transparent 55%)" }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
