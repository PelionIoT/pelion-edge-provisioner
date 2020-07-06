# pelion-edge-provisioner (pep)

If you are looking to automate the Pelion Device Management (PDM) provisiong flow then this is the tool for you. It provisions the gateways in production mode by injecting the identity certificates and configuration information over IP. The automation is possible because of the following features of this tool -

- Certificate injection initiation from gateway and not from [Factory Configurator Utility (FCU)](https://www.pelion.com/docs/device-management/current/provisioning-process/index.html).
- Record the enrollment identity and configuration information of all the provisioned gateways.

A typical use case is to make it part of the factory process to automate the provisioning of gateways coming off of the factory line. Internally, it is used by the engineering teams to iteratively test the Pelion Edge firmware in production mode without the need for developers to setup seperate or individual FCUs. It is also used by QA teams to automate the regression testing and CI workflows.

Follow [this](https://www.pelion.com/docs/device-management/current/provisioning-process/index.html) link to know more about the default Pelion Device Management provisioning process.

## Architecture

Typically the default gateway provisioning flow is for FCU (running outside the gateway) to injects the credentials in the gateway over IP. The initial condition is to know the serial number and IP address of the gateway. Thus, this flow cannot be automated as it requires manual effort to read the serial number and IP address off of the gateway. Hence, the Pelion Edge provisioning tool inverts this flow by providing REST APIs which allows gateways to send its serial number and IP address to the server and request for the credentials on-demand.

The server also saves the identity information and gateway configurations in the database which can later be downloaded by customer or uploaded to a server for inventory management or to prime the system for first-to-claim process.

The server is a multi-container Docker application with two services -

1. pep-api-server - is a node.js based RESTful web service which exposes APIs consumed by the client - [pep-cli](#cli). The API documentation can be found [here](./docs/api-swagger-doc.yml). This service internally interacts with FCU and leverages the [ft-demo tool](https://www.pelion.com/docs/device-management-provision/latest/ft-demo/index.html), which provides the IP interface to inject the certificates in the gateway. Thus the precursor to building the Docker image is to successfully download the factory_configurator_utility archive file from PDM Portal and configure it according to your use case. The details of that can be found in the [Prerequisite section](#prerequisite). To know more about the Docker image the instructions used to assemble it are stated in this [Dockerfile](./Dockerfile).

1. mongo - is a service which deploys an instance of MongoDB. The database is used for recordkeeping, it stores the non-sensitive information of the gateway such as gateway's serial number and its configuration parameter values. Once the gateway is provisioned successfully in first-to-claim mode, it also stores the enrollment identity which is the fingerprint of the device certificate of the gateway but it never stores the device certificate itself. The stored information can be exported into CSV format using [pep-cli](#cli) which can be used by the customer for inventory managment or when using [first-to-claim process](https://www.pelion.com/docs/device-management/current/connecting/device-ownership-first-to-claim-by-enrollment-list.html), it can be uploaded to the Portal using [Bulk upload feature](https://portal.mbedcloud.com/devices/enrollment/new).

Docker's [compose](https://docs.docker.com/compose/) tool is used to configure and define the above service containers. It creates -
- a default `bridge` network which setup for containers to communicate with each other.
- a docker volume `mongo_data` is created to persistently store the mongo data.

The versions of various services used in the docker-compose are listed in the environment file `.env`

<p align="center"><img src="./assets/pep-arch.png" width="454" height="410"/></p>

## Current limitations
- Cannot provision the gateways in development mode.
- Do not support injection of identity certificates and configuration information over serial.
- Setting of `device-key-generation-mode` parameter to `externally_supplied` in fcu.yml is not supported.
- Setting of `first-to-claim` parameter to `false` in fcu.yml is not supported.
- Auto discovery of the IP address of the machine running pep-api-server.

## Setup requirements
The server can run on any Docker supported platform and client on any Pelion Edge supported platforms. Both the machines should have an IP address and connected to the same LAN network. Further, server machine should allow inbound and outbound HTTP traffic on port 5151 and also TCP traffic on the port used by Factory Configurator Client (FCC) which is running on the client machine.

Note: We recommend that you install the server on a secure machine or in a secure room or both in order to protect the device keys and certificates. You should setup production flow in accordance with good security practices and use secure processes and Hardware Security Module (HSM) hardware when possible.

## Prerequisite

To build the `pep-api-server` docker image, the following files are required:

1. factory_configurator_utility.zip

    Arm licenses FCU to Device Management customers that manufacture connected devices. Please [contact us](https://cloud.mbed.com/contact) for more information. Authorized customers can download the tool and documentation from the [Device Management Portal](https://portal.mbedcloud.com/login).

1. fcu.yml

    [Follow the documentation](https://www.pelion.com/docs/device-management-provision/1.2/fcu/config-fcu.html) on how to configure FCU. You can find the default `fcu.yml` in the archive file at `factory_configurator_utility.zip/config/fcu.yml`.

    Example: Typically we configure `fcu.yml` with following values, everything else remains unchanged.

    | Parameter     | Value      |
    | ------------- |:----------:|
    | use-bootstrap | true |
    | time-sync | true |
    | verify-on-device | true |
    | first-to-claim | true |
    | update-auth-certificate-file | <%= ENV['FCU_RESOURCES_DIR'] %>/update-auth-certificate.der |
    | vendor-id | '42fa7b48-1a65-43aa-890f-8c704daade54' |
    | class-id | 'c56f3a62-b52b-4ef6-95a0-db7a6e3b5b21' |
    | device-info | *fill the information as per your organization* |
    | device-key-generation-mode | by_tool |
    | device-certificate | *fill the information as per your organization* |
    | entropy-generation-mode | by_device |

1. Certificate authority

    When your devices connect to Device Management, it needs to trust the certificate authority (CA) certificate that issued the device certificate, or one of the CAs in the device certificate chain of trust. To set up a certificate authority, follow the documentation to [create your own CA](https://www.pelion.com/docs/device-management-provision/1.2/fcu/using-CA.html#creating-a-ca-certificate). You can also setup [FCU as a CA](https://www.pelion.com/docs/device-management-provision/1.2/fcu/fcu-ca.html) but that requires you to manually install the FCU and invoke the `setup` API. As installation of FCU is automated in the Docker build process, we recommend you to use the above document to generate your own CA. Place the generated private key - `CA_private.pem` and certificate - `CA_cert.pem` in the folder called `keystore` as shown in the following step.

    Caution: The OpenSSL commands in the docs are for reference only. You must adapt the commands to your own production setup and security requirements.

    Note: As you are creating your own certificate authority, do not populate the X.509 properties in the `certificate-authority`section of the fcu.yml configuration file.

    **Upload the CA certificate** - You have to upload this CA certificate to Device Management to allow it to trust the device certificates signed by this CA and then connection to Device Management. Follow [this document](https://www.pelion.com/docs/device-management/current/provisioning-process/managing-ca-certificates.html) to learn about the various ways you can achieve this and also how to manage the lifecycle of the CAs.

    Make sure to select "Enrollment" in the field "How will devices use this certificate".

1. Firmware update authentication certificate (optional)

    This step is optional unless firmware update capability is required. [Follow the documentation](https://www.pelion.com/docs/device-management/current/updating-firmware/update-auth-cert.html) to create a firmware update authentication certificate.

    You can use the [manifest tool](https://github.com/ARMmbed/manifest-tool) to generate the authentication certificate. This enables you to quickly and easily develop the firmware updates for your gateway. These certificates generated above are not suitable for production environments. Only use them for testing and development.

    For example, generally in developer flow we run this command to generate the update certificate -

    ```
    manifest-tool init -m "<product model identifier>" -V 42fa7b48-1a65-43aa-890f-8c704daade54 -q
    ```
    You can find the DER formatted update certificate at location  `.update-certificates/default.der`. Rename it to `update-auth-certificate.der` and place it in the folder mentioned in the next step.

    Note: To unlock the rich node features, such as gateway logs and the gateway terminal in the Pelion web Portal, pass the command-line parameter -V 42fa7b48-1a65-43aa-890f-8c704daade54 to the manifest tool. Contact the service continuity team at Arm to request they enable Edge gateway features in your Pelion web Portal account. By default, the features are not enabled.

1. Place all of the above files in a folder in this structure.

    Note: Place this folder in the root directory of the repository in order for the contents to be copied to the Docker container.

    ```
    ./fcu_config_dir
    --- fcu.yml
    --- factory_configurator_utility.zip
    --- update-auth-certificate.der
    --- keystore
    --- --- CA_private.pem
    --- --- CA_cert.pem
    ```

Manually run the validator `./fcu-config-validator.sh` on fcu_config_dir to verify respective files are in the above structure.

## Install server using Docker

Use `docker-compose` to build and run the containers.

### Build

These docker-compose commands have been tested with docker-compose version 1.25.0

```
docker-compose build --build-arg fcu_config=<fcu_config_relative_dir_path>
```

### Run

```
docker-compose up -d
```

### Verify

Verify mongo and pep-api-server containers are running:

```
docker-compose ps
```

If a container is restarting, view the logs to troubleshoot:

```
docker-compose logs
```

View api-server logs:

```
docker logs -f pep-api-server
```

Verify mongo_data volume was created successfully:

```
docker volume inspect pelion-edge-provisioner_mongo_data
```

## CLI

`pep-cli` is a command line tool which interacts with the pep-api-server using cURL. To test you can run it on the same machine as the server but in production, it runs on the Pelion Edge supported platforms. The supported commands are detailed in the [commmands](#commands) sections.

Clone this repository on your gateway -
```
git clone https://github.com/armPelionEdge/pelion-edge-provisioner
```

Install the pep-cli to `/usr/local/bin` by creating a symlink -

```
cd pelion-edge-provisioner
ln -s `pwd`/cli/bash/pep-cli.sh /usr/local/bin/pep-cli
pep-cli --help
```

Note: Make sure `/usr/local/bin` is already in your PATH. To verify run `echo $PATH`. If not, then please add it.

Alternatively, goto -

```
cd cli/bash
./pep-cli.sh --help
```

To enable debug mode -

```
DEBUG=* pep-cli --help
```

When you run the cli on the gateway, you can provide the PEP_SERVER_URL as an env variable -

```
PEP_SERVER_URL=http://<api-server-ip-address>:5151 pep-cli --help
```

### Commands

1. get-one-identity - This command requests `pep-api-server` to create a new identity based on the passed parameters. The prerequisite is to run FCC first. The steps on how to install and run FCC are documented in the next section.

    In the request to the server you have to provide the gateway IP address and the port at which FCC is running so that server can then invoke FCU to inject a new device certificate in the gateway. Run `help` command to learn about the various parameters which you can pass.

    ```
    pep-cli get-one-identity --help
    ```

    <p align="center"><img src="./assets/pep-get-one-identity.png" width="921" height="481"/></p>

1. get-enrollment-id - Once the gateway has been injected with device certificate, you can request the server to provide the enrollment-id of the gateway so that you can upload it to the PDM account you want the gateway to be associated with.

    ```
    pep-cli get-enrollment-id --help
    ```

## Typical production provisioning and onboarding flow

1. Install FCC - Login to the gateway. If `factory-configurator-client-example` is not installed then follow [this document](https://www.pelion.com/docs/device-management-provision/1.2/ft-demo/building-demo.html#native-linux) for the detailed steps. Here are the quick steps which installs the program. For example, on meta-pelion-edge project you can find the pre-compiled binary located at `/wigwag/wwrelay-utils/I2C/factory-configurator-client-armcompiled.elf`

    Note: This tool is not supported on macOS, hence if you are running the server on macOS, you will not be able to test pep-cli on the same machine.

    ```
    pip install mbed-cli
    git clone https://github.com/ARMmbed/factory-configurator-client-example.git
    cd factory-configurator-client-example
    rm -rf mbed-os.lib
    mbed deploy
    python pal-platform/pal-platform.py deploy --target=x86_x64_NativeLinux_mbedtls generate
    cd __x86_x64_NativeLinux_mbedtls
    cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=Release -DCMAKE_TOOLCHAIN_FILE=./../pal-platform/Toolchain/GCC/GCC.cmake -DEXTERNAL_DEFINE_FILE=./../linux-config.cmake
    make factory-configurator-client-example.elf
    ```

    Binary is located at -
    ```
    ./out/Release/factory-configurator-client-example.elf
    ```

1. Prepare - stop edge-core and clear out the old provisioning files. For example, if you are running [meta-pelion-edge](https://github.com/armPelionEdge/meta-pelion-edge) on RPi 3B+, you have run the following commands -

    ```
    systemctl stop edge-core
    rm -rf /userdata/mbed/mcc_config
    rm -rf /userdata/edge_gw_config
    ```

    or run this script -

    ```
    ./example-scripts/meta-pelion-edge/prepare-for-new-identity.sh
    ```

    You will have to modify the commands or the scripts for your platform.

1. Run FCC - On the gateway, run this command

    ```
    ./factory-configurator-client-example.elf
    ```

    By default the interface is `eth0`, if required you can change the interface name -

    ```
    ETHERNET_LINUX_IFACE_NAME=wlan0 ./factory-configurator-client-example.elf
    ```

    If required, you can change the entropy source -

    ```
    export ENTROPYSOURCE=/dev/urandom
    ```

    Note down the TCP port of FCC, you will use it in the next step.

1. Fetch new identity - Open another terminal and login to the gateway. Install the `pep-cli` if not already and then run the following command. At minimum you have to pass in the serial number of the gateway, the IP address of the gateway and the TCP port at which FCC is running. Note: There is no schema enforced on the `serial_number`, hence it can be of any length with any alphanumeric and special characters. But it has to be unique, server will not provision 2 gateways with the same serial number.

    ```
    PEP_SERVER_URL=http://<api-server-ip-address>:5151 pep-cli get-one-identity -s <serial_number> -i <gateway_ip> -p <fcc_port>
    ```

1. Install new identity - Once the above command runs successfully, the factory-configurator-client-example creates a `pal` folder, and pep-cli creates `identity.json` file.

    1. Place and rename the `pal` folder to the location specified by the compile time flag `PAL_FS_MOUNT_POINT_PRIMARY` of mbed-edge. By default, its defined by [this CMake flag](https://github.com/ARMmbed/mbed-edge/blob/master/cmake/targets/default.cmake#L7) in mbed-edge project. The [meta-pelion-edge](https://github.com/armPelionEdge/meta-pelion-edge) project overwrites that to [this](https://github.com/armPelionEdge/meta-pelion-edge/blob/master/recipes-wigwag/mbed-edge-core/files/rpi3/target.cmake#L8) and snap-pelion-edge to [this](https://github.com/armPelionEdge/snap-pelion-edge/blob/master/files/edge-core/cmake/target.cmake#L6).

    Note: Before copying to that location make sure the folder is not present. If edge-core is running in the background then it creates this folder if it is not present. Thus, stop edge-core and clear out that folder before copying the `pal` folder.

    1. Place the `identity.json` to the location specified by `platform_readers/params/identity_path` of maestro configuration file. In meta-pelion-edge, its placed at [this location](https://github.com/armPelionEdge/meta-pelion-edge/blob/master/recipes-wigwag/maestro/maestro/rpi3/maestro-config-rpi3bplus.yaml#L27) and for snap-pelion-edge at [this](https://github.com/armPelionEdge/edge-utils/blob/master/conf/maestro-conf/edge-config-dell5000-demo.yaml#L16).

    For example, on meta-pelion-edge you can run the following commands -

    ```
    mkdir -p /userdata/edge_gw_config
    mv identity.json /userdata/edge_gw_config/
    mv pal/ /userdata/mbed/mcc_config
    ```

    The same steps are listed in this script. You can modify this script for your platform.

    ```
    ./example-scripts/meta-pelion-edge/install-new-identity.sh
    ```

1. Upload CA - If not already, make sure the CA which was generated in the [Prerequisite section](#prerequisite) has been uploaded to the Device Management.

1. Upload enrollment identity - To retrieve the enrollment-id of this gateway, send request to pep-api-server.

    ```
    pep-cli get-enrollment-id -s <serial_number>
    ```

    Upload the the enrollment identity to Device Management by following [this documentation](https://www.pelion.com/docs/device-management/current/connecting/device-ownership-first-to-claim-by-enrollment-list.html)

1. Connect to PDM - Reboot the gateway and verify if it is connected to Device Management. For example, on meta-pelion-edge you can run this command to know the status of edge-core -
    ```
    curl localhost:9101/status
    ```

## Troubleshooting

1. When compiling factory-configurator-client-example, if you see this error on the gateway:

    ```
    ImportError: No module named site
    ```

    Try unsetting the Python path:

    ```
    unset PYTHONPATH
    unset PYTHONHOME
    ```

1. If you get `bad-request` error on mbed-edge, then mbed-edge and factory-configurator-client-example have been compiled with different entropy source.

1. If you get `Connection error` on mbed-edge, then make sure the enrollment identity and the CA certificate has been uploaded successfully to your PDM account.

## License

[Apache License 2.0](LICENSE)
