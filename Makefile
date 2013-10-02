BIN = ./node_modules/.bin
BUILD = build/

install:
	@npm install

dev:
	@npm install --dev

site:
	@node $(BUILD)

test: build
	$(BIN)/mocha --reporter list

clean:
	@$(call cleanup)

define cleanup 
	node -e "require('fs').readFile('./config.json',{encoding:'utf-8'},function(err,data){if(err)throw err;require('child_process').exec('rm -rf '+JSON.parse(data).build_dir+'/*')})"	
endef

.PHONY: install dev site test clean 
