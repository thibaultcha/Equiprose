# custom-logger

`custom-logger` is a simple, yet highly customizable logging plugin for node.js.

I'm still very much still learning node.js, and this is my first "official" module. If you notice any unusual or depracated coding behaviors be sure to let me know, like I said, I'm still learning! (:

If you have any questions or feedback, or need any help using this module, please contact <a href="http://twitter.com/#!/felix_mc" target="_blank">@felix_mc</a>.


## Basic Usage

	var log = require('custom-logger').config({ level: 0 });
	
	log.info( 'hello world!' );
	
	log.warn( 'carefule there, world!' );
	
	log.error( 'WHOA WHOA WHOA world?!' );

The above code will render to: 

![basic output snapshot](https://github.com/felixmc/custom-logger/raw/master/snapshots/basic.png)

`custom-logger` uses logging levels and different event types to determine what is being outputed at any given time. Below are the default events and their respective logging levels:

	0 => info
	1 => warn
	2 => error

As you can see above, you can use the `level` parameter in the `config` method to set the current logging level. You can call the `config` method on the `log` object multiple times throughout your code to change the log level or other options.

`custom-log` will only show events whose level is **equal to or higher** than the one set. For example a level of `0` will show all event types, whereas a level of `1` will only show the event types `warning` and `error`. By default the logging level is `0`.

## Customizing Events Types

One cool thing you can do with `custom-logger` is you easily create your own additional event types:

	log.new({
		debugger: { level: 1, event: "debug", color: "yellow" }
	});
	
	log.debugger( "is this a bug?" ); //outputs "debug:  is this a bug?"

In the parameters passed to the `new` method, the key (`debugger`) is the method to be added to the module, where as the `event` property is what is going to be displayed in the log as the event type. Don't the get two confused!

You can also overwrite the default events (`info`, `warn`, `error`) with your own if you'd like to:

	log.new({
		info: { color: 'cyan', level: 0, event: 'info' },
		notice: { color: 'yellow', level: 1, event: 'notice' },
		warn: { color: 'yellow', level: 2, event: 'warning' },
		error: { color: 'red', level: 3, event: 'ERROR' }
	});

However, if all you you want to do is change some of the properties, you can also do the following:

	log.info().config({ color: 'cyan' });

	log.info('Hello World!'); //output should be cyan now

Make sure not to pass anything to the `info` method when you are configuring it, otherwise you'll probably get an error. This is the only *ugly* part of the syntax (hopefully!), I will probably fix it at a later time.

## Log Formatting

### Template

Using `custom-logger` you can also configure how the console output will look like. It uses some simple templating patterns to do so:

	%event%     => the type of event being logged, such as "info" or "warning"
	%message%   => the message to be displayed, such as "server started!"
	%timestamp% => customizable datetime (see below) for when the event occured
	%padding%   => space characters that help align the current %event%. See details sections below for more

By default the format string is:

	%timestamp% - %event%:%padding%  %message%
	
Which produces the output:

	01:08:24 - info:      hello world!
	01:08:24 - warning:   carefule there, world!
	01:08:24 - error:     WHOA WHOA WHOA world?!

You can specify the output format like so:

	var log = require('custom-logger').config({ format: "%event% %padding%[%timestamp%]: %message%" });

Which would output to:

	info    [01:06:26]:  hello world!
	warning [01:06:26]:  carefule there, world!
	error   [01:06:26]:  WHOA WHOA WHOA world?!

If you were to remove `%padding%` from the format string (which would result in `%event% [%timestamp%]: %message%`) the output would be:

	info [01:10:12]:  hello world!
	warning [01:10:12]:  carefule there, world!
	error [01:10:12]:  WHOA WHOA WHOA world?!

I hope this helps illustrate the purpose of `%padding%`.

### Timestamp

You can also modify the format of the actual `%timestamp%`. By default it's `HH:MM:ss`. You can change it as follows:

	var log = require('custom-logger').config({ timestamp: "h:MM:ss TT" });

Which should look familiar to those familiar with date formatting in other programming languages. For more information on formatting the timestamp, see <a href="http://blog.stevenlevithan.com/archives/date-time-format" target="_blank">this</a>. Since this modules relies on the `dateFormat` library, any values valid for `dateFormat` should be valid here too.

## Overwriting Global Config

You can also overwrite global settings for log template and timestamp format based on individual event types, either when you create them or by modifying existing ones:

	log.new({
		alert: { level: 3, color: 'red', event: 'alert', format: '!!!!!%event% : %message% !!!!!' }
	});

	log.error().config({ timestamp: "HH:MM:ss" });

## Further Details

### Colors

If you'd like to further customize colors or formatting of your events, take a look at the <a href="https://github.com/Marak/colors.js" target="_blank">colors</a> modules that this module depends on. Any color/formatting value that's valid for that module, should be fine to pass to the `color` parameter when creating/configuring an event type.

### Padding

Say you have three event types with the `event` properties as follows: `info`, `warning`, `error`.

The `%padding%` value is going to be different for each of the events when they are displayed. The way it's calculated is that it finds the string length of the longest event, and subtracts it from the string length of the current event, and then returns a string containg that many spaces.

For examples, the longest string of the above events is `warning`, with 7 characters. Here's how it's being worked out:

	info.length = 4     ===>  7 - 4 = 3  ===> "   "
	warning.length = 7  ===>  7 - 7 = 0  ===> ""
	error.length = 5    ===>  7 - 5 = 2  ===> "  "

If this confuses you, don't worry much about it, you don't have to use it. I simply included it to make outputing to the console prettier.
