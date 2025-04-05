"use server"

import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function classifyWasteImage(imageBase64: string, apiKey: string) {
  try {
    if (!apiKey) {
      return { success: false, error: "Kein API-Schlüssel angegeben" }
    }

    if (!apiKey.startsWith("sk-")) {
      return { success: false, error: "Ungültiges API-Schlüssel-Format. Der Schlüssel sollte mit 'sk-' beginnen." }
    }

    // Remove the data URL prefix if present
    const base64Image = imageBase64.includes("base64,") ? imageBase64.split("base64,")[1] : imageBase64

    if (!base64Image || base64Image.length < 100) {
      return { success: false, error: "Ungültiges Bildformat oder leeres Bild" }
    }

    const prompt = `
      Analyze this image and classify what type of waste it shows according to the German waste classification system.
      
      German waste categories:
      1. Restmüll (Black bin) - General waste that cannot be recycled
      2. Papiermüll (Blue bin) - Paper, cardboard, newspapers, magazines
      3. Biomüll (Brown bin) - Food waste, garden waste, organic materials
      4. Verpackungsmüll (Yellow bin) - Packaging materials, plastics, metals, composite materials
      5. Glasmüll (Glass containers) - Glass bottles and jars
      6. Sondermüll - Hazardous waste like batteries, chemicals, paint
      7. Elektroschrott - Electronic waste, appliances, devices
      
      Return ONLY the category name in German (e.g., "Restmüll", "Papiermüll", etc.) without any additional text or explanation.
    `

    try {
      console.log("Using model: gpt-4o with vision capabilities")

      const { text } = await generateText({
        model: openai('gpt-4o'),
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image',
                image: base64Image
              }
            ]
          }
        ],
        temperature: 0.2, // Niedrigere Temperatur für konsistentere Antworten
      });

      console.log("Raw response from model:", text)

      // Clean up the response to ensure we get just the category
      const category = text.trim()

      // Validate that the response is one of our expected categories
      const validCategories = [
        "Restmüll",
        "Papiermüll",
        "Biomüll",
        "Verpackungsmüll",
        "Glasmüll",
        "Sondermüll",
        "Elektroschrott",
      ]

      if (validCategories.includes(category)) {
        return { success: true, category }
      } else {
        console.log("Unexpected category returned:", category)
        // If the model returned something unexpected, default to Restmüll
        return { success: true, category: "Restmüll" }
      }
    } catch (apiError: any) {
      console.error("API Error details:", JSON.stringify(apiError, null, 2))

      // Verbesserte Fehlerbehandlung
      if (apiError.message?.includes("API key")) {
        return { success: false, error: "Ungültiger API-Schlüssel oder keine Berechtigung" }
      }

      if (apiError.message?.includes("vision") || apiError.message?.includes("image")) {
        return {
          success: false,
          error:
            "Ihr API-Schlüssel hat keinen Zugriff auf Vision-Funktionen oder es gibt ein Problem mit dem Bildformat",
        }
      }

      if (apiError.message?.includes("rate limit")) {
        return { success: false, error: "API-Ratenlimit erreicht. Bitte versuchen Sie es später erneut." }
      }

      if (apiError.message?.includes("billing")) {
        return {
          success: false,
          error: "Abrechnungsproblem mit dem API-Schlüssel. Bitte überprüfen Sie Ihr OpenAI-Konto.",
        }
      }

      if (apiError.message?.includes("model")) {
        return {
          success: false,
          error:
            "Ihr API-Schlüssel hat keinen Zugriff auf GPT-4V. Bitte verwenden Sie einen Schlüssel mit GPT-4V-Zugriff.",
        }
      }

      return { success: false, error: `API-Fehler: ${apiError.message || "Unbekannter Fehler"}` }
    }
  } catch (error: any) {
    console.error("Error classifying waste image:", error)
    return {
      success: false,
      error: `Fehler bei der Klassifizierung: ${error.message || "Unbekannter Fehler"}`,
    }
  }
}

