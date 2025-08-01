export type Departamento = {
    codigo: string
    nombre: string
}

export const departamentos: Departamento[] = [
    { codigo: '5', nombre: 'ANTIOQUIA' },
    { codigo: '8', nombre: 'ATLANTICO' },
    { codigo: '11', nombre: 'BOGOTA D.C.' },
    { codigo: '13', nombre: 'BOLIVAR' },
    { codigo: '15', nombre: 'BOYACA' },
    { codigo: '17', nombre: 'CALDAS' },
    { codigo: '18', nombre: 'CAQUETA' },
    { codigo: '19', nombre: 'CAUCA' },
    { codigo: '20', nombre: 'CESAR' },
    { codigo: '23', nombre: 'CORDOBA' },
    { codigo: '25', nombre: 'CUNDINAMARCA' },
    { codigo: '27', nombre: 'CHOCO' },
    { codigo: '41', nombre: 'HUILA' },
    { codigo: '44', nombre: 'LA GUAJIRA' },
    { codigo: '47', nombre: 'MAGDALENA' },
    { codigo: '50', nombre: 'META' },
    { codigo: '52', nombre: 'NARIÑO' },
    { codigo: '54', nombre: 'NORTE DE SANTANDER' },
    { codigo: '63', nombre: 'QUINDIO' },
    { codigo: '66', nombre: 'RISARALDA' },
    { codigo: '68', nombre: 'SANTANDER' },
    { codigo: '70', nombre: 'SUCRE' },
    { codigo: '73', nombre: 'TOLIMA' },
    { codigo: '76', nombre: 'VALLE' },
    { codigo: '81', nombre: 'ARAUCA' },
    { codigo: '85', nombre: 'CASANARE' },
    { codigo: '86', nombre: 'PUTUMAYO' },
    { codigo: '88', nombre: 'SAN ANDRES' },
    { codigo: '91', nombre: 'AMAZONAS' },
    { codigo: '94', nombre: 'GUAINIA' },
    { codigo: '95', nombre: 'GUAVIARE' },
    { codigo: '97', nombre: 'VAUPES' },
    { codigo: '99', nombre: 'VICHADA' },
];
  
export const departamentosDaneOptions = departamentos.map(dep => ({
    value: dep.codigo,
    label: `${dep.codigo} - ${dep.nombre}`,
}))