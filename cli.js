#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { cliopts, namespacedOptions } from './src/cli-opts.js';
import { pdf, epub, html, md } from './index.js';

const { command, opts, operands } = cliopts(process.argv.slice(2));

const pkg = JSON.parse(
	readFileSync(new URL('./package.json', import.meta.url))
);

if (opts.debug) {
	console.error({
		command,
		operands,
		opts
	});
}

if (opts.version) {
	console.log(pkg.version);
	process.exit(0);
}

if (opts.help) {
	outputHelp();
}

if (!operands.length) {
	operands.push('-');
}

if (opts.markdownOptions) {
	console.error(
		`Unsupported option 'markdownOptions'. Did you mean '--md.<option>=<value>'?`
	);
	process.exit(1);
}

switch (command) {
	case 'pdf':
		if (opts.output === '-') {
			console.error(
				`Output to <stdout> is only supported for commands: 'html', 'md'.`
			);
			process.exit(1);
		}
		pdf(operands, opts);
		break;
	case 'epub':
		if (opts.output === '-') {
			console.error(
				`Output to <stdout> is only supported for commands: 'html', 'md'.`
			);
			process.exit(1);
		}
		epub(operands, opts);
		break;
	case 'html':
		html(operands, opts);
		break;
	case 'md':
		md(operands, {
			...opts,
			markdownOptions: namespacedOptions(opts, 'md')
		});
		break;
	default:
		outputHelp(true);
}

/*
	Help & version
	--------------
 */

function outputHelp(error) {
	const helpText = `percollate v${pkg.version}

Usage: 

  percollate <command> [options] url [url]...

Commands:

  pdf                    Bundle web pages as a PDF file.
  epub                   Bundle web pages as an EPUB file.
  html                   Bundle web pages as a HTML file.
  md                     Bundle web pages as a Markdown file.

Common options:

  -h, --help             Output usage information.
  -V, --version          Output program version.
  --debug                Print more detailed information.

  -o <output>,           Path for the generated bundle.
  --output=<path>        Use '-' to output to standard output ('stdout').

  --template=<path>      Path to a custom HTML template.

  --style=<path>         Path to a custom CSS file.

  --css=<style>          Additional inline CSS style.

  -u, --url=<url>        Sets the base URL when HTML is provided on stdin.
                         Multiple URL options can be specified.

  -w, --wait=<sec>       Process the provided URLs sequentially, 
                         pausing a number of seconds between items.

  -t <title>,            The bundle title.
  --title=<title>

  -a <author>,           The bundle author.
  --author=<author>

  --individual           Export each web page as an individual file.

  --toc                  Generate a Table of Contents.
                         Implicitly enabled when bundling more than one item.

  --toc-level=<level>    A number between 1 (default) and 6, representing
                         the maximum level of headings to include in the 
                         Table of Contents. Implies '--toc'.

  --cover                Generate a cover for the PDF / EPUB.
                         Implicitly enabled when bundling more than one item
                         or the --title option is provided.

  --browser=<browser>    One of 'chrome' (default), 'firefox'.
                         Used for producing PDF and the cover image for EPUB.

  --hyphenate            Enable hyphenation. Enabled by default for PDF.

  --inline               Embed images inline with the content.
                         Fetches and converts images to Base64 'data:' URLs.

  --unsafe               Disable some validations in JSDOM to suppress some
                         errors thrown for invalid HTML inputs. 

Options to disable features:

  --no-amp               Don't prefer the AMP version of the web page.
  --no-toc               Don't generate a table of contents.
  --no-cover             Don't generate a cover.
  --no-hyphenate         Disable hyphenation.

PDF options: 

  --no-sandbox           Passed to Puppeteer.

Markdown options:

  --md.<option>=<value>  Options to pass to the Markdown stringifier,
                         the 'mdast-util-to-markdown' library.

Operands:

  percollate accepts one or more URLs.

  Use the hyphen character ('-') to specify 
  that the HTML should be read from stdin.

Examples:

  Single web page to PDF:

    percollate pdf --output my.pdf https://example.com

  Single web page read from stdin to PDF:

    curl https://example.com | percollate pdf -o my.pdf -u https://example.com -

  Several web pages to a single PDF:

    percollate pdf --output my.pdf https://example.com/1 https://example.com/2

  Custom page size and font size:

    percollate pdf --output my.pdf --css "@page { size: A3 landscape } html { font-size: 18pt }" https://example.com
`;
	if (error) {
		console.error(helpText);
		process.exit(1);
	}
	console.log(helpText);
	process.exit(0);
}
