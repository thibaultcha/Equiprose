BIN = ./node_modules/.bin
BUILD = engine/

install:
	@npm install --production

dev:
	@npm install

test: dev
	$(BIN)/mocha --reporter spec

site:
	@node $(BUILD)

clean:
	@$(call cleanup)

define cleanup 
	node -e "require('fs').readFile('./config.json',{encoding:'utf-8'},function(err,data){if(err)throw err;require('child_process').exec('rm -rf '+JSON.parse(data).build_dir+'/*')})"	
endef

.PHONY: install dev site test clean 
