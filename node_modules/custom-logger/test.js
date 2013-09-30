
var log = require('./logger').config({ level: 0 });

log.info( 'hello world!' );
	
log.warn( 'carefule there, world!' );
	
log.error( 'WHOA WHOA WHOA world?!' );
