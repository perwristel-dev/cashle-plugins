const provider = 'cashle.finance.budget.us.thrifty-food-plan';
const type = 'us-thrifty-food-plan';
const categories = ['female', 'male'];

function householdMembers(model, translate) {
  const profile = model?.profile;
  const hasPartner = profile?.mode === 'couple' || profile?.mode === 'household' && profile.household?.hasPartner;
  const adults = (profile?.people ?? []).filter(person => person.id === 'self' || hasPartner && person.id === 'partner')
    .map(person => ({ ...person, lifeOwner: person.id, share: 1, label: person.name || translate(person.id) }));
  const children = profile?.mode === 'household' ? profile.household?.children ?? [] : [];
  return [
    ...adults,
    ...children.map((child, index) => ({ ...child, birthMonth: child.birthMonth ?? 1,
      share: child.residence === 'half' ? 0.5 : 1, label: child.name || translate('child', { number: index + 1 }) })),
  ];
}

export default function (context) {
  const t = context.translate;
  const control = `${context.elementPrefix ?? 'cashle'}-tfp-members`;
  customElements.define(control, class extends HTMLElement {
    #entries = [];
    #selected = {};
    #disabled = false;

    set value(value) {
      const next = value ?? {};
      if (Object.keys(next).length === Object.keys(this.#selected).length &&
          Object.entries(next).every(([id, category]) => this.#selected[id] === category)) return;
      this.#selected = { ...next };
      for (const select of this.querySelectorAll('select')) select.value = this.#selected[select.dataset.member] ?? '';
    }
    get value() { return { ...this.#selected }; }
    set disabled(value) {
      this.#disabled = Boolean(value);
      for (const select of this.querySelectorAll('select')) select.disabled = this.#disabled;
    }
    get disabled() { return this.#disabled; }

    set members(members) {
      if (members.length === this.#entries.length &&
          members.every((member, index) => member.id === this.#entries[index].id && member.label === this.#entries[index].label)) return;
      this.#entries = members;
      this.replaceChildren();
      for (const member of members) {
        const label = document.createElement('label');
        label.className = 'mb-3 block text-sm font-semibold text-ink';
        const name = document.createElement('span');
        name.textContent = member.label;
        const select = document.createElement('select');
        select.className = 'mt-2 block h-field w-full rounded-2xl border border-outline bg-canvas px-4';
        select.dataset.member = member.id;
        select.disabled = this.#disabled;
        for (const category of ['', ...categories]) select.add(new Option(t(category || 'choose'), category));
        select.value = this.#selected[member.id] ?? '';
        select.addEventListener('change', event => {
          event.stopPropagation();
          this.#selected = { ...this.#selected, [member.id]: select.value };
          this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
          this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        });
        label.append(name, select);
        this.append(label);
      }
    }
  });

  const module = context.schemaModule({
    id: type, category: 'expenses', label: 'label', pluginId: provider, taxCountries: ['US'],
    help: 'help',
    fields: [
      { key: 'name', label: 'name', kind: 'text', default: t('label') },
      { key: 'categories', label: 'categories', kind: 'food-categories', default: {}, controlElement: control, wide: true,
        updateControl: (element, { model }) => { element.members = householdMembers(model, t); } },
    ],
    sections: [{
      id: 'financing', title: 'financing', fields: context.savingsFundingFields('food'),
      summary: data => context.savingsFundingSummary(data, 'food'),
    }],
    validateData(data, model) {
      const members = householdMembers(model, t);
      return members.length && members.every(member => member.id && Number.isInteger(member.birthYear) &&
        member.birthYear >= 1900 && member.birthYear <= 9800 && Number.isInteger(member.birthMonth) &&
        member.birthMonth >= 1 && member.birthMonth <= 12 && categories.includes(data.categories?.[member.id]))
        ? [] : ['invalidMembers'];
    },
    engineInput(data, { model }) {
      const members = householdMembers(model, t).map(({ id, birthYear, birthMonth, share, lifeOwner }) => ({
        birthYear, birthMonth, category: data.categories[id], share, ...(lifeOwner ? { lifeOwner } : {}),
      }));
      const timeReferences = (context.casePlan(model).milestones ?? [])
        .filter(row => row.builtin === 'life' && members.some(member => member.lifeOwner === row.personId))
        .map(row => ({ reference: 'life', personId: row.personId }));
      return { input: { ...data, members }, timeReferences };
    },
    summarize: data => ({ title: data.name, detail: t('summary') }),
  });
  return { modules: [{
    ...module, translations: context.translations, usageModel: 'identity',
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'us-thrifty-food-plan.cashle' },
  }] };
}
