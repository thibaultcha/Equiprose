BIN = ./node_modules/.bin
BUILD = bin/
REPORTER = spec

install:
	@npm install --production

dev:
	@npm install

test: dev
	@NODE_ENV=test $(BIN)/mocha --require blanket --reporter $(REPORTER)

test-cov: dev
	$(MAKE) test REPORTER=html-cov 1> coverage.html

test-coveralls: dev
	$(MAKE) test REPORTER=mocha-lcov-reporter | $(BIN)/coveralls

site:
	@node $(BUILD)

clean:
	@$(call cleanup)

define cleanup 
	node -e "require('fs').readFile('./config.json',{encoding:'utf-8'},function(err,data){if(err)throw err;require('child_process').exec('rm -rf '+JSON.parse(data).build_dir+'/*')})"	
endef

.PHONY: install dev site test clean test-coveralls test-cov
