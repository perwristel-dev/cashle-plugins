const provider = 'cashle.finance.pension.occupational.fi.juel';
const label = 'JuEL – offentlig arbetspension i Finland';
const pensionHelp = 'Ange bara JuEL-rättigheter från Keva, efter livslängdskoefficienten och före eventuell uppskovsförhöjning.';
const transitionHelp = 'Ange en skyddad ålder bara om Keva bekräftat den och villkoren för fortsatt anställning är uppfyllda.';
const basisFields = [
  { key: 'name', kind: 'text', label: 'Namn', default: label },
  { key: 'owner', kind: 'owner', label: 'Person', default: 'self', individualOwnersOnly: true },
  { key: 'monthlyRight', kind: 'number', label: 'Intjänad JuEL-pension per månad', default: 0, min: 0, unit: 'EUR' },
  { key: 'annualSalary', kind: 'number', label: 'Pensionsgrundande årslön i offentlig anställning', default: 0, min: 0, unit: 'EUR', forecastEditable: true },
];
const transitionFields = [
  { key: 'transition', kind: 'select', label: 'Pensionsåldersregel', default: 'standard', options: [
    ['standard', 'Allmän åldersgräns'], ['occupational', 'Skyddad yrkesbaserad pensionsålder'], ['personal', 'Personlig pensionsålder'],
  ] },
  { key: 'protectedAgeYears', kind: 'number', label: 'Bekräftad ålder i år', default: 63, min: 17, max: 70, integer: true,
    when: data => data.transition !== 'standard' },
  { key: 'protectedAgeMonths', kind: 'number', label: 'Extra månader', default: 0, min: 0, max: 11, integer: true,
    when: data => data.transition !== 'standard' },
  { key: 'personalMonthlyRight', kind: 'number', label: 'Intjänad månadspension med personligt skydd', default: 0, min: 0, unit: 'EUR',
    when: data => data.transition === 'personal', help: 'Ange Kevas belopp med fullt skydd här. Ange beloppet före den personliga åldern i fältet för intjänad månadspension.' },
];
const startChoices = ['minimum', 'age', 'now', 'date', 'retirement', 'milestone'];
const payoutFields = [
  { key: 'payoutStart', kind: 'time', label: 'Önskad uttagsstart', default: { reference: 'minimum', offset: 0 },
    choices: startChoices, choiceLabels: { minimum: 'Första tillåtna månad', age: 'Ålder' },
    currentDatePrecision: 'day', datePrecision: 'day', forecastEditable: true,
    help: 'Utbetalning sker månadsvis livet ut. Anställningen måste avslutas före fullt uttag.' },
];

export default context => {
  const engineInput = data => ({ input: data });
  const validateData = (data, model) => {
    const errors = [];
    const person = model?.profile?.people?.find(person => person.id === data.owner);
    if (!Number.isInteger(person?.birthYear) || person.birthYear < 1900 || person.birthYear > 9999 ||
        !Number.isInteger(person.birthMonth) || person.birthMonth < 1 || person.birthMonth > 12) {
      errors.push('Välj en person med giltigt födelseår och födelsemånad.');
    }
    if (data.transition === 'personal') {
      const personalAge = data.protectedAgeYears * 12 + data.protectedAgeMonths;
      if (personalAge < 63 * 12 || personalAge > 65 * 12) errors.push('Den personliga pensionsåldern ska vara mellan 63 och 65 år.');
      if (data.personalMonthlyRight < data.monthlyRight) errors.push('Beloppet med personligt skydd ska minst motsvara det ordinarie beloppet.');
    }
    const start = data.payoutStart;
    if (!startChoices.includes(start?.reference) || Math.abs(start?.offset) > 1500 ||
        (start?.reference === 'age' && (!Number.isInteger(start.age) || start.age < 0 || start.age > 125))) {
      errors.push('Ange en giltig uttagsstart.');
    }
    return errors;
  };
  const pension = context.schemaModule({
    id: 'finnish-juel-pension', label, pluginId: provider, category: 'income', financesTab: 'income',
    fields: [...basisFields, ...payoutFields], help: pensionHelp,
    sections: [{ id: 'protected-age', title: 'Skyddad pensionsålder', fields: transitionFields, help: transitionHelp }],
    engineInput, validateData,
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    summarize: (data, model) => ({
      title: data.name,
      amount: new Intl.NumberFormat(model?.profile?.locale ?? 'fi-FI', { style: 'currency', currency: 'EUR' }).format(data.monthlyRight),
      detail: context.translate('Intjänad månadspension'),
    }),
  });
  const translations = Object.fromEntries(Object.entries(context.translations).map(([locale, messages]) => [locale, { label: messages[label] ?? label }]));
  return { modules: [{
    ...pension,
    translations,
    usageModel: 'identity',
    acceptsDeposits: false,
    acceptsRemainder: false,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'finnish-juel-pension.cashle' },
    editor: {
      ...pension.editor,
      currentKeys: [...pension.editor.currentKeys, ...transitionFields.map(field => field.key)],
      detailedSections: pension.editor.detailedSections.map(section => ({ ...section, translateTitle: context.translate })),
    },
    previousCategories: ['accounts'],
  }] };
};
