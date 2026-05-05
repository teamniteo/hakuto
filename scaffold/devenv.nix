{
  pkgs,
  lib,
  config,
  inputs,
  ...
}: {
  languages.javascript.enable = true;
  languages.javascript.package = pkgs.nodejs_24;
  languages.javascript.bun.enable = true;
  languages.javascript.bun.install.enable = true;
  processes = {
    dev.exec = "bun run dev";
  };
}
