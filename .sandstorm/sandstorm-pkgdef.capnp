@0xb0c9c98147bea6cf;

using Spk = import "/sandstorm/package.capnp";
# This imports:
#   $SANDSTORM_HOME/latest/usr/include/sandstorm/package.capnp
# Check out that file to see the full, documented package definition format.

const pkgdef :Spk.PackageDefinition = (
  # The package definition. Note that the spk tool looks specifically for the
  # "pkgdef" constant.

  id = "n4n49dkfyskmhcmg5h0mfzk4kjvce2jcs8ravr7y7uw9xs2pzghh",
  # Your app ID is actually its public key. The private key was placed in
  # your keyring. All updates must be signed with the same key.

  manifest = (
    # This manifest is included in your app package to tell Sandstorm
    # about your app.

    appTitle = (defaultText = "TextEditor"),

    appVersion = 5,  # Increment this for every release.

    appMarketingVersion = (defaultText = "0.0.5"),
    # Human-readable representation of appVersion. Should match the way you
    # identify versions of your app in documentation and marketing.

    actions = [
      # Define your "new document" handlers here.
      ( title = (defaultText = "New Document"),
        command = .myCommand
        # The command to run when starting for the first time. (".myCommand"
        # is just a constant defined at the bottom of the file.)
      )
    ],

    continueCommand = .myCommand,
    # This is the command called to start your app back up after it has been
    # shut down for inactivity. Here we're using the same command as for
    # starting a new instance, but you could use different commands for each
    # case.


    metadata = (
      icons = (
        appGrid = (svg = embed "files/icon.svg"),
        grain = (svg = embed "files/icon.svg"),
        market = (svg = embed "files/icon.svg"),
        marketBig = (svg = embed "files/icon.svg"),
      ),

      website = "https://github.com/rchrd2/texteditor",
      codeUrl = "https://github.com/rchrd2/texteditor",
      license = (openSource = mit),
      categories = [office, productivity],

      author = (
        contactEmail = "me@rchrd.net",
        pgpSignature = embed "files/pgp-signature",
        upstreamAuthor = "Richard Caceres",
      ),
      pgpKeyring = embed "files/pgp-keyring",

      description = (defaultText = embed "files/description.md"),
      shortDescription = (defaultText = "Plain text editor"),

      screenshots = [
        (width = 797, height = 627, png = embed "files/screenshot-01.png"),
        (width = 797, height = 627, png = embed "files/screenshot-02.png")
      ],

      changeLog = (defaultText = embed "../CHANGELOG.md"),
    ),

  ),

  sourceMap = (
    # The following directories will be copied into your package.
    searchPath = [
      ( sourcePath = "/home/vagrant/bundle" ),
      ( sourcePath = "/opt/meteor-spk/meteor-spk.deps" )
    ]
  ),

  alwaysInclude = [ "." ],
  # This says that we always want to include all files from the source map.
  # (An alternative is to automatically detect dependencies by watching what
  # the app opens while running in dev mode. To see what that looks like,
  # run `spk init` without the -A option.)

  bridgeConfig = (
    viewInfo = (
      permissions = [(name = "modify", title = (defaultText = "modify"),
                      description = (defaultText = "allows modifying the document"))],
      roles = [(title = (defaultText = "viewer"),
                permissions = [false],
                verbPhrase = (defaultText = "can view"),
                default = true),
               (title = (defaultText = "editor"),
                permissions = [true],
                verbPhrase = (defaultText = "can edit"))]
    )
  )
);

const myCommand :Spk.Manifest.Command = (
  # Here we define the command used to start up your server.
  argv = ["/sandstorm-http-bridge", "8000", "--", "/opt/app/.sandstorm/launcher.sh"],
  environ = [
    # Note that this defines the *entire* environment seen by your app.
    (key = "PATH", value = "/usr/local/bin:/usr/bin:/bin")
  ]
);
