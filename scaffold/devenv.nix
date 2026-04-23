{ pkgs, lib, config, inputs, ... }:

{
  packages = [
    pkgs.bun
    pkgs.git
  ];

  processes.dev.exec = "bun run dev";

  scripts.install.exec = "bun install";
  scripts.build.exec  = "bun run build";
  scripts.deploy.exec = "bunx wrangler deploy";

  enterShell = ''
    if [ ! -d node_modules ]; then
      echo "node_modules missing — running bun install..."
      bun install
    fi
  '';
}
