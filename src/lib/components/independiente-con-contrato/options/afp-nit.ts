export type TypePensionFund = {
    value: string;
    label: string;
};
  
export const pensionFunds: TypePensionFund[] = [
    {
      value: '0',
      label: 'SIN AFP (PENSIONADOS)',
    },
    {
      value: '800224808',
      label: 'PORVENIR',
    },
    {
      value: '800227940',
      label: 'COLFONDOS S.A. PENSIONES Y CESANTIAS',
    },
    {
      value: '800229739',
      label: 'PROTECCION',
    },
    {
      value: '830125132',
      label: 'OLD MUTUAL (ANTES SKANDIA)',
    },
    {
      value: '900336004',
      label: 'COLPENSIONES ADMINISTRADORA COLOMBIANA DE PENSIONES',
    },
];
  
export type TypePensionFundOptions = {
    value: string;
    label: string;
}
  
export const PensionFundOptions: TypePensionFundOptions[] = pensionFunds.map(item => ({
    value: item.value,
    label: `${item.value} - ${item.label}`
}));