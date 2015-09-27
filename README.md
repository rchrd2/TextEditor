# TextEditor

TextEditor is an extremely basic plain text editing application for SandstormIO built with MeteorJS. However, since it's using MeteorJS, it *is* reactive, and data is live updated across clients.

## Usage

```
meteor serve
```

## Building for SandstormIO

Follow the vagrant spk steps found here https://docs.sandstorm.io/en/latest/vagrant-spk/platform-stacks/#meteor-platform-stack

Copied for posterity:

---

## Meteor platform stack

For a Meteor app, keep the following in mind:

* Run `vagrant-spk setupvm meteor`
* Run `vagrant-spk up`. Note this will print _lots_ of red text; sorry about that, then abruptly end.
* Run `vagrant-spk init` and edit `.sandstorm/sandstorm-pkgdef.capnp`
* Run `vagrant-spk dev` and make sure the app works OK at http://local.sandstorm.io:6080/
* Run `vagrant-spk pack ~/projects/meteor-package.spk` and you have a package file!

---


## Credits

Richard Caceres (@rchrd2)

## License

MIT
