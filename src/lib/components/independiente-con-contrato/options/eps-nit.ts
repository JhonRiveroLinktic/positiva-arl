export type TypeEPS = {
    value: string;
    label: string;
};
  
export const epsEntities: TypeEPS[] = [
    {
      value: '800088702',
      label: 'SUSALUD - SURA - SURAMERICANA E.P.S.',
    },
    {
      value: '800112806',
      label: 'FONDO DE PASIVO SOCIAL DE LOS FERROCARRILES NACIONALES',
    },
    {
      value: '800130907',
      label: 'SALUD TOTAL S.A. E.P.S.',
    },
    {
      value: '800249241',
      label: 'COOSALUD',
    },
    {
      value: '800251440',
      label: 'E.P.S. SANITAS S.A.',
    },
    {
      value: '804001273',
      label: 'SOLSALUD E.P.S. S.A.',
    },
    {
      value: '804002105',
      label: 'COMPARTA EPS-S',
    },
    {
      value: '805000427',
      label: 'COOMEVA E.P.S. S.A.',
    },
    {
      value: '805001157',
      label: 'E.P.S. SERVICIO OCCIDENTAL DE SALUD S.A. S.O.S.',
    },
    {
      value: '806008394',
      label: 'ASOCIACIÓN MUTUAL SER EMPRESA SOLIDARIA DE SALUD A.R.S.',
    },
    {
      value: '809008362',
      label: 'PIJAOS SALUD EPSI',
    },
    {
      value: '811004055',
      label: 'EMDISALUD',
    },
    {
      value: '812002376',
      label: 'MANEXKA EPS INDIGENA',
    },
    {
      value: '814000337',
      label: 'ASOCIACION MUTUAL EMPRESA SOLIDARIA DE SALUD EMSSANAR EPS',
    },
    {
      value: '817000248',
      label: 'ASOCIACION MUTUAL LA ESPERANZA ASMET SALUD ESS ESP S',
    },
    {
      value: '817001773',
      label: 'ASOCIACION INDIGENA DEL CAUCA',
    },
    {
      value: '818000140',
      label: 'AMBUQ EPS ESS',
    },
    {
      value: '824001398',
      label: 'DUSAKAWI EPSI',
    },
    {
      value: '830003564',
      label: 'E.P.S. FAMISANAR LIMITADA CAFAM-COLSUBSIDIO',
    },
    {
      value: '830006404',
      label: 'HUMANA - VIVIR S.A. E.P.S.',
    },
    {
      value: '830009783',
      label: 'CRUZ BLANCA E.P.S. S.A.',
    },
    {
      value: '830074184',
      label: 'SALUDVIDA S.A. E.P.S.',
    },
    {
      value: '830079672',
      label: 'REG. EXECEP (FOSYGA)',
    },
    {
      value: '830113831',
      label: 'COLMEDICA E.P.S. - ALIANSALUD',
    },
    {
      value: '832000760',
      label: 'ECOOPSOS',
    },
    {
      value: '837000084',
      label: 'MALLAMAS',
    },
    {
      value: '839000495',
      label: 'ANASWAYUU',
    },
    {
      value: '846000244',
      label: 'SELVASALUD S.A. E.P.S.',
    },
    {
      value: '860007336',
      label: 'CCF COLSUBSIDIO',
    },
    {
      value: '860013570',
      label: 'CAFAM EPS REGIMEN SUBSIDIADO',
    },
    {
      value: '860045904',
      label: 'COMFACUNDI',
    },
    {
      value: '860066942',
      label: 'COMPENSAR E.P.S.',
    },
    {
      value: '860512237',
      label: 'SALUD COLPATRIA E.P.S.',
    },
    {
      value: '890102044',
      label: 'CAJACOPI EPS',
    },
    {
      value: '890303093',
      label: 'COMFENALCO VALLE E.P.S.',
    },
    {
      value: '890900842',
      label: 'E.P.S. PROGRAMA COMFENALCO ANTIOQUIA',
    },
    {
      value: '890980040',
      label: 'EPS UNIVERSIDAD DE ANTIOQUIA',
    },
    {
      value: '891080005',
      label: 'CCF DE CORDOBA COMFACOR EPS-S',
    },
    {
      value: '891180008',
      label: 'COMFAMILIAR HUILA',
    },
    {
      value: '891280008',
      label: 'COMFAMILIAR NARIÑO',
    },
    {
      value: '891600091',
      label: 'CCF DEL CHOCO COMFACHOCO EPSS',
    },
    {
      value: '891800213',
      label: 'COMFABOY',
    },
    {
      value: '891856000',
      label: 'CAPRESOCA EPS',
    },
    {
      value: '892115006',
      label: 'CCF DE LA GUAJIRA',
    },
    {
      value: '892200015',
      label: 'COMFAMILIAR SUCRE',
    },
    {
      value: '899999026',
      label: 'EPS CAPRECOM',
    },
    {
      value: '899999063',
      label: 'UNISALUD',
    },
    {
      value: '899999107',
      label: 'CONVIDA',
    },
    {
      value: '900074992',
      label: 'GOLDEN GROUP',
    },
    {
      value: '900156264',
      label: 'NUEVA EPS',
    },
    {
      value: '900298372',
      label: 'CAPITAL SALUD',
    },
    {
      value: '900604350',
      label: 'SAVIA SALUD EPS',
    },
    {
      value: '900914254',
      label: 'FUNDACION SALUDMIA EPS',
    },
    {
      value: '901097473',
      label: 'MEDIMAS EPS SAS',
    },
    {
      value: '901543761',
      label: 'EPS FAMILIAR DE COLOMBIA (Antes Comfasucre)',
    },
    {
      value: '901438242',
      label: 'SALUD BOLIVAR EPS S A S',
    },
    {
      value: '890500675',
      label: 'CAJA DE COMPENSACION FAMILIAR DEL ORIENTE COLOMBIANO – COMFAORIENTE',
    },
];
  
export type TypeEPSOptions = {
    value: string;
    label: string;
}
  
export const EPSOptions: TypeEPSOptions[] = epsEntities.map(item => ({
    value: item.value,
    label: `${item.value} - ${item.label}`
}));