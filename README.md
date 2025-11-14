# Mintbase Creative Marketplace

This repository contains the Mintbase Foundation grant implementation for a DAO-governed marketplace for emotionally-responsive digital art.

## Project Overview

We propose developing a marketplace and DAO governance system for emotionally-responsive digital art using Mintbase's NFT infrastructure. This module will create a community-driven platform for creators to mint, sell, and govern interactive NFTs that respond to emotional input, with revenue sharing and transparent decision-making processes.

## Features

- **Interactive NFT Marketplace**: Mint and trade emotionally-responsive NFTs
- **DAO Governance**: Community-driven decision making with emotional consensus
- **Revenue Sharing**: Creator compensation and community rewards
- **Mintbase Integration**: Native Mintbase NFT store and wallet integration
- **Emotional Voting**: Weighted voting system based on emotional engagement

## Getting Started

### Prerequisites

- Rust and Cargo
- Node.js and npm
- Mintbase wallet
- NEAR CLI

### Installation

```bash
# Install CLI tools
./scripts/install-cli-tools.sh

# Build the project
./build-mintbase-grant.sh
```

### Building

```bash
# Build marketplace contracts
cd src/marketplace
cargo build --target wasm32-unknown-unknown --release
```

### Deployment

1. Deploy contracts to NEAR testnet
2. Create Mintbase store
3. Update contract IDs in test-website configuration
4. Serve test-website on a web server

## Directory Structure

```
├── src/
│   ├── marketplace/           # Marketplace smart contracts
│   └── rust-client/           # Core Rust library (shared dependency)
├── test-website/              # Browser-based frontend
├── scripts/                   # Utility scripts
├── build-mintbase-grant.sh    # Build script
└── README.md                 # This file
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- **Website**: https://compiling-org.netlify.app
- **GitHub**: https://github.com/compiling-org
- **Email**: kapil.bambardekar@gmail.com, vdmo@gmail.com
