# Italian unit-linked life insurance

Use this investment account for a domestic individual unit-linked life policy
under the ordinary Italian substitute-tax regime. Enter the current redeemable
value and the remaining fiscally recognized premiums as its cost basis. Future
deposits are recognized premiums. Use a surrender or account closure for
distributions from the policy.

The model allocates premiums to each partial surrender in proportion to gross
proceeds divided by the current full surrender value. It taxes the positive
difference as capital income at the ordinary 26% rate. Surrenders at a loss
generate no credit. The tax is withheld when money leaves the policy. It is
included in the annual tax settlement against the corresponding tax already
paid.

When the insurer supplies the eligible government-bond share of the surrender
gain, enter that share. The model includes 48.08% of that component in the
26% tax base, for an effective rate near 12.5%. The share reflects the insurer's
tax computation. A current portfolio allocation alone does not establish it.
Enter zero to apply the standard rate to the entire positive gain.

Use a value and return assumption that reflects contract charges and stamp
duty when applicable. This model covers ordinary lifetime surrenders in the
current regime. Death benefits, pre-July 2014 gains, nonresident policies,
foreign insurance, separately scheduled interim benefits and insurer-specific
tax treatment need additional facts.

The [direct example](doc/direct-model.cashle) surrenders a €30,000 policy with
€20,000 of remaining premiums and withholds €2,600.

```sh
cashle plugins/italian-unit-linked/doc/direct-model.cashle --classpath plugins/italian-unit-linked:plugins/italian-tax
```

[TUIR Article 45(4), insurance proceeds and premiums](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.articolo.numero=45&atto.codiceRedazionale=086U0917&atto.dataPubblicazioneGazzetta=1986-12-31) ·
[Decree-Law 66/2014, Article 3, ordinary rate and government-bond treatment](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.articolo.numero=3&atto.codiceRedazionale=14G00079&atto.dataPubblicazioneGazzetta=2014-04-24) ·
[IVASS insurance tax research](https://www.ivass.it/pubblicazioni-e-statistiche/pubblicazioni/quaderni/2025/iv34/Quaderno_34.pdf)
