const pluginId = 'cashle.finance.fr-tax-fonciere';
const label = 'Taxe foncière sur les propriétés bâties';
const fields = [
  { key: 'name', kind: 'text', label: 'Nom', default: label },
  { key: 'annualNotice', kind: 'number', label: 'Montant annuel figurant sur l’avis', default: 0, min: 0, unit: 'EUR' },
  { key: 'noticePaymentDate', kind: 'date', label: 'Date de paiement de l’avis', default: '', required: true },
  { key: 'ownershipFrom', kind: 'date', label: 'Date d’acquisition', default: '', required: true },
  { key: 'ownershipUntil', kind: 'date', label: 'Date de cession (facultative)', default: '' },
];

export default context => {
  const module = context.schemaModule({
    id: 'french-tax-fonciere', label, pluginId, category: 'expenses', fields, sections: [],
    validateData: data => {
      if (!data.noticePaymentDate || !data.ownershipFrom) return ['Indiquez les dates de paiement et d’acquisition.'];
      if (data.ownershipUntil && data.ownershipUntil <= data.ownershipFrom) return ['La cession doit être postérieure à l’acquisition.'];
      return [];
    },
    summarize: (data, model) => ({
      title: data.name,
      amount: new Intl.NumberFormat(model?.locale ?? 'en', { style: 'currency', currency: 'EUR' }).format(data.annualNotice),
      detail: context.translate('Montant annuel'),
    }),
  });
  const translations = Object.fromEntries(Object.entries(context.translations).map(([locale, messages]) => [locale, { label: messages[label] ?? label }]));
  return { modules: [{ ...module, translations, usageModel: 'identity',
    sourceModule: { language: 'groovy-cashle-plugin', provider: pluginId, source: 'french-tax-fonciere.cashle' },
  }] };
};
