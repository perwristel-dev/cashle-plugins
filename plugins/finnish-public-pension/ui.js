const type = 'cashlab.finnish-public-pension';
const provider = 'cashle.finance.pension.fi';
const source = 'finnish-public-pension.cashle';
const startChoices = ['minimum', 'now', 'age', 'date', 'retirement', 'milestone'];
const kelaChoices = ['off', 'single', 'partnered'];
const defaultStart = { reference: 'minimum', offset: 0 };
const monthly = (amount, locale) => new Intl.NumberFormat(locale ?? 'fi-FI', {
  style: 'currency', currency: 'EUR',
}).format(amount);

export default function (context) {
  const { EditorElement, elementPrefix, translations, translate, validationRules: rules, createValidator } = context;
  const tags = {
    rights: `${elementPrefix}-fi-old-age-rights`,
    kela: `${elementPrefix}-fi-old-age-kela`,
    payout: `${elementPrefix}-fi-old-age-payout`,
  };
  const owners = model => {
    const profile = model?.profile;
    const withPartner = profile?.mode === 'couple' || (profile?.mode === 'household' && profile.household?.hasPartner);
    return (profile?.people ?? []).filter(person => person.id === 'self' || (withPartner && person.id === 'partner'));
  };
  const selectStyle = 'mt-2 block h-field w-full rounded-2xl border border-outline bg-canvas px-4';
  const birthIsKnown = person => Number.isInteger(person?.birthYear) && person.birthYear >= 1900 && person.birthYear <= 9999
    && Number.isInteger(person.birthMonth) && person.birthMonth >= 1 && person.birthMonth <= 12;
  const validate = createValidator([
    { field: 'name', rules: [rules.required, rules.text, rules.maxLength(80)], message: 'invalid.name' },
    { field: 'owner', rules: [rules.required, (id, data, model) => birthIsKnown(model?.profile?.people?.find(person => person.id === id))], message: 'invalid.owner' },
    { field: 'monthlyRight', rules: [rules.required, rules.number, rules.min(0)], message: 'invalid.right' },
    { field: 'alreadyReceiving', rules: [rules.boolean], message: 'invalid.receiving' },
    { field: 'kelaStatus', rules: [value => kelaChoices.includes(value)], message: 'invalid.kela' },
    { field: 'otherPension', when: data => data.kelaStatus !== 'off', rules: [rules.required, rules.number, rules.min(0)], message: 'invalid.other' },
    { field: 'payoutStart', when: data => !data.alreadyReceiving, rules: [
      rules.time(startChoices),
      time => Number.isInteger(time?.offset) && time.offset >= -1800 && time.offset <= 1800,
      time => time?.reference !== 'age' || (Number.isInteger(time.age) && time.age >= 0 && time.age <= 125),
    ], message: 'invalid.start' },
  ]);

  class RightsFields extends EditorElement {
    static standardEdits = true;
    #case;
    #data;
    constructor() {
      super(`<template>
        <div class="grid gap-4 sm:grid-cols-2">
          <cashle-text-field label="$name" value="$data.name" maxlength="80" required></cashle-text-field>
          <cashle-number-field label="$monthlyRight" unit="$monthlyUnit" value="$data.monthlyRight" nonnegative></cashle-number-field>
          <label id="owner-row" class="block text-sm font-semibold"><span>$owner</span>
            <select id="owner" class="${selectStyle}" value="$data.owner"></select>
          </label>
          <p class="text-sm text-muted sm:col-span-2">$rightsHelp</p>
        </div>
      </template>`);
      this.storeDomRefs();
    }
    set caseContext(model) {
      super.caseContext = model;
      this.#case = model;
      this.#owners(this['#owner'].value || this.#data?.owner || 'self');
    }
    set data(data) {
      this.#data = data;
      this.#owners(data.owner);
      super.data = data;
    }
    setLanguage(language) {
      super.setLanguage(language);
      this.#owners(this['#owner'].value || this.#data?.owner || 'self');
    }
    #owners(value) {
      const people = owners(this.#case);
      const select = this['#owner'];
      select.replaceChildren(...people.map(person => new Option(person.name?.trim() || translate(`owner.${person.id}`) || person.id, person.id)));
      if (value && !people.some(person => person.id === value)) {
        const missing = new Option(translate('owner.missing'), value);
        missing.disabled = true;
        select.add(missing);
      }
      select.value = value;
      this['#owner-row'].hidden = people.length === 1 && people[0].id === value;
    }
  }

  class KelaFields extends EditorElement {
    static standardEdits = true;
    constructor() {
      super(`<template>
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block text-sm font-semibold"><span>$kelaStatus</span>
            <select id="kela" class="${selectStyle}" value="$data.kelaStatus">
              <option value="off">$kela.off</option>
              <option value="single">$kela.single</option>
              <option value="partnered">$kela.partnered</option>
            </select>
          </label>
          <div id="other"><cashle-number-field label="$otherPension" unit="$monthlyUnit" value="$data.otherPension" nonnegative></cashle-number-field></div>
          <p class="text-sm text-muted sm:col-span-2">$kelaHelp</p>
        </div>
      </template>`);
      this.storeDomRefs();
      this['#kela'].addEventListener('change', () => this.#updateVisibility());
      this.#updateVisibility();
    }
    set data(data) {
      super.data = data;
      this.#updateVisibility();
    }
    #updateVisibility() {
      this['#other'].hidden = this['#kela'].value === 'off';
    }
  }

  class PayoutFields extends EditorElement {
    static standardEdits = true;
    constructor() {
      super(`<template>
        <div class="grid gap-3">
          <label class="flex items-center gap-2 text-sm font-semibold">
            <input id="receiving" type="checkbox" checked="$data.alreadyReceiving"><span>$alreadyReceiving</span>
          </label>
          <div id="timing"><cashle-time-field id="start" value="$data.payoutStart"></cashle-time-field></div>
          <p class="text-sm text-muted">$payoutHelp</p>
        </div>
      </template>`);
      this.storeDomRefs();
      this['#receiving'].addEventListener('change', () => this.#updateVisibility());
    }
    set data(data) {
      super.data = data;
      this.#updateVisibility();
    }
    setLanguage(language) {
      super.setLanguage(language);
      const text = key => EditorElement.text(translations, language, key);
      this['#start'].configuration = {
        label: text('payoutStart'),
        choices: startChoices,
        choiceLabels: { minimum: text('minimum') },
        currentDatePrecision: 'day',
      };
    }
    #updateVisibility() {
      this['#timing'].hidden = this['#receiving'].checked;
    }
  }

  customElements.define(tags.rights, RightsFields);
  customElements.define(tags.kela, KelaFields);
  customElements.define(tags.payout, PayoutFields);

  const createData = () => ({
    name: translate('label'), owner: 'self', monthlyRight: 0, alreadyReceiving: false,
    kelaStatus: 'off', otherPension: 0, payoutStart: { ...defaultStart },
  });
  return {
    modules: [{
      type,
      version: 1,
      label: 'Finnish public pension',
      translations,
      category: 'accounts',
      financesTab: 'savings',
      taxCountries: ['FI'],
      creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
      acceptsDeposits: false,
      acceptsRemainder: false,
      sourceModule: { language: 'groovy-cashle-plugin', provider, source },
      usageModel: 'identity',
      createData,
      normalize: data => ({ ...data, payoutStart: data.payoutStart?.reference === 'age' ? { ...data.payoutStart, personId: data.owner } : data.payoutStart }),
      validate,
      summarize: (data, model) => ({
        title: data.name,
        amount: `${monthly(data.monthlyRight, model?.profile?.locale)} ${translate('perMonth')}`,
        detail: translate('rightsSummary'),
      }),
      editor: {
        currentKeys: ['name', 'owner', 'monthlyRight', 'alreadyReceiving'],
        basicComponent: tags.rights,
        detailedSections: [{ id: 'kela', title: 'kelaSection', translateTitle: translate, element: tags.kela }],
      },
      secondaryView: {
        category: 'income',
        financesTab: 'income',
        label: () => translate('payoutLabel'),
        editor: { basicComponent: tags.payout, detailedSections: [] },
        summarize: data => ({
          title: data.name,
          amount: translate(data.alreadyReceiving ? 'alreadyReceiving' : 'lifelong'),
          detail: translate(data.payoutStart?.reference === 'minimum' && !data.alreadyReceiving ? 'minimum' : 'payoutSummary'),
        }),
      },
    }],
  };
}
