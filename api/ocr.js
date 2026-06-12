const PROMPT = `Analizá esta imagen de una factura, boleta, ticket o remito argentino.
Extraé los datos y respondé ÚNICAMENTE con un JSON válido con esta estructura exacta (sin texto adicional):

{
  "supplierName": "razón social o nombre del proveedor",
  "cuit": "XX-XXXXXXXX-X o vacío si no se ve",
  "date": "YYYY-MM-DD o vacío si no se ve",
  "type": "factura_a | factura_b | factura_c | ticket | remito | recibo",
  "number": "número de comprobante como string, ej: 0001-00000123",
  "taxRate": 21,
  "subtotal": 0.00,
  "taxes": 0.00,
  "total": 0.00,
  "items": [
    {
      "name": "descripción del producto",
      "quantity": 1,
      "unit": "kg | g | L | ml | unidad | caja | bolsa | docena",
      "unitPrice": 0.00
    }
  ]
}

Reglas:
- Los montos van sin símbolo $ y usan punto decimal (ej: 1500.50)
- Si no podés determinar un campo, usá "" para strings y 0 para números
- El type debe ser uno de los valores exactos listados
- Para la fecha usá formato YYYY-MM-DD
- Si no hay detalle de items, igualmente incluí el array vacío []
- Solo respondé el JSON, nada más`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY no configurada en el servidor' })
  }

  const { image, mediaType } = req.body
  if (!image || !mediaType) {
    return res.status(400).json({ error: 'Falta image o mediaType' })
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mediaType,
                    data: image,
                  },
                },
                { text: PROMPT },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    const json = await response.json()

    if (!response.ok) {
      return res.status(502).json({ error: json.error?.message ?? 'Error de la API de Gemini' })
    }

    const raw = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) {
      return res.status(422).json({ error: 'Gemini no devolvió JSON válido', raw })
    }

    return res.status(200).json(JSON.parse(match[0]))
  } catch (err) {
    return res.status(500).json({ error: err.message ?? 'Error desconocido' })
  }
}
