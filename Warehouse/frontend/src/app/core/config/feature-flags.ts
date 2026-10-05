export const FEATURE_FLAGS = {
  bodegas: true,
  productos: true,
  dashboard: true,
  kardex: true,
  containers: true,
  lotes: true,
  clientes: true,
  auditoria: true,
} as const;

export type FeatureName = keyof typeof FEATURE_FLAGS;

export function isFeatureEnabled(feature: FeatureName): boolean {
  return FEATURE_FLAGS[feature];
}
