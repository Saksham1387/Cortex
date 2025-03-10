import { Button } from "@/components/ui/button"

export function QuickLinks() {
  const links = ["Outfit inspo for", "Find me some", "Shop from the show", "Show reviews on", "Send me a text when 🔒"]

  return (
    <div className="flex flex-wrap gap-2 mt-6 justify-center">
      {links.map((link, index) => (
        <Button key={index} variant="outline" className="rounded-full text-sm text-gray-500 bg-[#f2f4f6] border-none">
          {link}
        </Button>
      ))}
    </div>
  )
}

