export type TypeSubEmpresa = {
    value: string;
    label: string;
  };
  
  export const subEmpresas: TypeSubEmpresa[] = [
    {
      value: '1',
      label: 'SECRETARIA GENERAL DE LA ALCALDIA MAYOR DE BOGOTA DC SGAM',
    },
    {
      value: '2',
      label: 'ALCALDIA MAYOR DE BOGOTA SECRETARIA DISTRITAL DE SALUD',
    },
    {
      value: '3',
      label: 'SECRETARIA DISTRITAL DE INTEGRACION SOCIAL',
    },
    {
      value: '4',
      label: 'SECRETARIA DISTRITAL DE MOVILIDAD',
    },
    {
      value: '5',
      label: 'UNIDAD ADMINISTRATIVA ESPECIAL CUERPO OFICIAL DE BOMBEROS',
    },
    {
      value: '6',
      label: 'SECRETARIA DISTRITAL DE GOBIERNO',
    },
    {
      value: '7',
      label: 'SECRETARIA DISTRITAL DE DESARROLLO ECONOMICO',
    },
    {
      value: '8',
      label: 'SECRETARIA DISTRITAL DE HABITAT',
    },
    {
      value: '9',
      label: 'VEEDURIA DISTRITAL',
    },
    {
      value: '10',
      label: 'PERSONERIA DE BOGOTA',
    },
    {
      value: '11',
      label: 'DEPARTAMENTO ADMINISTRATIVO DEL SERVICIO CIVIL',
    },
    {
      value: '12',
      label: 'SECRETARIA DISTRITAL DE HACIENDA',
    },
    {
      value: '13',
      label: 'SECRETARIA DISTRITAL DE LA MUJER',
    },
    {
      value: '14',
      label: 'SECRETARIA DE EDUCACION DEL DISTRITO',
    },
    {
      value: '15',
      label: 'SECRETARIA DE CULTURA RECREACION Y DEPORTE',
    },
    {
      value: '16',
      label: 'SECRETARIA DISTRITAL DE CULTURA RECREACION',
    },
    {
      value: '17',
      label: 'SECRETARIA DISTRITAL DE PLANEACION',
    },
    {
      value: '18',
      label: 'SECRETARIA DISTRITAL DE AMBIENTE',
    },
    {
      value: '19',
      label: 'SECRETARIA JURIDICA DISTRITAL',
    },
    {
      value: '20',
      label: 'SECRETARIA DISTRITAL DE SEGURIDAD CONVIVENCIA Y JUSTICIA',
    },
    {
      value: '21',
      label: 'DEPARTAMENTO ADMINISTRATIVO DE LA DEFENSORIA DEL ESPACIO',
    },
    {
      value: '22',
      label: 'CONCEJO DE BOGOTA',
    },
  ];
  
  export type TypeSubEmpresaOptions = {
    value: string;
    label: string;
  };
  
  export const SubEmpresaOptions: TypeSubEmpresaOptions[] = subEmpresas.map(item => ({
    value: item.value,
    label: `${item.value} - ${item.label}`,
  }));