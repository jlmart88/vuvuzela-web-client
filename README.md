# Vuvuzela-web

## WARNING: OUTDATED

This client was built to function with a version of Vuvuzela from 2015 (before integration with Alpenhorn), and it has not been updated since. It has not been officially integrated with the rest of the Vuvuzela ecosystem, and is not currently being maintained by the Vuvuzela project owners. - jlmart88 (02/08/2018)

---

This is a browser implementation of the client for [Vuvuzela](https://github.com/davidlazar/vuvuzela), a private messaging system.

![client](https://github.com/jlmart88/vuvuzela-web-client/blob/master/screenshots/client.png)

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://www.ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`
* `bower install`

## Running / Development

* `ember server`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Configuration

Until a PKI has been integrated into Vuvuzela (See issue tracked [here](https://github.com/davidlazar/vuvuzela/issues/1)), the PKI is hard coded, as with the CLI client implementation. For working with the hard coded implementation:

* List all usernames/public keys in `app/services/pki.js`
* List all server keys in `app/services/session.js`
* Replace `wsAddress` in `config/environment.js` with the address of the Vuvuzela Entry Server

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://www.ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

