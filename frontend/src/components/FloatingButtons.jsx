import { Phone } from 'lucide-react';

const WA_NUMBER = '919046585943';
const WA_MESSAGE = encodeURIComponent(
  'Hello Reeyansh Aya Care, I would like to know more about your home-care services.'
);

/* Official WhatsApp SVG path — more recognisable than MessageCircle */
function WhatsAppIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.737 5.469 2.027 7.773L0 32l8.467-2.003A15.928 15.928 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 0 1-6.771-1.851l-.485-.29-5.025 1.188 1.22-4.896-.317-.503A13.267 13.267 0 0 1 2.667 16C2.667 8.637 8.637 2.667 16 2.667S29.333 8.637 29.333 16 23.363 29.333 16 29.333zm7.28-9.907c-.398-.2-2.355-1.163-2.72-1.295-.366-.133-.632-.2-.898.2-.266.398-1.031 1.295-1.264 1.561-.232.266-.465.3-.864.1-.398-.2-1.682-.62-3.203-1.977-1.184-1.055-1.984-2.357-2.217-2.755-.232-.398-.025-.613.175-.812.18-.178.398-.465.598-.697.199-.232.265-.398.398-.664.133-.265.066-.498-.034-.697-.1-.2-.898-2.165-1.23-2.963-.324-.779-.655-.674-.898-.686l-.765-.013c-.266 0-.697.1-1.063.498-.366.398-1.396 1.363-1.396 3.326 0 1.963 1.43 3.861 1.629 4.127.2.265 2.813 4.295 6.817 6.025.953.411 1.696.657 2.274.842.956.304 1.826.261 2.514.158.767-.114 2.355-.963 2.688-1.894.333-.93.333-1.728.232-1.894-.099-.165-.365-.265-.764-.465z" />
    </svg>
  );
}

export default function FloatingButtons() {
  return (
    <div
      className="fixed bottom-6 right-4 sm:right-5 z-50 flex flex-col gap-3"
      role="complementary"
      aria-label="Quick contact buttons"
    >
      {/* ── WhatsApp ── */}
      <a
        href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        id="float-whatsapp"
        className="
          group flex items-center justify-center
          w-13 h-13 sm:w-14 sm:h-14
          rounded-full bg-[#25D366] hover:bg-[#1ebe5d]
          shadow-lg hover:shadow-xl
          transition-all duration-200
          hover:-translate-y-0.5 active:translate-y-0
        "
      >
        <WhatsAppIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />

        {/* Tooltip */}
        <span className="
          pointer-events-none absolute right-full mr-3
          bg-slate-900 text-white text-xs font-medium
          px-2.5 py-1.5 rounded-lg whitespace-nowrap
          opacity-0 group-hover:opacity-100
          translate-x-1 group-hover:translate-x-0
          transition-all duration-150
        ">
          Chat on WhatsApp
        </span>
      </a>

      {/* ── Phone ── */}
      <a
        href="tel:+919046585943"
        aria-label="Call Reeyansh Aya Care"
        id="float-phone"
        className="
          group flex items-center justify-center
          w-13 h-13 sm:w-14 sm:h-14
          rounded-full bg-[#1da851] hover:bg-[#178f44]
          shadow-lg hover:shadow-xl
          transition-all duration-200
          hover:-translate-y-0.5 active:translate-y-0
        "
      >
        <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />

        {/* Tooltip */}
        <span className="
          pointer-events-none absolute right-full mr-3
          bg-slate-900 text-white text-xs font-medium
          px-2.5 py-1.5 rounded-lg whitespace-nowrap
          opacity-0 group-hover:opacity-100
          translate-x-1 group-hover:translate-x-0
          transition-all duration-150
        ">
          Call Us Now
        </span>
      </a>
    </div>
  );
}
