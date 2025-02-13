"use client"

import { useState, useCallback } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Download } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Home() {
  const [url, setUrl] = useState("")
  const [size, setSize] = useState(256)
  const [bgColor, setBgColor] = useState("#FFFFFF")
  const [fgColor, setFgColor] = useState("#1A1A1A")
  const [includeMargin, setIncludeMargin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const validateAndSetUrl = useCallback((input: string) => {
    setUrl(input)
    setError(null)

    if (!input) return

    try {
      new URL(input)
    } catch {
      setError("Please enter a valid URL (e.g., https://example.com)")
    }
  }, [])

  const downloadQRCode = useCallback(async () => {
    if (error || !url) return
    setIsLoading(true)
    
    try {
      const svg = document.getElementById("qr-code")
      if (!svg) throw new Error("QR code not found")

      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        canvas.width = size
        canvas.height = size
        ctx?.drawImage(img, 0, 0)
        
        const pngFile = canvas.toDataURL("image/png")
        const downloadLink = document.createElement("a")
        downloadLink.download = `${url.replace(/[^a-zA-Z0-9]/g, '_')}_qr.png`
        downloadLink.href = pngFile
        downloadLink.click()
        setIsLoading(false)
      }

      img.onerror = () => {
        setError("Failed to generate QR code")
        setIsLoading(false)
      }

      img.src = "data:image/svg+xml;base64," + btoa(svgData)
    } catch (error) {
      setError("Failed to download QR code")
      setIsLoading(false)
    }
  }, [url, size, error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5F7] to-white">
      {/* Header with Emoji Logo */}
      <header className="w-full border-b border-black/5 bg-white/70 backdrop-blur-xl fixed top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-black text-xl bg-clip-text text-transparent bg-gradient-to-r from-[#007BFF] to-[#00C853]">
              SnappyQR
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 pt-32 pb-16">
        <div className="max-w-xl mx-auto space-y-10">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight">
              Create Beautiful QR Codes
            </h1>
            <p className="text-lg text-gray-500">
              Simple. Fast. Stunning.
            </p>
          </div>

          <Card className="backdrop-blur-xl bg-white/70 border border-black/5 shadow-2xl shadow-black/5">
            <CardHeader className="pb-4">
              <CardTitle className="font-bold text-xl text-[#1A1A1A]">QR Code Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* URL Input */}
              <div className="space-y-2">
                <Label htmlFor="url" className="text-sm font-medium text-gray-500">URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="Enter your URL"
                  value={url}
                  onChange={(e) => validateAndSetUrl(e.target.value)}
                  className={cn(
                    "h-12 px-4 bg-white/50 border-black/5 focus:border-[#007BFF] focus:ring-[#007BFF]/20 rounded-xl transition-all duration-200",
                    error && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  )}
                />
                {error && (
                  <p className="text-sm text-red-500 mt-1">{error}</p>
                )}
              </div>

              {/* Size Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium text-gray-500">Size</Label>
                  <span className="text-sm text-gray-400">{size}px</span>
                </div>
                <Slider
                  value={[size]}
                  onValueChange={(value) => setSize(value[0])}
                  min={128}
                  max={512}
                  step={32}
                  className="[&>span]:bg-[#007BFF]"
                />
              </div>

              {/* Color Pickers */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fgColor" className="text-sm font-medium text-gray-500">QR Color</Label>
                  <div className="relative">
                    <Input
                      id="fgColor"
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="h-12 w-full rounded-xl cursor-pointer border-black/5"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bgColor" className="text-sm font-medium text-gray-500">Background</Label>
                  <div className="relative">
                    <Input
                      id="bgColor"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-12 w-full rounded-xl cursor-pointer border-black/5"
                    />
                  </div>
                </div>
              </div>

              {/* Margin Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeMargin"
                  checked={includeMargin}
                  onChange={(e) => setIncludeMargin(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-[#007BFF] rounded-lg border-black/5 focus:ring-[#007BFF]/20"
                />
                <Label htmlFor="includeMargin" className="text-sm font-medium text-gray-500">Include Margin</Label>
              </div>
            </CardContent>

            {/* QR Code Preview & Download */}
            <CardFooter className="flex flex-col items-center space-y-6 pt-6">
              {url && (
                <>
                  <div className="bg-white rounded-2xl p-8 shadow-xl shadow-black/5 border border-black/5">
                    <QRCodeSVG
                      id="qr-code"
                      value={url}
                      size={size}
                      bgColor={bgColor}
                      fgColor={fgColor}
                      includeMargin={includeMargin}
                    />
                  </div>
                  <Button 
                    onClick={downloadQRCode} 
                    disabled={!url || !!error || isLoading}
                    className="h-12 px-6 bg-[#007BFF] hover:bg-[#007BFF]/90 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#007BFF]/20 hover:shadow-xl hover:shadow-[#007BFF]/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </span>
                    ) : (
                      <>
                        <Download className="mr-2 h-5 w-5" />
                        Download QR Code
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}


