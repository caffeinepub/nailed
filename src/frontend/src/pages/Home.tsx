import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  Heart,
  Home as HomeIcon,
  Mail,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { SiFacebook, SiInstagram, SiPinterest } from "react-icons/si";
import { toast } from "sonner";
import { ServiceType } from "../backend.d";
import { useGetExperts, useSubmitBooking } from "../hooks/useQueries";

const SERVICE_LABELS: Record<ServiceType, string> = {
  [ServiceType.gelNails]: "Gel Extensions",
  [ServiceType.acrylicNails]: "Acrylic Extensions",
  [ServiceType.manicure]: "Classic Manicure",
  [ServiceType.pedicure]: "Pedicure",
};

const SERVICES = [
  {
    icon: "✨",
    title: "Gel Extensions",
    type: ServiceType.gelNails,
    description:
      "Lightweight, flexible gel extensions that look and feel completely natural. Perfect for everyday elegance.",
  },
  {
    icon: "💅",
    title: "Acrylic Extensions",
    type: ServiceType.acrylicNails,
    description:
      "Long-lasting acrylic nails with a flawless finish. Strong, durable, and customizable in any shape.",
  },
  {
    icon: "🎨",
    title: "Nail Art",
    type: ServiceType.gelNails,
    description:
      "From delicate florals to bold geometric designs — your nails become a canvas for wearable art.",
  },
  {
    icon: "🌸",
    title: "Classic Manicure",
    type: ServiceType.manicure,
    description:
      "A timeless manicure with cuticle care, shaping, buffing, and your choice of polish.",
  },
];

const GALLERY = [
  {
    src: "/assets/generated/gallery-gel-nails.dim_600x800.jpg",
    label: "Gel Extensions",
  },
  {
    src: "/assets/generated/gallery-acrylic.dim_600x600.jpg",
    label: "Acrylic French Tips",
  },
  {
    src: "/assets/generated/gallery-nail-art.dim_600x800.jpg",
    label: "Floral Nail Art",
  },
  {
    src: "/assets/generated/gallery-manicure.dim_600x600.jpg",
    label: "Classic Manicure",
  },
  {
    src: "/assets/generated/gallery-pedicure.dim_600x600.jpg",
    label: "Luxury Pedicure",
  },
  {
    src: "/assets/generated/gallery-ombre.dim_600x800.jpg",
    label: "Ombré Extensions",
  },
];

const PRICING = [
  {
    name: "Essential",
    price: "$45",
    description: "Perfect for a fresh start",
    features: [
      "Classic Manicure",
      "Polish of your choice",
      "Cuticle care",
      "Nail shaping & buffing",
    ],
    highlighted: false,
  },
  {
    name: "Signature",
    price: "$75",
    description: "Our most popular package",
    features: [
      "Gel or Acrylic Extensions",
      "Custom nail shape",
      "Base coat + top coat",
      "1 accent nail art design",
      "30-day wear guarantee",
    ],
    highlighted: true,
  },
  {
    name: "Luxury",
    price: "$120",
    description: "The full Nailed experience",
    features: [
      "Premium extensions",
      "Full nail art design",
      "Gel top coat",
      "Pedicure included",
      "Priority booking",
      "Aftercare kit",
    ],
    highlighted: false,
  },
];

const FOOTER_LINKS = [
  { label: "FAQ", href: "#faq" },
  { label: "Terms", href: "#terms" },
  { label: "Privacy", href: "#privacy" },
  { label: "Careers", href: "#careers" },
];

const SOCIAL_LINKS = [
  { Icon: SiInstagram, label: "Instagram", href: "https://instagram.com" },
  { Icon: SiPinterest, label: "Pinterest", href: "https://pinterest.com" },
  { Icon: SiFacebook, label: "Facebook", href: "https://facebook.com" },
];

function StarRating({ rating }: { rating: number }) {
  const stars: React.ReactNode[] = [];
  for (let i = 1; i <= 5; i++) {
    const filled = rating >= i - 0.25;
    const half = !filled && rating >= i - 0.75;
    stars.push(
      <span
        key={i}
        className={`text-sm ${
          filled
            ? "text-[oklch(0.75_0.18_75)]"
            : half
              ? "text-[oklch(0.75_0.18_75)]"
              : "text-[oklch(0.85_0.03_300)]"
        }`}
      >
        {filled ? "★" : half ? "★" : "☆"}
      </span>,
    );
  }
  return (
    <span className="flex items-center gap-0.5">
      {stars}
      <span className="ml-1 text-xs text-[oklch(0.52_0.08_300)] font-sans">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);
  const bookingRef = useRef<HTMLElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [expertError, setExpertError] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    date: "",
    serviceType: "" as ServiceType | "",
    notes: "",
    expertId: null as bigint | null,
  });

  const submitBooking = useSubmitBooking();
  const { data: experts, isLoading: expertsLoading } = useGetExperts();

  const scrollTo = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.phone ||
      !formData.address ||
      !formData.date ||
      !formData.serviceType
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (formData.expertId === null) {
      setExpertError(true);
      toast.error("Please select an expert.");
      return;
    }
    setExpertError(false);
    try {
      const dateMs = new Date(formData.date).getTime();
      await submitBooking.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        date: BigInt(dateMs) * BigInt(1_000_000),
        serviceType: formData.serviceType as ServiceType,
        notes: formData.notes,
        expertId: formData.expertId,
      });
      toast.success("Booking submitted! We'll confirm shortly. 💅");
      setFormData({
        name: "",
        phone: "",
        address: "",
        date: "",
        serviceType: "",
        notes: "",
        expertId: null,
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const currentYear = new Date().getFullYear();

  const NAV_ITEMS = [
    { label: "Home", ref: heroRef },
    { label: "Services", ref: servicesRef },
    { label: "Gallery", ref: galleryRef },
    { label: "Pricing", ref: pricingRef },
    { label: "Book", ref: bookingRef },
  ];

  return (
    <div className="min-h-screen bg-white font-sans scroll-smooth">
      {/* ===== STICKY HEADER ===== */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-[oklch(0.87_0.06_300)] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              type="button"
              onClick={() => scrollTo(heroRef)}
              className="font-serif text-2xl font-bold text-[oklch(0.22_0.06_300)] tracking-tight hover:text-[oklch(0.62_0.18_300)] transition-colors"
              data-ocid="header.link"
            >
              Nailed
            </button>

            <nav
              className="hidden md:flex items-center gap-6"
              aria-label="Main navigation"
            >
              {NAV_ITEMS.map(({ label, ref }) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => scrollTo(ref)}
                  className="text-sm font-sans text-[oklch(0.52_0.08_300)] hover:text-[oklch(0.22_0.06_300)] transition-colors tracking-wide"
                  data-ocid="header.link"
                >
                  {label}
                </button>
              ))}
              <Button
                type="button"
                onClick={() => scrollTo(bookingRef)}
                className="bg-[oklch(0.62_0.18_300)] text-white hover:bg-[oklch(0.55_0.2_300)] shadow-lavender font-sans text-sm px-5"
                data-ocid="header.primary_button"
              >
                Book Now
              </Button>
            </nav>

            <button
              type="button"
              className="md:hidden p-2 text-[oklch(0.52_0.08_300)]"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              data-ocid="header.toggle"
            >
              <div className="space-y-1">
                <span
                  className={`block w-6 h-0.5 bg-current transition-transform ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`}
                />
                <span
                  className={`block w-6 h-0.5 bg-current transition-opacity ${menuOpen ? "opacity-0" : ""}`}
                />
                <span
                  className={`block w-6 h-0.5 bg-current transition-transform ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
                />
              </div>
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden py-4 border-t border-[oklch(0.87_0.06_300)] flex flex-col gap-3">
              {NAV_ITEMS.map(({ label, ref }) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => scrollTo(ref)}
                  className="text-left text-sm font-sans text-[oklch(0.52_0.08_300)] hover:text-[oklch(0.22_0.06_300)] py-1"
                >
                  {label}
                </button>
              ))}
              <Button
                type="button"
                onClick={() => scrollTo(bookingRef)}
                className="bg-[oklch(0.62_0.18_300)] text-white hover:bg-[oklch(0.55_0.2_300)] mt-2 w-full"
              >
                Book Now
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section
        ref={heroRef}
        className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden"
      >
        <img
          src="/assets/generated/hero-nailed.dim_1920x1080.jpg"
          alt="Nail technician working on client"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.45_0.18_300)]/40 via-[oklch(0.45_0.18_300)]/20 to-[oklch(0.22_0.06_300)]/60" />
        <motion.div
          className="relative z-10 text-center px-4 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="text-white/80 font-sans text-sm tracking-[0.2em] uppercase mb-4">
            At-Home Nail Extension Service
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6">
            Effortless Elegance,
            <br />
            Right at Home.
          </h1>
          <p className="text-white/85 font-sans text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            Professional nail extensions and luxury manicures delivered to your
            doorstep. Pure indulgence, zero compromise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              type="button"
              onClick={() => scrollTo(bookingRef)}
              className="bg-[oklch(0.62_0.18_300)] text-white hover:bg-[oklch(0.55_0.2_300)] shadow-lavender font-sans text-base px-8 py-6 text-lg"
              data-ocid="hero.primary_button"
            >
              Book Your Session
            </Button>
            <Button
              type="button"
              onClick={() => scrollTo(servicesRef)}
              variant="outline"
              className="border-white text-white bg-white/10 hover:bg-white/20 hover:text-white font-sans text-base px-8 py-6 text-lg backdrop-blur-sm"
              data-ocid="hero.secondary_button"
            >
              Explore Services
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ===== TRUST STRIP ===== */}
      <div className="bg-[oklch(0.96_0.03_300)] border-y border-[oklch(0.87_0.06_300)]">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
          {[
            { icon: <Star className="w-4 h-4" />, text: "5-Star Rated" },
            { icon: <HomeIcon className="w-4 h-4" />, text: "We Come to You" },
            {
              icon: <Clock className="w-4 h-4" />,
              text: "Flexible Scheduling",
            },
            {
              icon: <Sparkles className="w-4 h-4" />,
              text: "Premium Products",
            },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 text-[oklch(0.62_0.18_300)] font-sans text-sm font-medium"
            >
              {icon}
              <span className="text-[oklch(0.52_0.08_300)]">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== SERVICES SECTION ===== */}
      <section
        ref={servicesRef}
        className="py-20 bg-[oklch(0.96_0.03_300)]"
        id="services"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[oklch(0.62_0.18_300)] font-sans text-sm tracking-[0.2em] uppercase mb-3">
              What We Offer
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-[oklch(0.22_0.06_300)]">
              Our Services
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service, i) => (
              <motion.div
                key={service.title}
                className="bg-white rounded-2xl p-6 shadow-card border border-[oklch(0.87_0.06_300)] flex flex-col gap-4 hover:shadow-lavender transition-shadow duration-300"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                data-ocid={`services.item.${i + 1}`}
              >
                <span className="text-4xl">{service.icon}</span>
                <h3 className="font-serif text-xl text-[oklch(0.22_0.06_300)]">
                  {service.title}
                </h3>
                <p className="text-sm text-[oklch(0.52_0.08_300)] leading-relaxed flex-1">
                  {service.description}
                </p>
                <button
                  type="button"
                  onClick={() => scrollTo(bookingRef)}
                  className="text-sm text-[oklch(0.62_0.18_300)] font-sans font-medium hover:underline text-left"
                  data-ocid={`services.button.${i + 1}`}
                >
                  Book Now →
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GALLERY SECTION ===== */}
      <section ref={galleryRef} className="py-20 bg-white" id="gallery">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[oklch(0.62_0.18_300)] font-sans text-sm tracking-[0.2em] uppercase mb-3">
              Our Work
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-[oklch(0.22_0.06_300)]">
              Gallery
            </h2>
          </motion.div>
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {GALLERY.map((item, i) => (
              <motion.div
                key={item.label}
                className="break-inside-avoid relative group overflow-hidden rounded-xl"
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                data-ocid={`gallery.item.${i + 1}`}
              >
                <img
                  src={item.src}
                  alt={item.label}
                  className="w-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.45_0.18_300)]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-end p-4">
                  <span className="text-white font-sans text-sm font-medium">
                    {item.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BOOKING + PRICING SECTION ===== */}
      <section
        ref={pricingRef}
        className="py-20 bg-[oklch(0.93_0.04_300)]"
        id="pricing"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[oklch(0.62_0.18_300)] font-sans text-sm tracking-[0.2em] uppercase mb-3">
              Book & Plan
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-[oklch(0.22_0.06_300)]">
              Reserve Your Session
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Booking Form */}
            <motion.div
              ref={bookingRef as React.RefObject<HTMLDivElement>}
              className="bg-white rounded-2xl p-8 shadow-card border border-[oklch(0.87_0.06_300)]"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              id="booking"
              data-ocid="booking.panel"
            >
              <h3 className="font-serif text-2xl text-[oklch(0.22_0.06_300)] mb-6">
                Reserve Your Nailed Session
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="name"
                    className="font-sans text-sm text-[oklch(0.52_0.08_300)]"
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g. Sofia Martinez"
                    className="bg-[oklch(0.96_0.03_300)] border-[oklch(0.87_0.06_300)] font-sans"
                    required
                    data-ocid="booking.input"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="phone"
                      className="font-sans text-sm text-[oklch(0.52_0.08_300)]"
                    >
                      Phone *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="+1 (555) 000-0000"
                      className="bg-[oklch(0.96_0.03_300)] border-[oklch(0.87_0.06_300)] font-sans"
                      required
                      data-ocid="booking.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="date"
                      className="font-sans text-sm text-[oklch(0.52_0.08_300)]"
                    >
                      Preferred Date *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, date: e.target.value }))
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className="bg-[oklch(0.96_0.03_300)] border-[oklch(0.87_0.06_300)] font-sans"
                      required
                      data-ocid="booking.input"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="address"
                    className="font-sans text-sm text-[oklch(0.52_0.08_300)]"
                  >
                    Home Address *
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, address: e.target.value }))
                    }
                    placeholder="123 Rose Lane, City, State"
                    className="bg-[oklch(0.96_0.03_300)] border-[oklch(0.87_0.06_300)] font-sans"
                    required
                    data-ocid="booking.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="service"
                    className="font-sans text-sm text-[oklch(0.52_0.08_300)]"
                  >
                    Service Type *
                  </Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(val) =>
                      setFormData((p) => ({
                        ...p,
                        serviceType: val as ServiceType,
                      }))
                    }
                  >
                    <SelectTrigger
                      id="service"
                      className="bg-[oklch(0.96_0.03_300)] border-[oklch(0.87_0.06_300)] font-sans"
                      data-ocid="booking.select"
                    >
                      <SelectValue placeholder="Select a service..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SERVICE_LABELS).map(([value, label]) => (
                        <SelectItem
                          key={value}
                          value={value}
                          className="font-sans"
                        >
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* ===== EXPERT SELECTION ===== */}
                <div className="space-y-2">
                  <Label className="font-sans text-sm text-[oklch(0.52_0.08_300)]">
                    Choose Your Expert *
                  </Label>
                  {expertsLoading ? (
                    <div
                      className="grid grid-cols-2 gap-3"
                      data-ocid="booking.loading_state"
                    >
                      {[1, 2, 3, 4].map((n) => (
                        <Skeleton key={n} className="h-28 rounded-xl" />
                      ))}
                    </div>
                  ) : experts && experts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {experts.map((expert, i) => {
                        const isSelected = formData.expertId === expert.id;
                        return (
                          <button
                            type="button"
                            key={String(expert.id)}
                            onClick={() => {
                              setFormData((p) => ({
                                ...p,
                                expertId: expert.id,
                              }));
                              setExpertError(false);
                            }}
                            className={`text-left rounded-xl p-3 border-2 transition-all duration-200 ${
                              isSelected
                                ? "border-[oklch(0.62_0.18_300)] bg-[oklch(0.95_0.04_300)] shadow-sm"
                                : "border-[oklch(0.87_0.06_300)] bg-[oklch(0.97_0.02_300)] hover:border-[oklch(0.75_0.12_300)] hover:bg-[oklch(0.96_0.03_300)]"
                            }`}
                            data-ocid={`booking.radio.${i + 1}`}
                          >
                            <p className="font-sans font-semibold text-sm text-[oklch(0.22_0.06_300)] mb-1">
                              {expert.name}
                            </p>
                            <p className="font-sans text-xs text-[oklch(0.52_0.08_300)] mb-1">
                              {String(expert.experience)} yrs experience
                            </p>
                            <p className="font-sans text-xs text-[oklch(0.62_0.18_300)] mb-1.5">
                              {String(expert.appointmentsDone)} appointments
                            </p>
                            <StarRating rating={expert.rating} />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="font-sans text-sm text-[oklch(0.52_0.08_300)] italic">
                      No experts available at this time.
                    </p>
                  )}
                  {expertError && (
                    <p
                      className="text-destructive text-xs font-sans"
                      data-ocid="booking.error_state"
                    >
                      Please select an expert to continue.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="notes"
                    className="font-sans text-sm text-[oklch(0.52_0.08_300)]"
                  >
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, notes: e.target.value }))
                    }
                    placeholder="Any design preferences, allergies, or special requests..."
                    className="bg-[oklch(0.96_0.03_300)] border-[oklch(0.87_0.06_300)] font-sans resize-none"
                    rows={3}
                    data-ocid="booking.textarea"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitBooking.isPending}
                  className="w-full bg-[oklch(0.62_0.18_300)] text-white hover:bg-[oklch(0.55_0.2_300)] shadow-lavender font-sans text-base py-6"
                  data-ocid="booking.submit_button"
                >
                  {submitBooking.isPending
                    ? "Submitting..."
                    : "Reserve My Session 💅"}
                </Button>
                {submitBooking.isError && (
                  <p
                    className="text-destructive text-sm font-sans text-center"
                    data-ocid="booking.error_state"
                  >
                    Failed to submit. Please try again.
                  </p>
                )}
              </form>
            </motion.div>

            {/* Pricing Cards */}
            <div className="flex flex-col gap-5" id="pricing-cards">
              {PRICING.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  className={`rounded-2xl p-6 border flex flex-col sm:flex-row gap-4 ${
                    plan.highlighted
                      ? "bg-[oklch(0.45_0.18_300)] border-[oklch(0.62_0.18_300)] shadow-lavender text-white"
                      : "bg-white border-[oklch(0.87_0.06_300)] shadow-card"
                  }`}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  data-ocid={`pricing.item.${i + 1}`}
                >
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="font-serif text-3xl font-bold text-[oklch(0.75_0.14_300)]">
                        {plan.price}
                      </span>
                      <span
                        className={`font-serif text-xl ${
                          plan.highlighted
                            ? "text-white"
                            : "text-[oklch(0.22_0.06_300)]"
                        }`}
                      >
                        {plan.name}
                      </span>
                    </div>
                    <p
                      className={`font-sans text-sm mb-3 ${
                        plan.highlighted
                          ? "text-white/70"
                          : "text-[oklch(0.52_0.08_300)]"
                      }`}
                    >
                      {plan.description}
                    </p>
                    <ul className="space-y-1.5">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2 font-sans text-sm"
                        >
                          <span className="text-[oklch(0.75_0.14_300)]">✓</span>
                          <span
                            className={
                              plan.highlighted
                                ? "text-white/90"
                                : "text-[oklch(0.52_0.08_300)]"
                            }
                          >
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex sm:flex-col justify-end">
                    <Button
                      type="button"
                      onClick={() => scrollTo(bookingRef)}
                      size="sm"
                      className={`font-sans text-sm px-5 ${
                        plan.highlighted
                          ? "bg-[oklch(0.75_0.14_300)] text-white hover:bg-[oklch(0.68_0.16_300)]"
                          : "bg-white border border-[oklch(0.62_0.18_300)] text-[oklch(0.62_0.18_300)] hover:bg-[oklch(0.62_0.18_300)] hover:text-white"
                      }`}
                      variant={plan.highlighted ? "default" : "outline"}
                      data-ocid={`pricing.button.${i + 1}`}
                    >
                      Book
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[oklch(0.96_0.03_300)] border-t border-[oklch(0.87_0.06_300)] py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
            <div>
              <h4 className="font-serif text-2xl font-bold text-[oklch(0.22_0.06_300)] mb-3">
                Nailed
              </h4>
              <div className="flex items-start gap-2 text-sm text-[oklch(0.52_0.08_300)] mb-2">
                <MapPin className="w-4 h-4 mt-0.5 text-[oklch(0.62_0.18_300)] shrink-0" />
                <span>Serving Los Angeles & surrounding areas</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[oklch(0.52_0.08_300)]">
                <Mail className="w-4 h-4 text-[oklch(0.62_0.18_300)] shrink-0" />
                <span>hello@nailed.studio</span>
              </div>
            </div>
            <div>
              <h5 className="font-sans font-semibold text-sm text-[oklch(0.22_0.06_300)] uppercase tracking-wider mb-4">
                Quick Links
              </h5>
              <ul className="space-y-2">
                {FOOTER_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="font-sans text-sm text-[oklch(0.52_0.08_300)] hover:text-[oklch(0.62_0.18_300)] transition-colors"
                      data-ocid="footer.link"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-sans font-semibold text-sm text-[oklch(0.22_0.06_300)] uppercase tracking-wider mb-4">
                Follow Us
              </h5>
              <div className="flex gap-4 mb-4">
                {SOCIAL_LINKS.map(({ Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-full bg-white border border-[oklch(0.87_0.06_300)] flex items-center justify-center text-[oklch(0.52_0.08_300)] hover:text-[oklch(0.62_0.18_300)] hover:border-[oklch(0.62_0.18_300)] transition-colors shadow-xs"
                    data-ocid="footer.link"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
              <p className="font-sans text-xs text-[oklch(0.52_0.08_300)]">
                @nailed.studio · Beautiful nails, delivered.
              </p>
            </div>
          </div>
          <div className="border-t border-[oklch(0.87_0.06_300)] pt-6 text-center">
            <p className="font-sans text-xs text-[oklch(0.52_0.08_300)]">
              © {currentYear} Nailed. Built with{" "}
              <Heart className="inline w-3 h-3 text-[oklch(0.62_0.18_300)]" />{" "}
              using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[oklch(0.62_0.18_300)] hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
