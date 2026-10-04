import { z } from 'zod'
import type { Op, Group, StepItem } from './types'

export const OpCodeSchema = z.enum([
  'sc', 'hdc', 'dc', 'ch', 'sl_st',
  'co', 'k', 'p', 'k2tog', 'ssk', 'kfb', 'bo',
  'inc', 'dec'
])

export const OpSchema: z.ZodType<Op> = z.object({
  kind: z.literal('op'),
  code: OpCodeSchema,
  n: z.number().int().min(1)
})

export const GroupSchema: z.ZodType<Group> = z.lazy(() =>
  z.object({
    kind: z.literal('group'),
    repeat: z.number().int().min(1),
    items: z.array(StepItemSchema).min(1)
  })
)

export const StepItemSchema: z.ZodType<StepItem> = z.lazy(() =>
  z.union([OpSchema, GroupSchema])
)

export const YarnSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  colorHex: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Invalid hex color'),
  weight: z.string().optional()
})

export const StepViewSchema = z.object({
  camera: z.tuple([z.number(), z.number(), z.number()]).optional(),
  focus: z.enum(['new', 'all']).optional()
})

export const StepSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  raw: z.string(),
  items: z.array(StepItemSchema),
  expectedCount: z.number().int().min(0).optional(),
  yarnId: z.string().optional(),
  note: z.string().optional(),
  view: StepViewSchema.optional(),
  modelRef: z.string().optional()
})

export const PartStartSchema = z.object({
  kind: z.enum(['magic_ring', 'chain', 'cast_on']),
  count: z.number().int().min(0).optional()
})

export const PartSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: z.enum(['round', 'flat']),
  start: PartStartSchema,
  stuffed: z.boolean().optional(),
  steps: z.array(StepSchema).min(1)
})

export const PartPlacementSchema = z.object({
  partId: z.string().min(1),
  position: z.tuple([z.number(), z.number(), z.number()]),
  rotation: z.tuple([z.number(), z.number(), z.number()])
})

export const GaugeSchema = z.object({
  stitchWidthMm: z.number().positive(),
  stitchHeightMm: z.number().positive()
})

export const MaterialsSchema = z.object({
  yarns: z.array(YarnSchema).min(1),
  tools: z.array(z.string()),
  notes: z.string().optional()
})

export const PatternSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  title: z.string().min(1),
  craft: z.enum(['knit', 'crochet']),
  gauge: GaugeSchema.optional(),
  materials: MaterialsSchema,
  parts: z.array(PartSchema).min(1),
  assembly: z.array(PartPlacementSchema).optional()
})

export type PatternInput = z.infer<typeof PatternSchema>
