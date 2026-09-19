import Navbar from '@/components/ui/Navbar'
import LogoCloud from '@/components/ui/LogoCloud'

export default function PreviewPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      {/* Spacer so content isn't hidden under fixed navbar */}
      <div className="pt-32" />
      <LogoCloud />
    </main>
  )
}
