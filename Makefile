BIN = ./node_modules/.bin
BUILD = bin/
REPORTER = spec

install:
	@npm install --production

dev:
	@npm install

test:
	@NODE_ENV=test $(BIN)/mocha --require blanket --reporter $(REPORTER)

test-cov:
	$(MAKE) test REPORTER=html-cov 1> coverage.html

test-coveralls:
	$(MAKE) test REPORTER=mocha-lcov-reporter | $(BIN)/coveralls

.PHONY: install dev site test clean test-coveralls test-cov