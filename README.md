# Pelion Edge provisioning (pep) tool

The Pelion Edge provisioning (pep) tool lets you automate the gateway provisioning flow. For more information, please see the [documentation](https://developer.pelion.com/docs/device-management-edge/latest/provisioning/index.html).

## Tests

Run `factory-configurator-client-example`, if it is not installed, follow [the document about building the FCC example on native Linux](https://developer.pelion.com/docs/device-management-provision/latest/ft-demo/building-demo.html#native-linux) for the detailed steps. Below are the quick steps that install the program. For example, in the `meta-pelion-edge` project you can find the precompiled binary located at `/wigwag/wwrelay-utils/I2C/factory-configurator-client-armcompiled.elf`.

<span class="notes">**Note:** This tool is not supported on macOS, so if you are running the server on macOS, you can't test pep CLI on the same machine.</span>

```
pip3 install mbed-cli
git clone https://github.com/ARMmbed/factory-configurator-client-example.git
cd factory-configurator-client-example
rm -rf mbed-os.lib
mbed deploy
python3 pal-platform/pal-platform.py deploy --target=x86_x64_NativeLinux_mbedtls generate
cd __x86_x64_NativeLinux_mbedtls
cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=Release -DCMAKE_TOOLCHAIN_FILE=./../pal-platform/Toolchain/GCC/GCC.cmake -DEXTERNAL_DEFINE_FILE=./../linux-config.cmake
make factory-configurator-client-example.elf
```

Binary is located at:

```
./Release/factory-configurator-client-example.elf
```

After running that, start the tests -

```
FCCE_IP=<ip> FCCE_PORT=<port> npm run test
```

For coverage,

```
npm run coverage
```

## Issues

We use [GitHub issues](https://github.com/PelionIoT/pelion-edge-provisioner/issues) to track requests and bugs.

## License

[Apache License 2.0](LICENSE)
