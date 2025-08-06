// Mock options for Afiliacion Empleador
export const DocumentTypesOptions = [
  { value: "CC", label: "CC - Cédula de Ciudadanía" },
  { value: "CE", label: "CE - Cédula de Extranjería" },
  { value: "N", label: "N - NIT" },
  { value: "NI", label: "NI - NIT" },
  { value: "PP", label: "PP - Pasaporte" },
  { value: "TI", label: "TI - Tarjeta de Identidad" },
]

export const departamentosDaneOptions = [
  { value: "05", label: "05 - ANTIOQUIA" },
  { value: "08", label: "08 - ATLÁNTICO" },
  { value: "11", label: "11 - BOGOTÁ, D.C." },
  { value: "13", label: "13 - BOLÍVAR" },
  { value: "15", label: "15 - BOYACÁ" },
  { value: "17", label: "17 - CALDAS" },
  { value: "18", label: "18 - CAQUETÁ" },
  { value: "19", label: "19 - CAUCA" },
  { value: "20", label: "20 - CESAR" },
  { value: "23", label: "23 - CÓRDOBA" },
  { value: "25", label: "25 - CUNDINAMARCA" },
  { value: "27", label: "27 - CHOCÓ" },
  { value: "41", label: "41 - HUILA" },
  { value: "44", label: "44 - LA GUAJIRA" },
  { value: "47", label: "47 - MAGDALENA" },
  { value: "50", label: "50 - META" },
  { value: "52", label: "52 - NARIÑO" },
  { value: "54", label: "54 - NORTE DE SANTANDER" },
  { value: "63", label: "63 - QUINDÍO" },
  { value: "66", label: "66 - RISARALDA" },
  { value: "68", label: "68 - SANTANDER" },
  { value: "70", label: "70 - SUCRE" },
  { value: "73", label: "73 - TOLIMA" },
  { value: "76", label: "76 - VALLE DEL CAUCA" },
  { value: "81", label: "81 - ARAUCA" },
  { value: "85", label: "85 - CASANARE" },
  { value: "86", label: "86 - PUTUMAYO" },
  { value: "88", label: "88 - ARCHIPIÉLAGO DE SAN ANDRÉS" },
  { value: "91", label: "91 - AMAZONAS" },
  { value: "94", label: "94 - GUAINÍA" },
  { value: "95", label: "95 - GUAJIRA" },
  { value: "97", label: "97 - VAUPÉS" },
  { value: "99", label: "99 - VICHADA" },
]

export const getMunicipiosDaneOptionsByDepartamento = (departamentoCode: string) => {
  const municipiosMock = {
    "11": [
      { value: "11001", label: "11001 - BOGOTÁ, D.C." },
    ],
    "05": [
      { value: "05001", label: "05001 - MEDELLÍN" },
      { value: "05002", label: "05002 - ABEJORRAL" },
      { value: "05004", label: "05004 - ABRIAQUÍ" },
      { value: "05021", label: "05021 - ALEJANDRÍA" },
      { value: "05030", label: "05030 - AMAGÁ" },
      { value: "05031", label: "05031 - AMALFI" },
      { value: "05034", label: "05034 - ANDES" },
      { value: "05036", label: "05036 - ANGELÓPOLIS" },
      { value: "05038", label: "05038 - ANGOSTURA" },
      { value: "05040", label: "05040 - ANORÍ" },
    ],
    "08": [
      { value: "08001", label: "08001 - BARRANQUILLA" },
      { value: "08078", label: "08078 - BARANOA" },
      { value: "08137", label: "08137 - CAMPO DE LA CRUZ" },
      { value: "08141", label: "08141 - CANDELARIA" },
      { value: "08296", label: "08296 - GALAPA" },
      { value: "08372", label: "08372 - JUAN DE ACOSTA" },
      { value: "08421", label: "08421 - LURUACO" },
      { value: "08433", label: "08433 - MALAMBO" },
      { value: "08436", label: "08436 - MANATÍ" },
      { value: "08520", label: "08520 - PALMAR DE VARELA" },
    ],
  }

  return municipiosMock[departamentoCode as keyof typeof municipiosMock] || []
}

export const EPSOptions = [
  { value: "EPS001", label: "EPS001 - EPS MOCK 1" },
  { value: "EPS002", label: "EPS002 - EPS MOCK 2" },
  { value: "EPS003", label: "EPS003 - EPS MOCK 3" },
]

export const PensionFundOptions = [
  { value: "AFP001", label: "AFP001 - AFP MOCK 1" },
  { value: "AFP002", label: "AFP002 - AFP MOCK 2" },
  { value: "AFP003", label: "AFP003 - AFP MOCK 3" },
] 