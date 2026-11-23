function lockControls(root, locked) {
  for (const field of root.querySelectorAll('input, select')) field.disabled = locked;
}

export function registerBudgetEvents(context, tag = 'cashle-consumer-budget-events') {
  const { EditorElement, casePlan: getPlan, milestoneLabel, translate: expenseText } = context;
  if (!EditorElement) return;
  const template = `<template><div class="grid gap-4"><p class="text-sm text-muted">Lämna datum tomt om händelsen inte ska användas i planen. Barnens födelseår anges i hushållsprofilen. När födelsemånad saknas används januari som en uppskattning.</p><div id="adults" class="grid gap-4 sm:grid-cols-2"></div><div id="children" class="grid gap-4"></div></div></template>`;

  /** Optional household events belong to the budget, keyed by stable child ID. */
  class ConsumerBudgetEvents extends EditorElement {
    static standardEdits = true;
    #context = {}; #data = {}; #access;
    #labels = [];
    constructor() { super(template, expenseText); }
    #label(node, key, values) { this.#labels.push([node,key,values]); node.textContent=expenseText(key,values); }
    setLanguage(language) {
      super.setLanguage(language);
      for(const [node,key,values] of this.#labels)node.textContent=expenseText(key,values);
      const milestones=getPlan(this.#context).milestones ?? [];
      for(const select of this.shadowRoot.querySelectorAll('[data-move-milestone]'))for(const option of select.options) {
        const item=milestones.find(item=>item.id===option.value);
        option.textContent=item ? milestoneLabel(item,this.#context) : expenseText(option.value ? 'Milstolpen saknas — välj en annan' : 'Välj milstolpe');
      }
    }
    set caseContext(value) { this.#context = value ?? {}; this.#render(); }
    set data(value) { this.#data = structuredClone(value ?? {}); this.#render(); }
    applyNormalizedData(value) { this.#data = structuredClone(value ?? {}); this.#render(); }
    applyEditAccess(value) { this.#access = value; lockControls(this.shadowRoot, Boolean(value?.locked)); }
    #field(parent, label, key, value, childId) {
      const wrapper = document.createElement('label'); wrapper.className = 'block text-sm font-semibold text-ink';
      const title = document.createElement('span'); this.#label(title,label);
      const input = document.createElement('input'); input.type = 'date'; input.className = 'mt-2 block h-field w-full rounded-2xl border border-outline bg-canvas px-4';
      input.value = value || ''; input.dataset.key = key;
      if (childId) input.dataset.childId = childId;
      wrapper.append(title, input); parent.append(wrapper); return wrapper;
    }
    #moveOut(parent, event, childId) {
      const root = document.createElement('div'); root.className = 'grid gap-3'; parent.append(root);
      const label = document.createElement('label'); label.className = 'block text-sm font-semibold text-ink'; const moveTitle=document.createElement('span');this.#label(moveTitle,'Barnet flyttar hemifrån');label.append(moveTitle);
      const mode = document.createElement('select'); mode.dataset.childId = childId; mode.dataset.moveMode = ''; mode.className = 'mt-2 block h-field w-full rounded-2xl border border-outline bg-canvas px-4';
      for (const [value, title] of [['none', 'Ingen vald tidpunkt'], ['date', 'Datum'], ['milestone', 'Milstolpe']]) {const option=new Option('',value);this.#label(option,title);mode.add(option);}
      mode.value = event.moveOut?.reference === 'milestone' ? 'milestone' : event.moveOutDate ? 'date' : 'none'; label.append(mode); root.append(label);
      const date = this.#field(root, 'Datum för utflytt', 'moveOutDate', event.moveOutDate, childId);
      const milestoneLabelNode = document.createElement('label'); milestoneLabelNode.className = 'block text-sm font-semibold text-ink'; const milestoneTitle=document.createElement('span');this.#label(milestoneTitle,'Milstolpe');milestoneLabelNode.append(milestoneTitle);
      const milestone = document.createElement('select'); milestone.dataset.childId = childId; milestone.dataset.moveMilestone = ''; milestone.className = 'mt-2 block h-field w-full rounded-2xl border border-outline bg-canvas px-4'; milestone.add(new Option(expenseText('Välj milstolpe'), ''));
      const choices = getPlan(this.#context).milestones ?? [];
      for (const item of choices) milestone.add(new Option(milestoneLabel(item, this.#context), item.id));
      const selected = event.moveOut?.milestoneId ?? '';
      if (selected && !choices.some(item => item.id === selected)) milestone.add(new Option(expenseText('Milstolpen saknas — välj en annan'), selected));
      milestone.value = selected; milestoneLabelNode.append(milestone); root.append(milestoneLabelNode);
      const sync = () => { date.hidden = mode.value !== 'date'; milestoneLabelNode.hidden = mode.value !== 'milestone'; }; mode.addEventListener('change', sync); sync();
    }
    #render() {
      const adults = this.find('#adults'), children = this.find('#children');
      if (!adults || !children) return;
      adults.replaceChildren(); children.replaceChildren(); this.#labels=[];
      this.#field(adults, 'Ditt dödsdatum', 'selfDeathDate', this.#data.selfDeathDate);
      if (this.#context.profile?.household?.hasPartner || this.#context.profile?.mode === 'couple') {
        this.#field(adults, 'Datum för separation', 'partnerSeparationDate', this.#data.partnerSeparationDate);
        this.#field(adults, 'Partners dödsdatum', 'partnerDeathDate', this.#data.partnerDeathDate);
      }
      const events = Array.isArray(this.#data.childEvents) ? this.#data.childEvents : [];
      for (const [index, child] of (this.#context.profile?.household?.children ?? []).entries()) {
        const group = document.createElement('fieldset'); group.className = 'rounded-2xl bg-canvas p-4';
        const title = document.createElement('legend'); title.className = 'font-bold'; if(child.name?.trim())title.textContent=child.name.trim();else this.#label(title,'Barn {number}',{number:index+1}); group.append(title);
        if (!child.id) { const warning = document.createElement('p'); this.#label(warning,'Spara hushållets uppgifter innan du anger datum för barn.'); group.append(warning); }
        else {
          const dates = document.createElement('div'); dates.className = 'grid gap-4 sm:grid-cols-2'; group.append(dates);
          const event = events.find(item => item.childId === child.id) ?? {};
          this.#moveOut(dates, event, child.id);
          this.#field(dates, 'Barnets dödsdatum', 'deathDate', event.deathDate, child.id);
        }
        children.append(group);
      }
      lockControls(this.shadowRoot, Boolean(this.#access?.locked));
    }
    readDraft(base) {
      const result = { ...base }, events = new Map((Array.isArray(base.childEvents) ? base.childEvents : []).map(event => [event.childId, { ...event }]));
      for (const input of this.shadowRoot.querySelectorAll('input[data-key]')) {
        if (this.#access?.locked) continue;
        if (input.dataset.childId) {
          const id = input.dataset.childId, event = events.get(id) ?? { childId: id, moveOutDate: '', deathDate: '' };
          event[input.dataset.key] = input.value; events.set(id, event);
        } else result[input.dataset.key] = input.value;
      }
      if (!this.#access?.locked) for (const mode of this.shadowRoot.querySelectorAll('select[data-move-mode]')) {
        const id = mode.dataset.childId, event = events.get(id) ?? { childId: id, deathDate: '' };
        if (mode.value === 'milestone') {
          const selected = [...this.shadowRoot.querySelectorAll('select[data-move-milestone]')].find(item => item.dataset.childId === id);
          event.moveOut = { reference: 'milestone', milestoneId: selected?.value ?? '', offset: event.moveOut?.offset ?? 0 };
          delete event.moveOutDate;
        } else { delete event.moveOut; if (mode.value === 'none') delete event.moveOutDate; }
        events.set(id, event);
      }
      result.childEvents = [...events.values()];
      return result;
    }
  }
  customElements.define(tag, ConsumerBudgetEvents);
}
