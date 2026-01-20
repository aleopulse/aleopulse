# LeoPulse Aleo Contracts Makefile
# Manages building and deploying all programs

SHELL := /bin/bash
ROOT_DIR := $(shell pwd)

# Load environment variables
include .env
export

# Programs in deployment order (pulse first as others may depend on it)
PROGRAMS := pulse poll staking swap

.PHONY: all build clean deploy deploy-all check-balance help

help:
	@echo "LeoPulse Aleo Contracts"
	@echo ""
	@echo "Commands:"
	@echo "  make build        - Build all programs"
	@echo "  make deploy-all   - Deploy all programs to testnet"
	@echo "  make deploy-pulse - Deploy pulse.aleo"
	@echo "  make deploy-poll  - Deploy poll.aleo"
	@echo "  make deploy-staking - Deploy staking.aleo"
	@echo "  make deploy-swap  - Deploy swap.aleo"
	@echo "  make check-balance - Check account balance"
	@echo "  make clean        - Clean build artifacts"

# Build all programs
build:
	@for prog in $(PROGRAMS); do \
		echo "Building $$prog..."; \
		cd $(ROOT_DIR)/$$prog && leo build || exit 1; \
	done
	@echo "All programs built successfully!"

# Clean build artifacts
clean:
	@for prog in $(PROGRAMS); do \
		echo "Cleaning $$prog..."; \
		rm -rf $(ROOT_DIR)/$$prog/build; \
	done
	@echo "Cleaned all build artifacts."

# Check account balance
check-balance:
	@echo "Checking balance for account..."
	@snarkos developer scan --private-key $(PRIVATE_KEY) --network testnet --endpoint $(ENDPOINT) 2>/dev/null || \
		echo "Use Aleo faucet to get testnet credits: https://faucet.aleo.org"

# Deploy all programs
deploy-all: deploy-pulse deploy-poll deploy-staking deploy-swap
	@echo ""
	@echo "========================================="
	@echo "All programs deployed successfully!"
	@echo "========================================="

# Deploy individual programs
deploy-pulse:
	@echo "Deploying pulse.aleo..."
	cd $(ROOT_DIR)/pulse && leo deploy \
		--private-key $(PRIVATE_KEY) \
		--network $(NETWORK) \
		--endpoint $(ENDPOINT) \
		--priority-fees $(PRIORITY_FEE) \
		--broadcast \
		--yes

deploy-poll:
	@echo "Deploying poll.aleo..."
	cd $(ROOT_DIR)/poll && leo deploy \
		--private-key $(PRIVATE_KEY) \
		--network $(NETWORK) \
		--endpoint $(ENDPOINT) \
		--priority-fees $(PRIORITY_FEE) \
		--broadcast \
		--yes

deploy-staking:
	@echo "Deploying staking.aleo..."
	cd $(ROOT_DIR)/staking && leo deploy \
		--private-key $(PRIVATE_KEY) \
		--network $(NETWORK) \
		--endpoint $(ENDPOINT) \
		--priority-fees $(PRIORITY_FEE) \
		--broadcast \
		--yes

deploy-swap:
	@echo "Deploying swap.aleo..."
	cd $(ROOT_DIR)/swap && leo deploy \
		--private-key $(PRIVATE_KEY) \
		--network $(NETWORK) \
		--endpoint $(ENDPOINT) \
		--priority-fees $(PRIORITY_FEE) \
		--broadcast \
		--yes
