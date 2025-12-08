"use client"

import { motion } from "framer-motion"
import { ArrowRight, Star, Users, Clock, Bell, Receipt, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { SmartCtaLink } from "@/components/smart-cta-link"
import { ImageSlider } from "@/components/image-slider"

export default function LandingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const features = [
    {
      title: "Smart Deadline Tracking",
      description: "Automatically calculates return windows based on retailer policies. Never miss a deadline again.",
      icon: <Clock className="size-6 stroke-[1.5] text-emerald-500" />,
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    },
    {
      title: "Receipt Scanning",
      description: "Snap a photo of your receipt and let AI extract all the details automatically.",
      icon: <Receipt className="size-6 stroke-[1.5] text-blue-500" />,
      iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
    },
    {
      title: "Smart Notifications",
      description: "Timely reminders at 7 days, 2 days, and deadline day keep you on track.",
      icon: <Bell className="size-6 stroke-[1.5] text-rose-500" />,
      iconBg: "bg-rose-500/10 dark:bg-rose-500/20",
    },
    {
      title: "Money Saved Tracker",
      description: "Track every dollar saved by returning items before deadlines expire.",
      icon: <TrendingUp className="size-6 stroke-[1.5] text-cyan-500" />,
      iconBg: "bg-cyan-500/10 dark:bg-cyan-500/20",
    },
  ]

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Header />

      {/* Sticky mobile CTA */}
      <div className="sm:hidden fixed bottom-3 inset-x-3 z-50">
        <Button
          size="lg"
          className="w-full rounded-full h-12 px-6 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80"
          asChild
        >
          <SmartCtaLink
            aria-label="Start Tracking Free"
            data-cta-id="cta_mobile_sticky"
          >
            Start Tracking Free
            <ArrowRight className="ml-2 size-4" />
          </SmartCtaLink>
        </Button>
      </div>

      <main className="flex-1 relative pb-20 sm:pb-0">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-[#171717] bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 overflow-hidden">
          <div className="container px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center max-w-3xl mx-auto mb-8 md:mb-12"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 leading-tight">
                Never Miss a Return Deadline Again
              </h1>

              {/* Social Proof Chip */}
              <div className="flex items-center justify-center gap-2 mb-5">
                <Badge className="rounded-full px-4 py-1.5 text-sm font-medium flex items-center gap-2" variant="secondary">
                  <Users className="size-4" />
                  Join 10,000+ Smart Shoppers
                </Badge>
              </div>

              <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-[70ch] mx-auto leading-relaxed">
                Track your purchases, get timely reminders, and maximize your refund windows with Retoro's smart deadline tracking.
              </p>

              {/* CTAs with analytics ids */}
              <div className="flex flex-col items-center gap-2 pt-4">
                <Button
                  size="lg"
                  className="rounded-full h-12 px-8 text-base transition-all hover:scale-105 hover:shadow-lg"
                  asChild
                >
                  <SmartCtaLink
                    aria-label="Start Tracking Free"
                    data-cta-id="cta_hero_start_free"
                  >
                    Start Tracking Free
                    <ArrowRight className="ml-2 size-4" />
                  </SmartCtaLink>
                </Button>
                <span className="text-xs text-muted-foreground">No credit card required</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="relative mx-auto max-w-4xl mt-8"
            >
              {/* App Store-style vertical image slider */}
              <div className="relative group">
                <ImageSlider
                  images={[
                    {
                      src: "/images/screenshots/app-screenshot-1.svg",
                      alt: "Retoro app - Track purchases screen"
                    },
                    {
                      src: "/images/screenshots/app-screenshot-2.svg",
                      alt: "Retoro app - Return deadlines overview"
                    },
                    {
                      src: "/images/screenshots/app-screenshot-3.svg",
                      alt: "Retoro app - Receipt scanning feature"
                    },
                    {
                      src: "/images/screenshots/app-screenshot-4.svg",
                      alt: "Retoro app - Push notifications settings"
                    },
                    {
                      src: "/images/screenshots/app-screenshot-5.svg",
                      alt: "Retoro app - Money saved tracker"
                    },
                    {
                      src: "/images/screenshots/app-screenshot-6.svg",
                      alt: "Retoro app - Multi-currency support"
                    }
                  ]}
                  autoSlideInterval={3500}
                  className="drop-shadow-2xl"
                />
                {/* Decorative gradient blurs */}
                <div className="absolute -bottom-6 -right-6 -z-10 h-[250px] w-[250px] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl opacity-70" />
                <div className="absolute -top-6 -left-6 -z-10 h-[250px] w-[250px] rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 blur-3xl opacity-70" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section - რატომ MyPen */}
        <section id="features" className="w-full py-20 md:py-24">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Why Retoro</h2>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto mb-4"
            >
              {features.map((feature, i) => (
                <motion.div key={i} variants={item} className="flex flex-col items-center text-center">
                  <div className={`size-14 rounded-full ${feature.iconBg} flex items-center justify-center mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-[30ch]">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative mb-10">
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 z-0" />

              {[
                {
                  step: "01",
                  title: "Add Purchase",
                  description: "Manual entry or scan your receipt for instant tracking.",
                },
                {
                  step: "02",
                  title: "We Calculate Deadline",
                  description: "Based on retailer policy, we set your return window.",
                },
                {
                  step: "03",
                  title: "Get Timely Reminders",
                  description: "Smart notifications at 7 days, 2 days, and deadline day.",
                },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative z-10 flex flex-col items-center text-center space-y-4"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xl font-bold shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center pt-2"
            >
              <Button
                size="lg"
                className="rounded-full h-12 px-8 text-base transition-all hover:scale-105 hover:shadow-lg"
                asChild
              >
                <SmartCtaLink aria-label="Start Tracking Free" data-cta-id="cta_how_it_works">
                  Start Tracking Free
                  <ArrowRight className="ml-2 size-4" />
                </SmartCtaLink>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]" />

          <div className="container px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium flex items-center gap-2" variant="secondary">
                <Users className="size-4" />
                Join 10,000+ Smart Shoppers
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Real Results from Real Users</h2>
              <p className="max-w-[65ch] text-muted-foreground md:text-lg mx-auto">
                See how Retoro helps shoppers save money and never miss a return deadline.
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {[
                {
                  quote: "Saved me $450 last month! I was tracking 8 items and returned 5 just in time. This app literally pays for itself.",
                  author: "Sarah M.",
                  role: "Online Shopper",
                  savings: "$450",
                  rating: 5,
                },
                {
                  quote: "Receipt scanning works perfectly. Just snap and forget - Retoro handles the rest. No more manual entry!",
                  author: "Mike R.",
                  role: "Tech Enthusiast",
                  savings: "$280",
                  rating: 5,
                },
                {
                  quote: "The deadline reminders are genius. I used to lose track of return windows, but now I never miss one. Game changer!",
                  author: "Emma L.",
                  role: "Busy Professional",
                  savings: "$320",
                  rating: 5,
                },
              ].map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                  <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Savings badge */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex">
                          {Array(t.rating).fill(0).map((_, j) => (
                            <Star key={j} className="size-4 text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                          Saved {t.savings}
                        </Badge>
                      </div>
                      <p className="mb-6 flex-grow leading-relaxed">{t.quote}</p>
                      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/40">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {t.author.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{t.author}</p>
                          <p className="text-sm text-muted-foreground">{t.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Frequently Asked Questions</h2>
              <p className="max-w-[65ch] text-muted-foreground md:text-lg mx-auto">
                Everything you need to know about Retoro's return tracking app.
              </p>
            </motion.div>

            <div className="mx-auto max-w-3xl">
              <Accordion type="multiple" defaultValue={["item-0", "item-1"]} className="w-full">
                {[
                  {
                    question: "Is Retoro really free?",
                    answer:
                      "Yes! Retoro is completely free to use with unlimited purchase tracking, receipt scanning, push notifications, and all core features. No credit card required, no hidden fees, no premium tiers.",
                  },
                  {
                    question: "How does Retoro calculate return deadlines?",
                    answer:
                      "Retoro uses a comprehensive database of retailer return policies. When you add a purchase, we automatically look up the retailer's policy (typically 30, 60, or 90 days) and calculate the exact deadline based on your purchase date. You can also manually adjust deadlines if needed.",
                  },
                  {
                    question: "Which retailers does Retoro support?",
                    answer:
                      "Retoro supports thousands of retailers including Amazon, eBay, Walmart, Target, Best Buy, Zara, H&M, Nike, Apple, and many more. If a retailer isn't in our database, you can manually enter the return policy when adding your purchase.",
                  },
                  {
                    question: "Will I get reminders even if I forget to check the app?",
                    answer:
                      "Absolutely! Retoro sends automatic push notifications at 7 days, 2 days, and on deadline day. You don't need to open the app - we'll remind you exactly when you need to take action. You can customize notification timing in settings.",
                  },
                  {
                    question: "Can I track purchases I made before downloading Retoro?",
                    answer:
                      "Yes! You can add past purchases by manually entering the details or scanning old receipts. As long as the return window hasn't expired, Retoro will track it and send timely reminders. Just enter the original purchase date and we'll calculate the remaining time.",
                  },
                ].map((faq, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                    <AccordionItem value={`item-${i}`} className="border-b border-border/40 py-2">
                      <AccordionTrigger className="text-left font-medium hover:no-underline">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
