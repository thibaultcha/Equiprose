BIN = ./node_modules/.bin
BUILD = lib/

install:
	@npm install

dev:
	@npm install --dev

test: dev
	$(BIN)/mocha --reporter list

site:
	@node $(BUILD)

clean:
	@$(call cleanup)

define cleanup 
	node -e "require('fs').readFile('./config.json',{encoding:'utf-8'},function(err,data){if(err)throw err;require('child_process').exec('rm -rf '+JSON.parse(data).build_dir+'/*')})"	
endef

.PHONY: install dev site test clean 
