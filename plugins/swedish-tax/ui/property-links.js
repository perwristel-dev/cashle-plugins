const calendarDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;

export function validateHistoricalHomeSale({ options, owner, people, planStart: from, taxOptions }, t) {
  const openingAssessments = taxOptions?.openingAssessments;
  const records = Array.isArray(openingAssessments) ? openingAssessments : [];
  if(!calendarDate(options?.contractDate) || !calendarDate(from) || options.contractDate>=from || options.contractDate.slice(0,4)===from.slice(0,4))return [];
  const errors=[],taxYear=Number(options.contractDate.slice(0,4));
  if(!Number.isFinite(options.contractPrice)||options.contractPrice<=0)errors.push(t('Ange avtalat försäljningspris för det tidigare kontraktet.'));
  const allocated=owner==='joint'?people:people.filter(person=>person.id===(owner??'self'));
  if(!allocated.length)errors.push(t('Bostadens ägare saknas.'));
  for(const person of allocated) {
    const assessment=records.find(row=>row?.personId===person.id && row.taxYear===taxYear);
    if(!assessment)errors.push(t('Ange ingående skattebesked för {person} och inkomstår {year}.',{person:person.name??person.id,year:taxYear}));
    const suffix=owner==='joint'?(person.id==='self'?'Self':'Partner'):'';
    const status=options[`deferralStatus${suffix}`]??'none';
    if(taxYear<Number(from.slice(0,4))-1) {
      const outcome=options[`historicalProvisionalOutcome${suffix}`];
      if(!['none','reinstated','final'].includes(outcome))errors.push(t('Ange hur tidigare preliminärt uppskov för {person} prövades.',{person:person.name??person.id}));
      else if(outcome!=='none') {
        if(!records.some(row=>row?.personId===person.id && row.taxYear===taxYear+1))errors.push(t('Ange ingående skattebesked för {person} och prövningsåret {year}.',{person:person.name??person.id,year:taxYear+1}));
        if(outcome==='reinstated' && status!=='none' || outcome==='final' && status!=='final')errors.push(t('Uppskovets status måste motsvara den tidigare prövningen.'));
      }
    }
    if(status==='provisional') {
      if(taxYear<Number(from.slice(0,4))-1)errors.push(t('Ett äldre preliminärt uppskov måste först slutligt prövas.'));
      const value=options[`requestedDeferral${suffix}`],maximum=options[`requestMaximumDeferral${suffix}`];
      if(maximum!==false || !Number.isFinite(value) || value<=0)errors.push(t('Ange faktiskt preliminärt uppskov för {person}; välj inte beräknat maxbelopp.',{person:person.name??person.id}));
      if(assessment?.status==='pending')errors.push(t('Preliminärt historiskt uppskov måste vara fastställt före kalkyldatumet.'));
    } else if(status==='final') {
      const value=options[`requestedDeferral${suffix}`],maximum=options[`requestMaximumDeferral${suffix}`],replacement=options[`replacementHomeId${suffix}`];
      if(maximum!==false || !Number.isFinite(value) || value<=0 || !replacement)errors.push(t('Ange faktiskt slutligt uppskov och ersättningsbostad för {person}; välj inte beräknat maxbelopp.',{person:person.name??person.id}));
      if(assessment?.status==='pending')errors.push(t('Slutligt historiskt uppskov måste vara fastställt före kalkyldatumet.'));
    } else if(status!=='none')errors.push(t('Välj ett giltigt historiskt uppskov.'));
    if((options[`requestedReinstatement${suffix}`]??0)>0)errors.push(t('Återföring efter den historiska försäljningen måste anges på ersättningsbostaden.'));
  }
  return errors;
}
