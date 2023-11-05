# dkls

This repository contains an implementation of [dkls18](https://eprint.iacr.org/2018/499), a multi-party protocol to compute ECDSA signatures.

## Installing

```
npm install
```

## Running tests

```
npm test
```

## Building

```
npm run build
```

## Motivations

Multi-Party Computation (MPC) seen from the outside looks like an obscure, complicated, dangerous art. For my own understanding I set a goal to implement at least one MPC protocol to crack open that black box and see for myself what's behind MPC.

I'm writing this in Typescript because there's no good existing package (that I know of) and I can think of fun applications if MPC protocols were available in browsers directly instead of being confined to the server side (there is an existing dkls implementations [in Go](https://github.com/coinbase/kryptology/tree/master/pkg/tecdsa/dkls), some MPC protocol implementations [in Rust](https://gitlab.com/thorchain/tss/multi-party-ecdsa-docker/-/tree/master/src/protocols?ref_type=heads), but overall: it's sparse!).

Why dkls18? Looking at what's implemented today, the world needs more concrete implementations and fewer papers. [GG18](https://eprint.iacr.org/2019/114.pdf), [GG20](https://eprint.iacr.org/2020/540), [Lindell 17](https://eprint.iacr.org/2017/552.pdf), [dkls18](https://eprint.iacr.org/2018/499)...none of these protocols have solid implementations across many languages. I happen to have a special relationship with dkls18: it's a paper I've been trying to read and understand for a while now. Implementing it would mean that I've finally made it. Without implementing it I can fool myself into thinking I understand it but we all know that severe gaps might still be there. I want to make sure there are no such gaps.

## Implementation philosophy

I'm here to learn and help others learn, hence **clarity** being of utmost importance. Clarity is also good for security, but the code here shouldn't be considered secure or production ready. I'm not planning to pay for an audit.

Another very important thing I'll try to do here is optimize for **correctness**. I want tests, I want confidence that it all works, and I want others to be convinced of the same.

That being said, if you are looking to use this for commercial purposes, please reach out especially if you are willing to pay for an audit. I'm more than happy to add references to audit reports in here so that others can benefit as well.

The [LICENSE](./LICENSE) I'm starting with is a permissive one: the honorable Apache 2.0 license. In other words: you may use this in pretty much any way you want as long as you properly do attribution. Also: I'm not liable for anything that happens should you choose to use this software.

## Contributing

Contributions are welcome in the form of pull requests, issues, or discussions.