"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Recycle, Upload, Trash2, Leaf, Droplets, AlertCircle, Key, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { classifyWasteImage } from "./actions"

export default function Home() {
  const [image, setImage] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string>("")
  const [showApiKey, setShowApiKey] = useState<boolean>(false)
  const [debugMode, setDebugMode] = useState<boolean>(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Check file size
      if (file.size > 4 * 1024 * 1024) {
        setError("Bild ist zu groß. Maximale Größe ist 4MB.")
        return
      }

      const reader = new FileReader()

      reader.onload = (event) => {
        if (event.target) {
          setImage(event.target.result as string)
          setResult(null)
          setError(null)
        }
      }

      reader.onerror = () => {
        setError("Fehler beim Lesen der Datei. Bitte versuchen Sie es mit einem anderen Bild.")
      }

      reader.readAsDataURL(file)
    }
  }

  const classifyImage = async () => {
    if (!image) {
      setError("Bitte wählen Sie zuerst ein Bild aus")
      return
    }

    if (!apiKey) {
      setError("Bitte geben Sie einen OpenAI API-Schlüssel ein")
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (debugMode) {
        console.log("Sending image to classification service...")
        console.log("API Key format valid:", apiKey.startsWith("sk-"))
        console.log("Image data length:", image.length)
      }

      const response = await classifyWasteImage(image, apiKey)

      if (debugMode) {
        console.log("Classification response:", response)
      }

      if (response.success) {
        setResult(response.category)
      } else {
        setError(response.error || "Ein unbekannter Fehler ist aufgetreten")
      }
    } catch (err: any) {
      console.error("Frontend error:", err)
      setError(`Fehler: ${err.message || "Unbekannter Fehler"}`)
    } finally {
      setLoading(false)
    }
  }

  const getResultIcon = () => {
    switch (result) {
      case "Restmüll":
        return <Trash2 className="h-12 w-12 text-gray-500" />
      case "Papiermüll":
        return <Recycle className="h-12 w-12 text-blue-500" />
      case "Biomüll":
        return <Leaf className="h-12 w-12 text-green-500" />
      case "Verpackungsmüll":
        return <Recycle className="h-12 w-12 text-yellow-500" />
      case "Glasmüll":
        return <Droplets className="h-12 w-12 text-green-500" />
      case "Sondermüll":
        return <AlertCircle className="h-12 w-12 text-red-500" />
      case "Elektroschrott":
        return <Droplets className="h-12 w-12 text-purple-500" />
      default:
        return null
    }
  }

  const getResultDescription = () => {
    switch (result) {
      case "Restmüll":
        return "Dieser Abfall gehört in die schwarze Restmülltonne."
      case "Papiermüll":
        return "Dieser Abfall gehört in die blaue Papiertonne."
      case "Biomüll":
        return "Dieser Abfall gehört in die braune Biotonne."
      case "Verpackungsmüll":
        return "Dieser Abfall gehört in den gelben Sack oder die gelbe Tonne."
      case "Glasmüll":
        return "Dieser Abfall gehört in den Glascontainer (nach Farben sortiert)."
      case "Sondermüll":
        return "Dieser Abfall ist Sondermüll und muss bei einer speziellen Sammelstelle abgegeben werden."
      case "Elektroschrott":
        return "Dieser Abfall ist Elektroschrott und muss beim Wertstoffhof oder bei Händlern abgegeben werden."
      default:
        return ""
    }
  }

  // For testing purposes - simulate classification without API
  const simulateClassification = () => {
    setLoading(true)
    setError(null)

    setTimeout(() => {
      const garbageTypes = [
        "Restmüll",
        "Papiermüll",
        "Biomüll",
        "Verpackungsmüll",
        "Glasmüll",
        "Sondermüll",
        "Elektroschrott",
      ]
      const randomResult = garbageTypes[Math.floor(Math.random() * garbageTypes.length)]
      setResult(randomResult)
      setLoading(false)
    }, 1500)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-green-50 to-blue-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Abfall-Klassifikator</h1>
          <p className="mt-2 text-sm text-gray-600">
            Laden Sie ein Bild Ihres Abfalls hoch und wir sagen Ihnen, wie Sie ihn richtig entsorgen können
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Identifizieren Sie Ihren Abfall</CardTitle>
            <CardDescription>
              Machen Sie ein Foto oder laden Sie ein Bild des Gegenstands hoch, den Sie klassifizieren möchten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center">
                <Label htmlFor="api-key" className="flex items-center gap-2 font-medium">
                  <Key className="h-4 w-4" />
                  OpenAI API-Schlüssel
                </Label>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="ml-auto text-xs text-gray-500 hover:text-gray-700"
                >
                  {showApiKey ? "Verbergen" : "Anzeigen"}
                </button>
              </div>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type={showApiKey ? "text" : "password"}
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Info className="h-3 w-3 mr-1" />
                <span>Benötigt einen API-Schlüssel mit Zugriff auf GPT-4o mit Vision-Funktionen</span>
                <button
                  onClick={() => setDebugMode(!debugMode)}
                  className="ml-auto text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  {debugMode ? "Debug-Modus aus" : "Debug-Modus ein"}
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                {image ? (
                  <Image src={image || "/placeholder.svg"} alt="Hochgeladener Abfall" fill className="object-contain" />
                ) : (
                  <div className="text-center p-6">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Bild hochladen zur Klassifizierung</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <Button
                  onClick={() => document.getElementById("file-upload")?.click()}
                  variant="outline"
                  className="w-full"
                >
                  Bild auswählen
                </Button>
                <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <Button onClick={classifyImage} className="w-full" disabled={!image || loading || !apiKey}>
                  {loading ? "Analysiere..." : "Klassifizieren"}
                </Button>
              </div>

              {/* Demo mode button for testing without API */}
              <Button
                onClick={simulateClassification}
                variant="outline"
                className="w-full text-sm"
                disabled={!image || loading}
              >
                Demo-Modus (ohne API-Schlüssel testen)
              </Button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{error}</div>
            )}
          </CardContent>
          {result && (
            <CardFooter>
              <div className="w-full bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                  {getResultIcon()}
                  <div>
                    <h3 className="font-medium text-lg">{result}</h3>
                    <p className="text-sm text-gray-600">{getResultDescription()}</p>
                  </div>
                </div>
              </div>
            </CardFooter>
          )}
        </Card>

        <div className="w-full mt-6">
          <h3 className="text-lg font-medium mb-3">Deutsche Mülltonnen</h3>
          <div className="grid grid-cols-5 gap-3">
            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto border-2 hover:bg-gray-100"
              onClick={() => setResult("Restmüll")}
            >
              <div className="w-16 h-20 bg-black rounded-t-lg mb-2 flex items-end justify-center">
                <div className="w-12 h-3 bg-gray-700 mb-1 rounded"></div>
              </div>
              <span className="text-xs font-medium">Restmüll</span>
              <span className="text-xs text-gray-500">Schwarz</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto border-2 hover:bg-gray-100"
              onClick={() => setResult("Papiermüll")}
            >
              <div className="w-16 h-20 bg-blue-600 rounded-t-lg mb-2 flex items-end justify-center">
                <div className="w-12 h-3 bg-blue-800 mb-1 rounded"></div>
              </div>
              <span className="text-xs font-medium">Papiermüll</span>
              <span className="text-xs text-gray-500">Blau</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto border-2 hover:bg-gray-100"
              onClick={() => setResult("Biomüll")}
            >
              <div className="w-16 h-20 bg-amber-800 rounded-t-lg mb-2 flex items-end justify-center">
                <div className="w-12 h-3 bg-amber-900 mb-1 rounded"></div>
              </div>
              <span className="text-xs font-medium">Biomüll</span>
              <span className="text-xs text-gray-500">Braun</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto border-2 hover:bg-gray-100"
              onClick={() => setResult("Verpackungsmüll")}
            >
              <div className="w-16 h-20 bg-yellow-400 rounded-t-lg mb-2 flex items-end justify-center">
                <div className="w-12 h-3 bg-yellow-600 mb-1 rounded"></div>
              </div>
              <span className="text-xs font-medium">Verpackung</span>
              <span className="text-xs text-gray-500">Gelb</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto border-2 hover:bg-gray-100"
              onClick={() => setResult("Glasmüll")}
            >
              <div className="w-16 h-20 bg-green-600 rounded-t-lg mb-2 flex items-end justify-center">
                <div className="w-12 h-3 bg-green-800 mb-1 rounded"></div>
              </div>
              <span className="text-xs font-medium">Glasmüll</span>
              <span className="text-xs text-gray-500">Grün</span>
            </Button>
          </div>

          <div className="mt-4 p-4 bg-white rounded-lg border">
            <p className="text-sm text-center text-gray-600">
              Klicken Sie auf eine Tonne, um zu sehen, was hineingehört, oder laden Sie ein Bild hoch zur automatischen
              Klassifizierung
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

