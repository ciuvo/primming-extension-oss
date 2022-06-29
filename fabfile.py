# -*- coding: utf-8 -*-
# vim: set formatoptions+=l tw=99:
#
# Copyright 2019 Ciuvo GmbH. All rights reserved. This file is subject to the terms and conditions
# defined in file 'LICENSE', which is part of this source code package.
import json
import os
from fabric2 import task

DEVELOPMENT_TMPDIR = "dev-tmp"
DEVELOPMENT_TMPDIR_FIREFOX = os.path.join(DEVELOPMENT_TMPDIR, "firefox")
DEVELOPMENT_TMPDIR_CHROME = os.path.join(DEVELOPMENT_TMPDIR, "chrome")
DEVELOPMENT_FIREFOX_ID = "primming.preis.wert@gmail.com"
EXTENSION_SOURCE_PATH = "src/ext/"


@task
def link_browsers(connection):
    """

    :param connection:
    :return:
    """
    for dirname in (DEVELOPMENT_TMPDIR, DEVELOPMENT_TMPDIR_FIREFOX, DEVELOPMENT_TMPDIR_CHROME):
        if not os.path.exists(dirname):
            os.mkdir(dirname)

    class WebExtensionLinker:
        def __init__(self, target_path: str):
            self.target_path = target_path

        def link(self) -> None:
            prefix_len = len(EXTENSION_SOURCE_PATH)
            for root, dirs, files in os.walk(EXTENSION_SOURCE_PATH):
                for name in files:
                    if name == "key.pem":
                        continue

                    target_dir = os.path.join(self.target_path, root[prefix_len:])
                    target = os.path.join(target_dir, name)
                    if os.path.exists(target):
                        os.remove(target)

                    if not os.path.exists(target_dir):
                        os.makedirs(target_dir)
                    self.link_file(os.path.join(root, name), target)

        def link_file(self, source: str, dest: str) -> None:
            print("Linking {} -> {}".format(source, dest))
            os.link(source, dest)

    class FirefoxLinker(WebExtensionLinker):

        manifest_file = os.path.join(EXTENSION_SOURCE_PATH, "manifest.json")

        def link_file(self, source: str, dest: str) -> None:
            if source == self.manifest_file:
                self.write_manifest(source, dest)
            else:
                super().link_file(source, dest)

        def write_manifest(self, source: str, dest: str) -> None:
            print("Writing manifest based on {} to {}".format(source, dest))
            with open(source, "r") as fh:
                data = json.load(fh)
                data.update({"applications": {"gecko": {"id": DEVELOPMENT_FIREFOX_ID}}})
                data["version"] = data["version"][2:-8] + chr(int(data["version"][-7:-5]) + ord('a') - 1)

            with open(dest, "w") as fh:
                fh.write(json.dumps(data, indent=4))

    for linker in (
        WebExtensionLinker(DEVELOPMENT_TMPDIR_CHROME),
        FirefoxLinker(DEVELOPMENT_TMPDIR_FIREFOX),
    ):
        linker.link()
