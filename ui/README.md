* Running the server locally

The server runs on node.js. To run the server locally, first intall required
node.js modules (while at this directory = budgetgame/ui):

    > npm install

Then start the server:

    > node api/server.js --dev

The server will run on local port 8222, you can access it at URL:

    http://localhost:8222/

* Directory structure

The following directories contain all the code:

- *site*: holds all client-side html/css/js code as well as images and
  other resources. The HTML is templated with a simple mechanism that
  lets a big HTML file to be split in modules and allows Javascript
  code to be run during "compilation", so we can plug in JS and CSS
  catenation and minification.

- *site/sankey*: the Sankey diagram code is copied here, unaltered except
  for *charts/area.js* that had to be tweaked to make it work for the
  demo.

- *dev*: contains server-side code for preparing the client-side code
  and other resources for serving.

- *api*: contains the server-side code for serving the pages and handling
  the sharing API.

- *php* contains PHP scripts that implement server functionality to be used on
  a server that does not support running a node.js server process.

The following directory is created locally, and should not be included in
the Git repository:

 - *localconfig*: holds local configuration files, namely the passwords,
   certificates and other stuff that should not be distributed with the
   code.

The following directories are created during installation and server start-up:

- *node_modules*: 3rd party node.js module installed by npm.
- *build*: build directory where the static resources (catenated/minified
  js code, expanded HTML templates, copied resources) are put.
- *database*: database file for the sharing facility, and a PID file for
  the server.



