import Image from "next/image";

const logos = [
  { name: "Anthropic", src: "/landing/logos/anthropic.svg" },
  { name: "Arc", src: "/landing/logos/arc.svg" },
  { name: "Notion", src: "/landing/logos/notion.svg" },
  { name: "OpenAI", src: "/landing/logos/openai.svg" },
  { name: "Perplexity", src: "/landing/logos/perplexity.svg" },
  { name: "Replit", src: "/landing/logos/replit.svg" },
  { name: "Snapchat", src: "/landing/logos/snapchat.svg" },
  { name: "xAI", src: "/landing/logos/xai.svg" },
];

export function LogoCloud() {
  return (
    <div className=" py-8">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Find your next job at
          </h2>
        </div>
        <div className="-mx-6 grid grid-cols-2 gap-0.5 overflow-hidden sm:mx-0 sm:rounded-2xl md:grid-cols-4 lg:grid-cols-4">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="bg-muted/20 p-6 sm:p-8 flex items-center justify-center"
            >
              <Image
                alt={logo.name}
                src={logo.src}
                width={120}
                height={40}
                className="max-h-10 w-full object-contain opacity-60 hover:opacity-100 transition-opacity duration-200"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
