/** kebab-case DOM ids: `<component>-<element>` or `<component>-<record id>-<element>`. */
export function domId(component: string, element: string, recordId?: string | number) {
  return [component, recordId, element].filter((p) => p !== undefined).join("-");
}
