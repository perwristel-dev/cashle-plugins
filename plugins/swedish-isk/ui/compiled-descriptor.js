import createUi from '../ui.js';
import en from '../ui-en.json' with { type: 'json' };
import sv from '../ui-sv.json' with { type: 'json' };
import { createInvestmentPlugin } from '../../../cashle-lab-ui/src/plugins/investments/definitions.js';
import { sourceResidenceChanges } from '../../../cashle-lab-ui/src/core/source-origin.js';

const { sourceModule, usageModel, ...descriptor } = createUi({
  investmentAccount: createInvestmentPlugin, sourceResidenceChanges, translations: { en, sv },
}).modules[0];

export default descriptor;
