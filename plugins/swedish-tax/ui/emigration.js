const select=(key,label,options,extra={})=>({key,label,kind:'select',options,...extra});
const check=(key,label,extra={})=>({key,label,kind:'check',...extra});
const exemption=select('foreignEmploymentExemption','Befrielse för utlandsarbete',[['none','Ingen befrielse'],['six-month','Sexmånadersregeln'],['one-year','Ettårsregeln']],{help:'Fortsatt obegränsad skattskyldighet: befrielse används bara efter att villkoren bekräftats.'});
const confirmation=check('foreignEmploymentExemptionConfirmed','Jag har kontrollerat och uppfyller villkoren för vald befrielse',{when:o=>o.foreignEmploymentExemption!=='none'});
const employment=select('employmentProfile','Typ av arbete',[['ordinary','Ordinärt privat arbete'],['special','Offentlig tjänst, sjöinkomst eller annat specialfall']],{help:'Specialfall kräver särskilda regler och stoppas med ett begripligt fel.'});
const pension=select('pensionKind','Pensionsslag',[['private','Privat pension / tjänstepension'],['public','Allmän pension med tillämpligt månadsfribelopp']]);
const sourceKind=select('sourceKind','Kapitalinkomstens slag efter utflyttning',[['unknown','Välj uttryckligt inkomstslag'],['bankInterest','Vanlig bankränta'],['dividendIncome','Aktieutdelning'],['securitiesGains','Värdepappersvinst'],['iskImputedIncome','ISK-schabloninkomst'],['propertyRentalIncome','Svensk fastighetsinkomst']]);
const coupon={key:'treatyCouponRate',kind:'number',label:'Bekräftad kupongskatt enligt avtal',percent:true,min:0,max:.3,help:'Förval: 30 % enligt svenska nationella regler. Skatteavtal kan ändra nivån.'};
const securities=select('securitiesClassification','Värdepapperens klassificering',[['unknown','Välj klassificering'],['qualifying-shares','Aktier som omfattas av tioårsregeln'],['fund','Fondandelar'],['excluded','Omfattas inte av tioårsregeln']]);
const treaty=check('securitiesTreatyExemptionConfirmed','Bekräftad avtalsbegränsning undantar vinsten från svensk skatt');

export function createEmigrationSourceSettings(taxText, sourceResidenceChanges) {
  const moves=facts=>sourceResidenceChanges(facts.model).filter(row=>!row.owner||row.owner==='joint'||row.owner===(facts.moduleData?.owner ?? 'self'));
  return {
    defaultOptions:{sourceKind:'unknown',workCountry:'',pensionKind:'private',employmentProfile:'ordinary',foreignEmploymentExemption:'none',foreignEmploymentExemptionConfirmed:false,treatyCouponRate:.3,securitiesClassification:'unknown',securitiesTreatyExemptionConfirmed:false},
    fields:[],
    schemaFields:[{key:'workCountry',kind:'text',label:'Arbetsland'},employment,pension,exemption,confirmation,sourceKind,coupon,securities,treaty],
    calculationOptions({ preliminaryMethod, preliminaryRate, preliminaryPayer, preliminaryAnnualIncome, ...options }) {
      return options;
    },
    appliesTo:facts=>facts.model?.profile?.tax?.country==='SE'&&moves(facts).some(row=>row.settings.country!=='SE'),
    contextFields(facts) {
      if(!this.appliesTo(facts)) return [];
      if(facts.basis==='salary') {
        const destinations=[...new Set(moves(facts).map(row=>row.settings.country).filter(c=>c!=='SE'))];
        return [select('workCountry','Var utförs arbetet efter utflyttningen?',[['','Destinationslandet (förvalt)'],['SE','Sverige'],...destinations.map(country=>[country,country])],{help:'Arbetsland och lönens ursprungsland är separata uppgifter.'}),employment,exemption,confirmation];
      }
      if(facts.basis==='pension') return [pension];
      if(['capitalIncome','shareIncome','dividendIncome','capitalGains'].includes(facts.basis)) return [sourceKind,coupon,securities,treaty];
      return [];
    },
    validate(options) {
      const errors=[];
      if(options.workCountry!==''&&!(/^[A-Z]{2}$/).test(options.workCountry)) errors.push(taxText('Arbetsland: välj ett giltigt land.'));
      if(options.employmentProfile==='special') errors.push(taxText('Svensk skatt efter utflyttning stöder inte offentlig tjänst, sjöinkomst eller andra specialfall.'));
      if(options.foreignEmploymentExemption!=='none'&&options.foreignEmploymentExemptionConfirmed!==true) errors.push(taxText('Bekräfta villkoren för sexmånaders-/ettårsregeln innan befrielse används.'));
      return errors;
    },
  };
}

export function swedishForeignTaxCreditValidation(options, taxText) {
 const errors=[];
 for(const key of ['foreignTaxPaidAmount','foreignTaxAttributableOrdinaryTax'])if(options[key]!==undefined&&(!Number.isFinite(options[key])||options[key]<0))errors.push(taxText('Avräkning: ange icke-negativa nominella belopp i SEK.'));
 if((options.foreignTaxPaidAmount>0||options.foreignTaxAttributableOrdinaryTax>0)&&(!Number.isInteger(options.foreignTaxCreditYear)||options.foreignTaxCreditYear<2025||options.foreignTaxCreditYear>2300))errors.push(taxText('Ange ett giltigt inkomstår för avräkningen.'));
 return errors;
}
