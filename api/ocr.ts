import Anthropic from '@anthropic-ai/sdk'
import type { VercelRequest, VercelResponse } from '@vercel/node'

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { image, mediaType } = req.body as { image: string; mediaType: string }

  if (!image || !mediaType) {
    return res.status(400).json({ error: 'Falta image o mediaType' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY no configurada en el servidor' })
  }

  try {
    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: image,
              },
            },
            { type: 'text', text: PROMPT },
          ],
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return res.status(422).json({ error: 'No se pudo extraer JSON de la respuesta', raw })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return res.status(200).json(parsed)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return res.status(500).json({ error: msg })
  }
}
