const personalType = 'cashlab.danish-atp-pension';
const provider = 'cashle.finance.pension.dk.atp';
const threshold = 3600;
const starts = ['minimum', 'age', 'date', 'milestone'];
const minimum = { reference: 'minimum', offset: 0 };
const isLump = data => data.annualPension <= threshold;
const amount = (value, model) => new Intl.NumberFormat(model?.profile?.locale ?? 'da-DK', {
  style: 'currency', currency: 'DKK',
}).format(value);

export default function (context) {
  const { EditorElement, elementPrefix, translations, translate, validationRules: rules, createValidator } = context;
  const rightsTag = `${elementPrefix}-dk-atp-rights`;
  const payoutTag = `${elementPrefix}-dk-atp-payout`;
  const owners = model => {
    const profile = model?.profile;
    const withPartner = profile?.mode === 'couple' || (profile?.mode === 'household' && profile.household?.hasPartner);
    return (profile?.people ?? []).filter(person => person.id === 'self' || (withPartner && person.id === 'partner'));
  };
  const birthIsKnown = p => Number.isInteger(p?.birthYear) && p.birthYear >= 1900 && p.birthYear <= 9999
    && Number.isInteger(p.birthMonth) && p.birthMonth >= 1 && p.birthMonth <= 12;
  const validAmount = [rules.required, rules.number, rules.min(0)];
  const validate = createValidator([
    { field: 'name', rules: [rules.required, rules.text, rules.maxLength(80)], message: 'invalid.name' },
    { field: 'owner', rules: [(id, data, model) => birthIsKnown(model?.profile?.people?.find(person => person.id === id))], message: 'invalid.owner' },
    { field: 'annualPension', rules: validAmount, message: 'invalid.pension' },
    { field: 'grossLumpSum', when: isLump,
      rules: [...validAmount, (value, data) => data.annualPension === 0 || value > 0], message: 'invalid.lump' },
    { field: 'deferredAnnualPension', when: data => !isLump(data),
      rules: [...validAmount, (value, data) => value === 0 || value >= data.annualPension], message: 'invalid.deferred' },
    { field: 'payoutStart', when: data => !isLump(data), rules: [
      rules.time(starts), time => time?.offset === 0,
      time => time?.reference !== 'age' || (Number.isInteger(time.age) && time.age >= 0 && time.age <= 125),
    ], message: 'invalid.start' },
  ]);

  class RightsFields extends EditorElement {
    static standardEdits = true;
    #model;
    #data;
    constructor() {
      super(`<template>
        <div class="grid gap-4 sm:grid-cols-2">
          <cashle-text-field label="$name" value="$data.name" maxlength="80" required></cashle-text-field>
          <cashle-number-field id="annual" label="$annualPension" unit="$yearUnit" value="$data.annualPension" nonnegative></cashle-number-field>
          <label id="owner-row" class="block text-sm font-semibold"><span>$owner</span>
            <select id="owner" class="mt-2 block h-field w-full rounded-2xl border border-outline bg-canvas px-4" value="$data.owner"></select>
          </label>
          <div id="lump"><cashle-number-field label="$grossLumpSum" unit="DKK" value="$data.grossLumpSum" nonnegative></cashle-number-field></div>
          <p class="text-sm text-muted sm:col-span-2">$rightsHelp</p>
        </div>
      </template>`);
      this.storeDomRefs();
      this['#annual'].addEventListener('number-input', () => this.#updateLump());
    }
    set caseContext(model) {
      super.caseContext = model;
      this.#model = model;
      this.#updateOwner(this['#owner'].value || this.#data?.owner || 'self');
    }
    set data(data) {
      this.#data = data;
      this.#updateOwner(data.owner);
      super.data = data;
      this.#updateLump();
    }
    setLanguage(language) {
      super.setLanguage(language);
      this.#updateOwner(this['#owner'].value || this.#data?.owner || 'self');
    }
    #updateOwner(id) {
      const people = owners(this.#model);
      const select = this['#owner'];
      select.replaceChildren(...people.map(person => new Option(person.name?.trim() || translate(`owner.${person.id}`), person.id)));
      if (id && !people.some(person => person.id === id)) {
        const missing = new Option(translate('owner.missing'), id);
        missing.disabled = true;
        select.add(missing);
      }
      select.value = id;
      this['#owner-row'].hidden = people.length === 1 && people[0].id === id;
    }
    #updateLump() {
      this['#lump'].hidden = !isLump({ annualPension: this['#annual'].value });
    }
  }

  class PayoutFields extends EditorElement {
    static standardEdits = true;
    constructor() {
      super(`<template>
        <div id="monthly" class="grid gap-4">
          <cashle-time-field id="payout" value="$data.payoutStart"></cashle-time-field>
          <div id="deferral">
            <cashle-number-field label="$deferredAnnualPension" unit="$yearUnit" value="$data.deferredAnnualPension" nonnegative></cashle-number-field>
            <p class="mt-1 text-sm text-muted">$deferralHelp</p>
          </div>
          <p class="text-sm text-muted">$monthlyHelp</p>
        </div>
        <p id="lump" class="text-sm text-muted">$lumpHelp</p>
      </template>`);
      this.storeDomRefs();
      this['#payout'].addEventListener('control-input', () => this.#updateDeferral());
    }
    set data(data) {
      super.data = data;
      this['#monthly'].hidden = isLump(data);
      this['#lump'].hidden = !isLump(data);
      this.#updateDeferral();
    }
    setLanguage(language) {
      super.setLanguage(language);
      const text = key => EditorElement.text(translations, language, key);
      this['#payout'].configuration = {
        label: text('payoutStart'), choices: starts, choiceLabels: { minimum: text('minimum') },
        currentDatePrecision: 'day', hideOffset: true,
      };
    }
    #updateDeferral() {
      this['#deferral'].hidden = this['#payout'].value?.reference === 'minimum';
    }
  }

  customElements.define(rightsTag, RightsFields);
  customElements.define(payoutTag, PayoutFields);
  return {
    modules: [{
      type: personalType,
      version: 1,
      label: 'ATP Livslang Pension',
      translations,
      category: 'accounts',
      financesTab: 'savings',
      taxCountries: ['DK'],
      creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
      acceptsDeposits: false,
      acceptsRemainder: false,
      sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'danish-atp-pension.cashle' },
      usageModel: 'identity',
      createData: () => ({ name: translate('label'), owner: 'self', annualPension: 0, grossLumpSum: 0,
        deferredAnnualPension: 0, payoutStart: { ...minimum } }),
      normalize: data => ({ ...data, payoutStart: data.payoutStart?.reference === 'age' ? { ...data.payoutStart, personId: data.owner } : data.payoutStart }),
      validate,
      summarize: (data, model) => ({
        title: data.name,
        amount: isLump(data) && data.grossLumpSum > 0 ? amount(data.grossLumpSum, model) : `${amount(data.annualPension, model)} ${translate('perYear')}`,
        detail: translate(isLump(data) && data.grossLumpSum > 0 ? 'lumpRights' : 'annualRights'),
      }),
      editor: { currentKeys: ['name', 'owner', 'annualPension', 'grossLumpSum'], basicComponent: rightsTag, detailedSections: [] },
      secondaryView: {
        category: 'income',
        financesTab: 'income',
        label: () => translate('payoutLabel'),
        editor: { basicComponent: payoutTag, detailedSections: [] },
        summarize: (data, model) => ({
          title: data.name,
          amount: isLump(data) ? amount(data.grossLumpSum * 0.6, model) : translate('lifelong'),
          detail: translate(isLump(data) ? 'lumpPayout' : 'monthlyPayout'),
        }),
      },
    }],
  };
}
