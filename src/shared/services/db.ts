import { getSupabase } from './supabase'
import type { Purchase, PurchaseItem } from '@/modules/purchases/types'
import type { Supplier } from '@/modules/suppliers/types'
import type { Ingredient, PricePoint } from '@/modules/ingredients/types'
import type { StockMovement, StockLevel } from '@/modules/inventory/types'
import type { Recipe } from '@/modules/recipes/types'
import type { FinanceEntry } from '@/modules/finance/types'
import type { GastronomicEvent } from '@/modules/events/types'
import type { Presupuesto } from '@/modules/presupuesto/types'
import type { ProductionWeek } from '@/modules/produccion/types'

// ─── Generic error handler ─────────────────────────────────────────────────────
function handle<T>(data: T | null, error: { message: string; code?: string } | null): T {
  if (error) {
    console.error('[Supabase error]', error.code, error.message)
    throw new Error(error.message)
  }
  return data as T
}

// ─── Row mappers (DB → App) ────────────────────────────────────────────────────
const toPurchase = (r: Record<string, unknown>): Purchase => ({
  id: r.id as string,
  supplierId: (r.supplier_id as string) ?? '',
  supplierName: (r.supplier_name as string) ?? '',
  type: (r.type as Purchase['type']) ?? 'factura_b',
  number: (r.number as string) ?? '',
  date: (r.date as string) ?? '',
  items: (r.items as PurchaseItem[]) ?? [],
  subtotal: Number(r.subtotal) || 0,
  taxRate: Number(r.tax_rate) || 21,
  taxes: Number(r.taxes) || 0,
  total: Number(r.total) || 0,
  notes: (r.notes as string) ?? '',
  status: (r.status as Purchase['status']) ?? 'confirmed',
  createdAt: (r.created_at as string) ?? new Date().toISOString(),
})

const toPurchaseRow = (p: Purchase) => ({
  id: p.id,
  supplier_id: p.supplierId || null,
  supplier_name: p.supplierName,
  type: p.type,
  number: p.number,
  date: p.date,
  items: p.items,
  subtotal: p.subtotal,
  tax_rate: p.taxRate,
  taxes: p.taxes,
  total: p.total,
  notes: p.notes,
  status: p.status,
})

const toSupplier = (r: Record<string, unknown>): Supplier => ({
  id: r.id as string,
  businessName: (r.business_name as string) ?? '',
  tradeName: (r.trade_name as string) ?? '',
  cuit: (r.cuit as string) ?? '',
  phone: (r.phone as string) ?? '',
  email: (r.email as string) ?? '',
  address: (r.address as string) ?? '',
  notes: (r.notes as string) ?? '',
  createdAt: (r.created_at as string) ?? new Date().toISOString(),
})

const toSupplierRow = (s: Supplier) => ({
  id: s.id,
  business_name: s.businessName,
  trade_name: s.tradeName,
  cuit: s.cuit,
  phone: s.phone,
  email: s.email,
  address: s.address,
  notes: s.notes,
})

const toIngredient = (r: Record<string, unknown>): Ingredient => ({
  id: r.id as string,
  name: r.name as string,
  category: r.category as Ingredient['category'],
  purchaseUnit: (r.purchase_unit as string) ?? 'kg',
  useUnit: (r.use_unit as string) ?? 'kg',
  conversionFactor: Number(r.conversion_factor) || 1,
  currentCost: Number(r.current_cost) || 0,
  minStock: Number(r.min_stock) || 0,
  defaultSupplierId: (r.default_supplier_id as string) || undefined,
  notes: (r.notes as string) ?? '',
  priceHistory: (r.price_history as PricePoint[]) ?? [],
  createdAt: (r.created_at as string) ?? new Date().toISOString(),
})

const toIngredientRow = (i: Ingredient) => ({
  id: i.id,
  name: i.name,
  category: i.category,
  purchase_unit: i.purchaseUnit,
  use_unit: i.useUnit,
  conversion_factor: i.conversionFactor,
  current_cost: i.currentCost,
  min_stock: i.minStock,
  default_supplier_id: i.defaultSupplierId || null,
  notes: i.notes,
  price_history: i.priceHistory,
})

const toMovement = (r: Record<string, unknown>): StockMovement => ({
  id: r.id as string,
  ingredientId: r.ingredient_id as string,
  ingredientName: (r.ingredient_name as string) ?? '',
  type: r.type as StockMovement['type'],
  quantity: Number(r.quantity),
  unit: (r.unit as string) ?? 'kg',
  date: (r.date as string) ?? '',
  notes: (r.notes as string) ?? '',
  purchaseId: (r.purchase_id as string) || undefined,
  createdAt: (r.created_at as string) ?? new Date().toISOString(),
})

const toStockLevel = (r: Record<string, unknown>): StockLevel => ({
  ingredientId: r.ingredient_id as string,
  ingredientName: (r.ingredient_name as string) ?? '',
  currentStock: Number(r.current_stock) || 0,
  unit: (r.unit as string) ?? 'kg',
  minStock: Number(r.min_stock) || 0,
  lastUpdated: (r.last_updated as string) ?? new Date().toISOString(),
})

// ─── DB SERVICE ───────────────────────────────────────────────────────────────
export const db = {

  purchases: {
    getAll: async (): Promise<Purchase[]> => {
      const { data, error } = await getSupabase()
        .from('purchases').select('*').order('created_at', { ascending: false })
      return handle(data, error)?.map(toPurchase) ?? []
    },
    upsert: async (p: Purchase): Promise<void> => {
      const { error } = await getSupabase()
        .from('purchases')
        .upsert(toPurchaseRow(p), { onConflict: 'id' })
      handle(null, error)
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await getSupabase().from('purchases').delete().eq('id', id)
      handle(null, error)
    },
  },

  suppliers: {
    getAll: async (): Promise<Supplier[]> => {
      const { data, error } = await getSupabase()
        .from('suppliers').select('*').order('business_name')
      return handle(data, error)?.map(toSupplier) ?? []
    },
    upsert: async (s: Supplier): Promise<void> => {
      const { error } = await getSupabase()
        .from('suppliers')
        .upsert(toSupplierRow(s), { onConflict: 'id' })
      handle(null, error)
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await getSupabase().from('suppliers').delete().eq('id', id)
      handle(null, error)
    },
  },

  ingredients: {
    getAll: async (): Promise<Ingredient[]> => {
      const { data, error } = await getSupabase()
        .from('ingredients').select('*').order('name')
      return handle(data, error)?.map(toIngredient) ?? []
    },
    upsert: async (i: Ingredient): Promise<void> => {
      const { error } = await getSupabase()
        .from('ingredients')
        .upsert(toIngredientRow(i), { onConflict: 'id' })
      handle(null, error)
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await getSupabase().from('ingredients').delete().eq('id', id)
      handle(null, error)
    },
  },

  inventory: {
    getMovements: async (): Promise<StockMovement[]> => {
      const { data, error } = await getSupabase()
        .from('inventory_movements').select('*').order('created_at', { ascending: false })
      return handle(data, error)?.map(toMovement) ?? []
    },
    getStockLevels: async (): Promise<StockLevel[]> => {
      const { data, error } = await getSupabase().from('stock_levels').select('*')
      return handle(data, error)?.map(toStockLevel) ?? []
    },
    upsertMovement: async (m: StockMovement): Promise<void> => {
      const { error } = await getSupabase().from('inventory_movements').upsert({
        id: m.id,
        ingredient_id: m.ingredientId,
        ingredient_name: m.ingredientName,
        type: m.type,
        quantity: m.quantity,
        unit: m.unit,
        date: m.date,
        notes: m.notes,
        purchase_id: m.purchaseId || null,
      }, { onConflict: 'id' })
      handle(null, error)
    },
    upsertStockLevel: async (sl: StockLevel): Promise<void> => {
      const { error } = await getSupabase().from('stock_levels').upsert({
        ingredient_id: sl.ingredientId,
        ingredient_name: sl.ingredientName,
        current_stock: sl.currentStock,
        unit: sl.unit,
        min_stock: sl.minStock,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'ingredient_id' })
      handle(null, error)
    },
  },

  recipes: {
    getAll: async (): Promise<Recipe[]> => {
      const { data, error } = await getSupabase()
        .from('recipes').select('*').order('name')
      return handle(data, error)?.map((r) => ({
        id: r.id, name: r.name, category: r.category, portions: r.portions,
        ingredients: r.ingredients ?? [], totalCost: Number(r.total_cost),
        costPerPortion: Number(r.cost_per_portion), sellingPrice: Number(r.selling_price),
        margin: Number(r.margin), foodCostPercentage: Number(r.food_cost_percentage),
        notes: r.notes ?? '', createdAt: r.created_at,
      })) ?? []
    },
    upsert: async (r: Recipe): Promise<void> => {
      const { error } = await getSupabase().from('recipes').upsert({
        id: r.id, name: r.name, category: r.category, portions: r.portions,
        ingredients: r.ingredients, total_cost: r.totalCost,
        cost_per_portion: r.costPerPortion, selling_price: r.sellingPrice,
        margin: r.margin, food_cost_percentage: r.foodCostPercentage, notes: r.notes,
      }, { onConflict: 'id' })
      handle(null, error)
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await getSupabase().from('recipes').delete().eq('id', id)
      handle(null, error)
    },
  },

  finance: {
    getAll: async (): Promise<FinanceEntry[]> => {
      const { data, error } = await getSupabase()
        .from('finance_entries').select('*').order('date', { ascending: false })
      return handle(data, error)?.map((r) => ({
        id: r.id, type: r.type, category: r.category, description: r.description,
        amount: Number(r.amount), date: r.date, notes: r.notes ?? '', createdAt: r.created_at,
      })) ?? []
    },
    upsert: async (e: FinanceEntry): Promise<void> => {
      const { error } = await getSupabase().from('finance_entries').upsert({
        id: e.id, type: e.type, category: e.category,
        description: e.description, amount: e.amount, date: e.date, notes: e.notes,
      }, { onConflict: 'id' })
      handle(null, error)
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await getSupabase().from('finance_entries').delete().eq('id', id)
      handle(null, error)
    },
  },

  events: {
    getAll: async (): Promise<GastronomicEvent[]> => {
      const { data, error } = await getSupabase()
        .from('events').select('*').order('created_at', { ascending: false })
      return handle(data, error)?.map((r) => ({
        id: r.id, name: r.name, clientName: r.client_name ?? '', date: r.date ?? '',
        people: r.people, menuItems: r.menu_items ?? [], status: r.status,
        venue: r.venue ?? '', notes: r.notes ?? '', totalCost: Number(r.total_cost),
        sellingPrice: Number(r.selling_price), margin: Number(r.margin), createdAt: r.created_at,
      })) ?? []
    },
    upsert: async (e: GastronomicEvent): Promise<void> => {
      const { error } = await getSupabase().from('events').upsert({
        id: e.id, name: e.name, client_name: e.clientName,
        date: e.date || null, people: e.people, menu_items: e.menuItems,
        status: e.status, venue: e.venue, notes: e.notes,
        total_cost: e.totalCost, selling_price: e.sellingPrice, margin: e.margin,
      }, { onConflict: 'id' })
      handle(null, error)
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await getSupabase().from('events').delete().eq('id', id)
      handle(null, error)
    },
  },

  presupuestos: {
    getAll: async (): Promise<Presupuesto[]> => {
      const { data, error } = await getSupabase()
        .from('presupuestos').select('*').order('created_at', { ascending: false })
      return handle(data, error)?.map((r) => ({
        id: r.id, number: r.number, clientName: r.client_name ?? '',
        clientPhone: r.client_phone ?? '', clientEmail: r.client_email ?? '',
        eventType: r.event_type, eventDate: r.event_date ?? '', venue: r.venue ?? '',
        people: r.people, lines: r.lines ?? [], markupPercent: Number(r.markup_percent),
        subtotal: Number(r.subtotal), markupAmount: Number(r.markup_amount),
        total: Number(r.total), notes: r.notes ?? '', status: r.status,
        validUntil: r.valid_until ?? '', createdAt: r.created_at,
      })) ?? []
    },
    upsert: async (p: Presupuesto): Promise<void> => {
      const { error } = await getSupabase().from('presupuestos').upsert({
        id: p.id, number: p.number, client_name: p.clientName,
        client_phone: p.clientPhone, client_email: p.clientEmail,
        event_type: p.eventType, event_date: p.eventDate || null, venue: p.venue,
        people: p.people, lines: p.lines, markup_percent: p.markupPercent,
        subtotal: p.subtotal, markup_amount: p.markupAmount, total: p.total,
        notes: p.notes, status: p.status, valid_until: p.validUntil || null,
      }, { onConflict: 'id' })
      handle(null, error)
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await getSupabase().from('presupuestos').delete().eq('id', id)
      handle(null, error)
    },
  },

  produccion: {
    getAll: async (): Promise<ProductionWeek[]> => {
      const { data, error } = await getSupabase()
        .from('produccion_weeks').select('*').order('week_start', { ascending: false })
      return handle(data, error)?.map((r) => ({
        id: r.id, weekStart: r.week_start, weekLabel: r.week_label,
        days: r.days ?? [], createdAt: r.created_at,
      })) ?? []
    },
    upsert: async (w: ProductionWeek): Promise<void> => {
      const { error } = await getSupabase().from('produccion_weeks').upsert({
        id: w.id, week_start: w.weekStart, week_label: w.weekLabel, days: w.days,
      }, { onConflict: 'id' })
      handle(null, error)
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await getSupabase().from('produccion_weeks').delete().eq('id', id)
      handle(null, error)
    },
  },
}
