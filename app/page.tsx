"use client"

import React, { useState, useCallback, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Download } from "lucide-react"
import Image from 'next/image'

// Add content type enum
enum QRContentType {
  TEXT = 'text',
  WIFI = 'wifi',
  VCARD = 'vcard',
  CALENDAR = 'calendar',
  PAYMENT = 'payment',
  SOCIAL = 'social',
  MEDIA = 'media'
}

// Add these interfaces
interface WifiCredentials {
  ssid: string;
  password: string;
  encryption: 'WEP' | 'WPA' | 'nopass';
  hidden: boolean;
}

interface VCardContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization?: string;
  title?: string;
}

interface CalendarEvent {
  title: string;
  startDate: string;
  endDate: string;
  description?: string;
  location?: string;
}

interface PaymentInfo {
  paymentType: string;
  address: string;
  amount: string;
  message: string;
}

interface SocialProfile {
  platform: string;
  username: string;
}

// Add new interface for media data
interface MediaData {
  file: File | null;
  preview: string;
  uploadStatus: 'idle' | 'uploading' | 'done' | 'error';
  url: string;
}

export default function Home() {
  const [url, setUrl] = useState("")
  const [size, setSize] = useState(256)
  const [bgColor, setBgColor] = useState("#FFFFFF")
  const [fgColor, setFgColor] = useState("#1A1A1A")
  const [includeMargin, setIncludeMargin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [contentType, setContentType] = useState<QRContentType>(QRContentType.TEXT)
  const [wifiData, setWifiData] = useState<WifiCredentials>({
    ssid: '',
    password: '',
    encryption: 'WPA',
    hidden: false
  });
  const [vCardData, setVCardData] = useState<VCardContact>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    title: ''
  });
  const [calendarData, setCalendarData] = useState<CalendarEvent>({
    title: '',
    startDate: '',
    endDate: '',
    description: '',
    location: ''
  });
  const [paymentData, setPaymentData] = useState<PaymentInfo>({
    paymentType: 'PayPal',
    address: '',
    amount: '',
    message: ''
  });
  const [socialData, setSocialData] = useState<SocialProfile>({
    platform: 'Twitter',
    username: ''
  });
  const [mediaData, setMediaData] = useState<MediaData>({
    file: null,
    preview: '',
    uploadStatus: 'idle',
    url: ''
  });
  const [uploadError, setUploadError] = useState<string | null>(null);

  const downloadQRCode = useCallback(async () => {
    if (!isMounted) return // Early return if not mounted
    
    if (error || !url) return
    setIsLoading(true)
    
    try {
      if (typeof window === 'undefined') return // Check for browser environment
      
      const svg = document.getElementById("qr-code")
      if (!svg) throw new Error("QR code not found")

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Could not get canvas context")

      const img = document.createElement('img') as HTMLImageElement
      
      img.onload = () => {
        canvas.width = size
        canvas.height = size
        ctx.drawImage(img, 0, 0, size, size)
        
        try {
          const dataUrl = canvas.toDataURL("image/png")
          const link = document.createElement("a")
          link.download = "qr-code.png"
          link.href = dataUrl
          link.click()
        } catch (err) {
          console.error('Download error:', err)
          setError('Failed to download QR code')
        } finally {
          setIsLoading(false)
        }
      }

      img.src = `data:image/svg+xml;base64,${btoa(new XMLSerializer().serializeToString(svg))}`
    } catch (error) {
      console.error('Download error:', error)
      setError('Failed to download QR code')
      setIsLoading(false)
    }
  }, [error, url, size, isMounted])

  // Add useEffect for mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const validateAndSetUrl = useCallback((input: string) => {
    setUrl(input)
    setError(null)
  }, [])

  // Format functions for each content type
  const formatWifiString = (data: WifiCredentials) => {
    return `WIFI:T:${data.encryption};S:${data.ssid};P:${data.password};H:${data.hidden ? 'true' : 'false'};;`;
  };

  const formatVCardString = (data: VCardContact) => {
    return `BEGIN:VCARD
VERSION:3.0
FN:${data.firstName} ${data.lastName}
N:${data.lastName};${data.firstName};;;
${data.organization ? `ORG:${data.organization}\n` : ''}
${data.title ? `TITLE:${data.title}\n` : ''}
TEL:${data.phone}
EMAIL:${data.email}
END:VCARD`;
  };

  const formatCalendarString = (data: CalendarEvent) => {
    return `BEGIN:VEVENT
SUMMARY:${data.title}
DTSTART:${data.startDate.replace(/[-:]/g, '')}
DTEND:${data.endDate.replace(/[-:]/g, '')}
${data.description ? `DESCRIPTION:${data.description}\n` : ''}
${data.location ? `LOCATION:${data.location}\n` : ''}
END:VEVENT`;
  };

  const formatPaymentString = (data: PaymentInfo) => {
    return `${data.paymentType}:${data.address}?amount=${data.amount}&message=${encodeURIComponent(data.message)}`;
  };

  const formatSocialString = (data: SocialProfile) => {
    return `${data.platform.toLowerCase()}:${data.username}`;
  };

  // Get QR code value based on content type
  const getQRValue = () => {
    switch (contentType) {
      case QRContentType.WIFI:
        return formatWifiString(wifiData);
      case QRContentType.VCARD:
        return formatVCardString(vCardData);
      case QRContentType.CALENDAR:
        return formatCalendarString(calendarData);
      case QRContentType.PAYMENT:
        return formatPaymentString(paymentData);
      case QRContentType.SOCIAL:
        return formatSocialString(socialData);
      case QRContentType.MEDIA:
        return mediaData.url;
      default:
        return url;
    }
  };

  // Add this function to check if the current content type has valid data
  const hasValidData = () => {
    switch (contentType) {
      case QRContentType.TEXT:
        return url.length > 0;
      case QRContentType.WIFI:
        return wifiData.ssid.length > 0;
      case QRContentType.VCARD:
        return vCardData.firstName.length > 0 || vCardData.lastName.length > 0;
      case QRContentType.CALENDAR:
        return calendarData.title.length > 0;
      case QRContentType.PAYMENT:
        return paymentData.address.length > 0;
      case QRContentType.SOCIAL:
        return socialData.username.length > 0;
      case QRContentType.MEDIA:
        return mediaData.url.length > 0;
      default:
        return false;
    }
  };

  // Update the handleMediaUpload function
  const handleMediaUpload = async (file: File) => {
    try {
      setUploadError(null);
      setMediaData(prev => ({ ...prev, file, uploadStatus: 'uploading' }));
      
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      const previewUrl = URL.createObjectURL(file);
      setMediaData(prev => ({ ...prev, preview: previewUrl }));

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/blob-upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const { url } = await response.json();

      setMediaData(prev => ({
        ...prev,
        uploadStatus: 'done',
        url
      }));

    } catch (error) {
      console.error('Upload error:', error);
      setMediaData(prev => ({ 
        ...prev, 
        uploadStatus: 'error',
        preview: '' 
      }));
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  // Don't render anything until mounted
  if (!isMounted) {
    return null
  }

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
        <div className="max-w-xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight">
              Create Beautiful QR Codes
            </h1>
            <p className="text-lg text-gray-500">
              Generate QR codes for any text or link
            </p>
          </div>

          <Card className="backdrop-blur-xl bg-white/70 border border-black/5 shadow-2xl shadow-black/5">
            <CardHeader className="pb-4">
              <CardTitle className="font-bold text-xl text-[#1A1A1A]">QR Code Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add content type selector */}
              <div className="space-y-2">
                <Label htmlFor="contentType" className="text-sm font-medium text-gray-500">Content Type</Label>
                <select
                  id="contentType"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as QRContentType)}
                  className="w-full h-12 px-4 bg-white/50 border-black/5 rounded-xl"
                >
                  <option value={QRContentType.TEXT}>Text</option>
                  <option value={QRContentType.WIFI}>WiFi</option>
                  <option value={QRContentType.VCARD}>Contact (vCard)</option>
                  <option value={QRContentType.CALENDAR}>Calendar Event</option>
                  <option value={QRContentType.PAYMENT}>Payment</option>
                  <option value={QRContentType.SOCIAL}>Social Profile</option>
                  <option value={QRContentType.MEDIA}>Media</option>
                </select>
              </div>

              {/* Render different input fields based on content type */}
              {contentType === QRContentType.TEXT && (
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-sm font-medium text-gray-500">Text or URL</Label>
                  <Input
                    id="url"
                    type="text"
                    placeholder="Enter text or URL"
                    value={url}
                    onChange={(e) => validateAndSetUrl(e.target.value)}
                    className="h-12 px-4 bg-white/50 border-black/5 focus:border-[#007BFF] focus:ring-[#007BFF]/20 rounded-xl transition-all duration-200"
                  />
                </div>
              )}

              {contentType === QRContentType.WIFI && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ssid">Network Name (SSID)</Label>
                    <Input
                      id="ssid"
                      value={wifiData.ssid}
                      onChange={(e) => setWifiData({...wifiData, ssid: e.target.value})}
                      placeholder="Enter network name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={wifiData.password}
                      onChange={(e) => setWifiData({...wifiData, password: e.target.value})}
                      placeholder="Enter network password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="encryption">Encryption</Label>
                    <select
                      id="encryption"
                      value={wifiData.encryption}
                      onChange={(e) => setWifiData({...wifiData, encryption: e.target.value as 'WEP' | 'WPA' | 'nopass'})}
                      className="w-full h-12 px-4 bg-white/50 border-black/5 rounded-xl"
                    >
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">No Encryption</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hidden"
                      checked={wifiData.hidden}
                      onChange={(e) => setWifiData({...wifiData, hidden: e.target.checked})}
                      className="form-checkbox"
                    />
                    <Label htmlFor="hidden">Hidden Network</Label>
                  </div>
                </div>
              )}

              {contentType === QRContentType.VCARD && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={vCardData.firstName}
                        onChange={(e) => setVCardData({...vCardData, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={vCardData.lastName}
                        onChange={(e) => setVCardData({...vCardData, lastName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={vCardData.email}
                      onChange={(e) => setVCardData({...vCardData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={vCardData.phone}
                      onChange={(e) => setVCardData({...vCardData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization (Optional)</Label>
                    <Input
                      id="organization"
                      value={vCardData.organization}
                      onChange={(e) => setVCardData({...vCardData, organization: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title (Optional)</Label>
                    <Input
                      id="title"
                      value={vCardData.title}
                      onChange={(e) => setVCardData({...vCardData, title: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {contentType === QRContentType.CALENDAR && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventTitle">Event Title</Label>
                    <Input
                      id="eventTitle"
                      value={calendarData.title}
                      onChange={(e) => setCalendarData({...calendarData, title: e.target.value})}
                      placeholder="Enter event title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date & Time</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={calendarData.startDate}
                      onChange={(e) => setCalendarData({...calendarData, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date & Time</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={calendarData.endDate}
                      onChange={(e) => setCalendarData({...calendarData, endDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventDescription">Description (Optional)</Label>
                    <Input
                      id="eventDescription"
                      value={calendarData.description}
                      onChange={(e) => setCalendarData({...calendarData, description: e.target.value})}
                      placeholder="Enter event description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventLocation">Location (Optional)</Label>
                    <Input
                      id="eventLocation"
                      value={calendarData.location}
                      onChange={(e) => setCalendarData({...calendarData, location: e.target.value})}
                      placeholder="Enter event location"
                    />
                  </div>
                </div>
              )}

              {contentType === QRContentType.PAYMENT && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentType">Payment Type</Label>
                    <select
                      id="paymentType"
                      value={paymentData.paymentType}
                      onChange={(e) => setPaymentData({...paymentData, paymentType: e.target.value})}
                      className="w-full h-12 px-4 bg-white/50 border-black/5 rounded-xl"
                    >
                      <option value="PayPal">PayPal</option>
                      <option value="Bitcoin">Bitcoin</option>
                      <option value="Ethereum">Ethereum</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentAddress">Payment Address</Label>
                    <Input
                      id="paymentAddress"
                      value={paymentData.address}
                      onChange={(e) => setPaymentData({...paymentData, address: e.target.value})}
                      placeholder="Enter payment address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMessage">Message (Optional)</Label>
                    <Input
                      id="paymentMessage"
                      value={paymentData.message}
                      onChange={(e) => setPaymentData({...paymentData, message: e.target.value})}
                      placeholder="Enter payment message or reference"
                    />
                  </div>
                </div>
              )}

              {contentType === QRContentType.SOCIAL && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform">Social Platform</Label>
                    <select
                      id="platform"
                      value={socialData.platform}
                      onChange={(e) => setSocialData({...socialData, platform: e.target.value})}
                      className="w-full h-12 px-4 bg-white/50 border-black/5 rounded-xl"
                    >
                      <option value="Twitter">Twitter</option>
                      <option value="Instagram">Instagram</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Facebook">Facebook</option>
                      <option value="TikTok">TikTok</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={socialData.username}
                      onChange={(e) => setSocialData({...socialData, username: e.target.value})}
                      placeholder="Enter username (without @)"
                    />
                  </div>
                </div>
              )}

              {contentType === QRContentType.MEDIA && (
                <div className="space-y-4">
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    mediaData.uploadStatus === 'uploading' ? 'border-blue-300 bg-blue-50' : 
                    mediaData.uploadStatus === 'done' ? 'border-green-300 bg-green-50' : 
                    'border-gray-300'
                  }`}>
                    <input
                      type="file"
                      id="media-upload"
                      className="hidden"
                      accept="image/jpeg,image/png,image/gif"
                      disabled={mediaData.uploadStatus === 'uploading'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleMediaUpload(file);
                        }
                      }}
                    />
                    <label
                      htmlFor="media-upload"
                      className={`cursor-pointer block ${mediaData.uploadStatus === 'uploading' ? 'pointer-events-none' : ''}`}
                    >
                      {mediaData.preview ? (
                        <div className="space-y-4 relative">
                          <Image
                            src={mediaData.preview}
                            alt="Preview"
                            width={192}
                            height={192}
                            className="max-h-48 mx-auto rounded-lg object-contain"
                          />
                          {mediaData.uploadStatus === 'uploading' && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg">
                              <div className="bg-white/90 px-4 py-2 rounded-full flex items-center space-x-2">
                                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-sm font-medium">Uploading...</span>
                              </div>
                            </div>
                          )}
                          {mediaData.uploadStatus !== 'uploading' && (
                            <p className="text-sm text-gray-500">Click to change media</p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </div>
                          <div className="text-gray-600">
                            <span className="text-blue-500 hover:text-blue-600">
                              Click to upload
                            </span>
                            {" "}or drag and drop
                          </div>
                          <p className="text-xs text-gray-500">
                            JPEG, PNG, GIF up to 10MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>

                  {uploadError && (
                    <div className="text-center text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                      {uploadError}
                    </div>
                  )}

                  {mediaData.uploadStatus === 'done' && (
                    <div className="text-center text-sm text-green-500 bg-green-50 p-3 rounded-lg">
                      Upload complete! QR code will link to your media.
                    </div>
                  )}
                </div>
              )}

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
              {/* Only check hasValidData() instead of url */}
              {hasValidData() && (
                <>
                  <div className="bg-white rounded-2xl p-8 shadow-xl shadow-black/5 border border-black/5">
                    <QRCodeSVG
                      id="qr-code"
                      value={getQRValue()}
                      size={size}
                      bgColor={bgColor}
                      fgColor={fgColor}
                      includeMargin={includeMargin}
                    />
                  </div>
                  <Button 
                    onClick={downloadQRCode} 
                    disabled={!hasValidData() || !!error || isLoading}
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


