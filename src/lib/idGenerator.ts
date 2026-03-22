/**
 * Utility function to generate a unique ID for a property listing.
 * Format: [TIPO DE PROPIEDAD] - [ZONA MACRO] - [NÚMERO CONSECUTIVO] - [INICIALES DEL ASESOR]
 */
export function generatePropertyId(
  tipo: string,
  zona: string,
  consecutivo: number,
  iniciales: string
): string {
  const typeMap: Record<string, string> = {
    "Casa": "CS",
    "Departamento": "DP",
    "Terreno familiar": "TF",
    "Terreno bifamiliar": "TB",
    "Terreno multifamiliar": "TM",
    "Industrial": "IN",
    "Comercial": "CM",
    "Local comercial": "LC",
    "Oficina": "OF",
    "Parqueo": "PQ",
    "Terreno más galpón": "TG",
  };

  const zonaMap: Record<string, string> = {
    "1. Norte y Centro-Norte": "NCN",
    "2. Corredor Vía a Daule": "CVD",
    "3. Noroeste y Periferia": "NYP",
    "4. Centro y Casco Histórico": "CCH",
    "5. Suroeste": "SO",
    "6. Sur": "SR",
    "7. Vía a la Costa": "VC",
    "8. Puerto Santa Ana": "PSA",
    "9. Samborondón (La Puntilla)": "SLP",
    "10. Samborondón (Nuevo Samborondón)": "SNS",
    "11. Vía Aurora / Av. León Febres Cordero": "VAF",
    "12. Daule": "DLE",
    "13. Vía a Salitre": "VSA",
    "14. Durán": "DRN",
    "15. Vía Durán Tambo": "VDT",
    "16. Vía Durán Yaguachi": "VDY",
    "17. Vía Durán Boliche": "VDB",
    "18. Milagro": "MLG",
    "19. Vía Naranjal / Naranjal": "VNN",
    "20. Ruta del Spondylus": "RS",
    "21. Salinas": "SLN",
    "22. Santa Elena": "STE",
  };

  const typeCode = typeMap[tipo] || "PR";
  const zonaCode = zonaMap[zona] || "ZN";
  const paddedConsecutivo = consecutivo.toString().padStart(4, "0");
  const agentInitials = iniciales.toUpperCase() || "XX";

  return `${typeCode}-${zonaCode}-${paddedConsecutivo}-${agentInitials}`;
}
