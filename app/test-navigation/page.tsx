import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function TestNavigationPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Navigation Test Page</h1>
          <p className="mb-6">Test all policy page links to ensure they work correctly:</p>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Privacy Policy</h3>
              <Link href="/privacy" className="text-primary hover:underline">
                /privacy - კონფიდენციალურობის პოლიტიკა
              </Link>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Terms of Service</h3>
              <Link href="/terms" className="text-primary hover:underline">
                /terms - მომსახურების პირობები
              </Link>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Refund Policy</h3>
              <Link href="/refund-policy" className="text-primary hover:underline">
                /refund-policy - თანხის დაბრუნების პოლიტიკა
              </Link>
            </div>
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Footer Links Test</h3>
            <p className="text-sm text-muted-foreground">
              Check the footer below to ensure all policy links work correctly with the new URLs.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
