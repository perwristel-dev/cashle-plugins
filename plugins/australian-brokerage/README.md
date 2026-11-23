# Australian brokerage account

The account models one identified acquisition lot. Withdrawals sell
proportionately within that lot. Cash dividends may carry franking credits,
and the policy records eligibility for the CGT discount on each disposal.

From the repository root, build the installation ZIP using Node.js and `zip`.

```sh
node plugins/australian-brokerage/build.mjs
```

Install `cashle-account-au-brokerage-source.zip` in the personal plugin
repository and enable it alongside the [Australian tax plugin](../australian-tax/).
Reload Cashle and select the Australian brokerage account in an Australian plan.

The [direct model](doc/direct-model.cashle) closes a lot worth AUD 15,000 with
a basis of AUD 10,000 and computes the resulting tax together with annual wages.

```sh
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/australian-brokerage/doc/direct-model.cashle --classpath plugins/australian-brokerage --classpath plugins/australian-tax
```

See the [rule research and sources](../../docs/tax-anglosphere-research.md#australia).
